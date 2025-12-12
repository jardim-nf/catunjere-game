import React, { useEffect, useRef } from 'react';

const Confetti = ({ start }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    if (!start) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Ajustar canvas para tamanho da tela
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const confettiParticles = [];
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#88ff00'];
    
    // Criar partículas
    for (let i = 0; i < 150; i++) {
      confettiParticles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        r: Math.random() * 10 + 5,
        d: Math.random() * 20 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        tilt: Math.random() * 10 - 10,
        tiltAngleIncrement: Math.random() * 0.05 + 0.05,
        tiltAngle: 0,
        speed: Math.random() * 3 + 3
      });
    }
    
    let animationFrameId;
    
    const drawConfetti = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      confettiParticles.forEach((p, i) => {
        ctx.beginPath();
        ctx.lineWidth = p.r / 2;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 4, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 4);
        ctx.stroke();
        
        p.tiltAngle += p.tiltAngleIncrement;
        p.y += (Math.cos(p.d) + 3 + p.r / 2) / 2;
        p.x += Math.sin(p.d);
        p.tilt = Math.sin(p.tiltAngle) * 15;
        
        // Reset particle if it falls out of view
        if (p.y > canvas.height) {
          confettiParticles[i] = {
            x: Math.random() * canvas.width,
            y: -20,
            r: p.r,
            d: p.d,
            color: p.color,
            tilt: p.tilt,
            tiltAngleIncrement: p.tiltAngleIncrement,
            tiltAngle: p.tiltAngle,
            speed: p.speed
          };
        }
      });
      
      animationFrameId = requestAnimationFrame(drawConfetti);
    };
    
    drawConfetti();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [start]);
  
  if (!start) return null;
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
};

export default Confetti;