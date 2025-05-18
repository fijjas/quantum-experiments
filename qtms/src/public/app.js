/**
 * Client script for interacting with the quantum time messaging system
 */

// Establish connection with the server via WebSocket
const socket = io();

// Interface elements
const messageInput = document.getElementById('messageInput');
const sendButton = document.getElementById('sendButton');
const originalMessage = document.getElementById('originalMessage');
const decodedMessage = document.getElementById('decodedMessage');
const accuracyValue = document.getElementById('accuracyValue');
const originalBits = document.getElementById('originalBits');
const redundantBits = document.getElementById('redundantBits');
const experimentResults = document.getElementById('experimentResults');
const experimentLog = document.getElementById('experimentLog').querySelector('tbody');
const recommendationsList = document.getElementById('recommendationsList');
const progressBar = document.querySelector('.progress-bar');
const statusIndicator = document.querySelector('.status-indicator');
const updateParametersButton = document.getElementById('updateParametersButton');
const presetButtons = document.querySelectorAll('.preset-button');
const tabButtons = document.querySelectorAll('.tab-button');
const tabPanes = document.querySelectorAll('.tab-pane');

// Parameter sliders
const parameterSliders = {
    predeterminationFactor: document.getElementById('predeterminationFactor'),
    temporalCorrelation: document.getElementById('temporalCorrelation'),
    timeEntanglement: document.getElementById('timeEntanglement'),
    consistencyParameter: document.getElementById('consistencyParameter'),
    redundancyFactor: document.getElementById('redundancyFactor')
};

// Current parameters
let currentParameters = {};

// Chart for analysis
let parameterImpactChart = null;

// Initialization
function init() {
    // Get current parameters from server
    fetch('/api/parameters')
        .then(response => response.json())
        .then(parameters => {
            updateParameterSliders(parameters);
            currentParameters = parameters;
        })
        .catch(error => console.error('Error getting parameters:', error));
    
    // Get experiment log
    fetch('/api/log')
        .then(response => response.json())
        .then(logs => {
            updateExperimentLog(logs);
        })
        .catch(error => console.error('Error getting log:', error));
    
    // Initialize chart
    initChart();
    
    // Set up event listeners
    setupEventListeners();
    
    // Set up WebSocket listeners
    setupSocketListeners();
}

// Update parameter sliders
function updateParameterSliders(parameters) {
    for (const [param, value] of Object.entries(parameters)) {
        if (parameterSliders[param]) {
            parameterSliders[param].value = value;
            parameterSliders[param].nextElementSibling.textContent = value;
        }
    }
}

// Initialize chart
function initChart() {
    const ctx = document.createElement('canvas');
    document.getElementById('parameterImpactChart').appendChild(ctx);
    
    parameterImpactChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Transmission Accuracy',
                data: [],
                borderColor: '#6200ee',
                backgroundColor: 'rgba(187, 134, 252, 0.2)',
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 1,
                    title: {
                        display: true,
                        text: 'Accuracy'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Experiment'
                    }
                }
            }
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Send message
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            transmitMessage(message);
        }
    });
    
    // Update parameters
    updateParametersButton.addEventListener('click', () => {
        const newParameters = {};
        for (const [param, slider] of Object.entries(parameterSliders)) {
            newParameters[param] = parseFloat(slider.value);
        }
        
        updateParameters(newParameters);
    });
    
    // Parameter presets
    presetButtons.forEach(button => {
        button.addEventListener('click', () => {
            const preset = button.dataset.preset;
            applyPreset(preset);
            
            // Visual highlight of active preset
            presetButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
        });
    });
    
    // Handlers for parameter sliders
    for (const [param, slider] of Object.entries(parameterSliders)) {
        slider.addEventListener('input', () => {
            slider.nextElementSibling.textContent = slider.value;
        });
    }
    
    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;
            
            // Hide all tabs and remove active class from buttons
            tabPanes.forEach(pane => pane.classList.remove('active'));
            tabButtons.forEach(btn => btn.classList.remove('active'));
            
            // Show selected tab and activate button
            document.getElementById(`${tabId}Tab`).classList.add('active');
            button.classList.add('active');
            
            // If analysis tab is selected, update data
            if (tabId === 'analysis') {
                updateAnalysis();
            }
        });
    });
}

// Set up WebSocket listeners
function setupSocketListeners() {
    // Parameter updates
    socket.on('parameters', (parameters) => {
        updateParameterSliders(parameters);
        currentParameters = parameters;
    });
    
    // Transmission start
    socket.on('transmission_started', (data) => {
        statusIndicator.textContent = 'Starting transmission...';
        progressBar.style.width = '10%';
        
        // Clear previous results
        originalMessage.textContent = data.message;
        decodedMessage.textContent = '';
        originalBits.innerHTML = '';
        redundantBits.innerHTML = '';
        experimentResults.innerHTML = '';
    });
    
    // Message to bits conversion
    socket.on('message_to_bits', (data) => {
        statusIndicator.textContent = 'Encoding message to bits...';
        progressBar.style.width = '20%';
        
        // Display bits
        displayBits(originalBits, data.messageBits);
    });
    
    // Redundancy addition
    socket.on('redundancy_added', (data) => {
        statusIndicator.textContent = 'Adding redundancy...';
        progressBar.style.width = '30%';
        
        // Display redundant bits
        displayBits(redundantBits, data.redundantBits);
    });
    
    // Experiment update
    socket.on('experiment_update', (data) => {
        const progress = 30 + (data.index / data.totalExperiments) * 60;
        statusIndicator.textContent = `Performing quantum experiment ${data.index + 1}...`;
        progressBar.style.width = `${progress}%`;
        
        // Animate experiment
        animateExperiment(data.bit, data.result);
        
        // Add experiment result
        const bitElement = document.createElement('div');
        bitElement.className = `bit bit-${data.result}`;
        bitElement.textContent = data.result;
        experimentResults.appendChild(bitElement);
    });
    
    // Transmission completion
    socket.on('transmission_completed', (data) => {
        statusIndicator.textContent = 'Transmission complete';
        progressBar.style.width = '100%';
        
        // Display results
        decodedMessage.textContent = data.decodedMessage;
        accuracyValue.textContent = `${(data.accuracy * 100).toFixed(2)}%`;
        
        // Update log
        fetch('/api/log')
            .then(response => response.json())
            .then(logs => {
                updateExperimentLog(logs);
                updateChart(logs);
            });
    });
    
    // Error handling
    socket.on('error', (data) => {
        statusIndicator.textContent = `Error: ${data.message}`;
        console.error('WebSocket error:', data.message);
    });
}

// Display bits
function displayBits(container, bits) {
    container.innerHTML = '';
    
    bits.forEach(bit => {
        const bitElement = document.createElement('div');
        bitElement.className = `bit bit-${bit}`;
        bitElement.textContent = bit;
        container.appendChild(bitElement);
    });
}

// Animate experiment
function animateExperiment(inputBit, resultBit) {
    const photon = document.querySelector('.photon');
    const secondSplitter = document.querySelector('.second-splitter');
    const detector0 = document.querySelector('.detector-0');
    const detector1 = document.querySelector('.detector-1');
    const path0 = document.querySelector('.path-0');
    const path1 = document.querySelector('.path-1');
    
    // Reset previous animation
    photon.style.animation = 'none';
    detector0.style.animation = 'none';
    detector1.style.animation = 'none';
    path0.style.animation = 'none';
    path1.style.animation = 'none';
    
    // Set second beam splitter based on input bit
    secondSplitter.style.opacity = inputBit === 1 ? '1' : '0.2';
    
    // Start photon animation
    setTimeout(() => {
        photon.style.animation = 'photon-move 2s forwards';
        
        // Animate path and detector based on result
        setTimeout(() => {
            if (resultBit === 0) {
                path0.style.animation = 'path-highlight 1.5s';
                detector0.style.animation = 'detector-activate 1.5s';
            } else {
                path1.style.animation = 'path-highlight 1.5s';
                detector1.style.animation = 'detector-activate 1.5s';
            }
        }, 1000);
    }, 100);
}

// Update experiment log
function updateExperimentLog(logs) {
    experimentLog.innerHTML = '';
    
    logs.forEach(log => {
        if (log.type === 'message_transmission') {
            const row = document.createElement('tr');
            
            const timeCell = document.createElement('td');
            timeCell.textContent = new Date(log.timestamp).toLocaleString();
            
            const messageCell = document.createElement('td');
            messageCell.textContent = `"${log.originalMessage}" → "${log.decodedMessage}"`;
            
            const accuracyCell = document.createElement('td');
            accuracyCell.textContent = `${(log.accuracy * 100).toFixed(2)}%`;
            
            const paramsCell = document.createElement('td');
            paramsCell.textContent = Object.entries(log.parameters)
                .filter(([key]) => ['predeterminationFactor', 'temporalCorrelation', 'timeEntanglement'].includes(key))
                .map(([key, value]) => `${key.substring(0, 3)}: ${value.toFixed(2)}`)
                .join(', ');
            
            row.appendChild(timeCell);
            row.appendChild(messageCell);
            row.appendChild(accuracyCell);
            row.appendChild(paramsCell);
            
            experimentLog.appendChild(row);
        }
    });
}

// Update chart
function updateChart(logs) {
    const transmissionLogs = logs.filter(log => log.type === 'message_transmission');
    
    if (transmissionLogs.length === 0) return;
    
    const labels = transmissionLogs.map((_, index) => `#${index + 1}`);
    const accuracies = transmissionLogs.map(log => log.accuracy);
    
    parameterImpactChart.data.labels = labels;
    parameterImpactChart.data.datasets[0].data = accuracies;
    parameterImpactChart.update();
}

// Update analysis
function updateAnalysis() {
    fetch('/api/analysis')
        .then(response => response.json())
        .then(analysis => {
            // Update recommendations
            recommendationsList.innerHTML = '';
            
            if (analysis.recommendations && analysis.recommendations.length > 0) {
                analysis.recommendations.forEach(rec => {
                    const li = document.createElement('li');
                    li.textContent = `Recommended to change ${rec.parameter} from ${rec.currentValue.toFixed(2)} to ${rec.recommendedValue.toFixed(2)} for an accuracy improvement of ${(rec.expectedImprovement * 100).toFixed(2)}%`;
                    recommendationsList.appendChild(li);
                });
            } else {
                const li = document.createElement('li');
                li.textContent = 'No parameter optimization recommendations at this time.';
                recommendationsList.appendChild(li);
            }
        })
        .catch(error => console.error('Error getting analysis:', error));
}

// Transmit message
function transmitMessage(message) {
    socket.emit('transmit_message', { message });
}

// Update parameters
function updateParameters(parameters) {
    socket.emit('update_parameters', parameters);
}

// Apply preset
function applyPreset(presetName) {
    socket.emit('apply_preset', { presetName });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
