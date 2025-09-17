
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

    const problemCount = type === 'system' ? 4 : 10;

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
        equationEl.innerHTML = katex.renderToString(problem.tex, {throwOnError: false, displayMode: true});

        card.appendChild(numberEl);
        card.appendChild(equationEl);
        problemGrid.appendChild(card);
    }

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
                    equationEl.innerHTML = katex.renderToString(generatedProblems[index].ansTex, {throwOnError: false});
                } else {
                    equationEl.innerHTML = katex.renderToString(generatedProblems[index].tex, {throwOnError: false, displayMode: true});
                }
            }
        });
    });

    // Print functionality
    printBtn.addEventListener('click', () => {
        window.print();
    });
});
