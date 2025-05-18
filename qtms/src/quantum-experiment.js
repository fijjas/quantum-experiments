/**
 * Quantum experiment model with delayed choice
 * Emulates the behavior of quantum particles in a delayed choice experiment
 * for transmitting information "back in time"
 */

class QuantumExperiment {
  constructor(hiddenParameters = {}) {
    // Initialize hidden parameters
    this.hiddenParameters = {
      predeterminationFactor: hiddenParameters.predeterminationFactor || 0.95, // Factor of result predetermination
      temporalCorrelation: hiddenParameters.temporalCorrelation || 0.9, // Correlation between future choice and past state
      timeEntanglement: hiddenParameters.timeEntanglement || 0.85, // Entanglement in time
      consistencyParameter: hiddenParameters.consistencyParameter || 0.98, // Result consistency parameter
      ...hiddenParameters
    };
    
    // Particle state (in superposition)
    this.particleState = {
      superposition: true,
      path: null, // null means undetermined path
      phase: Math.random() * 2 * Math.PI // Random phase
    };
    
    // Experiment state
    this.experimentState = {
      firstBeamSplitterPassed: false,
      secondBeamSplitterPresent: null, // Delayed choice
      measurementPerformed: false,
      result: null // Measurement result
    };
    
    // Predetermined result (hidden parameter)
    this._predeterminedResult = this._generatePredeterminedResult();
  }
  
  /**
   * Generates a predetermined result based on hidden parameters
   * @private
   * @returns {number} 0 or 1
   */
  _generatePredeterminedResult() {
    // Use hidden parameters to predetermine the result
    const randomValue = Math.random();
    return randomValue < this.hiddenParameters.predeterminationFactor ? 
      (Math.random() < 0.5 ? 0 : 1) : // Predetermined result
      null; // Undetermined result
  }
  
  /**
   * Emulates particle passing through the first beam splitter
   * @returns {void}
   */
  passFirstBeamSplitter() {
    if (this.experimentState.firstBeamSplitterPassed) {
      throw new Error('Particle has already passed the first beam splitter');
    }
    
    // Particle is in superposition after passing the first beam splitter
    this.particleState.superposition = true;
    this.experimentState.firstBeamSplitterPassed = true;
    
    // If there is a predetermined result, it affects the "hidden" path of the particle
    if (this._predeterminedResult !== null) {
      // The path remains undetermined for external observer, but is predetermined by hidden parameters
      this.particleState._hiddenPath = this._predeterminedResult;
    }
  }
  
  /**
   * Sets the presence or absence of the second beam splitter (delayed choice)
   * @param {boolean} present - Presence of the second beam splitter
   * @returns {void}
   */
  setSecondBeamSplitter(present) {
    if (!this.experimentState.firstBeamSplitterPassed) {
      throw new Error('Particle must first pass through the first beam splitter');
    }
    
    if (this.experimentState.secondBeamSplitterPresent !== null) {
      throw new Error('The choice about the second beam splitter has already been made');
    }
    
    this.experimentState.secondBeamSplitterPresent = present;
    
    // Temporal correlation: future choice affects the past state of the particle
    // through hidden parameters
    if (this.hiddenParameters.temporalCorrelation > Math.random()) {
      // Adjust the hidden path of the particle based on the delayed choice
      if (this._predeterminedResult !== null) {
        // If the second beam splitter is present, it corresponds to wave behavior (interference)
        // If absent - to particle behavior (definite path)
        if (present) {
          // For wave behavior, the result depends on interference
          this.particleState._interferencePattern = this._calculateInterference();
        }
      }
    }
  }
  
  /**
   * Calculates the interference pattern based on phase and hidden parameters
   * @private
   * @returns {number} Interference value
   */
  _calculateInterference() {
    const phase = this.particleState.phase;
    const interference = Math.cos(phase) ** 2;
    
    // Apply consistency parameter to stabilize results
    return interference * this.hiddenParameters.consistencyParameter;
  }
  
  /**
   * Performs measurement of the particle state
   * @returns {number} Measurement result (0 or 1)
   */
  measure() {
    if (!this.experimentState.firstBeamSplitterPassed) {
      throw new Error('Particle must first pass through the first beam splitter');
    }
    
    if (this.experimentState.secondBeamSplitterPresent === null) {
      throw new Error('You must first decide whether to install the second beam splitter');
    }
    
    if (this.experimentState.measurementPerformed) {
      return this.experimentState.result;
    }
    
    let result;
    
    // If there is a predetermined result and high temporal correlation,
    // use it taking into account the consistency parameter
    if (this._predeterminedResult !== null && 
        Math.random() < this.hiddenParameters.consistencyParameter) {
      result = this._predeterminedResult;
    } else {
      // Otherwise the result depends on the presence of the second beam splitter
      if (this.experimentState.secondBeamSplitterPresent) {
        // Wave behavior (interference)
        const interference = this._calculateInterference();
        result = interference > 0.5 ? 1 : 0;
      } else {
        // Particle behavior (definite path)
        result = Math.random() < 0.5 ? 0 : 1;
      }
    }
    
    this.experimentState.measurementPerformed = true;
    this.experimentState.result = result;
    
    return result;
  }
  
  /**
   * Performs a complete experiment with the specified choice of second beam splitter
   * @param {boolean} secondBeamSplitterPresent - Presence of the second beam splitter
   * @returns {number} Experiment result (0 or 1)
   */
  runExperiment(secondBeamSplitterPresent) {
    this.passFirstBeamSplitter();
    this.setSecondBeamSplitter(secondBeamSplitterPresent);
    return this.measure();
  }
  
  /**
   * Encodes a bit of information using a delayed choice experiment
   * @param {number} bit - Bit to encode (0 or 1)
   * @returns {number} Experiment result
   */
  encodeBit(bit) {
    if (bit !== 0 && bit !== 1) {
      throw new Error('Bit must be 0 or 1');
    }
    
    // For encoding bit 0, we use the absence of the second beam splitter
    // For encoding bit 1, we use the presence of the second beam splitter
    const secondBeamSplitterPresent = bit === 1;
    
    // Run the experiment with the corresponding choice
    return this.runExperiment(secondBeamSplitterPresent);
  }
  
  /**
   * Decodes a bit of information from the experiment result
   * @param {number} experimentResult - Experiment result
   * @param {boolean} secondBeamSplitterPresent - Whether the second beam splitter was installed
   * @returns {number} Decoded bit (0 or 1)
   */
  decodeBit(experimentResult, secondBeamSplitterPresent) {
    // Use hidden parameters and experiment result for decoding
    // In an ideal system with temporal correlation, the result should correspond to
    // the original bit that determined the presence/absence of the second beam splitter
    
    // Apply temporal entanglement for decoding
    if (Math.random() < this.hiddenParameters.timeEntanglement) {
      // If the second beam splitter was installed, it corresponds to bit 1
      // If it was not installed - to bit 0
      return secondBeamSplitterPresent ? 1 : 0;
    } else {
      // In case of "noise" in the system, return a random bit
      return Math.random() < 0.5 ? 0 : 1;
    }
  }
  
  /**
   * Gets the current state of the experiment
   * @returns {Object} Experiment state
   */
  getState() {
    return {
      particleState: { ...this.particleState },
      experimentState: { ...this.experimentState }
    };
  }
}

module.exports = QuantumExperiment;
