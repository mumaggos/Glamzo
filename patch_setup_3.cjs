const fs = require('fs');
let code = fs.readFileSync('src/pages/partner/SetupWizard.tsx', 'utf8');

// The KYC step 4 is gone because I removed triggerStripeOnboarding and its ui? No, I only removed the function. I must remove the `{step === 4 && ( ... )}` block entirely.

// Find the start of `{step === 4 && (`
const step4Start = code.indexOf('{step === 4 && (');
if (step4Start !== -1) {
    const step5Start = code.indexOf('{step === 5 && (');
    if (step5Start !== -1) {
        // Remove step 4 block
        code = code.slice(0, step4Start) + code.slice(step5Start);
    }
}

// Now replace `{step === 5 && (` with `{step === 4 && (`
code = code.replace(/\{step === 5 && \(/, '{step === 4 && (');

// In the new `{step === 4 && (`, remove the terminal options and shipping inputs
const planBlockOld = `<div className="relative p-6 rounded-2xl border-2 border-slate-200 hover:border-slate-300 bg-white transition-colors cursor-pointer" onClick={() => setWantsTerminal(true)}>`;
const planBlockEnd = `{wantsTerminal && (`;
if (code.indexOf(planBlockOld) !== -1 && code.indexOf(planBlockEnd) !== -1) {
    const p1 = code.indexOf(planBlockOld);
    const p2 = code.indexOf(planBlockEnd);
    
    // find end of {wantsTerminal && ( ... )}
    let bracketCount = 0;
    let endIdx = -1;
    for (let i = p2; i < code.length; i++) {
        if (code[i] === '{') bracketCount++;
        if (code[i] === '}') {
            bracketCount--;
            if (bracketCount === 0) {
                endIdx = i + 1;
                break;
            }
        }
    }
    
    if (endIdx !== -1) {
        code = code.slice(0, p1) + code.slice(endIdx);
    }
}

// Remove the input for terminal (wantsTerminal radio) inside the Pro plan box
code = code.replace(/<div className="mt-1">\s*<input type="radio" checked=\{\!wantsTerminal\} onChange=\{[^}]+\} className="[^"]+" \/>\s*<\/div>/, '');

// Fix the back button and submit button for step 4
code = code.replace(/<button[^>]+onClick=\{[^>]+updateSetupStep\(4\)[^>]+>[^<]+<ArrowLeft[^>]+>[^<]+<span>Voltar<\/span>[^<]+<\/button>/, 
  `<button
                type="button"
                onClick={() => updateSetupStep(3)}
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar</span>
              </button>`);

code = code.replace(/<span>\{wantsTerminal \? 'Confirmar Pedido' : 'Começar 14 Dias Grátis'\}<\/span>/g, `<span>Começar 14 Dias Grátis</span>`);


// Now replace `{step === 6 && (` with `{step === 5 && (`
code = code.replace(/\{step === 6 && \(/, '{step === 5 && (');

// Remove the online payments step from step 5 
code = code.replace(/<div className=\{\`flex items-center justify-between p-4 rounded-xl border \$\{business\?\.charges_enabled \? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'\}\`\}>[\s\S]*?<\/div>/, '');

// Update the bottom buttons container to use step < 5 instead of step < 6
code = code.replace(/\{step < 6 && \(/g, '{step < 5 && (');

// For the bottom buttons, step 4 has its own buttons, so we hide the generic ones for step 4
code = code.replace(/\{step !== 4 && \(/g, '{step !== 4 && (');

fs.writeFileSync('src/pages/partner/SetupWizard.tsx', code);
