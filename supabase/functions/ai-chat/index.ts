// Supabase Edge Function: ai-chat
// OpenAI API へのプロキシ。APIキーをフロントエンドに露出させない。

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // CORS プリフライト
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userMessage, questionContext } = await req.json() as {
      userMessage: string
      questionContext: {
        question: string
        choices: { label: string; text: string }[]
        correct: string
        explanation: string
      }
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY')
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'OPENAI_API_KEY が設定されていません' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // システムプロンプト：問題文・正解・解説をコンテキストとして渡す
    const systemPrompt = `あなたは高校生向けの学習サポートAIです。
以下の問題について生徒から質問が来ています。中学生でも理解できる平易な言葉で、丁寧に答えてください。
数式はプレーンテキスト（²³などのUnicode）で表記し、LaTeXは使わないでください。
回答は200文字以内を目安に簡潔にまとめてください。

【問題】
${questionContext.question}

【選択肢】
${questionContext.choices.map(c => `${c.label}. ${c.text}`).join('\n')}

【正解】${questionContext.correct}

【解説】
${questionContext.explanation}`

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        max_tokens: 400,
        temperature: 0.5,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      return new Response(
        JSON.stringify({ error: `OpenAI エラー: ${err}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const data = await response.json() as {
      choices: { message: { content: string } }[]
    }
    const answer = data.choices[0]?.message?.content ?? '回答を取得できませんでした。'

    return new Response(
      JSON.stringify({ answer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
