import { useEffect, useRef } from 'react';

export default function Starfield() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !canvas.getContext) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = canvas.getContext('2d');
    let stars = [];
    let embers = [];
    let w = 0;
    let h = 0;
    let frameId = null;
    let t = 0;

    function size() {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    }

    function makeStars() {
      const count = Math.round((w * h) / 9000);
      stars = [];
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.2 + 0.3,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.15 + 0.03,
        });
      }
    }

    function makeEmbers() {
      const count = Math.max(8, Math.round((w * h) / 90000));
      embers = [];
      for (let i = 0; i < count; i++) {
        embers.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.6 + 0.8,
          vy: Math.random() * 0.18 + 0.06,
          sway: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.01 + 0.004,
          swayAmp: Math.random() * 14 + 6,
          alpha: Math.random() * 0.35 + 0.25,
        });
      }
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      stars.forEach((s) => {
        ctx.globalAlpha = 0.35;
        ctx.fillStyle = '#F5F1E8';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    }

    function animate() {
      t += 1;
      ctx.clearRect(0, 0, w, h);

      stars.forEach((s) => {
        const twinkle = 0.35 + Math.sin(t * s.speed + s.phase) * 0.25;
        ctx.globalAlpha = Math.max(0, twinkle);
        ctx.fillStyle = '#F5F1E8';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.shadowBlur = 6;
      ctx.shadowColor = 'rgba(200, 16, 46, 0.6)';
      embers.forEach((e) => {
        e.y -= e.vy;
        if (e.y < -10) {
          e.y = h + 10;
          e.x = Math.random() * w;
        }
        const drift = Math.sin(t * e.swaySpeed + e.sway) * e.swayAmp * 0.02;
        e.x += drift;

        ctx.globalAlpha = e.alpha;
        ctx.fillStyle = '#E0693E';
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      ctx.globalAlpha = 1;

      frameId = requestAnimationFrame(animate);
    }

    function handleResize() {
      size();
      makeStars();
      makeEmbers();
      if (reduceMotion) drawStatic();
    }

    size();
    makeStars();
    makeEmbers();

    if (reduceMotion) {
      drawStatic();
    } else {
      frameId = requestAnimationFrame(animate);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas className="site-stars" ref={canvasRef} aria-hidden="true" />;
}
