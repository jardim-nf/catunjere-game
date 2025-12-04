import React from 'react';
import './PlayerPiece.css';

const PlayerPiece = ({ player, isCurrent }) => {
  return (
    <div 
      className={`player-piece ${isCurrent ? 'current' : ''}`}
      style={{ backgroundColor: player.color }}
      title={`${player.name} - Casa ${player.position} | ${player.score} pontos`}
    >
      <div className="piece-content">
        <span className="player-number">{player.id}</span>
        {isCurrent && <div className="active-ring"></div>}
      </div>
      {isCurrent && <div className="glow-effect"></div>}
    </div>
  );
};

export default PlayerPiece;