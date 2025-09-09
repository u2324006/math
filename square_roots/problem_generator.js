let sumDiffProblemsGeneratedCount = 0;

function genProblem(mode, difficulty) {
    let problem;
    let selectedType;

    const totalSumDiffRequired = SUM_DIFF_DISTRIBUTION[2] + SUM_DIFF_DISTRIBUTION[3] + SUM_DIFF_DISTRIBUTION[4] ;

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
                sumDiff2TermCount = 0;
                sumDiff3TermCount = 0;
                sumDiff4TermCount = 0;
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

/**
 * Selects one or more random elements from an array.
 * @param {Array} arr The array to choose from.
 * @param {number} count The number of elements to choose.
 * @returns A single element if count is 1, or an array of elements otherwise.
 */
function randChoice(arr, count = 1) {
    if (arr.length === 0) return count === 1 ? undefined : [];
    if (count === 1) return arr[Math.floor(Math.random() * arr.length)];
    
    // Fisher-Yates shuffle for multiple selections
    const shuffled = arr.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, count);
}

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
    if (radicand === 0) return "0";
    if (radicand === 1) return String(coefficient);

    if (Math.abs(coefficient) === 1) {
        if (coefficient === 1) {
            return `\\sqrt{${radicand}}`;
        }
        else { // coefficient === -1
            return `-\\sqrt{${radicand}}`;
        }
    }
    return `${coefficient}\\sqrt{${radicand}}`;
}

// Generates a random square root term (a*sqrt(b)) where b is the original radicand
function generateSqrtTerm(difficulty) {
    const max_coeff = { easy: 3, normal: 5, hard: 7 }[difficulty] || 5;
    const max_radicand = { easy: 25, normal: 50, hard: 100 }[difficulty] || 50;

    const coeff = randInt(1, max_coeff) * (Math.random() < 0.5 ? 1 : -1); // Can be negative
    const radicand = randInt(1, max_radicand);

    return [coeff, radicand];
}

// --- Problem Generators for each type ---

function generateSumDiffProblem(difficulty, numTerms = 2, _attempt = 0) {
    if (_attempt > 100) { // Increased attempts for the stricter constraints
        console.warn(`Max attempts reached for generateSumDiffProblem with ${numTerms} terms.`);
        return { tex: '$1+1$', ansTex: '$2$' };
    }

    const terms = [];
    for (let i = 0; i < numTerms; i++) {
        let coeff, radicand;
        let termAttempt = 0;
        do {
            if (termAttempt++ > 50) {
                // If we can't find a suitable term, the whole problem might be unsolvable with the current constraints.
                // Restarting the whole generation process is the best bet.
                return generateSumDiffProblem(difficulty, numTerms, _attempt + 1);
            }
            [coeff, radicand] = generateSqrtTerm(difficulty);
            
            // --- Improvement: Avoid terms that directly cancel each other out ---
            // This prevents generating a term that is the exact opposite of a previously generated term.
        } while (terms.some(t => t.radicand === radicand && t.coeff === -coeff));
        
        terms.push({ coeff, radicand });
    }

    // --- Improvement: Check for terms that would pass through to the answer "as-is" ---
    const simplifiedRadicandCounts = new Map();
    for (const term of terms) {
        const simplifiedRadicand = simplifySqrt(term.radicand)[1];
        const currentCount = simplifiedRadicandCounts.get(simplifiedRadicand) || 0;
        simplifiedRadicandCounts.set(simplifiedRadicand, currentCount + 1);
    }

    const hasAsIsTerm = terms.some(term => {
        const [sc, sr] = simplifySqrt(term.radicand);
        // A term is "as-is" if its radicand is already square-free and it's the only term 
        // with that radicand, meaning it's won't be simplified or combined.
        return sc === 1 && simplifiedRadicandCounts.get(sr) === 1;
    });

    // For problems with more than one term, we want to avoid "as-is" terms to ensure simplification is needed.
    if (numTerms > 1 && hasAsIsTerm) {
        return generateSumDiffProblem(difficulty, numTerms, _attempt + 1);
    }

    // If the problem is valid, build the display string and calculate the answer.
    let problemTex = '';
    const simplifiedTerms = new Map();
    for (let i = 0; i < terms.length; i++) {
        const { coeff, radicand } = terms[i];
        
        if (i === 0) {
            problemTex += formatSqrt(coeff, radicand);
        } else {
            problemTex += (coeff < 0) ? ` - ${formatSqrt(Math.abs(coeff), radicand)}` : ` + ${formatSqrt(coeff, radicand)}`;
        }

        const [simplifiedCoeff, simplifiedRadicand] = simplifySqrt(radicand);
        const totalCoeffForTerm = coeff * simplifiedCoeff;
        const currentTotal = simplifiedTerms.get(simplifiedRadicand) || 0;
        simplifiedTerms.set(simplifiedRadicand, currentTotal + totalCoeffForTerm);
    }

    const answerTexParts = [];
    for (const [radicand, coeff] of simplifiedTerms.entries()) {
        if (coeff !== 0) {
            answerTexParts.push({ coeff, radicand });
        }
    }

    // --- Improvement: For problems with 3+ terms, the answer must have at most 2 terms ---
    if (numTerms >= 3 && answerTexParts.length > 2) {
        return generateSumDiffProblem(difficulty, numTerms, _attempt + 1);
    }
    
    answerTexParts.sort((a, b) => a.radicand - b.radicand);

    let answerTex = '';
    if (answerTexParts.length === 0) {
        answerTex = '0';
    } else {
        for (let i = 0; i < answerTexParts.length; i++) {
            const { coeff, radicand } = answerTexParts[i];
            if (i === 0) {
                answerTex += formatSqrt(coeff, radicand);
            } else {
                answerTex += (coeff < 0) ? ` - ${formatSqrt(Math.abs(coeff), radicand)}` : ` + ${formatSqrt(coeff, radicand)}`;
            }
        }
    }

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

        const problemTex = `(${formatSqrt(c1_orig, r1_orig)}) \\times (${formatSqrt(c2_orig, r2_orig)})`;

        const product_coeff_raw = c1_orig * c2_orig;
        const product_radicand_raw = r1_orig * r2_orig;

        const [ans_coeff_simplified, ans_radicand_simplified] = simplifySqrt(product_radicand_raw);

        const final_ans_coeff = product_coeff_raw * ans_coeff_simplified;
        const final_ans_radicand = ans_radicand_simplified;

        const answerTex = formatSqrt(final_ans_coeff, final_ans_radicand);

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

        const max_ans_coeff = { easy: 5, normal: 10, hard: 15 }[difficulty] || 10;
        const max_ans_radicand = { easy: 10, normal: 20, hard: 30 }[difficulty] || 20;

        let ans_coeff = randInt(1, max_ans_coeff) * (Math.random() < 0.5 ? 1 : -1);
        let ans_radicand;
        do {
            ans_radicand = randInt(1, max_ans_radicand);
        } while (simplifySqrt(ans_radicand)[1] !== ans_radicand && ans_radicand !== 1);

        let c2_orig, r2_orig; 
        do {
            [c2_orig, r2_orig] = generateSqrtTerm(difficulty);
        } while (c2_orig === 0 || r2_orig === 0 || simplifySqrt(r2_orig)[1] === 1);

        const c1_orig_raw = ans_coeff * c2_orig;
        const r1_orig_raw = ans_radicand * r2_orig;

        const [s_c1_orig, s_r1_orig] = simplifySqrt(r1_orig_raw);
        let c1_orig = c1_orig_raw * s_c1_orig; 
        let r1_orig = s_r1_orig; 

        if (Math.abs(c1_orig) > 50 || Math.abs(r1_orig) > 100 || Math.abs(c2_orig) > 50 || Math.abs(r2_orig) > 100) {
            isValidProblem = false;
            continue;
        }

        let term1Formatted = formatSqrt(c1_orig, r1_orig);
        let term2Formatted = formatSqrt(c2_orig, r2_orig);

        if (term2Formatted.startsWith('-')) {
            term2Formatted = `(${term2Formatted})`;
        }

        const problemTex = `${
            term1Formatted
        } \\div ${
            term2Formatted
        }`;

        const answerTex = formatSqrt(ans_coeff, ans_radicand);

        if (Math.abs(ans_coeff) <= 30 && Math.abs(ans_radicand) <= 30) {
            isValidProblem = true;
        }
        problemData = { tex: `$${problemTex}$`, ansTex: `$${answerTex}$` };

    } while (!isValidProblem);

    return problemData;
}