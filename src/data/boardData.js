export const boardCells = [
  { type: 'start', text: "Início" },
  { type: 'neutral', text: "Casa 1" },
  { type: 'neutral', text: "Casa 2" },
  
  // CASA 3: PERGUNTA DE SAMBA (Vai abrir o vídeo)
  { 
    type: 'question', 
    questionId: 1, // ID 1 liga ao vídeo do Samba
    text: "Casa 3",
    questionData: {
      id: 1,
      title: "Cultura Brasileira",
      text: "Qual estilo musical originado no Recôncavo Baiano é considerado patrimônio imaterial?",
      options: ["Frevo", "Samba de Roda", "Maracatu", "Baião"],
      correctAnswer: 1 // Índice da resposta certa (Samba de Roda)
    }
  },
  
  { type: 'neutral', text: "Casa 4" },
  { type: 'move-forward', steps: 2, text: "Avance 2" },
  { type: 'neutral', text: "Casa 6" },
  { type: 'question', questionId: 2, text: "Casa 7" }, // Exemplo de outra pergunta
  { type: 'move-back', steps: 1, text: "Volte 1" },
  { type: 'neutral', text: "Casa 9" },
  { type: 'attention', text: "Cuidado!" },
  { type: 'neutral', text: "Casa 11" },
  { type: 'neutral', text: "Casa 12" },
  { type: 'neutral', text: "Casa 13" },
  { type: 'neutral', text: "Casa 14" },
  { type: 'neutral', text: "Casa 15" },
  { type: 'neutral', text: "Casa 16" },
  { type: 'neutral', text: "Casa 17" },
  { type: 'neutral', text: "Casa 18" },
  { type: 'neutral', text: "Casa 19" },
  { type: 'finish', text: "Chegada" }
];