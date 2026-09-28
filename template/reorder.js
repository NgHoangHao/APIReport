const fs = require('fs');

const xml = fs.readFileSync('temp_api/word/document.xml', 'utf8');

const parts = xml.split('<w:tbl>');
const preTbl = parts[0];
let tables = [];
for (let i = 1; i < parts.length; i++) {
    const tblParts = parts[i].split('</w:tbl>');
    tables.push({
        content: tblParts[0],
        after: tblParts.slice(1).join('</w:tbl>')
    });
}

const tbl1 = tables[0].content;
const tbl1PropsMatch = tbl1.match(/^([\s\S]*?)<w:tr[\s>]/);
const tbl1Props = tbl1PropsMatch ? tbl1PropsMatch[1] : '';

const rows = tbl1.split('</w:tr>');
let headerRows = [];
let apiBlocks = [];
let currentApiRows = [];

let apiIndex = 0;
for (let i = 0; i < rows.length - 1; i++) {
    const row = rows[i] + '</w:tr>';
    const text = row.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    
    let isNewApi = false;
    // Check if row starts a new API in Table 1 (they are numbered 1 to 17, possibly with spaces like "1 7")
    const match = text.match(/^(\d)\s*(\d)?\s+[A-ZĐ]/);
    if (match) {
        let numStr = match[1] + (match[2] ? match[2] : '');
        let num = parseInt(numStr);
        if (num === apiIndex + 1) {
            isNewApi = true;
        }
    }
    
    if (isNewApi) {
        if (apiIndex > 0) {
            apiBlocks.push(currentApiRows.join(''));
        }
        currentApiRows = [];
        apiIndex++;
    }
    
    if (apiIndex === 0) {
        headerRows.push(row);
    } else {
        currentApiRows.push(row);
    }
}
if (currentApiRows.length > 0) {
    apiBlocks.push(currentApiRows.join(''));
}

console.log(`Found ${headerRows.length} header rows in Table 1.`);
console.log(`Found ${apiBlocks.length} API blocks in Table 1.`);

if (apiBlocks.length !== 17) {
    console.error("ERROR: Expected 17 API blocks in Table 1, but found " + apiBlocks.length);
    process.exit(1);
}

const api1_to_16_and_17 = apiBlocks.map(block => {
    return tbl1Props + block;
});

let allApiTables = [];

for (let i = 0; i < 16; i++) {
    allApiTables.push({ uc: 34 + i, xml: api1_to_16_and_17[i] });
}
allApiTables.push({ uc: 25, xml: api1_to_16_and_17[16] });

for (let i = 1; i < tables.length; i++) {
    const text = tables[i].content.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    const match = text.match(/^(\d{1,2})\s+UC-/);
    if (match) {
        let apiNum = parseInt(match[1]);
        let ucNum = apiNum;
        if (apiNum >= 25) {
            ucNum = apiNum + 1;
        }
        allApiTables.push({ uc: ucNum, xml: tables[i].content });
    } else {
        console.log("Could not find UC number in table " + (i+1));
    }
}

console.log(`Total mapped APIs: ${allApiTables.length}`);

allApiTables.sort((a, b) => a.uc - b.uc);

let newXml = preTbl;
newXml += '<w:tbl>' + tbl1Props + headerRows.join('') + '</w:tbl>';

for (let i = 0; i < allApiTables.length; i++) {
    newXml += '<w:tbl>' + allApiTables[i].xml + '</w:tbl>';
    if (i < allApiTables.length - 1) {
        newXml += tables[1].after; 
    } else {
        newXml += tables[tables.length - 1].after;
    }
}

fs.writeFileSync('temp_api/word/document.xml', newXml);
console.log("Successfully overwrote temp_api/word/document.xml");
