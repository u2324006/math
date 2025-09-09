// Depends on: math_utils.js

// Helper function for GCD
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

/**
 * Formats a linear expression for the numerator.
 * e.g., (4, 3) -> "4x+3", (1, -2) -> "x-2", (-1, 0) -> "-x"
 */
function formatNumerator(a, b) {
    let parts = [];
    if (a !== 0) {
        if (a === 1) parts.push("x");
        else if (a === -1) parts.push("-x");
        else parts.push(`${a}x`);
    }
    if (b !== 0) {
        if (b > 0 && parts.length > 0) parts.push("+");
        parts.push(b);
    }
    if (parts.length === 0) return "0";
    return parts.join("");
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
    const settings = {
        normal: {
            max_denom: 9,
            max_coeff: 9,
            max_rhs: 10
        },
        difficult: {
            max_denom: 25,
            max_coeff: 25,
            max_rhs: 20
        }
    };
    const diff = settings[mode] || settings['normal'];

    let problem_tex, ansTex, xsol_rat;
    let attempts = 0;
    const MAX_ATTEMPTS = 1000; // Prevent infinite loops

    do {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            console.warn("Max attempts reached for genProblem. Could not find a problem with solution within limits.");
            // Fallback: return the last generated problem, even if it doesn't meet the criteria.
            // This prevents an infinite loop in cases where a valid problem is hard to find.
            break;
        }

    // 1. Generate components for the two fractions on the LHS
    let a_num, b_num, c_num, e_num, d1_denom, d2_denom;

    // Generate first fraction (a_num*x + b_num) / d1_denom
    do {
        d1_denom = Math.floor(Math.random() * (diff.max_denom - 1)) + 2;
        a_num = randomIntInRange(diff.max_coeff, 1);
        b_num = randomIntInRange(diff.max_coeff, -diff.max_coeff);
    } while (gcd(gcd(Math.abs(a_num), Math.abs(b_num)), d1_denom) !== 1);

    // Generate denominator for second fraction, coprime to d1_denom
    do {
        d2_denom = Math.floor(Math.random() * (diff.max_denom - 1)) + 2;
    } while (d1_denom === d2_denom || gcd(d1_denom, d2_denom) !== 1);

    // Generate numerator for second fraction (c_num*x + e_num)
    do {
        c_num = randomIntInRange(diff.max_coeff, 1);
        e_num = randomIntInRange(diff.max_coeff, -diff.max_coeff);
    } while (gcd(gcd(Math.abs(c_num), Math.abs(e_num)), d2_denom) !== 1);

    // Randomly choose operator (+1 for +, -1 for -)
    const op_val = (Math.random() < 0.5) ? 1 : -1;
    const op_char = (op_val === 1) ? '+' : '-';

    // 2. Generate the RHS of the equation (can be an integer or a fraction)
    let R_rat;
    // In non-integer modes, 50% chance for the RHS to be a fraction
    if (mode !== 'int' && Math.random() < 0.5) {
        R_rat = randomFrac(difficulty);
    } else {
        const R_val = randomIntInRange(diff.max_rhs, -diff.max_rhs);
        R_rat = [R_val, 1];
    }

    if (R_rat[1] < 0) {
        R_rat[0] *= -1;
        R_rat[1] *= -1;
    }

    // 3. Construct the problem TeX string
    const numerator1_tex = formatNumerator(a_num, b_num);
    const numerator2_tex = formatNumerator(c_num, e_num);
    problem_tex = "$ \\frac{" + numerator1_tex + "}{" + d1_denom + "} " + op_char + " \\frac{" + numerator2_tex + "}{" + d2_denom + "} = " + toTex(R_rat) + " $";

    // 4. Calculate the solution
    // Combine the LHS fractions to get (Ax + B) / D
    const common_denom = d1_denom * d2_denom;
    const A = a_num * d2_denom + op_val * c_num * d1_denom;
    const B = b_num * d2_denom + op_val * e_num * d1_denom;

    // If A is 0, the equation is not linear in x, so regenerate.
    if (A === 0) {
        // If A is 0, the equation is not linear in x. Regenerate the problem.
        continue;
    }

    // Simplify the combined fraction to avoid large intermediate numbers
    const common_divisor = gcd(Math.abs(A), gcd(Math.abs(B), common_denom));
    let final_A = A / common_divisor;
    let final_B = B / common_divisor;
    let final_D = common_denom / common_divisor;

    // Ensure denominator is positive
    if (final_D < 0) {
        final_A *= -1;
        final_B *= -1;
        final_D *= -1;
    }

    // We have (final_A * x + final_B) / final_D = R_rat
    // Solve for x: x = (R_rat * final_D - final_B) / final_A
    const A_rat = [final_A, 1];
    const B_rat = [final_B, 1];
    const D_rat = [final_D, 1];

    const RD_rat = mul(R_rat, D_rat);
    const RDB_rat = sub(RD_rat, B_rat);
    xsol_rat = div(RDB_rat, A_rat);

    } while (Math.abs(xsol_rat[0]) > 40 || Math.abs(xsol_rat[1]) > 40);
    
    // Ensure solution denominator is positive
    if (xsol_rat[1] < 0) {
        xsol_rat[0] *= -1;
        xsol_rat[1] *= -1;
    }

    // 5. Construct the answer TeX string
    ansTex = "\\(x = " + toTex(xsol_rat) + "\\)";

    return { tex: problem_tex, ansTex: ansTex };
}