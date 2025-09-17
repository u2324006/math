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

function toTex([n, d], isCoeff = false) {
    if (isCoeff) {
        if (n === 1 && d === 1) return '';
        if (n === -1 && d === 1) return '-';
    }
    if (d === 1) return String(n);
    if (n < 0) return String.raw`-\frac{${-n}}{${d}}`;
    return String.raw`\frac{${n}}{${d}}`;
}

function parseTexFrac(tex) {
    if (typeof tex !== 'string') {
        console.error("parseTexFrac received non-string input:", tex);
        return NaN;
    }
    let isNegative = tex.startsWith('-');
    if (isNegative) {
        tex = tex.substring(1);
    }
    let num, den;
    if (tex.includes('frac')) {
        const parts = tex.match(/\\frac{(\d+)}{(\d+)}/);
        if (!parts) {
            console.error("Could not parse fraction:", tex);
            return NaN;
        }
        num = parseInt(parts[1], 10);
        den = parseInt(parts[2], 10);
    } else {
        num = parseInt(tex, 10);
        den = 1;
    }
    return (isNegative ? -1 : 1) * num / den;
}


// === Random helpers ===
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randChoice(arr) { return arr[randInt(0, arr.length - 1)]; }

function randomIntInRange(difficulty = 2) {
  const ranges = {
    1: [-5, 5],
    2: [-9, 9],
    3: [-12, 12]
  };
  const [lo, hi] = ranges[difficulty] || ranges[2];
  let v = 0;
  while (v === 0) v = randInt(lo, hi);
  return v;
}

function randomFrac(difficulty = 2) {
  let d = randInt(2, 9);
  let n = randInt(-9, 9);
  while (n === 0) n = randInt(-9, 9);
  return simplify(n, d);
}

function randomRational(mode, difficulty) {
  if (mode === 'int') return [randomIntInRange(difficulty), 1];
  if (mode === 'frac') return randomFrac(difficulty);
  return Math.random() < 0.8 ? [randomIntInRange(difficulty), 1] : randomFrac(difficulty);
}

// === Problem generation ===

function genSimpleInequality(mode, difficulty) {
  let solution, problemTex, solutionTex;
  while (true) {
    const a = randomRational(mode, difficulty);
    const b = randomRational(mode, difficulty);
    const c = randomRational(mode, difficulty);
    const inequalitySymbol = randChoice(['<', '>', String.raw`\le`, String.raw`\ge`]);

    // ax + b > c  => ax > c - b => x > (c-b)/a
    const rhs = sub(c, b);
    solution = div(rhs, a);

    if (Math.abs(solution[0]) > 99 || solution[1] > 99) {
      continue; // Regenerate
    }

    problemTex = `${toTex(a, true)}x`;
    if (b[0] !== 0) {
      problemTex += ` ${b[0] > 0 ? '+' : '-'} ${toTex([Math.abs(b[0]), b[1]])}`;
    }
    problemTex += ` ${inequalitySymbol} ${toTex(c)}`;

    const aIsPositive = a[0] / a[1] > 0;
    let solutionSymbol = inequalitySymbol;
    if (!aIsPositive) {
      if (inequalitySymbol === '<') solutionSymbol = '>';
      if (inequalitySymbol === '>') solutionSymbol = '<';
      if (inequalitySymbol === String.raw`\le`) solutionSymbol = String.raw`\ge`;
      if (inequalitySymbol === String.raw`\ge`) solutionSymbol = String.raw`\le`;
    }

    solutionTex = `x ${solutionSymbol} ${toTex(solution)}`;
    break;
  }

  return {
    tex: `${problemTex}`,
    ansTex: `${solutionTex}`,
  };
}

function genStandardInequality(mode, difficulty) {
    let solution, problemTex, solutionTex;
    while (true) {
        const a = randomRational(mode, difficulty);
        const b = randomRational(mode, difficulty);
        const c = randomRational(mode, difficulty);
        const d = randomRational(mode, difficulty);
        const inequalitySymbol = randChoice(['<', '>', String.raw`\le`, String.raw`\ge`]);

        // ax + b > cx + d => (a-c)x > d-b
        const lhs_x = sub(a, c);
        const rhs_const = sub(d, b);
        solution = div(rhs_const, lhs_x);

        if (Math.abs(solution[0]) > 99 || solution[1] > 99) {
            continue; // Regenerate
        }

        problemTex = `${toTex(a, true)}x`;
        if (b[0] !== 0) {
            problemTex += ` ${b[0] > 0 ? '+' : '-'} ${toTex([Math.abs(b[0]), b[1]])}`;
        }
        problemTex += ` ${inequalitySymbol} ${toTex(c, true)}x`;
        if (d[0] !== 0) {
            problemTex += ` ${d[0] > 0 ? '+' : '-'} ${toTex([Math.abs(d[0]), d[1]])}`;
        }

        const lhs_x_is_positive = lhs_x[0] / lhs_x[1] > 0;
        let solutionSymbol = inequalitySymbol;
        if (!lhs_x_is_positive) {
            if (inequalitySymbol === '<') solutionSymbol = '>';
            if (inequalitySymbol === '>') solutionSymbol = '<';
            if (inequalitySymbol === String.raw`\le`) solutionSymbol = String.raw`\ge`;
            if (inequalitySymbol === String.raw`\ge`) solutionSymbol = String.raw`\le`;
        }

        solutionTex = `x ${solutionSymbol} ${toTex(solution)}`;
        break;
    }

    return {
        tex: `${problemTex}`,
        ansTex: `${solutionTex}`,
    };
}

function genComplexInequality(mode, difficulty) {
    let solution, problemTex, solutionTex;
    while (true) {
        const a = randomRational(mode, difficulty);
        const b = randomRational(mode, difficulty);
        const c = randomRational(mode, difficulty);
        const d = randomRational(mode, difficulty);
        const e = randomRational(mode, difficulty);
        const f = randomRational(mode, difficulty);
        const g = randomRational(mode, difficulty);
        const inequalitySymbol = randChoice(['<', '>', String.raw`\le`, String.raw`\ge`]);

        // a(bx+c) + d(ex+f) > g
        // abx + ac + dex + df > g
        // (ab+de)x > g - ac - df
        const x_coeff = add(mul(a,b), mul(d,e));
        const const_term = sub(sub(g, mul(a,c)), mul(d,f));
        solution = div(const_term, x_coeff);

        if (Math.abs(solution[0]) > 99 || solution[1] > 99) {
            continue; // Regenerate
        }

        problemTex = `${toTex(a, true)}(${toTex(b, true)}x ${b[0] > 0 ? '+' : '-'} ${toTex([Math.abs(c[0]), c[1]])})`;
        problemTex += ` ${d[0] > 0 ? '+' : '-'} ${toTex([Math.abs(d[0]), d[1]])}(${toTex(e, true)}x ${e[0] > 0 ? '+' : '-'} ${toTex([Math.abs(f[0]), f[1]])})`;
        problemTex += ` ${inequalitySymbol} ${toTex(g)}`;

        const x_coeff_is_positive = x_coeff[0] / x_coeff[1] > 0;
        let solutionSymbol = inequalitySymbol;
        if (!x_coeff_is_positive) {
            if (inequalitySymbol === '<') solutionSymbol = '>';
            if (inequalitySymbol === '>') solutionSymbol = '<';
            if (inequalitySymbol === String.raw`\le`) solutionSymbol = String.raw`\ge`;
            if (inequalitySymbol === String.raw`\ge`) solutionSymbol = String.raw`\le`;
        }

        solutionTex = `x ${solutionSymbol} ${toTex(solution)}`;
        break;
    }

    return {
        tex: `${problemTex}`,
        ansTex: `${solutionTex}`,
    };
}

function genLinearInequalityProblem(mode, difficulty) {
  const problemGenerators = [genSimpleInequality, genStandardInequality, genComplexInequality];
  const generator = randChoice(problemGenerators);
  return generator(mode, difficulty);
}

function genSimultaneousInequalities(mode, difficulty) {
    let problemTex, solutionTex;
    while (true) {
        const p1 = genSimpleInequality(mode, difficulty);
        const p2 = genSimpleInequality(mode, difficulty);

        const sol1 = p1.ansTex.split(' ');
        const sym1 = sol1[1];
        const val1Str = sol1[2];
        const val1 = parseTexFrac(val1Str);

        const sol2 = p2.ansTex.split(' ');
        const sym2 = sol2[1];
        const val2Str = sol2[2];
        const val2 = parseTexFrac(val2Str);

        if (isNaN(val1) || isNaN(val2)) {
            console.error("Failed to parse simultaneous inequality values.");
            continue;
        }

        const isLessThan1 = sym1.includes('<');
        const isGreaterThan1 = sym1.includes('>');
        const isLessThan2 = sym2.includes('<');
        const isGreaterThan2 = sym2.includes('>');

        if (val1 === val2) continue;

        let lowerBoundStr, upperBoundStr, lowerInclusive, upperInclusive;

        if (isGreaterThan1 && isLessThan2) {
            if (val1 >= val2) continue;
            lowerBoundStr = val1Str;
            lowerInclusive = sym1.includes('ge');
            upperBoundStr = val2Str;
            upperInclusive = sym2.includes('le');
        } else if (isLessThan1 && isGreaterThan2) {
            if (val2 >= val1) continue;
            lowerBoundStr = val2Str;
            lowerInclusive = sym2.includes('ge');
            upperBoundStr = val1Str;
            upperInclusive = sym1.includes('le');
        } else {
            continue;
        }

        problemTex = String.raw`\begin{cases} ${p1.tex} \\ ${p2.tex} \end{cases}`;
        solutionTex = `${lowerBoundStr} ${lowerInclusive ? '\\le' : '<'} x ${upperInclusive ? '\\le' : '<'} ${upperBoundStr}`;
        break;
    }

    return {
        tex: problemTex,
        ansTex: solutionTex,
    };
}


function genAbsoluteValueProblem(mode, difficulty) {
    let problemTex, solutionTex;
    while (true) {
        const problemType = randChoice(['equation', 'inequality']);
        const inequalitySymbol = randChoice(['<', '>', String.raw`\le`, String.raw`\ge`]);

        if (problemType === 'equation') {
            const type = randChoice(['type1', 'type2']);
            if (type === 'type1') {
                // |ax + b| = c
                const a = randomRational(mode, difficulty);
                const b = randomRational(mode, difficulty);
                let c = randomRational(mode, difficulty);
                if (c[0] < 0) {
                    c[0] = -c[0];
                }

                const sol1 = div(sub(c, b), a);
                const sol2 = div(sub(mul([-1, 1], c), b), a);

                if (Math.abs(sol1[0]) > 99 || sol1[1] > 99 || Math.abs(sol2[0]) > 99 || sol2[1] > 99) {
                    continue;
                }

                problemTex = `|${toTex(a, true)}x`;
                if (b[0] !== 0) {
                    problemTex += ` ${b[0] > 0 ? '+' : '-'} ${toTex([Math.abs(b[0]), b[1]])}`;
                }
                problemTex += `| = ${toTex(c)}`;

                solutionTex = `x = ${toTex(sol1)}, ${toTex(sol2)}`;
                break;

            } else {
                // |ax| = bx + c
                const a = randomRational(mode, difficulty);
                const b = randomRational(mode, difficulty);
                const c = randomRational(mode, difficulty);

                if (sub(a, b)[0] === 0 || sub(mul([-1, 1], a), b)[0] === 0) {
                    continue;
                }

                const sol1 = div(c, sub(a, b));
                const sol2 = div(c, sub(mul([-1, 1], a), b));

                if (Math.abs(sol1[0]) > 99 || sol1[1] > 99 || Math.abs(sol2[0]) > 99 || sol2[1] > 99) {
                    continue;
                }

                problemTex = `|${toTex(a, true)}x| = ${toTex(b, true)}x`;
                if (c[0] !== 0) {
                    problemTex += ` ${c[0] > 0 ? '+' : '-'} ${toTex([Math.abs(c[0]), c[1]])}`;
                }

                solutionTex = `x = ${toTex(sol1)}, ${toTex(sol2)}`;
                break;
            }
        } else { // inequality
            const type = randChoice(['type1', 'type2']);
            if (type === 'type1') {
                // |ax - b| < cx + d
                const a = randomRational(mode, difficulty);
                const b = randomRational(mode, difficulty);
                const c = randomRational(mode, difficulty);
                const d = randomRational(mode, difficulty);

                const ac_add = add(a, c);
                const ac_sub = sub(a, c);

                if (ac_add[0] === 0 || ac_sub[0] === 0) {
                    continue;
                }

                const sol1_num = sub(b, d);
                const sol1 = div(sol1_num, ac_add);

                const sol2_num = add(d, b);
                const sol2 = div(sol2_num, ac_sub);
                
                if (Math.abs(sol1[0]) > 99 || sol1[1] > 99 || Math.abs(sol2[0]) > 99 || sol2[1] > 99) {
                    continue;
                }

                problemTex = `|${toTex(a, true)}x ${b[0] > 0 ? '-' : '+'} ${toTex([Math.abs(b[0]), b[1]])}| ${inequalitySymbol} ${toTex(c, true)}x`;
                if (d[0] !== 0) {
                    problemTex += ` ${d[0] > 0 ? '+' : '-'} ${toTex([Math.abs(d[0]), d[1]])}`;
                }

                let sol_symbol1 = '<';
                let sol_symbol2 = '<';

                if (inequalitySymbol.includes('>')) {
                    // |X| > Y  <=> X > Y or X < -Y
                    solutionTex = `x < ${toTex(sol1)}, x > ${toTex(sol2)}`;
                } else {
                    // |X| < Y <=> -Y < X < Y
                    solutionTex = `${toTex(sol1)} < x < ${toTex(sol2)}`;
                }
                break;

            } else {
                // |ax| > bx + c
                const a = randomRational(mode, difficulty);
                const b = randomRational(mode, difficulty);
                const c = randomRational(mode, difficulty);

                const ab_sub = sub(a, b);
                const ab_add = add(a, b);

                if (ab_sub[0] === 0 || ab_add[0] === 0) {
                    continue;
                }

                const sol1 = div(c, ab_sub);
                const sol2 = div(mul([-1,1], c), ab_add);

                if (Math.abs(sol1[0]) > 99 || sol1[1] > 99 || Math.abs(sol2[0]) > 99 || sol2[1] > 99) {
                    continue;
                }

                problemTex = `|${toTex(a, true)}x| ${inequalitySymbol} ${toTex(b, true)}x`;
                if (c[0] !== 0) {
                    problemTex += ` ${c[0] > 0 ? '+' : '-'} ${toTex([Math.abs(c[0]), c[1]])}`;
                }

                if (inequalitySymbol.includes('>')) {
                    solutionTex = `x < ${toTex(sol2)}, x > ${toTex(sol1)}`;
                } else {
                    solutionTex = `${toTex(sol1)} < x < ${toTex(sol2)}`;
                }
                break;
            }
        }
    }
    return {
        tex: problemTex,
        ansTex: solutionTex,
    };
}

// This will be used by quiz_ui.js
function genProblem(mode, difficulty, i, type) {
    if (type === 'simultaneous') {
        return genSimultaneousInequalities(mode, difficulty);
    }
    if (type === 'absolute_value') {
        return genAbsoluteValueProblem(mode, difficulty);
    }
    return genLinearInequalityProblem(mode, difficulty);
}


// --- Self-testing ---
function selfTest() {
    console.log("--- Self-testing genLinearInequalityProblem ---");

    const modes = ['int', 'frac', 'both'];
    const difficulties = [1, 2, 3];

    for (const mode of modes) {
        for (const difficulty of difficulties) {
            console.log(`--- Testing: mode=${mode}, difficulty=${difficulty} ---`);
            try {
                const p1 = genSimpleInequality(mode, difficulty);
                console.log("Simple:", p1.tex, "==>", p1.ansTex);

                const p2 = genStandardInequality(mode, difficulty);
                console.log("Standard:", p2.tex, "==>", p2.ansTex);

                const p3 = genComplexInequality(mode, difficulty);
                console.log("Complex:", p3.tex, "==>", p3.ansTex);
                
                const p4 = genSimultaneousInequalities(mode, difficulty);
                console.log("Simultaneous:", p4.tex, "==>", p4.ansTex);

                const p5 = genAbsoluteValueProblem(mode, difficulty);
                console.log("Absolute Value:", p5.tex, "==>", p5.ansTex);


            } catch (e) {
                console.error(`Error during test with mode=${mode}, difficulty=${difficulty}:`, e);
            }
        }
    }
    console.log("--- Self-testing finished ---");
}