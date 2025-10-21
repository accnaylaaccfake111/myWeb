import React from 'react';

const SpeedControl = ({ playbackRate, onChangePlaybackRate }) => {
  return (
    <div className="relative group">
      <button className="text-white hover:text-red-500 transition-colors text-sm">
        {playbackRate}x
      </button>
      <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex flex-col space-y-1">
          {[0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
            <button
              key={rate}
              onClick={() => onChangePlaybackRate(rate)}
              className={`text-sm px-2 py-1 rounded ${playbackRate === rate ? 'bg-red-500 text-white' : 'text-gray-300 hover:text-white'}`}
            >
              {rate}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SpeedControl;
