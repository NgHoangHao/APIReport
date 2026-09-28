const fs = require('fs');
const xml2js = require('xml2js');

const xml = fs.readFileSync('temp_uc/word/document.xml', 'utf8');

// A simple regex to just strip out all xml tags and get text
const text = xml.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n').split('\n').map(t => t.trim()).filter(t => t.length > 0);

const startIdx = text.findIndex(t => t.includes('1.')) || 0;
fs.writeFileSync('temp_uc_text.txt', text.slice(startIdx, startIdx + 500).join('\n'));
console.log("Done");
