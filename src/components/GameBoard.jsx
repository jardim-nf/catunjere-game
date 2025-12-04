import React, { useState } from 'react';
import '../styles/GameBoard.css';
import Dice from './Dice';
import PlayerPiece from './PlayerPiece';
import QuestionCard from './QuestionCard';
import { boardCells } from '../data/boardData';

const GameBoard = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Jogador 1', color: '#FF6B6B', position: 0, score: 0, isActive: true },
    { id: 2, name: 'Jogador 2', color: '#4ECDC4', position: 0, score: 0, isActive: true },
    { id: 3, name: 'Jogador 3', color: '#FFD166', position: 0, score: 0, isActive: true },
    { id: 4, name: 'Jogador 4', color: '#06D6A0', position: 0, score: 0, isActive: true }
  ]);
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameMessage, setGameMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameHistory, setGameHistory] = useState([]);

  const currentPlayer = players[currentPlayerIndex];

  // Tooltip para células
  const getCellDescription = (cellType) => {
    const descriptions = {
      'start': '🏁 INÍCIO - Comece sua jornada aqui!',
      'finish': '🎉 FINAL - Chegue aqui para vencer!',
      'question': '❓ PERGUNTA - Teste seus conhecimentos sobre afoxés',
      'move-back': '⬅️ VOLTE - Cuidado! Você voltará casas',
      'move-forward': '➡️ AVANCE - Boa sorte! Avance casas',
      'attention': '⚠️ ATENÇÃO - Compartilhe um conselho cultural',
      'neutral': 'Continue sua jornada'
    };
    return descriptions[cellType] || '';
  };

  // Iniciar jogo
  const startGame = () => {
    const newPlayers = players.map(player => ({
      ...player,
      position: 0,
      score: 0,
      isActive: true
    }));
    setPlayers(newPlayers);
    setCurrentPlayerIndex(0);
    setGameStarted(true);
    setGameHistory([{ type: 'start', message: '🎮 Jogo iniciado!', timestamp: new Date() }]);
    setGameMessage('🎯 Jogo iniciado! Jogador 1 começa. Role o dado!');
  };

  // Adicionar ao histórico
  const addToHistory = (message) => {
    setGameHistory(prev => [
      { type: 'move', message, timestamp: new Date() },
      ...prev.slice(0, 4)
    ]);
  };

  // Rolar dado
  const rollDice = () => {
    if (!gameStarted) {
      setGameMessage('⚠️ Inicie o jogo primeiro!');
      return;
    }
    
    const value = Math.floor(Math.random() * 6) + 1;
    setDiceValue(value);
    
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    
    // Calcula nova posição
    const newPosition = player.position + value;
    
    // Verifica se chegou ao final
    if (newPosition >= boardCells.length - 1) {
      player.position = boardCells.length - 1;
      player.score += 50; // Bônus por vencer
      
      const winMessage = `🏆 ${player.name} VENCEU O JOGO! Parabéns!`;
      setGameMessage(winMessage);
      setGameStarted(false);
      setPlayers(newPlayers);
      addToHistory(winMessage);
      return;
    }
    
    player.position = newPosition;
    const cell = boardCells[newPosition];
    
    // Adiciona ao histórico
    addToHistory(`🎲 ${player.name} rolou ${value} e foi para casa ${newPosition}`);
    
    // Verifica tipo da casa
    if (cell.type === 'question') {
      setCurrentQuestion(cell.questionId);
      setShowQuestion(true);
      setGameMessage(`📚 ${player.name}, responda a pergunta sobre afoxés!`);
    } else if (cell.type === 'move-back') {
      player.position = Math.max(0, player.position - cell.steps);
      const backMessage = `↩️ ${player.name} voltou ${cell.steps} casas!`;
      setGameMessage(backMessage);
      addToHistory(backMessage);
      passTurn();
    } else if (cell.type === 'move-forward') {
      player.position = Math.min(boardCells.length - 1, player.position + cell.steps);
      const forwardMessage = `⚡ ${player.name} avançou ${cell.steps} casas!`;
      setGameMessage(forwardMessage);
      addToHistory(forwardMessage);
      passTurn();
    } else if (cell.type === 'attention') {
      const attentionMessage = `💡 ${player.name}: "${cell.message}"`;
      setGameMessage(attentionMessage);
      addToHistory(`💬 ${player.name} compartilhou: "${cell.message}"`);
      passTurn();
    } else {
      passTurn();
    }
    
    setPlayers(newPlayers);
  };

  const passTurn = () => {
    setTimeout(() => {
      const nextIndex = (currentPlayerIndex + 1) % players.length;
      setCurrentPlayerIndex(nextIndex);
      setGameMessage(`🎯 Vez de: ${players[nextIndex].name}`);
    }, 1500);
  };

  const handleAnswer = (isCorrect) => {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayerIndex];
    
    if (isCorrect) {
      player.position = Math.min(boardCells.length - 1, player.position + 1);
      player.score += 10;
      const correctMessage = `✅ ${player.name} acertou! +10 pontos e avança 1 casa!`;
      setGameMessage(correctMessage);
      addToHistory(correctMessage);
    } else {
      player.position = Math.max(0, player.position - 2);
      const wrongMessage = `❌ ${player.name} errou! Volta 2 casas.`;
      setGameMessage(wrongMessage);
      addToHistory(wrongMessage);
    }
    
    setPlayers(newPlayers);
    setShowQuestion(false);
    passTurn();
  };

  // Formatar nome do jogador
  const formatPlayerName = (player) => {
    return player.id === currentPlayer.id ? 
      `👑 ${player.name}` : player.name;
  };

  // Renderizar célula
  const renderCell = (cell, index) => {
    const cellType = cell.type;
    const cellLabel = cell.label || '';
    const description = getCellDescription(cellType);
    
    return (
      <div 
        key={cell.id} 
        className={`cell ${cellType}`}
        title={`Casa ${index}: ${description}`}
        data-tooltip={description}
      >
        <div className="cell-number">{index}</div>
        <div className="cell-content">
          {cellType === 'start' && '🏁'}
          {cellType === 'finish' && '🎉'}
          {cellType === 'question' && '❓'}
          {cellType === 'move-back' && '⬅️'}
          {cellType === 'move-forward' && '➡️'}
          {cellType === 'attention' && '💡'}
          {cellType === 'neutral' && '○'}
        </div>
        <div className="cell-label">{cellLabel}</div>
        
        {/* Renderizar peças dos jogadores */}
        {players.map(player => 
          player.position === index && (
            <PlayerPiece
              key={player.id}
              player={player}
              isCurrent={player.id === currentPlayer.id}
            />
          )
        )}
      </div>
    );
  };

  return (
    <div className="game-board-container">
      {/* Header */}
      <div className="game-header">
        <div className="header-left">
          <h1>🎮 CATUNJERÊ</h1>
          <p className="game-subtitle">Jogo dos Afoxés - Cultura Afro-Brasileira</p>
        </div>
        <div className="game-controls">
          {!gameStarted ? (
            <button className="start-btn" onClick={startGame}>
              <span className="btn-icon">▶️</span>
              Iniciar Jogo
            </button>
          ) : (
            <button className="restart-btn" onClick={startGame}>
              <span className="btn-icon">🔄</span>
              Reiniciar
            </button>
          )}
        </div>
      </div>

      {/* Status do Jogo */}
      <div className="game-status">
        <div className="status-header">
          <div className="current-turn">
            <div className="turn-indicator">
              <span className="turn-icon">🎯</span>
              <div className="turn-info">
                <h3>
                  {gameStarted ? (
                    <>
                      VEZ DE: 
                      <span style={{ color: currentPlayer.color }}>
                        {currentPlayer.name}
                      </span>
                    </>
                  ) : (
                    '🎮 PRONTO PARA JOGAR'
                  )}
                </h3>
                {gameStarted && (
                  <div className="progress-container">
                    <div className="progress-bar">
                      <div 
                        className="progress-fill"
                        style={{ 
                          width: `${(currentPlayer.position / (boardCells.length - 1)) * 100}%`,
                          backgroundColor: currentPlayer.color
                        }}
                      ></div>
                    </div>
                    <div className="progress-text">
                      Casa {currentPlayer.position} de {boardCells.length - 1}
                      <span className="progress-percent">
                        ({Math.round((currentPlayer.position / (boardCells.length - 1)) * 100)}%)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {gameMessage && (
            <div className="game-message">
              <span className="message-icon">📢</span>
              <span className="message-text">{gameMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Game Area */}
      <div className="game-main">
        {/* Board Section */}
        <div className="board-section">
          <div className="board-header">
            <h3>🎲 Tabuleiro</h3>
            <div className="dice-display">
              {diceValue && (
                <span className="dice-result">Último dado: {diceValue}</span>
              )}
            </div>
          </div>
          
          <div className="board-wrapper">
            <div className="board">
              {boardCells.map((cell, index) => renderCell(cell, index))}
            </div>
          </div>

          {/* Legenda */}
          <div className="board-legend">
            <h4>📖 Legenda das Casas:</h4>
            <div className="legend-items">
              <div className="legend-item" title="Início do jogo">
                <span className="legend-icon">🏁</span>
                <span className="legend-text">Início</span>
              </div>
              <div className="legend-item" title="Responda perguntas sobre afoxés">
                <span className="legend-icon">❓</span>
                <span className="legend-text">Pergunta</span>
              </div>
              <div className="legend-item" title="Avance automaticamente">
                <span className="legend-icon">➡️</span>
                <span className="legend-text">Avança</span>
              </div>
              <div className="legend-item" title="Volte casas">
                <span className="legend-icon">⬅️</span>
                <span className="legend-text">Volta</span>
              </div>
              <div className="legend-item" title="Compartilhe um conselho">
                <span className="legend-icon">💡</span>
                <span className="legend-text">Atenção</span>
              </div>
              <div className="legend-item" title="Chegue aqui para vencer!">
                <span className="legend-icon">🎉</span>
                <span className="legend-text">Final</span>
              </div>
            </div>
          </div>
        </div>

        {/* Control Section */}
        <div className="control-section">
          {/* Dado */}
          <div className="dice-section">
            <Dice value={diceValue} onRoll={rollDice} disabled={!gameStarted} />
            
            {gameStarted && (
              <div className="turn-instruction">
                <p>🎯 <strong>{currentPlayer.name}</strong>, é sua vez!</p>
                <p className="instruction-sub">Clique no dado para rolar</p>
              </div>
            )}
          </div>

          {/* Jogadores */}
          <div className="players-section">
            <div className="section-header">
              <h3>👥 Jogadores</h3>
              <span className="player-count">{players.length} jogadores</span>
            </div>
            
            <div className="players-list">
              {players.map(player => (
                <div 
                  key={player.id} 
                  className={`player-card ${player.id === currentPlayer.id ? 'current-turn' : ''}`}
                >
                  <div className="player-card-header">
                    <div className="player-identity">
                      <div 
                        className="player-color-badge"
                        style={{ backgroundColor: player.color }}
                      >
                        <span className="player-number">{player.id}</span>
                      </div>
                      <div className="player-name-info">
                        <span className="player-name">
                          {formatPlayerName(player)}
                        </span>
                        {player.id === currentPlayer.id && (
                          <span className="current-badge">ATUAL</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="player-score-display">
                      <span className="score-icon">⭐</span>
                      <span className="score-value">{player.score} pts</span>
                    </div>
                  </div>
                  
                  <div className="player-card-details">
                    <div className="detail-item">
                      <span className="detail-label">Casa:</span>
                      <span className="detail-value">{player.position}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Posição:</span>
                      <span className="detail-value">
                        {player.position === 0 ? 'Início' : 
                         player.position >= boardCells.length - 1 ? 'Final' : 
                         `Casa ${player.position}`}
                      </span>
                    </div>
                  </div>
                  
                  <div className="player-progress">
                    <div className="position-bar">
                      <div 
                        className="position-fill"
                        style={{ 
                          width: `${(player.position / (boardCells.length - 1)) * 100}%`,
                          backgroundColor: player.color
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Histórico (opcional) */}
          {gameHistory.length > 0 && (
            <div className="history-section">
              <h4>📜 Últimas Ações</h4>
              <div className="history-list">
                {gameHistory.slice(0, 3).map((item, index) => (
                  <div key={index} className="history-item">
                    <span className="history-icon">
                      {item.type === 'start' ? '🚀' : 
                       item.type === 'move' ? '🎲' : '💬'}
                    </span>
                    <span className="history-text">{item.message}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Question Modal */}
      {showQuestion && currentQuestion && (
        <QuestionCard
          questionId={currentQuestion}
          onAnswer={handleAnswer}
          onClose={() => setShowQuestion(false)}
        />
      )}

      {/* Game Info Footer */}
      <div className="game-info-footer">
        <div className="info-item">
          <span className="info-icon">🎯</span>
          <span className="info-text">Objetivo: Chegue primeiro ao final!</span>
        </div>
        <div className="info-item">
          <span className="info-icon">📚</span>
          <span className="info-text">Aprenda sobre cultura afro-brasileira</span>
        </div>
        <div className="info-item">
          <span className="info-icon">⭐</span>
          <span className="info-text">Acertos: +10 pontos | Vencer: +50 pontos</span>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;