import React, { useState, useEffect, useRef } from 'react';
import './QuestionCard.css'; // Vamos criar este CSS

const QuestionCard = ({ questionData, onAnswer, onClose }) => {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [animationStage, setAnimationStage] = useState('idle'); // idle → selected → feedback → result
  const [showConfetti, setShowConfetti] = useState(false);
  const [showFireworks, setShowFireworks] = useState(false);
  
  const confettiRef = useRef(null);
  const audioRef = useRef(null);

  // Efeitos sonoros
  const playSound = (soundType) => {
    const sounds = {
      correct: '/sounds/correct.mp3',
      wrong: '/sounds/wrong.mp3',
      select: '/sounds/select.mp3',
      reveal: '/sounds/reveal.mp3'
    };
    
    // Fallback para sons base se não tiver arquivos
    if (audioRef.current) {
      audioRef.current.src = sounds[soundType] || '';
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(e => console.log("Audio error:", e));
    }
  };

  // Função para parar o áudio se fechar o card
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
      if (confettiRef.current) {
        confettiRef.current.stop();
      }
    };
  }, []);

  if (!questionData) return null;

  // --- FUNÇÃO DE FALAR (TTS) ---
  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = `${questionData.title}. ${questionData.text}. Opção A: ${questionData.options[0]}. Opção B: ${questionData.options[1]}. Opção C: ${questionData.options[2]}. Opção D: ${questionData.options[3]}.`;
    
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
    
    // Efeito visual de seleção
    const optionBtn = document.querySelectorAll('.option-btn')[index];
    if (optionBtn) {
      optionBtn.classList.add('pulse');
      setTimeout(() => optionBtn.classList.remove('pulse'), 300);
    }
  };

  const handleSubmit = () => {
    if (selectedAnswerIndex === null) return;
    
    setAnimationStage('feedback');
    playSound('reveal');
    
    // Pequeno delay antes de mostrar o resultado
    setTimeout(() => {
      const isCorrect = selectedAnswerIndex === questionData.correctAnswer;
      setAnswered(true);
      
      if (isCorrect) {
        setAnimationStage('correct');
        setShowConfetti(true);
        setShowFireworks(true);
        playSound('correct');
        
        // Iniciar confetti
        if (confettiRef.current) {
          confettiRef.current.start();
        }
      } else {
        setAnimationStage('wrong');
        playSound('wrong');
      }
      
      // Delay antes de chamar onAnswer
      setTimeout(() => {
        window.speechSynthesis.cancel();
        onAnswer(isCorrect);
      }, 2500); // Aumentado para dar tempo das animações
    }, 800);
  };

  // Função para animação de digitação
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
      {/* Audio element para efeitos sonoros */}
      <audio ref={audioRef} preload="auto" />
      
      {/* Confetti Canvas */}
      {showConfetti && (
        <canvas 
          ref={confettiRef}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 9998
          }}
        />
      )}
      
      <div className="question-overlay">
        <div className="question-card">
          {/* Fireworks background para resposta correta */}
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
              
              {/* BOTÃO DE ÁUDIO */}
              <button 
                className={`audio-btn ${isSpeaking ? 'speaking' : ''}`} 
                onClick={handleSpeak}
                title="Ler pergunta em voz alta"
              >
                {isSpeaking ? 'Hz' : '🔊'}
              </button>
            </div>

            {!answered && <button className="close-btn" onClick={onClose}>×</button>}
          </div>
          
          <div className="question-content">
            <p className="question-text">
              {animationStage === 'feedback' ? (
                <TypewriterEffect text={questionData.text} />
              ) : (
                questionData.text
              )}
            </p>
            
            {/* Indicador de progresso durante feedback */}
            {animationStage === 'feedback' && (
              <div className="feedback-loading">
                <div className="loading-bar">
                  <div className="loading-progress"></div>
                </div>
                <p className="loading-text">Analisando resposta...</p>
              </div>
            )}
            
            <div className="options-grid">
              {questionData.options.map((option, index) => {
                let btnClass = 'option-btn';
                
                // Estados de animação
                if (animationStage === 'selected' && selectedAnswerIndex === index) {
                  btnClass += ' selected pulse';
                }
                
                if (animationStage === 'feedback' && selectedAnswerIndex === index) {
                  btnClass += ' checking';
                }
                
                if (answered) {
                  if (index === questionData.correctAnswer) {
                    btnClass += ' correct';
                    if (animationStage === 'correct') {
                      btnClass += ' correct-reveal';
                    }
                  }
                  else if (index === selectedAnswerIndex) {
                    btnClass += ' wrong';
                    if (animationStage === 'wrong') {
                      btnClass += ' wrong-reveal';
                    }
                  }
                }

                return (
                  <button
                    key={index}
                    className={btnClass}
                    onClick={() => handleSelect(index)}
                    disabled={answered || animationStage === 'feedback'}
                    data-option={String.fromCharCode(65 + index)}
                  >
                    <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                    <span className="option-text">
                      {animationStage === 'feedback' && selectedAnswerIndex === index ? (
                        <TypewriterEffect text={option} speed={40} />
                      ) : (
                        option
                      )}
                    </span>
                    
                    {/* Ícones animados */}
                    {answered && index === questionData.correctAnswer && (
                      <span className="correct-icon">
                        <div className="checkmark"></div>
                      </span>
                    )}
                    {answered && index === selectedAnswerIndex && index !== questionData.correctAnswer && (
                      <span className="wrong-icon">
                        <div className="cross"></div>
                      </span>
                    )}
                    
                    {/* Efeito de brilho para resposta correta */}
                    {answered && index === questionData.correctAnswer && (
                      <div className="correct-glow"></div>
                    )}
                  </button>
                );
              })}
            </div>
            
            {/* Feedback expandido */}
            {answered && (
              <div className={`answer-feedback ${animationStage}`}>
                {selectedAnswerIndex === questionData.correctAnswer ? (
                  <div className="correct-answer">
                    <div className="celebration-header">
                      <h4>
                        <span className="celebrate-icon">🎉</span>
                        <span className="celebrate-text">PARABÉNS!</span>
                        <span className="celebrate-icon">🎉</span>
                      </h4>
                      <div className="score-badge">+10 pontos</div>
                    </div>
                    
                    <div className="success-message">
                      <p className="success-title">Resposta Correta!</p>
                      <div className="success-details">
                        <div className="detail-item">
                          <span className="detail-icon">🏆</span>
                          <span className="detail-text">Você avançará 1 casa!</span>
                        </div>
                        <div className="detail-item">
                          <span className="detail-icon">⭐</span>
                          <span className="detail-text">Continue assim!</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Indicador de progresso de pontos */}
                    <div className="score-progress">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{width: '100%'}}></div>
                      </div>
                      <div className="progress-text">+10 pontos adicionados</div>
                    </div>
                  </div>
                ) : (
                  <div className="wrong-answer">
                    <div className="incorrect-header">
                      <h4>
                        <span className="incorrect-icon">📝</span>
                        <span className="incorrect-text">QUASE LÁ!</span>
                      </h4>
                      <div className="penalty-badge">-2 casas</div>
                    </div>
                    
                    <div className="incorrect-message">
                      <p className="incorrect-title">Resposta Incorreta</p>
                      <div className="correct-option">
                        <span className="correct-label">Resposta correta:</span>
                        <div className="correct-option-display">
                          <span className="correct-letter">{String.fromCharCode(65 + questionData.correctAnswer)}</span>
                          <span className="correct-text">{questionData.options[questionData.correctAnswer]}</span>
                        </div>
                      </div>
                      
                      {questionData.explanation && (
                        <div className="explanation-box">
                          <span className="explanation-icon">💡</span>
                          <span className="explanation-text">{questionData.explanation}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Mensagem motivacional */}
                    <div className="encouragement">
                      <span className="encouragement-icon">💪</span>
                      <span className="encouragement-text">Não desanime! Continue tentando!</span>
                    </div>
                  </div>
                )}
                
                {/* Contador para próxima ação */}
                <div className="next-action-timer">
                  <div className="timer-circle">
                    <div className="timer-fill"></div>
                    <span className="timer-text">2s</span>
                  </div>
                  <p className="timer-message">Continuando em breve...</p>
                </div>
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
                {selectedAnswerIndex === null ? (
                  'Selecione uma resposta'
                ) : (
                  <>
                    <span className="submit-icon">✉️</span>
                    <span className="submit-text">Enviar Resposta</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          {animationStage === 'feedback' && (
            <div className="verification-animation">
              <div className="verification-spinner"></div>
              <p className="verification-text">Verificando sua resposta...</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default QuestionCard;