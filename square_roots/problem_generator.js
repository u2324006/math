let sumDiffProblemsGeneratedCount = 0;

function genProblem(mode, difficulty) {
    let problem;
    let selectedType;

    const totalSumDiffRequired = SUM_DIFF_DISTRIBUTION[2] + SUM_DIFF_DISTRIBUTION[3] + SUM_DIFF_DISTRIBUTION[4];

    if (sumDiffProblemsGeneratedCount < totalSumDiffRequired) {
        // Prioritize sum_diff problems until the required distribution is met
        selectedType = 'sum_diff';
        sumDiffProblemsGeneratedCount++; // Increment the overall sum_diff counter
    } else {
        // Once sum_diff distribution is met, randomly select from other types
        const otherProblemTypes = ['product', 'quotient'];
        selectedType = randChoice(otherProblemTypes);
    }

    switch (selectedType) {
        case 'sum_diff':
            let numTermsToGenerate;
            // Cycle through the distribution for sum_diff terms
            if (sumDiff2TermCount < SUM_DIFF_DISTRIBUTION[2]) {
                numTermsToGenerate = 2;
                sumDiff2TermCount++;
            } else if (sumDiff3TermCount < SUM_DIFF_DISTRIBUTION[3]) {
                numTermsToGenerate = 3;
                sumDiff3TermCount++;
            } else if (sumDiff4TermCount < SUM_DIFF_DISTRIBUTION[4]) {
                numTermsToGenerate = 4;
                sumDiff4TermCount++;
            } else {
                // This case should ideally not be reached if totalSumDiffRequired logic is correct,
                // but as a fallback, reset and recurse or pick a default.
                // For now, let's assume the outer logic handles it.
                // If it does get here, it means we've generated more sum_diff than expected,
                // or the counts were not reset properly.
                sumDiff2TermCount = 0;
                sumDiff3TermCount = 0;
                sumDiff4TermCount = 0;
                // Recurse to pick a term count from the beginning of the distribution
                // This recursion might lead to infinite loop if totalSumDiffRequired is not handled correctly
                // Let's simplify this part for now, assuming the outer if-else handles the selection.
                numTermsToGenerate = 2; // Fallback
            }
            problem = generateSumDiffProblem(difficulty, numTermsToGenerate);
            break;
        case 'product':
            problem = generateProductProblem(difficulty);
            break;
        case 'quotient':
            problem = generateQuotientProblem(difficulty);
            break;
        default:
            // This should not be reached with the current logic
            problem = generateSumDiffProblem(difficulty, 2); // Fallback
    }

    return problem;
}

// Global counters for sum_diff problem terms distribution
let sumDiff2TermCount = 0;
let sumDiff3TermCount = 0;
let sumDiff4TermCount = 0;

const SUM_DIFF_DISTRIBUTION = {
    2: 1, // 1 problem with 2 terms
    3: 2, // 2 problems with 3 terms
    4: 1  // 1 problem with 4 terms
};

// Helper functions from math_utils.js (assuming it's loaded before this script)
// function gcd(a, b) { ... }
// function simplify(num, den) { ... }
// function randInt(min, max) { ... }
// function randChoice(arr) { ... }

// --- Square Root Specific Helpers --- 

// Simplifies sqrt(n) to a*sqrt(b) where b has no square factors
function simplifySqrt(n) {
    if (n < 0) throw new Error("Cannot simplify square root of negative number.");
    if (n === 0) return [0, 0]; // 0*sqrt(0) or 0*sqrt(any)

    let coefficient = 1;
    let radicand = n;

    for (let i = 2; i * i <= radicand; i++) {
        while (radicand % (i * i) === 0) {
            coefficient *= i;
            radicand /= (i * i);
        }
    }
    return [coefficient, radicand];
}

// Formats a*sqrt(b) into LaTeX
function formatSqrt(coefficient, radicand) {
    if (coefficient === 0) return "0";
    if (radicand === 0) return "0"; // Should not happen if simplifySqrt is used correctly
    if (radicand === 1) return String(coefficient); // If radicand is 1, just return the coefficient

    // Handle coefficient of 1 or -1
    if (Math.abs(coefficient) === 1) {
        if (coefficient === 1) {
            return `\\sqrt{${radicand}}`;
        } else { // coefficient === -1
            return `-\\sqrt{${radicand}}`;
        }
    }
    // For other coefficients
    return `${coefficient}\\sqrt{${radicand}}`;
}

// Generates a random square root term (a*sqrt(b)) where b is the original radicand
function generateSqrtTerm(difficulty) {
    const max_coeff = { easy: 3, normal: 5, hard: 7 }[difficulty] || 5;
    const max_radicand = { easy: 25, normal: 50, hard: 100 }[difficulty] || 50;

    const coeff = randInt(1, max_coeff) * (Math.random() < 0.5 ? 1 : -1); // Can be negative
    const radicand = randInt(1, max_radicand); // Original radicand, can be perfect square

    return [coeff, radicand]; // Returns [a, b] for a*sqrt(b)
}

// --- Problem Generators for each type --- 

function generateSumDiffProblem(difficulty, numTerms = 2) {
    let terms = [];
    let problemTexParts = [];

    for (let i = 0; i < numTerms; i++) {
        const [coeff, radicand] = generateSqrtTerm(difficulty);
        terms.push({ coeff, radicand });
        problemTexParts.push(formatSqrt(coeff, radicand));
    }

    // For now, just join the terms with ' + '
    const problemTex = problemTexParts.join(' + ');
    const answerTex = problemTex; // Placeholder for now

    return { tex: `$${problemTex}$`, ansTex: `$${answerTex}$` };
}

function generateProductProblem(difficulty) {
    let problemData;
    let isValidAnswer = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 1000;

    do {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            console.warn("Max attempts reached for generating a valid product problem. Returning potentially invalid problem.");
            break;
        }

        const [c1_orig, r1_orig] = generateSqrtTerm(difficulty);
        const [c2_orig, r2_orig] = generateSqrtTerm(difficulty);

        const problemTex = String.raw`(${formatSqrt(c1_orig, r1_orig)}) \times (${formatSqrt(c2_orig, r2_orig)})`;

        // Calculate the product
        const product_coeff_raw = c1_orig * c2_orig;
        const product_radicand_raw = r1_orig * r2_orig;

        // Simplify the product
        const [ans_coeff_simplified, ans_radicand_simplified] = simplifySqrt(product_radicand_raw);

        const final_ans_coeff = product_coeff_raw * ans_coeff_simplified;
        const final_ans_radicand = ans_radicand_simplified;

        const answerTex = formatSqrt(final_ans_coeff, final_ans_radicand);

        // Check if answer components are within limits
        if (Math.abs(final_ans_coeff) <= 30 && Math.abs(final_ans_radicand) <= 30) {
            isValidAnswer = true;
        }
        problemData = { tex: `$${problemTex}$`, ansTex: `$${answerTex}$` };

    } while (!isValidAnswer);

    return problemData;
}

function generateQuotientProblem(difficulty) {
    let problemData;
    let isValidProblem = false;
    let attempts = 0;
    const MAX_ATTEMPTS = 1000;

    do {
        attempts++;
        if (attempts > MAX_ATTEMPTS) {
            console.warn("Max attempts reached for generating a valid quotient problem. Returning potentially invalid problem.");
            break;
        }

        // 1. Generate the answer first (integer coefficient)
        const max_ans_coeff = { easy: 5, normal: 10, hard: 15 }[difficulty] || 10;
        const max_ans_radicand = { easy: 10, normal: 20, hard: 30 }[difficulty] || 20;

        let ans_coeff = randInt(1, max_ans_coeff) * (Math.random() < 0.5 ? 1 : -1);
        let ans_radicand;
        do {
            ans_radicand = randInt(1, max_ans_radicand);
        } while (simplifySqrt(ans_radicand)[1] !== ans_radicand && ans_radicand !== 1); // Ensure ans_radicand is square-free or 1

        // 2. Generate the divisor (second term)
        let c2_orig, r2_orig; 
        do {
            [c2_orig, r2_orig] = generateSqrtTerm(difficulty);
        } while (c2_orig === 0 || r2_orig === 0 || simplifySqrt(r2_orig)[1] === 1); // Ensure divisor is not zero or too simple (e.g., sqrt(1))

        // 3. Calculate the dividend (first term) = Answer * Divisor
        // (ans_coeff * sqrt(ans_radicand)) * (c2_orig * sqrt(r2_orig))
        const c1_orig_raw = ans_coeff * c2_orig;
        const r1_orig_raw = ans_radicand * r2_orig;

        // Simplify the dividend's radicand to get its display form
        const [s_c1_orig, s_r1_orig] = simplifySqrt(r1_orig_raw);
        let c1_orig = c1_orig_raw * s_c1_orig; 
        let r1_orig = s_r1_orig; 

        // Check if generated problem terms are within reasonable limits for display
        if (Math.abs(c1_orig) > 50 || Math.abs(r1_orig) > 100 || Math.abs(c2_orig) > 50 || Math.abs(r2_orig) > 100) {
            isValidProblem = false;
            continue; // Regenerate if terms are too large
        }

        let term1Formatted = formatSqrt(c1_orig, r1_orig);
        let term2Formatted = formatSqrt(c2_orig, r2_orig);

        if (term2Formatted.startsWith('-')) {
            term2Formatted = `(${term2Formatted})`; // Wrap in parentheses if negative
        }

        const problemTex = String.raw`${term1Formatted} \div ${term2Formatted}`; // Using \div as requested

        // The answer is already generated as ans_coeff * sqrt(ans_radicand)
        const answerTex = formatSqrt(ans_coeff, ans_radicand);

        // Final validation for answer components (should always pass with this method)
        if (Math.abs(ans_coeff) <= 30 && Math.abs(ans_radicand) <= 30) {
            isValidProblem = true;
        }
        problemData = { tex: `$${problemTex}$`, ansTex: `$${answerTex}$` };

    } while (!isValidProblem);

    return problemData;
}