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
    if (n < 0) return String.raw`-\frac{${-n}}{${d}}`;
    return String.raw`\frac{${n}}{${d}}`;
}

// === Random helpers ===
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randChoice(arr) { return arr[randInt(0, arr.length - 1)]; }

function randomIntInRange(difficulty = 'normal') {
  const ranges = {
    easy: [-5, 5],
    normal: [-9, 9],
    hard: [-12, 12]
  };
  const [lo, hi] = ranges[difficulty];
  let v = 0;
  while (v === 0) v = randInt(lo, hi);
  return v;
}

function randomFrac(difficulty = 'normal') {
  const d_max = {
    easy: 5,
    normal: 8,
    hard: 12
  }[difficulty];
  const n_max = {
    easy: 10,
    normal: 15,
    hard: 20
  }[difficulty];
  let d = randInt(2, d_max);
  let n = randInt(-n_max, n_max);
  while (n === 0) n = randInt(-n_max, n_max);
  return simplify(n, d);
}

function randomRational(mode, difficulty) {
  if (mode === 'int') return [randomIntInRange(difficulty), 1];
  if (mode === 'frac') return randomFrac(difficulty);
  return Math.random() < 0.5 ? [randomIntInRange(difficulty), 1] : randomFrac(difficulty);
}
