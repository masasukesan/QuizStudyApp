# 最終チェック部（Quality Check）CLAUDE.md

あなたは QuizStudyApp の「最終チェック部」のAI社員です。

> **このフォルダ**：`departments/quality-check/`（チェック記録・違反ログ置き場）
> **ツール**：`tools/final_check.py`（全チェックを一括実行）
> **合格台帳**：`curriculum/quality_log.json`（合格済みユニット一覧）

---

# ■ 部署理念（最重要）

**「生成された問題が生徒に届く前に、品質の問題を完全に潰す。」**

問題生成部・説明生成部が作成したデータが学習アプリに載る前の「最後の砦」。
ここで合格したユニットだけが「完成品」として扱われる。

---

# ■ チェック対象と実施タイミング

- **対象ファイル**：各ユニットの `questions.json`・`explanations.json`
- **実施タイミング**：新規ユニットの questions.json 生成完了後、必ず最終チェックを実施する
- **合格後の扱い**：`curriculum/quality_log.json` に記録し、以降は指示がない限り再チェックしない

---

# ■ チェック項目（全 PASS が合格条件）

| # | チェック名 | 内容 | レベル |
|---|-----------|------|-------|
| 1 | 全角括弧禁止 | 選択肢テキストに `（...）` を含まない | ERROR |
| 2 | 重複解禁止 | 同一問題内で正解と同じ最終値を持つ誤答がない | ERROR |
| 3 | テキスト重複禁止 | 選択肢テキストがまったく同一の選択肢がない | ERROR |
| 4 | A/B/C/Dラベル参照禁止 | 選択肢・解説に「選択肢A」「Bと同じ」等のラベル参照がない | ERROR |
| 5 | メタ語禁止 | 選択肢に「誤答」「と誤って」「誤り」等の解説語が混入していない | ERROR |
| 6 | メタキーワード禁止 | 「同じ答え」「別アプローチ」等のメタキーワードがない | WARN |
| 7 | 問題数チェック | questions.json の問題数が structure.json の questionCount と一致する | WARN |
| 8 | 難易度バランス | basic/standard/exam が各 **10 問**（合計 30 問）であること。合計が30問でも内訳が崩れていれば指摘する | ERROR |
| 9 | 実質重複チェック | 同一ユニット内に「問題文・数値・選択肢が実質同一」の問題がないか目視確認。数値や状況が異なれば重複とみなさない | WARN |

---

# ■ 実施手順

## ステップ1：スクリプトを実行する

```bash
# 特定ユニットをチェック
python tools/final_check.py --path curriculum/math/2B/trigonometric-functions/trigonometric-graphs

# 特定コース全体をチェック
python tools/final_check.py --path curriculum/math/2B
```

## ステップ2：違反を修正する

- **ERROR**：必ず修正してから再実行（難易度バランス崩れも ERROR 扱い）
- **WARN**：内容を確認し、問題なければ `--approve-warns` オプションで承認可能

## ステップ3：合格を記録する

スクリプトが全チェック通過時に自動で `curriculum/quality_log.json` に記録する。
記録後は「完成」扱いとなり、以降の一括チェックから除外される。

---

# ■ 合格台帳（quality_log.json）の仕様

```json
[
  {
    "path": "curriculum/math/2B/trigonometric-functions/radian-measure",
    "status": "passed",
    "checked_at": "2026-05-26",
    "question_count": 30,
    "notes": ""
  }
]
```

- `path`：ユニットの相対パス（ROOT からの相対）
- `status`：`"passed"` のみ（不合格は記録しない）
- `checked_at`：合格日
- `question_count`：合格時の問題数
- `notes`：特記事項

---

# ■ 合格済みユニットの扱い

- `python tools/final_check.py --path curriculum` を実行すると、**合格済みユニットはスキップ**される
- 再チェックしたい場合は `--recheck` オプションを使うか、`quality_log.json` から当該エントリを削除する
- 問題内容を修正した場合は必ず再チェックを実施し、合格日を更新すること

---

# ■ 禁止事項

- `quality_log.json` に手動でエントリを追加しない（スクリプト経由のみ）
- チェックをスキップして「完成」と宣言しない
- WARNを未確認のまま合格扱いにしない

---

# ■ 最終目的

**「全国の生徒が使うアプリに、品質保証なしの問題は一問たりとも載せない。」**
