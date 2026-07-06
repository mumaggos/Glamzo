const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardCalendar.tsx', 'utf8');

const renderEventFn = `
  const renderEventContent = (eventInfo: any) => {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 0.2, type: "spring", bounce: 0.4 }}
        className="w-full h-full flex flex-col justify-start overflow-hidden px-1"
      >
        <div className="font-bold text-[10px] sm:text-xs truncate leading-tight">{eventInfo.timeText}</div>
        <div className="text-[10px] sm:text-xs truncate font-medium">{eventInfo.event.title}</div>
      </motion.div>
    );
  };
  return (
`;

code = code.replace(/return \(/, renderEventFn);
fs.writeFileSync('src/components/DashboardCalendar.tsx', code);
