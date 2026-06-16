# QuizStudyApp デプロイスクリプト
# ダブルクリックまたは右クリック → PowerShell で実行

Set-Location $PSScriptRoot

# git ロックファイルをクリーンアップ
$locks = @(".git\index.lock", ".git\HEAD.lock", ".git\MERGE_HEAD.lock", ".git\CHERRY_PICK_HEAD.lock")
foreach ($lock in $locks) {
    if (Test-Path $lock) {
        Remove-Item $lock -Force
        Write-Host "Removed: $lock" -ForegroundColor Yellow
    }
}

# コミットメッセージを入力
$msg = Read-Host "コミットメッセージを入力（Enterでデフォルト）"
if ([string]::IsNullOrWhiteSpace($msg)) {
    $msg = "update: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
}

# git add / commit / push
git add -A
git commit -m $msg
git push

Write-Host ""
Write-Host "デプロイ完了！" -ForegroundColor Green
Write-Host "URL: https://quiz-study-app-omega.vercel.app" -ForegroundColor Cyan
Read-Host "Enterキーで閉じる"
