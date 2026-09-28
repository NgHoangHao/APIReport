const AdmZip = require('adm-zip');
const xml2js = require('xml2js');
const fs = require('fs');

async function extract() {
    const zip = new AdmZip('E:/APIReport/template/LienThongCapPhatNhienLieu_API_Master.docx');
    const docXmlEntry = zip.getEntry('word/document.xml');
    
    if (!docXmlEntry) {
        console.log('No document.xml found');
        return;
    }
    
    const xmlData = docXmlEntry.getData().toString('utf8');
    const parser = new xml2js.Parser({ explicitArray: false, explicitChildren: true, preserveChildrenOrder: true });
    const result = await parser.parseStringPromise(xmlData);
    
    const textItems = [];
    
    function traverse(obj) {
        if (!obj) return;
        if (typeof obj === 'string') return;
        
        if (obj['#name'] === 'w:t') {
            if (obj._) textItems.push(obj._);
        } else if (obj['#name'] === 'w:p') {
            textItems.push('\n');
        } else if (obj['#name'] === 'w:tbl') {
            textItems.push('\n[TABLE]\n');
        } else if (obj['#name'] === 'w:tr') {
            textItems.push('\n[ROW] ');
        } else if (obj['#name'] === 'w:tc') {
            textItems.push(' | ');
        }
        
        if (obj.$$) {
            for (let child of obj.$$) {
                traverse(child);
            }
        }
    }
    
    traverse(result['w:document'] ? result['w:document']['w:body'] : result);
    
    fs.writeFileSync('E:/APIReport/parser/master_extracted.txt', textItems.join(''));
    console.log('Done');
}

extract().catch(console.error);
