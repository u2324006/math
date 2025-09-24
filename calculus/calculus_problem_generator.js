// 最大次数を指定してランダムな多項式を生成する
function generatePolynomial(maxDegree = 5) {
    const degree = randInt(1, maxDegree);
    const coeffs = [];
    for (let i = 0; i <= degree; i++) {
        if (i > 0 && Math.random() < 0.3) {
            coeffs.push(0);
        } else {
            coeffs.push(randomIntInRange(2));
        }
    }
    if (coeffs[degree] === 0) {
        coeffs[degree] = randomIntInRange(2);
    }
    return coeffs;
}

// 多項式を掛け合わせる
function multiplyPolynomials(p1, p2) {
    const result = new Array(p1.length + p2.length - 1).fill(0);
    for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
            result[i + j] += p1[i] * p2[j];
        }
    }
    return result;
}

// 係数配列をKaTeX形式の文字列に変換する
function polynomialToTex(coeffs, variable = 'x') {
    let parts = [];
    for (let i = coeffs.length - 1; i >= 0; i--) {
        const c = coeffs[i];
        if (c === 0) continue;
        const sign = c > 0 ? '+' : '-';
        const abs = Math.abs(c);
        let term = '';
        if (i === 0) { // constant
            term = String(abs);
        } else { // has variable
            const coeffStr = abs === 1 ? '' : String(abs);
            const powerStr = i === 1 ? '' : `^${i}`;
            term = `${coeffStr}${variable}${powerStr}`;
        }
        parts.push({sign, term});
    }
    if (parts.length === 0) return '0';
    let result = (parts[0].sign === '+') ? '' : '-';
    result += parts[0].term;
    for (let i = 1; i < parts.length; i++) {
        result += ` ${parts[i].sign} ${parts[i].term}`;
    }
    return result;
}

// 分数係数の多項式をKaTeX形式に変換
function fractionalPolynomialToTex(coeffs, variable = 'x') {
    let parts = [];
    for (let i = coeffs.length - 1; i >= 1; i--) { // skip C
        const c = coeffs[i];
        if (c[0] === 0) continue;
        const sign = c[0] > 0 ? '+' : '-';
        const abs = [Math.abs(c[0]), c[1]];
        let term = '';
        const coeffStr = (abs[0] === abs[1]) ? '' : toTex(abs);
        const powerStr = i === 1 ? '' : `^${i}`;
        term = `${coeffStr}${variable}${powerStr}`;
        parts.push({sign, term});
    }
    if (parts.length === 0) return '';
    let result = (parts[0].sign === '+') ? '' : '-';
    result += parts[0].term;
    for (let i = 1; i < parts.length; i++) {
        result += ` ${parts[i].sign} ${parts[i].term}`;
    }
    return result;
}

// 整数係数の多項式の値を計算する
function evaluateIntPolynomial(coeffs, x) {
    let total = 0;
    for (let i = 0; i < coeffs.length; i++) {
        total += coeffs[i] * Math.pow(x, i);
    }
    return total;
}

// 分数係数の多項式の値を計算する
function evaluateFracPolynomial(coeffs, x) {
    let total = [0, 1]; // Start with fraction 0/1
    for (let i = 0; i < coeffs.length; i++) {
        const termCoeff = coeffs[i];
        if (termCoeff[0] === 0) continue;
        const x_pow_i = [Math.pow(x, i), 1];
        const termValue = mul(termCoeff, x_pow_i);
        total = add(total, termValue);
    }
    return total;
}

// ... (differentiate, integrate) ...
function differentiate(coeffs) {
    const derivativeCoeffs = [];
    for (let i = 1; i < coeffs.length; i++) {
        derivativeCoeffs.push(coeffs[i] * i);
    }
    return derivativeCoeffs;
}
function integrate(coeffs) {
    const integralCoeffs = [[0, 1]];
    for (let i = 0; i < coeffs.length; i++) {
        integralCoeffs.push(simplify(coeffs[i], i + 1));
    }
    return integralCoeffs;
}

function genProblem(mode, difficulty, i, type) {
    const problemType = type || mode;
    
    let coeffs, polyTex, problem = '', answer = '';

    if (problemType === 'diff') {
        coeffs = generatePolynomial(5);
        polyTex = polynomialToTex(coeffs);
        problem = `f(x) = ${polyTex}`;
        const derivativeCoeffs = differentiate(coeffs);
        answer = `f'(x) = ${polynomialToTex(derivativeCoeffs)}`;

    } else if (problemType === 'indef_integ') {
        coeffs = generatePolynomial(3);
        polyTex = polynomialToTex(coeffs);
        problem = `\\int \\left( ${polyTex} \\right) dx`;
        const integralCoeffs = integrate(coeffs);
        answer = `${fractionalPolynomialToTex(integralCoeffs)} + C`;

    } else if (problemType === 'def_integ') {
        coeffs = generatePolynomial(3);
        polyTex = polynomialToTex(coeffs);
        let a = randInt(-3, 3);
        let b = randInt(-3, 3);
        if (a === b) b += 1;
        if (a > b) [a, b] = [b, a];

        problem = `\\int_{${a}}^{${b}} \\left( ${polyTex} \\right) dx`;
        
        const integralCoeffs = integrate(coeffs);
        const val_b = evaluateFracPolynomial(integralCoeffs, b);
        const val_a = evaluateFracPolynomial(integralCoeffs, a);
        const result = sub(val_b, val_a);
        answer = toTex(result);

    } else if (problemType === 'limit') {
        const a = randInt(-4, 4);
        if (i < 4) { // Simple polynomial limit
            coeffs = generatePolynomial(3);
            polyTex = polynomialToTex(coeffs);
            problem = `\\lim_{x \\to ${a}} \\left( ${polyTex} \\right)`;
            answer = String(evaluateIntPolynomial(coeffs, a));
        } else { // Indeterminate form 0/0
            const root = a;
            const Nx = generatePolynomial(1);
            let Dx = generatePolynomial(1);
            while (evaluateIntPolynomial(Dx, root) === 0) {
                Dx = generatePolynomial(1); // Ensure D(root) is not zero
            }
            const factor = [-root, 1]; // (x - root)
            const Px = multiplyPolynomials(Nx, factor);
            const Qx = multiplyPolynomials(Dx, factor);

            const p_tex = polynomialToTex(Px);
            const q_tex = polynomialToTex(Qx);

            problem = `\\lim_{x \\to ${root}} \\frac{${p_tex}}{${q_tex}}`;

            const ans_num = evaluateIntPolynomial(Nx, root);
            const ans_den = evaluateIntPolynomial(Dx, root);
            answer = toTex(simplify(ans_num, ans_den));
        }
    }

    return { tex: problem, ansTex: answer };
}