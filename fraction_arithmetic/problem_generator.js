function genProblem() {
    const url = new URL(window.location.href);
    const mode = url.searchParams.get('mode') || 'add'; // Default to 'add'

    let f1 = randomFrac();
    let f2 = randomFrac();

    // Ensure f2 is not zero for division
    if (mode === 'divide') {
        while (f2[0] === 0) {
            f2 = randomFrac();
        }
    }

    let tex;
    let ans;

    switch (mode) {
        case 'add':
            tex = `${toTex(f1)} + ${toTex(f2)}`;
            ans = add(f1, f2);
            break;
        case 'subtract':
            tex = `${toTex(f1)} - ${toTex(f2)}`;
            ans = sub(f1, f2);
            break;
        case 'multiply':
            tex = `${toTex(f1)} \times ${toTex(f2)}`;
            ans = mul(f1, f2);
            break;
        case 'divide':
            tex = `${toTex(f1)} \div ${toTex(f2)}`;
            ans = div(f1, f2);
            break;
        default:
            tex = '';
            ans = [0, 1];
            break;
    }

    const ansTex = toTex(ans);

    return { tex, ansTex };
}