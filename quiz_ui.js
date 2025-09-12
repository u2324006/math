document.addEventListener('DOMContentLoaded', () => {
    if (typeof problemCounts !== 'undefined') {
        problemCounts.simpleRationalization = 0;
        problemCounts.polynomialRationalization = 0;
        problemCounts.polynomialRationalizationNegativeNumerator = 0;
    }

    // Check if genProblem function is available
    if (typeof genProblem !== 'function') {
        console.error('Error: genProblem() function not found. Make sure a problem generator script is loaded before quiz_ui.js.');
        const grid = document.getElementById('problem-grid');
        if(grid) grid.innerHTML = '<p style="color: red;">エラー: 問題を生成できませんでした。スクリプトの読み込み順序を確認してください。</p>';
        return;
    }

    const problemGrid = document.getElementById('problem-grid');
    const toggleBtn = document.getElementById('toggle-answers-button');
    const printBtn = document.getElementById('print-button');
    
    if (!problemGrid || !toggleBtn || !printBtn) {
        console.error('Required UI elements not found on the page.');
        return;
    }

    let showingAnswers = false;
    const generatedProblems = [];
    const problemSet = new Set(); // To store unique problem strings (tex + ansTex)

    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode') || 'both';
    const difficulty = urlParams.get('difficulty') || 'normal';
    const type = urlParams.get('type');

    const problemCount = 10; // 2x5 grid

    // Generate and display problems
    for (let i = 0; i < problemCount; i++) {
        let problem;
        let problemString;
        let attempts = 0;
        const maxAttempts = 100; // Safeguard against infinite loops

        do {
            if (mode === 'frac_eq' && typeof genFractionalEquationProblem === 'function') {
                problem = genFractionalEquationProblem(mode, difficulty); // Call the specific function
            } 
            else {
                problem = genProblem(mode, difficulty, i, type); // Original call with type
            }
            problemString = problem.tex; // Use only the problem text for uniqueness check
            attempts++;
            if (attempts > maxAttempts) {
                console.warn('Could not generate unique problem after ' + maxAttempts + ' attempts. Adding a duplicate.');
                break; // Exit loop to avoid infinite loop
            }
        } while (problemSet.has(problemString));

        generatedProblems.push(problem);
        problemSet.add(problemString);
        
        const card = document.createElement('div');
        card.className = 'problem-card';

        const numberEl = document.createElement('span');
        numberEl.className = 'problem-number';
        numberEl.textContent = `(${i + 1})`;

        const equationEl = document.createElement('div');
        equationEl.className = 'equation-content';
        console.log('Problem tex string (before katex.renderToString):', problem.tex); // Changed console.log
        equationEl.innerHTML = katex.renderToString(problem.tex, {throwOnError: false}); // Changed to use katex.renderToString

        card.appendChild(numberEl);
        card.appendChild(equationEl);
        problemGrid.appendChild(card);

        // Removed renderMathInElement call on equationEl
    }

    const render = () => {
        // Check if renderMathInElement is available
        if (typeof renderMathInElement === 'function') {
            console.log('renderMathInElement called with:', problemGrid);
            renderMathInElement(problemGrid, {
                delimiters: [
                    {left: "$", right: "$", display: true},
                    {left: "$", right: "$", display: false},
                    {left: "\\(", right: "\\)", display: false},
                    {left: "\\[", right: "\\]", display: true}
                ],
                strict: false
            });
        } else {
            console.error('KaTeX rendering function (renderMathInElement) not found.');
        }
    }

    // Initial render
    render();

    // --- Event Listeners ---

    // Toggle between problems and answers
    toggleBtn.addEventListener('click', () => {
        showingAnswers = !showingAnswers;
        toggleBtn.textContent = showingAnswers ? '問題' : '解答';
        const cards = document.querySelectorAll('.problem-card');
        
        cards.forEach((card, index) => {
            const equationEl = card.querySelector('.equation-content');
            if (equationEl) {
                if (showingAnswers) {
                    console.log('ansTex for problem', index + 1, ':', generatedProblems[index].ansTex);
                    console.log('Answer tex string (before katex.renderToString):', generatedProblems[index].ansTex); // Changed console.log
                    equationEl.innerHTML = katex.renderToString(generatedProblems[index].ansTex, {throwOnError: false}); // Changed to use katex.renderToString
                    renderMathInElement(equationEl, {
                        delimiters: [
                            {left: "$", right: "$", display: true},
                            {left: "$", right: "$", display: false},
                            {left: "\\(", right: "\\)", display: false},
                            {left: "\\[", right: "\\]", display: true}
                        ],
                        strict: false
                    });
                } else {
                    console.log('tex for problem', index + 1, ':', generatedProblems[index].tex);
                    console.log('Problem tex string (before katex.renderToString):', generatedProblems[index].tex); // Changed console.log
                    equationEl.innerHTML = katex.renderToString(generatedProblems[index].tex, {throwOnError: false}); // Changed to use katex.renderToString
                    renderMathInElement(equationEl, {
                        delimiters: [
                            {left: "$", right: "$", display: true},
                            {left: "$", right: "$", display: false},
                            {left: "\\(", right: "\\)", display: false},
                            {left: "\\[", right: "\\]", display: true}
                        ],
                        strict: false
                    });
                }
            }
        });
    });

    // Print functionality
    printBtn.addEventListener('click', () => {
        window.print();
    });
});