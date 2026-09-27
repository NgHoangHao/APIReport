$ErrorActionPreference = 'Stop'

# Cau hinh encoding chuan UTF-8
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

# Dinh nghia duong dan
$templatePath = "E:\template\LienThongCapPhatNhienLieu_API_Master.docx"
$outputPath = "E:\template\Output_API_Master.docx"
$dataPath = "E:\template\data.json"

# 1. TAO FILE MOI TU TEMPLATE DE GIU NGUYEN BAN GOC
Copy-Item -Path $templatePath -Destination $outputPath -Force
Write-Host "Cloned Template successfully to $outputPath"

# Doc du lieu tu JSON
$jsonContent = [System.IO.File]::ReadAllText($dataPath, [System.Text.Encoding]::UTF8)
$dataMappings = $jsonContent | ConvertFrom-Json

$word = New-Object -ComObject Word.Application
$word.Visible = $false
$word.DisplayAlerts = 0 

try {
    $doc = $word.Documents.Open($outputPath)

    function Replace-Text {
        param([string]$find, [string]$replace)
        
        $replace = $replace -replace "`n", "^p"

        $findObj = $word.Selection.Find
        $findObj.ClearFormatting()
        $findObj.Replacement.ClearFormatting()
        $findObj.Text = $find
        $findObj.Replacement.Text = $replace
        $findObj.Forward = $true
        $findObj.Wrap = 1
        
        $findObj.Format = $true    
        $findObj.MatchCase = $false
        $findObj.MatchWholeWord = $false
        $findObj.MatchWildcards = $false
        $findObj.MatchSoundsLike = $false
        $findObj.MatchAllWordForms = $false

        $findObj.Replacement.Font.Name = "Times New Roman"
        $findObj.Replacement.Font.Size = 12
        $findObj.Replacement.Font.Bold = $false

        $findObj.Execute([Type]::Missing, [Type]::Missing, [Type]::Missing, [Type]::Missing, [Type]::Missing, [Type]::Missing, [Type]::Missing, [Type]::Missing, [Type]::Missing, [Type]::Missing, 2) | Out-Null
    }

    # 2. DO DU LIEU DONG VAO FILE
    foreach ($item in $dataMappings) {
        Replace-Text -find $item.find -replace $item.replace
    }

    # 3. EP TOAN BO VAN BAN VE CUNG MOT FONT
    $doc.Content.Font.Name = "Times New Roman"
    $doc.Content.Font.Size = 12

    $doc.Save()
    $doc.Close($false)
    Write-Host "Success! Data filled into: $outputPath"
}
catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Error $_.Exception.Message
}
finally {
    $word.Quit()
    [System.Runtime.Interopservices.Marshal]::ReleaseComObject($word) | Out-Null
    [GC]::Collect()
    [GC]::WaitForPendingFinalizers()
}
