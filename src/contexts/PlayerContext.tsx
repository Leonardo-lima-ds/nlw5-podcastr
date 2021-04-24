import { createContext, ReactNode, useContext, useState } from 'react';

type Episode = {
    title: string;
    members: string;
    thumbnail: string;
    duration: number;
    url: string;
};

type PayerContextData = {
    episodesList: Episode[];
    currentEpisodeIndex: number;
    isPlaying: boolean;
    hasNext: boolean;
    hasPrevious: boolean;
    isLooping: boolean;
    isShuffling: boolean;
    clearPlayerState: () => void;
    play: (episode: Episode) => void;
    togglePlay: () => void;
    setPlayingState: (state: boolean) => void;
    playList: (list: Episode[], index: number) => void;
    playNext: () => void;
    playPrevious: () => void;
    toggleLooping: () => void;
    toggleShuffling: () => void;
};

type PlayerContextProviderProps = {
    children: ReactNode; 
};

export const PlayerContext = createContext({} as PayerContextData);

export function PlayerContextProvider({ children }: PlayerContextProviderProps) {
    const [episodesList, setEpisodesList] = useState([]);
    const [currentEpisodeIndex, setCurrentEpisodeIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLooping, setIsLooping] = useState(false);
    const [isShuffling, setShuffling] = useState(false)

    const hasPrevious =  isShuffling || currentEpisodeIndex > 0;
    const hasNext = isShuffling || currentEpisodeIndex < (episodesList.length - 1);
  
    function play(episode) {
      setEpisodesList([episode]);
      setCurrentEpisodeIndex(0);
      setIsPlaying(true);
    }
  
    function togglePlay() {
      setIsPlaying(!isPlaying);
    }
  
    function setPlayingState(state: boolean) {
      setIsPlaying(state);
    }

    function playList(list: Episode[], index: number) {
        setEpisodesList(list);
        setCurrentEpisodeIndex(index);
        setIsPlaying(true);
    }

    function playNext() {
        const nextEpisodeIndex = currentEpisodeIndex + 1;

        if (isShuffling) {
            const nextRandomEpisodeIndex = Math.floor(Math.random() * episodesList.length);
            setCurrentEpisodeIndex(nextRandomEpisodeIndex);
        } else if (hasNext) {
            setCurrentEpisodeIndex(nextEpisodeIndex);
        } 

    }

    function playPrevious() {      
        if (isShuffling) {
            const nextRandomEpisodeIndex = Math.floor(Math.random() * episodesList.length);
            setCurrentEpisodeIndex(nextRandomEpisodeIndex);
        } else if (hasPrevious) {
            setCurrentEpisodeIndex(currentEpisodeIndex - 1);    
        } 
    }

    function toggleLooping() {
        setIsLooping(!isLooping);
    }
    
    function toggleShuffling() {
        setShuffling(!isShuffling);
    }

    function clearPlayerState() {
        setEpisodesList([]);
        setCurrentEpisodeIndex(0);
    }

  
    return (
        <PlayerContext.Provider 
            value={{ 
                currentEpisodeIndex, 
                episodesList, 
                hasNext,
                hasPrevious,
                isPlaying, 
                isLooping,
                isShuffling,
                clearPlayerState,
                play, 
                playList,
                playNext,
                playPrevious,
                setPlayingState,
                togglePlay, 
                toggleLooping,
                toggleShuffling,
            }}>

            { children} 
        </PlayerContext.Provider>
    );
}

export const usePlayer = () => {
    return useContext(PlayerContext);
}