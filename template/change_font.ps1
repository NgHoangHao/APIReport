$ErrorActionPreference = 'Stop'

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0
try {
    $docPath = "E:\template\LienThongCapPhatNhienLieu_API_Master.docx"
    $doc = $word.Documents.Open($docPath)

    $doc.Content.Font.Name = "Times New Roman"
    $doc.Content.Font.Size = 12

    $doc.Save()
    $doc.Close()
    Write-Host "Font applied successfully."
}
catch {
    Write-Error $_.Exception.Message
}
finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
}
