document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('control-form');
    if (!form) {
        console.error('Control form not found!');
        return;
    }

    const modeEl = form.querySelector('#mode');
    if (!modeEl) {
        console.error('Mode select element not found!');
        return;
    }

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const mode = modeEl.value;
        const difficulty = 'normal'; // Difficulty is hardcoded

        let targetUrl;
        
        // Decide destination based on the current page's path
        if (window.location.pathname.includes('quadratic_equations')) {
            targetUrl = `quadratic_equations_quiz.html?mode=${mode}&difficulty=${difficulty}`;
        } else if (window.location.pathname.includes('Deployment')) {
            targetUrl = `Deployment_quiz.html?mode=${mode}&difficulty=${difficulty}`;
        } else if (window.location.pathname.includes('factorization')) {
            targetUrl = `factorization_quiz.html?mode=${mode}&difficulty=${difficulty}`;
        } else if (window.location.pathname.includes('formula_calculation')) {
            targetUrl = `formula_calculation_quiz.html?mode=${mode}&difficulty=${difficulty}`;
        } else if (window.location.pathname.includes('simultaneous_equations')) {
            targetUrl = `simultaneous_equations_quiz.html?mode=${mode}&difficulty=${difficulty}`;
        } else if (window.location.pathname.includes('square_roots')) {
            targetUrl = `square_roots_quiz.html?mode=${mode}&difficulty=${difficulty}`;
        } else {
            // Default to linear
            targetUrl = `linear_quiz.html?mode=${mode}&difficulty=${difficulty}`;
        }
        
        window.location.href = targetUrl;
    });
});