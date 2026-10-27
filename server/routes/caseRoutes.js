
const express = require('express')
const router = express.Router()
const Case = require('../models/Case')
const generateMystery = require('../generateMystery')

// Test route
router.get('/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'Case routes are working!',
  })
})

// Create an AI-generated mystery and save it
router.post('/', async (req, res) => {
  try {
    const { premise, difficulty } = req.body

    if (
      typeof premise !== 'string' ||
      premise.trim().length < 20
    ) {
      return res.status(400).json({
        message: 'Please provide a scenario with at least 20 characters.',
      })
    }

    if (!['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      return res.status(400).json({
        message: 'Difficulty must be Easy, Medium, or Hard.',
      })
    }

    const mystery = await generateMystery(premise.trim(), difficulty)

    const newCase = new Case({
      title: mystery.title,
      premise: premise.trim(),
      difficulty,
      story: mystery.story,
      suspects: mystery.suspects,
      clues: mystery.clues.map((clue) => ({
        ...clue,
        discovered: false,
      })),
      hints: mystery.hints,
      culpritId: mystery.culpritId,
      solutionExplanation: mystery.solutionExplanation,
    })

    await newCase.save()

    res.status(201).json({
      message: 'AI mystery created successfully!',
      caseId: newCase._id,
      title: newCase.title,
      story: newCase.story,
      suspects: newCase.suspects,
      clues: newCase.clues,
      difficulty: newCase.difficulty,
    })
  } catch (error) {
    console.error('Mystery creation failed:', error.message)

    res.status(500).json({
      message: 'Unable to create the mystery. Please try again.',
    })
  }
})

// Get a saved mystery without revealing its solution
router.get('/:id', async (req, res) => {
  try {
    const mysteryCase = await Case.findById(req.params.id)

    if (!mysteryCase) {
      return res.status(404).json({
        message: 'Mystery case not found.',
      })
    }

    res.json({
      caseId: mysteryCase._id,
      title: mysteryCase.title,
      premise: mysteryCase.premise,
      difficulty: mysteryCase.difficulty,
      story: mysteryCase.story,
      suspects: mysteryCase.suspects,
      clues: mysteryCase.clues,
      status: mysteryCase.status,
    })
  } catch (error) {
    res.status(400).json({
      message: 'Invalid case ID.',
    })
  }
})

/* Submit an accusation and calculate the final score */
router.post('/:id/accuse', async (req, res) => {
  try {
    const { suspectId, discoveredClueIds = [] } = req.body

    if (typeof suspectId !== 'string' || !suspectId.trim()) {
      return res.status(400).json({
        message: 'Please select a suspect to accuse.',
      })
    }

    if (
      !Array.isArray(discoveredClueIds) ||
      !discoveredClueIds.every((id) => typeof id === 'string')
    ) {
      return res.status(400).json({
        message: 'Invalid discovered clues.',
      })
    }

    const mysteryCase = await Case.findById(req.params.id).select(
      '+culpritId +solutionExplanation'
    )

    if (!mysteryCase) {
      return res.status(404).json({
        message: 'Mystery case not found.',
      })
    }

    if (mysteryCase.status === 'completed') {
      return res.status(400).json({
        message: 'This case has already been completed.',
      })
    }

    const validClueIds = new Set(
      mysteryCase.clues.map((clue) => clue.id)
    )

    const uniqueDiscoveredClues = [
      ...new Set(discoveredClueIds),
    ].filter((id) => validClueIds.has(id))

    const correct = suspectId === mysteryCase.culpritId

    const baseScore = {
      Easy: 100,
      Medium: 150,
      Hard: 200,
    }[mysteryCase.difficulty]

    const score = correct
      ? Math.max(0, baseScore + uniqueDiscoveredClues.length * 5 - mysteryCase.hintsUsed * 10)
      : 0

    mysteryCase.status = 'completed'
    mysteryCase.accusedSuspectId = suspectId
    mysteryCase.score = score

    await mysteryCase.save()

    res.json({
      correct,
      accusedSuspectId: suspectId,
      culpritId: mysteryCase.culpritId,
      solutionExplanation: mysteryCase.solutionExplanation,
      discoveredClues: uniqueDiscoveredClues.length,
      hintsUsed: mysteryCase.hintsUsed,
      score,
      message: correct
        ? 'Correct accusation! Case solved.'
        : 'Incorrect accusation. The case is closed.',
    })
  } catch (error) {
    console.error('Accusation failed:', error.message)

    res.status(500).json({
      message: 'Unable to submit accusation.',
    })
  }
})
module.exports = router
