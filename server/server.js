require('dns').setServers(['8.8.8.8'])
const express = require('express')
const cors = require('cors')
require('dotenv').config()
const mongoose = require('mongoose')
const caseRoutes = require('./routes/caseRoutes')
const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use('/api/cases', caseRoutes)

// Welcome route
app.get('/', (req, res) => {
  res.json({
    message: 'AI Mystery Room API is running!',
    status: 'success',
  })
})

// Health-check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Backend is healthy',
  })
})

// Start the server
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully!')

    app.listen(PORT, () => {
      console.log(`AI Mystery Room server running at http://localhost:${PORT}`)
    })
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message)
  })
