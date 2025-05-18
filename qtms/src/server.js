/**
 * Main server file for quantum time messaging demonstration
 * Creates a web server and interface for interacting with the system
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const QuantumExperiment = require('./quantum-experiment');
const MessageEncoder = require('./message-encoder');
const HiddenParametersManager = require('./hidden-parameters-manager');

// Create Express application instance
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Configure static files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// Create instances of our classes
const parametersManager = new HiddenParametersManager();
let messageEncoder = new MessageEncoder(parametersManager.getParameters());

// Experiment log
const experimentLog = [];

// API routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API for getting current parameters
app.get('/api/parameters', (req, res) => {
  res.json(parametersManager.getParameters());
});

// API for updating parameters
app.post('/api/parameters', (req, res) => {
  const success = parametersManager.updateParameters(req.body);
  
  if (success) {
    // Update message encoder with new parameters
    messageEncoder = new MessageEncoder(parametersManager.getParameters());
    res.json({ success: true, parameters: parametersManager.getParameters() });
  } else {
    res.status(400).json({ success: false, message: 'Invalid parameters' });
  }
});

// API for applying presets
app.post('/api/parameters/preset/:name', (req, res) => {
  const presetName = req.params.name;
  const parameters = parametersManager.getPreset(presetName);
  
  // Update message encoder with new parameters
  messageEncoder = new MessageEncoder(parameters);
  
  res.json({ success: true, parameters });
});

// API for message transmission
app.post('/api/transmit', (req, res) => {
  const { message } = req.body;
  
  if (!message) {
    return res.status(400).json({ success: false, message: 'Message is required' });
  }
  
  // Simulate message transmission
  const result = messageEncoder.simulateTimeTransmission(message);
  
  // Add to log
  experimentLog.push({
    timestamp: Date.now(),
    type: 'message_transmission',
    originalMessage: message,
    decodedMessage: result.decodedMessage,
    accuracy: result.accuracy,
    parameters: parametersManager.getParameters()
  });
  
  res.json({ success: true, result });
});

// API for getting experiment log
app.get('/api/log', (req, res) => {
  res.json(experimentLog);
});

// API for getting metrics
app.get('/api/metrics', (req, res) => {
  res.json(parametersManager.getMetrics());
});

// API for parameter analysis
app.get('/api/analysis', (req, res) => {
  const analysis = parametersManager.analyzeParameterImpact(experimentLog);
  res.json(analysis);
});

// WebSocket setup for real-time updates
io.on('connection', (socket) => {
  console.log('New WebSocket connection');
  
  // Send current parameters on connection
  socket.emit('parameters', parametersManager.getParameters());
  
  // Handle message transmission request via WebSocket
  socket.on('transmit_message', (data) => {
    const { message } = data;
    
    if (!message) {
      socket.emit('error', { message: 'Message is required' });
      return;
    }
    
    // Emulate transmission process with intermediate updates
    socket.emit('transmission_started', { message });
    
    // Convert message to bits
    const messageBits = messageEncoder.textToBits(message);
    socket.emit('message_to_bits', { messageBits });
    
    // Add redundancy
    const redundantBits = messageEncoder.addRedundancy(messageBits);
    socket.emit('redundancy_added', { redundantBits });
    
    // Emulate quantum experiments with delay for visualization
    const experimentResults = [];
    const secondBeamSplitterChoices = [];
    
    // Function to emulate one experiment with delay
    const runExperiment = (index) => {
      if (index >= redundantBits.length) {
        // All experiments completed, decode message
        const decodedMessage = messageEncoder.decodeMessage(
          experimentResults,
          secondBeamSplitterChoices
        );
        
        // Calculate accuracy
        const accuracy = calculateAccuracy(message, decodedMessage);
        
        // Send final result
        socket.emit('transmission_completed', {
          originalMessage: message,
          decodedMessage,
          accuracy,
          experimentCount: experimentResults.length
        });
        
        // Add to log
        experimentLog.push({
          timestamp: Date.now(),
          type: 'message_transmission',
          originalMessage: message,
          decodedMessage,
          accuracy,
          parameters: parametersManager.getParameters()
        });
        
        return;
      }
      
      // Get current bit
      const bit = redundantBits[index];
      
      // Create new experiment
      const experiment = new QuantumExperiment(parametersManager.getParameters());
      
      // Run experiment
      const result = experiment.encodeBit(bit);
      
      // Save result
      experimentResults.push(result);
      secondBeamSplitterChoices.push(bit === 1);
      
      // Send update about current experiment
      socket.emit('experiment_update', {
        index,
        bit,
        result,
        experimentState: experiment.getState()
      });
      
      // Run next experiment with delay
      setTimeout(() => runExperiment(index + 1), 100);
    };
    
    // Start experiment emulation
    runExperiment(0);
  });
  
  // Handle parameter update request via WebSocket
  socket.on('update_parameters', (data) => {
    const success = parametersManager.updateParameters(data);
    
    if (success) {
      // Update message encoder with new parameters
      messageEncoder = new MessageEncoder(parametersManager.getParameters());
      
      // Send updated parameters to all clients
      io.emit('parameters', parametersManager.getParameters());
    } else {
      socket.emit('error', { message: 'Invalid parameters' });
    }
  });
  
  // Handle preset application request via WebSocket
  socket.on('apply_preset', (data) => {
    const { presetName } = data;
    const parameters = parametersManager.getPreset(presetName);
    
    // Update message encoder with new parameters
    messageEncoder = new MessageEncoder(parameters);
    
    // Send updated parameters to all clients
    io.emit('parameters', parameters);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('Client disconnected from WebSocket');
  });
});

// Helper function to calculate accuracy
function calculateAccuracy(original, decoded) {
  // If message lengths don't match, trim to minimum length
  const minLength = Math.min(original.length, decoded.length);
  let matchCount = 0;
  
  for (let i = 0; i < minLength; i++) {
    if (original[i] === decoded[i]) {
      matchCount++;
    }
  }
  
  // Count length difference as errors
  const lengthDiff = Math.abs(original.length - decoded.length);
  
  return matchCount / (minLength + lengthDiff);
}

// Start server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser to access the demonstration`);
});

module.exports = { app, server };
