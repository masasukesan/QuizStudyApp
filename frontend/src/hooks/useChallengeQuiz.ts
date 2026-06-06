/**
 * useChallengeQuiz — チャレンジモードの問題ロードユーティリティ
 *
 * 弱点克服（weakpoint）: 正答率の低い単元からランダム10問
 * 小さな共テ（minikyotei）: 全単元からランダム10問
 */
import type { LearningStats } from '../types/database'

const ALL_SUBJECTS = ['math', 'english', 'japanese', 'science', 'social']
const TOTAL_CHALLENGE_QUESTIONS = 10

/* ── チャレンジモード用問題型（subject / subunit が必須） ── */
export interface ChallengeQuestion {
  id: string
  subject: string
  unit: string
  subunit: string
  difficulty: 'basic' | 'standard' | 'exam'
  question: string
  choices: { label: string; text: string }[]
  correct: string
}

type RawQuestion = {
  id: string
  unit?: string
  difficulty: 'basic' | 'standard' | 'exam'
  question: string
  choices: { label: string; text: string }[]
  correct: string
}

type ManifestEntry = {
  subunit: string
  path: string
  questionCount: number
}

type Manifest = {
  entries?: ManifestEntry[]
}

type QuestionsFile = RawQuestion[] | { questions?: RawQuestion[] }

/* ── 単一パスから問題を取得 ── */
async function fetchQuestionsFromEntry(
  subject: string,
  path: string,
  subunit: string
): Promise<ChallengeQuestion[]> {
  try {
    const res = await fetch(`/curriculum/${subject}/${path}/questions.json`)
    if (!res.ok) return []
    const data = (await res.json()) as QuestionsFile
    const rawQ: RawQuestion[] = Array.isArray(data)
      ? data
      : ((data as { questions?: RawQuestion[] }).questions ?? [])

    const pathParts = path.split('/').filter(Boolean)
    // path = "1A/unit/subunit" → unit = pathParts[1], fallback pathParts[0]
    const unitSlug = pathParts.length >= 2 ? (pathParts[1] ?? pathParts[0] ?? '') : (pathParts[0] ?? '')

    return rawQ.map(q => ({
      ...q,
      subject,
      unit: unitSlug,
      subunit,
    }))
  } catch {
    return []
  }
}

/* ══════════════════════════════════════════════════
   弱点克服：正答率の低い単元からランダム10問
   ══════════════════════════════════════════════════ */
export async function loadWeakPointQuestions(
  stats: LearningStats[]
): Promise<ChallengeQuestion[]> {
  /* 試行3回以上の単元を正答率の低い順に最大5件 */
  const weakUnits = [...stats]
    .filter(s => s.attempts >= 3)
    .sort((a, b) => (a.correct / a.attempts) - (b.correct / b.attempts))
    .slice(0, 5)

  if (weakUnits.length === 0) return []

  const allQuestions: ChallengeQuestion[] = []

  for (const unit of weakUnits) {
    try {
      const res = await fetch(`/curriculum/${unit.subject}/manifest.json`)
      if (!res.ok) continue
      const manifest = (await res.json()) as Manifest
      const entry = (manifest.entries ?? []).find(e => e.subunit === unit.subunit)
      if (!entry || entry.questionCount === 0) continue
      const questions = await fetchQuestionsFromEntry(unit.subject, entry.path, unit.subunit)
      allQuestions.push(...questions)
    } catch {
      continue
    }
  }

  /* シャッフルして10問選択 */
  return [...allQuestions].sort(() => Math.random() - 0.5).slice(0, TOTAL_CHALLENGE_QUESTIONS)
}

/* ══════════════════════════════════════════════════
   小さな共テ：全単元からランダム10問
   ══════════════════════════════════════════════════ */
export async function loadMiniKyoteiQuestions(): Promise<ChallengeQuestion[]> {
  const allEntries: { subject: string; path: string; subunit: string }[] = []

  for (const subject of ALL_SUBJECTS) {
    try {
      const res = await fetch(`/curriculum/${subject}/manifest.json`)
      if (!res.ok) continue
      const manifest = (await res.json()) as Manifest
      for (const entry of manifest.entries ?? []) {
        if (entry.questionCount > 0) {
          allEntries.push({ subject, path: entry.path, subunit: entry.subunit })
        }
      }
    } catch {
      continue
    }
  }

  if (allEntries.length === 0) return []

  /* ランダムに最大10単元を選択して問題を集める */
  const shuffledEntries = [...allEntries]
    .sort(() => Math.random() - 0.5)
    .slice(0, 10)

  const allQuestions: ChallengeQuestion[] = []
  for (const { subject, path, subunit } of shuffledEntries) {
    const questions = await fetchQuestionsFromEntry(subject, path, subunit)
    allQuestions.push(...questions)
  }

  return [...allQuestions].sort(() => Math.random() - 0.5).slice(0, TOTAL_CHALLENGE_QUESTIONS)
}
