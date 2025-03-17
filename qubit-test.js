import { Qubit } from "./common/qubit.js";
import { H } from "./common/gates.js";

function runExperiment(n) {
  var count0 = 0,
      count1 = 0,
      i, q, result;

  for (i = 0; i < n; i++) {
    q = new Qubit();

    H(q);

    result = q.measure();

    if (result === 0) {
      count0 += 1;
    } else {
      count1 += 1;
    }
  }

  console.log(`Results for n=${n}:`);
  console.log(`0: ${count0} times (${((count0 / n) * 100).toFixed(2)}%)`);
  console.log(`1: ${count1} times (${((count1 / n) * 100).toFixed(2)}%)`);
}

[1, 10, 100, 1_000, 10_000, 100_000, 1_000_000].forEach((n) => {
  runExperiment(n);
});
