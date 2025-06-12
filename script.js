class PriorityQueue {
    constructor() {
        this.items = [];
    }
    
    enqueue(item, priority) {
        this.items.push({ item, priority });
        this.items.sort((a, b) => a.priority - b.priority);
    }
    
    dequeue() {
        return this.items.shift();
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
}

class MapNavigationSystem {
    constructor() {
        this.nodes = new Map();
        this.edges = new Map();
        this.canvas = document.getElementById('mapCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.currentPath = [];
        this.visitedNodes = [];
        
        this.setupCanvas();
        this.generateRandomGraph();
        this.setupEventListeners();
    }
    
    setupCanvas() {
        const resizeCanvas = () => {
            const rect = this.canvas.getBoundingClientRect();
            this.canvas.width = rect.width * window.devicePixelRatio;
            this.canvas.height = rect.height * window.devicePixelRatio;
            this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
            this.canvas.style.width = rect.width + 'px';
            this.canvas.style.height = rect.height + 'px';
            this.draw();
        };
        
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();
    }
    
    setupEventListeners() {
        document.getElementById('algorithm').addEventListener('change', (e) => {
            const info = document.getElementById('algorithmInfo');
            if (e.target.value === 'astar') {
                info.innerHTML = `
                    <h3>A* Search</h3>
                    <p>Uses heuristic (straight-line distance) to guide search toward goal. Often faster than Dijkstra.</p>
                `;
            } else {
                info.innerHTML = `
                    <h3>Dijkstra's Algorithm</h3>
                    <p>Finds shortest path by exploring all nodes systematically. Guaranteed optimal solution.</p>
                `;
            }
        });
    }
    
    generateRandomGraph() {
        this.nodes.clear();
        this.edges.clear();
        
        const width = 800;
        const height = 500;
        const nodeCount = 20;
        const cities = [
            'Downtown', 'Airport', 'Mall', 'Hospital', 'University', 'Stadium',
            'Beach', 'Harbor', 'Station', 'Plaza', 'Park', 'Bridge',
            'Market', 'Tower', 'Center', 'District', 'Junction', 'Terminal',
            'Complex', 'Square'
        ];
        
        // Generate nodes
        for (let i = 0; i < nodeCount; i++) {
            const x = Math.random() * (width - 100) + 50;
            const y = Math.random() * (height - 100) + 50;
            
            this.nodes.set(i, {
                id: i,
                x: x,
                y: y,
                name: cities[i] || `Node ${i}`,
                lat: 40.7128 + (y / height - 0.5) * 0.1, // Fake coordinates
                lon: -74.0060 + (x / width - 0.5) * 0.1
            });
        }
        
        // Generate edges (connect nearby nodes)
        this.edges.clear();
        const maxConnections = 4;
        
        for (let [id, node] of this.nodes) {
            if (!this.edges.has(id)) {
                this.edges.set(id, []);
            }
            
            // Find nearest neighbors
            const distances = [];
            for (let [otherId, otherNode] of this.nodes) {
                if (otherId !== id) {
                    const dist = this.euclideanDistance(node, otherNode);
                    distances.push({ id: otherId, distance: dist });
                }
            }
            
            distances.sort((a, b) => a.distance - b.distance);
            const connectionsToMake = Math.min(maxConnections, distances.length);
            
            for (let i = 0; i < connectionsToMake; i++) {
                const neighbor = distances[i];
                const weight = neighbor.distance;
                
                // Add bidirectional edge
                this.addEdge(id, neighbor.id, weight, `Road ${id}-${neighbor.id}`);
            }
        }
        
        this.populateNodeSelectors();
        this.draw();
    }
    
    addEdge(from, to, weight, roadName = '') {
        if (!this.edges.has(from)) {
            this.edges.set(from, []);
        }
        if (!this.edges.has(to)) {
            this.edges.set(to, []);
        }
        
        // Check if edge already exists
        const fromEdges = this.edges.get(from);
        const toEdges = this.edges.get(to);
        
        if (!fromEdges.find(e => e.to === to)) {
            fromEdges.push({ to, weight, roadName });
        }
        if (!toEdges.find(e => e.to === from)) {
            toEdges.push({ to: from, weight, roadName });
        }
    }
    
    populateNodeSelectors() {
        const startSelect = document.getElementById('startNode');
        const endSelect = document.getElementById('endNode');
        
        startSelect.innerHTML = '<option value="">Select starting point...</option>';
        endSelect.innerHTML = '<option value="">Select destination...</option>';
        
        for (let [id, node] of this.nodes) {
            const option1 = document.createElement('option');
            option1.value = id;
            option1.textContent = node.name;
            startSelect.appendChild(option1);
            
            const option2 = document.createElement('option');
            option2.value = id;
            option2.textContent = node.name;
            endSelect.appendChild(option2);
        }
    }
    
    euclideanDistance(node1, node2) {
        const dx = node1.x - node2.x;
        const dy = node1.y - node2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    heuristic(nodeId, targetId) {
        const node = this.nodes.get(nodeId);
        const target = this.nodes.get(targetId);
        return this.euclideanDistance(node, target);
    }
    
    dijkstra(startId, endId) {
        const distances = new Map();
        const previous = new Map();
        const visited = new Set();
        const pq = new PriorityQueue();
        const visitedOrder = [];
        
        // Initialize
        for (let [nodeId] of this.nodes) {
            distances.set(nodeId, Infinity);
            previous.set(nodeId, null);
        }
        distances.set(startId, 0);
        pq.enqueue(startId, 0);
        
        while (!pq.isEmpty()) {
            const current = pq.dequeue().item;
            
            if (visited.has(current)) continue;
            visited.add(current);
            visitedOrder.push(current);
            
            if (current === endId) break;
            
            const neighbors = this.edges.get(current) || [];
            for (let edge of neighbors) {
                const neighbor = edge.to;
                const weight = edge.weight;
                const newDistance = distances.get(current) + weight;
                
                if (newDistance < distances.get(neighbor)) {
                    distances.set(neighbor, newDistance);
                    previous.set(neighbor, current);
                    pq.enqueue(neighbor, newDistance);
                }
            }
        }
        
        return { distances, previous, visitedOrder };
    }
    
    aStar(startId, endId) {
        const gScore = new Map();
        const fScore = new Map();
        const previous = new Map();
        const visited = new Set();
        const pq = new PriorityQueue();
        const visitedOrder = [];
        
        // Initialize
        for (let [nodeId] of this.nodes) {
            gScore.set(nodeId, Infinity);
            fScore.set(nodeId, Infinity);
            previous.set(nodeId, null);
        }
        
        gScore.set(startId, 0);
        fScore.set(startId, this.heuristic(startId, endId));
        pq.enqueue(startId, fScore.get(startId));
        
        while (!pq.isEmpty()) {
            const current = pq.dequeue().item;
            
            if (visited.has(current)) continue;
            visited.add(current);
            visitedOrder.push(current);
            
            if (current === endId) break;
            
            const neighbors = this.edges.get(current) || [];
            for (let edge of neighbors) {
                const neighbor = edge.to;
                const tentativeGScore = gScore.get(current) + edge.weight;
                
                if (tentativeGScore < gScore.get(neighbor)) {
                    previous.set(neighbor, current);
                    gScore.set(neighbor, tentativeGScore);
                    fScore.set(neighbor, tentativeGScore + this.heuristic(neighbor, endId));
                    pq.enqueue(neighbor, fScore.get(neighbor));
                }
            }
        }
        
        return { distances: gScore, previous, visitedOrder };
    }
    
    reconstructPath(previous, startId, endId) {
        const path = [];
        let current = endId;
        
        while (current !== null) {
            path.unshift(current);
            current = previous.get(current);
        }
        
        return path.length > 1 ? path : [];
    }
    
    generateTurnInstructions(path) {
        if (path.length < 2) return [];
        
        const instructions = [];
        let totalDistance = 0;
        
        for (let i = 0; i < path.length - 1; i++) {
            const current = this.nodes.get(path[i]);
            const next = this.nodes.get(path[i + 1]);
            const distance = this.euclideanDistance(current, next);
            totalDistance += distance;
            
            let instruction = '';
            if (i === 0) {
                instruction = `Start at ${current.name}`;
            } else {
                const prev = this.nodes.get(path[i - 1]);
                const bearing1 = this.getBearing(prev, current);
                const bearing2 = this.getBearing(current, next);
                const turn = this.getTurnDirection(bearing1, bearing2);
                
                instruction = `${turn} toward ${next.name}`;
            }
            
            instructions.push({
                instruction,
                distance: Math.round(distance),
                from: current.name,
                to: next.name
            });
        }
        
        if (path.length > 0) {
            const lastNode = this.nodes.get(path[path.length - 1]);
            instructions.push({
                instruction: `Arrive at ${lastNode.name}`,
                distance: 0,
                from: lastNode.name,
                to: lastNode.name
            });
        }
        
        return { instructions, totalDistance };
    }
    
    getBearing(from, to) {
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        return Math.atan2(dy, dx) * 180 / Math.PI;
    }
    
    getTurnDirection(bearing1, bearing2) {
        let angle = bearing2 - bearing1;
        if (angle > 180) angle -= 360;
        if (angle < -180) angle += 360;
        
        if (Math.abs(angle) < 20) return 'Continue straight';
        if (angle > 20 && angle < 160) return 'Turn right';
        if (angle < -20 && angle > -160) return 'Turn left';
        return 'Make a U-turn';
    }
    
    draw() {
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.clearRect(0, 0, rect.width, rect.height);
        
        // Draw background grid for better visibility
        this.drawGrid();
        
        // Draw edges with better styling
        this.ctx.strokeStyle = '#34495e';
        this.ctx.lineWidth = 3;
        this.ctx.lineCap = 'round';
        
        for (let [nodeId, edges] of this.edges) {
            const node = this.nodes.get(nodeId);
            for (let edge of edges) {
                const neighbor = this.nodes.get(edge.to);
                if (nodeId < edge.to) { // Draw each edge only once
                    this.ctx.beginPath();
                    this.ctx.moveTo(node.x, node.y);
                    this.ctx.lineTo(neighbor.x, neighbor.y);
                    this.ctx.stroke();
                    
                    // Draw distance labels on edges
                    const midX = (node.x + neighbor.x) / 2;
                    const midY = (node.y + neighbor.y) / 2;
                    const distance = Math.round(edge.weight);
                    
                    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
                    this.ctx.fillRect(midX - 15, midY - 8, 30, 16);
                    this.ctx.fillStyle = '#2c3e50';
                    this.ctx.font = 'bold 10px Arial';
                    this.ctx.textAlign = 'center';
                    this.ctx.fillText(distance.toString(), midX, midY + 3);
                }
            }
        }
        
        // Draw visited nodes animation (if any)
        if (this.visitedNodes.length > 0) {
            this.ctx.fillStyle = 'rgba(52, 152, 219, 0.2)';
            for (let i = 0; i < this.visitedNodes.length; i++) {
                const nodeId = this.visitedNodes[i];
                const node = this.nodes.get(nodeId);
                const alpha = 0.1 + (i / this.visitedNodes.length) * 0.3;
                this.ctx.globalAlpha = alpha;
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
                this.ctx.fill();
            }
            this.ctx.globalAlpha = 1.0;
        }
        
        // Draw path with enhanced styling
        if (this.currentPath.length > 1) {
            // Draw path shadow for depth
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            this.ctx.lineWidth = 8;
            this.ctx.lineCap = 'round';
            this.ctx.lineJoin = 'round';
            this.ctx.beginPath();
            for (let i = 0; i < this.currentPath.length; i++) {
                const node = this.nodes.get(this.currentPath[i]);
                if (i === 0) {
                    this.ctx.moveTo(node.x + 2, node.y + 2);
                } else {
                    this.ctx.lineTo(node.x + 2, node.y + 2);
                }
            }
            this.ctx.stroke();
            
            // Draw main path
            this.ctx.strokeStyle = '#e74c3c';
            this.ctx.lineWidth = 6;
            this.ctx.beginPath();
            for (let i = 0; i < this.currentPath.length; i++) {
                const node = this.nodes.get(this.currentPath[i]);
                if (i === 0) {
                    this.ctx.moveTo(node.x, node.y);
                } else {
                    this.ctx.lineTo(node.x, node.y);
                }
            }
            this.ctx.stroke();
            
            // Draw direction arrows on path
            this.drawPathArrows();
        }
        
        // Draw nodes with enhanced styling
        for (let [nodeId, node] of this.nodes) {
            let fillStyle = '#3498db';
            let strokeStyle = '#2980b9';
            let radius = 18;
            let textColor = 'white';
            
            if (this.currentPath.length > 0) {
                if (nodeId === this.currentPath[0]) {
                    fillStyle = '#27ae60'; // Start node
                    strokeStyle = '#1e8449';
                    radius = 22;
                } else if (nodeId === this.currentPath[this.currentPath.length - 1]) {
                    fillStyle = '#e74c3c'; // End node
                    strokeStyle = '#c0392b';
                    radius = 22;
                } else if (this.currentPath.includes(nodeId)) {
                    fillStyle = '#f39c12'; // Path node
                    strokeStyle = '#d68910';
                    radius = 16;
                }
            }
            
            // Draw node shadow
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.beginPath();
            this.ctx.arc(node.x + 2, node.y + 2, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw node border
            this.ctx.strokeStyle = strokeStyle;
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            this.ctx.stroke();
            
            // Draw node fill
            this.ctx.fillStyle = fillStyle;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw node ID
            this.ctx.fillStyle = textColor;
            this.ctx.font = 'bold 14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(nodeId.toString(), node.x, node.y + 5);
            
            // Draw node name with background
            const nameWidth = this.ctx.measureText(node.name).width;
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            this.ctx.fillRect(node.x - nameWidth/2 - 5, node.y + 35, nameWidth + 10, 20);
            this.ctx.strokeStyle = '#bdc3c7';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(node.x - nameWidth/2 - 5, node.y + 35, nameWidth + 10, 20);
            
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.font = 'bold 12px Arial';
            this.ctx.fillText(node.name, node.x, node.y + 48);
        }
        
        // Draw legend
        this.drawLegend();
    }
    
    drawGrid() {
        const rect = this.canvas.getBoundingClientRect();
        this.ctx.strokeStyle = 'rgba(189, 195, 199, 0.2)';
        this.ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < rect.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, rect.height);
            this.ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < rect.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(rect.width, y);
            this.ctx.stroke();
        }
    }
    
    drawPathArrows() {
        if (this.currentPath.length < 2) return;
        
        this.ctx.fillStyle = '#c0392b';
        this.ctx.strokeStyle = '#c0392b';
        this.ctx.lineWidth = 2;
        
        for (let i = 0; i < this.currentPath.length - 1; i++) {
            const current = this.nodes.get(this.currentPath[i]);
            const next = this.nodes.get(this.currentPath[i + 1]);
            
            // Calculate arrow position (midpoint)
            const midX = (current.x + next.x) / 2;
            const midY = (current.y + next.y) / 2;
            
            // Calculate arrow direction
            const dx = next.x - current.x;
            const dy = next.y - current.y;
            const angle = Math.atan2(dy, dx);
            
            // Draw arrow
            const arrowSize = 8;
            this.ctx.save();
            this.ctx.translate(midX, midY);
            this.ctx.rotate(angle);
            
            this.ctx.beginPath();
            this.ctx.moveTo(arrowSize, 0);
            this.ctx.lineTo(-arrowSize/2, -arrowSize/2);
            this.ctx.lineTo(-arrowSize/2, arrowSize/2);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
        }
    }
    
    drawLegend() {
        const rect = this.canvas.getBoundingClientRect();
        const legendX = 20;
        const legendY = rect.height - 120;
        
        // Legend background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(legendX, legendY, 200, 100);
        this.ctx.strokeStyle = '#bdc3c7';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(legendX, legendY, 200, 100);
        
        // Legend title
        this.ctx.fillStyle = '#2c3e50';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText('Legend', legendX + 10, legendY + 20);
        
        // Legend items
        const items = [
            { color: '#27ae60', text: 'Start Point', y: 35 },
            { color: '#e74c3c', text: 'Destination', y: 50 },
            { color: '#f39c12', text: 'Route Path', y: 65 },
            { color: '#3498db', text: 'Other Nodes', y: 80 }
        ];
        
        this.ctx.font = '12px Arial';
        items.forEach(item => {
            // Draw color circle
            this.ctx.fillStyle = item.color;
            this.ctx.beginPath();
            this.ctx.arc(legendX + 20, legendY + item.y, 6, 0, 2 * Math.PI);
            this.ctx.fill();
            
            // Draw text
            this.ctx.fillStyle = '#2c3e50';
            this.ctx.fillText(item.text, legendX + 35, legendY + item.y + 4);
        });
    }
}

// Global instance
let mapSystem = new MapNavigationSystem();

// Global functions for button interactions
function findRoute() {
    const startId = parseInt(document.getElementById('startNode').value);
    const endId = parseInt(document.getElementById('endNode').value);
    const algorithm = document.getElementById('algorithm').value;
    
    if (isNaN(startId) || isNaN(endId)) {
        alert('Please select both start and destination points.');
        return;
    }
    
    if (startId === endId) {
        alert('Start and destination cannot be the same.');
        return;
    }
    
    // Show loading
    document.getElementById('loading').style.display = 'block';
    document.getElementById('stats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    
    setTimeout(() => {
        const startTime = performance.now();
        let result;
        
        if (algorithm === 'astar') {
            result = mapSystem.aStar(startId, endId);
        } else {
            result = mapSystem.dijkstra(startId, endId);
        }
        
        const endTime = performance.now();
        const computeTime = (endTime - startTime).toFixed(2);
        
        mapSystem.visitedNodes = result.visitedOrder;
        mapSystem.currentPath = mapSystem.reconstructPath(result.previous, startId, endId);
        
        if (mapSystem.currentPath.length === 0) {
            alert('No route found between selected points.');
            document.getElementById('loading').style.display = 'none';
            return;
        }
        
        const pathInfo = mapSystem.generateTurnInstructions(mapSystem.currentPath);
        
        // Update stats
        document.getElementById('totalDistance').textContent = Math.round(pathInfo.totalDistance) + ' units';
        document.getElementById('nodesVisited').textContent = result.visitedOrder.length;
        document.getElementById('computeTime').textContent = computeTime + ' ms';
        document.getElementById('algorithmUsed').textContent = algorithm === 'astar' ? 'A* Search' : 'Dijkstra\'s Algorithm';
        
        // Update instructions
        const instructionsList = document.getElementById('instructionsList');
        instructionsList.innerHTML = '';
        pathInfo.instructions.forEach((instruction, index) => {
            const div = document.createElement('div');
            div.className = 'instruction-item';
            div.innerHTML = `
                <strong>${index + 1}.</strong> ${instruction.instruction}
                ${instruction.distance > 0 ? `<br><small>Distance: ${instruction.distance} units</small>` : ''}
            `;
            instructionsList.appendChild(div);
        });
        
        // Show results
        document.getElementById('loading').style.display = 'none';
        document.getElementById('stats').style.display = 'block';
        document.getElementById('instructions').style.display = 'block';
        
        mapSystem.draw();
    }, 100);
}

function clearRoute() {
    mapSystem.currentPath = [];
    mapSystem.visitedNodes = [];
    document.getElementById('stats').style.display = 'none';
    document.getElementById('instructions').style.display = 'none';
    document.getElementById('startNode').value = '';
    document.getElementById('endNode').value = '';
    mapSystem.draw();
}

function generateRandomGraph() {
    mapSystem.generateRandomGraph();
    clearRoute();
}