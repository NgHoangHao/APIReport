using System;
using System.IO;
using System.IO.Compression;
using System.Xml;

public class DocReverter {
    public static void Revert(string docPath) {
        using (FileStream zipToOpen = new FileStream(docPath, FileMode.Open, FileAccess.ReadWrite))
        {
            using (ZipArchive archive = new ZipArchive(zipToOpen, ZipArchiveMode.Update))
            {
                ZipArchiveEntry documentEntry = archive.GetEntry("word/document.xml");
                if (documentEntry == null) return;
                
                string xmlContent;
                using (StreamReader reader = new StreamReader(documentEntry.Open()))
                {
                    xmlContent = reader.ReadToEnd();
                }

                XmlDocument xmlDoc = new XmlDocument();
                xmlDoc.PreserveWhitespace = true;
                xmlDoc.LoadXml(xmlContent);

                XmlNamespaceManager nsManager = new XmlNamespaceManager(xmlDoc.NameTable);
                nsManager.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main");

                XmlNode body = xmlDoc.SelectSingleNode("//w:body", nsManager);
                XmlNodeList looseParagraphs = body.SelectNodes("./w:p", nsManager);
                
                // We should only delete the ones we added. We know we added "2", "Tạo Vai trò mới", etc.
                // Let's just look for any w:p directly under body that contains our text, and delete them.
                // Or wait, before I ran my script, did body have ANY w:p? Usually there's one empty w:p at the end of the doc.
                foreach (XmlNode wp in looseParagraphs) {
                    if (wp.InnerText.Contains("Tạo Vai trò mới") || wp.InnerText.Contains("2") || wp.InnerText.Contains("Cho phép Admin") || wp.InnerText.Contains("Thực tập sinh CSKH") || wp.InnerText.Contains("Example Postman")) {
                        body.RemoveChild(wp);
                    } else if (wp.InnerText.Contains("api/v1/admin/roles") || wp.InnerText.Contains("Output:(json format)") || wp.InnerText.Contains("Input: (json format)") || wp.InnerText.Contains("{") || wp.InnerText.Contains("}")) {
                        body.RemoveChild(wp);
                    } else if (wp.InnerText.Contains("\"Result\":") || wp.InnerText.Contains("\"Success\":") || wp.InnerText.Contains("\"Message\":") || wp.InnerText.Contains("\"StatusCode\":") || wp.InnerText.Contains("--location") || wp.InnerText.Contains("--header") || wp.InnerText.Contains("--data")) {
                        body.RemoveChild(wp);
                    } else if (wp.InnerText.Contains("\"roleName\":") || wp.InnerText.Contains("“data”: object") || wp.InnerText.Trim() == "") {
                        // Delete empty paragraphs too, since we added some
                        body.RemoveChild(wp);
                    }
                }
                
                // Always ensure there is at least one empty <w:p> before sectPr, Word requires this.
                XmlNode sectPr = xmlDoc.SelectSingleNode("//w:body/w:sectPr", nsManager);
                XmlElement emptyP = xmlDoc.CreateElement("w", "p", "http://schemas.openxmlformats.org/wordprocessingml/2006/main");
                if (sectPr != null) {
                    body.InsertBefore(emptyP, sectPr);
                } else {
                    body.AppendChild(emptyP);
                }

                documentEntry.Delete();
                ZipArchiveEntry newEntry = archive.CreateEntry("word/document.xml");
                using (StreamWriter writer = new StreamWriter(newEntry.Open()))
                {
                    xmlDoc.Save(writer);
                }
            }
        }
        Console.WriteLine("Reverted loose paragraphs!");
    }
}
