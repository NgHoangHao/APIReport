
## Font Style Rule
When generating or modifying Word documents (.docx), always ensure the font is set to **Times New Roman** and the font size is **12**.

## Word File Processing Rule
Whenever the user provides a Word file, automatically generate a JSON object containing data extracted according to the specific use case requirements. Then, use this JSON data to update the request data, response data, and directly replace the `- Example Postman: (cURL format)` sections (and their associated cURL commands) with the corresponding JSON example data in the template file at `E:\APIReport\template\API_IELTSMaster.docx`.
