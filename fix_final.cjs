const fs = require('fs');

let home = fs.readFileSync('src/pages/Home.tsx', 'utf8');

const badStr = `   return (
    <div className="min-h-[100vh] bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">
      
   return (
     <div className="min-h-[100vh] bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">`;

const goodStr = `   return (
    <div className="min-h-[100vh] bg-[#FDFDFD] font-sans flex flex-col selection:bg-purple-100 selection:text-purple-950">`;

home = home.replace(badStr, goodStr);
fs.writeFileSync('src/pages/Home.tsx', home);
console.log("Fixed double return!");
