const fs = require('fs');

const xml = fs.readFileSync('temp_uc/word/document.xml', 'utf8');
const text = xml.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n').split('\n').map(t => t.trim()).filter(t => t.length > 0);
fs.writeFileSync('temp_uc_text.txt', text.slice(0, 1000).join('\n'));
console.log("Done UC");

const xml2 = fs.readFileSync('temp_api/word/document.xml', 'utf8');
const text2 = xml2.replace(/<[^>]+>/g, '\n').replace(/\n\s*\n/g, '\n').split('\n').map(t => t.trim()).filter(t => t.length > 0);
fs.writeFileSync('temp_api_text.txt', text2.slice(0, 1000).join('\n'));
console.log("Done API");
