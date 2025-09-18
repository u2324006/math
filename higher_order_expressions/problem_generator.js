// Helper function for GCD
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

// Helper function for random integer
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function genProblem(mode, difficulty) {
    const max_val_coeff = 3; // For coefficients of x, y
    const max_val_const = 5; // For constants

    let tex = '';
    let ansTex = '';

    // Declare b_pos and a_pos here to ensure scope
    let b_pos;
    let a_pos;

    // Generate random a and b, ensuring they are not zero
    let a = randInt(1, max_val_coeff);
    let b = randInt(1, max_val_const);
    let c = randInt(1, max_val_coeff); // For two-variable cases

    // Randomly make a, b, c negative
    if (Math.random() < 0.5) a = -a;
    if (Math.random() < 0.5) b = -b;
    if (Math.random() < 0.5) c = -c;

    // Ensure a, b, c are not 0 for coefficients where they shouldn't be
    if (a === 0) a = 1;
    if (b === 0) b = 1;
    if (c === 0) c = 1;

    // Function to format terms for LaTeX, omitting '1' for coefficients
    function formatTerm(coeff, variable = '') {
        if (coeff === 0) return '';
        let sign = coeff > 0 ? '+' : '-';
        let absCoeff = Math.abs(coeff);
        if (absCoeff === 1 && variable !== '') {
            return `${sign}${variable}`;
        }
        return `${sign}${absCoeff}${variable}`;
    }

    // Function to format terms for LaTeX, omitting '1' for coefficients, for the first term
    function formatFirstTerm(coeff, variable = '') {
        if (coeff === 0) return '';
        let absCoeff = Math.abs(coeff);
        if (absCoeff === 1 && variable !== '') {
            return `${coeff > 0 ? '' : '-'}${variable}`;
        }
        return `${coeff}${variable}`;
    }

    // Function to format constant terms
    function formatConst(val) {
        if (val === 0) return '';
        return val > 0 ? `+${val}` : `${val}`;
    }

    // Function to format constant terms for the first term
    function formatFirstConst(val) {
        if (val === 0) return '';
        return `${val}`;
    }

    // Function to format powers
    function formatPower(base, exp) {
        if (exp === 0) return '';
        if (exp === 1) return base;
        return `${base}^{${exp}}`;
    }

    // Randomly choose a problem type (1-5 for each mode)
    const problemType = randInt(1, 5);

    if (mode === 'expand') {
        switch (problemType) {
            case 1: // (ax+b)^3
                tex = `(${formatFirstTerm(a, 'x')}${formatConst(b)})^3`
                ansTex = `${formatFirstTerm(a*a*a, 'x^3')}${formatTerm(3*a*a*b, 'x^2')}${formatTerm(3*a*b*b, 'x')}${formatConst(b*b*b)}`;
                break;
            case 2: // (ax-b)^3
                // Ensure b is positive for the problem display, but use its value for calculation
                b_pos = Math.abs(b);
                tex = `(${formatFirstTerm(a, 'x')}${formatConst(-b_pos)})^3`
                ansTex = `${formatFirstTerm(a*a*a, 'x^3')}${formatTerm(-3*a*a*b_pos, 'x^2')}${formatTerm(3*a*b_pos*b_pos, 'x')}${formatConst(-b_pos*b_pos*b_pos)}`;
                break;
            case 3: // (ax+b)((ax)^2-abx+b^2) = (ax)^3+b^3
                tex = `(${formatFirstTerm(a, 'x')}${formatConst(b)})(${formatFirstTerm(a*a, 'x^2')}${formatTerm(-a*b, 'x')}${formatConst(b*b)})`;
                ansTex = `${formatFirstTerm(a*a*a, 'x^3')}${formatConst(b*b*b)}`;
                break;
            case 4: // (ax-b)((ax)^2+abx+b^2) = (ax)^3-b^3
                // Ensure b is positive for the problem display
                b_pos = Math.abs(b);
                tex = `(${formatFirstTerm(a, 'x')}${formatConst(-b_pos)})(${formatFirstTerm(a*a, 'x^2')}${formatTerm(a*b_pos, 'x')}${formatConst(b_pos*b_pos)})`;
                ansTex = `${formatFirstTerm(a*a*a, 'x^3')}${formatConst(-b_pos*b_pos*b_pos)}`;
                break;
            case 5: // (ax+by)^3
                tex = `(${formatFirstTerm(a, 'x')}${formatTerm(b, 'y')})^3`
                ansTex = `${formatFirstTerm(a*a*a, 'x^3')}${formatTerm(3*a*a*b, 'x^2y')}${formatTerm(3*a*b*b, 'xy^2')}${formatTerm(b*b*b, 'y^3')}`;
                break;
        }
    } else if (mode === 'factor') {
        switch (problemType) {
            case 1: // x^3+a^3
                tex = `x^3${formatConst(a*a*a)}`;
                ansTex = `(x${formatConst(a)})(x^2${formatTerm(-a, 'x')}${formatConst(a*a)})`;
                break;
            case 2: // x^3-a^3
                // Ensure a is positive for the problem display
                a_pos = Math.abs(a);
                tex = `x^3${formatConst(-a_pos*a_pos*a_pos)}`;
                ansTex = `(x${formatConst(-a_pos)})(x^2${formatTerm(a_pos, 'x')}${formatConst(a_pos*a_pos)})`;
                break;
            case 3: // x^3+3ax^2+3a^2x+a^3 = (x+a)^3
                tex = `x^3${formatTerm(3*a, 'x^2')}${formatTerm(3*a*a, 'x')}${formatConst(a*a*a)}`;
                ansTex = `(x${formatConst(a)})^3`;
                break;
            case 4: // x^3-3ax^2+3a^2x-a^3 = (x-a)^3
                // Ensure a is positive for the problem display
                a_pos = Math.abs(a);
                tex = `x^3${formatTerm(-3*a_pos, 'x^2')}${formatTerm(3*a_pos*a_pos, 'x')}${formatConst(-a_pos*a_pos*a_pos)}`;
                ansTex = `(x${formatConst(-a_pos)})^3`;
                break;
            case 5: // a^3x^3+b^3y^3 = (ax+by)(a^2x^2-abxy+b^2y^2)
                tex = `${formatFirstTerm(a*a*a, 'x^3')}${formatTerm(b*b*b, 'y^3')}`;
                ansTex = `(${formatFirstTerm(a, 'x')}${formatTerm(b, 'y')})(${formatFirstTerm(a*a, 'x^2')}${formatTerm(-a*b, 'xy')}${formatTerm(b*b, 'y^2')})`;
                break;
        }
    }

    return { tex, ansTex };
}