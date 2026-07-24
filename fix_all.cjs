const fs = require('fs');
let i18n = fs.readFileSync('src/i18n.ts', 'utf8');

// I will just replace the specific sections based on their location.
// Find the index of "en: {", "pt: {", "es: {", "fr: {"
const idxEn = i18n.indexOf('en: {');
const idxPt = i18n.indexOf('pt: {');
const idxEs = i18n.indexOf('es: {');
const idxFr = i18n.indexOf('fr: {');

const replaceBetween = (str, startIdx, endIdx, regex, replacement) => {
  const part = str.substring(startIdx, endIdx);
  const newPart = part.replace(regex, replacement);
  return str.substring(0, startIdx) + newPart + str.substring(endIdx);
};

// Cancellations Replacement
const cancellationsPtRegex = /"cancellations":\s*\{\s*"title":[\s\S]*?"a4_li2":\s*"[^"]*"\s*\}/;

const cancellationsEn = `"cancellations": {
            "title": "Cancellations and Refunds Policy",
            "intro": "At Glamzo we believe in a balance that allows the Customer not to lose money due to extreme fair eventualities, while protecting the Partner from the daily loss of valuable schedule time and the financial loss of preparations.",
            "q1": "1. Base Rules Stipulated by Partners",
            "a1": "Glamzo is the processing channel, the logistical financial agent, however it does not create or impose fixed refund time windows in a totalitarian way. The User, when making an appointment, strictly submits to the policy that the Salon has publicly configured. For example: A partner dictates that the reservation is refundable for free if there are more than 24 hours before the appointment starts; Cancellations under this rule normally do not confer protection or guarantee a refund for the time spent on the chair by the professional.",
            "q2": "2. How to Request Valid Cancellations?",
            "a2_1": "You can freely cancel or reschedule your appointments made before the time limit agreed upon by the partner. To do this, simply go to the",
            "a2_2": "My Appointments",
            "a2_3": "tab and click 'Cancel' or 'Reschedule' depending on permissibility. The automatic processing to the refund API will send the money back to your account within 5 to 10 business days if verified.",
            "q3": "3. 'No-Shows' or Unjustified Absences",
            "a3": "If you pay for your reservation online in full and simply choose not to appear in person at the facilities at the exact agreed time, without interacting in advance with the profile's cancellation system; the partner and store retain the entire deposit amount in the form of a 'No-Show' to compensate for the irrecoverable time window allocated at that time instead of accepting other customers.",
            "q4": "4. Right to Complain and Exceptional Cases",
            "a4_1": "Both parties are protected. If the professional cancels out of nowhere when you arrived at the store, or if you had an emergency (ex: Health) and the partner refused a refund despite the evidence, Glamzo intervenes:",
            "a4_li1": "Contact us via the Help Center with proof.",
            "a4_li2": "The Team will try to reverse frozen refunds on Stripe upon valid proof under exceptional circumstances, without a guaranteed promise of return if the proof dictates on the side of the Partner's Terms contract."
          }`;

const cancellationsEs = `"cancellations": {
            "title": "Política de Cancelaciones y Reembolsos",
            "intro": "En Glamzo creemos en un equilibrio que permita al Cliente no perder dinero por eventualidades extremas justas, protegiendo al Socio de la pérdida diaria de tiempo valioso y la pérdida financiera de los preparativos.",
            "q1": "1. Reglas Base Estipuladas por los Socios",
            "a1": "Glamzo es el canal procesador, el agente financiero logístico, sin embargo no crea ni impone ventanas temporales de reembolso de manera totalitaria. El Usuario, al hacer una cita, se somete estrictamente a la política configurada públicamente por el Salón. Por ejemplo: Un socio dicta que la reserva es reembolsable gratis si faltan más de 24 horas para la cita; Cancelaciones bajo esta regla normalmente no confieren protección ni obligan a un reembolso garantizado.",
            "q2": "2. ¿Cómo Solicitar Cancelaciones Válidas?",
            "a2_1": "Puede cancelar o reprogramar libremente sus citas realizadas antes del límite de tiempo acordado por el socio. Para ello, vaya a la pestaña de",
            "a2_2": "Mis Citas",
            "a2_3": "y haga clic en 'Cancelar' o 'Reprogramar' según la permisibilidad. El procesamiento automático a la API de devolución enviará el dinero de vuelta a su cuenta entre 5 y 10 días hábiles si es verificable.",
            "q3": "3. 'No-Shows' o Ausencias Injustificadas",
            "a3": "Si paga su reserva online en su totalidad y simplemente opta por no presentarse en las instalaciones a la hora exacta acordada, sin interactuar con antelación con el sistema de cancelaciones; el socio y la tienda retienen el monto total del depósito como 'No-Show' para hacer frente a la pérdida irrecuperable de tiempo asignado en lugar de aceptar a otros clientes.",
            "q4": "4. Derecho a Reclamar y Casos Excepcionales",
            "a4_1": "Ambas partes están protegidas. Si el profesional cancela de la nada al llegar a la tienda, o si tuvo una emergencia (ej: Salud) y el socio negó el reembolso a pesar de la evidencia, Glamzo interviene:",
            "a4_li1": "Contáctenos a través del Centro de Ayuda con pruebas.",
            "a4_li2": "El Equipo intentará revertir los reembolsos congelados en Stripe mediante pruebas válidas bajo circunstancias excepcionales, sin garantía si la prueba falla."
          }`;
          
const cancellationsFr = `"cancellations": {
            "title": "Politique d'Annulation et de Remboursement",
            "intro": "Chez Glamzo, nous croyons en un équilibre permettant au Client de ne pas perdre d'argent pour des éventualités extrêmes justes, tout en protégeant le Partenaire de la perte quotidienne de temps précieux et de la perte financière des préparatifs.",
            "q1": "1. Règles de Base Stipulées par les Partenaires",
            "a1": "Glamzo est le canal de traitement, l'agent financier logistique, cependant, il ne crée ni n'impose de fenêtres temporelles de remboursement fixes de manière totalitaire. L'Utilisateur, lors d'une réservation, se soumet strictement à la politique publiquement configurée par le Salon. Par exemple: Un partenaire indique que la réservation est remboursable gratuitement s'il reste plus de 24 heures; Les annulations en dessous de cette règle n'accordent généralement pas de protection ni de garantie de remboursement.",
            "q2": "2. Comment Demander des Annulations Valides?",
            "a2_1": "Vous pouvez librement annuler ou reporter vos rendez-vous pris avant la limite de temps convenue par le partenaire. Pour cela, allez dans l'onglet",
            "a2_2": "Mes Rendez-vous",
            "a2_3": "et cliquez sur 'Annuler' ou 'Reporter' selon la permissibilité. Le traitement automatique vers l'API de remboursement renverra l'argent sur votre compte dans les 5 à 10 jours ouvrables si vérifié.",
            "q3": "3. 'No-Shows' ou Absences Injustifiées",
            "a3": "Si vous payez votre réservation en ligne en totalité et choisissez simplement de ne pas vous présenter aux installations à l'heure exacte convenue; le partenaire et le magasin conservent le montant total de l'acompte sous forme de 'No-Show' pour compenser la fenêtre temporelle irrécupérable allouée au lieu d'accepter d'autres clients.",
            "q4": "4. Droit de Réclamation et Cas Exceptionnels",
            "a4_1": "Les deux parties sont protégées. Si le professionnel annule à votre arrivée au magasin, ou si vous avez eu une urgence (ex: Santé) et que le partenaire a refusé un remboursement malgré les preuves, Glamzo intervient:",
            "a4_li1": "Contactez-nous via le Centre d'Aide avec des preuves.",
            "a4_li2": "L'Equipe tentera d'annuler les remboursements bloqués sur Stripe avec des preuves valides dans des cas exceptionnels, sans garantie en cas d'échec."
          }`;

const offsets = [idxEn, idxEs, idxFr, idxPt, i18n.length].sort((a,b) => a-b).filter(a => a !== -1);

const updateSection = (str, lang, block) => {
  const start = str.indexOf(lang + ': {');
  const end = offsets[offsets.indexOf(start) + 1] || str.length;
  return replaceBetween(str, start, end, cancellationsPtRegex, block);
};

i18n = updateSection(i18n, 'en', cancellationsEn);
i18n = updateSection(i18n, 'es', cancellationsEs);
i18n = updateSection(i18n, 'fr', cancellationsFr);

fs.writeFileSync('src/i18n.ts', i18n);

