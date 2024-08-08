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
        div.style.left = `${this.x - 20}px`; // Center the circle element
        div.style.top = `${this.y - 20}px`; // Center the circle element
        document.getElementById('circle-container').appendChild(div);
        return div;
    }

    setNeighbor(node, direction) {
        this.neighbors[direction] = node;
    }

    updateColor(color = '#f7f7f7') {
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
        const radius = 20; // Circle radius

        const dx = neighbor.x - this.x;
        const dy = neighbor.y - this.y;
        const length = Math.sqrt(dx * dx + dy * dy) - radius;
        const angle = Math.atan2(dy, dx) * (180 / Math.PI);

        // Adjust line start and end positions
        const startX = this.x;
        const startY = this.y;

        line.style.width = `${length}px`;
        line.style.height = '2px'; // Line thickness
        line.style.backgroundColor = '#143109';
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
        this.currentNode.updateColor('#143109');
        this.currentNode.drawLines(this.currentNode); // Draw lines for initial node
    }

    move(direction) {
        const nextNode = this.currentNode.neighbors[direction];
        if (nextNode) {
            this.currentNode.updateColor(); // Reset previous node color
            this.currentNode.drawLines(null); // Clear lines for previous node
            this.currentNode = nextNode;
            this.currentNode.updateColor('#143109'); // Highlight new current node
            this.currentNode.drawLines(this.currentNode); // Draw lines for new current node
        }
    }
}

function createRandomPOI(screenWidth, screenHeight, numNodes) {
    const nodeRadius = 20; // Circle radius
    const maxX = screenWidth - 2 * nodeRadius; // Adjusted for the sidebar
    const maxY = screenHeight - 2 * nodeRadius; // Adjusted for the navbar
    const minX = 2 * nodeRadius
    const minY = 2 * nodeRadius


    const nodes = [];
    for (let i = 0; i < numNodes; i++) {
        const x = Math.floor(Math.random() * (maxX - minX) + minX);
        const y = Math.floor(Math.random() * (maxY - minY) + minY);
        nodes.push(new Node(x, y));
    }
    return nodes;
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
    document.getElementById('num-nodes').value = 15;

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

    document.getElementById('generate-poi-btn').addEventListener('click', function() {
        const screenWidth = window.innerWidth;
        const screenHeight = window.innerHeight;
        const numNodes = parseInt(document.getElementById('num-nodes').value) || 20;

        // Clear existing nodes and lines
        const circleContainer = document.getElementById('circle-container');
        circleContainer.innerHTML = '';

        const nodes = createRandomPOI(screenWidth, screenHeight, numNodes);
        findNeighborsHeatMap(nodes);
        graph = new Graph(nodes);

        console.log(`${numNodes} random points of interest generated.`);
    });

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
        document.getElementById('record-poi-btn').style.boxShadow='0 1px var(--palletValue2)';
        document.getElementById('record-poi-btn').style.transform='translateY(2px)';
        document.getElementById('record-poi-btn').style.cursor='auto';

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
        if (graph) {
            findNeighborsHeatMap(graph.nodes);
            graph.currentNode.drawLines(graph.currentNode); // Draw lines for the current node
        }

        console.log('Recording stopped.');
    });

    document.getElementById('circle-container').addEventListener('click', function(event) {
        if (recording && recordCount < 30) {
            const x = event.clientX - 200; // Adjust for sidebar width
            const y = event.clientY - 40; // Adjust for navbar height

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
        'images/image1.png',
        'images/image2.png'  // Add more image paths here
    ];
    let currentImageIndex = 0;

    document.getElementById('set-background-btn').addEventListener('click', function() {
        currentImageIndex = (currentImageIndex + 1) % imageList.length;
        const backgroundUrl = imageList[currentImageIndex];
        document.getElementById('circle-container').style.backgroundImage = `url(${backgroundUrl})`;
        document.getElementById('circle-container').style.backgroundSize='contain';
        console.log('Background image set to:', backgroundUrl);
    });

    document.getElementById('clear-background-btn').addEventListener('click', function() {
        document.getElementById('circle-container').style.backgroundImage = '';
        console.log('Background image cleared.');
    });

    // Load hardcoded nodes on page load
    const nodes = createHardCodedNodes(hardCodedNodes);
    graph = new Graph(nodes);
});

document.getElementById('set-background-btn').addEventListener('click', function() {
    currentImageIndex = (currentImageIndex + 1) % imageList.length;
    const backgroundUrl = imageList[currentImageIndex];
    const circleContainer = document.getElementById('circle-container');
    circleContainer.style.backgroundImage = `url(${backgroundUrl})`;
    circleContainer.style.backgroundSize = 'contain'; // Ensure image fits within the container
    circleContainer.style.backgroundRepeat = 'no-repeat'; // Prevent repeating
    circleContainer.style.backgroundPosition = 'center center'; // Center image horizontally and vertically
    console.log('Background image set to:', backgroundUrl);
});


document.getElementById('clear-background-btn').addEventListener('click', function() {
    const circleContainer = document.getElementById('circle-container');
    circleContainer.style.backgroundImage = '';
    circleContainer.style.backgroundSize = ''; // Reset the background size
    circleContainer.style.backgroundRepeat = ''; // Reset the background repeat
    circleContainer.style.backgroundPosition = ''; // Reset the background position
    console.log('Background image cleared.');
});
