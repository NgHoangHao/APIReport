const AdmZip = require('adm-zip');
const xml2js = require('xml2js');
const fs = require('fs');

async function patch() {
    const data = JSON.parse(fs.readFileSync('E:/APIReport/parser/extracted_data.json', 'utf8'));
    // data has 16 items, index 0 to 15 corresponding to API 1 to 16
    
    const filePath = 'E:/APIReport/template/LienThongCapPhatNhienLieu_API_Master.docx';
    const zip = new AdmZip(filePath);
    const docXmlEntry = zip.getEntry('word/document.xml');
    let xmlData = docXmlEntry.getData().toString('utf8');
    
    const parser = new xml2js.Parser({ explicitArray: true, explicitChildren: true, preserveChildrenOrder: true });
    const result = await parser.parseStringPromise(xmlData);
    
    function getParagraphText(p) {
        let text = '';
        if (!p) return text;
        
        function extractText(obj) {
            if (!obj) return;
            if (obj['#name'] === 'w:t') {
                if (obj._) text += obj._;
                else if (typeof obj === 'string') text += obj;
            }
            if (obj.$$) {
                for (let child of obj.$$) extractText(child);
            }
        }
        extractText(p);
        return text;
    }
    
    const bodyElements = result['w:document']['w:body'][0]['$$'];
    
    let currentApiIndex = 0;
    let state = 'NORMAL'; // NORMAL, IN_INPUT, IN_OUTPUT
    let newBodyElements = [];
    
    function createDataParagraph(text) {
        return {
            '#name': 'w:p',
            $$: [
                {
                    '#name': 'w:pPr',
                    $$: [
                        {
                            '#name': 'w:rPr',
                            $$: [
                                { '#name': 'w:rFonts', $: { 'w:ascii': 'Times New Roman', 'w:hAnsi': 'Times New Roman' } },
                                { '#name': 'w:sz', $: { 'w:val': '24' } }
                            ]
                        }
                    ]
                },
                {
                    '#name': 'w:r',
                    $$: [
                        {
                            '#name': 'w:rPr',
                            $$: [
                                { '#name': 'w:rFonts', $: { 'w:ascii': 'Times New Roman', 'w:hAnsi': 'Times New Roman' } },
                                { '#name': 'w:sz', $: { 'w:val': '24' } }
                            ]
                        },
                        {
                            '#name': 'w:t',
                            _: text
                        }
                    ]
                }
            ]
        };
    }
    
    // We actually need to traverse tables recursively since paragraphs are inside table cells.
    // Let's do a recursive transform on elements
    
    function processElements(elements) {
        let newElements = [];
        let i = 0;
        while (i < elements.length) {
            const el = elements[i];
            
            if (el['#name'] === 'w:p') {
                const pText = getParagraphText(el);
                
                if (pText.includes('- Input: (json format)')) {
                    newElements.push(el);
                    
                    if (currentApiIndex < data.length) {
                        const requestData = data[currentApiIndex].request;
                        newElements.push(createDataParagraph('{'));
                        newElements.push(createDataParagraph('    "Request": "' + requestData + '"'));
                        newElements.push(createDataParagraph('}'));
                    }
                    
                    state = 'IN_INPUT';
                    i++;
                    continue;
                }
                
                if (pText.includes('- Output:(json format)')) {
                    newElements.push(el);
                    
                    if (currentApiIndex < data.length) {
                        const responseData = data[currentApiIndex].response;
                        newElements.push(createDataParagraph('{'));
                        newElements.push(createDataParagraph('    "Response": "' + responseData + '"'));
                        newElements.push(createDataParagraph('}'));
                    }
                    
                    state = 'IN_OUTPUT';
                    i++;
                    continue;
                }
                
                if (pText.includes('- Example Postman:(cURL format)')) {
                    state = 'NORMAL';
                    newElements.push(el);
                    currentApiIndex++;
                    i++;
                    continue;
                }
                
                if (state === 'IN_INPUT' || state === 'IN_OUTPUT') {
                    // Skip this paragraph because we replaced the block
                    i++;
                    continue;
                }
            } else if (el.$$) {
                // recursively process children (like w:tbl -> w:tr -> w:tc)
                el.$$ = processElements(el.$$);
            }
            
            newElements.push(el);
            i++;
        }
        return newElements;
    }
    
    result['w:document']['w:body'][0]['$$'] = processElements(bodyElements);
    
    const builder = new xml2js.Builder({ renderOpts: { pretty: false } });
    const newXmlData = builder.buildObject(result);
    
    zip.updateFile('word/document.xml', Buffer.from(newXmlData, 'utf8'));
    zip.writeZip(filePath);
    console.log('Successfully patched ' + filePath);
}

patch().catch(console.error);
