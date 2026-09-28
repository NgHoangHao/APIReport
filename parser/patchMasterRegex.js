const AdmZip = require('adm-zip');
const fs = require('fs');

async function patchRegex() {
    const data = JSON.parse(fs.readFileSync('E:/APIReport/parser/formatted_data.json', 'utf8'));
    
    const filePath = 'E:/APIReport/template/LienThongCapPhatNhienLieu_API_Master.docx';
    const zip = new AdmZip(filePath);
    const docXmlEntry = zip.getEntry('word/document.xml');
    let xmlData = docXmlEntry.getData().toString('utf8');
    
    function escapeXml(unsafe) {
        return String(unsafe).replace(/[<>&'"]/g, function (c) {
            switch (c) {
                case '<': return '&lt;';
                case '>': return '&gt;';
                case '&': return '&amp;';
                case "'": return '&apos;';
                case '"': return '&quot;';
            }
        });
    }
    
    function createParagraph(text) {
        // preserve leading spaces for indentation by using xml:space="preserve"
        return '<w:p><w:pPr><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/><w:sz w:val="24"/></w:rPr><w:t xml:space="preserve">' + escapeXml(text) + '</w:t></w:r></w:p>';
    }
    
    let currentApiIndex = 0;
    
    xmlData = xmlData.replace(
        /(<w:p[^>]*>(?:(?!<\/w:p>).)*?-\s*Input:\s*\(json\s*format\)(?:(?!<\/w:p>).)*?<\/w:p>)([\s\S]*?)(<w:p[^>]*>(?:(?!<\/w:p>).)*?-\s*Output:\s*\(json\s*format\)(?:(?!<\/w:p>).)*?<\/w:p>)([\s\S]*?)(<w:p[^>]*>(?:(?!<\/w:p>).)*?cURL(?:(?!<\/w:p>).)*?<\/w:p>)/g,
        (match, inputHeader, inputBody, outputHeader, outputBody, postmanHeader) => {
            if (currentApiIndex >= data.length) {
                return match;
            }
            
            const requestData = data[currentApiIndex].request;
            const responseData = data[currentApiIndex].response;
            
            currentApiIndex++;
            
            // split by newline and map to paragraph
            const newInputBody = requestData.split('\n').map(line => createParagraph(line)).join('');
            const newOutputBody = responseData.split('\n').map(line => createParagraph(line)).join('');
            
            return inputHeader + newInputBody + outputHeader + newOutputBody + postmanHeader;
        }
    );
    
    zip.updateFile('word/document.xml', Buffer.from(xmlData, 'utf8'));
    zip.writeZip(filePath);
    console.log('Successfully patched ' + filePath + ' - Processed ' + currentApiIndex + ' APIs.');
}

patchRegex().catch(console.error);
