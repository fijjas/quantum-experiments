export class Qubit {
  collapsed = false;

  constructor(alpha = { re: 1, im: 0 }, beta = { re: 0, im: 0 }) {
    this.alpha = alpha;
    this.beta = beta;
    this._checkNorm();
  }

  measure() {
    var prob0 = this.alpha.re * this.alpha.re + this.alpha.im * this.alpha.im;
    var rand = Math.random();
    var result = rand < prob0 ? 0 : 1;
    this._collapse(result);
    return result;
  }

  applyGate(gate) {
    if (this.collapsed) {
      throw new Error("Cannot apply gate: Qubit has collapsed due to measurement.");
    }

    var newAlpha = {
      re: (
        gate[0][0].re * this.alpha.re
        - gate[0][0].im * this.alpha.im
        + gate[0][1].re * this.beta.re
        - gate[0][1].im * this.beta.im
      ),
      im: (
        gate[0][0].re * this.alpha.im
        + gate[0][0].im * this.alpha.re
        + gate[0][1].re * this.beta.im
        + gate[0][1].im * this.beta.re
      ),
    };

    var newBeta = {
      re: (
        gate[1][0].re * this.alpha.re
        - gate[1][0].im * this.alpha.im
        + gate[1][1].re * this.beta.re
        - gate[1][1].im * this.beta.im
      ),
      im: (
        gate[1][0].re * this.alpha.im
        + gate[1][0].im * this.alpha.re
        + gate[1][1].re * this.beta.im
        + gate[1][1].im * this.beta.re
      ),
    };

    this.alpha = newAlpha;
    this.beta = newBeta;
  }

  sim_getState() {
    return {
      collapsed: this.collapsed,
      alpha: this.alpha,
      beta: this.beta,
    };
  }

  _checkNorm() {
    var norm = (
      this.alpha.re * this.alpha.re +
      this.alpha.im * this.alpha.im +
      this.beta.re * this.beta.re +
      this.beta.im * this.beta.im
    );

    if (Math.abs(norm - 1) > 1e-10) {
      throw new Error("Invalid qubit state: Norm must be 1, but got " + norm);
    }
  }

  _collapse(state) {
    if (state === 0) {
      this.alpha = { re: 1, im: 0 };
      this.beta = { re: 0, im: 0 };
    } else {
      this.alpha = { re: 0, im: 0 };
      this.beta = { re: 1, im: 0 };
    }
    this.collapsed = true;
  }
}
