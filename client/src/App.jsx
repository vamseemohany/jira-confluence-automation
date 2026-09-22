import { useEffect, useState } from 'react'

const emptyReport = `# Status Report\n\n## Summary\n\nNo report generated yet.`

export default function App() {
  const [sourceId, setSourceId] = useState('jira-primary')
  const [reportType, setReportType] = useState('weekly-summary')
  const [period, setPeriod] = useState('2026-W38')
  const [status, setStatus] = useState('idle')
  const [runId, setRunId] = useState('')
  const [report, setReport] = useState(emptyReport)
  const [history, setHistory] = useState([])

  useEffect(() => {
    loadHistory()
  }, [])

  async function loadHistory() {
    try {
      const res = await fetch('/api/report-runs')
      if (!res.ok) return
      const data = await res.json()
      setHistory(data.runs || [])
    } catch (error) {
      console.error('Could not load history', error)
    }
  }

  async function startRun(event) {
    event.preventDefault()
    setStatus('running')

    const res = await fetch('/api/report-runs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sourceId, period, reportType }),
    })

    const payload = await res.json()
    if (!res.ok) {
      setStatus('error')
      setReport(`## Error\n\n${payload.error || 'Request failed.'}`)
      return
    }

    setRunId(payload.runId)
    setStatus(payload.status)
    setReport(emptyReport)
    await loadHistory()

    if (payload.status === 'completed') {
      const reportRes = await fetch(`/api/report-runs/${payload.runId}/report`)
      const reportPayload = await reportRes.json()
      if (reportRes.ok) {
        setReport(reportPayload.report || emptyReport)
      }
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Module 17</p>
          <h1>Jira/Confluence automation</h1>
        </div>
      </header>

      <section className="panel layout">
        <form onSubmit={startRun} className="form-panel">
          <h2>Report run</h2>

          <label>
            Source
            <select value={sourceId} onChange={(e) => setSourceId(e.target.value)}>
              <option value="jira-primary">jira-primary</option>
              <option value="confluence-primary">confluence-primary</option>
            </select>
          </label>

          <label>
            Period
            <input value={period} onChange={(e) => setPeriod(e.target.value)} />
          </label>

          <label>
            Report type
            <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
              <option value="weekly-summary">weekly-summary</option>
              <option value="status-update">status-update</option>
            </select>
          </label>

          <button type="submit" disabled={status === 'running'}>
            {status === 'running' ? 'Running...' : 'Start run'}
          </button>
        </form>

        <aside className="status-panel" aria-live="polite">
          <h2>Run status</h2>
          <p className={`status-badge status-${status}`}>{status}</p>
          {runId ? <p>Run ID: {runId}</p> : <p>No active run.</p>}
          <ul>
            {history.slice(0, 5).map((item) => (
              <li key={item.id}>
                {item.sourceId} • {item.status} • {item.period}
              </li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="panel report-panel">
        <h2>Markdown output</h2>
        <pre>{report}</pre>
      </section>
    </main>
  )
}
