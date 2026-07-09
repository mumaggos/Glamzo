const fs = require('fs');
let text = fs.readFileSync('src/components/BookingModal.tsx', 'utf8');

text = text.replace("import React, { useState, useEffect } from 'react';", "import React, { useState, useEffect, useMemo, useCallback } from 'react';");
text = text.replace('export default function BookingModal({', 'const BookingModal = React.memo(function BookingModal({');
text = text.replace('  const daysToShow = Array.from({ length: 30 }, (_, i) => {', '  const daysToShow = useMemo(() => Array.from({ length: 30 }, (_, i) => {');
text = text.replace('    const d = new Date(); d.setDate(d.getDate() + i); return d;\n  });', '    const d = new Date(); d.setDate(d.getDate() + i); return d;\n  }), []);');

const getAvailableSlotsRegex = /const getAvailableSlots = \(\) => \{([\s\S]*?)return slots;\s*\};\s*const availableSlots = getAvailableSlots\(\);/;

const getAvailableSlotsMatch = text.match(getAvailableSlotsRegex);
if (getAvailableSlotsMatch) {
  const newMemo = `const availableSlots = useMemo(() => {${getAvailableSlotsMatch[1]}return slots;\n  }, [selectedDate, selectedServices, businessHours, existingBookings, business, staff, selectedStaff, totalServicesDuration]);`;
  text = text.replace(getAvailableSlotsRegex, newMemo);
}

// close the memoized component
text = text.replace('  );\n}', '  );\n});\nexport default BookingModal;');

fs.writeFileSync('src/components/BookingModal.tsx', text);
