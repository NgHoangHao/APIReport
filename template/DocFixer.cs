using System;
using System.IO;
using System.IO.Compression;
using System.Text;
using System.Xml;
using System.Collections.Generic;

public class DocFixer {
    public static void FixDocument(string path) {
        Encoding utf8 = Encoding.UTF8;
        Encoding win1252 = Encoding.GetEncoding(1252, new EncoderExceptionFallback(), new DecoderExceptionFallback());

        using (FileStream zipToOpen = new FileStream(path, FileMode.Open, FileAccess.ReadWrite))
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

                XmlNodeList nodes = xmlDoc.SelectNodes("//w:t", nsManager);
                int changed = 0;
                foreach (XmlNode node in nodes) {
                    string text = node.InnerText;
                    string newText = "";
                    bool textChanged = false;

                    // We will parse word by word, or just attempt substrings?
                    // Actually, let's just do a manual replacement map for double-encoded chars
                    // or just try decoding the whole string. If it fails, try character by character?
                    // Wait, Word documents can split a word into multiple w:t nodes.
                    // The easiest way is to just do string replacement on the RAW XML CONTENT!
                    // Wait, raw XML content string replacement is dangerous but we only replace very specific character sequences.
                }
            }
        }
    }
}
