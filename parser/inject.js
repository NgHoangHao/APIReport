const AdmZip = require('adm-zip');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('E:/APIReport/parser/extracted_data.json', 'utf8'));

// Format the data as a string
const jsonString = JSON.stringify(data, null, 4);
const lines = jsonString.split('\n');

const filePath = 'E:/template/LienThongCapPhatNhienLieu_API_Master.docx';
const zip = new AdmZip(filePath);

const docXmlEntry = zip.getEntry('word/document.xml');
let xmlData = docXmlEntry.getData().toString('utf8');

// Generate XML paragraphs for the lines
let paragraphsXml = '';

// Add a title
paragraphsXml += `
<w:p>
    <w:pPr>
        <w:rPr>
            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman"/>
            <w:b/>
            <w:sz w:val="24"/>
        </w:rPr>
    </w:pPr>
    <w:r>
        <w:rPr>
            <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman"/>
            <w:b/>
            <w:sz w:val="24"/>
        </w:rPr>
        <w:t>Extracted Request and Response Data (Use Cases 35-50)</w:t>
    </w:r>
</w:p>
`;

// Escape XML special characters
function escapeXml(unsafe) {
    return unsafe.replace(/[<>&'"]/g, function (c) {
        switch (c) {
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '&': return '&amp;';
            case "'": return '&apos;';
            case '"': return '&quot;';
        }
    });
}

for (const line of lines) {
    paragraphsXml += `
    <w:p>
        <w:pPr>
            <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman"/>
                <w:sz w:val="24"/>
            </w:rPr>
        </w:pPr>
        <w:r>
            <w:rPr>
                <w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman" w:eastAsia="Times New Roman"/>
                <w:sz w:val="24"/>
            </w:rPr>
            <w:t xml:space="preserve">${escapeXml(line)}</w:t>
        </w:r>
    </w:p>
    `;
}

// Find <w:sectPr and insert before it
// Sometimes it's <w:sectPr> or <w:sectPr ...>
const sectPrIndex = xmlData.lastIndexOf('<w:sectPr');
if (sectPrIndex !== -1) {
    xmlData = xmlData.slice(0, sectPrIndex) + paragraphsXml + xmlData.slice(sectPrIndex);
} else {
    // If no sectPr, just insert before </w:body>
    const bodyEndIndex = xmlData.lastIndexOf('</w:body>');
    xmlData = xmlData.slice(0, bodyEndIndex) + paragraphsXml + xmlData.slice(bodyEndIndex);
}

zip.updateFile('word/document.xml', Buffer.from(xmlData, 'utf8'));
zip.writeZip(filePath);

console.log('Successfully appended data to ' + filePath);
