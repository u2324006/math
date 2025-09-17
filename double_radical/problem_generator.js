function genProblem(mode) {
    // For hard mode, 50% chance of new problem type
    if (mode === 'hard' && Math.random() < 0.5) {
        return genHardProblemType2();
    }

    let a, b, y;
    do {
        a = randInt(1, 19);
        b = randInt(1, 19);
        y = a * b;
    } while (y > 20 || (a + b) > 20 || a === b || isPerfectSquare(y));

    if (a < b) { [a, b] = [b, a]; }

    const isPlus = Math.random() < 0.5;
    const x = a + b;
    
    // For hard mode (this path), 50% chance of 4ab format
    const use4abFormat = (mode === 'hard' && Math.random() < 0.5);

    let tex, ansTex;

    if (isPlus) {
        tex = use4abFormat ? `\\sqrt{${x} + \\sqrt{${4 * y}}}` : `\\sqrt{${x} + 2\\sqrt{${y}}}`;
        ansTex = `\\sqrt{${a}} + \\sqrt{${b}}`;
    } else {
        tex = use4abFormat ? `\\sqrt{${x} - \\sqrt{${4 * y}}}` : `\\sqrt{${x} - 2\\sqrt{${y}}}`;
        ansTex = `\\sqrt{${a}} - \\sqrt{${b}}`;
    }

    const simplifiedAns = simplifyRadicalExpression(a, b, isPlus);
    if (simplifiedAns) {
        ansTex = simplifiedAns;
    }

    return { tex, ansTex };
}

function genHardProblemType2() {
    let a, b, Y;
    do {
        a = randInt(1, 39);
        b = randInt(1, 39);
        Y = a * b;
    } while (Y > 20 || (a + b) > 40 || a === b || isPerfectSquare(Y) || (a % 2 !== b % 2));

    if (a < b) { [a, b] = [b, a]; }

    const X = (a + b) / 2;
    const isPlus = Math.random() < 0.5;

    const tex = isPlus ? `\\sqrt{${X} + \\sqrt{${Y}}}` : `\\sqrt{${X} - \\sqrt{${Y}}}`;
    
    // --- Answer Simplification ---
    const s_2a = simplifyRadical(2 * a);
    const s_2b = simplifyRadical(2 * b);

    let ansTex;
    if (s_2a.coeff % 2 === 0 && s_2b.coeff % 2 === 0) {
        const c1 = { coeff: s_2a.coeff / 2, rad: s_2a.rad };
        const c2 = { coeff: s_2b.coeff / 2, rad: s_2b.rad };
        const term1 = formatRadical(c1);
        const term2 = formatRadical(c2);
        ansTex = isPlus ? `${term1} + ${term2}` : `${term1} - ${term2}`;
    } else {
        const term1 = formatRadical(s_2a);
        const term2 = formatRadical(s_2b);
        const numerator = isPlus ? `${term1} + ${term2}` : `${term1} - ${term2}`;
        ansTex = `\\frac{${numerator}}{2}`;
    }

    return { tex, ansTex };
}

function formatRadical(simplified) {
    if (simplified.rad === 1) {
        return simplified.coeff.toString();
    }
    if (simplified.coeff === 1) {
        return `\\sqrt{${simplified.rad}}`;
    }
    if (simplified.coeff === -1) {
        return `-\\sqrt{${simplified.rad}}`;
    }
    return `${simplified.coeff}\\sqrt{${simplified.rad}}`;
}

function simplifyRadicalExpression(a, b, isPlus) {
    const simplifiedA = simplifyRadical(a);
    const termA = formatRadical(simplifiedA);
    const simplifiedB = simplifyRadical(b);
    const termB = formatRadical(simplifiedB);
    return isPlus ? `${termA} + ${termB}` : `${termA} - ${termB}`;
}

function simplifyRadical(n) {
    if (n === 0) return { coeff: 0, rad: 1 };
    if (n === 1) return { coeff: 1, rad: 1 };
    let rad = 1;
    let coeff = 1;
    for (let i = 2; i * i <= n; i++) {
        while (n % (i * i) === 0) {
            coeff *= i;
            n /= (i * i);
        }
    }
    rad = n;
    return { coeff, rad };
}

function isPerfectSquare(n) {
    if (n < 0) return false;
    const sqrt = Math.sqrt(n);
    return sqrt === Math.floor(sqrt);
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}