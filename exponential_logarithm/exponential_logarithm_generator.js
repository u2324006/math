function formatLinearExpr(coeff, const_term, variable = 'x') {
    let expr = '';
    if (coeff === 1) {
        expr += variable;
    } else if (coeff === -1) {
        expr += `-${variable}`;
    } else if (coeff !== 0) {
        expr += `${coeff}${variable}`;
    }

    if (const_term > 0) {
        if (expr !== '') {
            expr += `+${const_term}`;
        } else {
            expr += `${const_term}`;
        }
    } else if (const_term < 0) {
        expr += `${const_term}`;
    }
    return expr;
}

function genProblem(mode, difficulty) {
    let tex = '';
    let ansTex = '';

    if (mode === 'exponential_calculation') {
        return generateRationalExponentProblem();
    } else if (mode === 'exponential_equation') {
        const x = randInt(-3, 3);
        const a = randInt(2, 4);
        const b = randInt(1, 3);
        const c = randInt(-3, 3);
        if ((b * x + c) === 0 || (b * x + c) === 1) {
            return genProblem(mode, difficulty);
        }
        const lhs_exponent = b * x + c;
        const k = randInt(2, 4);
        const d = Math.pow(a, k);
        const y = { num: lhs_exponent, den: k };
        const commonDivisor = gcd(Math.abs(y.num), y.den);
        y.num /= commonDivisor;
        y.den /= commonDivisor;
        let lhsTex = `${a}^{`;
        if (b === 1) lhsTex += 'x';
        else if (b === -1) lhsTex += '-x';
        else lhsTex += `${b}x`;
        if (c > 0) lhsTex += `+${c}`;
        else if (c < 0) lhsTex += `${c}`;
        lhsTex += '}';
        let rhsTex;
        const val = Math.pow(a, lhs_exponent);
        if (Number.isInteger(val) && val > 0 && val < 10000 && randInt(0, 2) === 0) {
            rhsTex = String(val);
        } else {
            if (y.den === 1) {
                rhsTex = `${d}^{${y.num}}`;
            } else {
                const useRootForm = randInt(0, 1) === 1;
                if (useRootForm) {
                    const abs_y_num = Math.abs(y.num);
                    let rootExpr = '';
                    let rootContent = `${d}`;
                    if (abs_y_num !== 1) {
                        rootContent = `${d}^{${abs_y_num}}`;
                    }
                    if (y.den === 2) {
                        rootExpr = `\\sqrt{${rootContent}}`;
                    } else {
                        rootExpr = `\\sqrt[${y.den}]{${rootContent}}`;
                    }
                    if (y.num < 0) {
                        rhsTex = `\\frac{1}{${rootExpr}}`;
                    } else {
                        rhsTex = rootExpr;
                    }
                } else {
                    rhsTex = `${d}^{\\frac{${y.num}}{${y.den}}}`;
                }
            }
        }
        tex = `${lhsTex} = ${rhsTex}`;
        ansTex = `x = ${x}`;

    } else if (mode === 'logarithmic_calculation') {
        const pattern = randInt(1, 5);
        let base, baseTex, exp1, exp2, val1, val2;

        const baseType = randChoice(['integer', 'fraction', 'root']);
        
        switch (baseType) {
            case 'integer':
                base = randInt(2, 9);
                baseTex = base;
                break;
            case 'fraction':
                const den = randInt(2, 4);
                base = `1/${den}`;
                baseTex = `\\frac{1}{${den}}`;
                break;
            case 'root':
                const root_val = randInt(2, 3);
                const radicand = randInt(2, 5);
                base = `root(${radicand}, ${root_val})`;
                baseTex = `\\sqrt${root_val === 2 ? '' : `[${root_val}]`}{${radicand}}`;
                break;
        }

        switch (pattern) {
            case 1: // log_a(M) + log_a(N) -> integer
                if (baseType !== 'integer') return genProblem(mode, difficulty);
                exp1 = randInt(2, 4);
                exp2 = randInt(2, 4);
                val1 = Math.pow(base, exp1);
                val2 = Math.pow(base, exp2);
                tex = `\\log_{${baseTex}}{${val1}} + \\log_{${baseTex}}{${val2}}`;
                ansTex = `${exp1 + exp2}`;
                break;
            case 2: // log_a(M) - log_a(N) -> integer
                if (baseType !== 'integer') return genProblem(mode, difficulty);
                exp1 = randInt(4, 6);
                exp2 = randInt(2, exp1 - 1);
                val1 = Math.pow(base, exp1);
                val2 = Math.pow(base, exp2);
                tex = `\\log_{${baseTex}}{${val1}} - \\log_{${baseTex}}{${val2}}`;
                ansTex = `${exp1 - exp2}`;
                break;
            case 3: // k * log_a(M) -> integer
                if (baseType !== 'integer') return genProblem(mode, difficulty);
                exp1 = randInt(2, 4);
                exp2 = randInt(2, 3);
                val1 = Math.pow(base, exp2);
                tex = `${exp1}\\log_{${baseTex}}{${val1}}`;
                ansTex = `${exp1 * exp2}`;
                break;
            case 4: // log_a(a^k) -> integer
                if (baseType !== 'integer') return genProblem(mode, difficulty);
                exp1 = randInt(2, 4); // Reduced max exponent
                const val_log = Math.pow(base, exp1);
                if (val_log > 10000) { // Avoid excessively large numbers
                    return genProblem(mode, difficulty);
                }
                tex = `\\log_{${base}}{${val_log}}`;
                ansTex = `${exp1}`;
                break;
            case 5: // log_a(M) + log_a(N) -> log_a(MN) or simplified
                let num1 = randInt(2, 10);
                let num2 = randInt(2, 10);
                
                if (baseType === 'integer') {
                    while (num1 === base || num2 === base || (num1 * num2) === base) {
                        num1 = randInt(2, 10);
                        num2 = randInt(2, 10);
                    }
                }

                const product = num1 * num2;
                tex = `\\log_{${baseTex}}{${num1}} + \\log_{${baseTex}}{${num2}}`;
                
                let outerCoeff = [1, 1];
                let finalBase = base;

                if (baseType === 'fraction') {
                    outerCoeff = [-1, 1];
                    finalBase = parseInt(base.split('/')[1]);
                } else if (baseType === 'root') {
                    const match = base.match(/root\\((\\d+), (\\d+)\\)/);
                    const radicand_root = parseInt(match[1]);
                    const root_val_root = parseInt(match[2]);
                    outerCoeff = [root_val_root, 1];
                    finalBase = radicand_root;
                }

                if (!Number.isInteger(finalBase)) {
                    ansTex = `\\log_{${baseTex}}{${product}}`;
                } else {
                    const simplifiedStruct = simplifyLog(finalBase, product);

                    if (simplifiedStruct) {
                        ansTex = formatSimplifiedLog(simplifiedStruct, outerCoeff);
                    } else {
                        let tempTex = '';
                        if (outerCoeff[0] < 0) tempTex += '-';
                        if (Math.abs(outerCoeff[0]) !== 1 || outerCoeff[1] !== 1) {
                            tempTex += toTex([Math.abs(outerCoeff[0]), outerCoeff[1]]);
                        }
                        tempTex += `\\log_{${finalBase}}{${product}}`;
                        ansTex = tempTex;
                    }
                }
                break;
        }

    } else if (mode === 'logarithmic_equation') {
        const problemType = randInt(2, 4); // 1: existing, 2: type 1, 3: type 2, 4: type 3

        if (problemType === 1) {
            // This case is now excluded
            const base = randInt(2, 5);
            const k = randInt(2, 4);
            const x = Math.pow(base, k);
            tex = `\\log_{${base}}{x} = ${k}`;
            ansTex = `x = ${x}`;
        } else if (problemType === 2) {
            // Type 1: log_A(bx+c) = log_A(dx+e)
            let base_val = randInt(2, 4); // e.g., 2, 3, 4
            let base_choice = randInt(0, 2); // 0: base_val, 1: 1/base_val, 2: base_val^2
            let A, ATex;

            if (base_choice === 0) {
                A = base_val;
                ATex = String(base_val);
            } else if (base_choice === 1) {
                A = 1 / base_val;
                ATex = `\\frac{1}{${base_val}}`;
            } else {
                A = base_val * base_val;
                ATex = String(base_val * base_val);
            }

            let b, c, d, e, x_sol;
            let attempts = 0;
            const maxAttempts = 100;

            while (attempts < maxAttempts) {
                b = randInt(1, 3);
                c = randInt(-5, 5);
                d = randInt(1, 3);
                e = randInt(-5, 5);

                // Ensure b != d to avoid division by zero for x_sol
                if (b === d) {
                    attempts++;
                    continue;
                }

                // Solve bx+c = dx+e => (b-d)x = e-c => x = (e-c)/(b-d)
                x_sol = (e - c) / (b - d);

                // Check domain constraints: bx+c > 0 and dx+e > 0
                if ((b * x_sol + c) > 0 && (d * x_sol + e) > 0) {
                    // Ensure x_sol is a reasonable integer or simple fraction
                    if (Number.isInteger(x_sol) && Math.abs(x_sol) <= 10) {
                        break;
                    }
                    const [num_x, den_x] = simplify(e - c, b - d);
                    if (Math.abs(num_x) <= 10 && Math.abs(den_x) <= 5) {
                        x_sol = num_x / den_x;
                        if ((b * x_sol + c) > 0 && (d * x_sol + e) > 0) {
                            break;
                        }
                    }
                }
                attempts++;
            }

            if (attempts === maxAttempts) {
                return genProblem(mode, difficulty); // Retry if unable to generate a valid problem
            }

            const lhs_expr = formatLinearExpr(b, c);
            const rhs_expr = formatLinearExpr(d, e);

            tex = `\\log_{${ATex}}{(${lhs_expr})} = \\log_{${ATex}}{(${rhs_expr})}`;
            ansTex = `x = ${toTex(simplify(e - c, b - d))}`;
        } else if (problemType === 3) {
            // Type 2: A*(log_a(bx+c))^2 + B*log_a(bx+c) + C = 0
            let a_base = randInt(2, 5); // Base of the logarithm
            let b_coeff, c_const;
            let A_quad, B_quad, C_quad;
            let y1_sol, y2_sol; // Solutions for y = log_a(bx+c)
            let x1_sol, x2_sol; // Solutions for x

            let attempts = 0;
            const maxAttempts = 100;

            while (attempts < maxAttempts) {
                A_quad = randInt(1, 2); // Coefficient of y^2
                B_quad = randInt(-3, 3);
                C_quad = randInt(-5, 5); // Constant term (d=0 included)

                if (A_quad === 0 || B_quad === 0) { // Ensure B is not zero for a quadratic-in-log form
                    attempts++;
                    continue;
                }

                const discriminant = B_quad * B_quad - 4 * A_quad * C_quad;

                if (discriminant >= 0) {
                    y1_sol = (-B_quad + Math.sqrt(discriminant)) / (2 * A_quad);
                    y2_sol = (-B_quad - Math.sqrt(discriminant)) / (2 * A_quad);

                    if (Number.isInteger(y1_sol) && Math.abs(y1_sol) <= 3 &&
                        Number.isInteger(y2_sol) && Math.abs(y2_sol) <= 3) {

                        b_coeff = randInt(1, 3);
                        if (Math.random() < 0.5) b_coeff = -b_coeff;
                        c_const = randInt(-5, 5);

                        let val1 = Math.pow(a_base, y1_sol);
                        let val2 = Math.pow(a_base, y2_sol);

                        if (Number.isInteger((val1 - c_const) / b_coeff) &&
                            Number.isInteger((val2 - c_const) / b_coeff)) {

                            x1_sol = (val1 - c_const) / b_coeff;
                            x2_sol = (val2 - c_const) / b_coeff;

                            if ((b_coeff * x1_sol + c_const) > 0 && (b_coeff * x2_sol + c_const) > 0) {
                                break;
                            }
                        }
                    }
                }
                attempts++;
            }

            if (attempts === maxAttempts) {
                return genProblem(mode, difficulty); // Retry
            }

            const log_expr = formatLinearExpr(b_coeff, c_const);

            let quad_tex = '';
            if (A_quad !== 1) quad_tex += `${A_quad}`;
            quad_tex += `(\\log_{${a_base}}{(${log_expr})})^2`;

            if (B_quad === 1) quad_tex += `+\\log_{${a_base}}{(${log_expr})}`;
            else if (B_quad === -1) quad_tex += `-\\log_{${a_base}}{(${log_expr})}`;
            else if (B_quad > 0) quad_tex += `+${B_quad}\\log_{${a_base}}{(${log_expr})}`;
            else if (B_quad < 0) quad_tex += `${B_quad}\\log_{${a_base}}{(${log_expr})}`;

            if (C_quad > 0) quad_tex += `+${C_quad}`;
            else if (C_quad < 0) quad_tex += `${C_quad}`;

            tex = `${quad_tex} = 0`;

            let ans_parts = [];
            if (Number.isInteger(x1_sol)) ans_parts.push(`x = ${x1_sol}`);
            if (Number.isInteger(x2_sol) && x1_sol !== x2_sol) ans_parts.push(`x = ${x2_sol}`);
            ansTex = ans_parts.join(', ');
            if (ans_parts.length === 0) ansTex = `x = ${toTex(simplify(Math.pow(a_base, y1_sol) - c_const, b_coeff))}, x = ${toTex(simplify(Math.pow(a_base, y2_sol) - c_const, b_coeff))}`;

        } else if (problemType === 4) {
            // Type 3: log_a(expression) sign d
            const exprType = randChoice(['linear', 'quadratic']);

            if (exprType === 'quadratic') {
                // log_a(bx^2+cx+d) sign e
                let a_base = randInt(2, 4);
                let e_val = randInt(1, 2);
                let K = Math.pow(a_base, e_val);
                let b_coeff, c_coeff, d_coeff;
                let r1, r2; // roots
                let inequality_sign = randChoice(['<', '>', '\\le', '\\ge']);

                let attempts = 0;
                const maxAttempts = 100;
                while (attempts < maxAttempts) {
                    b_coeff = randInt(1, 3); // b > 0 for simplicity
                    r1 = randInt(-3, 3);
                    r2 = randInt(-3, 3);

                    if (r1 === r2) continue;

                    // b(r1-r2)^2 < 4K ensures bx^2+cx+d is always positive
                    if (b_coeff * Math.pow(r1 - r2, 2) >= 4 * K) {
                        attempts++;
                        continue;
                    }

                    c_coeff = -b_coeff * (r1 + r2);
                    d_coeff = b_coeff * r1 * r2 + K;

                    if (c_coeff !== 0 && d_coeff !== 0) {
                        break;
                    }
                    attempts++;
                }

                if (attempts >= maxAttempts) {
                    return genProblem(mode, difficulty);
                }
                
                let quad_expr = '';
                if (b_coeff === 1) quad_expr += 'x^2';
                else if (b_coeff === -1) quad_expr += '-x^2';
                else quad_expr += `${b_coeff}x^2`;

                if (c_coeff === 1) quad_expr += '+x';
                else if (c_coeff === -1) quad_expr += '-x';
                else if (c_coeff > 0) quad_expr += `+${c_coeff}x`;
                else if (c_coeff < 0) quad_expr += `${c_coeff}x`;

                if (d_coeff > 0) quad_expr += `+${d_coeff}`;
                else if (d_coeff < 0) quad_expr += `${d_coeff}`;

                tex = `\\log_{${a_base}}{(${quad_expr})} ${inequality_sign} ${e_val}`;

                const min_r = Math.min(r1, r2);
                const max_r = Math.max(r1, r2);

                if (inequality_sign === '<') {
                    ansTex = `${min_r} < x < ${max_r}`;
                } else if (inequality_sign === '>') {
                    ansTex = `x < ${min_r}, x > ${max_r}`;
                } else if (inequality_sign === '\\le') {
                    ansTex = `${min_r} \\le x \\le ${max_r}`;
                } else if (inequality_sign === '\\ge') {
                    ansTex = `x \\le ${min_r}, x \\ge ${max_r}`;
                }

            } else { // linear
                // log_a(bx+c) < d
                let a_base = randInt(2, 4);
                let b_coeff, c_const, d_val;
                let inequality_sign = randChoice(['<', '>', '\\le', '\\ge']);
                let attempts = 0;
                const maxAttempts = 100;

                while (attempts < maxAttempts) {
                    b_coeff = randInt(1, 3);
                    if (Math.random() < 0.5) b_coeff = -b_coeff;
                    c_const = randInt(-5, 5);
                    d_val = randInt(1, 3);
                    let x_sol = (Math.pow(a_base, d_val) - c_const) / b_coeff;
                    let domain_val = -c_const / b_coeff;
                    if (Number.isInteger(x_sol) && Math.abs(x_sol) < 10 && x_sol !== domain_val) {
                        break;
                    }
                    attempts++;
                }

                if (attempts === maxAttempts) {
                    return genProblem(mode, difficulty);
                }

                const log_expr = formatLinearExpr(b_coeff, c_const);
                tex = `\\log_{${a_base}}{(${log_expr})} ${inequality_sign} ${d_val}`;

                const boundary_val = (Math.pow(a_base, d_val) - c_const) / b_coeff;
                const domain_boundary = -c_const / b_coeff;

                const boundary_val_tex = toTex(simplify(boundary_val, 1));
                const domain_boundary_tex = toTex(simplify(domain_boundary, 1));

                if (b_coeff > 0) {
                    const max_val = Math.max(domain_boundary, boundary_val);
                    const max_val_tex = toTex(simplify(max_val, 1));
                    if (inequality_sign === '<' || inequality_sign === '\\le') {
                        ansTex = `${domain_boundary_tex} < x ${inequality_sign} ${boundary_val_tex}`;
                    } else { // > or >=
                        ansTex = `x ${inequality_sign} ${max_val_tex}`;
                    }
                } else { // b_coeff < 0
                    const min_val = Math.min(domain_boundary, boundary_val);
                    const min_val_tex = toTex(simplify(min_val, 1));
                    const flipped_sign = { '<': '>', '>': '<', '\\le': '\\ge', '\\ge': '\\le' }[inequality_sign];
                    if (inequality_sign === '<' || inequality_sign === '\\le') {
                        ansTex = `${boundary_val_tex} ${flipped_sign} x < ${domain_boundary_tex}`;
                    } else { // > or >=
                        ansTex = `x ${flipped_sign} ${min_val_tex}`;
                    }
                }
            }
        }
    }

    return { tex, ansTex };
}

function generateRationalExponentProblem() {
    const base = randInt(2, 4);
    let p1 = randInt(1, 3), p2 = randInt(1, 3), p3 = randInt(1, 3);
    let a = Math.pow(base, p1), b = Math.pow(base, p2), c = Math.pow(base, p3);
    const x = createRational(), y = createRational(), z = createRational();

    const op1_is_mul = randChoice([true, false]);
    const op2_is_mul = randChoice([true, false]);

    const exp_x = p1 * (x.num / x.den);
    const exp_y = p2 * (y.num / y.den);
    const exp_z = p3 * (z.num / z.den);

    let total_exponent = exp_x;
    if (op1_is_mul) {
        total_exponent += exp_y;
    } else {
        total_exponent -= exp_y;
    }
    if (op2_is_mul) {
        total_exponent += exp_z;
    } else {
        total_exponent -= exp_z;
    }

    if (total_exponent !== Math.floor(total_exponent) || Math.abs(total_exponent) > 4) {
        return generateRationalExponentProblem();
    }
    let ansTex;
    if (total_exponent >= 0) {
        ansTex = String(Math.pow(base, total_exponent));
    } else {
        const den = Math.pow(base, -total_exponent);
        ansTex = toTex([1, den]);
    }
    if (Math.pow(base, total_exponent) > 1000) {
        return generateRationalExponentProblem();
    }
    const texA = formatExponent(a, x);
    const texB = formatExponent(b, y);
    const texC = formatExponent(c, z);
    
    const op1_tex = op1_is_mul ? ' \\times ' : ' \\div ';
    const op2_tex = op2_is_mul ? ' \\times ' : ' \\div ';
    const tex = `${texA}${op1_tex}${texB}${op2_tex}${texC}`;
    
    return { tex, ansTex };
}

function createRational() {
    let num, den;
    den = randInt(2, 4);
    num = randInt(-5, 5);
    if (num === 0) num = 1;
    const commonDivisor = gcd(Math.abs(num), den);
    num /= commonDivisor;
    den /= commonDivisor;
    if (den === 1) {
        return createRational();
    }
    return { num, den };
}

function formatExponent(base, rational) {
    const { num, den } = rational;
    if (den === 1) return `${base}^{${num}}`;
    if (den === 2) {
        const sqrtBase = Math.sqrt(base);
        if (Number.isInteger(sqrtBase)) {
            if (num === 1) return `${sqrtBase}`;
            return `${sqrtBase}^{${num}}`;
        } else {
            if (num === 1) return `\\sqrt{${base}}`;
            return `(\\sqrt{${base}})^{${num}}`;
        }
    }
    if (den === 3) {
        const cbrtBase = Math.cbrt(base);
        if (Math.abs(cbrtBase - Math.round(cbrtBase)) < 1e-9) {
            const roundedBase = Math.round(cbrtBase);
            if (num === 1) return `${roundedBase}`;
            return `${roundedBase}^{${num}}`;
        } else {
            if (num === 1) return `\\sqrt[3]{${base}}`;
            return `(\\sqrt[3]{${base}})^{${num}}`;
        }
    }
    return `${base}^{\\frac{${num}}{${den}}}`;
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randChoice(arr) { 
    return arr[randInt(0, arr.length - 1)]; 
}

// --- Rational Arithmetic & Formatting ---
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

function mul([a,b], [c,d]) { 
    return simplify(a*c, b*d); 
}

function toTex(fraction) {
    if (fraction[1] === 1) return String(fraction[0]);
    return `\\frac{${fraction[0]}}{${fraction[1]}}`;
}

// --- Log Simplification Helpers ---

function getPrimeFactorization(num) {
    const factors = {};
    let n = num;
    let d = 2;
    while (d * d <= n) {
        while (n % d === 0) {
            factors[d] = (factors[d] || 0) + 1;
            n /= d;
        }
        d++;
    }
    if (n > 1) {
        factors[n] = (factors[n] || 0) + 1;
    }
    return factors;
}

function findBaseAndExponent(num) {
    if (num <= 1) return { base: num, exponent: 1 };
    const factors = getPrimeFactorization(num);
    const exponents = Object.values(factors);
    if (exponents.length === 0) return { base: num, exponent: 1 };
    
    const commonDivisor = exponents.reduce((a, b) => gcd(a, b), exponents[0]);
    
    if (commonDivisor === 1) {
        return { base: num, exponent: 1 };
    }
    
    let base = 1;
    for (const p in factors) {
        base *= Math.pow(p, factors[p] / commonDivisor);
    }
    
    return { base: base, exponent: commonDivisor };
}

function simplifyLog(a, p) {
    if (!Number.isInteger(a) || !Number.isInteger(p) || a <= 1 || p <= 1) {
        return null;
    }
    const { base: b, exponent: m } = findBaseAndExponent(a);
    let n = 0;
    let q = p;
    if (b > 1) {
        while (q > 0 && q % b === 0) {
            q /= b;
            n++;
        }
    }
    if (m === 1 && n === 0) return null;

    let rationalPart = simplify(n, m);

    if (q === 1) {
        return { rationalPart: rationalPart, logPart: null };
    }

    if (n === 0 && m === 1) return null;

    return {
        rationalPart: rationalPart,
        logPart: { coeff: simplify(1, m), base: b, arg: q }
    };
}

function formatSimplifiedLog(logStruct, outerCoeff = [1, 1]) {
    if (!logStruct) return null;

    const finalRational = mul(outerCoeff, logStruct.rationalPart);
    
    let tex = '';
    if (finalRational[0] !== 0) {
        tex += toTex(finalRational);
    }

    if (logStruct.logPart) {
        let finalLogCoeff = mul(outerCoeff, logStruct.logPart.coeff);
        
        if (tex !== '') {
            if (finalLogCoeff[0] > 0) {
                tex += ' + ';
            } else {
                tex += ' - ';
                finalLogCoeff[0] = -finalLogCoeff[0];
            }
        } else if (finalLogCoeff[0] < 0) {
            tex += '-';
            finalLogCoeff[0] = -finalLogCoeff[0];
        }

        if (finalLogCoeff[0] !== 1 || finalLogCoeff[1] !== 1) {
            tex += toTex(finalLogCoeff);
        }

        tex += `\\log_{${logStruct.logPart.base}}{${logStruct.logPart.arg}}`;
    }
    
    return tex;
}