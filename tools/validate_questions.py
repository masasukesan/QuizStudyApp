#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
validate_questions.py
questions.json の品質チェックスクリプト

チェック項目:
  1. 選択肢テキストに全角括弧が含まれていないか
  2. 同一テキストの選択肢が重複していないか
  3. メタキーワード（同じ答え・別アプローチ等）が含まれていないか

使い方:
  python tools/validate_questions.py
  python tools/validate_questions.py --path curriculum/math/2B/sequences
  python tools/validate_questions.py --errors-only
"""

import json, re, os, sys, argparse
from pathlib import Path

ROOT = Path(__file__).parent.parent

META_KEYWORDS = [
    "同じ答え", "同じ結果", "同じ内容",
    "同じ方法", "同じだが",
    "選択肢Aと同じ", "選択肢Bと同じ",
    "選択肢Cと同じ", "選択肢Dと同じ",
    "別アプローチ", "別の方法",
    "同じ答えだが", "結果は同じ",
    "同内容", "同じ手順", "同じ計算",
    "圧縮版",
]

ZENKAKU_OPEN  = "（"
ZENKAKU_CLOSE = "）"


def find_question_files(base):
    return sorted(Path(base).rglob("questions.json"))


def extract_final_value(text):
    tokens = re.findall(r'[→=]\s*([^\s,。\n]+)', text)
    return tokens[-1] if tokens else None


def check_file(path):
    errors = []
    try:
        raw = Path(path).read_text(encoding="utf-8").strip()
        if not raw:
            return errors
        data = json.loads(raw)
    except Exception as e:
        errors.append({"level": "ERROR", "file": str(path), "msg": "JSON parse error: {}".format(e)})
        return errors

    questions = data if isinstance(data, list) else data.get("questions", [])
    rel = Path(path).relative_to(ROOT)

    for q in questions:
        qid = q.get("id", "?")
        choices = q.get("choices", [])
        loc = "{} [{}]".format(rel, qid)

        seen_text  = {}
        seen_value = {}

        for c in choices:
            label = c.get("label", "?")
            text  = c.get("text", "")

            # 1. 全角括弧チェック
            if ZENKAKU_OPEN in text or ZENKAKU_CLOSE in text:
                errors.append({
                    "level": "ERROR", "file": loc, "choice": label,
                    "msg": "choice {} contains full-width parentheses".format(label),
                    "text": text[:90],
                })

            # 3. メタキーワードチェック
            for kw in META_KEYWORDS:
                if kw in text:
                    errors.append({
                        "level": "WARN", "file": loc, "choice": label,
                        "msg": "choice {} contains meta-keyword: {}".format(label, kw),
                        "text": text[:90],
                    })
                    break

            # 2. テキスト重複チェック
            if text in seen_text:
                errors.append({
                    "level": "ERROR", "file": loc, "choice": label,
                    "msg": "choice {} is identical to {}".format(label, seen_text[text]),
                    "text": text[:90],
                })
            else:
                seen_text[text] = label

            # 最終値の重複ヒント
            val = extract_final_value(text)
            if val and len(val) >= 1:
                if val in seen_value:
                    errors.append({
                        "level": "WARN", "file": loc, "choice": label,
                        "msg": "choice {} may share final value '{}' with {}".format(label, val, seen_value[val]),
                        "text": text[:90],
                    })
                else:
                    seen_value[val] = label

    return errors


def main():
    parser = argparse.ArgumentParser(description="questions.json quality check")
    parser.add_argument("--path", default="curriculum")
    parser.add_argument("--errors-only", action="store_true")
    args = parser.parse_args()

    base = ROOT / args.path
    if not base.exists():
        print("Directory not found: {}".format(base))
        sys.exit(1)

    files = find_question_files(base)
    if not files:
        print("No questions.json found under: {}".format(base))
        sys.exit(1)

    all_errors = []
    for f in files:
        all_errors.extend(check_file(f))

    errors = [e for e in all_errors if e["level"] == "ERROR"]
    warns  = [e for e in all_errors if e["level"] == "WARN"]

    if not all_errors:
        print("[OK] All checks passed. No violations found.")
        sys.exit(0)

    if errors:
        print("\n[ERROR] {} issue(s) found:".format(len(errors)))
        for e in errors:
            print("  {} choice {}: {}".format(e["file"], e.get("choice","?"), e["msg"]))
            if "text" in e:
                print("    => {}".format(e["text"]))

    if warns and not args.errors_only:
        print("\n[WARN] {} warning(s):".format(len(warns)))
        for w in warns:
            print("  {} choice {}: {}".format(w["file"], w.get("choice","?"), w["msg"]))
            if "text" in w:
                print("    => {}".format(w["text"]))

    print("\nTotal: ERROR={}, WARN={}".format(len(errors), len(warns)))
    print("ERROR -> Fix required (no full-width parens, no duplicate answers)")
    print("WARN  -> Manual review recommended (meta-keywords or shared final value)")

    sys.exit(1 if errors else 0)


if __name__ == "__main__":
    main()
