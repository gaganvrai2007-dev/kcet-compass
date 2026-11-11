# KCET Compass

A React + Vite starter for a KCET engineering merit calculator and historical cutoff explorer.

## Run locally

1. Install Node.js (LTS).
2. Extract this folder.
3. Open a terminal in `kcet-compass`.
4. Run:

```bash
npm install
npm run dev
```

5. Open the local URL printed by Vite (usually http://localhost:5173).

## Build for production

```bash
npm run build
npm run preview
```

## Current features

- Responsive dashboard UI
- Subject-wise KCET and 2nd PUC marks input
- Combined merit percentage calculation
- CSV import for historical score-to-rank records
- Linear interpolation between imported observations
- Searchable starter cutoff table

## Important data note

The bundled `public/data/score-rank-template.csv` is **illustrative placeholder data only**. Do not use it for real student predictions. Replace it with verified official or otherwise audited historical score/rank observations before using rank estimates. The app does not load this template automatically.

The bundled cutoff examples are selected KCET 2025 Round 1 final GM cutoffs for Rest of Karnataka, transcribed from the KEA published cutoff document. The dataset is intentionally small, not a complete college predictor. Expand it using verified round-, region-, category- and seat-type-specific records.

The merit formula in the UI is a configurable engineering-model assumption. Check the current KEA information bulletin for the target examination year before production use. The app is an independent planning aid and is not affiliated with KEA.

## CSV format for rank estimates

Upload a CSV with columns:

```csv
year,score,rank
2025,88.25,1200
2025,86.50,2100
2025,84.00,3600
```

`score` must use the exact combined merit percentage calculated by this app. Each row should be an actual, verified score/rank observation. Keep datasets from different years identifiable and comparable. For a production version, the interpolation should be refined to select the relevant examination year and model uncertainty across years.

## Deployment

### Frontend on Vercel

1. Create a GitHub repository and push this project.
2. Sign in to Vercel with GitHub.
3. Import the repository.
4. Framework preset: Vite.
5. Build command: `npm run build`.
6. Output directory: `dist`.
7. Deploy.

No backend or environment variables are required for this first MVP. The CSV is processed in the browser and is not uploaded to a server.

## Suggested next engineering tasks

- Add complete official cutoff datasets by year, round, region, category and seat type.
- Add a validated score-to-rank dataset (currently not bundled).
- Add a college shortlist engine with exact category/region/round matching.
- Add unit tests for merit calculation and interpolation.
- Add a backend only if shared datasets, admin uploads or user accounts are needed.
