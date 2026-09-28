const AdmZip = require('adm-zip');
const xml2js = require('xml2js');
const fs = require('fs');

async function appendData() {
    const filePath = 'E:/template/LienThongCapPhatNhienLieu_API_Master.docx';
    const zip = new AdmZip(filePath);
    const docXmlEntry = zip.getEntry('word/document.xml');
    
    if (!docXmlEntry) {
        console.log('No document.xml found');
        return;
    }
    
    const xmlData = docXmlEntry.getData().toString('utf8');
    const parser = new xml2js.Parser({ explicitArray: true, explicitChildren: false, preserveChildrenOrder: true });
    const result = await parser.parseStringPromise(xmlData);
    
    const body = result['w:document']['w:body'][0];
    
    // Find where the w:sectPr is, we must append before it
    const elements = body['$$'] || [];
    // But since explicitChildren is false, xml2js puts elements as properties
    // Actually explicitChildren:true is better to maintain order.
}
appendData();
