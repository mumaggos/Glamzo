import fs from 'fs';

function patchOAuth(file: string) {
  let content = fs.readFileSync(file, 'utf-8');
  
  // Replace the entire handleGoogleLogin (or handleGoogleSignup) block's redirectTo
  const lines = content.split('\n');
  let newLines: string[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.includes('const redirectTo = returnTo')) {
       // skip these
       let j = i;
       while (j < lines.length && !lines[j].includes('await supabase.auth.signInWithOAuth')) {
          j++;
       }
       i = j - 1; // next loop will hit the await
    } else if (line.includes('options: {')) {
       let matchesRedirectTo = false;
       let k = i;
       while (k < lines.length && !lines[k].includes('}')) {
          if (lines[k].includes('redirectTo:')) {
             matchesRedirectTo = true;
             break;
          }
          k++;
       }
       if (matchesRedirectTo || line.includes('redirectTo:')) {
           // We will just replace it inline below.
       }
       newLines.push(line);
    } else if (line.includes('redirectTo: redirectTo') || line.includes('redirectTo: redirectTo }')) {
       newLines.push(line.replace('redirectTo: redirectTo', 'redirectTo: `${window.location.origin}${window.location.pathname}`'));
    }
    else {
       newLines.push(line);
    }
  }
  fs.writeFileSync(file, newLines.join('\n'));
}

patchOAuth('src/pages/Login.tsx');
patchOAuth('src/pages/Signup.tsx');
