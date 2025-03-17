import { Qubit } from "./common/qubit.js";
import { CNOT, H } from "./common/gates.js";

function runExperiment(n) {
  var q1, q2, i;
  for (i = 0; i <= n; i++) {
    q1 = new Qubit({ re: 1, im: 0 }, { re: 0, im: 0 });
    q2 = new Qubit({ re: 1, im: 0 }, { re: 0, im: 0 });

    H(q1);
    CNOT(q1, q2);

    console.log(`q1: ${q1.measure()} -- q2: ${q2.measure()}`);
  }
}

[10].forEach((n) => {
  runExperiment(n);
});
