# Frontend - BFHL Hierarchical Node Processor

React + Vite frontend for visualizing and testing the BFHL hierarchical node processing API.

## What This Frontend Includes

- Analyzer workflow for node-edge input (`X->Y` format)
- Real-time client-side validation and duplicate awareness
- Edge-case simulator presets
- Results dashboard:
	- summary cards
	- performance metrics
	- tree visualization
	- interactive graph visualization
	- step-by-step processing timeline
- Built-in API tester (GET/POST) with latency and formatted response
- Export tools: JSON, PNG, PDF report
- Dark mode support

## Development

Install dependencies:

```bash
npm install
```

Run dev server:

```bash
npm run dev
```

Build production assets:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

Lint code:

```bash
npm run lint
```

## API Base URL

The app reads API base URL from:

- `VITE_API_URL`

If unset, it defaults to:

- `https://bajaj-obji.onrender.com`

For local development, create `.env` in this folder:

```env
VITE_API_URL=http://localhost:5000
```

## Expected Backend Endpoint

- `POST /bfhl`
- `GET /bfhl`

## Input Format

Expected request body sent by the frontend:

```json
{
	"data": ["A->B", "A->C", "B->D"]
}
```

## Related Documentation

For full-stack setup, backend details, API response schema, and complete run instructions, see the root project README at `../README.md`.
