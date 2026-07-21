# Algorithm Simulator – Interactive Algorithm Visualization Platform

A professional educational platform for simulating and visualizing classic algorithms through interactive execution tracing, performance benchmarking, and complexity analysis.

**Tech Stack:** Python 3 · Flask · HTML5 · CSS3 · Vanilla JavaScript (ES6 Modules)

---

## Features

- **Interactive Algorithm Visualization** with step-by-step execution tracing.
- **Algorithm Comparison** for problems supporting multiple approaches (e.g., Greedy vs Dynamic Programming).
- **Performance Benchmarking** using real-time execution time measurements.
- **Complexity Analysis** with Big-O time and space complexity explanations.
- **Dynamic Programming Table Visualization** and solution reconstruction.
- **Greedy Decision Visualization** with execution timelines.
- **Responsive Single-Page Interface** built using HTML5, CSS3, and Vanilla JavaScript.

---

## Implemented Modules

- ✅ Coin Change (Greedy vs Dynamic Programming)
- ✅ 0/1 Knapsack (Dynamic Programming)
- ✅ Fractional Knapsack (Greedy)
- ✅ Activity Selection (Greedy)
- ✅ Rod Cutting (Dynamic Programming)

---

## Architecture & Folder Structure

The project follows a strict separation of concerns, designed for scalability and ease of extension.

```text
algorithm-simulator/
│
├── algorithms/                 # Pure algorithm implementations
│   ├── __init__.py
│   ├── coin_change.py
│   ├── zero_one_knapsack.py
│   ├── fractional_knapsack.py
│   ├── activity_selection.py
│   └── rod_cutting.py
│
├── routes/                     # Flask REST API endpoints
│   ├── __init__.py
│   └── api.py
│
├── services/                   # Business logic & orchestration
│   ├── __init__.py
│   ├── coin_change_service.py
│   ├── zero_one_knapsack_service.py
│   ├── fractional_knapsack_service.py
│   ├── activity_selection_service.py
│   └── rod_cutting_service.py
│
├── utils/                      # Shared utilities
│   ├── __init__.py
│   ├── validators.py
│   ├── timer.py
│   ├── constants.py
│   └── complexity.py
│
├── static/
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       ├── main.js
│       ├── render.js
│       ├── ui.js
│       └── validation.js
│
├── templates/
│   └── index.html
│
├── app.py
├── requirements.txt
├── README.md
└── .gitignore
```

---

# Getting Started

## Prerequisites

- Python 3.10 or later
- pip

---

## Installation

Clone the repository and move into the project directory.

```bash
git clone <repository-url>
cd algorithm-simulator
```

Create a virtual environment.

```bash
python -m venv venv
```

Activate the virtual environment.

### Windows

```bash
venv\Scripts\activate
```

### macOS / Linux

```bash
source venv/bin/activate
```

Install the required dependencies.

```bash
pip install -r requirements.txt
```

---

## API Documentation

### POST `/api/v1/coin-change`

Analyzes the Coin Change problem using both Greedy and Dynamic Programming approaches.

### Request

```json
{
  "coins": [1,5,6,9],
  "amount":11
}
```

### Success Response (200)

```json
{
  "greedy": {
    "coins":[9,1,1],
    "count":3,
    "solvable":true,
    "execution_time_ms":0.004,
    "steps":[]
  },
  "dynamic_programming":{
    "coins":[5,6],
    "count":2,
    "solvable":true,
    "execution_time_ms":0.031,
    "steps":[]
  },
  "comparison":{
    "greedy_is_optimal":false,
    "coin_difference":1,
    "faster_algorithm":"greedy"
  },
  "complexity":{
    "greedy":{},
    "dynamic_programming":{}
  }
}
```

---

# Running the Application

Start the Flask development server.

```bash
python app.py
```

The application will be available at:

```text
http://127.0.0.1:5000
```

Open the URL in your browser to launch the **Algorithm Simulator**.

Use the navigation bar at the top of the application to switch between the available modules.

The simulator currently supports:

- Coin Change
- 0/1 Knapsack
- Fractional Knapsack
- Activity Selection
- Rod Cutting

Each module provides:

- Interactive algorithm visualization
- Step-by-step execution tracing
- Dynamic Programming table visualization (where applicable)
- Greedy decision visualization (where applicable)
- Solution reconstruction
- Performance benchmarking
- Complexity analysis
- Educational insights
- Preset examples and input validation

---

## Future Enhancements

Potential future improvements include:

- Graph Algorithms (Dijkstra, BFS, DFS)
- Sorting Algorithm Visualizations
- Backtracking Algorithms (N-Queens)
- Export Results as PDF/JSON
- Algorithm Comparison Dashboard
- Light/Dark Theme Toggle
- User Progress Tracking
- Interactive Pseudocode Visualization

---

## License

This project was developed for educational purposes to demonstrate algorithm visualization, software architecture, REST API design, and interactive learning using Python, Flask, and Vanilla JavaScript.
