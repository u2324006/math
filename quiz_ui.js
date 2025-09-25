
document.addEventListener('DOMContentLoaded', () => {
    // Check if a problem generator function is available
    if (typeof genProblem !== 'function') {
        const grid = document.getElementById('problem-grid');
        if (grid) {
            grid.innerHTML = '<p style="color: red;">Error: genProblem() function not found. Make sure a problem generator script is loaded before quiz_ui.js.</p>';
        }
        console.error('Error: genProblem() function not found. Make sure a problem generator script is loaded before quiz_ui.js.');
        return;
    }

    const problemGrid = document.getElementById('problem-grid');
    const toggleBtn = document.getElementById('toggle-answers-button');
    const printBtn = document.getElementById('print-button');

    let showingAnswers = false;
    const generatedProblems = [];
    const problemSet = new Set();

    // Get parameters from URL
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const difficulty = urlParams.get('difficulty');
    const type = urlParams.get('type');

    const problemCount = 10;

    // Generate and display problems
    for (let i = 0; i < problemCount; i++) {
        let problem;
        let problemString;
        let attempts = 0;
        do {
            problem = genProblem(mode, difficulty, i, type);
            problemString = problem.tex + problem.ansTex;
            attempts++;
            if (attempts > 100) { // Failsafe
                console.error("Failed to generate a unique problem after 100 attempts.");
                break;
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
        katex.render(problem.tex, equationEl, { throwOnError: false, displayMode: true });

        card.appendChild(numberEl);
        card.appendChild(equationEl);
        problemGrid.appendChild(card);
    }

    // Toggle between problems and answers
    toggleBtn.addEventListener('click', () => {
        showingAnswers = !showingAnswers;
        toggleBtn.textContent = showingAnswers ? '問題' : '解答';
        const cards = document.querySelectorAll('.problem-card');
        cards.forEach((card, index) => {
            const equationEl = card.querySelector('.equation-content');
            const tex = showingAnswers ? generatedProblems[index].ansTex : generatedProblems[index].tex;
            katex.render(tex, equationEl, { throwOnError: false, displayMode: true });
        });
    });

    // Print functionality
    printBtn.addEventListener('click', () => {
        window.print();
    });
});
