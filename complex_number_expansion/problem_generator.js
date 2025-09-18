
function genProblem(mode, difficulty) {
    if (mode === 'expansion') {
        let a, b, c, d;
        const max_val = 9;

        a = randInt(1, max_val);
        b = randInt(1, max_val);
        c = randInt(1, max_val);
        d = randInt(1, max_val);

        // Randomly make numbers negative
        a = Math.random() < 0.5 ? a : -a;
        b = Math.random() < 0.5 ? b : -b;
        c = Math.random() < 0.5 ? c : -c;
        d = Math.random() < 0.5 ? d : -d;

        // Format the complex numbers for display
        const formatComplex = (real, imag) => {
            let parts = [];
            if (real !== 0) {
                parts.push(real);
            }
            if (imag !== 0) {
                if (imag > 0 && parts.length > 0) {
                    parts.push('+');
                }
                if (imag === 1) {
                    parts.push('i');
                } else if (imag === -1) {
                    parts.push('-i');
                } else {
                    parts.push(imag + 'i');
                }
            }
            if (parts.length === 0) {
                return '0';
            }
            return parts.join(' ');
        };

        const factor1 = `(${formatComplex(a, b)})`;
        const factor2 = `(${formatComplex(c, d)})`;

        const tex = factor1 + factor2;

        // Calculate the answer: (a + bi)(c + di) = (ac - bd) + (ad + bc)i
        const realPart = a * c - b * d;
        const imagPart = a * d + b * c;

        const ansTex = formatComplex(realPart, imagPart);
        console.log("Generated ansTex (expansion):", ansTex);
        return { tex, ansTex };
    } else if (mode === 'quadratic') {
        let a, b, c, discriminant;
        const max_val = 9;

        do {
            a = randInt(1, max_val);
            b = randInt(1, max_val);
            c = randInt(1, max_val);
            a = Math.random() < 0.5 ? a : -a;
            b = Math.random() < 0.5 ? b : -b;
            c = Math.random() < 0.5 ? c : -c;
            discriminant = b * b - 4 * a * c;
        } while (discriminant >= 0);

        let tex = '';
        if (a === 1) {
            tex += 'x^{2}';
        } else if (a === -1) {
            tex += '-x^{2}';
        } else {
            tex += `${a}x^{2}`;
        }

        if (b !== 0) {
            if (b > 0) {
                tex += `+${b}x`;
            } else {
                tex += `${b}x`;
            }
        }

        if (c !== 0) {
            if (c > 0) {
                tex += `+${c}`;
            } else {
                tex += `${c}`;
            }
        }
        tex += ' = 0';

        const sqrtDiscriminant = Math.sqrt(-discriminant);
        let denominator = 2 * a;

        let ansTex = 'x = ';
        if (Number.isInteger(sqrtDiscriminant)) {
            const g = gcd(Math.abs(b), sqrtDiscriminant);
            const common_divisor = gcd(g, Math.abs(denominator));
            
            let num_real_display = -b / common_divisor;
            let num_imag_display = sqrtDiscriminant / common_divisor;
            let den = denominator / common_divisor;

            if (den < 0) {
                den = -den;
                num_real_display = -num_real_display;
                num_imag_display = -num_imag_display;
            }

            let imag_term;
            if (num_imag_display === 1) {
                imag_term = 'i';
            } else if (num_imag_display === -1) {
                imag_term = '-i';
            } else {
                imag_term = `${num_imag_display}i`;
            }

            if (den === 1) {
                ansTex += String.raw`${num_real_display} \pm ${imag_term}`;
            } else {
                ansTex += String.raw`\frac{${num_real_display} \pm ${imag_term}}{${den}}`;
            }
        } else {
            let num_b_display = -b;
            let num_sqrt_display = -discriminant;
            let den_display = denominator;

            // Simplify the square root
            let sqrt_factor = 1;
            let remaining_sqrt = num_sqrt_display;
            for (let i = 2; i * i <= remaining_sqrt; i++) {
                while (remaining_sqrt % (i * i) === 0) {
                    sqrt_factor *= i;
                    remaining_sqrt /= (i * i);
                }
            }

            let imag_sqrt_term;
            if (sqrt_factor === 1) {
                imag_sqrt_term = String.raw`\sqrt{${remaining_sqrt}}i`;
            } else {
                imag_sqrt_term = String.raw`${sqrt_factor}\sqrt{${remaining_sqrt}}i`;
            }

            if (den_display < 0) {
                den_display = -den_display;
                num_b_display = -num_b_display;
                // imag_sqrt_term also needs to be negated if it's not already handled by the \pm
                // For now, we'll assume the \pm handles the sign for the imaginary part
            }

            // Simplify the fraction by dividing by common divisor of num_b_display, sqrt_factor, and den_display
            let common_divisor_all = gcd(gcd(Math.abs(num_b_display), sqrt_factor), den_display);
            if (common_divisor_all > 1) {
                num_b_display /= common_divisor_all;
                sqrt_factor /= common_divisor_all;
                den_display /= common_divisor_all;
            }

            if (den_display === 1) {
                ansTex += String.raw`${num_b_display} \pm ${imag_sqrt_term}`; // This might need more careful handling of sqrt_factor
            } else {
                // Reconstruct imag_sqrt_term after simplification
                if (sqrt_factor === 1) {
                    imag_sqrt_term = String.raw`\sqrt{${remaining_sqrt}}i`;
                } else {
                    imag_sqrt_term = String.raw`${sqrt_factor}\sqrt{${remaining_sqrt}}i`;
                }
                ansTex += String.raw`\frac{${num_b_display} \pm ${imag_sqrt_term}}{${den_display}}`;
            }
        }
        console.log("Generated ansTex (quadratic):", ansTex);
        return { tex, ansTex };
    }
}

// Helper function for gcd, assuming it's not available in math_utils.js
function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

// Helper function for randInt, assuming it's not available in math_utils.js
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
