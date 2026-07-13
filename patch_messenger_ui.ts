import * as fs from 'fs';
let content = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf8');

if (!content.includes('hasInteracted')) {
  // Add hasInteracted state
  content = content.replace(
    /const \[isOpen, setIsOpen\] = useState\(false\);/,
    "const [isOpen, setIsOpen] = useState(false);\n  const [hasInteracted, setHasInteracted] = useState(false);\n\n  useEffect(() => {\n    const handleOpen = () => {\n      setIsOpen(true);\n      setHasInteracted(true);\n    };\n    window.addEventListener('open-glamzo-chat', handleOpen);\n    return () => window.removeEventListener('open-glamzo-chat', handleOpen);\n  }, []);"
  );
  
  // Hide bubble if !hasInteracted
  content = content.replace(
    /\{\!isOpen \? \(/,
    "{!isOpen ? (\n        hasInteracted ? ("
  );
  
  content = content.replace(
    /<MessageSquare className="w-6 h-6 group-hover:animate-pulse" \/>\n        <\/button>\n      \) : \(/,
    "<MessageSquare className=\"w-6 h-6 group-hover:animate-pulse\" />\n        </button>\n        ) : null\n      ) : ("
  );
  
  fs.writeFileSync('src/components/GlamzoMessenger.tsx', content);
  console.log("Patched GlamzoMessenger UI for custom open event");
} else {
  console.log("Already has hasInteracted");
}
