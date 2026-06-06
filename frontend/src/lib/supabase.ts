/**
 * Supabase クライアント初期化
 * ── このファイルが唯一の Supabase 接続口です ──
 * 他のファイルでは必ずここからインポートして使用してください。
 * 直接 createClient() を呼び出すことは禁止です。
 */
import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '環境変数 VITE_SUPABASE_URL と VITE_SUPABASE_ANON_KEY が設定されていません。' +
    '.env.local を確認してください。'
  )
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
