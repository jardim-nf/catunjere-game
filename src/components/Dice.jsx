import React, { useState } from 'react';
import '../styles/Dice.css';

const Dice = ({ value, onRoll, disabled = false }) => {
  const [rolling, setRolling] = useState(false);

  const handleRoll = () => {
    if (disabled || rolling) return;
    
    setRolling(true);
    onRoll();
    
    setTimeout(() => {
      setRolling(false);
    }, 600);
  };

  const renderDots = () => {
    const dotPositions = {
      1: ['center'],
      2: ['top-left', 'bottom-right'],
      3: ['top-left', 'center', 'bottom-right'],
      4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
      6: ['top-left', 'top-right', 'middle-left', 'middle-right', 'bottom-left', 'bottom-right']
    };

    return (dotPositions[value] || []).map((position, index) => (
      <div key={index} className={`dot ${position}`}></div>
    ));
  };

  return (
    <div className="dice-container">
      <div className={`dice ${rolling ? 'rolling' : ''}`}>
        {value && (
          <div className={`dice-face face-${value}`}>
            {renderDots()}
          </div>
        )}
      </div>
      
      <button 
        className={`roll-button ${disabled ? 'disabled' : ''} ${rolling ? 'rolling' : ''}`}
        onClick={handleRoll}
        disabled={disabled || rolling}
      >
        {rolling ? '🎲 Girando...' : '🎲 Lançar Dado'}
      </button>
      
      {value && !rolling && (
        <div className="dice-value">Valor: {value}</div>
      )}
    </div>
  );
};

export default Dice;