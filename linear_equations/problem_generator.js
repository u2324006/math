// Depends on: math_utils.js

function coefToTex(coef, variable=false) {
  const [n, d] = coef;
  if (d === 1) {
    if (variable) {
      if (n === 1) return "x";
      if (n === -1) return "-x";
      return `${n}x`;
    }
    return `${n}`;
  } else {
    const tex = toTex(coef);
    return variable ? `${tex}x` : tex;
  }
}

function equationToTex_linear({a,b,c,d}) {
  let left = coefToTex(a, true);
  if (b[0] !== 0) {
    left += ` ${b[0] >= 0 ? '+ ' : ''}${coefToTex(b, false)}`;
  }

  let right = coefToTex(c, true);
  if (d[0] !== 0) {
    right += ` ${d[0] >= 0 ? '+ ' : ''}${coefToTex(d, false)}`;
  }
  return `${left} = ${right}`;
}

function solveLinear({a,b,c,d}) {
  const num = sub(d, b);
  const den = sub(a, c);
  return div(num, den);
}

function genProblem(mode, difficulty) {
  let eq, xsol;
  let tries = 0;

  do {
    let coefMode, solMode;
    if (mode === 'int') { coefMode = 'int'; solMode = 'int'; }
    else if (mode === 'frac') { coefMode = 'frac'; solMode = 'frac'; }
    else {
      coefMode = Math.random() < 0.5 ? 'int' : 'frac';
      solMode  = Math.random() < 0.5 ? 'int' : 'frac';
    }

    const x = solMode === 'int'
      ? [randomIntInRange(difficulty), 1]
      : randomFrac(difficulty);

    const a = randomRational(coefMode, difficulty);
    let c = randomRational(coefMode, difficulty);
    let c_tries = 0;
    while (c[0] === a[0] && c[1] === a[1] && c_tries < 10) {
      c = randomRational(coefMode, difficulty);
      c_tries++;
    }
    const b = randomRational(coefMode, difficulty);
    const d = sub(add(mul(a, x), b), mul(c, x));

    eq = { a, b, c, d };
    tries++;
  } while ((Math.abs(eq.d[0]) > 30 || eq.d[1] > 30) && tries < 200);
  
  xsol = solveLinear(eq);

  const tex = `\(${equationToTex_linear(eq)}\)`;
  const ansTex = `\(x = ${toTex(xsol)}\)`;
  return { tex, ansTex };
}
