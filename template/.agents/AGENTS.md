
## Font Style Rule
When generating or modifying Word documents (.docx), always ensure the font is set to **Times New Roman** and the font size is **12**.

## Word File Processing Rule
Whenever the user provides a Word file, automatically generate a JSON object containing data extracted according to the specific use case requirements. Then, use this JSON data to append the newly extracted information to the end of the template file at `e:\template\LienThongCapPhatNhienLieu_API_Master.docx`. Do not overwrite or delete any existing data in the file. Ensure that **only** this specific file is updated with the extracted data.
