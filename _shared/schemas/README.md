# _shared/schemas/ — JSONスキーマ一元管理

ここは QuizStudyApp で使われる **JSON 仕様の一次資料** です。
各部署の CLAUDE.md にも JSON 例が書かれていますが、**矛盾が生じた場合はここを正とします**。

---

## ■ ファイル一覧

| ファイル | 用途 | 作成する部署 |
|---------|------|------------|
| `structure.schema.json` | 出題構造データ | 問題収集部 |
| `question.schema.json` | 問題1問 | 問題生成部 |
| `explanation.schema.json` | 解説1問分 | 解説制作部 |

---

## ■ 配置場所との対応

```
curriculum/<教科>/<コース or 分野>/<大単元>/<小単元>/
├── structure.json      ← structure.schema.json に準拠
├── questions.json      ← question.schema.json の配列
└── explanations.json   ← explanation.schema.json の配列
```

> `questions.json` と `explanations.json` は、それぞれのスキーマ定義に従う**オブジェクトの配列**として保存する。
> 各小単元あたり 30 件のストックを基本とする（運用は問題生成部 CLAUDE.md を参照）。

---

## ■ 更新ルール

- スキーマを変更したら、必ず経営企画部の承認を取る
- 変更前のスキーマは `archive/` の対象（古いバージョンを残す）
- 既存データへの破壊的変更は、archive/deprecated/ への退避を伴う
