const mongoose = require('mongoose')
const caseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    premise: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      required: true,
    },
    story: {
      type: String,
      required: true,
    },
    suspects: [
      {
        name: String,
        description: String,
        id: String,
      },
    ],
    clues: [
      {
        id: String,
        description: String,
        discovered: {
          type: Boolean,
          default: false,
        },
      },
    ],
    hints: [{ type: String }],
    culpritId: {
      type: String,
      required: true,
      select: false,
    },
    solutionExplanation: {
      type: String,
      required: true,
      select: false,
    },
    hintsUsed: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['investigating', 'completed'],
      default: 'investigating',
    },
    accusedSuspectId: {
      type: String,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Case', caseSchema)