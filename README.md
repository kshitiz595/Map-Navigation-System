# 🗺 Advanced Map Navigation System

A browser-based interactive pathfinding tool that implements *Dijkstra's Algorithm* and *A Search** for visualizing shortest paths on a dynamically generated graph. Users can select start and end points, choose an algorithm, and view detailed route statistics and turn-by-turn directions.

---

![Map Navigation Screenshot](./Map%20Navigation%201.png)
![Map Navigation Screenshot](./Map%20Navigation%202.png)
![Map Navigation Screenshot](./Map%20Navigation%203.png)

## 🔍 Features

- 🎯 *Start & Destination Selection* via dropdowns
- 🚦 *Algorithm Choice: Dijkstra’s or A Search
- 🗺 *Canvas-Based Map Rendering* of nodes and paths
- 📊 *Live Stats*: Total Distance, Nodes Visited, Computation Time
- 🧭 *Turn-by-Turn Instructions* for the computed route
- 🎲 *Random Map Generator* to test different scenarios
- 💅 Clean, responsive UI with custom CSS

---

## 📸 UI Overview

- *Left Panel*: Controls (algorithm selection, node dropdowns, buttons)
- *Right Panel*: Canvas map + Turn-by-turn instruction overlay
- *Bottom*: Real-time route statistics and system feedback

---

## ⚙ Technologies Used

- *HTML5*: Structure and layout
- *CSS3*: Custom styling (no frameworks)
- *JavaScript (ES6+)*: Core logic, DOM manipulation, algorithm implementation
- *Canvas API*: Drawing graph nodes, edges, and paths

> 🧠 Note: No external libraries, databases, or frameworks (React, Node.js, Tailwind, MongoDB, PostgreSQL) are used.

---

## 🚀 How to Run

1. Clone or download the repository.
2. Open index.html in your browser.
3. Use the dropdowns to:
   - Select *Start* and *Destination*
   - Choose an algorithm (Dijkstra or A*)
   - Click *"Find Route"* to visualize
   - Optionally generate a *new map*

---

## 🧠 Algorithm Descriptions

### Dijkstra's Algorithm
- Explores all nodes in increasing order of distance
- Guarantees the shortest path
- Slower for large maps

### A* Search
- Uses a heuristic (Euclidean distance)
- Typically faster than Dijkstra
- Still guarantees optimal path (with consistent heuristic)

---

## 📊 Example Output

- *Total Distance*: 53.4 units  
- *Nodes Visited*: 24  
- *Computation Time*: 8ms  
- *Algorithm Used: A Search  

---

## 📁 Project Structure

├── index.html # Main UI
├── styles.css # All layout & visual styling
├── script.js # Graph generation, algorithms, canvas rendering


---

## ❗ Limitations

- No map tiles or real geographic data (random graph only)
- No persistent storage (no MongoDB or PostgreSQL)
- No server-side logic (Node.js not used)

---

## ✅ Next Steps (Ideas)

- Integrate with real-world maps (e.g., OpenStreetMap)
- Add zoom/pan functionality to canvas
- Convert to React + Tailwind CSS for better componentization
- Add backend with Node.js + DB for saving routes

---

## 🧑‍💻 Author

Created as a frontend-only project to visualize classic pathfinding algorithms on custom-generated graphs.

---

## 📄 License

MIT License
