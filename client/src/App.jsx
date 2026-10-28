
import { useState } from 'react'

const API_BASE_URL = 'https://ai-mystery-room-ztkk.onrender.com'

function App() {
  const [showCreate, setShowCreate] = useState(false)
  const [premise, setPremise] = useState('')
  const [difficulty, setDifficulty] = useState('Easy')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mystery, setMystery] = useState(null)
  const [discoveredClues, setDiscoveredClues] = useState([])
  const [selectedSuspect, setSelectedSuspect] = useState('')
  const [accusation, setAccusation] = useState(null)
  const [accusing, setAccusing] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setMystery(null)
    setDiscoveredClues([])
    setSelectedSuspect('')
    setAccusation(null)
    setLoading(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/cases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ premise, difficulty }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not create the mystery.')
      }

      setMystery(data)
      setShowCreate(false)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the backend. Please try again in a moment.'
          : err.message
      )
    } finally {
      setLoading(false)
    }
  }

  async function handleAccusation() {
    if (!selectedSuspect || !mystery) {
      setError('Please select a suspect first.')
      return
    }

    setError('')
    setAccusing(true)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cases/${mystery.caseId}/accuse`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            suspectId: selectedSuspect,
            discoveredClueIds: discoveredClues,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not submit accusation.')
      }

      setAccusation(data)
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the backend. Please try again in a moment.'
          : err.message
      )
    } finally {
      setAccusing(false)
    }
  }

  function startNewMystery() {
    setMystery(null)
    setPremise('')
    setDifficulty('Easy')
    setDiscoveredClues([])
    setSelectedSuspect('')
    setAccusation(null)
    setError('')
    setShowCreate(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-[#09090f] text-white">
      <nav className="flex items-center justify-between border-b border-white/10 px-6 py-5 md:px-12">
        <a href="/" className="text-xl font-bold tracking-wide">
          <span className="text-purple-400">◆</span> MYSTERY ROOM
        </a>

        <span className="hidden text-sm text-gray-400 sm:block">
          Every clue tells a story.
        </span>

        <button
          onClick={() => setShowCreate(true)}
          className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold transition hover:bg-purple-500"
        >
          Start Investigating
        </button>
      </nav>

      <main className="mx-auto flex max-w-6xl flex-col items-center px-6 py-20 text-center md:py-28">
        <div className="mb-6 rounded-full border border-purple-400/30 bg-purple-400/10 px-4 py-2 text-sm text-purple-300">
          ✦ AI-POWERED MYSTERY EXPERIENCE
        </div>

        <h1 className="max-w-4xl text-5xl font-extrabold leading-tight tracking-tight md:text-7xl">
          Every Mystery
          <br />
          Has a <span className="text-purple-400">Secret.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-8 text-gray-400 md:text-lg">
          Step into a world of hidden clues, suspicious characters, and
          unsolved cases. Investigate the evidence, question your instincts,
          and discover the truth.
        </p>

        <button
          onClick={() => setShowCreate(true)}
          className="mt-9 rounded-xl bg-purple-600 px-8 py-4 font-bold shadow-lg shadow-purple-900/30 transition hover:-translate-y-1 hover:bg-purple-500"
        >
          Create Your Mystery <span className="ml-2">→</span>
        </button>

        <div className="mt-20 grid w-full gap-5 text-left md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-purple-400/50">
            <div className="text-3xl">🔎</div>
            <h2 className="mt-5 text-xl font-bold">Investigate</h2>
            <p className="mt-3 leading-7 text-gray-400">
              Examine evidence, uncover clues, and connect the details hidden
              inside every case.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-purple-400/50">
            <div className="text-3xl">🕵️</div>
            <h2 className="mt-5 text-xl font-bold">Question Suspects</h2>
            <p className="mt-3 leading-7 text-gray-400">
              Explore suspicious characters and decide who might be hiding
              the truth.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-purple-400/50">
            <div className="text-3xl">⚖️</div>
            <h2 className="mt-5 text-xl font-bold">Solve the Case</h2>
            <p className="mt-3 leading-7 text-gray-400">
              Accuse the culprit, reveal the explanation, and see how well
              you performed.
            </p>
          </div>
        </div>

        {showCreate && (
          <div className="mt-12 w-full max-w-xl rounded-2xl border border-purple-400/30 bg-[#12121d] p-6 text-left">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Create a Mystery</h2>

              <button
                onClick={() => setShowCreate(false)}
                className="text-2xl text-gray-400 hover:text-white"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="scenario" className="mb-2 block font-medium">
                  Describe your mystery
                </label>

                <textarea
                  id="scenario"
                  name="scenario"
                  value={premise}
                  onChange={(event) => setPremise(event.target.value)}
                  required
                  minLength={20}
                  placeholder="Example: A priceless diamond disappeared from a locked museum overnight..."
                  className="min-h-32 w-full rounded-xl border border-white/10 bg-black/30 p-4 text-white outline-none placeholder:text-gray-500 focus:border-purple-400"
                />

                <p className="mt-2 text-sm text-gray-500">
                  Write at least 20 characters to begin.
                </p>
              </div>

              <div>
                <label htmlFor="difficulty" className="mb-2 block font-medium">
                  Choose difficulty
                </label>

                <select
                  id="difficulty"
                  name="difficulty"
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-[#1b1b2a] p-3 text-white outline-none focus:border-purple-400"
                >
                  <option value="Easy">Easy — 3 suspects</option>
                  <option value="Medium">Medium — 4 suspects</option>
                  <option value="Hard">Hard — 5 suspects</option>
                </select>
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-purple-600 px-6 py-4 font-bold transition hover:bg-purple-500 disabled:opacity-60"
              >
                {loading ? 'Creating your mystery...' : 'Generate Mystery →'}
              </button>
            </form>
          </div>
        )}

        {mystery && (
          <section className="mt-12 w-full max-w-3xl rounded-2xl border border-purple-400/30 bg-[#12121d] p-6 text-left">
            <p className="text-sm font-semibold uppercase tracking-widest text-purple-300">
              {mystery.difficulty} Investigation
            </p>

            <h2 className="mt-3 text-3xl font-bold">{mystery.title}</h2>

            <p className="mt-5 whitespace-pre-line leading-8 text-gray-300">
              {mystery.story}
            </p>

            <h3 className="mt-8 text-xl font-bold">Suspects</h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {mystery.suspects?.map((suspect) => (
                <div
                  key={suspect.id}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <h4 className="font-semibold text-purple-300">
                    {suspect.name}
                  </h4>

                  <p className="mt-2 text-sm leading-6 text-gray-400">
                    {suspect.description}
                  </p>
                </div>
              ))}
            </div>

            <h3 className="mt-8 text-xl font-bold">Evidence Clues</h3>

            <p className="mt-2 text-sm text-gray-400">
              Click each clue to investigate it.
            </p>

            <div className="mt-4 space-y-3">
              {mystery.clues?.map((clue, index) => {
                const discovered = discoveredClues.includes(clue.id)

                return (
                  <button
                    key={clue.id}
                    type="button"
                    disabled={Boolean(accusation)}
                    onClick={() => {
                      if (!discovered) {
                        setDiscoveredClues((previous) => [
                          ...previous,
                          clue.id,
                        ])
                      }
                    }}
                    className="block w-full rounded-xl border border-white/10 bg-black/20 p-4 text-left transition hover:border-purple-400/50 disabled:cursor-default"
                  >
                    <span className="font-semibold text-purple-300">
                      Clue {index + 1}{' '}
                      {discovered ? '✓ Discovered' : '— Click to investigate'}
                    </span>

                    {discovered && (
                      <p className="mt-2 leading-7 text-gray-300">
                        {clue.description}
                      </p>
                    )}
                  </button>
                )
              })}
            </div>

            <p className="mt-4 text-sm text-gray-400">
              Clues discovered: {discoveredClues.length} /{' '}
              {mystery.clues?.length ?? 0}
            </p>

            {!accusation && (
              <div className="mt-8 border-t border-white/10 pt-6">
                <h3 className="text-xl font-bold">Make Your Accusation</h3>

                <p className="mt-2 text-sm text-gray-400">
                  Review the evidence and choose who you believe is responsible.
                </p>

                <div className="mt-4 space-y-3">
                  {mystery.suspects?.map((suspect) => (
                    <label
                      key={suspect.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition ${
                        selectedSuspect === suspect.id
                          ? 'border-purple-400 bg-purple-400/10'
                          : 'border-white/10 bg-black/20 hover:border-purple-400/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accusedSuspect"
                        value={suspect.id}
                        checked={selectedSuspect === suspect.id}
                        onChange={() => setSelectedSuspect(suspect.id)}
                        className="accent-purple-500"
                      />

                      <span>{suspect.name}</span>
                    </label>
                  ))}
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-300">{error}</p>
                )}

                <button
                  type="button"
                  onClick={handleAccusation}
                  disabled={accusing || !selectedSuspect}
                  className="mt-5 w-full rounded-xl bg-purple-600 px-6 py-4 font-bold transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {accusing ? 'Submitting accusation...' : 'Accuse Suspect →'}
                </button>
              </div>
            )}

            {accusation && (
              <div className="mt-8 rounded-xl border border-purple-400/30 bg-black/20 p-5">
                <h3 className="text-2xl font-bold">
                  {accusation.correct ? '🎉 Case Solved!' : '🔍 Case Closed'}
                </h3>

                <p className="mt-3 text-gray-300">{accusation.message}</p>

                <p className="mt-5 text-lg">
                  <span className="text-gray-400">Culprit: </span>
                  <span className="font-bold text-purple-300">
                    {mystery.suspects?.find(
                      (suspect) => suspect.id === accusation.culpritId
                    )?.name || 'Unknown'}
                  </span>
                </p>

                <h4 className="mt-5 font-bold">Solution Explanation</h4>

                <p className="mt-2 leading-7 text-gray-300">
                  {accusation.solutionExplanation}
                </p>

                <p className="mt-5 text-2xl font-bold text-purple-300">
                  Final Score: {accusation.score}
                </p>

                <p className="mt-2 text-sm text-gray-400">
                  Clues discovered: {accusation.discoveredClues} · Hints used:{' '}
                  {accusation.hintsUsed}
                </p>

                <button
                  onClick={startNewMystery}
                  className="mt-6 rounded-lg bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-500"
                >
                  Create Another Mystery
                </button>
              </div>
            )}

            <p className="mt-6 text-sm text-gray-500">
              Case ID: {mystery.caseId}
            </p>
          </section>
        )}
      </main>

      <footer className="border-t border-white/10 px-6 py-6 text-center text-sm text-gray-500">
        AI Mystery Room · Every clue brings you closer to the truth.
      </footer>
    </div>
  )
}

export default App
