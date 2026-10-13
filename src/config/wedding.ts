export type StoryEvent = {
  year: string;
  title: string;
  description: string;
};

export type ScheduleEvent = {
  time: string;
  title: string;
  description?: string;
};

export const weddingConfig = {
  couple: {
    firstName: "Maysa",
    secondName: "Bruno",
    initials: "M & B",
  },
  event: {
    isoDate: "2027-12-17T16:00:00-03:00",
    displayDate: "17 . 12 . 2027",
    city: "São Paulo",
    timezone: "America/Sao_Paulo",
  },
  hero: {
    eyebrow: "O nosso grande dia",
    message: "Estamos contando os dias para celebrar esse momento com vocês.",
    image: "/images/hero-placeholder.svg",
  },
  story: [
    {
      year: "2019",
      title: "Nos conhecemos",
      description: "Uma conversa despretensiosa virou o começo da nossa história favorita.",
    },
    {
      year: "2023",
      title: "Nossa grande viagem",
      description: "Descobrimos novos lugares e a certeza de que queríamos continuar lado a lado.",
    },
    {
      year: "2026",
      title: "O pedido",
      description: "Um sim cheio de emoção, planos e gente querida torcendo por nós.",
    },
    {
      year: "2027",
      title: "O casamento",
      description: "O capítulo que queremos escrever cercados pelas pessoas que fazem parte de nós.",
    },
  ] satisfies StoryEvent[],
  venue: {
    name: "Local a definir",
    time: "16:00",
    address: "",
    description: "Em breve compartilharemos os detalhes do local.",
  },
  schedule: [
    { time: "15:30", title: "Chegada dos convidados" },
    { time: "16:00", title: "Cerimônia" },
    { time: "17:30", title: "Coquetel" },
    { time: "18:30", title: "Jantar" },
    { time: "20:00", title: "Festa", description: "Agora é só aproveitar." },
  ] satisfies ScheduleEvent[],
} as const;
