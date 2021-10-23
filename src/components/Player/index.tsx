import Image from 'next/image';
import { useRef, useEffect, useState } from 'react';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css';

import { usePlayer } from '../../contexts/PlayerContext';

import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

export function Player() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState(0);

  const {
    episodeList,
    setVolumeState,
    volume,
    muted,
    setMutedState,
    currentEpisodeIndex,
    isPlaying,
    isLooping,
    isShuffling,
    togglePlay,
    toggleLoop,
    toggleShuffle,
    setPlayingState,
    playNext,
    playPrevious,
    hasNext,
    hasPrevious,
    clearPlayerState
  } = usePlayer();

  useEffect(() => {
    if (!audioRef.current) {
      return;
    }

    if (isPlaying) {
      audioRef.current.play();
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying])

  function setupProgressListener() {
    // audioRef.current.currentTime = 0;

    audioRef.current.addEventListener('timeupdate', () => {
      setProgress(Math.floor(audioRef.current?.currentTime));
    });
  }

  function handleSeek(amount: number) {
    audioRef.current.currentTime = amount;
    setProgress(amount);
  }

  function handleEpisodeEnded() {
    if (hasNext) {
      playNext()
    } else {
      clearPlayerState()
    }
  }

  const episode = episodeList[currentEpisodeIndex]

  return (
    <div className={styles.playerContainer}>
      <header>
        <img src="/playing.svg" alt="Tocando agora" />
        <strong>Tocando agora</strong>
      </header>

      {episode ? (
        <div className={styles.currentEpisode}>
          <Image
            width={592}
            height={592}
            src={episode.thumbnail}
            objectFit="cover"
          />
          <strong>{episode.title}</strong>
          <span>{episode.members}</span>
        </div>
      ) : (
        <div className={styles.emptyPlayer}>
          <strong>Selecione um estação para ouvir</strong>
        </div>
      )}

      <footer className={!episode ? styles.empty : ''}>
        <div className={styles.progress}>
          <span>{convertDurationToTimeString(progress)}</span>
          <div className={styles.slider}>
            {episode ? (
              <Slider
                max={progress}
                value={progress}
                onChange={handleSeek}
                trackStyle={{ backgroundColor: '#04d361' }}
                railStyle={{ backgroundColor: '#9f75ff' }}
                handleStyle={{ borderColor: '#04d361', borderWidth: 4 }}
              />
            ) : (
              <div className={styles.emptySlider} />
            )}
          </div>
          <span>{convertDurationToTimeString(progress ?? 0)}</span>
        </div>

        {episode && (
          <audio
            src={episode.url}
            ref={audioRef}
            loop={isLooping}
            autoPlay
            onLoadStart={_ => audioRef.current.volume = volume}
            onEnded={handleEpisodeEnded}
            onPlay={_ => setPlayingState(true)}
            onPause={_ => setPlayingState(false)}
            onLoadedMetadata={setupProgressListener}
          />
        )}

        <div className={styles.buttons}>
          {/* <button
            type="button"
            disabled={!episode || episodeList.length === 1}
            onClick={toggleShuffle}
            className={isShuffling ? styles.isActive : ''}
          >
            <img src="/shuffle.svg" alt="Embaralhar" />
          </button> */}
          <button type="button" onClick={playPrevious} disabled={!episode || !hasPrevious}>
            <img src="/play-previous.svg" alt="Tocar anterior" />
          </button>
          <button
            type="button"
            className={styles.playButton}
            disabled={!episode}
            onClick={togglePlay}
          >
            {isPlaying
              ? <img src="/pause.svg" alt="Tocar" />
              : <img src="/play.svg" alt="Tocar" />}
          </button>
          <button type="button" onClick={playNext} disabled={!episode || !hasNext}>
            <img src="/play-next.svg" alt="Tocar próxima" />
          </button>
          {/* <button
            type="button"
            disabled={!episode}
            onClick={toggleLoop}
            className={isLooping ? styles.isActive : ''}
          >
            <img src="/repeat.svg" alt="Repetir" />
          </button> */}
          <input
            className={styles.volume}
            type="range"
            min={0}
            max={1}
            step={0.01}
            style={{
              transform: 'rotate(270deg)',
              width: '5rem',
              zIndex: 200,
              marginRight: '-1.5rem',
              marginLeft: '-1.5rem'
            }}
            value={audioRef.current?.volume || volume}
            onChange={e => {
              if(e.target.valueAsNumber > 1) return alert("Nem vem :)")

              audioRef.current.volume = e.target.valueAsNumber;
            }}
          />
          <span style={{
            marginLeft: '-1.5rem',
            paddingRight: '1rem',
            marginRight: '-5rem'
          }}>
            {audioRef.current && (audioRef.current.volume * 100 || volume).toFixed(0)}
          </span>
        </div>
      </footer>
    </div>
  );
}