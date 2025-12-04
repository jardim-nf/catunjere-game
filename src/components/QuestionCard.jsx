import React, { useState } from 'react';
import { questions } from '../data/questions';

const QuestionCard = ({ questionId, onAnswer, onClose }) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answered, setAnswered] = useState(false);
  
  const question = questions.find(q => q.id === questionId);
  
  if (!question) {
    return (
      <div className="question-overlay">
        <div className="question-card">
          <h3>⚠️ Pergunta não encontrada</h3>
          <button onClick={onClose}>Fechar</button>
        </div>
      </div>
    );
  }

  const handleSubmit = () => {
    if (selectedAnswer === null) return;
    
    const isCorrect = selectedAnswer === question.answer;
    setAnswered(true);
    
    setTimeout(() => {
      onAnswer(isCorrect);
    }, 1500);
  };

  return (
    <div className="question-overlay">
      <div className="question-card">
        <div className="question-header">
          <h3>🎯 Pergunta - Casa {questionId}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
        
        <div className="question-content">
          <p className="question-text">{question.text}</p>
          
          <div className="options-grid">
            {question.options.map((option, index) => (
              <button
                key={index}
                className={`option-btn ${
                  selectedAnswer === option ? 'selected' : ''
                } ${
                  answered 
                    ? option === question.answer 
                      ? 'correct' 
                      : option === selectedAnswer 
                        ? 'wrong' 
                        : ''
                    : ''
                }`}
                onClick={() => !answered && setSelectedAnswer(option)}
                disabled={answered}
              >
                <span className="option-letter">{String.fromCharCode(65 + index)}</span>
                <span className="option-text">{option}</span>
                
                {answered && option === question.answer && (
                  <span className="correct-icon">✅</span>
                )}
                {answered && option === selectedAnswer && option !== question.answer && (
                  <span className="wrong-icon">❌</span>
                )}
              </button>
            ))}
          </div>
          
          {answered && (
            <div className="answer-feedback">
              {selectedAnswer === question.answer ? (
                <div className="correct-answer">
                  <h4>🎉 Resposta Correta!</h4>
                  <p>Você avança 1 casa!</p>
                </div>
              ) : (
                <div className="wrong-answer">
                  <h4>📝 Resposta Incorreta</h4>
                  <p>Resposta correta: <strong>{question.answer}</strong></p>
                  <p>Você volta 2 casas.</p>
                </div>
              )}
            </div>
          )}
        </div>
        
        {!answered && (
          <div className="question-actions">
            <button 
              className="submit-btn"
              onClick={handleSubmit}
              disabled={selectedAnswer === null}
            >
              Responder
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionCard;