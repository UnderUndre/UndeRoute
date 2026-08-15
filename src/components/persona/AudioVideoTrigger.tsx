import React from "react";

interface AudioVideoTriggerProps {
  isPlaying: boolean;
  videoUrl?: string;
}

export const AudioVideoTrigger: React.FC<AudioVideoTriggerProps> = ({ isPlaying, videoUrl }) => {
  if (!isPlaying || !videoUrl) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden opacity-30 mix-blend-screen">
      <video src={videoUrl} autoPlay muted loop={false} className="w-full h-full object-cover" />
    </div>
  );
};
