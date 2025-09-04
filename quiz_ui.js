// Depends on: math_utils.js and a problem_generator.js file

document.addEventListener('DOMContentLoaded', () => {
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

    const problemCount = 10; // 2x5 grid

    // Generate and display problems
    for (let i = 0; i < problemCount; i++) {
        let problem;
        let problemString;
        let attempts = 0;
        const maxAttempts = 100; // Safeguard against infinite loops

        do {
            problem = genProblem(mode, difficulty);
            problemString = JSON.stringify(problem); // Convert object to string for Set comparison
            attempts++;
            if (attempts > maxAttempts) {
                console.warn(`Could not generate unique problem after ${maxAttempts} attempts. Adding a duplicate.`);
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

        const equationEl = document.createElement('span');
        equationEl.className = 'equation-content';
        equationEl.innerHTML = problem.tex;

        card.appendChild(numberEl);
        card.appendChild(equationEl);
        problemGrid.appendChild(card);
    }

    const render = () => {
        // Check if renderMathInElement is available
        if (typeof renderMathInElement === 'function') {
            renderMathInElement(problemGrid, {
                delimiters: [
                    {left: "$$", right: "$$", display: true},
                    {left: "$", right: "$", display: false},
                ]
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
                    equationEl.innerHTML = generatedProblems[index].ansTex;
                } else {
                    equationEl.innerHTML = generatedProblems[index].tex;
                }
            }
        });
        render(); // Re-render KaTeX
    });

    // Print functionality
    printBtn.addEventListener('click', () => {
        window.print();
    });
});