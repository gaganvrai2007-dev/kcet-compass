import React, { useMemo, useState } from 'react'
import { Activity, ArrowRight, BarChart3, BookOpen, Calculator, CheckCircle2, ChevronDown, Compass, GraduationCap, Info, Search, ShieldCheck, Sparkles, Upload, X } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const sampleCutoffs = [
  { year: 2025, round: 'Round 1 Final', college: 'University Visvesvaraya College of Engineering (UVCE)', branch: 'Computer Science & Engineering', category: 'GM', rank: 3473, region: 'Rest of Karnataka' },
  { year: 2025, round: 'Round 1 Final', college: 'University Visvesvaraya College of Engineering (UVCE)', branch: 'Artificial Intelligence & Data Science', category: 'GM', rank: 4628, region: 'Rest of Karnataka' },
  { year: 2025, round: 'Round 1 Final', college: 'University Visvesvaraya College of Engineering (UVCE)', branch: 'Electronics & Communication Engineering', category: 'GM', rank: 5418, region: 'Rest of Karnataka' },
  { year: 2025, round: 'Round 1 Final', college: 'University Visvesvaraya College of Engineering (UVCE)', branch: 'Information Science & Engineering', category: 'GM', rank: 4625, region: 'Rest of Karnataka' }
]

const navItems = [
  ['Overview', 'overview', Compass], ['Rank predictor', 'predictor', Calculator],
  ['College explorer', 'colleges', GraduationCap], ['Data & method', 'method', BookOpen]
]

function readCsv(text) {
  const rows = text.trim().split(/\r?\n/)
  const headers = rows.shift().split(',').map(x => x.trim().toLowerCase())
  return rows.map(line => {
    const cells = line.split(',').map(x => x.trim())
    return Object.fromEntries(headers.map((h, i) => [h, cells[i]]))
  }).filter(r => Number.isFinite(Number(r.score)) && Number.isFinite(Number(r.rank)) && Number(r.score) >= 0 && Number(r.rank) > 0)
}

function interpolateRank(points, score) {
  const sorted = [...points].sort((a,b) => Number(b.score)-Number(a.score))
  if (!sorted.length) return null
  if (score >= Number(sorted[0].score)) return { low: Math.round(Number(sorted[0].rank) * 0.9), high: Number(sorted[0].rank), note: 'Your score is at or above the highest score in the uploaded dataset.' }
  if (score <= Number(sorted.at(-1).score)) return { low: Math.round(Number(sorted.at(-1).rank)), high: Math.round(Number(sorted.at(-1).rank) * 1.1), note: 'Your score is at or below the lowest score in the uploaded dataset.' }
  for (let i=0; i<sorted.length-1; i++) {
    const a=sorted[i], b=sorted[i+1]
    if (score <= Number(a.score) && score >= Number(b.score)) {
      const t=(Number(a.score)-score)/(Number(a.score)-Number(b.score))
      const rank=Number(a.rank)+t*(Number(b.rank)-Number(a.rank))
      return { low: Math.max(1, Math.floor(rank*0.92)), high: Math.ceil(rank*1.08), note: 'Interpolated between nearby historical score/rank records.' }
    }
  }
  return null
}

function App() {
  const [active, setActive] = useState('overview')
  const [marks, setMarks] = useState({ kp:'', kc:'', km:'', pp:'', pc:'', pm:'' })
  const [category, setCategory] = useState('GM')
  const [region, setRegion] = useState('Rest of Karnataka')
  const [rankPoints, setRankPoints] = useState([])
  const [datasetName, setDatasetName] = useState('')
  const [csvError, setCsvError] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [query, setQuery] = useState('')
  const [branchFilter, setBranchFilter] = useState('All branches')

  const valid = Object.values(marks).every(v => v !== '' && Number(v) >= 0) &&
    Number(marks.kp)<=60 && Number(marks.kc)<=60 && Number(marks.km)<=60 &&
    Number(marks.pp)<=100 && Number(marks.pc)<=100 && Number(marks.pm)<=100

  const result = useMemo(() => {
    const kcet = Number(marks.kp)+Number(marks.kc)+Number(marks.km)
    const puc = Number(marks.pp)+Number(marks.pc)+Number(marks.pm)
    const kcetPct = kcet/180*100
    const pucPct = puc/300*100
    const merit = (kcetPct+pucPct)/2
    return { kcet, puc, kcetPct, pucPct, merit, rank: interpolateRank(rankPoints, merit) }
  }, [marks, rankPoints])

  const collegeRows = sampleCutoffs.filter(x =>
    x.category===category && x.region===region &&
    (branchFilter==='All branches' || x.branch===branchFilter) &&
    (x.college+x.branch).toLowerCase().includes(query.toLowerCase())
  )

  function setMark(key, value) {
    setMarks(old => ({...old, [key]: value}))
    setShowResult(false)
  }
  function calculate(e) { e.preventDefault(); if(valid) setShowResult(true) }
  function importCsv(e) {
    const file=e.target.files?.[0]
    if(!file) return
    const reader=new FileReader()
    reader.onload=() => {
      try {
        const parsed=readCsv(String(reader.result))
        if(parsed.length<2) throw new Error('Add at least two valid score/rank rows.')
        setRankPoints(parsed); setDatasetName(file.name); setCsvError(''); setShowResult(false)
      } catch(err) { setCsvError(err.message || 'Could not read this CSV.') }
    }
    reader.readAsText(file)
  }

  const go = id => { setActive(id); document.getElementById(id)?.scrollIntoView({behavior:'smooth', block:'start'}) }
  const input = (label, key, max, group) => <label className="field"><span>{label}</span><div className="input-wrap"><input type="number" min="0" max={max} step="0.5" placeholder="0" value={marks[key]} onChange={e=>setMark(key,e.target.value)} required/><small>/ {max}</small></div></label>

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-icon"><Compass size={21}/></div><div><b>KCET<span>COMPASS</span></b><small>Predict. Explore. Choose.</small></div></div>
      <div className="nav-label">WORKSPACE</div>
      {navItems.map(([label,id,Icon])=><button key={id} className={`nav-item ${active===id?'selected':''}`} onClick={()=>go(id)}><Icon size={18}/><span>{label}</span>{active===id&&<i/>}</button>)}
      <div className="sidebar-bottom"><div className="secure"><ShieldCheck size={17}/><span>Transparent estimates<br/><small>Historical data first</small></span></div><p>KCET 2027 · Student toolkit</p></div>
    </aside>

    <main className="main">
      <header className="topbar"><div className="crumb">Workspace <span>/</span> <b>{navItems.find(x=>x[1]===active)?.[0] || 'Overview'}</b></div><div className="top-right"><span className="live-dot"/> <span>KCET 2027</span><div className="avatar">KC</div></div></header>

      <section id="overview" className="hero section-anchor">
        <div className="hero-copy"><div className="eyebrow"><Sparkles size={14}/> YOUR ADMISSION PLANNING TOOL</div><h1>Make your next move<br/><em>with clarity.</em></h1><p>Estimate your KCET engineering merit score, explore historical cutoffs, and plan your college shortlist with data you can verify.</p><div className="hero-actions"><button className="primary-btn" onClick={()=>go('predictor')}>Predict my rank <ArrowRight size={17}/></button><button className="text-btn" onClick={()=>go('method')}>How it works <ArrowRight size={15}/></button></div></div>
        <div className="hero-visual"><div className="orb orb-one"/><div className="orb orb-two"/><div className="score-card"><div className="card-top"><span>MERIT SCORE</span><Activity size={17}/></div><div className="score-placeholder">--<small>%</small></div><div className="score-line"><span>Enter marks to calculate</span><span className="pill">KCET + PUC</span></div><div className="mini-bars"><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/><i/></div></div><div className="float-tag"><CheckCircle2 size={16}/> Data-led estimates</div></div>
      </section>

      <section className="stats-grid">
        <div className="stat-card"><div className="stat-icon purple"><Calculator size={18}/></div><div><strong>50 : 50</strong><span>KCET & qualifying exam weightage*</span></div></div>
        <div className="stat-card"><div className="stat-icon blue"><BarChart3 size={18}/></div><div><strong>Historical</strong><span>Score-to-rank data supported</span></div></div>
        <div className="stat-card"><div className="stat-icon green"><GraduationCap size={18}/></div><div><strong>College cutoffs</strong><span>Round and category aware</span></div></div>
      </section>

      <section id="predictor" className="content-section section-anchor">
        <div className="section-heading"><div><div className="eyebrow">01 / RANK PREDICTOR</div><h2>Calculate your merit score</h2><p>Enter subject-wise marks. The score is calculated locally in your browser.</p></div><span className="section-chip"><ShieldCheck size={14}/> No account needed</span></div>
        <div className="predict-layout">
          <form className="panel marks-panel" onSubmit={calculate}>
            <div className="panel-title"><div className="title-icon"><BookOpen size={18}/></div><div><h3>Academic marks</h3><p>Use marks obtained, not percentages.</p></div></div>
            <div className="group-label"><span>KCET EXAMINATION</span><small>Maximum 60 per subject</small></div>
            <div className="fields">{input('Physics','kp',60)}{input('Chemistry','kc',60)}{input('Mathematics','km',60)}</div>
            <div className="divider"/>
            <div className="group-label"><span>2ND PUC / QUALIFYING EXAM</span><small>Maximum 100 per subject</small></div>
            <div className="fields">{input('Physics','pp',100)}{input('Chemistry','pc',100)}{input('Mathematics','pm',100)}</div>
            <div className="divider"/>
            <div className="select-row"><label className="field"><span>Reservation category</span><div className="select-wrap"><select value={category} onChange={e=>setCategory(e.target.value)}>{['GM','1G','2AG','2BG','3AG','3BG','SCG','STG'].map(x=><option key={x}>{x}</option>)}</select><ChevronDown size={16}/></div></label><label className="field"><span>Region</span><div className="select-wrap"><select value={region} onChange={e=>setRegion(e.target.value)}><option>Rest of Karnataka</option><option>Kalyana Karnataka</option></select><ChevronDown size={16}/></div></label></div>
            <button className="primary-btn full" type="submit" disabled={!valid}>Calculate merit score <ArrowRight size={17}/></button>
            {!valid&&<p className="hint">Fill all six marks fields. KCET subjects: 0–60; PUC subjects: 0–100.</p>}
          </form>
          <div className="panel result-panel">
            <div className="panel-title"><div className="title-icon result-icon"><Activity size={18}/></div><div><h3>Your prediction</h3><p>Results update after calculation.</p></div></div>
            {!showResult ? <div className="empty-result"><div className="empty-ring"><Calculator size={25}/></div><h3>Your result will appear here</h3><p>Enter your marks and calculate to see your combined merit score and any available historical rank estimate.</p><div className="empty-note"><Info size={15}/> Rank prediction needs verified score-to-rank records.</div></div> :
              <div className="result-content"><div className="merit-number">{result.merit.toFixed(2)}<small>%</small></div><span className="result-caption">COMBINED MERIT SCORE</span><div className="progress-track"><i style={{width:`${Math.min(result.merit,100)}%`}}/></div><div className="score-breakdown"><div><span>KCET PCM</span><b>{result.kcet} / 180</b><small>{result.kcetPct.toFixed(2)}%</small></div><div><span>PUC PCM</span><b>{result.puc} / 300</b><small>{result.pucPct.toFixed(2)}%</small></div></div><div className="rank-box">{result.rank ? <><span>ESTIMATED HISTORICAL RANK RANGE</span><strong>{result.rank.low.toLocaleString('en-IN')} – {result.rank.high.toLocaleString('en-IN')}</strong><p>{result.rank.note}</p></> : <><span>RANK ESTIMATE NOT YET AVAILABLE</span><strong>Merit score: {result.merit.toFixed(2)}%</strong><p>Upload a validated score-to-rank CSV below to enable an estimate. We won't invent a rank from unsupported assumptions.</p></>}</div></div>}
            <div className="disclaimer"><Info size={14}/> Indicative only. Actual merit and rank depend on KEA rules, tie-breaks, eligibility and the relevant year's official process.</div>
          </div>
        </div>
      </section>

      <section id="colleges" className="content-section section-anchor">
        <div className="section-heading"><div><div className="eyebrow">02 / COLLEGE EXPLORER</div><h2>Explore historical cutoffs</h2><p>Starter dataset: selected 2025 Round 1 final cutoffs for Rest of Karnataka, GM category.</p></div><span className="section-chip">2025 · Round 1 Final</span></div>
        <div className="panel cutoff-panel">
          <div className="cutoff-tools"><div className="searchbox"><Search size={17}/><input placeholder="Search college or branch..." value={query} onChange={e=>setQuery(e.target.value)}/></div><div className="select-wrap compact"><select value={branchFilter} onChange={e=>setBranchFilter(e.target.value)}><option>All branches</option>{[...new Set(sampleCutoffs.map(x=>x.branch))].map(x=><option key={x}>{x}</option>)}</select><ChevronDown size={15}/></div></div>
          <div className="table-wrap"><table><thead><tr><th>COLLEGE / BRANCH</th><th>CATEGORY</th><th>REGION</th><th>YEAR / ROUND</th><th>CLOSING RANK</th></tr></thead><tbody>{collegeRows.length ? collegeRows.map((r,i)=><tr key={i}><td><b>{r.college}</b><small>{r.branch}</small></td><td><span className="category-tag">{r.category}</span></td><td>{r.region}</td><td>{r.year}<small>{r.round}</small></td><td className="rank-cell">{r.rank.toLocaleString('en-IN')}</td></tr>) : <tr><td colSpan="5" className="no-data">No matching rows in this small starter dataset.</td></tr>}</tbody></table></div>
          <div className="table-foot"><Info size={14}/> A cutoff is the last allotted rank for a specific seat type and round; it is not a guaranteed admission threshold for a future year.</div>
        </div>
      </section>

      <section id="method" className="content-section section-anchor">
        <div className="section-heading"><div><div className="eyebrow">03 / DATA & METHOD</div><h2>Transparent by design</h2><p>Know what the calculator does — and what it doesn't claim to know.</p></div></div>
        <div className="method-grid">
          <div className="panel method-card"><div className="method-icon"><Calculator size={19}/></div><h3>Merit calculation</h3><p>For the engineering model configured here, the combined percentage is the average of KCET PCM percentage and qualifying-exam PCM percentage. Confirm the exact rules against the current KEA bulletin before relying on it.</p><div className="formula">((KCET PCM ÷ 180 × 100) + (PUC PCM ÷ 300 × 100)) ÷ 2</div></div>
          <div className="panel method-card"><div className="method-icon"><BarChart3 size={19}/></div><h3>Historical rank data</h3><p>Rank estimation uses linear interpolation between uploaded score/rank observations. No score-to-rank records are bundled because an audited dataset is not yet available.</p><div className="data-status"><span className={rankPoints.length?'status-green':'status-amber'}/>{rankPoints.length ? `${rankPoints.length} records loaded · ${datasetName}` : 'Waiting for verified score-to-rank CSV'}</div></div>
          <div className="panel method-card"><div className="method-icon"><GraduationCap size={19}/></div><h3>College cutoffs</h3><p>The starter table contains selected 2025 Round 1 final GM cutoffs. It is intentionally small and must be expanded with official KEA round-wise PDFs before it can be used as a full college predictor.</p><div className="data-status"><span className="status-green"/> 4 source-backed cutoff records included</div></div>
        </div>
        <div className="panel upload-panel"><div><div className="upload-heading"><Upload size={18}/><h3>Import historical score-to-rank data</h3></div><p>Upload a CSV with columns <code>year,score,rank</code>. Each row must be a verified historical observation. Example format is included in the project folder.</p><p className="upload-note">Keep years comparable and use the same score definition as this calculator. Don't mix raw KCET marks with combined merit percentages.</p>{csvError&&<p className="error">{csvError}</p>}</div><label className="upload-btn">Choose CSV<input type="file" accept=".csv,text/csv" onChange={importCsv}/></label></div>
      </section>
      <footer><div className="footer-brand"><Compass size={18}/> KCET COMPASS</div><span>Built for informed planning · Not affiliated with KEA</span><a href="https://cetonline.karnataka.gov.in/kea/" target="_blank" rel="noreferrer">Official KEA portal ↗</a></footer>
    </main>
  </div>
}

export default App
