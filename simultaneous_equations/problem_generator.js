function genProblem(mode, difficulty) {
    let x, y;
    let a, b, c, d, e, f;
    let sol_x_n, sol_x_d, sol_y_n, sol_y_d;
    let isValidProblem = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 1000; // Safeguard against infinite loops

    do {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            console.warn("Max attempts reached for generating a valid problem. Returning potentially invalid problem.");
            break; // Exit loop if too many attempts
        }

        // Generate solutions first, ensuring x and y are not 0
        do {
            x = randInt(-9, 9);
            y = randInt(-9, 9);
        } while (x === 0 || y === 0);

        // Generate coefficients for the first equation: ax + by = c
        a = randInt(-5, 5);
        b = randInt(-5, 5);
        // Ensure coefficients are not zero
        while (a === 0) a = randInt(-5, 5);
        while (b === 0) b = randInt(-5, 5);

        // Generate coefficients for the second equation: dx + ey = f
        d = randInt(-5, 5);
        e = randInt(-5, 5);
        // Ensure coefficients are not zero
        while (d === 0) d = randInt(-5, 5);
        while (e === 0) e = randInt(-5, 5);

        // Ensure the equations are not parallel or identical (determinant is not zero)
        while ((a * e) - (b * d) === 0) {
            d = randInt(-5, 5);
            while (d === 0) d = randInt(-5, 5);
            e = randInt(-5, 5);
            while (e === 0) e = randInt(-5, 5);
        }

        if (mode === 'frac') {
            // To get fractional solutions, we can slightly alter one of the constants
            c = a * x + b * y;
            // Add a small random integer to 'f' to likely make solutions fractional
            // Ensure 'f' is not too large to keep solutions within reasonable bounds
            f = d * x + e * y + randInt(-3, 3);
            // If f becomes 0, it might lead to integer solutions again, so ensure it's not 0
            while (f === 0) f = d * x + e * y + randInt(-3, 3);

        } else { // 'int' mode
            // Calculate constants
            c = a * x + b * y;
            f = d * x + e * y;
        }

        // Solve the system to get the actual solutions
        const determinant = a * e - b * d;
        const sol_x_num = c * e - b * f;
        const sol_y_num = a * f - c * d;

        [sol_x_n, sol_x_d] = simplify(sol_x_num, determinant);
        [sol_y_n, sol_y_d] = simplify(sol_y_num, determinant);

        // Check conditions for problem validity
        isValidProblem = true;

        // For 'int' mode, ensure solutions are integers
        if (mode === 'int') {
            if (sol_x_d !== 1 || sol_y_d !== 1) {
                isValidProblem = false;
            }
        }

        // For 'frac' mode, ensure numerators and denominators are <= 15
        if (mode === 'frac') {
            if (Math.abs(sol_x_n) > 15 || Math.abs(sol_x_d) > 15 ||
                Math.abs(sol_y_n) > 15 || Math.abs(sol_y_d) > 15) {
                isValidProblem = false;
            }
            // Also ensure that the solutions are actually fractional (not integers)
            if (sol_x_d === 1 && sol_y_d === 1) {
                isValidProblem = false;
            }
        }

    } while (!isValidProblem);


    // Format the equations into LaTeX
    const eq1 = formatEquation(a, b, c);
    const eq2 = formatEquation(d, e, f);
    const tex = String.raw`\begin{cases} ${eq1} \\ ${eq2} \end{cases}`;

    // Format the solutions
    const ansTex = `x = ${toTex([sol_x_n, sol_x_d])}, y = ${toTex([sol_y_n, sol_y_d])}`;

    return { tex, ansTex };
}

function formatEquation(a, b, c) {
    let parts = [];
    if (a !== 0) {
        if (a === 1) parts.push('x');
        else if (a === -1) parts.push('-x');
        else parts.push(`${a}x`);
    }

    if (b !== 0) {
        if (parts.length > 0) {
            if (b > 0) parts.push('+');
            else parts.push('-');
        } else if (b < 0) {
            parts.push('-');
        }
        
        const abs_b = Math.abs(b);
        if (abs_b === 1) parts.push('y');
        else parts.push(`${abs_b}y`);
    }

    parts.push(`= ${c}`);
    return parts.join(' ');
}

// Utility functions (assuming they are missing from the previous context)
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function gcd(a, b) {
    return b === 0 ? a : gcd(b, a % b);
}

function simplify(numerator, denominator) {
    if (denominator === 0) {
        return [numerator, denominator]; // Avoid division by zero
    }
    const commonDivisor = gcd(numerator, denominator);
    let n = numerator / commonDivisor;
    let d = denominator / commonDivisor;
    if (d < 0) {
        n = -n;
        d = -d;
    }
    return [n, d];
}

function toTex([n, d]) {
    if (d === 1) {
        return n.toString();
    }
    return `\frac{${n}}{${d}}`;
}