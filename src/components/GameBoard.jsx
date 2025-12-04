import React, { useState, useEffect } from 'react';
import '../styles/GameBoard.css';
import Dice from './Dice';
import PlayerPiece from './PlayerPiece';
import QuestionCard from './QuestionCard';
import { boardCells } from '../data/boardData';
import { questions } from '../data/questions';

const GameBoard = () => {
  const [players, setPlayers] = useState([
    { id: 1, name: 'Jogador 1', color: '#FF6B6B', position: 0, score: 0 },
    { id: 2, name: 'Jogador 2', color: '#4ECDC4', position: 0, score: 0 },
    { id: 3, name: 'Jogador 3', color: '#FFD166', position: 0, score: 0 },
    { id: 4, name: 'Jogador 4', color: '#06D6A0', position: 0, score: 0 }
  ]);
  
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [diceValue, setDiceValue] = useState(null);
  const [showQuestion, setShowQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [gameMessage, setGameMessage] = useState('');
  const [gameStarted, setGameStarted] = useState(false);

  // Iniciar jogo
  const startGame = () => {
    const newPlayers = players.map(player => ({
      ...player,
      position: 0,
      score: 0
    }));
    setPlayers(newPlayers);
    setCurrentPlayer(0);
    setGameStarted(true);
    setGameMessage('Jogo iniciado! Jogador 1 começa.');
  };

  // Rolar dado
  const rollDice = () => {
    if (!gameStarted) {
      setGameMessage('Inicie o jogo primeiro!');
      return;
    }
    
    const value = Math.floor(Math.random() * 6) + 1;
    setDiceValue(value);
    
    const newPlayers = [...players];
    const player = newPlayers[currentPlayer];
    
    // Calcula nova posição
    const newPosition = player.position + value;
    
    // Verifica se chegou ao final
    if (newPosition >= boardCells.length - 1) {
      player.position = boardCells.length - 1;
      setGameMessage(`${player.name} venceu o jogo! 🎉`);
      setGameStarted(false);
      setPlayers(newPlayers);
      return;
    }
    
    player.position = newPosition;
    const cell = boardCells[newPosition];
    
    // Verifica tipo da casa
    if (cell.type === 'question') {
      setCurrentQuestion(cell.questionId);
      setShowQuestion(true);
      setGameMessage(`${player.name} caiu em uma casa de pergunta!`);
    } else if (cell.type === 'move-back') {
      player.position = Math.max(0, player.position - cell.steps);
      setGameMessage(`${player.name} volta ${cell.steps} casas!`);
      passTurn();
    } else if (cell.type === 'move-forward') {
      player.position = Math.min(boardCells.length - 1, player.position + cell.steps);
      setGameMessage(`${player.name} avança ${cell.steps} casas!`);
      passTurn();
    } else if (cell.type === 'attention') {
      setGameMessage(`ATENÇÃO ${player.name}: ${cell.message}`);
      passTurn();
    } else {
      passTurn();
    }
    
    setPlayers(newPlayers);
  };

  const passTurn = () => {
    setCurrentPlayer((prev) => (prev + 1) % players.length);
  };

  const handleAnswer = (isCorrect) => {
    const newPlayers = [...players];
    const player = newPlayers[currentPlayer];
    
    if (isCorrect) {
      player.position = Math.min(boardCells.length - 1, player.position + 1);
      player.score += 10;
      setGameMessage(`✅ ${player.name} acertou! Avança 1 casa e ganha 10 pontos.`);
    } else {
      player.position = Math.max(0, player.position - 2);
      setGameMessage(`❌ ${player.name} errou! Volta 2 casas.`);
    }
    
    setPlayers(newPlayers);
    setShowQuestion(false);
    passTurn();
  };

  const renderCell = (cell, index) => {
    const cellType = cell.type;
    const cellLabel = cell.label || '';
    
    return (
      <div key={cell.id} className={`cell ${cellType}`}>
        <div className="cell-number">{index}</div>
        <div className="cell-content">
          {cellType === 'start' && '🏁'}
          {cellType === 'finish' && '🎉'}
          {cellType === 'question' && '❓'}
          {cellType === 'move-back' && '⬅️'}
          {cellType === 'move-forward' && '➡️'}
          {cellType === 'attention' && '⚠️'}
        </div>
        <div className="cell-label">{cellLabel}</div>
        
        {/* Renderizar peças dos jogadores nesta casa */}
        {players.map(player => 
          player.position === index && (
            <PlayerPiece
              key={player.id}
              player={player}
              isCurrent={player.id === players[currentPlayer].id}
            />
          )
        )}
      </div>
    );
  };

  return (
    <div className="game-board-container">
      <div className="game-header">
        <h2>🎮 CATUNJERÊ - Tabuleiro</h2>
        <div className="game-controls">
          {!gameStarted ? (
            <button className="start-btn" onClick={startGame}>
              ▶️ Iniciar Jogo
            </button>
          ) : (
            <button className="restart-btn" onClick={startGame}>
              🔄 Reiniciar
            </button>
          )}
        </div>
      </div>

      <div className="game-status">
        <div className="current-turn">
          <h3>
            {gameStarted ? (
              <>Vez de: <span style={{ color: players[currentPlayer].color }}>
                {players[currentPlayer].name}
              </span></>
            ) : 'Jogo não iniciado'}
          </h3>
        </div>
        
        {gameMessage && (
          <div className="game-message">
            📢 {gameMessage}
          </div>
        )}
      </div>

      <div className="game-main">
        <div className="board-section">
          <div className="board">
            {boardCells.map((cell, index) => renderCell(cell, index))}
          </div>
        </div>

        <div className="control-section">
          <Dice value={diceValue} onRoll={rollDice} disabled={!gameStarted} />
          
          <div className="players-info">
            <h3>🏆 Jogadores</h3>
            {players.map(player => (
              <div 
                key={player.id} 
                className={`player-info ${player.id === players[currentPlayer].id ? 'current' : ''}`}
              >
                <div className="player-header">
                  <div 
                    className="player-color" 
                    style={{ backgroundColor: player.color }}
                  ></div>
                  <span className="player-name">{player.name}</span>
                  {player.id === players[currentPlayer].id && (
                    <span className="current-indicator">🎯</span>
                  )}
                </div>
                <div className="player-details">
                  <span>Casa: {player.position}</span>
                  <span>Pontos: {player.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showQuestion && currentQuestion && (
        <QuestionCard
          questionId={currentQuestion}
          onAnswer={handleAnswer}
          onClose={() => setShowQuestion(false)}
        />
      )}
    </div>
  );
};

export default GameBoard;