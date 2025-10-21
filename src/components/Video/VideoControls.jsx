import React from 'react';
import PlayPauseButton from './PlayPauseButton';
import VolumeControl from './VolumeControl';
import ProgressBar from './ProgressBar';
import SpeedControl from './SpeedControl';
import FullscreenButton from './FullscreenButton';

const VideoControls = ({
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  playbackRate,
  isFullscreen,
  showControls,
  onTogglePlay,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onChangePlaybackRate,
  onToggleFullscreen
}) => {
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
      <ProgressBar
        currentTime={currentTime}
        duration={duration}
        onSeek={onSeek}
      />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <PlayPauseButton
            isPlaying={isPlaying}
            onTogglePlay={onTogglePlay}
          />

          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            onVolumeChange={onVolumeChange}
            onToggleMute={onToggleMute}
          />

          <div className="text-white text-sm">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <SpeedControl
            playbackRate={playbackRate}
            onChangePlaybackRate={onChangePlaybackRate}
          />

          <FullscreenButton
            isFullscreen={isFullscreen}
            onToggleFullscreen={onToggleFullscreen}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoControls;
