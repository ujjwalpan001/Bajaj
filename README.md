# BFHL Hierarchical Node Processor

A full-stack application for parsing and analyzing hierarchical node relationships in `X->Y` format.

This project was built for the Bajaj Finserv Health coding challenge and includes:

- A Node.js + Express backend API (`POST /bfhl`) that validates edges, builds hierarchy trees, detects cycles, and returns structured output.
- A React + Vite frontend with real-time validation, graph/tree visualizations, processing timeline, and export support.

## Project Structure

```text
Bajaj/
  backend/    # Express API
  frontend/   # React client
```

## Features

### Backend

- Validates input edges with strict rules:
  - Format must be `X->Y`
  - Node names must be single uppercase letters `A-Z`
  - Self loops (`A->A`) are rejected
- Deduplicates repeated edges (first occurrence is used)
- Enforces single-parent rule (first parent wins)
- Detects cycles using DFS
- Builds nested tree objects per root
- Calculates depth of each valid tree
- Returns:
  - `hierarchies`
  - `invalid_entries`
  - `duplicate_edges`
  - `summary`
  - `processing_steps`
  - `execution_time_ms`

### Frontend

- Analyzer tab with smart textarea and real-time validation
- Built-in edge-case presets (simple, multi-root, cycle, duplicate, invalid mix, complex)
- Results dashboard:
  - Summary cards
  - Performance bar
  - Tree view
  - Interactive graph view via React Flow
  - Step-by-step timeline
- API Tester tab (mini Postman) for `GET/POST` requests
- Export options:
  - JSON
  - PNG snapshot
  - PDF report
- Dark mode support

## Tech Stack

- Backend: Node.js, Express, CORS
- Frontend: React, Vite, Tailwind CSS
- Visualization: `@xyflow/react`
- Exporting: `html2canvas`, `jspdf`

## Prerequisites

- Node.js 16+
- npm

## Local Setup

### 1) Install backend dependencies

```bash
cd backend
npm install
```

### 2) Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 3) Start backend

```bash
cd ../backend
npm run dev
```

Backend runs on:

- `http://localhost:5000`

### 4) Start frontend

Open a second terminal:

```bash
cd frontend
npm run dev
```

Frontend runs on Vite default (usually):

- `http://localhost:5173`

## Environment Variables

Frontend supports a configurable API URL:

- `VITE_API_URL` (optional)

If not provided, the frontend falls back to:

- `https://bajaj-obji.onrender.com`

Create `frontend/.env` if you want local backend integration:

```env
VITE_API_URL=http://localhost:5000
```

Backend supports:

- `PORT` (optional, default `5000`)

## API Documentation

### Health Endpoints

- `GET /`
- `GET /bfhl`

### Main Endpoint

- `POST /bfhl`

Request body:

```json
{
  "data": ["A->B", "A->C", "B->D"]
}
```

Example successful response (shape):

```json
{
  "user_id": "UjjawalPandey_19072003",
  "email_id": "pandey_ujjawal@srmap.edu.in",
  "college_roll_number": "AP23110011211",
  "execution_time_ms": 1.234,
  "processing_steps": [
    { "step": 1, "name": "Input Parsing", "detail": "...", "icon": "📥", "status": "done" }
  ],
  "hierarchies": [
    {
      "root": "A",
      "tree": { "B": { "D": {} }, "C": {} },
      "has_cycle": false,
      "depth": 3
    }
  ],
  "invalid_entries": [],
  "duplicate_edges": [],
  "summary": {
    "total_trees": 1,
    "total_cycles": 0,
    "largest_tree_root": "A"
  }
}
```

Validation error example:

```json
{
  "error": "Request body must contain a `data` array."
}
```

## Input Rules

- Valid examples:
  - `A->B`
  - `X->Y`
- Invalid examples:
  - `a->b` (lowercase)
  - `AB->C` (multi-character node)
  - `A->A` (self-loop)
  - `A-B` (wrong separator)

## Processing Pipeline

1. Parse input array
2. Validate edges
3. Deduplicate edges
4. Build adjacency list and enforce single-parent rule
5. Identify roots
6. Detect cycles (DFS)
7. Build trees and compute depth

## Available Scripts

### Backend (`backend/package.json`)

- `npm start` - run server with Node
- `npm run dev` - run server with Nodemon

### Frontend (`frontend/package.json`)

- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - lint source files

## Manual Testing Quickstart

Use the frontend analyzer and API tester, or call API directly:

```bash
curl -X POST http://localhost:5000/bfhl \
  -H "Content-Type: application/json" \
  -d '{"data":["A->B","A->C","B->D"]}'
```

## Notes

- On free hosting, the first API request may be slow due to cold start.
- Duplicate edges are reported but ignored after first occurrence.
- In multi-parent conflicts, the first valid parent assignment is kept.
