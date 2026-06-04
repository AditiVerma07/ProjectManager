const express = require('express')
const Groq = require('groq-sdk')
const { protect } = require('../middleware/auth')

const router = express.Router()
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

router.post('/', protect, async (req, res) => {
  try {
    const { messages } = req.body

    if (!messages || messages.length === 0) {
      return res.status(400).json({ success: false, message: 'No messages provided' })
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a helpful project management assistant. 
Your job is to help users plan tasks, suggest realistic deadlines, and create schedules.

When a user describes what they need to do, you should:
1. Break it down into clear tasks
2. Suggest a realistic deadline for each task
3. Give a simple schedule they can follow

When suggesting a task, always end your message with a structured suggestion in this format:
---TASK SUGGESTION---
Title: <task title>
Description: <short description>
Priority: <low/medium/high/critical>
Status: <todo/in_progress/backlog>
Due Date: <YYYY-MM-DD>
---END---

Keep your responses friendly, short and practical. Do not over explain.`
        },
        ...messages
      ],
      max_tokens: 1024,
    })

    const reply = response.choices[0]?.message?.content || 'Sorry, I could not generate a response.'
    res.json({ success: true, reply })

  } catch (err) {
    console.error('Groq error:', err.message)
    res.status(500).json({ success: false, message: 'AI service error: ' + err.message })
  }
})

module.exports = router