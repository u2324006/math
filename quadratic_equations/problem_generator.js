// Depends on: math_utils.js

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    return b === 0 ? a : gcd(b, a % b);
}

// Helper functions for quadratic_formula case to avoid conflicts
function qf_isPerfectSquare(n) {
    if (n < 0) return false;
    const sqrt = Math.sqrt(n);
    return sqrt % 1 === 0;
}

function qf_simplifySqrt(n) {
    if (n < 0) return [1, n];
    for (let i = Math.floor(Math.sqrt(n)); i > 1; i--) {
        if (n % (i * i) === 0) {
            return [i, n / (i * i)];
        }
    }
    return [1, n];
}

function equationToTex_quadratic({ a, b, c }) {
    const parts = [];

    // a term
    const [an, ad] = a;
    if (an !== 0) {
        if (ad === 1) { // integer
            if (Math.abs(an) === 1) parts.push(an > 0 ? 'x^2' : '-x^2');
            else parts.push(`${an}x^2`);
        } else {
            parts.push(`${toTex(a)}x^2`);
        }
    }

    // b term
    const [bn, bd] = b;
    if (bn !== 0) {
        const sign = (bn > 0) ? ' + ' : ' - ';
        const b_abs = [Math.abs(bn), bd];
        let val_str = '';
        if (bd === 1 && b_abs[0] === 1) {
            val_str = 'x';
        } else {
            val_str = `${toTex(b_abs)}x`;
        }
        parts.push(sign);
        parts.push(val_str);
    }

    // c term
    const [cn, cd] = c;
    if (cn !== 0) {
        const sign = (cn > 0) ? ' + ' : ' - ';
        const c_abs = [Math.abs(cn), cd];
        parts.push(sign);
        parts.push(toTex(c_abs));
    }
    
    let tex = parts.join('').trim();
    if (tex.startsWith('+')) {
        tex = tex.substring(1).trim();
    }

    tex += ' = 0';
    return tex;
}

function genProblem(mode, difficulty, index) {
    switch (mode) {
        case 'quadratic_formula': {
            let a, b, c, D;
            let attempts = 0;
            do {
                a = randInt(1, 4);
                b = randInt(-9, 9);
                c = randInt(-9, 9);
                
                if (a === 0 || b === 0 || c === 0) {
                    D = 0; // Force loop to continue
                    continue;
                }
                
                D = b * b - 4 * a * c;
                attempts++;
                if (attempts > 100) { // Safeguard
                    a = 1; b = 5; c = 1; 
                    D = b * b - 4 * a * c; // D = 21
                    break;
                }
            } while (D <= 0 || qf_isPerfectSquare(D));

            const eq = { a: [a, 1], b: [b, 1], c: [c, 1] };
            const tex = `\$${equationToTex_quadratic(eq)}\$`;

            const [k, m] = qf_simplifySqrt(D);

            const common_divisor = gcd(gcd(b, k), 2 * a);
            
            const b_s = -b / common_divisor;
            const k_s = k / common_divisor;
            const den_s = (2 * a) / common_divisor;

            let ansTex_str;
            const sqrt_part = (k_s === 1) ? `\\sqrt{${m}}` : `${k_s}\\sqrt{${m}}`;

            if (den_s === 1) {
                ansTex_str = `x = ${b_s} \\pm ${sqrt_part}`;
            } else if (den_s === -1) {
                ansTex_str = `x = ${-b_s} \\mp ${sqrt_part}`;
            } else {
                ansTex_str = `x = \\frac{${b_s} \\pm ${sqrt_part}}{${den_s}}`;
            }
            
            const ansTex = `\$${ansTex_str}\$`;
            return { tex, ansTex };
        }

        case 'heavy_diff_squares': {
            const max_val_const = { easy: 5, normal: 9, hard: 12 }[difficulty] || 9;
            let tex = '';
            let ansTex = '';

            if (index % 2 === 0) { // Double Root: (x+a)^2 = 0
                let a = randInt(1, max_val_const);
                if (a === 0) a = 1;
                let final_a = Math.random() < 0.5 ? a : -a;

                const x_coeff = 2 * final_a;
                const const_term = final_a * final_a;

                let parts = ['x^{2}'];
                if (x_coeff !== 0) {
                    const sign = x_coeff > 0 ? ' + ' : ' - ';
                    const val = Math.abs(x_coeff);
                    const val_str = val === 1 ? 'x' : `${val}x`;
                    parts.push(sign, val_str);
                }
                if (const_term !== 0) {
                    parts.push(' + ', const_term);
                }
                let problem_tex = parts.join('').trim();
                if (problem_tex.startsWith('+')) problem_tex = problem_tex.substring(1).trim();
                
                tex = `\$${problem_tex} = 0\$`;
                ansTex = `\$x = ${-final_a}\$ (重解)`;

            } else { // Difference of Squares
                if (index === 3 || index === 7) { // (bx)^2 - a^2 = 0
                    let a = randInt(1, 5);
                    let b = randInt(2, 4);
                    
                    while (gcd(a, b) !== 1) {
                        a = randInt(1, 5);
                        b = randInt(2, 4);
                    }
            
                    const x2_coeff = b * b;
                    const const_term = a * a;
            
                    tex = `\$${x2_coeff}x^2 - ${const_term} = 0\$`;
            
                    const root_frac = [a, b];
                    ansTex = `\$x = \\pm ${toTex(root_frac)}\$`;

                } else { // x^2 - a^2 = 0
                    let a = randInt(1, max_val_const);
                    if (a === 0) a = 1; // Avoid x^2 = 0
    
                    const const_term = a * a;
    
                    tex = `\$x^2 - ${const_term} = 0\$`;
    
                    let root1 = a;
                    let root2 = -a;
                    if (root1 > root2) [root1, root2] = [root2, root1];
    
                    ansTex = `\$x = ${root1}, ${root2}\$`;
                }
            }
            return { tex, ansTex };
        }

        default: {
            const x1 = randomRational(mode, difficulty);
            let x2 = randomRational(mode, difficulty);

            if (Math.random() < 0.7) {
                while(x1[0] === x2[0] && x1[1] === x2[1]) {
                    x2 = randomRational(mode, difficulty);
                }
            }

            const sum_of_roots = add(x1, x2);
            const prod_of_roots = mul(x1, x2);

            const B = [-sum_of_roots[0], sum_of_roots[1]];
            const C = prod_of_roots;

            const a_coef = [randInt(-3, 3) || 1, 1];

            const eq = {
                a: a_coef,
                b: mul(a_coef, B),
                c: mul(a_coef, C)
            };

            eq.a = simplify(eq.a[0], eq.a[1]);
            eq.b = simplify(eq.b[0], eq.b[1]);
            eq.c = simplify(eq.c[0], eq.c[1]);

            const tex_str = equationToTex_quadratic(eq);
            const tex = `\$${tex_str}\$`;
            
            let ansTex = '';
            let ansTex_str = '';
            if (x1[0] === x2[0] && x1[1] === x2[1]) {
                ansTex_str = `x = ${toTex(x1)} (重解)`;
            } else {
                const x1_val = x1[0]/x1[1];
                const x2_val = x2[0]/x2[1];
                const root1_str = toTex(x1_val < x2_val ? x1 : x2);
                const root2_str = toTex(x1_val < x2_val ? x2 : x1);
                ansTex_str = `x = ${root1_str}, ${root2_str}`;
            }
            ansTex = `\$${ansTex_str}\$`;

            return { tex, ansTex };
        }
    }
}