// Depends on: math_utils.js

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

function genProblem(mode, difficulty) {
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

    const tex = `\(${equationToTex_quadratic(eq)}\)`;
    
    let ansTex = '';
    if (x1[0] === x2[0] && x1[1] === x2[1]) {
        ansTex = `\(x = ${toTex(x1)}\) (重解)`;
    } else {
        const x1_val = x1[0]/x1[1];
        const x2_val = x2[0]/x2[1];
        const root1_str = toTex(x1_val < x2_val ? x1 : x2);
        const root2_str = toTex(x1_val < x2_val ? x2 : x1);
        ansTex = `\(x = ${root1_str}, ${root2_str}\)`;
    }

    return { tex, ansTex };
}
