import { useCallback, useEffect, useRef } from 'react';
import type { Football, GameState, Position } from '../types/game';

interface GameCanvasProps {
  state: GameState;
  onDragStart: (pos: Position) => void;
  onDragMove: (pos: Position) => void;
  onDragEnd: () => void;
  simulate: () => void;
}

function drawDeskBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Warm wood desk gradient
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, '#d4944f');
  grad.addColorStop(0.3, '#c4874d');
  grad.addColorStop(0.6, '#b87a42');
  grad.addColorStop(1, '#a06930');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // Wood grain lines
  ctx.strokeStyle = 'rgba(139, 94, 52, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 25; i++) {
    ctx.beginPath();
    const y = (h / 25) * i + Math.sin(i * 0.7) * 8;
    ctx.moveTo(0, y);
    for (let x = 0; x < w; x += 20) {
      ctx.lineTo(x, y + Math.sin(x * 0.01 + i) * 3);
    }
    ctx.stroke();
  }

  // Desk doodles (faint)
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 1.5;

  // Star doodle
  drawStar(ctx, w * 0.7, h * 0.4, 20, 5);
  drawStar(ctx, w * 0.25, h * 0.55, 15, 5);

  // Circle doodle
  ctx.beginPath();
  ctx.arc(w * 0.3, h * 0.35, 18, 0, Math.PI * 2);
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, points: number) {
  ctx.beginPath();
  for (let i = 0; i <= points * 2; i++) {
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const radius = i % 2 === 0 ? r : r * 0.4;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

function drawFieldLines(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;

  // Yard lines
  for (let i = 1; i < 10; i++) {
    const y = h * (i / 10);
    ctx.beginPath();
    ctx.setLineDash([8, 8]);
    ctx.moveTo(w * 0.1, y);
    ctx.lineTo(w * 0.9, y);
    ctx.stroke();
  }
  ctx.setLineDash([]);

  // Side boundaries
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.05, h * 0.05);
  ctx.lineTo(w * 0.05, h * 0.95);
  ctx.moveTo(w * 0.95, h * 0.05);
  ctx.lineTo(w * 0.95, h * 0.95);
  ctx.stroke();
}

function drawGoalPosts(ctx: CanvasRenderingContext2D, w: number, h: number) {
  const goalY = h * 0.12;
  const leftX = w * 0.3;
  const rightX = w * 0.7;

  // Goal post hands - stylized
  ctx.save();

  // Left hand
  drawHand(ctx, leftX, goalY, false);
  // Right hand
  drawHand(ctx, rightX, goalY, true);

  // Glow between posts
  const glowGrad = ctx.createLinearGradient(leftX, goalY - 30, rightX, goalY - 30);
  glowGrad.addColorStop(0, 'rgba(255, 215, 0, 0)');
  glowGrad.addColorStop(0.5, 'rgba(255, 215, 0, 0.05)');
  glowGrad.addColorStop(1, 'rgba(255, 215, 0, 0)');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(leftX, goalY - 60, rightX - leftX, 60);

  ctx.restore();
}

function drawHand(ctx: CanvasRenderingContext2D, x: number, y: number, mirrored: boolean) {
  ctx.save();
  ctx.translate(x, y);
  if (mirrored) ctx.scale(-1, 1);

  const scale = 0.6;
  ctx.scale(scale, scale);

  // Fist base
  ctx.fillStyle = '#f5c08a';
  ctx.strokeStyle = '#d4944f';
  ctx.lineWidth = 2;

  // Palm
  ctx.beginPath();
  ctx.ellipse(0, 20, 22, 18, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Curled fingers
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(-8 + i * 8, 36, 7, 5, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();
  }

  // Thumb
  ctx.beginPath();
  ctx.ellipse(-20, 12, 8, 6, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Index finger (pointing up)
  ctx.fillStyle = '#f5c08a';
  ctx.beginPath();
  ctx.moveTo(-4, 8);
  ctx.lineTo(-6, -50);
  ctx.quadraticCurveTo(0, -58, 6, -50);
  ctx.lineTo(4, 8);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Finger nail
  ctx.fillStyle = '#fde0c0';
  ctx.beginPath();
  ctx.ellipse(0, -48, 5, 6, 0, Math.PI, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawFootball(ctx: CanvasRenderingContext2D, fb: Football, w: number, h: number) {
  const x = fb.x * w;
  const y = fb.y * h;
  const size = Math.min(w, h) * 0.06;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(fb.rotation);

  // Shadow
  ctx.save();
  ctx.translate(3, 5);
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#000';
  ctx.beginPath();
  ctx.moveTo(-size, size * 0.3);
  ctx.lineTo(size, size * 0.3);
  ctx.lineTo(0, -size * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // Paper triangle football
  const gradient = ctx.createLinearGradient(-size, -size, size, size);
  gradient.addColorStop(0, '#f8f8ff');
  gradient.addColorStop(0.5, '#e8e8f5');
  gradient.addColorStop(1, '#d8d8ee');

  ctx.fillStyle = gradient;
  ctx.strokeStyle = '#8898c8';
  ctx.lineWidth = 1.5;

  // Main triangle
  ctx.beginPath();
  ctx.moveTo(-size, size * 0.4);
  ctx.lineTo(size, size * 0.4);
  ctx.lineTo(0, -size * 0.9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Notebook lines on the paper
  ctx.strokeStyle = 'rgba(136, 152, 200, 0.3)';
  ctx.lineWidth = 0.5;
  for (let i = 1; i < 5; i++) {
    const lineY = size * 0.4 - (size * 1.3 * i) / 5;
    ctx.beginPath();
    const halfWidth = size * (1 - i / 5) * 0.8;
    ctx.moveTo(-halfWidth, lineY);
    ctx.lineTo(halfWidth, lineY);
    ctx.stroke();
  }

  // Red margin line
  ctx.strokeStyle = 'rgba(232, 160, 160, 0.4)';
  ctx.lineWidth = 0.7;
  ctx.beginPath();
  ctx.moveTo(-size * 0.5, size * 0.4);
  ctx.lineTo(-size * 0.15, -size * 0.6);
  ctx.stroke();

  // Fold lines
  ctx.strokeStyle = 'rgba(136, 152, 200, 0.2)';
  ctx.lineWidth = 0.5;
  ctx.beginPath();
  ctx.moveTo(0, -size * 0.9);
  ctx.lineTo(-size * 0.5, size * 0.4);
  ctx.moveTo(0, -size * 0.9);
  ctx.lineTo(size * 0.5, size * 0.4);
  ctx.stroke();

  // Shine
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(-size * 0.3, size * 0.1);
  ctx.lineTo(size * 0.1, size * 0.1);
  ctx.lineTo(-size * 0.1, -size * 0.4);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawAimingArrow(ctx: CanvasRenderingContext2D, state: GameState, w: number, h: number) {
  if (!state.dragStart || !state.dragCurrent) return;

  const sx = state.football.x * w;
  const sy = state.football.y * h;
  const dx = (state.dragStart.x - state.dragCurrent.x) * w;
  const dy = (state.dragStart.y - state.dragCurrent.y) * h;
  const power = Math.min(Math.sqrt(dx * dx + dy * dy), w * 0.3);

  if (power < 5) return;

  const angle = Math.atan2(dy, dx);
  const endX = sx + Math.cos(angle) * power * 1.5;
  const endY = sy + Math.sin(angle) * power * 1.5;

  // Dotted trajectory
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 215, 0, 0.6)';
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 6]);

  ctx.beginPath();
  ctx.moveTo(sx, sy);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  // Arrow head
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255, 215, 0, 0.8)';
  const arrowSize = 10;
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(
    endX - arrowSize * Math.cos(angle - 0.4),
    endY - arrowSize * Math.sin(angle - 0.4)
  );
  ctx.lineTo(
    endX - arrowSize * Math.cos(angle + 0.4),
    endY - arrowSize * Math.sin(angle + 0.4)
  );
  ctx.closePath();
  ctx.fill();

  // Power indicator
  const powerPct = Math.round((power / (w * 0.3)) * 100);
  ctx.fillStyle = powerPct > 70 ? '#ff4444' : powerPct > 40 ? '#ffaa00' : '#44ff44';
  ctx.font = 'bold 14px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText(`${powerPct}%`, sx, sy + 30);

  ctx.restore();
}

function drawPlayerHand(ctx: CanvasRenderingContext2D, w: number, h: number, dragging: boolean) {
  const handX = w * 0.5;
  const handY = h * 0.95;
  const scale = dragging ? 0.9 : 1;

  ctx.save();
  ctx.translate(handX, handY);
  ctx.scale(scale, scale);

  // Open palm facing up
  ctx.fillStyle = '#f5c08a';
  ctx.strokeStyle = '#d4944f';
  ctx.lineWidth = 2;

  // Palm base
  ctx.beginPath();
  ctx.ellipse(0, 10, 40, 25, 0, 0, Math.PI);
  ctx.fill();
  ctx.stroke();

  // Fingers spread
  const fingers = [
    { x: -28, y: -10, angle: -0.3 },
    { x: -12, y: -20, angle: -0.1 },
    { x: 5, y: -22, angle: 0.05 },
    { x: 22, y: -18, angle: 0.2 },
  ];

  for (const f of fingers) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.angle);
    ctx.beginPath();
    ctx.roundRect(-6, -25, 12, 28, 5);
    ctx.fill();
    ctx.stroke();
    // Nail
    ctx.fillStyle = '#fde0c0';
    ctx.beginPath();
    ctx.ellipse(0, -24, 5, 4, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f5c08a';
    ctx.restore();
  }

  // Thumb
  ctx.save();
  ctx.translate(-35, 0);
  ctx.rotate(-0.6);
  ctx.beginPath();
  ctx.roundRect(-6, -20, 14, 24, 6);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

export default function GameCanvas({ state, onDragStart, onDragMove, onDragEnd, simulate }: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  const getNormalizedPos = useCallback((e: React.TouchEvent | React.MouseEvent): Position => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) / rect.width,
      y: (clientY - rect.top) / rect.height,
    };
  }, []);

  const handlePointerDown = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onDragStart(getNormalizedPos(e));
  }, [getNormalizedPos, onDragStart]);

  const handlePointerMove = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onDragMove(getNormalizedPos(e));
  }, [getNormalizedPos, onDragMove]);

  const handlePointerUp = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onDragEnd();
  }, [onDragEnd]);

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);

      const w = rect.width;
      const h = rect.height;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Draw scene
      drawDeskBackground(ctx, w, h);
      drawFieldLines(ctx, w, h);
      drawGoalPosts(ctx, w, h);

      if (state.phase !== 'menu' && state.phase !== 'gameover') {
        drawFootball(ctx, state.football, w, h);
        drawAimingArrow(ctx, state, w, h);
        drawPlayerHand(ctx, w, h, !!state.dragStart);
      }

      if (state.phase === 'sliding') {
        simulate();
      }

      animRef.current = requestAnimationFrame(render);
    };

    animRef.current = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animRef.current);
  }, [state, simulate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      onMouseDown={handlePointerDown}
      onMouseMove={handlePointerMove}
      onMouseUp={handlePointerUp}
      onMouseLeave={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchMove={handlePointerMove}
      onTouchEnd={handlePointerUp}
    />
  );
}
