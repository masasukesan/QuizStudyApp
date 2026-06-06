#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
final_check.py
questions.json / explanations.json の最終品質チェックスクリプト

チェック項目:
  1. 選択肢テキストに全角括弧が含まれていないか          [ERROR]
  2. 選択肢テキストが重複していないか                    [ERROR]
  3. 正解と同じ最終値を持つ誤答がないか（重複解）         [ERROR]
  4. 選択肢・解説に A/B/C/D ラベル参照がないか           [ERROR]
  5. 選択肢・解説にメタ語が含まれていないか               [ERROR]
  6. 選択肢にメタキーワードが含まれていないか             [WARN]
  7. 問題数が structure.json の questionCount と一致するか [WARN]
  8. 難易度バランスが basic/standard/exam 各10問か        [WARN]

合格したユニットは curriculum/quality_log.json に記録され、
次回以降の --path 一括実行時はスキップされる。

使い方:
  python tools/final_check.py
  python tools/final_check.py --path curriculum/math/2B/trigonometric-functions/trigonometric-graphs
  python tools/final_check.py --path curriculum/math/2B
  python tools/final_check.py --errors-only
  python tools/final_check.py --recheck   # 合格済みも再チェック
  python tools/final_check.py --approve-warns --path <unit>  # WARN を承認して合格記録
"""

import json, re, os, sys, argparse, datetime
from pathlib import Path

ROOT = Path(__file__).parent.parent
QUALITY_LOG = ROOT / "curriculum" / "quality_log.json"

# -----------------------------------------------------------------------
# チェック定義
# -----------------------------------------------------------------------

META_KEYWORDS = [
    "同じ答え", "同じ結果", "同じ内容", "同じ方法", "同じだが",
    "選択肢Aと同じ", "選択肢Bと同じ", "選択肢Cと同じ", "選択肢Dと同じ",
    "別アプローチ", "別の方法", "同じ答えだが", "結果は同じ",
    "同内容", "同じ手順", "同じ計算", "圧縮版",
]

META_WORDS = [
    "誤答", "と誤って", "誤りで", "誤り（", "誤算", "間違って適用",
    "間違えて", "と間違い", "誤用", "を誤り",
]

# A/B/C/D ラベル参照パターン
LABEL_REF_PATTERN = re.compile(
    r'選択肢[ABCD]|[ABCD]と同じ|[ABCD]はどちらも|[ABCD]・[ABCD]|'
    r'[ABCD]が正しい|[ABCD]は同|正解は[ABCD]|[ABCD]を選'
)

ZENKAKU_OPEN  = "（"
ZENKAKU_CLOSE = "）"


# -----------------------------------------------------------------------
# ユーティリティ
# -----------------------------------------------------------------------

def load_quality_log():
    if QUALITY_LOG.exists():
        try:
            return json.loads(QUALITY_LOG.read_text(encoding="utf-8"))
        except Exception:
            return []
    return []


def save_quality_log(log):
    QUALITY_LOG.parent.mkdir(parents=True, exist_ok=True)
    QUALITY_LOG.write_text(
        json.dumps(log, ensure_ascii=False, indent=2),
        encoding="utf-8"
    )


def is_passed(unit_rel_path, log):
    """quality_log.json に合格記録があるか"""
    s = str(unit_rel_path).replace("\\", "/")
    return any(entry["path"].replace("\\", "/") == s for entry in log)


def mark_passed(unit_rel_path, question_count, log, notes=""):
    """合格記録を追加（既存エントリは更新）"""
    s = str(unit_rel_path).replace("\\", "/")
    entry = {
        "path": s,
        "status": "passed",
        "checked_at": datetime.date.today().isoformat(),
        "question_count": question_count,
        "notes": notes,
    }
    log[:] = [e for e in log if e["path"].replace("\\", "/") != s]
    log.append(entry)


def extract_final_value(text):
    """テキストから最終的な数値・式を抽出する。
    日本語助詞で終わるトークン（解は、商は、余りは など）や
    関数名（sin、cos など）は無視する。
    """
    # 日本語助詞・語尾（説明語の末尾になる文字）
    JP_ENDINGS = ('は', 'が', 'を', 'に', 'で', 'も', 'と', 'の',
                  'へ', 'から', 'まで', 'より', 'する', 'ある', 'いる',
                  'なる', 'れる', 'られる', 'ない', 'ます', 'した')
    # 独立した関数名（後ろに引数が続くため最終値ではない）
    FUNC_NAMES = {'sin', 'cos', 'tan', 'log', 'ln', 'exp', 'lim',
                  'sec', 'csc', 'cot', 'sinh', 'cosh', 'tanh'}

    tokens = re.findall(r'[→=]\s*([^\s,。\n]+)', text)
    valid = []
    for t in tokens:
        if not t:
            continue
        # 関数名のみのトークンを除外
        if t in FUNC_NAMES:
            continue
        # 日本語語尾で終わるトークンを除外（説明語）
        if any(t.endswith(e) for e in JP_ENDINGS):
            continue
        # コロン終わり（ラベル: 「3解:」など）を除外
        if t.endswith(':') or t.endswith('：'):
            continue
        valid.append(t)
    return valid[-1] if valid else None


# -----------------------------------------------------------------------
# ファイル単位のチェック
# -----------------------------------------------------------------------

def check_questions_file(path):
    errors, warns = [], []
    try:
        raw = Path(path).read_text(encoding="utf-8").strip()
        if not raw:
            return errors, warns, []
        data = json.loads(raw)
    except Exception as e:
        errors.append({"file": str(path), "id": "?", "choice": "-",
                        "msg": "JSON parse error: {}".format(e)})
        return errors, warns, []

    questions = data if isinstance(data, list) else data.get("questions", [])
    rel = str(Path(path).relative_to(ROOT))

    for q in questions:
        qid = q.get("id", "?")
        choices = q.get("choices", [])

        seen_text  = {}
        seen_value = {}
        correct_label = q.get("correct", "")

        correct_value = None
        for c in choices:
            if c.get("label", "") == correct_label:
                correct_value = extract_final_value(c.get("text", ""))

        for c in choices:
            label = c.get("label", "?")
            text  = c.get("text", "")
            loc   = "{} [{}] 選択肢{}".format(rel, qid, label)

            # 1. 全角括弧
            if ZENKAKU_OPEN in text or ZENKAKU_CLOSE in text:
                errors.append({"file": rel, "id": qid, "choice": label,
                                "msg": "全角括弧が含まれています",
                                "text": text[:100]})

            # 2. テキスト重複
            if text in seen_text:
                errors.append({"file": rel, "id": qid, "choice": label,
                                "msg": "選択肢{} と全く同じテキストです".format(seen_text[text]),
                                "text": text[:100]})
            else:
                seen_text[text] = label

            # 3. 重複解（正解と同じ最終値の誤答）
            val = extract_final_value(text)
            if val and len(val) >= 1:
                if label != correct_label and val == correct_value:
                    errors.append({"file": rel, "id": qid, "choice": label,
                                    "msg": "正解（{}）と同じ最終値 '{}' を持つ誤答です".format(
                                        correct_label, val),
                                    "text": text[:100]})
                if val in seen_value and seen_value[val] != label:
                    warns.append({"file": rel, "id": qid, "choice": label,
                                   "msg": "選択肢{} と最終値 '{}' が一致する可能性".format(
                                       seen_value[val], val),
                                   "text": text[:100]})
                else:
                    seen_value[val] = label

            # 4. A/B/C/D ラベル参照
            if LABEL_REF_PATTERN.search(text):
                errors.append({"file": rel, "id": qid, "choice": label,
                                "msg": "選択肢テキストに A/B/C/D ラベル参照が含まれています",
                                "text": text[:100]})

            # 5. メタ語
            for w in META_WORDS:
                if w in text:
                    errors.append({"file": rel, "id": qid, "choice": label,
                                    "msg": "選択肢テキストにメタ語 '{}' が含まれています".format(w),
                                    "text": text[:100]})
                    break

            # 6. メタキーワード（WARN）
            for kw in META_KEYWORDS:
                if kw in text:
                    warns.append({"file": rel, "id": qid, "choice": label,
                                   "msg": "メタキーワード '{}' が含まれています".format(kw),
                                   "text": text[:100]})
                    break

    return errors, warns, questions


def check_explanations_file(path):
    errors = []
    try:
        raw = Path(path).read_text(encoding="utf-8").strip()
        if not raw:
            return errors
        data = json.loads(raw)
    except Exception:
        return errors

    items = data if isinstance(data, list) else data.get("explanations", [])
    rel = str(Path(path).relative_to(ROOT))

    for item in items:
        qid = item.get("id", "?")
        # 解説テキスト全体をチェック
        text_parts = []
        if "reasoning_tags" in item:
            for tag in item["reasoning_tags"]:
                text_parts.append(tag.get("content", ""))
        if "explanation" in item:
            text_parts.append(str(item["explanation"]))
        if "common_mistakes" in item:
            for m in item["common_mistakes"]:
                text_parts.append(str(m))

        full_text = "\n".join(text_parts)

        # 4. A/B/C/D ラベル参照チェック（解説内）
        for match in LABEL_REF_PATTERN.finditer(full_text):
            # コンテキストを取得
            start = max(0, match.start() - 20)
            end   = min(len(full_text), match.end() + 20)
            errors.append({
                "file": rel, "id": qid, "choice": "-",
                "msg": "解説に A/B/C/D ラベル参照 '{}' が含まれています".format(match.group()),
                "text": full_text[start:end],
            })

    return errors


def check_unit(unit_path):
    """ユニットディレクトリをチェックし (errors, warns, question_count) を返す"""
    unit = Path(unit_path)
    all_errors, all_warns = [], []
    question_count = 0

    q_file = unit / "questions.json"
    if q_file.exists():
        e, w, questions = check_questions_file(q_file)
        all_errors.extend(e)
        all_warns.extend(w)
        question_count = len(questions)

        # 7. 問題数チェック
        s_file = unit / "structure.json"
        if s_file.exists():
            try:
                s_data = json.loads(s_file.read_text(encoding="utf-8"))
                expected = s_data.get("questionCount", 0)
                if expected > 0 and question_count != expected:
                    all_warns.append({
                        "file": str(q_file.relative_to(ROOT)),
                        "id": "-", "choice": "-",
                        "msg": "問題数 {} が structure.json の questionCount {} と不一致".format(
                            question_count, expected),
                    })
            except Exception:
                pass

        # 8. 難易度バランスチェック
        if questions:
            diff_count = {"basic": 0, "standard": 0, "exam": 0}
            for q in questions:
                d = q.get("difficulty", "")
                if d in diff_count:
                    diff_count[d] += 1
            for d, cnt in diff_count.items():
                if cnt != 10:
                    all_warns.append({
                        "file": str(q_file.relative_to(ROOT)),
                        "id": "-", "choice": "-",
                        "msg": "難易度 '{}' の問題数が {} 問（期待値: 10）".format(d, cnt),
                    })

    ex_file = unit / "explanations.json"
    if ex_file.exists():
        e = check_explanations_file(ex_file)
        all_errors.extend(e)

    return all_errors, all_warns, question_count


# -----------------------------------------------------------------------
# メイン
# -----------------------------------------------------------------------

def find_units(base):
    """questions.json を持つディレクトリをユニットとみなして列挙"""
    units = set()
    for f in Path(base).rglob("questions.json"):
        units.add(f.parent)
    return sorted(units)


def main():
    parser = argparse.ArgumentParser(description="Final quality check for questions.json")
    parser.add_argument("--path", default="curriculum",
                        help="チェック対象パス（ROOT からの相対 or 絶対）")
    parser.add_argument("--errors-only", action="store_true",
                        help="ERROR のみ表示（WARN を抑制）")
    parser.add_argument("--recheck", action="store_true",
                        help="合格済みユニットも再チェックする")
    parser.add_argument("--approve-warns", action="store_true",
                        help="WARN を承認扱いにして合格記録を書き込む")
    args = parser.parse_args()

    target = Path(args.path) if Path(args.path).is_absolute() else ROOT / args.path
    if not target.exists():
        print("パスが見つかりません: {}".format(target))
        sys.exit(1)

    # ユニットか直接指定か判断
    if (target / "questions.json").exists():
        units = [target]
    else:
        units = find_units(target)

    if not units:
        print("questions.json が見つかりませんでした: {}".format(target))
        sys.exit(1)

    log = load_quality_log()
    total_errors = 0
    total_warns  = 0
    skipped      = 0
    passed_now   = []

    for unit in units:
        rel = str(unit.relative_to(ROOT)).replace("\\", "/")

        if not args.recheck and is_passed(rel, log):
            skipped += 1
            continue

        errors, warns, q_count = check_unit(unit)

        has_error = len(errors) > 0
        has_warn  = len(warns) > 0

        if not has_error and (not has_warn or args.approve_warns):
            mark_passed(rel, q_count, log)
            passed_now.append(rel)
            print("[PASS] {}  ({} 問)".format(rel, q_count))
        else:
            if has_error:
                print("\n[FAIL] {}".format(rel))
                for e in errors:
                    print("  ERROR [{}] 選択肢{}: {}".format(e["id"], e["choice"], e["msg"]))
                    if "text" in e:
                        print("    => {}".format(e["text"]))
            if has_warn and not args.errors_only:
                if not has_error:
                    print("\n[WARN] {}".format(rel))
                for w in warns:
                    print("  WARN  [{}] 選択肢{}: {}".format(w["id"], w["choice"], w["msg"]))
                    if "text" in w:
                        print("    => {}".format(w["text"]))

        total_errors += len(errors)
        total_warns  += len(warns)

    # 合格記録を保存
    if passed_now:
        save_quality_log(log)

    print("\n" + "="*60)
    print("チェック完了")
    print("  合格（今回）: {} ユニット".format(len(passed_now)))
    print("  スキップ（合格済み）: {} ユニット".format(skipped))
    print("  ERROR 合計: {}".format(total_errors))
    print("  WARN  合計: {}".format(total_warns))

    if passed_now:
        print("\n合格記録を {} に保存しました。".format(QUALITY_LOG.relative_to(ROOT)))

    if total_errors > 0:
        print("\nERROR を修正してから再実行してください。")
        sys.exit(1)
    elif total_warns > 0 and not args.approve_warns:
        print("\nWARN を確認してください。問題なければ --approve-warns を付けて再実行。")
        sys.exit(0)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
