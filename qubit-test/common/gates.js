export function H(qubit){
  if (qubit.collapsed) {
    throw new Error('(H) The qubit is collapsed');
  }

  var a = qubit.alpha;
  var b = qubit.beta;

  var newAlpha = {
    re: (a.re + b.re) / Math.sqrt(2),
    im: (a.im + b.im) / Math.sqrt(2)
  };
  var newBeta = {
    re: (a.re - b.re) / Math.sqrt(2),
    im: (a.im - b.im) / Math.sqrt(2),
  };

  qubit.alpha = newAlpha;
  qubit.beta = newBeta;

  qubit._checkNorm();
}

export function X(qubit) {
  if (qubit.collapsed) {
    throw new Error('(X) The qubit is collapsed');
  }

  var a = qubit.alpha;
  var b = qubit.beta;

  qubit.alpha = b;
  qubit.beta = a;

  qubit._checkNorm();
}

export function CNOT(qubit1, qubit2) {
  if (qubit1.collapsed || qubit2.collapsed) {
    throw new Error("(CNOT) One or both qubits are collapsed.");
  }

  // If qubit1 (control) is in state |1⟩, apply X (flip) to qubit2
  if (qubit1.alpha.re === 0 && qubit1.alpha.im === 0 && qubit1.beta.re === 1 && qubit1.beta.im === 0) {
    // Apply X gate to qubit2 (flip its state)
    X(qubit2);
  }
}
