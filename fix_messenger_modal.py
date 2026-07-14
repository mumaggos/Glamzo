import re

with open("src/components/GlamzoMessenger.tsx", "r") as f:
    text = f.read()

# Replace the return block
target_return = """  return (
    <div className="fixed bottom-6 right-4 sm:right-6 z-[99999] font-sans">
      {!isOpen ? (
        hasInteracted ? (
        <button 
           onClick={() => setIsOpen(true)} 
           className="w-14 h-14 bg-slate-900 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-105 hover:bg-black transition-all border-[3px] border-white group"
        >
          <MessageSquare className="w-6 h-6 group-hover:animate-pulse" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white"></span>
          </span>
        </button>
        ) : null
      ) : (
        <div className="w-[320px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col h-[420px] animate-in slide-in-from-bottom-8">"""

replacement_return = """  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999] font-sans flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] max-h-[600px] animate-in zoom-in-95 duration-200">"""

text = text.replace(target_return, replacement_return)

# Also fix the closing div since we removed the `!isOpen ? () : ()` logic
target_close = """        </div>
      )}
    </div>
  );
}"""

replacement_close = """      </div>
    </div>
  );
}"""

text = text.replace(target_close, replacement_close)

with open("src/components/GlamzoMessenger.tsx", "w") as f:
    f.write(text)
