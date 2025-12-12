import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/GameBoard.css';
import Dice from './Dice';
import QuestionCard from './QuestionCard';
import Confetti from './Confetti'; // Importe o Confetti
import { boardCells } from '../data/boardData';

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
  // --- ESTADOS DO JOGO (COM PERSONAGENS) ---
  const [players, setPlayers] = useState([
    { 
      id: 1, 
      name: 'A Baiana', 
      avatar: '👩🏾‍🍳', 
      color: '#FF6B6B', 
      position: 0, 
      score: 0,
      achievements: []
    },
    { 
      id: 2, 
      name: 'Capoeirista', 
      avatar: '🤸🏾‍♂️', 
      color: '#4ECDC4', 
      position: 0, 
      score: 0,
      achievements: []
    },
    { 
      id: 3, 
      name: 'Sambista', 
      avatar: '🥁', 
      color: '#FFD166', 
      position: 0, 
      score: 0,
      achievements: []
    },
    { 
      id: 4, 
      name: 'Pescadora', 
      avatar: '🎣', 
      color: '#06D6A0', 
      position: 0, 
      score: 0,
      achievements: []
    }
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
  const currentPlayer = players[currentPlayerIndex];

  // --- SISTEMA DE SONS ---
  const playSound = useCallback((soundName) => {
    try {
      // Sons base usando Web Audio API (não precisa de arquivos)
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      switch(soundName) {
        case 'dice':
          const diceOsc = audioContext.createOscillator();
          const diceGain = audioContext.createGain();
          diceOsc.connect(diceGain);
          diceGain.connect(audioContext.destination);
          diceOsc.frequency.setValueAtTime(300, audioContext.currentTime);
          diceGain.gain.setValueAtTime(0.3, audioContext.currentTime);
          diceGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
          diceOsc.start();
          diceOsc.stop(audioContext.currentTime + 0.3);
          break;
          
        case 'move':
          const moveOsc = audioContext.createOscillator();
          const moveGain = audioContext.createGain();
          moveOsc.connect(moveGain);
          moveGain.connect(audioContext.destination);
          moveOsc.frequency.setValueAtTime(200, audioContext.currentTime);
          moveOsc.frequency.setValueAtTime(400, audioContext.currentTime + 0.1);
          moveGain.gain.setValueAtTime(0.2, audioContext.currentTime);
          moveGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
          moveOsc.start();
          moveOsc.stop(audioContext.currentTime + 0.2);
          break;
          
        case 'correct':
          const correctOsc = audioContext.createOscillator();
          const correctGain = audioContext.createGain();
          correctOsc.connect(correctGain);
          correctGain.connect(audioContext.destination);
          correctOsc.frequency.setValueAtTime(523.25, audioContext.currentTime);
          correctOsc.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1);
          correctOsc.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2);
          correctGain.gain.setValueAtTime(0.3, audioContext.currentTime);
          correctGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
          correctOsc.start();
          correctOsc.stop(audioContext.currentTime + 0.5);
          break;
          
        case 'wrong':
          const wrongOsc = audioContext.createOscillator();
          const wrongGain = audioContext.createGain();
          wrongOsc.connect(wrongGain);
          wrongGain.connect(audioContext.destination);
          wrongOsc.frequency.setValueAtTime(392, audioContext.currentTime);
          wrongOsc.frequency.setValueAtTime(349.23, audioContext.currentTime + 0.2);
          wrongOsc.frequency.setValueAtTime(329.63, audioContext.currentTime + 0.4);
          wrongGain.gain.setValueAtTime(0.3, audioContext.currentTime);
          wrongGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.6);
          wrongOsc.start();
          wrongOsc.stop(audioContext.currentTime + 0.6);
          break;
          
        case 'win':
          // Fanfarra simples
          for(let i = 0; i < 3; i++) {
            setTimeout(() => {
              const winOsc = audioContext.createOscillator();
              const winGain = audioContext.createGain();
              winOsc.connect(winGain);
              winGain.connect(audioContext.destination);
              winOsc.frequency.setValueAtTime(523.25 + (i * 100), audioContext.currentTime);
              winGain.gain.setValueAtTime(0.2, audioContext.currentTime);
              winGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
              winOsc.start();
              winOsc.stop(audioContext.currentTime + 0.5);
            }, i * 150);
          }
          break;
      }
    } catch (e) {
      console.log("Som não disponível");
    }
  }, []);

  const VIDEO_DATABASE = {
    1: "/videos/samba.mp4",
  };

  // --- ACESSIBILIDADE: VLIBRAS ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
    script.async = true;
    script.onload = () => {
      if (window.VLibras) {
        new window.VLibras.Widget('https://vlibras.gov.br/app');
      }
    };
    document.body.appendChild(script);
    return () => { 
      if(document.body.contains(script)) document.body.removeChild(script); 
    };
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
  }, [getCellCoordinates, players]);

  // --- DESENHO DO PERSONAGEM (AVATAR) ---
  const drawPawn = useCallback((ctx, x, y, player, isCurrentTurn) => {
    ctx.save(); 
    ctx.translate(x, y);

    // 1. Aura/brilho para jogador atual
    if (isCurrentTurn) {
      ctx.beginPath();
      ctx.arc(0, 0, 30, 0, Math.PI * 2);
      const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 30);
      gradient.addColorStop(0, player.color + '80');
      gradient.addColorStop(1, player.color + '00');
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // 2. Sombra
    ctx.beginPath(); 
    ctx.ellipse(0, 8, 15, 6, 0, 0, 2 * Math.PI); 
    ctx.fillStyle = 'rgba(0,0,0,0.3)'; 
    ctx.fill();

    // 3. Base circular
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // 4. Avatar (Emoji)
    ctx.font = "28px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(player.avatar, 0, 0);

    // 5. Indicador de pontos se > 0
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

  // --- DESENHO DA MÃOZINHA ANIMADA ---
  const drawHand = useCallback((ctx, x, y, frameCount) => {
    ctx.save(); 
    ctx.translate(x, y);
    
    // Animação de flutuação
    const floatY = Math.sin(frameCount * 0.1) * 8;
    ctx.translate(0, floatY);
    
    ctx.fillStyle = "#FFFFFF";
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    
    // Palma
    ctx.beginPath();
    ctx.arc(0, 0, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Dedos
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.arc(i * 8, -8, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    
    // Polegar
    ctx.beginPath();
    ctx.arc(-10, 5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    ctx.restore();
  }, []);

  // --- RENDER LOOP OTIMIZADO ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let frameCount = 0;

    const render = () => {
      frameCount++;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      
      // Fundo gradiente sutil
      const gradient = ctx.createLinearGradient(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
      gradient.addColorStop(0, '#1a1a2e');
      gradient.addColorStop(1, '#16213e');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Tabuleiro (Linha com efeito gradiente)
      ctx.beginPath();
      ctx.lineWidth = 18;
      const lineGradient = ctx.createLinearGradient(50, 500, 50, 200);
      lineGradient.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
      lineGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
      ctx.strokeStyle = lineGradient;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      for (let i = 0; i < boardCells.length; i++) {
        const { x, y } = getCellCoordinates(i);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Casas com destaque
      boardCells.forEach((cell, index) => {
        const { x, y } = getCellCoordinates(index);
        
        // Efeito de destaque
        if (highlightedCell === index) {
          ctx.beginPath();
          ctx.arc(x, y, 28, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
          ctx.fill();
        }

        let color = '#FFFFFF';
        let glow = false;
        
        switch(cell.type) {
          case 'start': color = '#00E676'; glow = true; break;
          case 'finish': color = '#FF9100'; glow = true; break;
          case 'question': color = '#2979FF'; glow = true; break;
          case 'move-back': color = '#FF5722'; break;
          case 'move-forward': color = '#D500F9'; break;
          case 'attention': color = '#FFEA00'; break;
          default: color = '#FFFFFF';
        }

        // Glow effect para casas especiais
        if (glow) {
          ctx.beginPath();
          ctx.arc(x, y, 25, 0, 2 * Math.PI);
          ctx.fillStyle = color + '40';
          ctx.fill();
        }

        // Casa principal
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, 2 * Math.PI);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#FFFFFF';
        ctx.stroke();

        // Rótulo da casa
        ctx.fillStyle = cell.type === 'attention' ? '#333333' : '#FFFFFF';
        ctx.font = 'bold 14px Poppins, Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        let label = index.toString();
        if (cell.type === 'question') label = '?';
        if (cell.type === 'start') label = 'INÍCIO';
        if (cell.type === 'finish') label = 'FIM';
        
        ctx.fillText(label, x, y);
      });

      // Jogadores com animação suave
      let anyPlayerMoving = false;
      players.forEach((player, i) => {
        if (!playerVisuals.current[player.id]) return;
        
        const visual = playerVisuals.current[player.id];
        const target = getCellCoordinates(player.position);
        
        // Atualizar target
        visual.targetX = target.x;
        visual.targetY = target.y;
        
        // Movimento suave
        const speed = 0.15;
        visual.x += (visual.targetX - visual.x) * speed;
        visual.y += (visual.targetY - visual.y) * speed;
        
        const distance = Math.sqrt(
          Math.pow(visual.targetX - visual.x, 2) + 
          Math.pow(visual.targetY - visual.y, 2)
        );
        
        if (distance > 0.5) anyPlayerMoving = true;
        
        // Posição offset para não sobrepor
        const angle = (i * Math.PI * 2) / players.length;
        const radius = 25;
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        
        drawPawn(ctx, visual.x + offsetX, visual.y + offsetY, player, player.id === currentPlayer.id);
      });

      // Atualizar estado de movimento
      setIsMoving(anyPlayerMoving);

      // Mãozinha apenas se for o turno do jogador e ele não estiver se movendo
      if (!anyPlayerMoving && currentPlayer) {
        const currentVisual = playerVisuals.current[currentPlayer.id];
        if (currentVisual) {
          const angle = (currentPlayerIndex * Math.PI * 2) / players.length;
          const radius = 25;
          const offsetX = Math.cos(angle) * radius;
          const offsetY = Math.sin(angle) * radius;
          drawHand(ctx, currentVisual.x + offsetX, currentVisual.y + offsetY - 50, frameCount);
        }
      }

      animationFrameId = window.requestAnimationFrame(render);
    };

    render();
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [players, currentPlayerIndex, currentPlayer, getCellCoordinates, drawPawn, drawHand, highlightedCell]);

  // --- LÓGICA DO JOGO ---
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
    
    // Destaque visual das possíveis casas
    const newPosition = currentPlayer.position + value;
    for (let i = currentPlayer.position + 1; i <= Math.min(newPosition, boardCells.length - 1); i++) {
      setTimeout(() => {
        setHighlightedCell(i);
        setTimeout(() => setHighlightedCell(null), 200);
      }, i * 100);
    }
    
    movePlayerLogic(value);
  }, [gameStarted, isMoving, currentPlayer, playSound]);

  const movePlayerLogic = useCallback((steps) => {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    let newPosition = player.position + steps;
    
    // Verificar vitória
    if (newPosition >= boardCells.length - 1) {
      newPosition = boardCells.length - 1;
      setGameMessage(`🏆 ${player.avatar} ${player.name} VENCEU O JOGO! 🏆`);
      playSound('win');
      setShowConfetti(true);
      setGameStarted(false);
      
      // Conquista por vencer
      const achievement = { 
        title: "Campeão Cultural!", 
        icon: "🏆",
        description: "Primeiro a completar o percurso"
      };
      player.achievements.push(achievement);
      setShowAchievement(achievement);
      setTimeout(() => setShowAchievement(null), 3000);
    } else {
      playSound('move');
    }
    
    player.position = newPosition;
    const cell = boardCells[newPosition];
    
    // Efeitos especiais das casas
    if (cell.type === 'question') {
      setTimeout(() => {
        setCurrentQuestionId(cell.questionId);
        setShowQuestion(true);
        setGameMessage(`❓ ${player.name} encontrou uma pergunta cultural!`);
      }, 1000);
    } else if (cell.type === 'move-back') {
      setTimeout(() => { 
        player.position = Math.max(0, player.position - cell.steps); 
        setPlayers([...newPlayers]); 
        setGameMessage(`↩️ ${player.avatar} ${player.name} voltou ${cell.steps} casas!`);
        playSound('wrong');
      }, 1000);
      passTurn();
    } else if (cell.type === 'move-forward') {
      setTimeout(() => { 
        player.position = Math.min(boardCells.length - 1, player.position + cell.steps); 
        setPlayers([...newPlayers]); 
        setGameMessage(`⏩ ${player.avatar} ${player.name} avançou ${cell.steps} casas!`);
        playSound('correct');
      }, 1000);
      passTurn();
    } else if (cell.type === 'attention') {
      setGameMessage(`⭐ ${player.avatar} ${player.name} encontrou um ponto cultural!`);
      passTurn();
    } else {
      setGameMessage(`🎲 ${player.avatar} ${player.name} avançou ${steps} casas!`);
      passTurn();
    }
    
    setPlayers(newPlayers);
  }, [players, currentPlayerIndex, playSound]);

  const passTurn = useCallback(() => {
    setTimeout(() => { 
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      setCurrentPlayerIndex(nextIndex);
      const nextPlayer = players[nextIndex];
      setGameMessage(`🎮 Vez de ${nextPlayer.avatar} ${nextPlayer.name}`);
    }, 1500);
  }, [currentPlayerIndex, players]);

  const handleAnswer = useCallback((isCorrect) => {
    const newPlayers = [...players]; 
    const player = newPlayers[currentPlayerIndex];
    
    if (isCorrect) {
      playSound('correct');
      setShowConfetti(true);
      
      // Conquista por acertar
      const achievement = { 
        title: "Sábio Cultural!", 
        icon: "📚",
        description: "Acertou uma pergunta difícil"
      };
      player.achievements.push(achievement);
      setShowAchievement(achievement);
      setTimeout(() => setShowAchievement(null), 3000);
      
      const videoUrl = VIDEO_DATABASE[currentQuestionId];
      if (videoUrl) { 
        setCurrentVideoUrl(videoUrl); 
        setShowVideo(true); 
      } else { 
        finishCorrectTurn(player, newPlayers); 
      }
      
      setTimeout(() => setShowConfetti(false), 3000);
    } else { 
      playSound('wrong');
      player.position = Math.max(0, player.position - 2); 
      setGameMessage(`💡 ${player.avatar} ${player.name} errou! Aprendeu algo novo!`);
      setPlayers(newPlayers); 
      passTurn(); 
    }
    setShowQuestion(false);
  }, [players, currentPlayerIndex, currentQuestionId, playSound, passTurn]);
  
  const finishCorrectTurn = useCallback((player, allPlayers) => { 
    player.position = Math.min(boardCells.length - 1, player.position + 1); 
    player.score += 10; 
    setGameMessage(`✅ ${player.avatar} ${player.name} acertou! +10 pontos!`);
    setPlayers([...allPlayers]); 
    passTurn(); 
  }, [passTurn]);

  const handleCloseVideo = useCallback(() => { 
    setShowVideo(false); 
    const newPlayers = [...players]; 
    const player = newPlayers[currentPlayerIndex]; 
    finishCorrectTurn(player, newPlayers); 
  }, [players, currentPlayerIndex, finishCorrectTurn]);

  // Componente de Conquista
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

  // Limpar timeouts
  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) {
        clearTimeout(messageTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="game-board-container">
      {/* VLIBRAS */}
      <div vw="true" className="enabled">
        <div vw-access-button="true" className="active"></div>
        <div vw-plugin-wrapper="true">
          <div className="vw-plugin-top-wrapper"></div>
        </div>
      </div>

      {/* EFEITOS VISUAIS */}
      {showConfetti && <Confetti start={true} />}
      {showAchievement && <AchievementPopup achievement={showAchievement} />}
      {showVideo && <VideoModal url={currentVideoUrl} onClose={handleCloseVideo} />}

      {/* HEADER */}
      <div className="game-header">
        <div className="header-left">
          <h1>
            <span className="game-title-icon">🎮</span>
            <span className="game-title">CATUNJERÊ 2D</span>
          </h1>
          <p className="game-subtitle">Uma jornada pela cultura afro-brasileira</p>
          <button onClick={handleActivateLibras} className="libras-btn">
            👋 Ativar Libras
          </button>
        </div>

        <div className="game-controls">
          {!gameStarted ? (
            <button className="start-btn pulse-animation" onClick={startGame}>
              ▶️ Iniciar Jogo
            </button>
          ) : (
            <div className="turn-info">
              <div className="turn-label">Vez de:</div>
              <div className="current-player-display" style={{ color: currentPlayer.color }}>
                <span className="player-avatar">{currentPlayer.avatar}</span>
                <span className="player-name">{currentPlayer.name}</span>
              </div>
              <div className="turn-status">
                {isMoving ? 'Movendo...' : 'Role o dado!'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="game-main-area">
        <div className="canvas-container">
          <canvas 
            ref={canvasRef} 
            width={CANVAS_WIDTH} 
            height={CANVAS_HEIGHT} 
            className="game-canvas"
          />
        </div>
        
        <div className="sidebar">
          <div className="sidebar-section dice-area">
            <div className="dice-label">🎲 Seu Dado</div>
            <Dice 
              value={diceValue} 
              onRoll={rollDice} 
              disabled={!gameStarted || showQuestion || showVideo || isMoving}
            />
            <div className="dice-instruction">
              {!gameStarted ? 'Inicie o jogo!' : 
               isMoving ? 'Aguarde o movimento...' : 
               'Clique para rolar!'}
            </div>
          </div>
          
          <div className="sidebar-section message-box">
            <div className="message-icon">💬</div>
            <div className="message-content">{gameMessage}</div>
          </div>
          
          <div className="sidebar-section players-list">
            <div className="players-label">👥 Jogadores</div>
            {players.map(p => (
              <div 
                key={p.id} 
                className={`player-row ${p.id === currentPlayer.id ? 'current-turn' : ''}`}
                style={{ 
                  borderLeft: `5px solid ${p.color}`,
                  background: p.id === currentPlayer.id ? `${p.color}20` : 'transparent'
                }}
              >
                <div className="player-info">
                  <span className="player-avatar-row">{p.avatar}</span>
                  <div className="player-details">
                    <div className="player-name-row">{p.name}</div>
                    <div className="player-position">Casa {p.position}</div>
                  </div>
                </div>
                <div className="player-score">
                  <div className="score-value">{p.score}</div>
                  <div className="score-label">pontos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QUESTION CARD */}
      {showQuestion && currentQuestionId && (
        <QuestionCard
          questionId={currentQuestionId}
          questionData={boardCells.find(c => c.questionId === currentQuestionId)?.questionData}
          onAnswer={handleAnswer}
          onClose={() => setShowQuestion(false)}
        />
      )}
    </div>
  );
};

export default GameBoard;