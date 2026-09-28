const fs = require('fs');

const text = fs.readFileSync('E:/APIReport/parser/extracted.txt', 'utf8');

const usecases = [];

for (let i = 35; i <= 50; i++) {
    // Find the start of the use case
    const regexStr = `\\[PARAGRAPH\\]${i}\\.\\s+(UC-[^\\n]+)`;
    const regex = new RegExp(regexStr);
    const match = text.match(regex);
    if (!match) {
        console.log(`Could not find start for use case ${i}`);
        continue;
    }
    
    const title = match[1].trim();
    const startIndex = match.index;
    
    // Find the end of this use case (start of the next one)
    const nextRegexStr = `\\[PARAGRAPH\\]${i+1}\\.\\s+(UC-)`;
    const nextRegex = new RegExp(nextRegexStr);
    const nextMatch = text.match(nextRegex);
    const endIndex = nextMatch ? nextMatch.index : text.length;
    
    const chunk = text.substring(startIndex, endIndex);
    
    // Now extract Dữ liệu đầu vào and Kết quả đầu ra
    // Format:
    // [PARAGRAPH]Dữ liệu đầu vào | 
    // [PARAGRAPH]Value...
    // [ROW]
    
    const inputMatch = chunk.match(/D[ữư] li[ệe]u đ[ầa]u v[àa]o\s*\|\s*\n\s*\[PARAGRAPH\]([\s\S]*?)\[ROW\]/);
    const outputMatch = chunk.match(/K[ếe]t qu[ảa] đ[ầa]u ra\s*\|\s*\n\s*\[PARAGRAPH\]([\s\S]*?)\[ROW\]/);
    
    let input = inputMatch ? inputMatch[1].replace(/\[PARAGRAPH\]/g, '\n').trim() : "N/A";
    let output = outputMatch ? outputMatch[1].replace(/\[PARAGRAPH\]/g, '\n').trim() : "N/A";
    
    // Clean up trailing |
    if (input.endsWith('|')) input = input.slice(0, -1).trim();
    if (output.endsWith('|')) output = output.slice(0, -1).trim();
    
    usecases.push({
        id: i,
        title: title,
        request: input,
        response: output
    });
}

fs.writeFileSync('E:/APIReport/parser/extracted_data.json', JSON.stringify(usecases, null, 2), 'utf8');
console.log('Saved to extracted_data.json');
