const express = require('express')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3001

app.use(express.json())

const runs = []

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.get('/ready', (_req, res) => {
  res.json({ status: 'ready' })
})

app.get('/api/report-runs', (_req, res) => {
  res.json({ runs: runs.slice().reverse().slice(0, 10) })
})

app.post('/api/report-runs', (req, res) => {
  const { sourceId, period, reportType } = req.body || {}

  if (!sourceId || !period || !reportType) {
    return res.status(400).json({ error: 'sourceId, period, and reportType are required.' })
  }

  const run = {
    id: `run-${Date.now()}`,
    sourceId,
    period,
    reportType,
    status: 'completed',
    createdAt: new Date().toISOString(),
  }

  runs.push(run)
  return res.status(201).json({
    runId: run.id,
    status: run.status,
    createdAt: run.createdAt,
    links: { status: `/api/report-runs/${run.id}` },
  })
})

app.get('/api/report-runs/:runId', (req, res) => {
  const run = runs.find((item) => item.id === req.params.runId)

  if (!run) {
    return res.status(404).json({ error: 'Run not found.' })
  }

  return res.json({
    runId: run.id,
    status: run.status,
    sourceScope: run.sourceId,
    createdAt: run.createdAt,
    warnings: [],
    error: null,
    reportAvailable: true,
    links: { report: `/api/report-runs/${run.id}/report` },
  })
})

app.get('/api/report-runs/:runId/report', (req, res) => {
  const run = runs.find((item) => item.id === req.params.runId)

  if (!run) {
    return res.status(404).json({ error: 'Run not found.' })
  }

  const report = `# ${run.reportType}\n\n- Source: ${run.sourceId}\n- Period: ${run.period}\n- Generated: ${run.createdAt}\n\n## Summary\n\nThis is a generated sample report for the ${run.period} window.`

  return res.json({ report })
})

app.use(express.static(path.join(__dirname, '../../dist')))

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Not found.' })
  }

  return res.sendFile(path.join(__dirname, '../../dist/index.html'))
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
