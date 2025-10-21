import React from 'react';

const PlayPauseButton = ({ isPlaying, onTogglePlay }) => {
  return (
    <button
      onClick={onTogglePlay}
      className="text-white hover:text-red-500 transition-colors p-2"
    >
      {isPlaying ? (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      )}
    </button>
  );
};

export default PlayPauseButton;
