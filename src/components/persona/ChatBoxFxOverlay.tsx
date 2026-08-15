import React, { useEffect, useRef } from "react";

interface ChatBoxFxOverlayProps {
  activeTriggerEmoji?: string;
  primaryColor?: string;
}

export const ChatBoxFxOverlay: React.FC<ChatBoxFxOverlayProps> = ({
  activeTriggerEmoji,
  primaryColor = "#FF5500",
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!activeTriggerEmoji || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Render simple particle wave effect for trigger emoji
    ctx.fillStyle = primaryColor;
    ctx.font = "32px sans-serif";
    ctx.fillText(activeTriggerEmoji, canvas.width / 2 - 16, canvas.height / 2);

    const timer = setTimeout(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }, 1500);

    return () => clearTimeout(timer);
  }, [activeTriggerEmoji, primaryColor]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={100}
      className="pointer-events-none absolute inset-0 z-10 w-full h-full"
    />
  );
};
