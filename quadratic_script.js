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
  if (n < 0) return '-\frac{' + (-n) + '}{' + d + '}';
  return '\frac{' + n + '}{' + d + '}';
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

function formatCoef(val, variable) {
  if (val === 0) {
    return "";
  }
  if (val === 1 && variable) {
    return variable;
  }
  if (val === -1 && variable) {
    return "-" + variable;
  }
  return val + variable;
}

function genQuadraticProblem(mode) {
  // Generate integer roots for simplicity
  let x1 = randInt(-5, 5);
  let x2 = randInt(-5, 5);

  // Construct coefficients for (x - x1)(x - x2) = 0
  // x^2 - (x1 + x2)x + x1*x2 = 0
  let a = 1;
  let b = -(x1 + x2);
  let c = x1 * x2;

  // Format equation in LaTeX
  let equationTex = "";
  let aTex = formatCoef(a, "x^2");
  let bTex = formatCoef(b, "x");
  let cTex = formatCoef(c, "");

  // Build the equation string
  if (aTex) {
    equationTex += aTex;
  }
  if (bTex) {
    if (b > 0 && equationTex !== "") {
      equationTex += " + ";
    } else if (b < 0) {
      equationTex += " "; // Space for negative sign
    }
    equationTex += bTex;
  }
  if (cTex) {
    if (c > 0 && equationTex !== "") {
      equationTex += " + ";
    } else if (c < 0) {
      equationTex += " "; // Space for negative sign
    }
    equationTex += cTex;
  }
  equationTex += " = 0";

  // Format solutions in LaTeX
  let ansTex = "";
  if (x1 === x2) {
    ansTex = `\\(x = ${x1}\\)`;
  } else {
    ansTex = `\\(x = ${x1}, x = ${x2}\\)`;
  }

  return { tex: `\\(${equationTex}\\)`, ansTex: ansTex };
}

// === Main function for quiz page ===
document.addEventListener('DOMContentLoaded', () => {
    const problemGrid = document.getElementById('problem-grid');
    const toggleBtn = document.getElementById('toggle-answers-button');
    const printBtn = document.getElementById('print-button');
    
    if (!problemGrid || !toggleBtn || !printBtn) return;

    let showingAnswers = false;
    const generatedProblems = [];

    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'both';

    const problemCount = 10; // 2x5 grid

    // Generate and display problems
    for (let i = 0; i < problemCount; i++) {
        const problem = genQuadraticProblem(mode); // Changed to genQuadraticProblem
        generatedProblems.push(problem);
        
        const card = document.createElement('div');
        card.className = 'problem-card';

        const numberEl = document.createElement('span');
        numberEl.className = 'problem-number';
        numberEl.textContent = `(${i + 1})`;

        const equationEl = document.createElement('span');
        equationEl.className = 'equation-content';
        equationEl.innerHTML = problem.tex;

        card.appendChild(numberEl);
        card.appendChild(equationEl);
        problemGrid.appendChild(card);
    }

    const render = () => {
        renderMathInElement(problemGrid, {
            delimiters: [
                {left: "$", right: "$", display: true},
                {left: "\\(", right: "\\)", display: false},
            ]
        });
    }

    // Initial render
    render();

    // --- Event Listeners ---

    // Toggle between problems and answers
    toggleBtn.addEventListener('click', () => {
        showingAnswers = !showingAnswers;
        toggleBtn.textContent = showingAnswers ? '問題' : '解答';
        const cards = document.querySelectorAll('.problem-card');
        
        cards.forEach((card, index) => {
            const equationEl = card.querySelector('.equation-content');
            if (equationEl) {
                if (showingAnswers) {
                    equationEl.innerHTML = generatedProblems[index].ansTex;
                } else {
                    equationEl.innerHTML = generatedProblems[index].tex;
                }
            }
        });
        render(); // Re-render KaTeX
    });

    // Print functionality
    printBtn.addEventListener('click', () => {
        window.print();
    });
});