class Node {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.neighbors = {
            'UP': null,
            'DOWN': null,
            'LEFT': null,
            'RIGHT': null
        };
        this.element = this.createElement();
        this.lines = []; // To store line elements
    }

    createElement() {
        const div = document.createElement('div');
        div.classList.add('circle');
        div.style.left = `${this.x - 10}px`; // Center the circle element
        div.style.top = `${this.y - 10}px`; // Center the circle element
        document.getElementById('circle-container').appendChild(div);
        return div;
    }

    setNeighbor(node, direction) {
        this.neighbors[direction] = node;
    }

    updateColor(color = 'transparent') {
        this.element.style.backgroundColor = color;
    }

    drawLines(currentNode) {
        // Remove previous lines
        this.lines.forEach(line => line.remove());
        this.lines = [];

        if (this === currentNode) {
            for (const [direction, neighbor] of Object.entries(this.neighbors)) {
                if (neighbor) {
                    const line = this.createLineTo(neighbor);
                    document.getElementById('circle-container').appendChild(line);
                    this.lines.push(line);
                }
            }
        }
    }

    createLineTo(neighbor) {
        const line = document.createElement('div');
        line.classList.add('line');
        const radius = 10; // Circle radius

        const dx = neighbor.x - this.x;
        const dy = neighbor.y - this.y;
        const length = Math.sqrt(dx * dx + dy * dy) - radius;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // Adjust line start and end positions
        const startX = this.x;
        const startY = this.y;

        line.style.width = `${length}px`;
        line.style.height = '2px'; // Line thickness
        line.style.backgroundColor = '#e43d11';
        line.style.position = 'absolute';
        line.style.transform = `rotate(${angle}deg)`;
        line.style.transformOrigin = '0 0'; // Rotate from the start point
        line.style.left = `${startX}px`;
        line.style.top = `${startY}px`;

        return line;
    }
}

class Graph {
    constructor(nodes) {
        this.nodes = nodes;
        this.currentNode = this.nodes[0];
        this.currentNode.updateColor('#e43d11');
        this.currentNode.drawLines(this.currentNode); // Draw lines for initial node
    }

    move(direction) {
        const nextNode = this.currentNode.neighbors[direction];
        if (nextNode) {
            this.currentNode.updateColor(); // Reset previous node color
            this.currentNode.drawLines(null); // Clear lines for previous node
            this.currentNode = nextNode;
            this.currentNode.updateColor('#e43d11'); // Highlight new current node
            this.currentNode.drawLines(this.currentNode); // Draw lines for new current node
        }
    }
}

function findNeighborsHeatMap(nodes) {
    nodes.forEach(currNode => {
        let minMatchValue = { 'UP': Infinity, 'DOWN': Infinity, 'LEFT': Infinity, 'RIGHT': Infinity };

        nodes.forEach(node => {
            if (node === currNode) return;

            const dx = node.x - currNode.x;
            const dy = node.y - currNode.y;
            const matchValue = Math.abs(dx) + Math.abs(dy);

            if (dy <= dx && dy <=-dx) {
                if (matchValue < minMatchValue['UP']) {
                    currNode.setNeighbor(node, 'UP');
                    minMatchValue['UP'] = matchValue;
                }
            } else if (dy >= dx && dy >=-dx)  {
                if (matchValue < minMatchValue['DOWN']) {
                    currNode.setNeighbor(node, 'DOWN');
                    minMatchValue['DOWN'] = matchValue;
                }
            } else if (dy >= dx && dy <=-dx) {
                if (matchValue < minMatchValue['LEFT']) {
                    currNode.setNeighbor(node, 'LEFT');
                    minMatchValue['LEFT'] = matchValue;
                }
            } else if (dy <= dx && dy >=-dx) {
                if (matchValue < minMatchValue['RIGHT']) {
                    currNode.setNeighbor(node, 'RIGHT');
                    minMatchValue['RIGHT'] = matchValue;
                }
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    // Set default value for number of nodes
    let graph = null;

    // Hard coded nodes (NODE ARRAY HERE)
    const hardCodedNodes = [
        // { x: 100, y: 100 },
        // { x: 200, y: 150 },
        // { x: 300, y: 200 },
        // { x: 400, y: 250 }
    ];

    function createHardCodedNodes(nodesArray) {
        const nodes = nodesArray.map(node => new Node(node.x, node.y));
        findNeighborsHeatMap(nodes);
        return nodes;
    }

    document.addEventListener('keydown', function(event) {
        if (!graph) return;

        switch (event.key) {
            case 'ArrowUp':
                graph.move('UP');
                break;
            case 'ArrowDown':
                graph.move('DOWN');
                break;
            case 'ArrowLeft':
                graph.move('LEFT');
                break;
            case 'ArrowRight':
                graph.move('RIGHT');
                break;
        }
    });

    let recording = false;
    let recordCount = 0;

    document.getElementById('record-poi-btn').addEventListener('click', function() {
        recording = true;
        recordCount = 0;
        document.getElementById('record-poi-btn').style.boxShadow='0 1px var(--palletValue4Shadow)';
        document.getElementById('record-poi-btn').style.transform='translateY(2px)';
        document.getElementById('record-poi-btn').style.cursor='auto';
        document.getElementById('record-poi-btn').disabled=true;

        document.getElementById('clear-background-btn').style.boxShadow='0 1px var(--palletValue1Shadow)';
        document.getElementById('clear-background-btn').style.transform='translateY(2px)';
        document.getElementById('clear-background-btn').style.cursor='auto';
        document.getElementById('clear-background-btn').disabled=true;


        // Clear existing graph
        const circleContainer = document.getElementById('circle-container');
        circleContainer.innerHTML = '';
        graph = null;

        console.log('Recording started. Click on the area to add nodes.');
    });

    document.getElementById('done-recording-btn').addEventListener('click', function() {
        recording = false;
        document.getElementById('record-poi-btn').style.boxShadow='0 5px var(--palletValue4Shadow)';
        document.getElementById('record-poi-btn').style.transform='translateY(-2px)';
        document.getElementById('record-poi-btn').style.cursor='pointer';
        document.getElementById('record-poi-btn').disabled=false;

        document.getElementById('clear-background-btn').style.boxShadow='0 5px var(--palletValue1Shadow)';
        document.getElementById('clear-background-btn').style.transform='translateY(-2px)';
        document.getElementById('clear-background-btn').style.cursor='pointer';
        document.getElementById('clear-background-btn').disabled=false;


        if (graph) {
            findNeighborsHeatMap(graph.nodes);
            graph.currentNode.drawLines(graph.currentNode); // Draw lines for the current node
        }

        console.log('Recording stopped.');
    });

    document.getElementById('circle-container').addEventListener('click', function(event) {
        if (recording && recordCount < 30) {
            const x = event.clientX; // Adjust for sidebar width
            const y = event.clientY; // Adjust for navbar height

            if (x > 40 && y > 40) { // Ensure not overlapping with sidebar and navbar
                const node = new Node(x, y);
                if (!graph) {
                    graph = new Graph([node]);
                } else {
                    graph.nodes.push(node);
                }
                recordCount++;
            }
        }
    });

    const imageList = [
        '',
        'images/image2.png'                   // Add more image paths here
    ];
    let currentImageIndex = 0;

    document.getElementById('generate-examples-btn').addEventListener('click', function() {
        currentImageIndex = (currentImageIndex + 1) % imageList.length;
        const backgroundUrl = imageList[currentImageIndex];
        document.getElementById('circle-container').style.backgroundImage = `url(${backgroundUrl})`;
        document.getElementById('circle-container').style.backgroundRepeat='no-repeat';
        document.getElementById('circle-container').style.backgroundSize= '100% 100%';
        console.log('Background image set to:', backgroundUrl);
    });

    // Load hardcoded nodes on page load
    const nodes = createHardCodedNodes(hardCodedNodes);
    graph = new Graph(nodes);
});

document.getElementById('clear-background-btn').addEventListener('click', function() {
    const circleContainer = document.getElementById('circle-container');

    circleContainer.innerHTML = '';
    graph = null;

    console.log('Background image cleared.');
});
