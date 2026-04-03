import { generateText } from 'ai'
import { xai } from '@ai-sdk/xai'
import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `You are an AI assistant embedded in Vikranth Reddimasu's portfolio website. Your purpose is to help visitors learn about Vikranth.

Answer questions accurately, concisely (1-3 sentences unless more detail is clearly needed), and in a warm, professional tone. If you don't know a specific detail, say so honestly and suggest reaching out directly.

## About Vikranth

Vikranth Reddimasu is an ML Engineer and Data Scientist who builds AI systems that scale. He is currently open to work, looking for ML Engineer, Data Scientist, and AI Engineer roles.

**Contact:**
- Email: vikranthreddimasu@gmail.com
- GitHub: github.com/vikranthreddimasu
- LinkedIn: linkedin.com/in/vikranthreddimasu
- Website: vikranthreddimasu.xyz

## Projects

**Pac-Man AI** (github.com/vikranthreddimasu/pacman-ai)
- Trained 5 DQN agent variants to play Pac-Man using deep reinforcement learning
- Implements: Vanilla DQN, Double DQN, Dueling DQN, Prioritized Experience Replay (PER), Rainbow DQN
- Built a custom Pac-Man game engine with headless simulation mode for fast training
- Tech: Python, PyTorch, NumPy, OpenCV

## Skills

**ML/AI:** PyTorch, TensorFlow, scikit-learn, HuggingFace Transformers, LangChain, OpenAI API, Anthropic API, Reinforcement Learning, Computer Vision, NLP

**Languages:** Python (primary, 5+ years), SQL, TypeScript, R, Bash

**Data Engineering:** Pandas, NumPy, Apache Spark, Polars, Jupyter, dbt

**Frontend:** React, Next.js, Tailwind CSS, Framer Motion, TypeScript

**Cloud/MLOps:** AWS, Docker, Git, MLflow, Weights & Biases, FastAPI

## This Portfolio

Built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion. Features an interactive Clifford Strange Attractor canvas animation, a terminal interface (press / to open), this AI chat widget, and LLM-readable structured data at /llms.txt.

## Rules

- Stay on topic — only answer questions about Vikranth, his work, skills, or experience
- If asked for very specific details you don't have (exact GPA, specific work history details, etc.), say "I don't have that specific detail — feel free to reach out to Vikranth directly at vikranthreddimasu@gmail.com"
- Never fabricate information
- Keep responses brief and direct`

// Simple in-memory rate limiter (resets on redeploy)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  entry.count++
  return entry.count > RATE_LIMIT
}

function getClientIP(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
}

export async function POST(req: NextRequest) {
  if (!process.env.XAI_API_KEY) {
    return Response.json(
      { content: "AI chat isn't configured yet. Reach out directly at vikranthreddimasu@gmail.com!" },
      { status: 503 }
    )
  }

  const ip = getClientIP(req)
  if (isRateLimited(ip)) {
    return Response.json(
      { content: "Too many requests. Try again later or reach out at vikranthreddimasu@gmail.com" },
      { status: 429 }
    )
  }

  try {
    const body = await req.json()
    const { messages } = body

    // Input validation
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ content: "Invalid request." }, { status: 400 })
    }

    const lastMessage = messages[messages.length - 1]
    if (!lastMessage?.content || typeof lastMessage.content !== 'string' || lastMessage.content.length > 500) {
      return Response.json({ content: "Message too long or invalid." }, { status: 400 })
    }

    // Sanitize: only pass role and content to the model
    const sanitized = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' ? 'assistant' as const : 'user' as const,
      content: String(m.content).slice(0, 500),
    }))

    const { text } = await generateText({
      model: xai('grok-3-mini-fast'),
      system: SYSTEM_PROMPT,
      messages: sanitized,
      maxOutputTokens: 300,
    })

    return Response.json({ content: text })
  } catch (err) {
    console.error('Chat route error:', err)
    return Response.json(
      { content: "Something went wrong. Try reaching out at vikranthreddimasu@gmail.com" },
      { status: 500 }
    )
  }
}
