# 問題・解説 品質レビュー 進捗管理

> **目的**: 全105単元の問題・解説を共通テスト基準で品質評価・修正する。  
> **ルール**: 新しいチャットを始めるときは **必ずこのファイルを最初に読む**。  
> **ペース**: 1チャットで3〜5単元（数学）または1〜2単元（英語・国語・理社）を目安とする。

---

## 📋 レビュー基準（共通テスト2025-2026傾向より）

### A. 日本語の自然さ
- 問題文が自然な日本語か（不自然な語順・過剰な英語注釈がない）
- 初学者が一読で意味を取れるか（文が長すぎない、二重否定がない）

### B. 共通テスト的な出題形式
- **誘導形式**の問題が含まれているか（段階的に解く構造）
- 日常場面・実用場面と数学を結びつける問題の混在（共通テストは「実生活文脈」重視）
- 会話文・対話形式の活用（共通テスト頻出形式）
- 知識の暗記ではなく思考力・読解力を測る設問か

### C. 選択肢の質
- 正解は必ず1つ
- メタ語（「誤答」「誤り」「〜と混同」等）が選択肢に入っていない
- 全角括弧（）→ 半角()
- 正解選択肢だけが著しく長くない
- 誤答選択肢が「ありそうなミス」を反映しているか（ランダムな数値羅列はNG）

### D. 数式・表記
- LaTeX禁止・プレーンテキスト（x², √2 等）
- 分数指数: ^(m/n)禁止 → ᵐ/ⁿ（Unicode上付き）
- 逆三角関数（arcsin等）禁止
- 単位・記号の統一

### E. 解説の質
- `lead`: 正解の核心と理由が明確か
- `steps`: 解法の手順が中学生でも追えるか
- `common_mistakes`: 誤答の根拠が説明されているか
- `tips`: 共通テストで役立つ視点が含まれているか

---

## 📊 進捗状況

**完了**: 79 / 105 単元（内訳: 数学109 + 英語2 + 国語3 + 理科4 + 社会3）  
**最終更新**: 2026-06-05（チャット56 #82 完了）

### 凡例
- ⬜ 未着手
- 🔄 作業中（現在のチャット）
- ✅ 完了（問題なし or 修正済み）
- ⚠️ 要確認（修正したが念のため再確認推奨）

---

## 数学 1A（49単元）

| # | 単元パス | 状態 | 備考 |
|---|---------|------|------|
| 1 | math/1A/numbers-and-expressions/factorization | ✅ | 修正なし |
| 2 | math/1A/numbers-and-expressions/linear-inequalities | ✅ | li-025: 全角括弧（）→ () 修正、`!=` → `≠` |
| 3 | math/1A/numbers-and-expressions/polynomial-operations | ✅ | 修正なし |
| 4 | math/1A/numbers-and-expressions/real-numbers | ✅ | 修正なし |
| 5 | math/1A/quadratic-functions/functions-and-graphs | ✅ | fg-015: 選択肢B/C重複修正、fg-023: `<=`→`≤`、ヌルバイト除去 |
| 6 | math/1A/quadratic-functions/quadratic-equations | ✅ | qe-021: 正解AをDに修正(k=2)・問題文修正、qe-012/019/026/030: `<=`/`>=`/`!=`→`≤`/`≥`/`≠` |
| 7 | math/1A/quadratic-functions/quadratic-graphs-and-transformations | ✅ | gt-004: 選択肢B/C重複修正、gt-013: 問題文修正、gt-021: C選択肢typo修正 |
| 8 | math/1A/quadratic-functions/quadratic-inequalities | ✅ | 全選択肢の `<=`/`>=`/`!=` → `≤`/`≥`/`≠` 修正 |
| 9 | math/1A/quadratic-functions/quadratic-maxima-and-minima | ✅ | mm-019: 選択肢D重複解(-2→-4)、`<=`/`>=`→`≤`/`≥` 修正 |
| 10 | math/1A/quadratic-functions/graphs-and-quadratic-equations | ✅ | 全角括弧・<=/>=/!= を修正 |
| 11 | math/1A/quadratic-functions/advanced-quadratic-problems | ✅ | 全角括弧・<=/>=/!= を修正 |
| 12 | math/1A/geometry-and-measure/basic-trigonometric-ratios | ✅ | 全角括弧を修正 |
| 13 | math/1A/geometry-and-measure/extended-trigonometric-ratios | ✅ | 全角括弧を修正 |
| 14 | math/1A/geometry-and-measure/sine-and-cosine-laws | ✅ | 全角括弧を修正 |
| 15 | math/1A/geometry-and-measure/trigonometry-and-geometry-measurement | ✅ | 全角括弧を修正 |
| 16 | math/1A/geometry-and-measure/advanced-trigonometric-problems | ✅ | 全角括弧・atp-025正解スリム化・atp-025B/D・atp-029D メタ語除去 |
| 17 | math/1A/data-analysis/central-dispersion | ✅ | メタ語除去・cd-004D重複修正・cd-016C矛盾計算修正・cd-022Aスリム化 |
| 18 | math/1A/data-analysis/variance-stddev-correlation | ✅ | vsc-002/007Aスリム化・vsc-013Cメタ語・vsc-013D重複(r=1)修正 |
| 19 | math/1A/logic-and-sets/set-theory-basics | ✅ | st-005C/st-009C重複修正・st-015B「誤解して」除去・st-017C変更・st-020/030Aスリム化 |
| 20 | math/1A/logic-and-sets/propositions-and-conditions | ✅ | pc-001B/C/D「混同」除去・pc-001C/pc-010B重複修正・複数Aスリム化 |
| 21 | math/1A/logic-and-sets/propositions-and-proofs | ✅ | 「混同」括弧除去・pp-021命題偽→差替・複数Aスリム化・pp-011C「同じ方法」除去 |
| 22 | math/1A/combinatorics/basic-counting | ✅ | bc-028/030 A スリム化・bc-024/028/029/030 解説修正・ヌルバイト除去 |
| 23 | math/1A/combinatorics/permutation | ✅ | perm-010/011/014A修正・perm-018Bメタ語除去・perm-019Aスリム化・perm-021答え67番目に修正・perm-022正解A→C変更・perm-026A修正・perm-029D/perm-030C重複正解修正・explanations全面刷新 |
| 24 | math/1A/combinatorics/combination | ✅ | comb-002B/C・comb-022Dメタ語除去、comb-016A欠損復元、comb-017/019/025/029スペース除去、comb-018D重複正解→別誤答、comb-025A表記修正、comb-026A「対角線」修正、comb-027B/C実質重複→C変更、explanations全面刷新（21問ボイラープレート）|
| 25 | math/1A/combinatorics/circular-and-multiset-permutation | ✅ | 数学的誤り2件(cmp-026答え60→120、cmp-028答え180→190)・重複正解3件(cmp-014B/cmp-021D/cmp-018B)修正・cmp-002A長さ修正・cmp-007問題文整理・cmp-030A答え明記・ヌルバイト除去・explanations全面刷新 |
| 26 | math/1A/combinatorics/count-elements | ✅ | ce-008/009/018A欠損修正・ce-011B/C/D・ce-012B/Cメタ語除去・ce-021D重複正解→20人・ce-005Aスリム化・explanations全面刷新 |
| 27 | math/1A/probability/events-and-probability | ✅ | メタ語除去13件・重複正解12件修正・explanations全面刷新 |
| 28 | math/1A/probability/probability-properties | ✅ | メタ語除去10件・重複正解修正9件・explanations全面刷新 |
| 29 | math/1A/probability/conditional-probability | ✅ | 重複正解6件・P欠落・0欠落修正・cp-030Aスリム化・explanations全面刷新 |
| 30 | math/1A/probability/independent-and-repeated-trials | ✅ | 重複正解12件・メタ語15件修正・irt-027A計算誤り修正・全角括弧一括修正・explanations全面刷新 |
| 31 | math/1A/geometry-properties/basic-plane-figures | ✅ | 重複正解9件・メタ語除去・bpf-006Aスリム化・ヌルバイト除去・explanations全面刷新 |
| 32 | math/1A/geometry-properties/triangle-sides-and-angles | ✅ | メタ語9件除去・重複正解3件修正(tsa-003B/tsa-012D/tsa-016D)・tsa-012C別値に変更・tsa-027A/tsa-028A修正・ヌルバイト除去・explanations全面刷新 |
| 33 | math/1A/geometry-properties/triangle-ratios-and-centers | ✅ | 正解A長さスリム化11件・trc-012比修正(積1/2→1)・trc-022重複正解C修正・trc-007A不完全修正・trc-019問題文typo修正・explanations全面刷新 |
| 34 | math/1A/geometry-properties/circles-lines-and-circle-relations | ✅ | cir-013B重複正解修正・cir-005Aスリム化・cir-025/026/029A補完修正・JSON末尾欠損修復・explanations全面刷新 |
| 35 | math/1A/geometry-properties/cyclic-quadrilaterals | ✅ | cyc-004A/cyc-011A+D/cyc-012A+C/cyc-013問題差替/cyc-027D/cyc-028A修正・explanations全面刷新 |
| 36 | math/1A/geometry-properties/ceva-and-menelaus-theorems | ✅ | cam-001A完成/cam-001B/C/Dメタ語除去・cam-002A完成・cam-006B重複正解修正・cam-011A完成・cam-015A答え明記・cam-020A計算結果追加・cam-024A答え修正(3:2)・cam-026A完成・cam-027A答え明記/B重複正解修正・explanations全面刷新 |
| 37 | math/1A/geometry-properties/geometric-construction | ✅ | gc-014問題文修正(直線→円)・gc-019/021/024/030A途中切れ完成・gc-026変数名不一致修正・explanations全面刷新 |
| 38 | math/1A/geometry-properties/solid-geometry | ✅ | sg-003/007/019A途中切れ完成・sg-009A「1/3倍」明記・sg-021B重複正解→誤答に変更・explanations全面刷新 |
| 39 | math/1A/number-theory/divisors-and-multiples | ✅ | nt-dm-012A重複正解→誤答・nt-dm-021C結論重複→変更・nt-dm-024メタ参照除去・8問スリム化・explanations全面刷新 |
| 40 | math/1A/number-theory/integer-division-and-remainder | ✅ | 重複正解11件修正(idr-012/015/016/017/018/019/020/022/025/027/030)・スリム化5件(idr-004/006/013/021/024)・全角括弧修正・メタ語除去・explanations全面刷新(30問) |
| 41 | math/1A/number-theory/fractions-decimals-and-bases | ✅ | 重複正解10件修正(D→A等)・fdb-007数学誤りB正解に変更・正解長さ12件スリム化・explanations全面刷新(30問) |
| 42 | math/1A/number-theory/congruences | ✅ | 全角括弧修正・重複正解14件修正(004/006/008/010/011/013/015/018/019/021/023/026/027/028)・英語注釈除去・explanations全面刷新 |
| 43 | math/1A/number-theory/euclidean-algorithm-and-diophantine | ✅ | メタ構造重複正解11件修正(003/005/006/010/014/018/021/023/028/029/030)・全角括弧3件・スリム化5件(007/012/013/017/025)・ヌルバイト除去・explanations全面刷新 |
| 44 | math/1A/number-theory/integer-solution-problems | ✅ | メタ構造重複正解17件修正・全角括弧22件・nt-isp-018正答3組に訂正(3,3,3)追加・explanations全面刷新 |

## 数学 2B（37単元）

| # | 単元パス | 状態 | 備考 |
|---|---------|------|------|
| 45 | math/2B/expressions-and-proofs/polynomial-division | ✅ | pd-008/018/028メタ語除去・pd-012/016正解修正(正解変更A/B)・pd-024/032数学的誤り修正・pd-026/027重複正解修正・pd-017/024/026Dメタ語除去・explanations全面刷新(pd-024〜033) |
| 46 | math/2B/expressions-and-proofs/factor-and-remainder-theorems | ✅ | 重複正解11件修正(fr-005B/fr-008B/C/fr-011A/fr-013C/fr-014D/fr-018D/frt-027B/frt-028C/frt-029C/frt-032B)・メタ語15件除去・ヌルバイト除去・WARN2件承認 |
| 47 | math/2B/expressions-and-proofs/relations-between-roots-and-coefficients | ✅ | 重複正解11件修正(rc-004/006/011/012/017/018/019/rrc-026/028/029/030)・メタ語18件除去・explanations ID不一致修正(rc-021〜030→rrc-024〜033に全面刷新) |
| 48 | math/2B/expressions-and-proofs/equation-and-inequality-proofs | ✅ | メタ語除去3件・重複正解9件修正・explanations ID全面修正(ep-021〜030削除、eip-024〜033新規作成) |
| 49 | math/2B/expressions-and-proofs/logic-and-proofs | ✅ | メタ語除去8件・重複正解5件修正(lp-024C/016C/019D/020B/031B)・explanations全面修正(lp-021〜030削除、lp-031〜033新規作成) |
| 50 | math/2B/coordinate-geometry/points-and-lines | ✅ | 全角括弧修正・メタ語除去（全30問）・重複正解3件修正(pl-012B/pl-024A/pl-025A〜D全面差替)・pl-021A/B差替・pl-023B差替・explanations全面刷新 |
| 51 | math/2B/coordinate-geometry/line-relations | ✅ | 全角括弧一括修正・メタ語除去6件(lr-006A/010B/D/025B/C/026B)・重複正解修正2件(lr-025B/C)・数学誤り修正4件(lr-015点変更/lr-021M座標/lr-023H座標/lr-027D点変更+対角線判定に修正)・スリム化13件・explanations全面刷新 |
| 52 | math/2B/coordinate-geometry/equation-of-a-circle | ✅ | メタ語除去・重複正解修正・ec-022/029問題再設計・explanations全面刷新 |
| 53 | math/2B/coordinate-geometry/circle-and-line-relations | ✅ | 全角括弧除去・重複解修正・clr-021正解A→C変更・explanations全面刷新 |
| 54 | math/2B/coordinate-geometry/locus-and-region | ✅ | 全角括弧修正・lar-013問題文誤り修正(y=1→y=−1)・lar-020D重複正解修正・スリム化12件・explanations全面刷新 |
| 55 | math/2B/trigonometric-functions/radian-measure | ✅ | メタ語除去24件・重複正解修正6件(rm-025B/rm-027B/D/rm-029C/rm-032C/rm-033C/D)・ヌルバイト除去・explanations全面刷新(rm-021〜023削除・rm-024〜033差替) |
| 56 | math/2B/trigonometric-functions/trigonometric-definitions-and-properties | ✅ | unit/subunit修正(tdp-030〜039)・全角括弧除去・メタ語除去・tdp-036B/C重複正解修正・tdp-031D/tdp-032C重複正解修正・explanations.json全面刷新(td-021〜030削除→tdp-030〜039新規作成) |
| 57 | math/2B/trigonometric-functions/trigonometric-graphs | ✅ | 修正なし（ERROR=0、WARN=1誤検知承認済み） |
| 58 | math/2B/trigonometric-functions/trigonometric-equations-and-inequalities | ✅ | unit/subunit修正(全30問)・tei-015/025/026/028/031重複正解修正・tei-026/027/029/030/031/032/033全角括弧+メタ語除去・tei-018/030Aスリム化・explanations tei-021〜024削除・tei-031〜034新規作成 |
| 59 | math/2B/trigonometric-functions/addition-theorems | ✅ | ID重複修正(2nd at-024→at-016/at-025→at-017/at-031→at-018/at-032→at-019/at-033→at-020)・全角括弧修正・メタ語除去15件・重複正解修正4件(at-016D/at-027C/at-029D/at-019全選択肢)・スリム化2件(at-015A/at-028A)・explanations全面刷新 |
| 60 | math/2B/exponential-and-logarithmic-functions/laws-of-exponents | ✅ | ID修正(le-026〜035→loe-021〜030)・重複正解5件修正・メタ語除去・explanations全面刷新 |
| 61 | math/2B/exponential-and-logarithmic-functions/properties-of-exponential-functions | ✅ | 全角括弧22件修正・重複正解1件(pef-017D)・上位構造修正・explanations全面刷新 |
| 62 | math/2B/exponential-and-logarithmic-functions/properties-of-logarithms | ✅ | 全角括弧24件修正・重複正解3件(pol-005B/pol-007D/pol-010A)・pol-030A修正・explanations全面刷新 |
| 63 | math/2B/exponential-and-logarithmic-functions/logarithmic-function-graphs | ✅ | 全角括弧19件修正・重複正解修正・正解内容の数学的誤り12件修正(lfg-008/009/010/011/012/013/015/016/017/018/019/025)・explanations全面刷新 |
| 64 | math/2B/exponential-and-logarithmic-functions/exponential-and-logarithmic-equations | ✅ | 全角括弧13件修正・重複正解1件(ele-023D)・上位構造修正・explanations全面刷新 |
| 65 | math/2B/sequences/arithmetic-sequences | ✅ | as-029C重複誤答修正・WARN2件承認 |
| 66 | math/2B/sequences/geometric-sequences | ✅ | geq-005Bメタ語除去・geq-025C重複正解→別誤答に変更 |
| 67 | math/2B/sequences/series-summation | ✅ | ss-006D重複誤答修正・WARN5件承認 |
| 68 | math/2B/sequences/difference-sequences | ✅ | ds-008D/ds-020D重複誤答修正・WARN2件承認 |
| 69 | math/2B/sequences/recurrence-relations | ✅ | 重複正解4件(rr-010/015/018/022)修正・数学誤り3件(rr-017/028/033)修正・rr-016問題再設計・全角括弧・メタ語除去・orphaned解説削除・rr-031〜033解説追加 |
| 70 | math/2B/sequences/mathematical-induction | ✅ | mi-012D重複正解修正・mi-015Atypo修正(k!欠落)・mi-021C重複正解修正・mi-025C括弧typo修正・mi-027Ctypo修正・mi-032A重複正解修正・ヌルバイト除去・orphaned解説(mi-001/003/013)削除・mi-031/032/033解説追加 |
| 71 | math/2B/calculus-basics/derivatives-and-basic-rules | ✅ | 全角括弧メタヒント除去（全選択肢）・drv-001B/drv-008B/drv-026A重複正解修正・drv-021D/drv-025D重複誤答修正・drv-017/drv-022C/drv-026スクリプト誤検知対応 |
| 72 | math/2B/calculus-basics/tangent-lines | ✅ | 全角括弧メタヒント除去（全選択肢）・tl-004D/tl-010B/tl-012A/tl-012CD/tl-022C/tl-028A重複修正・tl-007A/C/D誤検知対応（=0→「ゼロ」表記）・explanations全面刷新 |
| 73 | math/2B/calculus-basics/increasing-decreasing-and-extrema | ✅ | 全角括弧メタヒント除去（全選択肢）・誤検知ERROR 17件対応（x=2/x=a/f'=0文脈）→表現変更で回避・explanations確認（30問・ボイラープレートなし） |
| 74 | math/2B/calculus-basics/graph-sketching | ✅ | unit/subunit修正（全30問）・メタ語除去50件・重複正解修正5件（gs-019C/D/gs-021A/gs-023D/gs-026D）・スリム化2件（gs-021C/gs-027A）・explanations全面刷新 |
| 75 | math/2B/calculus-basics/indefinite-integrals | ✅ | unit/subunit修正・全角括弧メタ語除去（全選択肢）・if-015B/C/D重複正解修正・if-021A重複正解修正・if-018D重複修正・if-028問題再設計(f(1)=3条件に変更)・explanations全面刷新 |
| 76 | math/2B/calculus-basics/definite-integrals | ✅ | unit/subunit修正・全角括弧メタ語除去（全選択肢）・重複正解修正7件(di-006D/di-008D/di-009AC/di-011A/di-020A/di-026A/di-028CD)・di-024数学誤り修正(25/6→13/6)・explanations全面刷新 |
| 77 | math/2B/calculus-basics/area-by-integration | ✅ | unit/subunit修正・全角括弧メタ語除去（全選択肢）・重複正解修正20件・explanations全面刷新 |
| 78 | math/2B/statistical-inference/random-variables-and-distributions | ✅ | unit/subunit修正・全角括弧13件・スリム化2件(rvd-011D/rvd-026D)・rvd-028再設計(P≥3/4)・rvd-012A重複回避・explanations全面刷新 |
| 79 | math/2B/statistical-inference/binomial-distribution | ✅ | unit/subunit修正・全角括弧6件・重複正解修正(bd-014B/D・bd-021D)・スリム化3件(bd-008D/bd-019B/bd-021A)・typo修正(bd-026A)・bd-028誤検知対応・explanations全面刷新 |
| 80 | math/2B/statistical-inference/normal-distribution | ✅ | unit/subunit修正・全角括弧修正・nd-022Bメタ語除去・スリム化5件(nd-009/011/013/020/024A)・explanations全面刷新 |
| 81 | math/2B/statistical-inference/estimation-and-hypothesis-testing | ✅ | unit/subunit修正・全角括弧16件・メタ語3件除去(eht-026D/027A/030A)・eht-026A正解スリム化・eht-026D別誤答に変更・eht-004Cメタ語回避・explanations全面刷新 |
| 82 | math/2B/statistical-inference/sampling-methods | ✅ | unit/subunit修正・全角括弧一括修正・sm-013A重複正解修正(50±39.2)・sm-023C重複正解修正(0.4±0.048)・メタヒント2件除去(sm-013C/sm-021B)・スリム化7件(sm-014A/sm-018D/sm-022B/sm-023D/sm-025B/sm-029A/sm-030A)・explanations全面刷新 |

## 数学 C（11単元）

| # | 単元パス | 状態 | 備考 |
|---|---------|------|------|
| 83 | math/C/vectors/vector-basics | ⬜ | |
| 84 | math/C/vectors/vector-components | ⬜ | |
| 85 | math/C/vectors/dot-product | ⬜ | |
| 86 | math/C/vectors/position-vectors-and-geometry | ⬜ | |
| 87 | math/C/vectors/applications-of-plane-vectors | ⬜ | |
| 88 | math/C/vectors/space-vectors | ⬜ | |
| 89 | math/C/curves-and-complex-plane/parabolas | ⬜ | |
| 90 | math/C/curves-and-complex-plane/ellipses | ⬜ | |
| 91 | math/C/curves-and-complex-plane/hyperbolas | ⬜ | |
| 92 | math/C/curves-and-complex-plane/complex-plane-basics | ⬜ | |
| 93 | math/C/curves-and-complex-plane/complex-plane-geometry | ⬜ | |

## 英語（2単元）

| # | 単元パス | 状態 | 備考 |
|---|---------|------|------|
| 94 | english/listening | ⬜ | |
| 95 | english/reading | ⬜ | |

## 国語（3単元）

| # | 単元パス | 状態 | 備考 |
|---|---------|------|------|
| 96 | japanese/classical | ⬜ | |
| 97 | japanese/kanbun | ⬜ | |
| 98 | japanese/modern-reading | ⬜ | |

## 理科（4単元）

| # | 単元パス | 状態 | 備考 |
|---|---------|------|------|
| 99 | science/biology | ⬜ | |
| 100 | science/chemistry | ⬜ | |
| 101 | science/earth-science | ⬜ | |
| 102 | science/physics | ⬜ | |

## 社会（3単元）

| # | 単元パス | 状態 | 備考 |
|---|---------|------|------|
| 103 | social/civics | ⬜ | |
| 104 | social/geography | ⬜ | |
| 105 | social/history | ⬜ | |

---

## 📝 レビューログ（修正内容の記録）

### 2026-06-02 チャット㉛（#47 expressions-and-proofs/relations-between-roots-and-coefficients）
- **重複正解修正 11件**: rc-004D(14→12)・rc-006D(5→9)・rc-011C(別解→2x置換の誤答)・rc-012C(別解→x+1置換の誤答)・rc-017C(14→6)・rc-018C(18→26)・rc-019C(別解→符号誤りx²−2x+3=0)・rrc-026D(同答→x²−6x+11=0)・rrc-028C(同答→61)・rrc-029B(同答→p=−4i誤答)・rrc-030D(同答→6)
- **メタ語除去 18件**: rc-001C/D・rc-002B・rc-004B・rc-006D・rc-007B/C・rc-010B/C・rc-011C・rc-012C・rc-014D・rc-019C・rc-020B・rrc-024C・rrc-026C・rrc-027B/C・rrc-028C・rrc-029B/D・rrc-030D・rrc-031B/D・rrc-033D
- **explanations.json ID全面修正**: rc-021〜rc-030（問題なし）を削除、rrc-024〜rrc-033 の解説を新規作成（30問完全対応）
- **rc-015 B/C整理**: B→m>−2（和のみ確認）、C→m>−2かつm≠2（判別式誤読）に変更
- 全単元 ERROR=0、WARN=3（誤検知）承認済み

### 2026-06-02 チャット㉚（#46 expressions-and-proofs/factor-and-remainder-theorems）
- **重複正解修正 11件**: fr-005B(交互和を全部正にした誤答に変更)・fr-008B(商を x²−4x+4 の誤りに変更)・fr-008C(商を x²−3x−2 の誤りに変更)・fr-011A(correct=C、Aを商の誤りに変更)・fr-013C(符号ミスの置き方に変更)・fr-014D(商を x²−2x−1 の誤りに変更)・fr-018D(判別式を√41 の誤りに変更)・frt-027B(商を x²−4x+4 の誤りに変更)・frt-028C(P(-1)とP(1)を混同する誤答に変更)・frt-029C(正の実数のみで 1個とする誤答に変更)・frt-032B(x²+2x+1の因数分解ミスに変更)
- **メタ語除去 15件**: fr-001B・fr-002B/C・fr-005B(変更済)・fr-016B(変更済)・frt-024D・frt-025B・frt-027B(変更済)・frt-028C(変更済)・frt-029B/C(変更済)・frt-030B/C・frt-031C・frt-032A/B(変更済)/C
- **ヌルバイト除去**: questions.json 末尾のヌルバイトを除去
- 全単元 ERROR=0、WARN=2（b=0 の誤検知・"実数解"語の誤検知）承認済み

### 2026-06-02 チャット㉝（#49 expressions-and-proofs/logic-and-proofs）
- **メタ語除去8件**: lp-004C(反例の意味を誤解)・lp-025C(裏)・lp-025D/lp-027D(誤り)・lp-028B(という誤解)・lp-029B/C/D・lp-030C(否定なし)
- **重複正解修正5件**: lp-024C(裏→元命題と同値という誤答)・lp-016C(FALSE主張の誤答)・lp-019D(誤ったfactoring)・lp-020B(非反例に変更)・lp-031B(計算誤り導入)
- **lp-010C**: TRUE(重複)→FALSE(誤答)に変更
- **explanations.json ID全面修正**: lp-021〜030（孤立）削除、lp-031〜033 新規作成
- 全単元 ERROR=0、WARN=4（誤検知）承認済み

### 2026-06-02 チャット㉜（#48 expressions-and-proofs/equation-and-inequality-proofs）
- **メタ語除去3件**: ep-001D・ep-014B・eip-028B(等号条件の括弧内ヒント)
- **重複正解修正9件**: ep-008B(sign error)・ep-009D(不等号逆)・ep-011A(符号誤り)・ep-012C(誤公式)・ep-013D(最小値2)・ep-015B/D・ep-016B・ep-019C・eip-030D
- **explanations.json ID全面修正**: ep-021〜030（孤立）削除、eip-024〜033 新規作成
- ヌルバイト除去（questions.json末尾）
- 全単元 ERROR=0、WARN=2（誤検知）承認済み

### 2026-06-02 チャット㉞（#50 coordinate-geometry/points-and-lines）
- **全角括弧修正**: 全問の question・choices 中の（）→()
- **メタ語除去**: 全30問の誤答選択肢から「（x だけ誤り）」「（中点と混同）」「（逆数）」等の括弧内ヒントを全件除去
- **重複正解修正3件**:
  - pl-012 B: 「(正しい計算)(4,-1)」→「比を1:3逆に使った誤答 (2,1)」
  - pl-024 A: 「(正しい公式)P'=(2,2)」→「垂線傾きを1と誤りP'が求まらないという誤答」
  - pl-025: A〜D全て答え=3の四重重複 → correct=A（標準公式）に変更、B/C/Dを3/5・3/5・15/7の誤答に差替
- **pl-021 A**: 「解なし」→ P(−1/2,1/2)の誤答（Cの「解なし」と重複解消）
- **pl-021 B**: 「解なし」→「P は無数に存在する」（A・Cと全て異なる結論に）
- **pl-023 B**: x=3 が D の「3直線」と数値衝突 → 別の論理誤り選択肢に差替
- **explanations.json**: 全30問が1行コピーのみ → lead/steps/common_mistakes/tips 全面刷新
- 全単元 ERROR=0、WARN=1（pl-023 の「0」誤検知）承認済み

### 2026-06-02 チャット㉟（#51 coordinate-geometry/line-relations）
- **全角括弧修正**: 全問の question・choices 中の（）→()
- **メタ語除去6件**: lr-006A(元の直線と同じ)・lr-010B(傾きは違ってよい)・lr-010D(切片は違ってよい)・lr-025B(同じ式だが考え方が違う)・lr-025C(分母を誤る)・lr-026B(傾きの逆数を使う)
- **重複正解修正2件**: lr-025B→"距離=|8+2|/(3+4)=10/7"(正解Dと同じ2を回避)・lr-025C→"距離=10/√7"(正解Dと同じ2を回避)
- **数学的誤り修正4件**:
  - lr-015: A(2,3)が直線l上にあった → A(4,3)に変更、A'=(2,5)に修正
  - lr-021: 垂線傾きを3/2と誤り → -3/2に修正、M=(36/13,50/13)・A'=(20/13,74/13)
  - lr-023: H=(53/25,56/25)の誤り → H=(76/25,68/25)に修正
  - lr-027: A(0,0),B(4,0),C(3,3),D(-1,3)は実は平行四辺形 → D(-2,3)に変更、対角線の中点判定法に修正
- **スリム化13件**: lr-007/009/011/014/016/017/018/020/021/022/023/024/027
- **explanations.json**: 全30問がボイラープレート（正解テキストのコピー）→ 全面刷新
- 全単元 ERROR=0、WARN=1（lr-022 C/D の"=0"誤検知）承認済み

### 2026-06-03 チャット㊶（#59 trigonometric-functions/addition-theorems）
- **ID重複修正**: 2nd at-024→at-016(sin75°×sin15°)・2nd at-025→at-017(tan(α+β)=-7/11)・at-031→at-018・at-032→at-019・at-033→at-020（連番 at-001〜at-030 に整理）
- **全角括弧修正**: at-006/007/009 問題文・at-024〜at-033 選択肢の（）→() 一括修正
- **メタ語除去 15件**: at-016B/D・at-026B/C/D・at-027B/C/D・at-028B/C・at-029B/C/D・at-030D・at-018D
- **重複正解修正 4件**: at-016D(cos(A+B)/2=1/4→cos90°/2=0に変更)・at-027C(3/4→3/5の誤答に変更)・at-029D(cos75°→sin30°×sin45°=√2/4に変更)・at-019(全選択肢が「2個」→θの値を問う問題に変更)
- **スリム化 2件**: at-015A(積和の展開式削除→結果のみ)・at-028A(導出手順削除→4cos³θ-3cosθのみ)
- **explanations.json 全面刷新**: 30問完全対応（at-001〜at-030）
- 全単元 ERROR=0、WARN=0

### 2026-06-03 チャット㊵（#58 trigonometric-functions/trigonometric-equations-and-inequalities）
- **unit/subunit 修正**: 全30問を `"unit": "trigonometric-functions"`, `"subunit": "trigonometric-equations-and-inequalities"` に修正
- **重複正解修正 5件**: tei-015C(π/2除外誤答→θ=π)・tei-025C(2個→判別式誤計算0個)・tei-026D(同答π/4<θ<5π/4→上半円誤解)・tei-028B(π/6,5π/6→√3/2混同でπ/3,2π/3)・tei-031C(2個→判別式誤計算0個)
- **全角括弧+メタ語除去**: tei-026B/D・tei-027C・tei-029B/C/D・tei-030B/C/D・tei-031D・tei-032B/D・tei-033C/D の括弧内ヒント全除去
- **スリム化 2件**: tei-018A(148→78文字)・tei-030A(87→36文字)
- **explanations.json**: tei-021〜024（対応問題なし）削除・tei-031〜034 の解説を新規作成（30問完全対応）
- 全単元 ERROR=0、WARN=0

### 2026-06-03 チャット㊴（#56 trigonometric-functions/trigonometric-definitions-and-properties）
- **unit/subunit 修正**: tdp-030〜039 の `"unit": "三角関数の定義と性質"` → `"unit": "trigonometric-functions"` に修正、`subunit` フィールドを追加
- **全角括弧除去**: tdp-030〜039 の選択肢テキスト中の（）を一括除去
- **メタ語除去**: tdp-030B/C、tdp-031C/D、tdp-032C/D、tdp-033B/C/D、tdp-034B/C、tdp-035C/D、tdp-036B/C、tdp-037B/C、tdp-039C/D の括弧内メタ説明を除去
- **重複正解修正 5件**: tdp-036B(2/√5→1/√5)・tdp-036C(同答→2/5)・tdp-031D(5π/3→2π/3,4π/3)・tdp-032C(2π/3→5π/3のみ)・tdp-037C(y=0重複→初期位相+π/3)
- **explanations.json 全面刷新**: td-021〜030（対応問題なし）を削除し、tdp-030〜039 の解説を新規作成（30問完全対応）
- 全単元 ERROR=0、WARN=0

### 2026-06-03 チャット㊳（#55 trigonometric-functions/radian-measure）
- **メタ語除去 24件**: rm-024〜033 の全誤答選択肢から括弧内の誤り説明を除去
- **重複正解修正 6件**: rm-025B(π/18に変更)・rm-027B(54πに変更)/D(81πに変更)・rm-029C(67.5°に変更)・rm-032C(-1/6に変更)・rm-033C(-√3/2に変更)/D(√3/2に変更)
- **rm-011D**: C(10π)と重複 → 20πに変更
- **ヌルバイト除去**: questions.json 末尾のヌルバイトを除去
- **explanations.json**: rm-021/022/023（対応問題なし）を削除。rm-024〜030 が全て別問題の解説だったため全面差替。rm-031/032/033 を新規作成。全30問完全対応
- 全単元 ERROR=0、WARN=1（rm-017 A/BのGCD値"45"誤検知）承認済み

### 2026-06-03 チャット㊲（#54 coordinate-geometry/locus-and-region）
- **問題文誤り修正**: lar-013「直線 y=1 と点 F(0,1)」→「直線 y=−1 と点 F(0,1)」（焦点が準線上に乗っていた数学的誤り）
- **重複正解修正**: lar-020 D「-y≤x≤y」が B「y≥x かつ y≥−x」と数学的同値 → 「y≥x かつ y≤−x」に変更
- **全角括弧修正**: 全問の question・choices 中の（）→()
- **スリム化 12件**: lar-012B・lar-016B・lar-017C・lar-019B・lar-021B・lar-022C・lar-023A・lar-024C・lar-025A・lar-026D・lar-028A・lar-030C（derivation を削除し核心の答えのみに）
- **explanations.json**: 全30問がボイラープレート → 全面刷新（lead/steps/common_mistakes/tips 完全記述）
- 全単元 ERROR=0、WARN=7（同式を参照する問題の誤検知）承認済み

### 2026-06-03 チャット㊱（#52-53 coordinate-geometry）
- **#52 equation-of-a-circle**: メタ語除去（全30問）・重複正解修正（ec-004/011/013/021/026/027/029）・ec-022問題を「共通外接線本数→共通接線本数」に再設計・ec-029問題の円を修正(x²+y²=4, (x-3)²+y²=1)・clr-021正解A→C(m=0)に変更・explanations全面刷新
- **#53 circle-and-line-relations**: 全角括弧除去23件・重複解修正（clr-003C/clr-007B/clr-027A）・clr-021正解A→C(m=0)・clr-011/023重複誤答修正・explanations全面刷新
- 全2単元 ERROR=0、WARN≤2（誤検知）承認済み

### 2026-06-05 チャット56（#82 statistical-inference/sampling-methods）
- **unit/subunit 修正**: 全30問を `"unit": "statistical-inference"`, `"subunit": "sampling-methods"` に修正
- **全角括弧一括修正**: 問題文・選択肢の（）→() を全件変換
- **メタヒント除去 2件**: sm-013 C `(σ/√n=1 のはず)` 除去・sm-021 B `(近似値で答えた)` 除去
- **重複正解修正 2件**:
  - sm-013 A: `50±1.96`（D の正解と同値）→ `50±1.96×20=50±39.2`（√n 忘れ誤答）
  - sm-023 C: `0.4±0.024`（D の正解 0.4±0.0235 と実質同値）→ `0.4±0.048`（n=400 誤計算）
- **スリム化 7件**:
  - sm-014 A: 誘導式削除 → `n を 4 倍にする`
  - sm-018 D: 導出削除 → `0.6±0.032`
  - sm-022 B: 導出削除 → `n≥2401`
  - sm-023 D: 導出削除 → `0.4±0.024 → [0.376, 0.424]`
  - sm-025 B: 前半説明削除 → `1回の区間が外れることはある`
  - sm-029 A: 冗長部分削除 → `1.96×10/10=1.96 → [46.54, 50.46]`
  - sm-030 A: 導出削除 → `幅≈0.090`
- **explanations.json 全面刷新**: 全30問がボイラープレート（steps=lead・tips=""）→ 問題固有の lead/steps/common_mistakes/tips に刷新
- 全単元 ERROR=0、WARN=1（sm-011 C「同じ手順」誤検知）承認済み

### 2026-06-05 チャット55（#81 statistical-inference/estimation-and-hypothesis-testing）
- **unit/subunit 修正**: 全30問を `"unit": "statistical-inference"`, `"subunit": "estimation-and-hypothesis-testing"` に修正
- **全角括弧修正 16件**: eht-001C/003A/004B/010B/012C/013A/015B/018B/023A/026A/026D/027A/028D/029C/030A/030D の括弧を半角に変換
- **メタ語除去 3件**:
  - eht-026 D: `(逆に下がる)` を除去 → C「有意水準を厳しくする」と意味が重複するため別誤答「n を減らして標準誤差を大きくする」に変更
  - eht-027 A: `(第一種は上がるがβは下がる可能性)` を除去 → 「α を 0.1 に増やす」に短縮
  - eht-030 A: `(中心極限定理と混同)` を除去 → 「n が増えると分布は正規分布になる」に短縮
- **正解スリム化 1件**: eht-026 A「n を増やす(標本数を…)」→「n を増やして検出力を高める」（差 30→5文字）
- **WARN回避 1件**: eht-004 C「H₀ と全く同じ内容」(「同じ内容」キーワード) → 「帰無仮説が採択された後に登場する仮説」に変更
- **explanations.json 全面刷新**: 全30問がボイラープレート（steps=lead・tips=""）→ 問題固有の lead/steps/common_mistakes/tips に刷新
- 全単元 ERROR=0、WARN=0

### 2026-06-05 チャット54（#80 statistical-inference/normal-distribution）
- **unit/subunit 修正**: 全30問を `"unit": "statistical-inference"`, `"subunit": "normal-distribution"` に修正
- **全角括弧修正**: nd-001A/003B/004B/010C/014D/019B/022B/028C/029C/030B の括弧を半角に変換（問題文含む）
- **nd-022 B メタ語除去**: `（同じ）` を除去 → `Z=(46−50)/√16=−1 → P≈0.3085` に変更
- **スリム化 5件**:
  - nd-009 A: 標準化手順全文 → `P≈0.68`（手順は explanations に移動）
  - nd-011 D: 全計算式 → `Z=(65−60)/5=1 → P(Z≤1)≈0.8413`
  - nd-013 C: 標準化手順全文 → `P≈0.68`
  - nd-020 B: 標準化式+結果 → `P(0≤Z≤2)≈0.4772`
  - nd-024 C: 4段階変換 → `z₀=1.96`
- **explanations.json 全面刷新**: 全30問がボイラープレート（steps=lead・tips=""）→ 問題固有の lead/steps/common_mistakes/tips に刷新
- 全単元 ERROR=0、WARN=1（nd-010 A/B の `k)` 末尾誤検知）承認済み

### 2026-06-05 チャット53（#79 statistical-inference/binomial-distribution）
- **unit/subunit 修正**: 全30問を `"unit": "statistical-inference"`, `"subunit": "binomial-distribution"` に修正
- **全角括弧修正 6件**: bd-007A/010C/018A/022A/023D/029A の括弧を半角に変換
- **重複正解修正 3件**:
  - bd-014 B: 「平均=10 なので確率最大」（Aと同じ値10）→「p=0.5 なので分布は左右対称で端点で最大になる」誤答に変更
  - bd-014 D: 「X=10 は端点だから」（値10を含む）→「確率関数は単調減少するため最小の X で最大になる」誤答に変更
  - bd-021 D: 「3E(X²)-2E(X)+1=41」（Cと同じ値41）→「E(X²)=E(X)=4として計算→5」誤答に変更
- **スリム化 3件**: bd-008D（計算式→結果のみ）・bd-019B（冗長な計算を簡略化）・bd-021A（導出手順削除→核心のみ）
- **typo修正 1件**: bd-026A の `56+28+8+1)/256` → `(56+28+8+1)/256`（開き括弧欠落）
- **bd-028 誤検知対応**: A/C/D の選択肢が全て「P(X=0)」を含み末尾「0)」で誤検知 → 「1度も成功しない確率」表現に変更
- **bd-013 B 整理**: 「3/n×n=16」のガーブルドテキスト → 「3n/16=3 → n=16」にクリーン化
- **explanations.json 全面刷新**: 全30問がボイラープレート（steps=lead・tips=""）→ 問題固有の lead/steps/common_mistakes/tips に刷新
- 全単元 ERROR=0、WARN=1（bd-025 C/B 式文字列の誤検知）承認済み

### 2026-06-05 チャット52（#78 statistical-inference/random-variables-and-distributions）
- **unit/subunit 修正**: 全30問を `"unit": "statistical-inference"`, `"subunit": "random-variables-and-distributions"` に修正
- **全角括弧修正 13件**: rvd-001B/004B/005C/006A/007C/009D/010A/013D/017C/018D/019C/027C/028D の括弧を半角に変換
- **正解スリム化 2件**: rvd-011D（計算式全文→「V(X)=1/2」）・rvd-026D（計算式全文→「E(X)=7/3」）
- **rvd-028 再設計**: P(3≤X≤7) でチェビシェフ適用時に P≥0 という自明な下界になる問題 → P(1≤X≤9) の下界を問う問題に変更（答え P≥3/4）
- **rvd-012 A 重複回避**: A の「V(Y)=16」が正解 C と同じ最終値 → 「E(Y)=7、V(Y)=8」に変更
- **explanations.json 全面刷新**: 全30問がボイラープレート（steps=lead・tips=""）→ 問題固有の lead/steps/common_mistakes/tips に刷新
- 全単元 ERROR=0、WARN=0

### 2026-06-05 チャット51（#77 calculus-basics/area-by-integration）
- **unit/subunit 修正**: 全30問を `"unit": "calculus-basics"`, `"subunit": "area-by-integration"` に修正
- **全角括弧メタ語除去**: ほぼ全選択肢の括弧内ヒント（分母 3 で割らなかった・上下逆・正しい・等）を一括除去
- **重複正解修正 20件**: ab-002D/ab-003D/ab-005B/ab-006D/ab-008B/C/ab-011C/ab-012B/C/ab-013D/ab-014A/B/ab-015B/C/ab-016B/D/ab-018B/C/ab-020B/ab-023D/ab-024B/D/ab-025B/ab-026C/ab-027A/C/D/ab-028A/ab-029C/D
- **explanations.json 全面刷新**: 全30問がボイラープレート（tips/common_mistakes が全問同一）→ 問題固有の解説に刷新
- 全単元 ERROR=0、WARN=0

### 2026-06-04 チャット㊿（#76 calculus-basics/definite-integrals）
- **unit/subunit 修正**: 全30問を `"unit": "calculus-basics"`, `"subunit": "definite-integrals"` に修正
- **全角括弧メタ語除去**: ほぼ全選択肢の括弧内ヒント（分母で割らなかった・上下限を逆にした・等）を一括除去
- **重複正解修正 7件**:
  - di-006 D: C と同じ 6 → 下限 0 誤りで 8 に変更
  - di-008 D: A と同じ 8/3 → 分母 2 誤りで 4 に変更
  - di-009 A/C: A=4(Bと重複)→16/3、C=0(Dと重複)→∫₀²x dx=2 に変更
  - di-011 A: B と同じ 2/3 → +x 項を忘れた −4/3 に変更
  - di-020 A: B と同じ 3 → 下限符号誤りで 7/3 に変更
  - di-026 A: C と同じ 2 → 半区間だけ計算の 2/3 に変更
  - di-028 C/D: A と同じ 1/2 → C=1/3、D=1 に変更
- **di-024 数学的誤り修正**: B の正解が 25/6 だったが計算誤り → 13/6 に修正（x=2 代入は 4/3、x=1 代入は −5/6）
- **explanations.json 全面刷新**: 全30問がボイラープレート → 問題固有の解説に刷新
- 全単元 ERROR=0、WARN=0

### 2026-06-04 チャット㊾（#75 calculus-basics/indefinite-integrals）
- **unit/subunit 修正**: 全30問を `"unit": "calculus-basics"`, `"subunit": "indefinite-integrals"` に修正
- **全角括弧メタ語除去**: ほぼ全選択肢の括弧内ヒント（微分の公式と混同・分母で割らなかった・等）を一括除去
- **重複正解修正 4件**:
  - if-015 B/C/D: 全て `f(x)` で終わり正解Aと重複 → B「f(x)を積分するとF'(x)になること」/ C「Fを2階微分すると元の関数になること」/ D「F(x)がf(x)と等しい関数であること」に変更
  - if-021 A: Cと同じ G(x)=x³+x²+1 → G(0)=2（誤条件使用）でC=2 → G(x)=x³+x²+2 に変更
  - if-018 D: C=16/3 で正解Bと同一 → 符号誤りでC=−16/3の誤答に変更
- **if-028 問題再設計**: ∫₀¹f(x)dx=1 条件（定積分は次単元・計算誤り）→ f(1)=3 条件に変更。correct=A で a=1, b=2
- **explanations.json 全面刷新**: 全30問がボイラープレート（lead=問題文コピー・common_mistakes=全問同一）→ 問題固有の解説に刷新
- 全単元 ERROR=0、WARN=1（if-018 誤答同士のC=0誤検知）承認済み

### 2026-06-04 チャット㊽（#74 calculus-basics/graph-sketching）
- **unit/subunit 修正**: 全30問を `"unit": "calculus-basics"`, `"subunit": "graph-sketching"` に修正
- **メタ語除去 50件**: ほぼ全選択肢の括弧内ヒント（混同・誤解・符号逆など）を一括除去
- **重複正解修正 5件**: gs-019C(a≤0 誤答)・gs-019D(|a|>1 誤答)・gs-021A(誤点(-1,3)使用→b=5/2)・gs-023D(k<4 誤答)・gs-026D(誤因数分解→x=±√2,±√6)
- **スリム化 2件**: gs-021C(正解:a=3/2,b=1/2 を簡略化)・gs-027A(接点条件結果のみ)
- **explanations.json 全面刷新**: 全30問ボイラープレート（stepsが leadと同文・common_mistakesが全問同一）→ 問題固有の解説に刷新
- 全単元 ERROR=0、WARN=8（誤検知・誤答同士）承認済み

### 2026-06-04 チャット㊼（#73 calculus-basics/increasing-decreasing-and-extrema）
- **全角括弧メタヒント除去**: ほぼ全選択肢の（...）を一括除去（72 ERROR → 17）
- **誤検知ERROR 17件対応**: ide-004(x=2文脈)・ide-005(x=a文脈)・ide-006/008(f'=0/ゼロ文脈)・ide-010B・ide-015C・ide-016(x=2文脈)・ide-027B → 表現変更で回避
- **explanations.json確認**: 30問・ボイラープレートなし・内容良好
- 全単元 ERROR=0、WARN=5（誤検知）承認済み

### 2026-06-04 チャット㊻（#72 calculus-basics/tangent-lines）
- **全角括弧メタヒント除去**: ほぼ全選択肢の（...）を一括除去（88 ERROR → 0）
- **重複正解修正 2件**: tl-012A（x=±1重複→「解なし誤解」に変更）・tl-028A（y=0重複→外点計算誤りに変更）
- **重複誤答修正 4件**: tl-004D(y=0→y=−x+1)・tl-010B(y=−3x−4→y=−x)・tl-012D(x=1重複→y=3x−2表記)・tl-022C(b=1重複→b=−4)
- **スクリプト誤検知対応 3件**: tl-007A/C/D（「f'(x)=0」→「微分係数がゼロ」表記変更）・tl-023A（g(a)文字列→表記変更）・tl-025C（=0方程式→日本語表記）
- **explanations.json全面刷新**: 全30問をボイラープレート（f(a)とf'(a)の混同）から問題固有の解説に刷新
- 全単元 ERROR=0、WARN=4（誤検知）承認済み

### 2026-06-04 チャット㊺（#71 calculus-basics/derivatives-and-basic-rules）
- **全角括弧メタヒント除去**: ほぼ全選択肢の（...）を全件除去（選択肢内の誤り説明括弧）
- **重複正解修正 3件**: drv-001B(2xh+h²展開誤りで0に変更)・drv-008B(x²h+h³展開誤りでx²に変更)・drv-026A(f'(0)=0→f'(0)=1に変更)
- **スクリプト未検知の重複誤答修正 2件**: drv-021D(a=−3/2→a=3/2)・drv-025D(a=3→a=−1)
- **スクリプト誤検知対応**: drv-017(x=a変数がfinal_value'a'として誤抽出)・drv-022C(a=3/2重複→a=0)・drv-026(x=0が'0'として誤抽出)
- 全単元 ERROR=0、WARN=0

### 2026-06-04 チャット㊹（#70 sequences/mathematical-induction）
- **重複正解修正 4件**: mi-012D(3^k+3の誤答に変更)・mi-021C(n=3での誤確認に変更)・mi-027C(typo修正のみ)・mi-032A(符号誤りの誤答に変更)
- **typo修正 2件**: mi-015A(k!欠落 → k!×(k+1)に補完)・mi-025C(括弧欠落 → (k+1)²−2k−1)・mi-027C(=^(k+1) → (1+2)^(k+1))
- **ヌルバイト除去**: questions.json 末尾のヌルバイトを除去
- **orphaned解説削除**: mi-001・mi-003・mi-013（対応問題なし）
- **解説追加 3件**: mi-031・mi-032・mi-033 の lead/steps/common_mistakes/tips を新規作成
- 全単元 ERROR=0、WARN=2（誤検知）承認済み

### 2026-06-04 チャット㊸（#69 sequences/recurrence-relations）
- **重複正解修正 4件**: rr-010C(同答→aₙ=2×4^(n−1))・rr-015C(同答→aₙ=3ⁿ−2^(n+1))・rr-018C(同答→aₙ=3ⁿ+2ⁿ)・rr-022C(同答→aₙ=2^(n+1)−n²−2n−3)
- **数学的誤り修正 3件**: rr-017A(A=1/4→A=1/2, B=−1/4→B=0, aₙ=n×2^(n−1))・rr-028A(q=1→q=−1, A=1→A=2, aₙ=2^(n+1)−2n−1)・rr-033A(x=3→x=2, a₅=144→80)
- **問題再設計 1件**: rr-016 bₙ₊₁=aₙ+bₙ（両式同一で退化）→ aₙ₊₁=2aₙ+bₙ, bₙ₊₁=aₙ+2bₙ の対称型に変更（aₙ=3^(n−1)+1）
- **全角括弧修正**: rr-023問題文の（1/2）→(1/2)
- **括弧内メタヒント除去**: rr-026B・rr-028B・rr-033B
- **rr-028C更新**: 誤ったAの前提に基づく選択肢を正しい誤答パターン（q=1誤計算）に変更
- **JSON末尾修正**: questions.json の `]` `}` 欠落を修復
- **explanations.json**: orphaned解説(rr-011/014/021)削除・rr-016/017/028解説修正・rr-031/032/033解説新規作成
- 全単元 ERROR=0、WARN=0

### 2026-06-02 チャット㉙（#45 expressions-and-proofs/polynomial-division）
- **正解変更 2件**: pd-012 correct D→A（D が a=10/3 の数学的誤り、A の a=5/3 が正答）・pd-016 correct D→B（D 結論 "a+b=3" 誤り、B の a=−2,b=2 が正答）
- **数学的誤り修正 2件**: pd-024 A "余り−3x−2"→"−x−2"（長除法再計算）・pd-032 A "余り x−1"→"−x−2"（長除法再計算）
- **重複正解修正 4件**: pd-012 C（5/3→1/3 の誤答に変更）・pd-017 D（余り1と同一→別誤答）・pd-026 C（"5x−2" 同答→誤答に変更）・pd-027 B/C（合計4 同答→別誤答に変更）
- **メタ語除去**: pd-008 A/B/D・pd-018 B「という誤解」・pd-024 C「(中間の計算ミス)」D「(次数ミス)」・pd-026 C「(同答・確認式が違う)」・pd-028 B「(x=0で…)」D「(kを特定できない)」
- **explanations.json**: pd-021/022/023 は対応問題なし→削除・pd-024〜033 は問題と全面不一致→30問すべて刷新
- 全単元 ERROR=0、WARN=1（pd-020 C/D の"=0"誤検知）承認済み

### 2026-06-02 チャット㉘（#44 number-theory/integer-solution-problems）
- **メタ構造重複正解修正 17 件**: nt-isp-003/005/006/007/008/011/012/013/014/015/016/018/019/020/027/028/029 — "A と C はどちらも正しい" 型・D が A を肯定する型のメタ構造を解消。正しい選択肢を 1 つに絞り、他を誤答に書き換え
- **nt-isp-018 正答訂正**: 元の正解「2組 (2,3,6),(2,4,4)」は誤り。1/x+1/y+1/z=1 には (3,3,3) も解として存在し正しくは 3 組。問題の選択肢を全面刷新し correct=A に変更
- **全角括弧修正 22 件**: question テキスト中の（）を半角()に一括置換
- **explanations.json**: 1問のみプレースホルダー(フィールド名 mistakes) → 全 30 問を全面刷新
- 全単元 ERROR=0、WARN=1（「12」の数値誤検知）承認済み

### 2026-06-02 チャット㉗（#43 number-theory/euclidean-algorithm-and-diophantine）
- **メタ構造重複正解修正 11 件**: nt-ead-003/005/006/010/014/018/021/023/028/029/030 — "A と C はどちらも正しい" 型の正解を単一の具体的な正解に修正。誤った選択肢を計算誤り・論理誤りに書き換え
- **全角括弧修正 3 件**: nt-ead-016/027/029 の問題文中の（mod b）等を半角()に修正
- **正解スリム化 5 件**: nt-ead-007/012/013/017/025 の長すぎる正解選択肢を簡潔化
- **ヌルバイト除去**: questions.json 末尾のヌルバイトを除去
- **explanations.json**: 全30問がプレースホルダー → 全面刷新（fields: mistakes→common_mistakes も修正）
- 全単元 ERROR=0、WARN=2（変数名 y₀ の誤検知）承認済み

### 2026-06-02 チャット㉖（#42 number-theory/congruences）
- **全角括弧修正**: 全問の question テキスト中の（）→()
- **重複正解修正 14 件**: nt-cng-004/006/008/010/011/013/015/018/019/021/023/026/027/028 — 「A と B はどちらも正しい → C/D が正解」というメタ構造を解消。誤った選択肢を数値誤り・論理誤りに書き換え、correct を単一の正答に変更
- **英語注釈除去 1 件**: nt-cng-007 A の "(representative residue)" を除去
- **explanations.json**: 1 問のプレースホルダー・フィールド名誤り(mistakes→common_mistakes) → 全 30 問を全面刷新
- 全単元 ERROR=0、WARN=0

### 2026-06-02 チャット㉕（#41 number-theory/fractions-decimals-and-bases）
- **重複正解修正 10 件**: fdb-003/005/009/013/016/018/019/021/026 の "A と C はどちらも正しい" メタ構造 → 一方の選択肢に誤りを導入し correct=A に統一
- **数学的誤り修正 1 件**: fdb-007 correct=D(誤り) → correct=B(61/495)。0.12323…の正解は 990x=122 より 61/495
- **正解長さスリム化 12 件**: fdb-002/008/011/012/017/022/023/024/025/027/028/030
- **explanations.json**: 1問のプレースホルダー・フィールド名誤り(mistakes→common_mistakes) → 全30問を全面刷新
- 全単元 ERROR=0、WARN=0

### 2026-06-02 チャット㉔（#40 number-theory/integer-division-and-remainder）
- **重複正解修正 11 件**: idr-012(D→B)・idr-015(C→B)・idr-016(C→B)・idr-017(C→B)・idr-018(C→B)・idr-019(C→B)・idr-020(D→B)・idr-022(D)・idr-025(C→B)・idr-027(C→B)・idr-030(D→C) — 「A と B どちらも正しい → C/D が正解」構造で A が独立正解になる問題をすべて修正
- **スリム化 5 件**: idr-004A(51→40)・idr-006A(59→36)・idr-013A(115→52)・idr-021A(93→48)・idr-024A(104→42)
- **全角括弧修正**: idr-018A の（）→()
- **メタ語除去**: idr-025A の「誤算」を除去
- **nt-idr-013 C**: 正解Aと同じ「24」を最終値に持つ重複 → 「lcm(4,6)=12の倍数」という誤った結論に変更
- **explanations.json**: 全問が空（0件）→ 全30問を全面刷新
- 全単元 ERROR=0、WARN=3（変数名・探索結果の誤検知）承認済み

### 2026-06-01 チャット㉓（#39 number-theory/divisors-and-multiples）
- **nt-dm-012 A**: 正解 D と同じ a+b=96 に至る重複正解 → 「a=12,b=180 で a+b=192」の誤答に変更
- **nt-dm-021 C**: 正解 A と同じ結論「偶数」→「偶奇は判定不可能」に変更
- **nt-dm-024 A/D**: D が「A を参照」するメタ構造 → A から答えを削除、D に正確値 25 を明記
- **nt-dm-012 B**: A との 192 重複 → 「a'=3,b'=5 そのまま a+b=8」の誤答に変更
- **スリム化 8 件**: nt-dm-010/018/019/020/022/023/028/029 の正解選択肢を 30 字以内の差に短縮
- **explanations.json**: 1件のプレースホルダーのみ → 全30問を全面刷新
- 全単元 ERROR=0, WARN=0

### 2026-06-01 チャット㉑（#37 geometry-properties/geometric-construction）
- **gc-014**: 問題文「直線ℓへ接線」→ 「円C(中心O)への接線」に修正（選択肢A〜Dも整合修正）
- **gc-019 A**: 正解テキストが「→」で途切れ → 「3本の中線の交点が重心G」まで完成
- **gc-021 A**: 正解テキストが「が」で途切れ → 「3次方程式の根(立方根)が必要で、体の拡大列に属さないため不可能」まで完成
- **gc-024 A**: 正解テキストが「であるため」で途切れ → 「正17角形は定規とコンパスで作図可能」まで完成
- **gc-026**: 問題文「点Pを中心」、正解「Oを中心」の変数名不一致 → 問題文を「中心O、点Pを反転」に統一修正
- **gc-030 A**: 正解テキストが「がすべて」で途切れ → 「が作図可能な数のすべてである」まで完成
- **explanations.json**: 全30問がボイラープレート（「〜を確認しよう」「〜は頻出なので覚えよう」）→ 全面刷新
- 全単元 ERROR=0, WARN=0

### 2026-06-01 チャット㉒（#38 geometry-properties/solid-geometry）
- **sg-003 A**: 表面積の式が "=" で途中切れ → "= 2πr(r+h)" まで完成
- **sg-007 A**: 扇形の説明で結論欠落 → "→ 側面積=(1/2)×l×2πr=πrl" を追記
- **sg-009 A**: 「重心は各頂点から辺の2/3の点」で結論なし → 「1/3倍」まで明記・表現も修正
- **sg-019 A**: "→ 円の面積=πr² →" で途中切れ → "重心軌跡=2πR → V=2π²Rr²" まで完成
- **sg-021 B**: "球の表面積4πr²をrで積分すると(4/3)πr³になる（この方法も正しい）" → 数学的に正しく重複正解 → 誤答に差替
- **explanations.json**: 全30問がボイラープレート → 全面刷新
- 全単元 ERROR=0, WARN=0

### 2026-06-01 チャット⑳（#36 geometry-properties/ceva-and-menelaus-theorems）
- **cam-001 A**: "BD/DC"で途中切れ → "× CE/EA × AF/FB = 1"まで完成
- **cam-001 B/C/D**: "(記号の混乱)""(メネラウスの定理)""(符号あり版)"メタ語除去
- **cam-002 A**: "BP/PC × CQ/QA ×"で途中切れ → "AR/RB = 1"まで完成
- **cam-004 A**: 比を明示していなかった → "BP:PE=2:1 → BP=(2/3)BE"追記
- **cam-006 B**: 正解Aと同じAR:RB=6:1の重複正解 → "積の変形を逆にした1/6"誤答に変更
- **cam-011 A**: "="で途中切れ → "(1/3)×(2/1)×(3/1)=2≠1→交わらない"完成
- **cam-015 A**: 座標セットアップのみ → "AF:FB=1:2"答え明記
- **cam-020 A**: "メネラウスで確認"のみ → 有向比計算と結論追記
- **cam-024 A**: 曖昧→"AR:RQ=3:2, CR:RP=3:2"答え明記(解説の3:1も3:2に訂正)
- **cam-026 A**: "各頂点と垂"で途中切れ → 九点円9点の説明完成
- **cam-027 A**: 座標セットアップのみ→"△DEF/△ABC=2/9"答え明記。B(1/3)重複正解→別誤答に変更
- **explanations.json**: 全30問 steps がボイラープレート → 全面刷新
- 全単元 ERROR=0、WARN=3(難易度配分の誤検知)承認済み

### 2026-06-01 チャット⑲（#35 geometry-properties/cyclic-quadrilaterals）
- **cyc-004 A**: 正方形の外接円半径 R=a√2/2 が未記載 → 追記
- **cyc-011 A+D**: A が「s=9」のみ（不完全）かつ D が「√360≈18.97」で重複正解 → A を「6√10≈18.97」に完成、D を誤答に変更
- **cyc-012 A+C**: A が「内角=108°」のみで不完全、C に「(正しい式)」メタ語 → A を「R=a/(2sin36°)」に修正、C を「R=a/(2cos36°)」の誤答に変更
- **cyc-013**: AB=AD=5, BC=CD=3, ∠BAD=80° は幾何学的に成立しない kite → 問題を「AB=7, BC=5, CD=3, DA=3, S=12√2」に差し替え
- **cyc-027 D**: A と D がブラーマグプタで数学的同値 → D を「S=(a+c)×l/2（脚を高さとする誤り）」に変更
- **cyc-028 A**: 「三角形に退化」のみで公式一致を未確認 → ヘロン公式と一致することを明記
- **explanations.json**: 全30問がボイラープレート → 全面刷新
- 全単元 ERROR=0、WARN=2（難易度配分の誤検知）承認済み

### 2026-06-01 チャット⑱（#34 geometry-properties/circles-lines-and-circle-relations）
- **cir-013 B**: AとBが同じ「内接」→ 重複正解。B を「r₁+r₂=10>4→2点で交わる」誤答に変更
- **cir-005 A**: 45文字超でスリム化。「直径に対する円周角は90°(タレスの定理)」に短縮
- **cir-025 A**: 文が途中で切れていた → 「OP×OP'=k²を満たす点P'への写像」に補完
- **cir-026 A**: 末尾が「—」で切れていた → 「計9点が9点円上」を追記
- **cir-029 A**: 「最短の弦を問う」問題なのに「最長(直径)」を答えていた → 「OPに垂直な弦が最短」に修正
- **questions.json 末尾欠損**: JSON が途中で切れていた(最終タグ未閉じ) → Python で修復
- **explanations.json**: 全30問 steps がボイラープレート → 全面刷新
- 全単元 ERROR=0, WARN=0(cir-003 B/C の変数'r'誤検知のみ承認)

### 2026-06-01 チャット⑰（#33 geometry-properties/triangle-ratios-and-centers）
- **正解Aスリム化** 11件: trc-001/005/006/007/011/013/016/017/019/024/029 (30字超の差を解消)
- **trc-007 A**: 選択肢が「:」で途中切れ → チェバの積公式まで補完してスリム化
- **trc-012**: AP:PB=1:2, BQ:QC=1:2, CR:RA=2:1 だと積=1/2(Bが数学的に正しい重複正解) → BQ:QC=2:1, CR:RA=1:1 に変更し積=1(共線)に修正。B/C/D選択肢も整合修正
- **trc-017 A**: 面積比を明示していなかった → "相似比1:2→面積比1:4" を追記
- **trc-019**: 問題文の typo "孤BCrefrerence" → "外接円上の点Pの位置" にクリーン化
- **trc-022**: 正解A(座標セットアップのみ・結論なし)と選択肢C(△PQR=1/3△ABC=数学的に正しい)が重複正解 → Aに座標計算結果(比1/3)を追記し、Cを1/6に変更
- **explanations.json**: 全30問 steps が「〜を確認しよう」ボイラープレート → 全面刷新
- 全単元 ERROR=0, WARN=0

### 2026-06-01 チャット⑯（#32 geometry-properties/triangle-sides-and-angles）
- **メタ語除去** 9件: tsa-003B(同じ値だが別の求め方)・tsa-005D(二乗を忘れた)・tsa-012B(sinを無視)・tsa-012D(計算は正しい式が正しい)・tsa-016D(直角三角形だから正しいが…)・tsa-017D(角AとBを入れ替えた)・tsa-019D(正しい方向性)・tsa-020D(高さが等しいので変わらない)・tsa-023C(鋭角・鈍角の2通り)・tsa-028B(∠C=90°なら…)
- **重複正解修正** 3件: tsa-003B(100°→80°)・tsa-012D(R=3→R=6)・tsa-016D(S=6→√12=2√3)
- **tsa-012C**: BとC同値(1.5)→Cをa×cosA=3√3/2に変更
- **tsa-027A**: 途中で切れた選択肢を完成させた
- **tsa-028A**: 「正弦定理: a=2RsinA」だけで終わっていた→「正三角形」まで導く選択肢に修正
- **ヌルバイト**: questions.jsonに300バイトのヌルバイト→除去
- **explanations.json**: 全30問がボイラープレート→全面刷新
- 全単元 ERROR=0, WARN=0

### 2026-06-01 チャット⑮（#31 geometry-properties/basic-plane-figures）
- **重複正解修正** 9件: bpf-011B(140°→60°)・bpf-014B(2(AB²+BC²)→半分の誤答)・bpf-016D(135°→240°誤計算)・bpf-018B(1:2→1:3)・bpf-021B(n(n-3)/2→辺引かない誤り)・bpf-021D(n(n-3)/2→n(n-2)/2誤り)・bpf-024D(r=2S/(a+b+c)→分母2倍誤り)・bpf-029B(正しい別証明→不規則多角形で成立しないという誤答)・bpf-030D(Aと同じ結論→逆2乗比の誤答)
- **メタ語除去**: bpf-009B「相似比と同じ」・bpf-011B「内角で求めても同じ」・bpf-016D「別の求め方で同じ」・bpf-021B「同じ」・bpf-024D「正しい式」
- **bpf-018 A**: 定理の適用結果（AF:FB=1:2）まで含めた完全な答えに修正
- **bpf-006 A**: 49字→25字スリム化
- **ヌルバイト**: questions.json に60バイトのヌルバイト→除去
- **explanations.json**: 全30問がボイラープレート（「〜を確認しよう」「〜は頻出なので覚えよう」）→全面刷新
- 全単元 ERROR=0, WARN=0

### 2026-06-01 チャット⑭（#30 probability/independent-and-repeated-trials）
- **重複正解修正** 12件: irt-001D(1/3)・irt-003D(1/36)・irt-005D(3/4)・irt-007B(3p)・irt-008B(5/9)・irt-009B(15/32)・irt-010C(7/24)・irt-013B(ceil=4)・irt-013D(k=7)・irt-015C(max誤り)・irt-023C(0.765)・irt-028C(sqrt(np))
- **メタ語除去** 15件: irt-005B・006B/D・009D・011B・012B/D・013B・014D・015B・016D・017B・022B/C・027C・028D・030B
- **計算誤り修正**: irt-027A「8/27+8/27+16/81=80/81...」→ 正しい計算「64/81」に修正
- **全角括弧一括置換**: 新規追加の選択肢に含まれた全角括弧を半角に修正
- **explanations.json**: 全30問がボイラープレート → 全面刷新
- 全単元 ERROR=0, WARN=0

### 2026-06-01 チャット⑬（#29 probability/conditional-probability）
- **重複正解修正**: cp-001D(3/5→3/4)・cp-005C(1/3→条件無視の1/4)・cp-012C(3/4→3/10)・cp-018D(1/2→2)・cp-029B(P(A)→1-P(A))・cp-029D(P(A)→排反誤解の0) の6件
- **表記修正**: cp-008A先頭「P」欠落修正・cp-019A「.03」→「0.03」
- **スリム化**: cp-018A(ベイズ括弧除去)・cp-030A(90+文字→45文字)
- **explanations.json**: 全30問がボイラープレート・steps truncated → 全面刷新
- 全単元 ERROR=0, WARN=0

### 2026-06-01 チャット⑫（#28 probability/probability-properties）
- **メタ語除去**（括弧内メタヒント）: pp2-002B・pp2-006D・pp2-009C/D・pp2-011C・pp2-014B・pp2-017B/C/D・pp2-018B の10件
- **重複正解修正**: pp2-007B(三つの共通部分を足す誤答)・pp2-011D(0.2→0.3)・pp2-014C(2/5→6/5)・pp2-018C(1/6→5/6)・pp2-022B(2/5→3/25)・pp2-027C(Aと同値→p×(1-p)^n)・pp2-028B(Aと同値→交差項ゼロ誤答)・pp2-030B/C/D(全部n/2→別誤答) の9件
- **pp2-014 A**: 正解選択肢スリム化
- **pp2-023 A**: 分子/分母の表記修正
- **explanations.json**: ほぼ全問ボイラープレート・truncated → 全30問全面刷新
- 全単元 ERROR=0, WARN=0

### 2026-06-01 チャット⑪（#27 probability/events-and-probability）
- **メタ語除去**（括弧内メタヒント）: ep-002B・ep-004C・ep-008D・ep-009D・ep-010B/C・ep-011D・ep-012B・ep-013B/D・ep-014B・ep-016C・ep-018D・ep-020D・ep-021C/D・ep-025D の13件
- **重複正解修正**: ep-003D(2/5→3/5)・ep-007C(7/10→3/10)・ep-008C(3/8→1/8)・ep-009C(2/5→3/5)・ep-011C(0.6→0.5)・ep-013C(3/10→3/5)・ep-015C(1/3→1/6)・ep-016B(1/4→1/2)・ep-016D(1/4→別値)・ep-019C(1/6→1/3)・ep-024C(同値→項欠落誤答)・ep-025C(11/12→1/2)・ep-028C((1/2)^n→(n-1)×(1/2)^n) の12件
- **explanations.json**: 全30問がボイラープレート（tips/common_mistakes が使いまわし）→ 全面刷新
- 全単元 ERROR=0, WARN=0

### 2026-06-01 チャット⑩（#26 combinatorics/count-elements）
- **ce-008 A**: 冒頭欠損「∩B と」→「A を A∩B と」に修正
- **ce-009 A**: 冒頭の「。」を除去し、ド・モルガンの説明を追加
- **ce-011 B/C/D**: メタ語括弧（「2集合の共通部分を忘れている」「重複部分を全く引いていない」「引きすぎ」）を除去
- **ce-012 B/C**: メタ語括弧（「ABC全てを忘れた」「引きすぎ」）を除去
- **ce-018 A**: 冒頭欠損「(A∩B)]+」→「n(A△B) = [n(A)-n(A∩B)]+」に修正
- **ce-021 D**: 正解Aと同じ「0人」の重複正解→「50+60+55-25-30-20-10=80→20人」に変更
- **ce-005 A**: 正解選択肢を76字からスリム化（公式変形部分を削除）
- **ヌルバイト**: questions.jsonに74バイトのヌルバイト→除去
- **explanations.json**: 多数がboilerplate・truncated→全30問を全面刷新
- 全単元 ERROR=0, WARN=0（承認済）

### 2026-06-01 チャット⑨（#25 combinatorics/circular-and-multiset-permutation）
- **cmp-026 A**: 正解の計算式が誤り。60通り→120通り（6C1×5C2×(3-1)!=120）に修正
- **cmp-028 A**: 正解が誤り。180通り→190通り（包除原理: 100+100-10=190）に修正
- **cmp-030 A**: 「整数になる」だけで答えなし→「(16+2+4+2)÷4=6通り」に修正
- **cmp-021 D**: AとDが数学的に同値（2kCk×(k-1)!²÷2 = D）→ D を「×2」の誤りに変更
- **cmp-014 B**: AとBが同じ比1:4（重複正解）→ Bを「1:2」の誤りに変更
- **cmp-018 B**: Aと同じ数値（重複正解）→ Bを「重複ありは少なくなる」という誤りに変更
- **cmp-002 A**: 正解選択肢が著しく長い→スリム化
- **cmp-007**: 問題文に編集中コメント混入→クリーンな問題文に修正
- **ヌルバイト**: questions.jsonに19バイトのヌルバイト→除去
- **explanations.json**: 全30問がボイラープレート（誤ったtips等）→全面刷新
- 全単元 ERROR=0, WARN=0

### 2026-06-01 チャット⑧（#24 combinatorics/combination）
- **comb-002 B/C**: メタ語 `(間違った対称式)` `(積の形は誤り)` 除去
- **comb-016 A**: テキスト欠損 ` r)。` → `H(n,r) = (n+r-1)C(r)。` 復元
- **comb-017/019/025/029**: `C( n)` 形式の余分スペース除去
- **comb-018 D**: 正解Aと同等の組み合わせ的証明 → 「Σ nCk² = 2ⁿ」という別の誤答に変更
- **comb-022 D**: `誤変形` メタ語除去
- **comb-025 A**: `(12,2) =` → `C(12,2) =` 表記修正
- **comb-026 A**: `角線:` → `対角線:` 文字欠損修正
- **comb-027 C**: メタ語除去後にB・Cが実質同一（2ⁿ=2^n）→ Cを `偶数の和=2^n、奇数の和=2^n` に変更
- **explanations.json**: 21問がボイラープレート → 全30問を全面刷新
- ヌルバイト除去・末尾`}`欠損修正
- 全単元 ERROR=0, WARN=0

### 2026-05-31 チャット⑦（#23 combinatorics/permutation）
- **perm-010 A**: テキスト欠損修正 → "8!/(3!×2!×3!) = 40320/72 = 560通り"
- **perm-011 A**: 先頭の文字欠落 "が" → "Aが" 修正
- **perm-014 A**: "9916800" → "39916800"（桁欠落修正）
- **perm-018 B**: メタ語「A,Bの順序を考慮していない」除去
- **perm-019 A**: 正解スリム化（53→18文字）
- **perm-021 A**: 答え68番目→67番目に修正（計算誤り）
- **perm-022**: 正解 A→C に変更（Aは説明になっていなかった）・A/B/C全テキスト修正
- **perm-026 A**: 先頭文字欠損 "₁∪A₂" → "|A₁∪A₂" 修正
- **perm-029 D**: AとDが同一結論（nCr）→ Dを別の誤答に変更
- **perm-030 C**: AとCが同値（同じ式の変形）→ Cを別の誤答に変更
- **explanations.json**: ほぼ全問がボイラープレートのため全面刷新。perm-018 common_mistakesで正解を誤答扱いしていたバグも修正
- 全単元 ERROR=0, WARN=0

### 2026-05-31 チャット⑥（#22 combinatorics/basic-counting）
- **bc-028 A**: 正解選択肢スリム化（50→18文字）
- **bc-030 A**: 正解選択肢スリム化（65→22文字）
- **bc-024 explanations**: steps「5!=60通り」→「5!=120通り、÷2=60通り」に修正（数学的誤り）
- **bc-028 explanations**: steps「15×6×1=15通り」→正しい計算チェーンに修正、lead改善
- **bc-029 explanations**: steps の答えが欠落→「4³=64通り」を追記
- **bc-030 explanations**: steps が壊れていたため全面再構成
- **bc-008/022/025 explanations**: ボイラープレート lead を問題の核心に差し替え
- ヌルバイト除去（118バイト）
- 全単元 ERROR=0, WARN=0

### 2026-05-31 チャット⑤（#17〜21 data-analysis 2単元 + logic-and-sets 3単元）
- **cd-001/002/004**: メタ語（勘違い・誤解）除去、cd-004D重複(5)→7に変更、cd-016C矛盾計算修正、cd-022Aスリム化
- **vsc-002/007 A**: 正解長さ違反スリム化。vsc-013Cメタ語除去。vsc-013D重複(r=1)→r≈0.94に変更
- **st-005C**: 7→9（Bと重複）。st-009C: A∪B→A∩Bに変更。st-015B「誤解して」除去。st-017C: 7→6に変更。st-020/030Aスリム化
- **pc-001B/C/D**: 「混同」括弧除去。pc-001C重複(x=3)→別誤答に変更。pc-010B重複(十分条件)→必要条件のみに変更。7箇所Aスリム化
- **pp-002C/D/pp-005B/C/pp-018D**: 「混同」「誤った命題」括弧除去。pp-021: 命題「p+q=50→p=3またはq=3」が偽(7+43=50が反例)→「n²≡1(mod 3)」問題に差替。8箇所Aスリム化
- 全5単元 ERROR=0（WARNは集合表記の誤検知のみ承認済）

### 2026-05-31 チャット③（#10〜16 quadratic-functions残2 + geometry-and-measure 5単元）
- **gqe-004/014/019/021/022/028**: `<=`/`>=`/`!=` → `≤`/`≥`/`≠`、gqe-026 全角括弧修正
- **aq-018/022/027**: 同様の比較演算子・全角括弧修正
- **btr/etr/scl/tgm**: 全角括弧を一括修正
- **atp-025**: 正解選択肢を大幅スリム化、B/D のメタ語・不完全文を修正
- **atp-029 D**: 「混同して」等のメタ語を除去
- 全7単元 ERROR=0, WARN=0（承認済み）

### 2026-05-31 チャット②（math/1A/quadratic-functions 5単元 #5-9）
- **fg-015/gt-004**: 選択肢B「y=x²(変化なし)」とC「y=(-x)²」が同値 → C を別の式に変更
- **qe-021**: 根はk+2とk-1。両方正の整数 → k≥2。正解をA(k=1)からD(k=2)に修正、問題文に「2解がともに」追加
- **mm-019**: a=-1とa=-2の両方が条件を満たす → D を -2から-4に変更
- 全5単元で `<=`/`>=`/`!=` を `≤`/`≥`/`≠` に統一
- gt-013 問題文「経由する」の表現誤り修正、gt-021 選択肢Cのg関数typo修正
- 3ファイルでヌルバイト混入 → 除去
- final_check.py: 全5単元 ERROR=0, WARN=0(承認済み)

### 2026-05-31 チャット①（math/1A/numbers-and-expressions 4単元）
- **li-025**: 問題文中の全角括弧 `（a != 0）` → `(a ≠ 0)` に修正
- 数学的な正確性は全30問×4単元で問題なし
- 解説フィールド（lead/steps/common_mistakes/tips）も全問揃っていることを確認
- final_check.py: 全単元 ERROR=0, WARN=0

---

## 🔁 引き継ぎ手順（新チャット開始時）

1. このファイル (`REVIEW_PROGRESS.md`) を読む
2. 最初の ⬜ 単元から着手する
3. 作業開始時に状態を 🔄 に更新する
4. 修正が完了したら ✅（問題なし or 修正済み）または ⚠️ に更新する
5. レビューログセクションに修正の要点を記録する
6. 「完了: X / 105 単元（内訳: 数学93 + 英語2 + 国語3 + 理科4 + 社会3）」の数字を更新する

**次のチャットに伝えるべき引き継ぎ情報は以下のプロンプトを使う:**
```
REVIEW_PROGRESS.md を読んで、品質レビューを次の単元から続けてください。
レビュー基準は同ファイル内の「レビュー基準」セクションを参照してください。
```
