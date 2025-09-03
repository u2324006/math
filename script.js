// === Utility: Rational numbers ===
function gcd(a, b) {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { const t = b; b = a % b; a = t; }
  return a || 1;
}
function simplify(num, den) {
  if (den < 0) { num = -num; den = -den; }
  const g = gcd(num, den);
  return [num / g, den / g];
}
function add([a,b], [c,d]) { return simplify(a*d + b*c, b*d); }
function sub([a,b], [c,d]) { return simplify(a*d - b*c, b*d); }
function mul([a,b], [c,d]) { return simplify(a*c, b*d); }
function div([a,b], [c,d]) { return simplify(a*d, b*c); }

function toTex([n, d]) {
  if (d === 1) return String(n);
  // format proper negative
  if (n < 0) return '-\\frac{' + (-n) + '}{' + d + '}';
  return '\\frac{' + n + '}{' + d + '}';
}
function toString([n, d]) {
  if (d === 1) return String(n);
  return `${n}/${d}`;
}

// === Random helpers ===
function randInt(min, max) { // inclusive
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randChoice(arr) { return arr[randInt(0, arr.length - 1)]; }

function randomIntInRange(byDifficulty) {
  const ranges = {
    easy: [-5, 5],
    normal: [-9, 9],
    hard: [-12, 12]
  };
  const [lo, hi] = ranges[byDifficulty];
  let v = 0;
  // avoid zero too often for coefficients
  while (v === 0) v = randInt(lo, hi);
  return v;
}

function randomFrac(byDifficulty) {
  const d_max = {
    easy: 10,
    normal: 20,
    hard: 30
  }[byDifficulty];

  const n_max = 30;

  let d = randInt(2, d_max);
  let n = randInt(-n_max, n_max);
  while (n === 0) {
    n = randInt(-n_max, n_max);
  }

  return simplify(n, d);
}

function randomRational(mode, difficulty) {
  if (mode === 'int') return [randomIntInRange(difficulty), 1];
  if (mode === 'frac') return randomFrac(difficulty);
  // both
  return Math.random() < 0.5 ? [randomIntInRange(difficulty), 1] : randomFrac(difficulty);
}

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

function equationToTex({a,b,c,d}) {
  // Format like: ax + b = cx + d
  const left = `${coefToTex(a, true)} ${b[0] >= 0 ? '+ ' : ''}${coefToTex(b, false)}`;
  const right = `${coefToTex(c, true)} ${d[0] >= 0 ? '+ ' : ''}${coefToTex(d, false)}`;
  return `${left} = ${right}`;
}

function solveLinear({a,b,c,d}) {
  // ax + b = cx + d -> (a-c)x = d-b -> x = (d-b)/(a-c)
  const num = sub(d, b);
  const den = sub(a, c);
  return div(num, den);
}

function genProblem(mode, difficulty) {
  let eq, xsol;
  let tries = 0;
  
  do {
    // Decide coefficient/solution styles
    let coefMode, solMode;
    if (mode === 'int') { coefMode = 'int'; solMode = 'int'; }
    else if (mode === 'frac') { coefMode = 'frac'; solMode = 'frac'; }
    else { // both
      coefMode = Math.random() < 0.5 ? 'int' : 'frac';
      solMode  = Math.random() < 0.5 ? 'int' : 'frac';
    }

    // Choose a target solution x first
    const x = solMode === 'int'
      ? [randInt(-9, 9) || 1, 1]
      : randomFrac(difficulty);

    // Build equation
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
  
  xsol = solveLinear(eq); // sanity check

  const tex = `\\(${equationToTex(eq)}\\)`;
  const ansTex = `\\(x = ${toTex(xsol)}\\)`;
  return { tex, ansTex, eq, xsol };
}

function renderList(list) {
  const container = document.getElementById('problems');
  container.innerHTML = '';
  list.forEach((p, idx) => {
    const li = document.createElement('li');
    li.className = 'problem';
    li.innerHTML = `
      <div class="equation">${p.tex}</div>
      <div class="controls">
        <button type="button" class="toggle">答え</button>
        <span class="answer"> ${p.ansTex} </span>
      </div>
    `;
    // toggle
    li.querySelector('.toggle').addEventListener('click', () => {
      const ans = li.querySelector('.answer');
      ans.classList.toggle('show');
      // re-render just in case
      renderMathInElement(ans);
    });
    container.appendChild(li);
  });
  // Render KaTeX in the whole list
  renderMathInElement(container, {
    delimiters: [
      {left: "$$", right: "$$", display: true},
      {left: "\\(", right: "\\)", display: false},
    ]
  });
}

function main() {
  const form = document.getElementById('control-form');
  const modeEl = document.getElementById('mode');
  const diffEl = document.getElementById('difficulty');
  const countEl = document.getElementById('count');
  const clearBtn = document.getElementById('clear');
  
  let current = [];

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const mode = modeEl.value;
    const difficulty = diffEl.value;
    window.location.href = `quiz.html?mode=${mode}&difficulty=${difficulty}`;
  });

  clearBtn.addEventListener('click', () => {
    document.getElementById('problems').innerHTML = '';
  });

  
}

window.addEventListener('DOMContentLoaded', main);