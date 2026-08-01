const fs = require('fs');
let code = fs.readFileSync('src/pages/Explore.tsx', 'utf8');

const badStr = `  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
  return (
    <div className="min-h-[100vh] font-sans flex flex-col bg-slate-50">`;

const goodStr = `  return (
    <div className="min-h-[100vh] font-sans flex flex-col bg-slate-50">`;

code = code.replace(badStr, goodStr);
fs.writeFileSync('src/pages/Explore.tsx', code);
