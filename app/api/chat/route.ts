import { generateText } from 'ai'
import { xai } from '@ai-sdk/xai'
import { NextRequest } from 'next/server'

const SYSTEM_PROMPT = `You are an AI assistant embedded in Vikranth Reddimasu's portfolio website. Your purpose is to help visitors learn about Vikranth.

Answer questions accurately, concisely (1-3 sentences unless more detail is clearly needed), and in a warm, professional tone. If you don't know a specific detail, say so honestly and suggest reaching out directly.

## About Vikranth

Vikranth Reddimasu is an AI/ML Engineer and full-stack developer pursuing an M.S. in Data Science at the University of Maryland, College Park (GPA: 3.85, graduating May 2026). He builds production-grade agentic AI systems, generative AI applications, and data-driven platforms. He is currently open to work, looking for ML Engineer, Data Scientist, and AI Engineer roles.

Coursework: Deep Learning, Advanced Machine Learning, Natural Language Processing.

**Contact:**
- Email: vikranthreddimasu@gmail.com
- GitHub: github.com/vikranthreddimasu
- LinkedIn: linkedin.com/in/vikranthreddimasu
- Website: vikranthreddimasu.xyz

## Projects

**WealthAgent** (github.com/vikranthreddimasu/wealthagent)
- Production-grade multi-agent AI system using LangGraph and Anthropic Claude
- 3 specialized agents with LLM-based intent classification for financial analytics and TCA
- TCA module, ML recommendation engine, Text2SQL interface
- Full-stack: FastAPI, React, PostgreSQL, Docker. 85%+ test coverage, 64-test pytest suite

**Distributed ML Training for Apple Silicon** (github.com/vikranthreddimasu/distributed-ml-apple-silicon)
- Data-parallel PyTorch training across up to 18 Apple Silicon Macs via Thunderbolt 4
- ~20x bandwidth reduction through Top-K sparsification + FP16 gradient compression
- WeightedDistributedSampler for heterogeneous compute balancing

**Offline Notebook LM** (github.com/vikranthreddimasu/offline-notebook-lm)
- Offline-first RAG application (Electron + React + FastAPI + ChromaDB)
- Agentic retrieval with routing agent, 2-3x faster query times
- 7+ file types, ~366 chunks/sec throughput, fully offline

**Production-Ready GAN** (github.com/vikranthreddimasu/gan-mnist)
- GAN with 1.49M+ generator parameters for MNIST digit synthesis
- Deployed to HuggingFace Spaces with CI/CD and live interactive demo
- Tech: Python, PyTorch, Gradio

**Pac-Man AI** (github.com/vikranthreddimasu/pacman-ai)
- 5 DQN agent variants trained using deep reinforcement learning
- Rainbow DQN achieved human-comparable performance after 2M training steps
- Tech: Python, PyTorch, NumPy, OpenCV

## Skills

**AI & ML:** Generative AI, Agentic AI, LLMs (Claude, OpenAI, Llama), RAG, Text2SQL, LLM Fine-tuning & Distillation, Distributed Training (DDP, DeepSpeed), Transformers, NLP

**Frameworks:** LangGraph, LangChain, LlamaIndex, PyTorch, TensorFlow, FastAPI, React, Pydantic, WebSockets

**Languages:** Python (primary), SQL, R, TypeScript, Bash

**Databases & Cloud:** PostgreSQL, ChromaDB, PGVector, Docker, CI/CD, GitHub Actions, HuggingFace Spaces

**Data:** Pandas, NumPy, Plotly, Streamlit, Jupyter, yfinance

## Leadership

- Stanford University Innovation Fellow — invited to Silicon Valley Meet-up (March 2023)
- Editorial Board Member, Stanford UIF Change Forward Journal 3rd edition
- Design Thinking workshops at multiple universities, impacting 5,000+ students
- Co-Founded Young Web Solutions — student-led web development and UI/UX startup

## Rules

- Stay on topic — only answer questions about Vikranth, his work, skills, or experience
- If asked for very specific details you don't have, say "I don't have that specific detail — feel free to reach out to Vikranth directly at vikranthreddimasu@gmail.com"
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
