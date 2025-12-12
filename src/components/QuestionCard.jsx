import React, { useState, useEffect, useRef } from 'react';
import './QuestionCard.css';
import Confetti from './Confetti'; // Importando o confetti

const QuestionCard = ({ questionData, onAnswer, onClose }) => {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [animationStage, setAnimationStage] = useState('idle');
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  
  const audioRef = useRef(null);

  // Efeitos sonoros
  const playSound = (soundType) => {
    // Usando áudio sintético simples para evitar carregar MP3s externos que podem não existir
    if (!window.AudioContext) return;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    if (soundType === 'correct') {
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1000, ctx.currentTime + 0.1);
    } else if (soundType === 'wrong') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
    } else {
      osc.frequency.setValueAtTime(400, ctx.currentTime);
    }
    
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  };

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!questionData) return null;

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const textToRead = `${questionData.title}. ${questionData.text}. Opções: ${questionData.options.join(', ')}.`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = 'pt-BR';
    utterance.rate = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSelect = (index) => {
    if (answered) return;
    setSelectedAnswerIndex(index);
    setAnimationStage('selected');
    playSound('select');
  };

  const handleSubmit = () => {
    if (selectedAnswerIndex === null) return;
    
    setAnimationStage('feedback');
    playSound('reveal');
    
    setTimeout(() => {
      const isCorrect = selectedAnswerIndex === questionData.correctAnswer;
      setAnswered(true);
      
      if (isCorrect) {
        setAnimationStage('correct');
        setShowConfetti(true); // Ativa o componente via estado
        setShowFireworks(true);
        playSound('correct');
      } else {
        setAnimationStage('wrong');
        playSound('wrong');
      }
      
      setTimeout(() => {
        window.speechSynthesis.cancel();
        onAnswer(isCorrect);
      }, 3500);
    }, 800);
  };

  const TypewriterEffect = ({ text, speed = 30 }) => {
    const [displayText, setDisplayText] = useState('');
    useEffect(() => {
      let i = 0;
      const timer = setInterval(() => {
        if (i <= text.length) {
          setDisplayText(text.substring(0, i));
          i++;
        } else {
          clearInterval(timer);
        }
      }, speed);
      return () => clearInterval(timer);
    }, [text, speed]);
    return <span>{displayText}</span>;
  };

  return (
    <>
      <audio ref={audioRef} />
      {/* Aqui usamos o componente Confetti controlado pelo estado, não por ref */}
      <Confetti start={showConfetti} />
      
      <div className="question-overlay">
        <div className="question-card">
          {showFireworks && (
            <div className="fireworks-container">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`firework f${i % 5}`}></div>
              ))}
            </div>
          )}
          
          <div className="question-header">
            <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
              <h3>🎯 {questionData.title}</h3>
              <button 
                className={`audio-btn ${isSpeaking ? 'speaking' : ''}`} 
                onClick={handleSpeak}
                title="Ler pergunta"
              >
                {isSpeaking ? '🔇' : '🔊'}
              </button>
            </div>
            {!answered && <button className="close-btn" onClick={onClose}>×</button>}
          </div>
          
          <div className="question-content">
            <p className="question-text">
              {animationStage === 'feedback' ? <TypewriterEffect text={questionData.text} /> : questionData.text}
            </p>
            
            <div className="options-grid">
              {questionData.options.map((option, index) => {
                let btnClass = 'option-btn';
                if (animationStage === 'selected' && selectedAnswerIndex === index) btnClass += ' selected pulse';
                if (animationStage === 'feedback' && selectedAnswerIndex === index) btnClass += ' checking';
                if (answered) {
                  if (index === questionData.correctAnswer) btnClass += ' correct';
                  else if (index === selectedAnswerIndex) btnClass += ' wrong';
                }

                return (
                  <button
                    key={index}
                    className={btnClass}
                    onClick={() => handleSelect(index)}
                    disabled={answered || animationStage === 'feedback'}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">{option}</span>
                  </button>
                );
              })}
            </div>
            
            {answered && (
              <div className={`answer-feedback ${animationStage}`}>
                {selectedAnswerIndex === questionData.correctAnswer ? (
                  <div className="correct-answer">
                    <h4>🎉 PARABÉNS! +10 pontos</h4>
                    <p>Você avançará 1 casa!</p>
                  </div>
                ) : (
                  <div className="wrong-answer">
                    <h4>📝 Resposta Incorreta (-2 casas)</h4>
                    <p>Correta: <b>{questionData.options[questionData.correctAnswer]}</b></p>
                    <p><i>{questionData.explanation}</i></p>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!answered && animationStage !== 'feedback' && (
            <div className="question-actions">
              <button 
                className={`submit-btn ${selectedAnswerIndex !== null ? 'active' : ''}`} 
                onClick={handleSubmit} 
                disabled={selectedAnswerIndex === null}
              >
                Confirmar Resposta
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuestionCard;