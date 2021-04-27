import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Slider from 'rc-slider';

import 'rc-slider/assets/index.css'

import { usePlayer } from '../../contexts/PlayerContext';

import styles from './styles.module.scss';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';


export default function Player() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [progress, setProgress] = useState(0);

    const { 
        episodesList, 
        currentEpisodeIndex, 
        isPlaying, 
        hasNext,
        hasPrevious,
        isLooping,
        isShuffling,
        clearPlayerState,
        playNext, 
        playPrevious,
        setPlayingState, 
        togglePlay,
        toggleLooping,
        toggleShuffling,
    } = usePlayer();

    // Trabalhar com efeitos colaterais, ou seja, quando algo muda realizamos alguma ação
    useEffect(() => { 
        if (!audioRef.current) {
            return;
        }

        if (isPlaying) {
            audioRef.current.play();
        } else {
            audioRef.current.pause();
        }

     }, [isPlaying]);

    const episode = episodesList[currentEpisodeIndex];

    function setupProgressListener() {
        audioRef.current.currentTime = 0;

        audioRef.current.addEventListener('timeupdate', () => {
            setProgress(Math.floor(audioRef.current.currentTime));
        });
    }

    function handleSeek(amount: number) {
        audioRef.current.currentTime = amount;
        setProgress(amount);
    }

    function handleEpisodioEnded() {
        if (hasNext) {
            playNext();
        } else {
            clearPlayerState();
        }
    }

    return (
        <section className={styles.playerContainer}>
            <header>
                <img src="/icons/playing.svg" alt="" aria-hidden="true"/>
                <strong>Tocando agora</strong>
            </header>

            {episode ? (
                <div className={styles.currentEpisode}>
                    <img src={episode.thumbnail} alt="" aria-hidden="true" />

                    <strong>{episode.title}</strong>
                    <span>{episode.members}</span>
                </div>
            ) : (
                <div className={styles.emptyPlayer}>
                    <strong>Selecione um podcast para ouvir</strong>
                </div>
            )}

            <footer className={!episode ? styles.empty: ''}>
                <div className={styles.progress}>
                    <span>{convertDurationToTimeString(progress)}</span>
                    <div className={styles.slider}>
                        {episode ? (
                            <Slider 
                                max={episode.duration}
                                value={progress}
                                onChange={handleSeek}
                                trackStyle={{ backgroundColor: '#04d361' }}
                                railStyle={{ backgroundColor: '#9f75ff'}}
                                handleStyle={{ borderColor: '#04d361', borderWidth: 4}}
                            />
                        ) : (
                            <div className={styles.emptySlider} />
                        )}
                    </div>
                    <span>{convertDurationToTimeString(episode?.duration ?? 0)}</span>
                </div>

                {episode && (
                    <audio 
                        src={episode.url}
                        ref={audioRef}
                        onPlay={() => setPlayingState(true)}
                        onPause={() => setPlayingState(false)}
                        onEnded={handleEpisodioEnded}
                        onLoadedMetadata={setupProgressListener}
                        loop={isLooping}
                        autoPlay
                    />
                )}

                <div className={styles.buttons}>
                    <button 
                        type="button" 
                        disabled={!episode || episodesList.length === 1} 
                        onClick={toggleShuffling} 
                        className={isShuffling ? styles.isActive : ''}>
                        <img src="/icons/shuffle.svg" alt="ordem aleatória"/>
                    </button>

                    <button 
                        type="button" 
                        onClick={playPrevious} 
                        disabled={!episode || !hasPrevious}>
                        <img src="/icons/play-previous.svg" alt="tocar anterior"/>
                    </button>

                    <button 
                        type="button" 
                        className={styles.playButton} 
                        disabled={!episode} 
                        onClick={togglePlay}>
                        { isPlaying ? (
                            <img src="/icons/pause.svg" alt="Pausar episódio"/>
                            ) : (
                            <img src="/icons/play.svg" alt="tocar"/>
                        )}
                    </button>

                    <button 
                        type="button" 
                        onClick={playNext} 
                        disabled={!episode || !hasNext}>
                        <img src="/icons/play-next.svg" alt="tocar próxima"/>
                    </button>

                    <button 
                        type="button" 
                        onClick={toggleLooping} 
                        className={isLooping ? styles.isActive : ''}>
                        <img src="/icons/repeat.svg" alt="repetir"/>
                    </button>
                </div>
                
            </footer>
        </section>
    );
} 