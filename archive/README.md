# archive/ — 完成物の格納庫

経営企画部が承認した成果物のみがここに格納される。
詳しい運用ルールは [`departments/archive/CLAUDE.md`](../departments/archive/CLAUDE.md) を参照。

## フォルダ構成

```
archive/
├── questions/<教科>/v*.*.*/<教科>-questions-v*.*.*.json
├── explanations/<教科>/v*.*.*/<教科>-explanations-v*.*.*.json
├── code/v*.*.*/<コードスナップショット>
├── media/v*.*.*/<画像・音声アーカイブ>
├── logs/YYYYMMDD-NN.json    … 格納ログ
└── deprecated/<元の相対パス>/  … 非推奨バージョン退避
```

## 注意

- このフォルダのファイルは **読み取り専用扱い** とする
- 上書き禁止。新版は新しいバージョン番号フォルダを切る
- 削除する場合は必ず `deprecated/` への移動経由
