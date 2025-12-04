import React, { useState } from 'react';
import GameBoard from './components/GameBoard';
import './styles/App.css';

function App() {
  const [showRules, setShowRules] = useState(false);

  return (
    <div className="App">
      <header>
        <h1>🎲 CATUNJERÊ - Jogo dos Afoxés 🎵</h1>
        <div className="header-controls">
          <button 
            className="rules-btn" 
            onClick={() => setShowRules(!showRules)}
          >
            {showRules ? '▶️ Voltar ao Jogo' : '📜 Ver Regras'}
          </button>
        </div>
      </header>
      
      <main>
        {showRules ? (
          <div className="rules-container">
            <h2>📖 Regras do Jogo Catunjerê</h2>
            
            <div className="rules-content">
              <section className="rule-section">
                <h3>🎯 Objetivo</h3>
                <p>Ser o primeiro jogador a chegar ao final do tabuleiro, respondendo perguntas sobre afoxés e cultura afro-brasileira.</p>
              </section>

              <section className="rule-section">
                <h3>👥 Como Jogar</h3>
                <ol>
                  <li>Cada jogador escolhe uma cor</li>
                  <li>Jogue o dado para definir a ordem</li>
                  <li>Na sua vez, role o dado e mova seu pino</li>
                  <li>Obedeça a instrução da casa onde parar</li>
                  <li>O primeiro a chegar na casa final vence!</li>
                </ol>
              </section>

              <section className="rule-section">
                <h3>🏠 Tipos de Casas</h3>
                <div className="house-types">
                  <div className="house-type">
                    <span className="house-icon">❓</span>
                    <div>
                      <strong>Casa "Responda"</strong>
                      <p>Responda uma pergunta sobre afoxés. Acertou? Avança 1 casa. Errou? Volta 2 casas.</p>
                    </div>
                  </div>
                  
                  <div className="house-type">
                    <span className="house-icon">➡️</span>
                    <div>
                      <strong>Casa "Avança"</strong>
                      <p>Avança automaticamente algumas casas!</p>
                    </div>
                  </div>
                  
                  <div className="house-type">
                    <span className="house-icon">⬅️</span>
                    <div>
                      <strong>Casa "Volte"</strong>
                      <p>Volta algumas casas.</p>
                    </div>
                  </div>
                  
                  <div className="house-type">
                    <span className="house-icon">⚠️</span>
                    <div>
                      <strong>Casa "Atenção"</strong>
                      <p>Compartilhe um conselho sobre cultura afro-brasileira.</p>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rule-section">
                <h3>🏆 Sistema de Pontos</h3>
                <ul>
                  <li>Acertar pergunta: +10 pontos</li>
                  <li>Chegar primeiro: +50 pontos</li>
                  <li>Chegar segundo: +30 pontos</li>
                  <li>Chegar terceiro: +20 pontos</li>
                </ul>
              </section>
            </div>
          </div>
        ) : (
          <GameBoard />
        )}
      </main>
      
      <footer>
        <p>🎵 Jogo educativo sobre cultura afro-brasileira e afoxés • Desenvolvido para aprendizado 🎮</p>
      </footer>
    </div>
  );
}

export default App;