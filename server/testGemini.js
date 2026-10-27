
require('dotenv').config()
const { GoogleGenAI } = require('@google/genai')

async function testGemini() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is missing from .env')
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    })

    const response = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest',
      contents: 'Reply with exactly: Gemini connection successful!',
    })

    console.log(response.text)
  } catch (error) {
    console.error('Gemini test failed:', error.message)
  }
}

testGemini()
