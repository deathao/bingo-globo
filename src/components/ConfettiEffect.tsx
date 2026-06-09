import React, { useEffect, useRef } from 'react';

type Props = {
  active: boolean;
  onComplete?: () => void;
};

interface ConfettiParticle {
  x: number;
  y: number;
  r: number;
  d: number;
  color: string;
  tilt: number;
  tiltAngleIncremental: number;
  tiltAngle: number;
}

const colors = [
  '#f59e0b', '#3b82f6', '#10b981', '#ef4444', 
  '#ec4899', '#8b5cf6', '#06b6d4', '#f43f5e'
];

export const ConfettiEffect = ({ active, onComplete }: Props) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameId = useRef<number | null>(null);
  const particles = useRef<ConfettiParticle[]>([]);
  const activeState = useRef(active);

  useEffect(() => {
    activeState.current = active;
    if (active) {
      initConfetti();
    } else {
      stopConfetti();
    }
    return () => stopConfetti();
  }, [active]);

  const initConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    particles.current = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height - canvas.height,
      r: Math.random() * 6 + 4,
      d: Math.random() * 2 + 1, // Density / weight
      color: colors[Math.floor(Math.random() * colors.length)],
      tilt: Math.random() * 10 - 5,
      tiltAngleIncremental: Math.random() * 0.07 + 0.02,
      tiltAngle: 0
    }));

    const startTime = Date.now();

    const draw = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx || !canvas) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let activeParticles = 0;

      particles.current.forEach((p) => {
        p.tiltAngle += p.tiltAngleIncremental;
        p.y += (Math.cos(p.tiltAngle) + 3 + p.r / 2) / 2 * p.d;
        p.x += Math.sin(p.tiltAngle);
        p.tilt = Math.sin(p.tiltAngle - p.r / 3) * 15;

        // Re-wrap falling particles to the top for 4 seconds, then let them fall off
        if (p.y < canvas.height + 20) {
          activeParticles++;
        } else if (Date.now() - startTime < 4200) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
          activeParticles++;
        }

        ctx.beginPath();
        ctx.lineWidth = p.r;
        ctx.strokeStyle = p.color;
        ctx.moveTo(p.x + p.tilt + p.r / 2, p.y);
        ctx.lineTo(p.x + p.tilt, p.y + p.tilt + p.r / 2);
        ctx.stroke();
      });

      // Handle window resizing
      if (canvas.width !== window.innerWidth || canvas.height !== window.innerHeight) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }

      if (activeParticles > 0 && activeState.current) {
        animFrameId.current = requestAnimationFrame(draw);
      } else {
        stopConfetti();
        if (onComplete) onComplete();
      }
    };

    draw();
  };

  const stopConfetti = () => {
    if (animFrameId.current) {
      cancelAnimationFrame(animFrameId.current);
      animFrameId.current = null;
    }
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  if (!active) return null;

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 99999
      }}
    />
  );
};

export default ConfettiEffect;
