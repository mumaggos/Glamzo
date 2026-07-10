import fs from 'fs';
let code = fs.readFileSync('src/components/GlamzoMessenger.tsx', 'utf-8');

const target = `<div className="flex flex-col items-center justify-center h-full text-center space-y-2 pb-4 opacity-50">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inicie a Conversa</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-700 shadow-sm max-w-[85%] font-medium leading-relaxed">
              Olá! 👋 Tem alguma dúvida sobre os nossos serviços, horários ou preços?
            </div>`;

const replacement = `<div className="flex flex-col items-center justify-center h-full text-center space-y-2 pb-4 opacity-50">
              <MessageSquare className="w-8 h-8 text-slate-300" />
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Inicie a Conversa</p>
            </div>
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-none border border-slate-200 text-xs text-slate-700 shadow-sm max-w-[85%] font-medium leading-relaxed">
              Olá! 👋 Tem alguma dúvida sobre os nossos serviços, horários ou preços?
            </div>
            {messages.map((m: any) => (
              <div key={m.id} className={\`p-3.5 rounded-2xl text-xs font-medium leading-relaxed max-w-[85%] \${m.sender === 'customer' ? 'bg-slate-900 text-white rounded-tr-none self-end' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none self-start shadow-sm'}\`}>
                {m.content}
              </div>
            ))}`;

code = code.replace(target, replacement);
fs.writeFileSync('src/components/GlamzoMessenger.tsx', code);
