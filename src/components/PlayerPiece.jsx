import React from 'react';

const PlayerPiece = ({ player, isCurrent }) => {
  return (
    <div 
      className="player-piece"
      style={{ 
        backgroundColor: player.color,
        border: isCurrent ? '3px solid #000' : '2px solid #fff',
        transform: isCurrent ? 'scale(1.1)' : 'scale(1)'
      }}
      title={`${player.name} - Casa ${player.position}`}
    >
      <span className="player-id">{player.id}</span>
    </div>
  );
};

export default PlayerPiece;