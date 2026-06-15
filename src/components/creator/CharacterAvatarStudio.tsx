"use client";

import type { CharacterAppearance } from "@/lib/creator/characterAppearance";

interface CharacterAvatarStudioProps {
  appearance: CharacterAppearance;
  name?: string;
  className?: string;
  interactive?: boolean;
  rotateY?: number;
}

export default function CharacterAvatarStudio({
  appearance,
  name,
  className = "",
  interactive = true,
  rotateY = -14,
}: CharacterAvatarStudioProps) {
  const isWoman = appearance.gender === "woman";
  const shoulderW = isWoman ? 88 : 96;
  const hipW = isWoman ? 72 : 80;

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ perspective: "900px" }}
    >
      <div
        className="relative h-[320px] w-[220px] transition-transform duration-500 ease-out"
        style={{
          transform: `rotateY(${rotateY}deg) rotateX(4deg)`,
          transformStyle: "preserve-3d",
        }}
      >
        {/* Floor shadow */}
        <div
          className="absolute bottom-2 left-1/2 h-8 w-32 -translate-x-1/2 rounded-[100%] bg-[#2A114B]/20 blur-md"
          style={{ transform: "rotateX(90deg) translateZ(-40px)" }}
        />

        {/* Character rig */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-6">
          {/* Hair back */}
          {(appearance.hairId === "long-wavy" || appearance.hairId === "ponytail") && (
            <div
              className="absolute top-[52px] z-0 rounded-full"
              style={{
                width: isWoman ? 76 : 70,
                height: appearance.hairId === "ponytail" ? 40 : 90,
                background: appearance.hairColor,
                transform: "translateZ(-8px)",
              }}
            />
          )}

          {/* Head */}
          <div
            className="relative z-20 rounded-[40%] shadow-lg"
            style={{
              width: isWoman ? 52 : 56,
              height: isWoman ? 58 : 60,
              background: appearance.skinTone,
              transform: "translateZ(20px)",
            }}
          >
            {/* Hair top */}
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 rounded-t-full"
              style={{
                width: isWoman ? 54 : 58,
                height:
                  appearance.hairId === "short" || appearance.hairId === "messy"
                    ? 22
                    : 32,
                background: appearance.hairColor,
              }}
            />
            {appearance.hairId === "ponytail" && (
              <div
                className="absolute -right-3 top-4 rounded-full"
                style={{
                  width: 14,
                  height: 36,
                  background: appearance.hairColor,
                }}
              />
            )}
            {/* Eyes */}
            <div className="absolute left-[28%] top-[42%] h-2 w-2 rounded-full bg-[#101828]" />
            <div className="absolute right-[28%] top-[42%] h-2 w-2 rounded-full bg-[#101828]" />
            {/* Accessory glasses */}
            {appearance.accessoryId === "glasses" && (
              <div className="absolute left-[18%] top-[38%] h-4 w-[64%] rounded-lg border-2 border-[#101828]/60" />
            )}
            {appearance.accessoryId === "crown" && (
              <div
                className="absolute -top-3 left-1/2 flex -translate-x-1/2 gap-0.5"
                style={{ color: appearance.accentColor }}
              >
                <span className="text-[10px]">♛</span>
              </div>
            )}
          </div>

          {/* Neck */}
          <div
            className="z-10"
            style={{
              width: 18,
              height: 10,
              background: appearance.skinTone,
              transform: "translateZ(12px)",
            }}
          />

          {/* Torso / top */}
          <div
            className="relative z-10 rounded-t-3xl shadow-md"
            style={{
              width: shoulderW,
              height: appearance.topId === "dress" ? 110 : 72,
              background: appearance.topColor,
              transform: "translateZ(16px)",
              borderBottom:
                appearance.topId === "blazer"
                  ? `3px solid ${appearance.accentColor}`
                  : undefined,
            }}
          >
            {appearance.topId === "hoodie" && (
              <div
                className="absolute -top-2 left-1/2 h-8 w-10 -translate-x-1/2 rounded-t-full"
                style={{ background: appearance.topColor, filter: "brightness(0.92)" }}
              />
            )}
            {appearance.accessoryId === "scarf" && (
              <div
                className="absolute -bottom-2 left-1/2 h-10 w-3 -translate-x-1/2 rounded-full"
                style={{ background: appearance.accentColor }}
              />
            )}
          </div>

          {/* Arms */}
          <div
            className="absolute z-[5] rounded-full"
            style={{
              left: "18%",
              top: "38%",
              width: 16,
              height: 70,
              background: appearance.topColor,
              transform: "rotate(8deg) translateZ(8px)",
            }}
          />
          <div
            className="absolute z-[5] rounded-full"
            style={{
              right: "18%",
              top: "38%",
              width: 16,
              height: 70,
              background: appearance.topColor,
              transform: "rotate(-8deg) translateZ(8px)",
            }}
          />

          {/* Bottom */}
          {appearance.topId !== "dress" && (
            <div
              className="z-[8] rounded-b-lg"
              style={{
                width: hipW,
                height: 64,
                background: appearance.bottomColor,
                transform: "translateZ(10px)",
              }}
            />
          )}

          {/* Legs */}
          <div className="relative z-[6] flex gap-2" style={{ transform: "translateZ(6px)" }}>
            <div
              className="rounded-b-full"
              style={{
                width: 22,
                height: 56,
                background: appearance.skinTone,
              }}
            />
            <div
              className="rounded-b-full"
              style={{
                width: 22,
                height: 56,
                background: appearance.skinTone,
              }}
            />
          </div>

          {/* Shoes */}
          <div
            className="relative z-[7] flex gap-3"
            style={{ transform: "translateZ(14px)" }}
          >
            <div
              className="rounded-lg"
              style={{ width: 26, height: 12, background: appearance.shoesColor }}
            />
            <div
              className="rounded-lg"
              style={{ width: 26, height: 12, background: appearance.shoesColor }}
            />
          </div>

          {/* Backpack */}
          {appearance.accessoryId === "backpack" && (
            <div
              className="absolute left-[12%] top-[42%] rounded-xl"
              style={{
                width: 28,
                height: 40,
                background: "#8B5E3C",
                transform: "translateZ(-4px)",
              }}
            />
          )}
        </div>

        {name ? (
          <p
            className="absolute -bottom-1 left-0 right-0 text-center font-heading text-sm font-extrabold text-[#2A114B]"
            style={{ transform: "translateZ(30px)" }}
          >
            {name}
          </p>
        ) : null}
      </div>

      {interactive ? (
        <p className="absolute bottom-0 left-0 right-0 text-center text-[10px] text-[#667085]">
          Drag to rotate · 3D preview
        </p>
      ) : null}
    </div>
  );
}
