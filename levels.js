/**
 * Sistema de niveles progresivos de Kegel
 *
 * Cada nivel define una serie de ejercicios. Cada ejercicio tiene:
 *   - name:   nombre visible
 *   - type:   "standard" | "pulse" | "wave" | "reverse"
 *   - hold:   segundos de contracción
 *   - rest:   segundos de descanso entre reps
 *   - reps:   repeticiones por serie
 *   - sets:   número de series
 *   - setRest: segundos de descanso entre series
 *   - cue:    instrucción corta mostrada durante la contracción
 *
 * sessionsToAdvance: sesiones completas en el nivel antes de habilitar el aviso de subir
 * null = nivel de mantenimiento (no se avanza más)
 */

const LEVELS = [
  {
    id: 1,
    name: "Nivel 1 — Base",
    weeks: "Semanas 1-2",
    goal: "Identificar los músculos y construir una base sin fatigarte.",
    color: "#667eea",
    frequency: { perDay: 3 },
    exercises: [
      {
        name: "Contracciones básicas",
        type: "standard",
        hold: 3, rest: 3, reps: 10, sets: 3, setRest: 20,
        cue: "Contrae suave"
      }
    ],
    weeksToAdvance: 2,
    sessionsToAdvance: 12,
    tips: [
      "Acuéstate boca arriba con las rodillas dobladas para aislar mejor el músculo.",
      "Respira normal. No tenses abdomen glúteos ni muslos.",
      "3 sesiones al día está bien en esta etapa."
    ]
  },
  {
    id: 2,
    name: "Nivel 2 — Progresión",
    weeks: "Semanas 3-5",
    goal: "Aumentar el tiempo bajo tensión e introducir pulsos rápidos.",
    color: "#5c6bc0",
    frequency: { perDay: 3 },
    exercises: [
      {
        name: "Contracciones sostenidas",
        type: "standard",
        hold: 5, rest: 5, reps: 8, sets: 3, setRest: 25,
        cue: "Mantén firme"
      },
      {
        name: "Pulsos rápidos",
        type: "pulse",
        hold: 1, rest: 1, reps: 15, sets: 2, setRest: 25,
        cue: "Rápido"
      }
    ],
    weeksToAdvance: 3,
    sessionsToAdvance: 15,
    tips: [
      "Puedes empezar a hacerlo sentado además de acostado.",
      "Si llegas al final de la serie sin perder fuerza vas bien.",
      "Progresa el hold de 5 a 7 a 10 seg dentro de estas semanas si lo sientes fácil."
    ]
  },
  {
    id: 3,
    name: "Nivel 3 — Fuerza",
    weeks: "Semanas 6-9",
    goal: "Máxima contracción sostenida y mayor volumen de pulsos.",
    color: "#7e57c2",
    frequency: { perDay: 2 },
    exercises: [
      {
        name: "Contracciones máximas",
        type: "standard",
        hold: 10, rest: 10, reps: 5, sets: 3, setRest: 30,
        cue: "Fuerza máxima"
      },
      {
        name: "Pulsos rápidos",
        type: "pulse",
        hold: 1, rest: 1, reps: 20, sets: 3, setRest: 25,
        cue: "Rápido"
      },
      {
        name: "Ondas (escalera)",
        type: "wave",
        hold: 8, rest: 8, reps: 5, sets: 2, setRest: 30,
        cue: "Sube la intensidad"
      }
    ],
    weeksToAdvance: 4,
    sessionsToAdvance: 18,
    tips: [
      "En las ondas sube la fuerza en 4 escalones: 25 / 50 / 75 / 100 por ciento.",
      "Ya puedes hacer la rutina de pie sentado o acostado.",
      "Descansa al menos un día a la semana."
    ]
  },
  {
    id: 4,
    name: "Nivel 4 — Mantenimiento combinado",
    weeks: "Semanas 10-12",
    goal: "Combinar todo lo aprendido en una rutina completa.",
    color: "#8e24aa",
    frequency: { perWeek: 3 },
    exercises: [
      {
        name: "Sostenidas fuertes",
        type: "standard",
        hold: 10, rest: 10, reps: 5, sets: 2, setRest: 30,
        cue: "Fuerza máxima"
      },
      {
        name: "Pulsos rápidos",
        type: "pulse",
        hold: 1, rest: 1, reps: 20, sets: 2, setRest: 25,
        cue: "Rápido"
      },
      {
        name: "Ondas",
        type: "wave",
        hold: 8, rest: 8, reps: 4, sets: 2, setRest: 30,
        cue: "Sube la intensidad"
      }
    ],
    weeksToAdvance: 3,
    sessionsToAdvance: 9,
    tips: [
      "Con 3 sesiones por semana basta para mantener en este nivel.",
      "Si quieres seguir progresando pasa al Nivel 5 avanzado.",
      "Integra contracciones en el día a día: al conducir en el escritorio etc."
    ]
  },
  {
    id: 5,
    name: "Nivel 5 — Resistencia (avanzado)",
    weeks: "Fase avanzada",
    goal: "Extender el tiempo bajo tensión y la capacidad de resistencia.",
    color: "#9c27b0",
    frequency: { perWeek: 4 },
    exercises: [
      {
        name: "Sostenidas largas",
        type: "standard",
        hold: 15, rest: 10, reps: 5, sets: 3, setRest: 35,
        cue: "Aguanta largo"
      },
      {
        name: "Pulsos de alta densidad",
        type: "pulse",
        hold: 1, rest: 1, reps: 25, sets: 3, setRest: 25,
        cue: "Rápido"
      },
      {
        name: "Relajación controlada (reverse)",
        type: "reverse",
        hold: 5, rest: 5, reps: 5, sets: 1, setRest: 0,
        cue: "Empuja suave y relaja"
      }
    ],
    weeksToAdvance: 4,
    sessionsToAdvance: 16,
    tips: [
      "El reverse kegel relaja el suelo pélvico. Es clave para equilibrar tanta contracción.",
      "No hagas reverse con fuerza. Es soltar y expandir no pujar duro.",
      "Hidrátate y no entrenes con la vejiga llena."
    ]
  },
  {
    id: 6,
    name: "Nivel 6 — Fuerza máxima",
    weeks: "Fase avanzada",
    goal: "Picos de fuerza prolongados y trabajo de ondas más exigente.",
    color: "#ab47bc",
    frequency: { perWeek: 2 },
    exercises: [
      {
        name: "Sostenidas de 20 seg",
        type: "standard",
        hold: 20, rest: 10, reps: 4, sets: 3, setRest: 40,
        cue: "Fuerza máxima sostenida"
      },
      {
        name: "Ondas profundas",
        type: "wave",
        hold: 10, rest: 10, reps: 4, sets: 2, setRest: 35,
        cue: "Sube en escalones"
      },
      {
        name: "Pulsos explosivos",
        type: "pulse",
        hold: 1, rest: 1, reps: 30, sets: 3, setRest: 25,
        cue: "Rápido y fuerte"
      },
      {
        name: "Relajación controlada (reverse)",
        type: "reverse",
        hold: 6, rest: 6, reps: 5, sets: 1, setRest: 0,
        cue: "Suelta y expande"
      }
    ],
    weeksToAdvance: 6,
    sessionsToAdvance: 12,
    tips: [
      "Si sientes tensión o molestia pélvica baja un nivel y haz más reverse kegels.",
      "La calidad de la contracción importa más que el número.",
      "2 sesiones intensas por semana es suficiente a este nivel."
    ]
  },
  {
    id: 7,
    name: "Nivel 7 — Elite / Mantenimiento avanzado",
    weeks: "Permanente",
    goal: "Protocolo completo para mantener fuerza control y resistencia de por vida.",
    color: "#c2185b",
    frequency: { perWeek: 3 },
    exercises: [
      {
        name: "Sostenidas de pico",
        type: "standard",
        hold: 20, rest: 10, reps: 3, sets: 2, setRest: 40,
        cue: "Pico de fuerza"
      },
      {
        name: "Ondas",
        type: "wave",
        hold: 10, rest: 10, reps: 3, sets: 2, setRest: 35,
        cue: "Escalones"
      },
      {
        name: "Pulsos",
        type: "pulse",
        hold: 1, rest: 1, reps: 30, sets: 2, setRest: 25,
        cue: "Rápido"
      },
      {
        name: "Relajación controlada (reverse)",
        type: "reverse",
        hold: 6, rest: 6, reps: 6, sets: 1, setRest: 0,
        cue: "Suelta y expande"
      }
    ],
    weeksToAdvance: null,
    sessionsToAdvance: null,
    tips: [
      "Este es el nivel permanente. Mantén 2 a 3 sesiones por semana.",
      "Alterna semanas de más volumen con semanas de descarga.",
      "Siempre cierra con reverse kegels para no quedar sobre-tensionado."
    ]
  }
];

// Promedio de dificultad reciente que sugiere que el nivel ya es fácil (1 fácil - 3 difícil)
const EASE_THRESHOLD = 1.6;
// Cuántas sesiones recientes mirar para evaluar la dificultad
const EASE_WINDOW = 4;

if (typeof module !== "undefined") { module.exports = { LEVELS, EASE_THRESHOLD, EASE_WINDOW }; }
