function genProblem(mode, difficulty, index) {
    const max_val_const = { easy: 5, normal: 9, hard: 12 }[difficulty] || 9; // For constants
    const max_val_coeff_x = { easy: 2, normal: 3, hard: 4 }[difficulty] || 3; // For x coefficients (a, c)

    let formula_type;

    switch (mode) {
        case 'x_coeff_1':
            formula_type = 4;
            break;
        case 'comp_square_diff':
            if (index % 2 === 0) { // Even index: Completing the square
                const subtypes = [1, 2, 6];
                formula_type = subtypes[randInt(0, subtypes.length - 1)];
            } else { // Odd index: Difference of squares
                formula_type = 3;
            }
            break;
        case 'int': // xの係数が1及び平方完成と平方の差
            const system = randInt(1, 3);
            if (system === 1) { // Completing the square (x-coeff=1 only)
                formula_type = randInt(1, 2);
            } else if (system === 2) { // Difference of squares
                formula_type = 3;
            } else { // General case (x-coeff=1)
                formula_type = 4;
            }
            break;
        case 'x_coeff_not_1':
            formula_type = 5;
            break;
        case 'all':
            // 50% chance for advanced (types 5,6), 50% for simple (types 1-4)
            if (Math.random() < 0.5) {
                formula_type = randInt(5, 6);
            } else {
                formula_type = randInt(1, 4);
            }
            break;
        default: // Fallback to 'all'
            if (Math.random() < 0.5) {
                formula_type = randInt(5, 6);
            } else {
                formula_type = randInt(1, 4);
            }
            break;
    }
    
    let a, b; // These will be used for existing cases 1-4
    let tex = '';
    let ansTex = '';

    if (formula_type === 5 || formula_type === 6) {
        let a_coeff, b_const, c_coeff, d_const;

        // Generate first factor (ax+b)
        do {
            a_coeff = randInt(2, max_val_coeff_x);
            b_const = randInt(1, max_val_const);
        } while (gcd(a_coeff, b_const) !== 1);

        if (formula_type === 6) {
            // Perfect square (ax+b)^2, so factors are the same
            c_coeff = a_coeff;
            d_const = b_const;
        } else {
            // Type 5: (ax+b)(cx+d), ensure factors are not identical
            do {
                c_coeff = randInt(2, max_val_coeff_x);
                d_const = randInt(1, max_val_const);
            } while (gcd(c_coeff, d_const) !== 1 || (a_coeff === c_coeff && b_const === d_const));
        }

        // Randomly make some negative
        let final_a_coeff = Math.random() < 0.5 ? a_coeff : -a_coeff;
        let final_b_const = Math.random() < 0.5 ? b_const : -b_const;
        let final_c_coeff = (formula_type === 6) ? final_a_coeff : (Math.random() < 0.5 ? c_coeff : -c_coeff);
        let final_d_const = (formula_type === 6) ? final_b_const : (Math.random() < 0.5 ? d_const : -d_const);

        const isPerfectSquare = (formula_type === 6) || (final_a_coeff === final_c_coeff && final_b_const === final_d_const);

        if (isPerfectSquare && final_a_coeff < 0) {
            final_a_coeff *= -1;
            final_b_const *= -1;
            final_c_coeff = final_a_coeff;
            final_d_const = final_b_const;
        }

        // Helper to format a factor like (gx + h) or g(x + h)
        function formatFactorWithGCD(coeff_x, const_val) {
            const common_divisor = gcd(Math.abs(coeff_x), Math.abs(const_val));
            
            let display_coeff_x = coeff_x;
            let display_const_val = const_val;
            let prefix = '';

            if (common_divisor > 1) {
                prefix = `${common_divisor}`;
                display_coeff_x = coeff_x / common_divisor;
                display_const_val = const_val / common_divisor;
            }

            let x_term = '';
            if (display_coeff_x === 1) {
                x_term = 'x';
            } else if (display_coeff_x === -1) {
                x_term = '-x';
            } else {
                x_term = `${display_coeff_x}x`;
            }

            let const_term_str = '';
            if (display_const_val !== 0) {
                const_term_str = display_const_val >= 0 ? `+${display_const_val}` : `${display_const_val}`;
            }

            const inner_content = `${x_term}${const_term_str}`;

            if (prefix) {
                return `${prefix}(${inner_content})`;
            } else {
                return `(${inner_content})`;
            }
        }

        const factor1_tex_raw = formatFactorWithGCD(final_a_coeff, final_b_const);
        const factor2_tex_raw = formatFactorWithGCD(final_c_coeff, final_d_const);

        if (isPerfectSquare) {
            // If factors are identical, display as (Ax+B)^2
            ansTex = `$${factor1_tex_raw}^{2}$`;
        } else {
            // Otherwise, display as (Ax+B)(Cx+D)
            ansTex = `$${factor1_tex_raw}${factor2_tex_raw}$`;
        }

        // Expand: (ac)x^2 + (ad+bc)x + (bd)
        const x2_coeff = final_a_coeff * final_c_coeff;
        const x_coeff = (final_a_coeff * final_d_const) + (final_b_const * final_c_coeff);
        const const_term = final_b_const * final_d_const;

        let parts = [];
        if (x2_coeff !== 0) {
            if (x2_coeff === 1) {
                parts.push('x^{2}');
            } else if (x2_coeff === -1) {
                parts.push('-x^{2}');
            } else {
                parts.push(`${x2_coeff}x^{2}`);
            }
        }
        if (x_coeff !== 0) {
            const sign = x_coeff > 0 ? '+' : '-';
            const val = Math.abs(x_coeff);
            parts.push(sign);
            if (val !== 1) {
                parts.push(val);
            }
            parts.push('x');
        }
        if (const_term !== 0) {
            const sign = const_term > 0 ? '+' : '-';
            const val = Math.abs(const_term);
            parts.push(sign);
            parts.push(val);
        }
        tex = `$${parts.join(' ').replace(/^\+ /g, '').replace(/ \+ /g, ' + ').replace(/ \- /g, ' - ')}$`;

    } else { // Existing cases 1-4 (x coefficient is 1)
        a = randInt(1, max_val_const);
        b = randInt(1, max_val_const); // For case 4

        // Randomly make a and b negative for existing cases
        const final_a = Math.random() < 0.5 ? a : -a;
        const final_b = Math.random() < 0.5 ? b : -b;

        switch (formula_type) {
            case 1: // x^2 + 2ax + a^2 = (x+a)^2
                const term1_case1 = final_a >= 0 ? `+ ${final_a}` : `${final_a}`;
                ansTex = `$(x ${term1_case1})^{2}$`;
                tex = `$x^{2} ${2*final_a >= 0 ? '+': ''}${2 * final_a}x ${final_a*final_a >= 0 ? '+': ''}${final_a * final_a}$`;
                break;
            
            case 2: // x^2 - 2ax + a^2 = (x-a)^2
                const term1_case2 = final_a >= 0 ? `- ${final_a}` : `+ ${Math.abs(final_a)}`;
                ansTex = `$(x ${term1_case2})^{2}$`;
                tex = `$x^{2} ${-2*final_a >= 0 ? '+': ''}${-2 * final_a}x ${final_a*final_a >= 0 ? '+': ''}${final_a * final_a}$`;
                break;

            case 3: // x^2 - a^2 = (x+a)(x-a)
                const term1_case3_plus = final_a >= 0 ? `+ ${final_a}` : `${final_a}`;
                const term1_case3_minus = final_a >= 0 ? `- ${final_a}` : `+ ${Math.abs(final_a)}`;
                ansTex = `$(x ${term1_case3_plus})(x ${term1_case3_minus})$`;
                tex = `$x^{2} - ${final_a * final_a}$`;
                break;

            case 4: // x^2 + (a+b)x + ab = (x+a)(x+b)
            default:
                const term1_case4 = final_a >= 0 ? `+ ${final_a}` : `${final_a}`;
                const term2_case4 = final_b >= 0 ? `+ ${final_b}` : `${final_b}`;
                ansTex = `$(x ${term1_case4})(x ${term2_case4})$`;
                
                const sum_ab = final_a + final_b;
                const prod_ab = final_a * final_b;

                let parts = ['x^{2}'];
                if (sum_ab !== 0) {
                    const sign = sum_ab > 0 ? '+' : '-';
                    const val = Math.abs(sum_ab);
                    parts.push(sign);
                    if (val !== 1) {
                        parts.push(val);
                    }
                    parts.push('x');
                }
                if (prod_ab !== 0) {
                    const sign = prod_ab > 0 ? '+' : '-';
                    const val = Math.abs(prod_ab);
                    parts.push(sign);
                    parts.push(val);
                }
                tex = `$${parts.join(' ').replace(/^\+ /g, '').replace(/ \+ /g, ' + ').replace(/ \- /g, ' - ')}$`;
                break;
        }
    }

    return { tex, ansTex };
}