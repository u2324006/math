// 三角関数の問題データを定義
// KaTeXの\fracを正しく解釈させるため、バックスラッシュをエスケープ( \ )する
const trigProblems = [
    { angle: 0, rad: '0', sin: '0', cos: '1', tan: '0' },
    { angle: 30, rad: '\\frac{\\pi}{6}', sin: '\\frac{1}{2}', cos: '\\frac{\\sqrt{3}}{2}', tan: '\\frac{1}{\\sqrt{3}}' },
    { angle: 45, rad: '\\frac{\\pi}{4}', sin: '\\frac{\\sqrt{2}}{2}', cos: '\\frac{\\sqrt{2}}{2}', tan: '1' },
    { angle: 60, rad: '\\frac{\\pi}{3}', sin: '\\frac{\\sqrt{3}}{2}', cos: '\\frac{1}{2}', tan: '\\sqrt{3}' },
    { angle: 90, rad: '\\frac{\\pi}{2}', sin: '1', cos: '0', tan: undefined },
    { angle: 120, rad: '\\frac{2\\pi}{3}', sin: '\\frac{\\sqrt{3}}{2}', cos: '-\\frac{1}{2}', tan: '-\\sqrt{3}' },
    { angle: 135, rad: '\\frac{3\\pi}{4}', sin: '\\frac{\\sqrt{2}}{2}', cos: '-\\frac{\\sqrt{2}}{2}', tan: '-1' },
    { angle: 150, rad: '\\frac{5\\pi}{6}', sin: '\\frac{1}{2}', cos: '-\\frac{\\sqrt{3}}{2}', tan: '-\\frac{1}{\\sqrt{3}}' },
    { angle: 180, rad: '\\pi', sin: '0', cos: '-1', tan: '0' },
    { angle: 210, rad: '\\frac{7\\pi}{6}', sin: '-\\frac{1}{2}', cos: '-\\frac{\\sqrt{3}}{2}', tan: '\\frac{1}{\\sqrt{3}}' },
    { angle: 225, rad: '\\frac{5\\pi}{4}', sin: '-\\frac{\\sqrt{2}}{2}', cos: '-\\frac{\\sqrt{2}}{2}', tan: '1' },
    { angle: 240, rad: '\\frac{4\\pi}{3}', sin: '-\\frac{\\sqrt{3}}{2}', cos: '-\\frac{1}{2}', tan: '\\sqrt{3}' },
    { angle: 270, rad: '\\frac{3\\pi}{2}', sin: '-1', cos: '0', tan: undefined },
    { angle: 300, rad: '\\frac{5\\pi}{3}', sin: '-\\frac{\\sqrt{3}}{2}', cos: '\\frac{1}{2}', tan: '-\\sqrt{3}' },
    { angle: 315, rad: '\\frac{7\\pi}{4}', sin: '-\\frac{\\sqrt{2}}{2}', cos: '-\\frac{\\sqrt{2}}{2}', tan: '-1' },
    { angle: 330, rad: '\\frac{11\\pi}{6}', sin: '-\\frac{1}{2}', cos: '\\frac{\\sqrt{3}}{2}', tan: '-\\frac{1}{\\sqrt{3}}' },
    { angle: 360, rad: '2\\pi', sin: '0', cos: '1', tan: '0' }
];

function genProblem(angleMode, difficulty, i) {
    // i (index) is 0-9. First 5 are find_value, next 5 are find_angle.
    const problemType = i < 5 ? 'find_value' : 'find_angle';

    let tex, ansTex;

    if (problemType === 'find_value') {
        let trigFunc, p;
        while (true) {
            p = trigProblems[Math.floor(Math.random() * trigProblems.length)];
            const funcs = ['sin', 'cos', 'tan'];
            trigFunc = funcs[Math.floor(Math.random() * funcs.length)];
            if (p[trigFunc] !== undefined) {
                break;
            }
        }

        const angle = angleMode === 'degree' ? `${p.angle}^\\circ` : p.rad;
        tex = `\\${trigFunc}(${angle}) =`;
        ansTex = p[trigFunc];

    } else {
        const trigFunc = ['sin', 'cos', 'tan'][Math.floor(Math.random() * 3)];
        const uniqueValues = [...new Set(trigProblems.map(p => p[trigFunc]).filter(v => v !== undefined))];
        const value = uniqueValues[Math.floor(Math.random() * uniqueValues.length)];
        
        const candidates = trigProblems.filter(p => p[trigFunc] === value);

        tex = `\\${trigFunc}(\\theta) = ${value} \\quad \\theta =`;

        const allAnswers = candidates.map(c => {
            return angleMode === 'degree' ? `${c.angle}^\\circ` : c.rad;
        });
        
        ansTex = allAnswers.join(', ');
    }

    return { tex, ansTex };
}