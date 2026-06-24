"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { READER_RANKS } from "@/lib/levels";

interface BeginnerLevelUpOverlayProps {
  open: boolean;
  onCreateAccount: () => void;
}

const BEGINNER = READER_RANKS[1];

function FireworksCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      color: string;
      size: number;
    }> = [];

    const colors = ["#FFE033", "#FF4FA3", "#5340FF", "#7C3AED", "#22D3EE", "#FBBF24"];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const burst = (x: number, y: number) => {
      const count = 36 + Math.floor(Math.random() * 20);
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count + Math.random() * 0.3;
        const speed = 2 + Math.random() * 5;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          color: colors[Math.floor(Math.random() * colors.length)],
          size: 2 + Math.random() * 3,
        });
      }
    };

    resize();
    window.addEventListener("resize", resize);

    burst(window.innerWidth * 0.3, window.innerHeight * 0.35);
    setTimeout(() => burst(window.innerWidth * 0.7, window.innerHeight * 0.3), 400);
    setTimeout(() => burst(window.innerWidth * 0.5, window.innerHeight * 0.25), 800);

    const interval = setInterval(() => {
      burst(
        window.innerWidth * (0.2 + Math.random() * 0.6),
        window.innerHeight * (0.2 + Math.random() * 0.35)
      );
    }, 900);

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.06;
        p.life -= 0.014;

        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      animationId = requestAnimationFrame(tick);
    };

    animationId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(interval);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0"
      aria-hidden
    />
  );
}

export default function BeginnerLevelUpOverlay({
  open,
  onCreateAccount,
}: BeginnerLevelUpOverlayProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="level-up-title"
        >
          <FireworksCanvas />

          <motion.div
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[28px] border border-white/15 bg-[#1A1028]/95 shadow-[0_24px_80px_rgba(83,64,255,0.45)]"
            initial={{ scale: 0.9, y: 24, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
          >
            <div className="bg-gradient-to-br from-[#4338CA] via-[#5340FF] to-[#7C3AED] px-6 py-8 text-center">
              <motion.span
                className="inline-flex rounded-full bg-[#FFE033] px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-[#2A114B]"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                Level up!
              </motion.span>

              <div
                className={`mx-auto mt-5 flex h-20 w-20 items-center justify-center rounded-full ${BEGINNER.bgClass} text-4xl shadow-[0_12px_40px_rgba(67,56,202,0.5)] ring-4 ring-white/20`}
              >
                {BEGINNER.emoji}
              </div>

              <h2
                id="level-up-title"
                className="font-heading mt-5 text-2xl font-extrabold text-white sm:text-3xl"
              >
                You&apos;re upgraded to {BEGINNER.name}
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Create an account to continue reading
              </p>
            </div>

            <div className="space-y-3 p-6">
              <button
                type="button"
                onClick={onCreateAccount}
                className="btn-coral h-12 w-full text-sm font-bold sm:h-14 sm:text-base"
              >
                Create account
              </button>
              <p className="text-center text-xs text-white/50">
                Free to join · Pick up right where you left off
              </p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
