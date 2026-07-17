const fs = require('fs');
let content = fs.readFileSync('src/pages/partner/tabs/StaffTab.tsx', 'utf8');

const targetStr = `                 const today = new Date();
                 let startD = new Date();
                 if (metricsFilter === "day") startD.setDate(today.getDate() - 1);
                 else if (metricsFilter === "week") startD.setDate(today.getDate() - 7);
                 else if (metricsFilter === "month") startD.setMonth(today.getMonth() - 1);
                 else if (metricsFilter === "year") startD.setFullYear(today.getFullYear() - 1);
                 
                 const filteredBookings = (bookings || []).filter(b => {
                    const bDate = new Date(b.booking_date);
                    return b.staff_id === metricsStaff.id && b.booking_status === 'completed' && bDate >= startD && bDate <= today;
                 });`;

const replacement = `                 const todayStr = new Date().toISOString().split('T')[0];
                 let startDateStr = "";
                 const todayD = new Date();
                 if (metricsFilter === "day") {
                    startDateStr = todayStr;
                 } else if (metricsFilter === "week") {
                    const monday = new Date(todayD);
                    monday.setDate(monday.getDate() - (monday.getDay() === 0 ? 6 : monday.getDay() - 1));
                    startDateStr = monday.toISOString().split('T')[0];
                 } else if (metricsFilter === "month") {
                    startDateStr = new Date(todayD.getFullYear(), todayD.getMonth(), 1).toISOString().split('T')[0];
                 } else if (metricsFilter === "year") {
                    startDateStr = new Date(todayD.getFullYear(), 0, 1).toISOString().split('T')[0];
                 }
                 
                 const filteredBookings = (bookings || []).filter(b => {
                    const bDateStr = b.booking_date;
                    return String(b.staff_id) === String(metricsStaff.id) && b.booking_status === 'completed' && bDateStr >= startDateStr && bDateStr <= todayStr;
                 });`;

if (content.includes(targetStr)) {
  fs.writeFileSync('src/pages/partner/tabs/StaffTab.tsx', content.replace(targetStr, replacement));
  console.log("StaffTab.tsx patched.");
} else {
  console.log("Could not find target string in StaffTab.tsx");
}
