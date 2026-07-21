# Algorithm Simulator

A professional educational platform for simulating and comparing algorithmic approaches to classic problems. 

**Tech Stack:** Python 3 · Flask · HTML5 · CSS3 · Vanilla JavaScript (ES6 modules)

---

## Features

- **Side-by-side Algorithm Comparison**: Evaluate different algorithmic approaches (e.g., Greedy vs Dynamic Programming) to solve the same problem.
- **Execution Tracing**: Step-by-step visualizations of algorithm execution flows.
- **Performance Benchmarking**: Real-time measurement of execution wall-clock time.
- **Complexity Analysis**: Big-O time and space complexity breakdowns for each algorithm.
- **Interactive UI**: Clean, responsive, and dynamic user interface.

---

## Planned Modules

- **Coin Change** (Implemented)
- **0/1 Knapsack** (Planned)
- **Fractional Knapsack** (Planned)
- **Activity Selection** (Planned)
- **Rod Cutting** (Planned)

---

## Architecture & Folder Structure

The project follows a strict separation of concerns, designed for scalability and ease of extension.

```
algorithm-simulator/
│
├── algorithms/                 # Pure algorithms (no Flask/HTTP/Timing logic)
│   ├── __init__.py
│   ├── coin_change.py
│   ├── zero_one_knapsack.py    # Placeholder
│   ├── fractional_knapsack.py  # Placeholder
│   ├── activity_selection.py   # Placeholder
│   └── rod_cutting.py          # Placeholder
│
├── routes/                     # Flask REST APIs (Routing and request receiving only)
│   ├── __init__.py
│   └── api.py
│
├── services/                   # Orchestration (Validates, times, compares, formats)
│   ├── __init__.py
│   ├── coin_change_service.py     # Coin Change Orchestrator
│   ├── zero_one_knapsack_service.py    # Placeholder
│   ├── fractional_knapsack_service.py  # Placeholder
│   ├── activity_selection_service.py   # Placeholder
│   └── rod_cutting_service.py          # Placeholder
│
├── utils/                      # Reusable utilities (No business logic)
│   ├── __init__.py
│   ├── validators.py           # Input validation rules
│   ├── timer.py                # Execution timing wrapper
│   ├── constants.py            # Global constants & messages
│   └── complexity.py           # Big-O complexity metadata
│
├── static/                     # Frontend Assets
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js              # Fetch requests & HTTP calls
│       ├── main.js             # Entry point & event listeners
│       ├── render.js           # Reusable DOM rendering functions
│       ├── ui.js               # UI state management & animations
│       └── validation.js       # Client-side input validation
│
├── templates/
│   └── index.html              # Main SPA template
│
├── app.py                      # Flask App factory & configuration
├── requirements.txt            # Python dependencies
└── .gitignore                  # Git exclusions
```

---

## Getting Started

### Prerequisites

- Python 3.10 or later
- pip

### Installation

```bash
# 1. Clone or download the project
cd algorithm-simulator

# 2. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the development server
python app.py
```


---

## API Documentation

### `POST /api/v1/coin-change`

Analyze the Coin Change problem using both algorithms.

**Request**
```json
{
  "coins":  [1, 5, 6, 9],
  "amount": 11
}
```

**Success Response (200)**
```json
{
  "greedy": {
    "coins":             [9, 1, 1],
    "count":             3,
    "solvable":          true,
    "execution_time_ms": 0.0043,
    "steps":             ["Selected coin 9 — remaining amount: 2", "..."]
  },
  "dynamic_programming": {
    "coins":             [5, 6],
    "count":             2,
    "solvable":          true,
    "execution_time_ms": 0.0312,
    "steps":             ["At amount 11: used coin 6 → backtrack to 5", "..."]
  },
  "comparison": {
    "greedy_is_optimal":  false,
    "coin_difference":    1,
    "faster_algorithm":   "greedy",
    "explanation":        "Greedy used 3 coins but the optimal is 2 ..."
  },
  "complexity": {
    "greedy": { ... },
    "dynamic_programming": { ... }
  }
}
```
