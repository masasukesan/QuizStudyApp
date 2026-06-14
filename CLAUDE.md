# QuizStudyApp — マスター CLAUDE.md（総合司令塔）

あなたは QuizStudyApp の優秀な AI コワーカーです。
指示を受けたら **まず下記の「標準ワークフロー」を確認**し、該当するワークフローがあればそれに従って各部署の CLAUDE.md を順番に読み込み、ルールを厳守して実行してください。

---

# ■ プロジェクト概要

**目的**：勉強が苦手な子でも、繰り返しプレイすることで共通テストで高得点を取れるようにする。  
**形式**：モバイルファーストの4択クイズアプリ（React + Vite + TypeScript / Supabase）  
**問題データ**：`curriculum/<教科>/<コース>/<大単元>/<小単元>/` 以下の JSON ファイル群

---

# ■ 部署一覧と CLAUDE.md の場所

| 部署名 | 役割の概要 | CLAUDE.md パス |
|--------|-----------|----------------|
| 問題収集部 | 出題構造・単元ツリーの設計 | `departments/problem-collection/CLAUDE.md` |
| 問題生成部 | questions.json の作成（30問/単元） | `departments/problem-generation/CLAUDE.md` |
| 解説生成部 | explanations.json の作成 | `departments/explanation/CLAUDE.md` |
| 最終チェック部 | 品質バリデーション | `departments/quality-check/CLAUDE.md` |
| UI/UX部 | 画面設計・デザイントークン | `departments/ui-ux/CLAUDE.md` |
| 開発部 | フロントエンド実装 | `departments/development/CLAUDE.md` |
| ゲーミフィケーション部 | EXP・レベル・バッジ設計 | `departments/gamification/CLAUDE.md` |
| バックエンド部 | Supabase・API 設計 | `departments/backend/CLAUDE.md` |
| 素材部 | アイコン・イラスト・BGM・SE | `departments/assets/CLAUDE.md` |
| マーケティング部 | ストア掲載・集客 | `departments/marketing/CLAUDE.md` |
| 経営管理部 | KPI・ロードマップ管理 | `departments/management/CLAUDE.md` |

---

# ■ 標準ワークフロー（指示なしで自動実行）

## 🟦 ワークフロー A：「問題を作って」

> トリガー：「〇〇の問題を作って」「〇〇を追加して」「新しい単元を作って」など

**実行順序（必ず各部署の CLAUDE.md を読んでから作業する）：**

1. **問題収集部**（`departments/problem-collection/CLAUDE.md`を読む）  
   → 対象単元の `structure.json` を開き、**`patterns` 配列が存在するか必ず確認する**  
   → `patterns` 配列がない・空・または `questionCount` しかない場合は、**収集部の作業を最初からやり直す**（スキップ禁止）  
   → `patterns` には出題パターン・思考ステップ・典型的なミス・難易度を記載してから次のステップへ進む

2. **問題生成部**（`departments/problem-generation/CLAUDE.md`を読む）  
   → `questions.json` を作成する（basic:10問 / standard:10問 / exam:10問 = 合計30問）

3. **解説生成部**（`departments/explanation/CLAUDE.md`を読む）  
   → `explanations.json` を作成する（全30問分）

4. **最終チェック部**（`departments/quality-check/CLAUDE.md`を読む）  
   → バリデーションスクリプトを実行し、ERROR=0・WARN=0 を確認する

5. **manifest.json の questionCount 更新**（必須・スキップ禁止）  
   → `curriculum/<教科>/manifest.json` を開き、対象小単元の `questionCount` を実際の問題数（通常 30）に更新する  
   → これを行わないと、ブラウザでその単元がグレーアウトしてプレイできない状態になる  
   → 更新後、ブラウザをリロードして単元がクリックできることを確認する

---

## 🟩 ワークフロー B：「画面を直して」「UI を変えて」

> トリガー：「画面を変えて」「デザインを修正して」「コンポーネントを追加して」など

1. **UI/UX部**（`departments/ui-ux/CLAUDE.md`を読む）  
   → デザイン仕様を確認する

2. **開発部**（`departments/development/CLAUDE.md`を読む）  
   → `frontend/src/` 配下を実装する

---

## 🟨 ワークフロー C：単独タスク

上記のどれにも当てはまらない場合は、指示内容から最も近い部署を判断し、その部署の CLAUDE.md を読んでから作業する。

---

## 🟥 ワークフロー D：「修正して」「チェックして」（既存ユニットの品質修正）

> トリガー：「選択肢を直して」「解説が出ない」「チェックして」「エラーを修正して」など

**実行順序（必ず以下をすべて行う）：**

1. **questions.json を開いて以下の違反を全件修正する**
   - 全角括弧 `（）` を半角 `()` に置換
   - 同一問題内で正解と同じ最終値を持つ誤答を別の値・表現に変更
   - 選択肢テキストにメタ語（「誤答」「と誤って」「Aと同じ」等）が含まれれば削除
   - 選択肢末尾の括弧内メタヒント（「と混同」「を忘れる」「誤った公式」「誤り」「勘違い」等を含む括弧）を全件除去する
     → 除去後に正解と同じ最終値になる誤答が生じた場合は、その誤答を別の値・表現に書き換える
   - 問題文・選択肢に「日本語用語（英語表記）」形式の不要な英語注釈がある場合は括弧ごと除去する
     → ただし数式内の変数・演算子（`(s-a)`, `(n-2)`, `(R-r)` 等）は数学表記なので除去しない
   - 正解選択肢だけが他の選択肢より著しく長い（30文字以上の差）場合は、理由の説明文を削除してスリム化する（詳細は explanations.json に移す）
     → スリム化の優先順位: ①最初の「。」で切る ②末尾の日本語括弧 `(説明…)` を除去 ③「→」で分割 ④それでも超過なら語句単位でハードカット
     → スリム化で正解の核心（数式・結論）が失われないよう注意。削った内容は必ず explanations.json の `lead` に反映する
     → スリム化後に「正解と同じ最終値を持つ誤答」が生じていないか再確認する

2. **explanations.json を開いて以下を確認・修正する**
   - ファイルが存在しない、または問題IDの数が questions.json と一致しない場合は**全問分（30問）を生成する**（プレースホルダー「準備中」は不可）
   - フィールド名が `lead` / `steps` / `common_mistakes` / `tips` 以外になっていれば修正（`mistakes` → `common_mistakes` 等）
   - `lead` には正解の核心と理由を必ず記述する。元の正解選択肢テキスト（スリム化前）を流用してよい
   - `common_mistakes` は誤答選択肢の内容（括弧内の混同・誤りメモ）を参照して生成する
   - 部署CLAUDE.md（`departments/explanation/CLAUDE.md`）のルールに従い、中学生でも理解できる言葉で記述する

3. **バリデーションスクリプトを実行して全件 PASS を確認する**
   ```bash
   python tools/final_check.py --path curriculum/<教科>/<コース>/<大単元>/<小単元>
   ```
   - ERROR が 1 件でも残っていれば必ず修正してから再実行する
   - WARN も内容を確認し、問題なければ `--approve-warns` で承認する

4. **TypeScript 型との整合性も確認する**（フロントエンドが `exp.tips` などを non-null 想定しているとクラッシュするため）
   - `ExplanationEntry` の optional フィールド（`steps?`, `common_mistakes?`, `tips?`）に対するアクセスは `?? []` でフォールバックすること

---

# ■ 全部署共通ルール

- **【最重要】計算問題の選択肢は途中式で示す（絶対ルール）**：公式・変形・代入の工夫が必要な問題では、選択肢に最終的な数値だけを並べてはならない。選択肢には「どの式・どの変形を選ぶか」を示す途中式を記述し、生徒が正しい思考プロセスを見抜けるかを問う。例外は単純代入・数える問題・統計の読み取りのみ（詳細は `departments/problem-generation/CLAUDE.md` 参照）。
- **正解は必ず1つ**：四択問題で正解が複数成立しないか必ず確認する
- **選択肢にメタ情報禁止**：「（誤り）」「（を忘れた）」「（と混同）」「（な誤り）」「と誤って」等、その選択肢が誤りであることを示す括弧内コメントは絶対禁止。メタ情報は `explanations.json` の `common_mistakes` へ書く。
- **数式表記**：LaTeX 禁止・プレーンテキスト（²³など）を使う
- **著作権**：過去問・既存コンテンツの文章を模倣しない
- **逆三角関数（arcsin・arccos・arctan）禁止**：高校学習指導要領の範囲外。問題文・選択肢・解説のいずれにも使用しない。`sinθ = x となる θ` / `cosθ = x から角度を求める` / `cosφ = a/R かつ sinφ = b/R を満たす φ` 等の表現に置き換える

---

# ■ 最終目的

**「画面を開いただけで "やってみたい" と思い、問題を解くたびに "もう1問" と思える。  
そのアプリが、勉強が苦手な子を共通テスト高得点へ導く。」**
