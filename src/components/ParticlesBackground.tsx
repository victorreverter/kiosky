import { useRef, useEffect, useCallback } from "react";

const GRID = 18;
const RADIUS = 90;
const DOT_R = 1;
const ACTIVE_R = 3;

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  strength: number;
}

export function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -500, y: -500 });
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef(0);

  const initParticles = useCallback(() => {
    const w = window.innerWidth;
    const h = document.body.scrollHeight;
    const cols = Math.ceil(w / GRID) + 1;
    const rows = Math.ceil(h / GRID) + 1;
    const particles: Particle[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * GRID + GRID / 2;
        const y = r * GRID + GRID / 2;
        particles.push({ x, y, baseX: x, baseY: y, strength: 0 });
      }
    }
    particlesRef.current = particles;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = Math.max(document.body.scrollHeight, window.innerHeight);
    };
    resize();
    initParticles();
    window.addEventListener("resize", () => {
      resize();
      initParticles();
    });

    const handleMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -500, y: -500 };
      for (const p of particlesRef.current) {
        p.strength = 0;
        p.x = p.baseX;
        p.y = p.baseY;
      }
    };

    window.addEventListener("mousemove", handleMouse);
    document.addEventListener("mouseleave", handleMouseLeave);

    const draw = () => {
      if (canvas.height < document.body.scrollHeight) {
        resize();
        initParticles();
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const { x: mx, y: my } = mouseRef.current;
      const isDark = document.documentElement.classList.contains("dark");
      const neutralColor = isDark ? "rgba(100,100,105,0.35)" : "rgba(180,180,185,0.4)";

      for (const p of particlesRef.current) {
        const dx = mx - p.baseX;
        const dy = my - p.baseY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const target = dist < RADIUS ? 1 - dist / RADIUS : 0;
        p.strength += (target - p.strength) * 0.12;

        const pushX = dist > 0 && dist < RADIUS ? ((dx / dist) * (RADIUS - dist) * 0.15 * p.strength) : 0;
        const pushY = dist > 0 && dist < RADIUS ? ((dy / dist) * (RADIUS - dist) * 0.15 * p.strength) : 0;
        p.x = p.baseX + pushX;
        p.y = p.baseY + pushY;

        if (p.strength > 0.02) {
          const r = DOT_R + (ACTIVE_R - DOT_R) * p.strength;
          const alpha = 0.25 + p.strength * 0.55;
          ctx.beginPath();
          ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(238,98,84,${alpha})`;
          ctx.fill();
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, DOT_R, 0, Math.PI * 2);
          ctx.fillStyle = neutralColor;
          ctx.fill();
        }
      }
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("mousemove", handleMouse);
      document.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", resize);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
