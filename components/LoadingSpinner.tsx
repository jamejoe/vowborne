
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message }) => {
  return (
    <div className="h-full w-full bg-black/80 flex flex-col items-center justify-center text-white">
      <div className="loading-spinner"></div>
      {message && <p className="mt-4 text-3xl">{message}</p>}
    </div>
  );
};

export default LoadingSpinner;