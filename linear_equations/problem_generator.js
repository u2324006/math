// Depends on: math_utils.js

/**
 * Generates a linear equation problem in the form ax + b = cx + d for integer coefficients.
 * @param {number} difficulty - The difficulty level (1, 2, or 3).
 * @returns {object} A problem object with 'tex' and 'ansTex'.
 */
function genIntegerProblem(difficulty) {
    let a, b, c, d, x_sol;
    let attempts = 0;
    const MAX_ATTEMPTS = 100;

    do {
        a = [randomIntInRange(difficulty), 1];
        b = [randomIntInRange(difficulty), 1];
        c = [randomIntInRange(difficulty), 1];
        d = [randomIntInRange(difficulty), 1];

        // Ensure a != c to have a valid linear equation
        if (a[0] === c[0]) {
            continue;
        }

        x_sol = solveLinear({ a, b, c, d });
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            console.warn("Max attempts reached for genIntegerProblem.");
            break;
        }
    } while (
        sub(a, c)[0] === 0 || // Ensure denominator of solution is not zero
        Math.abs(x_sol[0]) > 20 || // Solution numerator limit
        Math.abs(x_sol[1]) > 20    // Solution denominator limit
    );

    const problem_tex = `$${equationToTex_linear({ a, b, c, d })}$`;
    const ansTex = `\\(x = ${toTex(x_sol)}\\\)`;

    return { tex: problem_tex, ansTex: ansTex };
}

/**
 * Generates a linear equation problem in the form ax + b = cx + d with at least two fractional coefficients.
 * @param {number} difficulty - The difficulty level (1, 2, or 3).
 * @returns {object} A problem object with 'tex' and 'ansTex'.
 */
function genFractionProblem(difficulty) {
    let a, b, c, d, x_sol;
    let attempts = 0;
    const MAX_ATTEMPTS = 100;

    do {
        // Generate 2 fractions and 2 rationals (int or frac)
        const coeffs = [
            randomFrac(difficulty),
            randomFrac(difficulty),
            randomRational('both', difficulty),
            randomRational('both', difficulty)
        ];

        // Shuffle the coefficients
        for (let i = coeffs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [coeffs[i], coeffs[j]] = [coeffs[j], coeffs[i]];
        }
        [a, b, c, d] = coeffs;

        // Ensure a != c to have a valid linear equation
        if (sub(a, c)[0] === 0) {
            continue;
        }

        x_sol = solveLinear({ a, b, c, d });
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            console.warn("Max attempts reached for genFractionProblem.");
            break;
        }
    } while (
        sub(a, c)[0] === 0 || // Ensure denominator of solution is not zero
        Math.abs(x_sol[0]) > 30 || // Solution numerator limit
        Math.abs(x_sol[1]) > 30    // Solution denominator limit
    );

    const problem_tex = `$${equationToTex_linear({ a, b, c, d })}$`;
    const ansTex = `\\(x = ${toTex(x_sol)}\\\)`;

    return { tex: problem_tex, ansTex: ansTex };
}


/**
 * Generates a problem with fractional expressions, like (ax+b)/c \u00b1 (dx+e)/f = g.
 * This is the original logic from the file.
 * @param {number} difficulty - The difficulty level.
 * @returns {object} A problem object with 'tex' and 'ansTex'.
 */
function genFractionalExpressionProblem(difficulty) {
    const settings = {
        1: { max_denom: 6, max_coeff: 6, max_rhs: 8 },
        2: { max_denom: 9, max_coeff: 9, max_rhs: 10 },
        3: { max_denom: 12, max_coeff: 12, max_rhs: 15 }
    };
    const diff = settings[difficulty] || settings[2];

    let problem_tex, ansTex, xsol_rat;
    let attempts = 0;
    const MAX_ATTEMPTS = 1000;

    do {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            console.warn("Max attempts reached for genFractionalExpressionProblem.");
            break;
        }

        let a_num, b_num, c_num, e_num, d1_denom, d2_denom;

        do {
            d1_denom = randInt(2, diff.max_denom);
            a_num = randInt(-diff.max_coeff, diff.max_coeff);
            b_num = randInt(-diff.max_coeff, diff.max_coeff);
        } while (a_num === 0 || gcd(gcd(Math.abs(a_num), Math.abs(b_num)), d1_denom) !== 1);

        do {
            d2_denom = randInt(2, diff.max_denom);
        } while (d1_denom === d2_denom || gcd(d1_denom, d2_denom) !== 1);

        do {
            c_num = randInt(-diff.max_coeff, diff.max_coeff);
            e_num = randInt(-diff.max_coeff, diff.max_coeff);
        } while (c_num === 0 || gcd(gcd(Math.abs(c_num), Math.abs(e_num)), d2_denom) !== 1);

        const op_val = randChoice([1, -1]);
        const op_char = (op_val === 1) ? '+' : '-';

        const R_rat = Math.random() < 0.5 ? randomFrac(difficulty) : [randInt(-diff.max_rhs, diff.max_rhs), 1];

        const numerator1_tex = formatNumerator(a_num, b_num);
        const numerator2_tex = formatNumerator(c_num, e_num);
        problem_tex = `$ \\frac{${numerator1_tex}}{${d1_denom}} ${op_char} \\frac{${numerator2_tex}}{${d2_denom}} = ${toTex(R_rat)} $`;

        const A = a_num * d2_denom + op_val * c_num * d1_denom;
        if (A === 0) continue;

        const B = b_num * d2_denom + op_val * e_num * d1_denom;
        const common_denom = d1_denom * d2_denom;

        const A_rat = [A, common_denom];
        const B_rat = [B, common_denom];

        xsol_rat = div(sub(R_rat, B_rat), A_rat);

    } while (Math.abs(xsol_rat[0]) > 40 || Math.abs(xsol_rat[1]) > 40);

    ansTex = `\\(x = ${toTex(xsol_rat)}\\\)`;

    return { tex: problem_tex, ansTex: ansTex };
}


// --- Helper Functions ---

/**
 * Formats a linear expression for a numerator. e.g., (4, 3) -> "4x+3"
 */
function formatNumerator(a, b) {
    if (a === 0 && b === 0) return "0";
    const a_part = a === 1 ? "x" : a === -1 ? "-x" : a === 0 ? "" : `${a}x`;
    const b_part = b === 0 ? "" : b > 0 ? `+${b}` : `${b}`;
    if (a_part && b_part) {
        return `${a_part}${b_part}`;
    }
    return a_part || b_part;
}

/**
 * Converts a coefficient to its TeX representation.
 * @param {number[]} coef - A rational number [numerator, denominator].
 * @param {boolean} [isVariable=false] - If true, appends 'x' to the coefficient.
 * @returns {string} TeX string.
 */
function coefToTex(coef, isVariable = false) {
    const [n, d] = coef;
    let tex;
    if (d === 1) { // Integer
        if (isVariable) {
            if (n === 1) return "x";
            if (n === -1) return "-x";
            return `${n}x`;
        }
        return `${n}`;
    } else { // Fraction
        tex = toTex(coef);
        return isVariable ? `${tex}x` : tex;
    }
}

/**
 * Creates a TeX string for a full linear equation ax+b=cx+d.
 * @param {object} p - Coefficients {a, b, c, d}.
 * @returns {string} TeX string for the equation.
 */
function equationToTex_linear({ a, b, c, d }) {
    let left = coefToTex(a, true);
    if (b[0] !== 0) {
        const b_tex = coefToTex(b);
        if (b[0] > 0) {
            left += ` + ${b_tex}`;
        } else {
            // For negative fractions, toTex adds a minus, so we need a space.
            left += ` - ${toTex([-b[0], b[1]])}`;
        }
    }

    let right = coefToTex(c, true);
    if (d[0] !== 0) {
        const d_tex = coefToTex(d);
        if (d[0] > 0) {
            right += ` + ${d_tex}`;
        } else {
            right += ` - ${toTex([-d[0], d[1]])}`;
        }
    }
    return `${left} = ${right}`;
}

/**
 * Solves a linear equation ax+b=cx+d for x.
 * x = (d - b) / (a - c)
 * @param {object} p - Coefficients {a, b, c, d}.
 * @returns {number[]} The solution for x as a rational number.
 */
function solveLinear({ a, b, c, d }) {
    const num = sub(d, b);
    const den = sub(a, c);
    return div(num, den);
}


/**
 * Main problem generation function.
 * Dispatches to the correct generator based on the mode.
 * @param {string} mode - 'int', 'frac', 'both', 'frac_eq'.
 * @param {string} difficultyName - 'easy', 'normal', 'hard'.
 * @returns {object} A problem object with 'tex' and 'ansTex'.
 */
function genProblem(mode, difficultyName = 'normal') {
    const difficultyMap = { 'easy': 1, 'normal': 2, 'hard': 3 };
    const difficulty = difficultyMap[difficultyName] || 2;

    switch (mode) {
        case 'int':
            return genIntegerProblem(difficulty);
        case 'frac':
            return genFractionProblem(difficulty);
        case 'both':
            // 50/50 chance to generate an integer or fraction problem
            return Math.random() < 0.5 ? genIntegerProblem(difficulty) : genFractionProblem(difficulty);
        case 'frac_eq':
            return genFractionalExpressionProblem(difficulty);
        default:
            console.warn(`Unknown mode: ${mode}. Defaulting to integer problems.`);
            return genIntegerProblem(difficulty);
    }
}