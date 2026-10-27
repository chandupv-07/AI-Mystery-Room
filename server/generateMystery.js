
const { GoogleGenAI } = require('@google/genai')

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
})

async function generateMystery(premise, difficulty) {
  const settings = {
    Easy: { suspects: 3, clues: 5, hints: 2 },
    Medium: { suspects: 4, clues: 7, hints: 3 },
    Hard: { suspects: 5, clues: 9, hints: 3 },
  }

  const selected = settings[difficulty]

  if (!selected) {
    throw new Error('Invalid difficulty. Choose Easy, Medium, or Hard.')
  }

  const prompt = `
You are an expert mystery writer and logical consistency checker.

Create a complete, fictional mystery investigation using this scenario:

${premise}

DIFFICULTY: ${difficulty}

EXACT COUNTS:
- Suspects: exactly ${selected.suspects}
- Clues: exactly ${selected.clues}
- Progressive hints: exactly ${selected.hints}

Return ONLY valid JSON using this structure:
{
  "title": "Short mystery title",
  "story": "Detailed mystery story",
  "suspects": [
    {
      "id": "suspect_1",
      "name": "Full name",
      "description": "Description and possible motive"
    }
  ],
  "clues": [
    {
      "id": "clue_1",
      "description": "Evidence the player can discover"
    }
  ],
  "hints": ["First hint", "Second hint"],
  "culpritId": "suspect_1",
  "solutionExplanation": "Explain the culprit's motive and how the clues prove it"
}

STRICT CONSISTENCY RULES:
1. Create the complete mystery before writing the final JSON.
2. Choose exactly ONE culprit from the listed suspects.
3. culpritId MUST exactly match the ID of that culprit.
4. Use unique IDs for every suspect and every clue.
5. The culprit's full name in solutionExplanation MUST exactly match
   the name of the suspect identified by culpritId.
6. Never introduce a different culprit in the solution explanation.
7. The story, suspect descriptions, and clues must all describe
   the SAME incident and the SAME set of suspects.
8. Every clue must be consistent with the story and the culprit.
9. The clues must collectively provide a logical way to identify
   the culprit. Do not rely on evidence that was never presented.
10. Each suspect's name and role must remain consistent everywhere.
11. Do not change suspect names or invent replacement suspects
    when writing the clues or solution explanation.
12. Hints must refer to the actual clues and help solve this case.
13. Keep the culprit and solution explanation secret from players
    until they submit their accusation.
14. Use the exact requested counts. Do not add extra suspects,
    clues, or hints.
15. Return JSON only. Do not include Markdown fences or commentary.

Before returning the JSON, internally verify that all names, IDs,
clues, hints, and the solution explanation are consistent.
`

  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: prompt,
  })

  if (!response.text || !response.text.trim()) {
    throw new Error('Gemini returned an empty mystery.')
  }

  const cleaned = response.text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')

  let mystery

  try {
    mystery = JSON.parse(cleaned)
  } catch {
    throw new Error('Gemini returned invalid JSON. Please try again.')
  }

  if (
    !mystery.title ||
    !mystery.story ||
    !Array.isArray(mystery.suspects) ||
    !Array.isArray(mystery.clues) ||
    !Array.isArray(mystery.hints) ||
    !mystery.culpritId ||
    !mystery.solutionExplanation
  ) {
    throw new Error('Gemini returned incomplete mystery data.')
  }

  if (
    mystery.suspects.length !== selected.suspects ||
    mystery.clues.length !== selected.clues ||
    mystery.hints.length !== selected.hints
  ) {
    throw new Error(
      'Gemini returned an incorrect number of suspects, clues, or hints.'
    )
  }

  // Validate suspect names, descriptions, and unique IDs.
  const suspectIds = new Set()
  const suspectNames = new Set()

  for (const suspect of mystery.suspects) {
    if (
      !suspect.id ||
      !suspect.name ||
      !suspect.description ||
      typeof suspect.id !== 'string' ||
      typeof suspect.name !== 'string' ||
      typeof suspect.description !== 'string'
    ) {
      throw new Error('A suspect is missing required information.')
    }

    if (suspectIds.has(suspect.id)) {
      throw new Error('Gemini returned duplicate suspect IDs.')
    }

    const normalizedName = suspect.name.trim().toLowerCase()

    if (suspectNames.has(normalizedName)) {
      throw new Error('Gemini returned duplicate suspect names.')
    }

    suspectIds.add(suspect.id)
    suspectNames.add(normalizedName)
  }

  // Ensure the culprit is one of the actual suspects.
  const culprit = mystery.suspects.find(
    (suspect) => suspect.id === mystery.culpritId
  )

  if (!culprit) {
    throw new Error('The culprit ID does not match any suspect.')
  }

  // Ensure the solution explicitly names the selected culprit.
  if (
    !mystery.solutionExplanation
      .toLowerCase()
      .includes(culprit.name.trim().toLowerCase())
  ) {
    throw new Error(
      'The solution does not identify the selected culprit correctly.'
    )
  }

  // Validate clue IDs and descriptions.
  const clueIds = new Set()

  for (const clue of mystery.clues) {
    if (
      !clue.id ||
      !clue.description ||
      typeof clue.id !== 'string' ||
      typeof clue.description !== 'string'
    ) {
      throw new Error('A clue is missing required information.')
    }

    if (clueIds.has(clue.id)) {
      throw new Error('Gemini returned duplicate clue IDs.')
    }

    clueIds.add(clue.id)
  }

  // Validate all hints.
  if (
    !mystery.hints.every(
      (hint) => typeof hint === 'string' && hint.trim().length > 0
    )
  ) {
    throw new Error('Gemini returned an invalid hint.')
  }

  return mystery
}

module.exports = generateMystery
