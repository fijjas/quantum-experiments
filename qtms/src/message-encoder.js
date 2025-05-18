/**
 * Module for encoding and decoding text messages
 * using quantum experiments with delayed choice
 */

const QuantumExperiment = require('./quantum-experiment');

class MessageEncoder {
  constructor(hiddenParameters = {}) {
    // Initialize parameters
    this.hiddenParameters = {
      errorCorrectionLevel: hiddenParameters.errorCorrectionLevel || 0.9, // Error correction level
      redundancyFactor: hiddenParameters.redundancyFactor || 2, // Redundancy factor for reliability
      ...hiddenParameters
    };
    
    // Create an instance of quantum experiment with the provided hidden parameters
    this.quantumExperiment = new QuantumExperiment(hiddenParameters);
    
    // Experiment log for debugging and analysis
    this.experimentLog = [];
  }
  
  /**
   * Converts text to an array of bits
   * @param {string} text - Source text
   * @returns {Array<number>} Array of bits (0 and 1)
   */
  textToBits(text) {
    const bits = [];
    
    // Convert each character to its ASCII/UTF-8 representation
    for (let i = 0; i < text.length; i++) {
      const charCode = text.charCodeAt(i);
      
      // Convert character code to 8 bits (byte)
      for (let j = 7; j >= 0; j--) {
        bits.push((charCode >> j) & 1);
      }
    }
    
    return bits;
  }
  
  /**
   * Converts an array of bits back to text
   * @param {Array<number>} bits - Array of bits (0 and 1)
   * @returns {string} Decoded text
   */
  bitsToText(bits) {
    let text = '';
    
    // Check that the number of bits is a multiple of 8
    if (bits.length % 8 !== 0) {
      console.warn(`Number of bits (${bits.length}) is not a multiple of 8. Adding zeros for alignment.`);
      while (bits.length % 8 !== 0) {
        bits.push(0);
      }
    }
    
    // Convert each 8 bits to a character
    for (let i = 0; i < bits.length; i += 8) {
      let charCode = 0;
      for (let j = 0; j < 8; j++) {
        charCode = (charCode << 1) | bits[i + j];
      }
      text += String.fromCharCode(charCode);
    }
    
    return text;
  }
  
  /**
   * Adds redundancy to bits for error correction
   * @param {Array<number>} bits - Original bits
   * @returns {Array<number>} Bits with redundancy
   */
  addRedundancy(bits) {
    const redundantBits = [];
    
    // Simple redundancy scheme: repeat each bit several times
    const repetitions = this.hiddenParameters.redundancyFactor;
    
    for (const bit of bits) {
      for (let i = 0; i < repetitions; i++) {
        redundantBits.push(bit);
      }
    }
    
    return redundantBits;
  }
  
  /**
   * Removes redundancy from bits and restores original data
   * @param {Array<number>} redundantBits - Bits with redundancy
   * @returns {Array<number>} Restored original bits
   */
  removeRedundancy(redundantBits) {
    const originalBits = [];
    const repetitions = this.hiddenParameters.redundancyFactor;
    
    // Check that the number of bits is a multiple of the redundancy factor
    if (redundantBits.length % repetitions !== 0) {
      console.warn(`Number of bits (${redundantBits.length}) is not a multiple of the redundancy factor (${repetitions}). Adding zeros for alignment.`);
      while (redundantBits.length % repetitions !== 0) {
        redundantBits.push(0);
      }
    }
    
    // For each group of repeating bits, choose the most frequent one
    for (let i = 0; i < redundantBits.length; i += repetitions) {
      const group = redundantBits.slice(i, i + repetitions);
      const sum = group.reduce((acc, val) => acc + val, 0);
      // If more than half of the bits in the group are 1, then the result is 1, otherwise 0
      originalBits.push(sum > repetitions / 2 ? 1 : 0);
    }
    
    return originalBits;
  }
  
  /**
   * Encodes a message using quantum experiments
   * @param {string} message - Original text message
   * @returns {Object} Encoding result with metadata
   */
  encodeMessage(message) {
    // Convert message to bits
    const messageBits = this.textToBits(message);
    
    // Add redundancy for error correction
    const redundantBits = this.addRedundancy(messageBits);
    
    // Experiment results
    const experimentResults = [];
    // Second beam splitter choices (for decoding)
    const secondBeamSplitterChoices = [];
    
    // For each bit, conduct a separate quantum experiment
    for (const bit of redundantBits) {
      // Create a new experiment instance for each bit
      const experiment = new QuantumExperiment(this.hiddenParameters);
      
      // Encode bit using the experiment
      const result = experiment.encodeBit(bit);
      
      // Save result and choice for decoding
      experimentResults.push(result);
      secondBeamSplitterChoices.push(bit === 1); // true for bit 1, false for bit 0
      
      // Record in log for analysis
      this.experimentLog.push({
        originalBit: bit,
        experimentResult: result,
        secondBeamSplitterPresent: bit === 1,
        experimentState: experiment.getState()
      });
    }
    
    return {
      originalMessage: message,
      messageBits,
      redundantBits,
      experimentResults,
      secondBeamSplitterChoices,
      timestamp: Date.now()
    };
  }
  
  /**
   * Decodes a message from quantum experiment results
   * @param {Array<number>} experimentResults - Experiment results
   * @param {Array<boolean>} secondBeamSplitterChoices - Second beam splitter choices
   * @returns {string} Decoded message
   */
  decodeMessage(experimentResults, secondBeamSplitterChoices) {
    // Check array length correspondence
    if (experimentResults.length !== secondBeamSplitterChoices.length) {
      throw new Error('Number of experiment results does not match the number of beam splitter choices');
    }
    
    // Decode bits from experiment results
    const decodedRedundantBits = [];
    
    for (let i = 0; i < experimentResults.length; i++) {
      const result = experimentResults[i];
      const choice = secondBeamSplitterChoices[i];
      
      // Create a new experiment instance for decoding
      const experiment = new QuantumExperiment(this.hiddenParameters);
      
      // Decode bit
      const decodedBit = experiment.decodeBit(result, choice);
      decodedRedundantBits.push(decodedBit);
    }
    
    // Remove redundancy
    const decodedBits = this.removeRedundancy(decodedRedundantBits);
    
    // Convert bits back to text
    return this.bitsToText(decodedBits);
  }
  
  /**
   * Simulates sending a message "back in time"
   * @param {string} message - Original message
   * @returns {Object} Simulation result
   */
  simulateTimeTransmission(message) {
    console.log(`Starting simulation of sending message "${message}" back in time`);
    
    // Step 1: Encode the message
    const encodingResult = this.encodeMessage(message);
    console.log(`Message encoded into ${encodingResult.redundantBits.length} bits (with redundancy)`);
    
    // Step 2: Simulate "sending to the past" through quantum entanglement in time
    console.log('Simulating quantum entanglement in time...');
    
    // Step 3: Decode the message from experiment results
    const decodedMessage = this.decodeMessage(
      encodingResult.experimentResults,
      encodingResult.secondBeamSplitterChoices
    );
    
    console.log(`Message decoded: "${decodedMessage}"`);
    
    // Check transmission accuracy
    const accuracy = this._calculateAccuracy(message, decodedMessage);
    console.log(`Transmission accuracy: ${(accuracy * 100).toFixed(2)}%`);
    
    return {
      originalMessage: message,
      decodedMessage,
      accuracy,
      experimentCount: encodingResult.experimentResults.length,
      timestamp: Date.now()
    };
  }
  
  /**
   * Calculates message transmission accuracy
   * @private
   * @param {string} original - Original message
   * @param {string} decoded - Decoded message
   * @returns {number} Accuracy from 0 to 1
   */
  _calculateAccuracy(original, decoded) {
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
  
  /**
   * Gets the experiment log
   * @returns {Array} Experiment log
   */
  getExperimentLog() {
    return this.experimentLog;
  }
}

module.exports = MessageEncoder;
