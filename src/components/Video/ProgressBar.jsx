import React from 'react';

const ProgressBar = ({ currentTime, duration, onSeek }) => {
  return (
    <div 
      className="w-full h-2 bg-gray-600 rounded-full mb-4 cursor-pointer relative"
      onClick={onSeek}
    >
      <div 
        className="h-full bg-red-500 rounded-full relative"
        style={{ width: `${(currentTime / duration) * 100}%` }}
      >
        <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md"></div>
      </div>
    </div>
  );
};

export default ProgressBar;
