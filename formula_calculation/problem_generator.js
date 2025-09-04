// Helper function for GCD
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

// Helper function to generate a random integer within a range
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
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
    return parts.join('');
}

function genProblem(mode, difficulty) { // mode is used for difficulty selection
    const settings = {
        normal: {
            max_denom: 9,
            max_coeff: 9,
        },
        difficult: {
            max_denom: 25,
            max_coeff: 25,
        }
    };
    const diff = settings[mode] || settings['normal'];

    // 1. Generate components for the two fractions
    let a, b, c, e, d1, d2;

    // Generate denominators that are coprime and not equal
    d1 = randInt(2, diff.max_denom);
    do {
        d2 = randInt(2, diff.max_denom);
    } while (d1 === d2 || gcd(d1, d2) !== 1);

    // Generate coefficients for numerators
    a = randInt(1, diff.max_coeff);
    b = randInt(-diff.max_coeff, diff.max_coeff);
    c = randInt(1, diff.max_coeff);
    e = randInt(-diff.max_coeff, diff.max_coeff);

    // Randomly choose operator (+1 for +, -1 for -)
    const op_val = (Math.random() < 0.5) ? 1 : -1;
    const op_char = (op_val === 1) ? '+' : '-';

    // 2. Construct the problem TeX string
    const numerator1_tex = formatNumerator(a, b);
    const numerator2_tex = formatNumerator(c, e);
    const tex = `\\frac{${numerator1_tex}}{${d1}} ${op_char} \\frac{${numerator2_tex}}{${d2}}`;

    // 3. Calculate the solution
    // Common denominator
    const D = d1 * d2;
    // New numerator coefficients
    const A = a * d2 + op_val * c * d1;
    const B = b * d2 + op_val * e * d1;

    // 4. Simplify the final fraction
    const common_divisor = gcd(Math.abs(A), gcd(Math.abs(B), D));
    
    let A_final = A / common_divisor;
    let B_final = B / common_divisor;
    let D_final = D / common_divisor;

    // Ensure denominator is positive
    if (D_final < 0) {
        A_final *= -1;
        B_final *= -1;
        D_final *= -1;
    }

    // 5. Construct the answer TeX string
    let ansTex;
    const final_numerator_tex = formatNumerator(A_final, B_final);

    if (D_final === 1) {
        ansTex = final_numerator_tex;
    } else {
        ansTex = `\\frac{${final_numerator_tex}}{${D_final}}`;
    }

    return { tex: `$${tex}$`, ansTex: `$${ansTex}$` };
}