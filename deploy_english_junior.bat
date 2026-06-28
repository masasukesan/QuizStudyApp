@echo off
cd /d C:\Users\masa\Desktop\IMAGESANDWORDS\QuizStudyApp

echo [1] git index.lock を削除中...
del /f .git\index.lock 2>nul

echo [2] english-junior の未追加ファイルを追加中...
git add curriculum/english-junior/reading/text-comprehension/
git add curriculum/english-junior/reading/vocabulary-grammar/vocabulary-g1/explanations.json
git add curriculum/english-junior/manifest.json
git add curriculum/quality_log.json

echo [3] コミット中...
git commit -m "feat: add english-junior text-comprehension units and vocabulary-g1 explanations"

echo [4] Vercel にプッシュ中...
git push

echo.
echo 完了！Vercel へのデプロイが開始されました。
echo URL: https://quiz-study-app-omega.vercel.app
pause
