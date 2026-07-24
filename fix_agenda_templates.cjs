const fs = require('fs');

const path = 'src/pages/partner/tabs/AgendaTab.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace("alert(`Operação cancelada! O teu espaço está fechado nesta data.`);", "alert(t('agenda.errClosedDate'));");
content = content.replace("alert(`Operação cancelada! Fora do horário de expediente.`);", "alert(t('agenda.errOutsideHours'));");
content = content.replace("`Agenda atualizada.`", "t('agenda.succAgendaUpdated')");
content = content.replace('"🛑 Bloqueio Ativado"', "t('agenda.succBlockActive')");
content = content.replace('"📅 Gravado"', "t('agenda.succBookingSaved')");

content = content.replace('"Erro ao abrir disputa."', "t('agenda.errOpenDispute')");
content = content.replace('"Erro ao atualizar o estado."', "t('agenda.errUpdateStatus')");
content = content.replace('"Erro ao processar pagamento"', "t('agenda.errProcessPayment')");

fs.writeFileSync(path, content);
