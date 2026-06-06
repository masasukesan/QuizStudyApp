-- ============================================================
-- マイグレーション: national_stats に calculation_phase カラム追加
-- 作成日: 2026-05-31
-- 目的: 偏差値の算出フェーズ（仮想分布/移行期/実データ）を記録する
-- ============================================================

ALTER TABLE national_stats
  ADD COLUMN IF NOT EXISTS calculation_phase INTEGER NOT NULL DEFAULT 1
    CHECK (calculation_phase IN (1, 2, 3));

-- フェーズ定義:
--   1 = 仮想分布期 (total_users < 30): 仮想ベンチマーク分布で補完
--   2 = 移行期     (30 ≤ total_users < 100): ベイズ収縮（実データ + 仮想の加重平均）
--   3 = 実データ期 (total_users >= 100): 純粋な実データのみで計算

COMMENT ON COLUMN national_stats.calculation_phase IS
  '偏差値算出フェーズ: 1=仮想分布期(<30人), 2=移行期(30-99人), 3=実データ期(>=100人)';
