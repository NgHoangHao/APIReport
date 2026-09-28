const fs = require('fs');

const xml = fs.readFileSync('temp_api/word/document.xml', 'utf8');
const tables = xml.split('<w:tbl>');

for (let i = 1; i < tables.length; i++) {
    const tableXml = tables[i].split('</w:tbl>')[0];
    const text = tableXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log(`Table ${i}: ${text.substring(0, 100)}...`);
}
