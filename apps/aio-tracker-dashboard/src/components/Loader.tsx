import React from 'react';

interface LoaderProps {
  size?: number; // size in pixels
  color?: string; // tailwind color class
  speed?: string; // animation speed (e.g., "fast", "slow")
}

const speedMap: Record<string, string> = {
  slow: 'animate-spin-slow',
  normal: 'animate-spin',
  fast: 'animate-spin-fast',
};

export const Loader: React.FC<LoaderProps> = ({
  size = 24,
  color = 'border-blue-500',
  speed = 'normal',
}) => {
  return (
    <div
      className={`border-4 border-t-transparent rounded-full ${color} ${
        speedMap[speed] || speedMap.normal
      }`}
      style={{ width: size, height: size }}
      role="status"
    />
  );
};
