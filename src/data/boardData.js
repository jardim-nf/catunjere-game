// src/data/boardData.js

export const boardCells = [
  { id: 0, type: 'start', label: 'Início' },
  { id: 1, type: 'normal' },
  { id: 2, type: 'question', questionId: 1, questionData: {
      title: "História do Samba",
      text: "Qual destas regiões é considerada o berço do Samba de Roda?",
      options: ["Recôncavo Baiano", "Zona Sul Carioca", "Sertão Pernambucano", "Vale do Paraíba"],
      correctAnswer: 0,
      explanation: "O Samba de Roda nasceu no Recôncavo Baiano no século XVII."
    }
  },
  { id: 3, type: 'normal' },
  { id: 4, type: 'move-forward', steps: 2, label: 'Atalho' },
  { id: 5, type: 'normal' },
  { id: 6, type: 'attention', label: 'Cuidado' },
  { id: 7, type: 'normal' },
  { id: 8, type: 'question', questionId: 2, questionData: {
      title: "Culinária",
      text: "Qual é o ingrediente base do Acarajé?",
      options: ["Milho Branco", "Feijão Fradinho", "Mandioca", "Arroz"],
      correctAnswer: 1,
      explanation: "O Acarajé é feito tradicionalmente com massa de feijão fradinho."
    }
  },
  { id: 9, type: 'move-back', steps: 1, label: 'Volte 1' },
  { id: 10, type: 'normal' },
  { id: 11, type: 'normal' },
  { id: 12, type: 'question', questionId: 3, questionData: {
      title: "Capoeira",
      text: "Qual instrumento comanda a roda de capoeira?",
      options: ["Atabaque", "Pandeiro", "Berimbau", "Agogô"],
      correctAnswer: 2,
      explanation: "O Berimbau (Gunga, Médio e Viola) dita o ritmo do jogo."
    }
  },
  { id: 13, type: 'normal' },
  { id: 14, type: 'finish', label: 'Chegada' }
];