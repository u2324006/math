// メインの問題生成関数。URLのtypeパラメータに応じて処理を振り分ける
function genProblem(mode, difficulty, index, type) {
    type = type || 'basic'; // デフォルトは「基本問題」

    if (type === 'system') {
        return genSystemOfQuadraticInequalities();
    }
    if (type === 'advanced') {
        return genAdvancedQuadraticInequality();
    }
    // 基本問題
    return genQuadraticInequality();
}

// --- 応用問題 (解が特殊なケース) ---
function genAdvancedQuadraticInequality() {
    // Decide which case to generate: D=0 or D<0
    const discriminant_case = randChoice(['zero', 'negative']);

    let A, B, C;
    let root = null; // for D=0 case

    if (discriminant_case === 'zero') {
        // Generate a quadratic with D=0
        // A(x - r)^2 = Ax^2 - 2Arx + Ar^2
        const a_int = randInt(1, 4) * randChoice([-1, 1]);
        const r = randomRational('int', 5); // Integer root for simplicity

        A = a_int;
        // B = -2 * A * r
        const B_rat = mul([-2 * A, 1], r);
        // C = A * r^2
        const C_rat = mul([A, 1], mul(r, r));

        // Denominator should be 1 for integer roots, but just in case
        const lcm_den = B_rat[1] * C_rat[1] / gcd(B_rat[1], C_rat[1]);
        B = B_rat[0] * (lcm_den / B_rat[1]);
        C = C_rat[0] * (lcm_den / C_rat[1]);
        root = r;

    } else { // 'negative'
        // Generate a quadratic with D<0
        // A(x - r)^2 + k, where sign(k) == sign(A)
        const a_int = randInt(1, 4) * randChoice([-1, 1]);
        const r = randomRational('int', 5);
        const k_int = randInt(1, 10); // a positive constant to add

        A = a_int;
        // B = -2 * A * r
        const B_rat = mul([-2 * A, 1], r);
        // C = A * r^2 + k
        const C_rat = add(mul([A, 1], mul(r, r)), [a_int > 0 ? k_int : -k_int, 1]);

        const lcm_den = B_rat[1] * C_rat[1] / gcd(B_rat[1], C_rat[1]);
        B = B_rat[0] * (lcm_den / B_rat[1]);
        C = C_rat[0] * (lcm_den / C_rat[1]);
    }

    // Generate inequality symbol
    const isEqualIncluded = randChoice([true, false]);
    const inequality_symbol = randChoice(isEqualIncluded ? ['\\geq', '\\leq'] : ['>', '<']);

    // Format problem TeX
    let problemTex = (A === 1 ? '' : (A === -1 ? '-' : A)) + 'x^2';
    if (B !== 0) {
        const B_abs = Math.abs(B);
        problemTex += (B > 0 ? ' + ' : ' - ') + (B_abs === 1 ? '' : B_abs) + 'x';
    }
    if (C !== 0) {
        problemTex += (C > 0 ? ' + ' : ' - ') + Math.abs(C);
    }
    problemTex += ` ${inequality_symbol} 0`;

    // Determine solution
    let ansTex = '';
    const parabolaOpensUp = A > 0;

    if (discriminant_case === 'zero') {
        if (parabolaOpensUp) {
            if (inequality_symbol === '\\geq') {
                ansTex = 'すべての実数';
            } else if (inequality_symbol === '>') {
                ansTex = `x \\neq ${toTex(root)}`;
            } else if (inequality_symbol === '\\leq') {
                ansTex = `x = ${toTex(root)}`;
            } else { // '<'
                ansTex = '解なし';
            }
        } else { // parabola opens down
            if (inequality_symbol === '\\geq') {
                ansTex = `x = ${toTex(root)}`;
            } else if (inequality_symbol === '>') {
                ansTex = '解なし';
            } else if (inequality_symbol === '\\leq') {
                ansTex = 'すべての実数';
            } else { // '<'
                ansTex = `x \\neq ${toTex(root)}`;
            }
        }
    } else { // 'negative'
        if (parabolaOpensUp) {
            if (inequality_symbol === '>' || inequality_symbol === '\\geq') {
                ansTex = 'すべての実数';
            } else {
                ansTex = '解なし';
            }
        } else { // parabola opens down
            if (inequality_symbol === '>' || inequality_symbol === '\\geq') {
                ansTex = '解なし';
            } else {
                ansTex = 'すべての実数';
            }
        }
    }

    return { tex: problemTex, ansTex: ansTex };
}


// --- 新しい問題生成ロジック (分数解対応) ---

function genQuadraticInequality() {
    const result = generateInequalityAndStructuredSolution();
    const ansTex = formatSolutionToTex(result.solution);
    return { tex: result.tex, ansTex: ansTex };
}

function generateInequalityAndStructuredSolution() {
    // 1. 解(根)を生成 (整数または分数)
    let x1 = randomRational('both', 2);
    let x2 = randomRational('both', 2);

    // 稀に同じ解が生成されるのを防ぐ
    if (x1[0] === x2[0] && x1[1] === x2[1]) {
        x2 = add(x2, [1, 1]);
    }

    // x1 <= x2 になるようにソート
    if (x1[0] * x2[1] > x2[0] * x1[1]) {
        [x1, x2] = [x2, x1];
    }

    // 2. 不等式の形を決定
    let a_int = 0;
    while(a_int === 0) a_int = randInt(-4, 4);
    const a = [a_int, 1];

    // 3. 係数を計算
    const b_rat = mul(mul(a, [-1, 1]), add(x1, x2));
    const c_rat = mul(a, mul(x1, x2));

    // 4. 係数の分母を払う
    const lcm_den = b_rat[1] * c_rat[1] / gcd(b_rat[1], c_rat[1]);
    const A = a[0] * lcm_den;
    const B = b_rat[0] * (lcm_den / b_rat[1]);
    const C = c_rat[0] * (lcm_den / c_rat[1]);

    // 5. 不等号と問題TeXを生成
    const isGt = randChoice([true, false]);
    const isEqualIncluded = randChoice([true, false]);
    let inequality_symbol;
    if (isGt) {
        inequality_symbol = isEqualIncluded ? '\\geq' : '>';
    } else {
        inequality_symbol = isEqualIncluded ? '\\leq' : '<';
    }

    let problemTex = (A === 1 ? '' : (A === -1 ? '-' : A)) + 'x^2';
    if (B !== 0) problemTex += (B > 0 ? ' + ' : ' - ') + (Math.abs(B) === 1 ? '' : Math.abs(B)) + 'x';
    if (C !== 0) problemTex += (C > 0 ? ' + ' : ' - ') + Math.abs(C);
    problemTex += ` ${inequality_symbol} 0`;

    // 6. 解の構造を決定
    const parabolaOpensUp = A > 0;
    const effective_gt_solution = parabolaOpensUp ? isGt : !isGt;
    const solutionType = effective_gt_solution ? 'outside' : 'inside';

    const solution = {
        type: solutionType,
        bounds: [x1, x2],
        inclusive: isEqualIncluded
    };

    return { tex: problemTex, solution: solution };
}

// --- 連立不等式 (分数対応) ---
function genSystemOfQuadraticInequalities() {
    const problem1 = generateInequalityAndStructuredSolution();
    const problem2 = generateIneuityAndStructuredSolution();

    const finalSolution = intersectSolutions(problem1.solution, problem2.solution);

    const problemTex = '\\begin{cases} ' + problem1.tex + ' \\ ' + problem2.tex + ' \\end{cases}';
    const ansTex = formatSolutionToTex(finalSolution);

    return { tex: problemTex, ansTex: ansTex };
}

// --- 解の処理とフォーマット --- 

function intersectSolutions(sol1, sol2) {
    const intervals1 = solutionToIntervals(sol1);
    const intervals2 = solutionToIntervals(sol2);
    let intersection = [];

    for (const int1 of intervals1) {
        for (const int2 of intervals2) {
            // 最大の開始点と最小の終了点を探す
            const start_num = int1.start[0] * int2.start[1] > int2.start[0] * int1.start[1] ? int1.start : int2.start;
            const end_num = int1.end[0] * int2.end[1] < int2.end[0] * int1.end[1] ? int1.end : int2.end;

            // start < end なら有効な区間
            if (start_num[0] * end_num[1] < end_num[0] * start_num[1]) {
                intersection.push({ start: start_num, end: end_num });
            }
        }
    }
    return intervalsToSolution(intersection, sol1.inclusive && sol2.inclusive);
}

function solutionToIntervals(sol) {
    if (sol.type === 'inside') {
        return [{ start: sol.bounds[0], end: sol.bounds[1] }];
    } else { // outside
        return [
            { start: [-1, 0], end: sol.bounds[0] }, // -Infinity を [-1, 0] で表現
            { start: sol.bounds[1], end: [1, 0] }   // +Infinity を [1, 0] で表現
        ];
    }
}

function intervalsToSolution(intervals, inclusive) {
    if (intervals.length === 0) return { type: 'none' };
    if (intervals.length === 1) {
        // 片方が無限大の場合
        if (intervals[0].start[1] === 0 || intervals[0].end[1] === 0) {
             return { type: 'outside-single', interval: intervals[0], inclusive: inclusive };
        }
        // 有限の区間
        return { type: 'inside', bounds: [intervals[0].start, intervals[0].end], inclusive: inclusive };
    }
    // 複数の区間が残った場合 (例: x < 1, x > 5)
    return { type: 'multi-interval', intervals: intervals, inclusive: inclusive }; 
}

function formatSolutionToTex(sol) {
    if (!sol || sol.type === 'none') return '解なし';

    let sign;
    if (sol.inclusive) {
        sign = '\\leq';
    } else {
        sign = '<';
    }

    if (sol.type === 'inside') {
        return `${toTex(sol.bounds[0])} ${sign} x ${sign} ${toTex(sol.bounds[1])}`;
    }
    if (sol.type === 'outside') {
        return `x ${sign} ${toTex(sol.bounds[0])}, ${toTex(sol.bounds[1])} ${sign} x`;
    }
    if (sol.type === 'outside-single') {
        if (sol.interval.start[1] === 0) { // -Infinity to end
            return `x ${sign} ${toTex(sol.interval.end)}`;
        } else { // start to +Infinity
            return `${toTex(sol.interval.start)} ${sign} x`;
        }
    }
    if (sol.type === 'multi-interval') {
        const parts = sol.intervals.map(interval => {
            const hasStart = interval.start[1] !== 0;
            const hasEnd = interval.end[1] !== 0;
            if (hasStart && hasEnd) {
                return `${toTex(interval.start)} ${sign} x ${sign} ${toTex(interval.end)}`;
            } else if (hasStart) { // end is +Infinity
                return `${toTex(interval.start)} ${sign} x`;
            } else if (hasEnd) { // start is -Infinity
                return `x ${sign} ${toTex(interval.end)}`;
            }
            return ''; // Should not happen
        }).filter(s => s); // 空の文字列を除去
        return parts.join(', ');
    }
    return 'エラー';
}