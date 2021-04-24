import { format, parseISO } from 'date-fns';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link';
import { ptBR } from 'date-fns/locale';
import { GetStaticPaths, GetStaticProps } from 'next';

import { usePlayer } from '../../src/contexts/PlayerContext';
import { api } from '../../src/services/api';
import { convertDurationToTimeString } from '../../src/utils/convertDurationToTimeString';

import styles from './episodes.module.scss';

type Episode = {
    id: string;
    title: string;
    members: string;
    thumbnail: string;
    description: string;
    duration: number;
    durationAsString: string;
    url: string;
    publishedAt: string;  
}

type EpisodeProps = {
    episode: Episode;
}

export default function Episodes({ episode }: EpisodeProps) {

    const { play } = usePlayer();

    return (
        <div className={styles.episode}>

            <Head>
                <title>{episode.title} | Podcastr</title>
            </Head>

            <div className={styles.thumbnailContainer}>
                <Link href="/">    
                    <button type="button">
                        <img src="/arrow-left.svg" alt="voltar"/>
                    </button>
                </Link>

                <Image width={700} height={160} src={episode.thumbnail} objectFit="cover" />

                <button type="button" onClick={() => play(episode)}>
                    <img src="/play.svg" alt="Tocar episódio"/>
                </button>
            </div>

            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }}/>
        </div>
    );
}

// Precisamos dessa função quando temos páginas estáticas geradas com valores dinâmicos
export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [],
        fallback: 'blocking'
    };
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { slug } = ctx.params;
    const { data } = await api.get(`/episodes/${slug}`);

    const episode =  { 
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        publishedAt: format(parseISO(data.published_at), 'd MMM yy', {
          locale: ptBR,
        }),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
        members: data.members,
        duration: Number(data.file.duration)
      };

    return { 
        props: { 
            episode 
        },
        revalidate: 60 * 60 * 24, // 24 horas
    };
}