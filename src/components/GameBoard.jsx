import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/GameBoard.css';
import Dice from './Dice';
import QuestionCard from './QuestionCard';
import Confetti from './Confetti';
import { boardCells } from '../data/boardData'; // Agora vai funcionar

// --- CONFIGURAÇÕES GLOBAIS ---
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;

// --- COMPONENTE AUXILIAR: MODAL DE VÍDEO ---
const VideoModal = ({ url, onClose }) => (
  <div className="video-modal-overlay">
    <div className="video-modal-content">
      <div className="video-header">
        <h2>🎥 Cultura em Movimento!</h2>
        <div className="video-subtitle">Aprenda mais sobre esta expressão cultural</div>
      </div>
      <div className="video-wrapper">
        <video 
          controls 
          autoPlay 
          playsInline
          style={{ width: '100%', display: 'block', borderRadius: '10px' }}
        >
          <source src={url} type="video/mp4" />
          Seu navegador não suporta vídeos.
        </video>
      </div>
      <button className="close-video-btn pulse-animation" onClick={onClose}>
        Continue sua jornada! 🚀
      </button>
    </div>
  </div>
);

// --- COMPONENTE PRINCIPAL ---
const GameBoard = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: 'A Baiana', avatar: '👩🏾‍🍳', color: '#FF6B6B', position: 0, score: 0, achievements: [] },
    { id: 2, name: 'Capoeirista', avatar: '🤸🏾‍♂️', color: '#4ECDC4', position: 0, score: 0, achievements: [] },
    { id: 3, name: 'Sambista', avatar: '🥁', color: '#FFD166', position: 0, score: 0, achievements: [] },
    { id: 4, name: 'Pescadora', avatar: '🎣', color: '#06D6A0', position: 0, score: 0, achievements: [] }
  ]);

  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [gameMessage, setGameMessage] = useState('🎯 Clique em "Iniciar Jogo" para começar!');
  const [gameStarted, setGameStarted] = useState(false);
  const [isMoving, setIsMoving] = useState(false);

  // Estados de Interface
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestionId, setCurrentQuestionId] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAchievement, setShowAchievement] = useState(null);
  const [highlightedCell, setHighlightedCell] = useState(null);

  const canvasRef = useRef(null);
  const playerVisuals = useRef({});
  const messageTimeoutRef = useRef(null);
  const audioContextRef = useRef(null); // CORREÇÃO: Ref para manter o contexto de áudio
  
  const currentPlayer = players[currentPlayerIndex];

  // --- SISTEMA DE SONS (CORRIGIDO) ---
  const playSound = useCallback((soundName) => {
    try {
      // Inicializa o contexto apenas se não existir ou estiver fechado
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContextRef.current = new AudioContext();
      }

      const audioContext = audioContextRef.current;
      
      // Resume o contexto se estiver suspenso (comum em navegadores modernos)
      if (audioContext.state === 'suspended') {
        audioContext.resume();
      }

      const currentTime = audioContext.currentTime;

      switch(soundName) {
        case 'dice':
          const diceOsc = audioContext.createOscillator();
          const diceGain = audioContext.createGain();
          diceOsc.connect(diceGain);
          diceGain.connect(audioContext.destination);
          diceOsc.frequency.setValueAtTime(300, currentTime);
          diceGain.gain.setValueAtTime(0.3, currentTime);
          diceGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3);
          diceOsc.start(currentTime);
          diceOsc.stop(currentTime + 0.3);
          break;
          
        case 'move':
          const moveOsc = audioContext.createOscillator();
          const moveGain = audioContext.createGain();
          moveOsc.connect(moveGain);
          moveGain.connect(audioContext.destination);
          moveOsc.frequency.setValueAtTime(200, currentTime);
          moveOsc.frequency.setValueAtTime(400, currentTime + 0.1);
          moveGain.gain.setValueAtTime(0.2, currentTime);
          moveGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2);
          moveOsc.start(currentTime);
          moveOsc.stop(currentTime + 0.2);
          break;
          
        case 'correct':
          const correctOsc = audioContext.createOscillator();
          const correctGain = audioContext.createGain();
          correctOsc.connect(correctGain);
          correctGain.connect(audioContext.destination);
          correctOsc.frequency.setValueAtTime(523.25, currentTime);
          correctOsc.frequency.setValueAtTime(659.25, currentTime + 0.1);
          correctOsc.frequency.setValueAtTime(783.99, currentTime + 0.2);
          correctGain.gain.setValueAtTime(0.3, currentTime);
          correctGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.5);
          correctOsc.start(currentTime);
          correctOsc.stop(currentTime + 0.5);
          break;
          
        case 'wrong':
          const wrongOsc = audioContext.createOscillator();
          const wrongGain = audioContext.createGain();
          wrongOsc.connect(wrongGain);
          wrongGain.connect(audioContext.destination);
          wrongOsc.frequency.setValueAtTime(392, currentTime);
          wrongOsc.frequency.setValueAtTime(349.23, currentTime + 0.2);
          wrongOsc.frequency.setValueAtTime(329.63, currentTime + 0.4);
          wrongGain.gain.setValueAtTime(0.3, currentTime);
          wrongGain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.6);
          wrongOsc.start(currentTime);
          wrongOsc.stop(currentTime + 0.6);
          break;
          
        case 'win':
          for(let i = 0; i < 3; i++) {
            const winOsc = audioContext.createOscillator();
            const winGain = audioContext.createGain();
            winOsc.connect(winGain);
            winGain.connect(audioContext.destination);
            winOsc.frequency.setValueAtTime(523.25 + (i * 100), currentTime + (i * 0.15));
            winGain.gain.setValueAtTime(0.2, currentTime + (i * 0.15));
            winGain.gain.exponentialRampToValueAtTime(0.01, currentTime + (i * 0.15) + 0.5);
            winOsc.start(currentTime + (i * 0.15));
            winOsc.stop(currentTime + (i * 0.15) + 0.5);
          }
          break;
        default:
          break;
      }
    } catch (e) {
      console.log("Som não disponível", e);
    }
  }, []);

  const VIDEO_DATABASE = {
    1: "/videos/samba.mp4",
  };

  // --- ACESSIBILIDADE: VLIBRAS ---
  useEffect(() => {
    // Evita carregar script múltiplas vezes
    if (document.getElementById('vlibras-script')) return;

    const script = document.createElement('script');
    script.id = 'vlibras-script';
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      if (window.VLibras) {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
      }
    };
    document.body.appendChild(script);
  }, []);

  const handleActivateLibras = useCallback(() => {
    if (!window.VLibras) { 
      setGameMessage("⏳ Carregando Libras... Aguarde um momento.");
      return; 
    }
    const btnContainer = document.querySelector('[vw-access-button]');
    const btnImage = btnContainer ? btnContainer.querySelector('img') : null;
    if (btnImage) btnImage.click();
    else if (btnContainer) btnContainer.click();
  }, []);

  // --- GEOMETRIA DO TABULEIRO ---
  const getCellCoordinates = useCallback((index) => {
    const cols = 7;
    const cellWidth = (CANVAS_WIDTH - 100) / (cols - 1);
    const cellHeight = (CANVAS_HEIGHT - 150) / 2;
    const startX = 50;
    const startY = 500;
    let col, x, y;
    if (index <= 6) { col = index; x = startX + col * cellWidth; y = startY; }
    else if (index <= 13) { col = index - 7; x = startX + (6 - col) * cellWidth; y = startY - cellHeight; }
    else { col = index - 14; x = startX + col * cellWidth; y = startY - 2 * cellHeight; }
    return { x, y };
  }, []);

  useEffect(() => {
    const initialVisuals = {};
    players.forEach(p => {
      const coords = getCellCoordinates(p.position);
      initialVisuals[p.id] = { 
        x: coords.x, 
        y: coords.y,
        targetX: coords.x,
        targetY: coords.y
      };
    });
    playerVisuals.current = initialVisuals;
  }, [getCellCoordinates, players.length]); // Corrigido dependencia

  // --- DESENHO DO PERSONAGEM (AVATAR) ---
  const drawPawn = useCallback((ctx, x, y, player, isCurrentTurn) => {
    ctx.save(); 
    ctx.translate(x, y);

    if (isCurrentTurn) {
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
      gradient.addColorStop(0, player.color + '80');
      gradient.addColorStop(1, player.color + '00');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    ctx.beginPath(); 
    ctx.ellipse(0, 8, 15, 6, 0, 0, 2 * Math.PI); 
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; 
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    ctx.font = "28px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(player.avatar, 0, 0);

    if (player.score > 0) {
      ctx.beginPath();
      ctx.arc(15, -15, 10, 0, Math.PI * 2);
      ctx.fillStyle = '#FFD700';
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = "bold 12px Arial";
      ctx.fillText(player.score, 15, -15);
    }

    ctx.restore();
  }, []);

  const drawHand = useCallback((ctx, x, y, frameCount) => {
    ctx.save(); 
    ctx.translate(x, y);
    
    const floatY = Math.sin(frameCount * 0.1) * 8;
    ctx.translate(0, floatY);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(i * 8, -8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    
    ctx.beginPath();
    ctx.arc(-10, 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }, []);

  // --- RENDER LOOP ---
// --- RENDER LOOP OTIMIZADO E MAIS BONITO ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // 1. Fundo Gradiente (Céu Noturno)
      const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#0f0c29');
      gradient.addColorStop(0.5, '#302b63');
      gradient.addColorStop(1, '#24243e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // 2. Desenhar a "Estrada" (Caminho Suave por trás)
      // Isso cria o efeito de trilha grossa
      ctx.beginPath();
      ctx.lineWidth = 40; // Estrada grossa
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)'; // Estrada bem sutil

      // Lógica para desenhar curvas suaves entre os pontos
      if (boardCells.length > 0) {
        const first = getCellCoordinates(0);
        ctx.moveTo(first.x, first.y);

        for (let i = 0; i < boardCells.length - 1; i++) {
          const current = getCellCoordinates(i);
          const next = getCellCoordinates(i + 1);
          
          // Cria um ponto de controle para curvar a linha
          // Se for mudança de linha (zigue-zague), curva mais acentuada
          const xc = (current.x + next.x) / 2;
          const yc = (current.y + next.y) / 2;
          
          // Usa curvas quadráticas para suavizar
          ctx.quadraticCurveTo(current.x, current.y, xc, yc);
        }
        // Conecta o último ponto
        const last = getCellCoordinates(boardCells.length - 1);
        ctx.lineTo(last.x, last.y);
      }
      ctx.stroke();

      // 3. Desenhar a "Linha de Energia" (Fio brilhante no meio da estrada)
      ctx.beginPath();
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#4ECDC4'; // Cor ciano neon
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4ECDC4';

      if (boardCells.length > 0) {
        const first = getCellCoordinates(0);
        ctx.moveTo(first.x, first.y);
        for (let i = 0; i < boardCells.length - 1; i++) {
          const current = getCellCoordinates(i);
          const next = getCellCoordinates(i + 1);
          const xc = (current.x + next.x) / 2;
          const yc = (current.y + next.y) / 2;
          ctx.quadraticCurveTo(current.x, current.y, xc, yc);
        }
        const last = getCellCoordinates(boardCells.length - 1);
        ctx.lineTo(last.x, last.y);
      }
      ctx.stroke();
      
      // Reset de sombra para não afetar outras coisas
      ctx.shadowBlur = 0;

      // 4. Desenhar as Casas (Com estilo melhorado)
      boardCells.forEach((cell, index) => {
        const { x, y } = getCellCoordinates(index);
        
        // Efeito de destaque (Pulsar) se for a casa alvo do dado
        if (highlightedCell === index) {
          ctx.beginPath();
          ctx.arc(x, y, 35 + Math.sin(frameCount * 0.2) * 5, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.fill();
        }

        let outerColor = '#ffffff';
        let innerColor = '#2b2b2b';
        let ringColor = '#ffffff';
        
        // Cores baseadas no tipo
        switch(cell.type) {
          case 'start': 
            outerColor = '#00E676'; ringColor = '#00E676'; break;
          case 'finish': 
            outerColor = '#FF9100'; ringColor = '#FF9100'; break;
          case 'question': 
            outerColor = '#2979FF'; ringColor = '#2979FF'; innerColor = '#1565C0'; break;
          case 'move-back': 
            outerColor = '#FF5722'; ringColor = '#FF5722'; break;
          case 'move-forward': 
            outerColor = '#D500F9'; ringColor = '#D500F9'; break;
          case 'attention': 
            outerColor = '#FFEA00'; ringColor = '#FFEA00'; break;
          default: 
            outerColor = '#ffffff'; ringColor = 'rgba(255,255,255,0.3)';
        }

        // Desenhar Sombra da Casa (efeito 3D fake)
        ctx.beginPath();
        ctx.arc(x, y + 4, 22, 0, 2 * Math.PI);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fill();

        // Desenhar Base da Casa
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, 2 * Math.PI);
        ctx.fillStyle = '#1a1a2e'; // Fundo escuro para contrastar
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = ringColor;
        ctx.stroke();

        // Desenhar Miolo da Casa (Gradiente)
        ctx.beginPath();
        ctx.arc(x, y, 16, 0, 2 * Math.PI);
        const cellGrad = ctx.createRadialGradient(x, y, 2, x, y, 16);
        cellGrad.addColorStop(0, outerColor);
        cellGrad.addColorStop(1, innerColor); // Escurece nas bordas
        ctx.fillStyle = cellGrad;
        ctx.fill();

        // Rótulo/Ícone da casa
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 14px Poppins, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let label = index.toString();
        if (cell.type === 'question') label = '?';
        if (cell.type === 'start') label = 'Start';
        if (cell.type === 'finish') label = 'Fim';
        if (cell.type === 'attention') label = '!';
        if (cell.type === 'move-back') label = '<<';
        if (cell.type === 'move-forward') label = '>>';
        
        // Sombra no texto para leitura
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 4;
        ctx.fillText(label, x, y);
        ctx.shadowBlur = 0;
      });

      // 5. Jogadores (Movimento Suave)
      let anyPlayerMoving = false;
      players.forEach((player, i) => {
        if (!playerVisuals.current[player.id]) return;
        
        const visual = playerVisuals.current[player.id];
        const target = getCellCoordinates(player.position);
        
        visual.targetX = target.x;
        visual.targetY = target.y;
        
        // Interpolação Linear (Lerp) para suavidade
        const speed = 0.12;
        visual.x += (visual.targetX - visual.x) * speed;
        visual.y += (visual.targetY - visual.y) * speed;
        
        const distance = Math.sqrt(Math.pow(visual.targetX - visual.x, 2) + Math.pow(visual.targetY - visual.y, 2));
        if (distance > 1) anyPlayerMoving = true;
        
        // Posição offset para múltiplos jogadores na mesma casa não se sobreporem totalmente
        // Calcula um pequeno círculo ao redor do centro da casa
        const playerCountOnCell = players.filter(p => p.position === player.position).length;
        let offsetX = 0;
        let offsetY = 0;

        if (playerCountOnCell > 1) {
            const angle = (i * (360 / players.length)) * (Math.PI / 180);
            const radius = 15;
            offsetX = Math.cos(angle) * radius;
            offsetY = Math.sin(angle) * radius;
        }
        
        drawPawn(ctx, visual.x + offsetX, visual.y + offsetY, player, player.id === currentPlayer.id);
      });

      setIsMoving(anyPlayerMoving);

      if (!anyPlayerMoving && currentPlayer) {
        const currentVisual = playerVisuals.current[currentPlayer.id];
        if (currentVisual) {
          // Recalcula o offset para a mãozinha seguir o peão deslocado
          const playerCountOnCell = players.filter(p => p.position === currentPlayer.position).length;
          let offsetX = 0;
          let offsetY = 0;
          if (playerCountOnCell > 1) {
             const angle = ((currentPlayer.id - 1) * (360 / players.length)) * (Math.PI / 180);
             const radius = 15;
             offsetX = Math.cos(angle) * radius;
             offsetY = Math.sin(angle) * radius;
          }

          drawHand(ctx, currentVisual.x + offsetX, currentVisual.y + offsetY - 50, frameCount);
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [players, currentPlayerIndex, currentPlayer, getCellCoordinates, drawPawn, drawHand, highlightedCell]);
  const startGame = useCallback(() => {
    const newPlayers = players.map(p => ({ 
      ...p, 
      position: 0, 
      score: 0,
      achievements: []
    }));
    
    setPlayers(newPlayers); 
    setGameStarted(true); 
    setGameMessage(`🎮 Jogo iniciado! Vez de ${newPlayers[0].avatar} ${newPlayers[0].name}`);
    setCurrentPlayerIndex(0);
    
    // Reset visuals
    const startCoords = getCellCoordinates(0);
    players.forEach(p => { 
      playerVisuals.current[p.id] = { 
        x: startCoords.x, 
        y: startCoords.y,
        targetX: startCoords.x,
        targetY: startCoords.y
      }; 
    });
    
    playSound('win');
  }, [players, getCellCoordinates, playSound]);

  const rollDice = useCallback(() => {
    if (!gameStarted || isMoving) return;
    
    playSound('dice');
    const value = Math.floor(Math.random() * 6) + 1;
    setDiceValue(value);
    
    const newPosition = currentPlayer.position + value;
    const maxBoard = boardCells.length;

    // Animação de destaque
    for (let i = currentPlayer.position + 1; i <= Math.min(newPosition, maxBoard - 1); i++) {
      setTimeout(() => {
        setHighlightedCell(i);
        setTimeout(() => setHighlightedCell(null), 200);
      }, (i - currentPlayer.position) * 100);
    }
    
    movePlayerLogic(value);
  }, [gameStarted, isMoving, currentPlayer, playSound]);

  const movePlayerLogic = useCallback((steps) => {
    setPlayers(prevPlayers => {
      const newPlayers = [...prevPlayers];
      const player = newPlayers[currentPlayerIndex];
      let newPosition = player.position + steps;
      
      if (newPosition >= boardCells.length - 1) {
        newPosition = boardCells.length - 1;
        setGameMessage(`🏆 ${player.avatar} ${player.name} VENCEU O JOGO! 🏆`);
        playSound('win');
        setShowConfetti(true);
        setGameStarted(false);
        
        const achievement = { title: "Campeão Cultural!", icon: "🏆", description: "Primeiro a completar o percurso" };
        player.achievements.push(achievement);
        setShowAchievement(achievement);
        setTimeout(() => setShowAchievement(null), 3000);
      } else {
        playSound('move');
      }
      
      player.position = newPosition;
      
      // Checar tipo da casa
      const cell = boardCells[newPosition];
      
      if (cell.type === 'question') {
        setTimeout(() => {
          setCurrentQuestionId(cell.questionId);
          setShowQuestion(true);
          setGameMessage(`❓ ${player.name} encontrou uma pergunta cultural!`);
        }, 1000);
      } else if (cell.type === 'move-back') {
        setTimeout(() => { 
          // Atualiza estado de novo
          setPlayers(curr => {
             const updated = [...curr];
             updated[currentPlayerIndex].position = Math.max(0, updated[currentPlayerIndex].position - cell.steps);
             return updated;
          });
          setGameMessage(`↩️ ${player.avatar} ${player.name} voltou ${cell.steps} casas!`);
          playSound('wrong');
          passTurn();
        }, 1000);
      } else if (cell.type === 'move-forward') {
        setTimeout(() => { 
          setPlayers(curr => {
             const updated = [...curr];
             updated[currentPlayerIndex].position = Math.min(boardCells.length - 1, updated[currentPlayerIndex].position + cell.steps);
             return updated;
          });
          setGameMessage(`⏩ ${player.avatar} ${player.name} avançou ${cell.steps} casas!`);
          playSound('correct');
          passTurn();
        }, 1000);
      } else if (cell.type === 'attention') {
        setGameMessage(`⭐ ${player.avatar} ${player.name} encontrou um ponto cultural!`);
        passTurn();
      } else {
        setGameMessage(`🎲 ${player.avatar} ${player.name} avançou ${steps} casas!`);
        passTurn();
      }

      return newPlayers;
    });
  }, [currentPlayerIndex, playSound]);

  const passTurn = useCallback(() => {
    setTimeout(() => { 
      setCurrentPlayerIndex(prev => {
        const nextIndex = (prev + 1) % players.length;
        const nextPlayer = players[nextIndex];
        setGameMessage(`🎮 Vez de ${nextPlayer.avatar} ${nextPlayer.name}`);
        return nextIndex;
      });
    }, 1500);
  }, [players]);

  const handleAnswer = useCallback((isCorrect) => {
    const player = players[currentPlayerIndex];
    
    if (isCorrect) {
      playSound('correct');
      setShowConfetti(true);
      
      // Conquista
      const achievement = { title: "Sábio Cultural!", icon: "📚", description: "Acertou uma pergunta difícil" };
      
      setPlayers(prev => {
         const updated = [...prev];
         updated[currentPlayerIndex].achievements.push(achievement);
         return updated;
      });

      setShowAchievement(achievement);
      setTimeout(() => setShowAchievement(null), 3000);
      
      const videoUrl = VIDEO_DATABASE[currentQuestionId];
      if (videoUrl) { 
        setCurrentVideoUrl(videoUrl); 
        setShowVideo(true); 
      } else { 
        finishCorrectTurn(); 
      }
      
      setTimeout(() => setShowConfetti(false), 3000);
    } else { 
      playSound('wrong');
      setPlayers(prev => {
        const updated = [...prev];
        updated[currentPlayerIndex].position = Math.max(0, updated[currentPlayerIndex].position - 2);
        return updated;
      });
      setGameMessage(`💡 ${player.avatar} ${player.name} errou! Aprendeu algo novo!`);
      passTurn(); 
    }
    setShowQuestion(false);
  }, [players, currentPlayerIndex, currentQuestionId, playSound, passTurn]);
  
  const finishCorrectTurn = useCallback(() => { 
    setPlayers(prev => {
        const updated = [...prev];
        updated[currentPlayerIndex].position = Math.min(boardCells.length - 1, updated[currentPlayerIndex].position + 1);
        updated[currentPlayerIndex].score += 10;
        return updated;
    });
    const player = players[currentPlayerIndex];
    setGameMessage(`✅ ${player.avatar} ${player.name} acertou! +10 pontos!`);
    passTurn(); 
  }, [currentPlayerIndex, players, passTurn]);

  const handleCloseVideo = useCallback(() => { 
    setShowVideo(false); 
    finishCorrectTurn(); 
  }, [finishCorrectTurn]);

  const AchievementPopup = ({ achievement }) => (
    <div className="achievement-popup">
      <div className="achievement-content">
        <div className="achievement-icon">{achievement.icon}</div>
        <div className="achievement-text">
          <h4>Conquista Desbloqueada!</h4>
          <h3>{achievement.title}</h3>
          <p>{achievement.description}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="game-board-container">
      {/* VLIBRAS */}
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active"></div>
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper"></div>
        </div>
      </div>

      <Confetti start={showConfetti} />
      {showAchievement && <AchievementPopup achievement={showAchievement} />}
      {showVideo && <VideoModal url={currentVideoUrl} onClose={handleCloseVideo} />}

      <div className="game-header">
        <div className="header-left">
          <h1><span className="game-title-icon">🎮</span> <span className="game-title">CATUNJERÊ 2D</span></h1>
          <p className="game-subtitle">Uma jornada pela cultura afro-brasileira</p>
          <button onClick={handleActivateLibras} className="libras-btn">👋 Ativar Libras</button>
        </div>

        <div className="game-controls">
          {!gameStarted ? (
            <button className="start-btn pulse-animation" onClick={startGame}>▶️ Iniciar Jogo</button>
          ) : (
            <div className="turn-info">
              <div className="turn-label">Vez de:</div>
              <div className="current-player-display" style={{ color: currentPlayer.color }}>
                <span className="player-avatar">{currentPlayer.avatar}</span>
                <span className="player-name">{currentPlayer.name}</span>
              </div>
              <div className="turn-status">{isMoving ? 'Movendo...' : 'Role o dado!'}</div>
            </div>
          )}
        </div>
      </div>

      <div className="game-main-area">
        <div className="canvas-container">
          <canvas ref={canvasRef} width={CANVAS_WIDTH} height={CANVAS_HEIGHT} className="game-canvas" />
        </div>
        
        <div className="sidebar">
          <div className="sidebar-section dice-area">
            <div className="dice-label">🎲 Seu Dado</div>
            <Dice value={diceValue} onRoll={rollDice} disabled={!gameStarted || showQuestion || showVideo || isMoving} />
          </div>
          
          <div className="sidebar-section message-box">
            <div className="message-icon">💬</div>
            <div className="message-content">{gameMessage}</div>
          </div>
          
          <div className="sidebar-section players-list">
            <div className="players-label">👥 Jogadores</div>
            {players.map(p => (
              <div key={p.id} className={`player-row ${p.id === currentPlayer?.id ? 'current-turn' : ''}`}
                style={{ borderLeft: `5px solid ${p.color}`, background: p.id === currentPlayer?.id ? `${p.color}20` : 'transparent' }}>
                <div className="player-info">
                  <span className="player-avatar-row">{p.avatar}</span>
                  <div className="player-details">
                    <div className="player-name-row">{p.name}</div>
                    <div className="player-position">Casa {p.position}</div>
                  </div>
                </div>
                <div className="player-score">
                  <div className="score-value">{p.score}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showQuestion && currentQuestionId && (
        <QuestionCard
          questionData={boardCells.find(c => c.questionId === currentQuestionId)?.questionData}
          onAnswer={handleAnswer}
          onClose={() => setShowQuestion(false)}
        />
      )}
    </div>
  );
};

export default GameBoard;