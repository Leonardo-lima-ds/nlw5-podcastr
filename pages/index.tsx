import { GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

import { api } from '../src/services/api';
import { convertDurationToTimeString } from '../src/utils/convertDurationToTimeString';
import styles from './home.module.scss';
import React from 'react';
import { usePlayer } from '../src/contexts/PlayerContext';

type Episode = {
  id: string;
  title: string;
  members: string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;  
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes}: HomeProps) {
  const { playList } = usePlayer();
  
  const episodeList = [...latestEpisodes, ...allEpisodes]

  return (
    <div className={styles.homepage}>
      <section className={styles.lastestEpisodes}>

        <Head>
          <title>Home | Podcastr</title>
        </Head>

        <h2>Últimos lançamentos</h2>

        <ul>
            {latestEpisodes.map((episode, index) => {
              return (
                <li key={episode.id}>
                  <Image width={192} height={192} src={episode.thumbnail} alt={episode.title} objectFit="cover"/>

                  <div className={styles.episodeDetails}>
                    <Link href={`/episodes/${episode.id}`}>
                      <a>{episode.title}</a>
                    </Link>
                    <p>{episode.members}</p>

                    <span>{episode.publishedAt}</span>
                    <span>{episode.durationAsString}</span>
                  </div>

                  <button type="button" onClick={() => playList(episodeList, index)}>
                    <img src="/play-green.svg" alt="tocar episódio"/>
                  </button>
                </li>
              );
            })} 
        </ul>

      </section>

      <section className={styles.allEpisodes}>
          <h2>Todos os episódios</h2>

          <table cellSpacing={0}>
            <thead>
                <tr>
                    <th></th>
                    <th>Podcast</th>
                    <th>Integrantes</th>
                    <th>Data</th>
                    <th>Duração</th>
                    <th></th>
                </tr>
            </thead>

            <tbody>
              {allEpisodes.map((episode, index) => {
                return (
                  <tr key={episode.id}>
                    <td style={{width: 72}}>
                        <Image 
                            width={120} 
                            height={120} 
                            src={episode.thumbnail} 
                            alt={episode.title} 
                            objectFit="cover"
                        />
                    </td>

                    <td>
                        <Link href={`/episodes/${episode.id}`}>
                            <a>{episode.title}</a>
                        </Link>
                    </td>

                    <td>
                      {episode.members}
                    </td>

                    <td style={{width: 100}}>
                      {episode.publishedAt}
                    </td>

                    <td>
                      {episode.durationAsString}
                    </td>

                    <td>
                        <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                            <img src="/play-green.svg" alt="Tocar episódio"/>
                        </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
      </section>
    </div>
  );

}

// Essa função permite executa-lá no lado do servidor antes de exibir na tela (SERVER SIDE RENDERING)
/*export async function getServerSideProps() {
    const response = await fetch('http://localhost:3333/episodes');
    const data = await response.json();

    return {
      props: {
        episodes: data,
      }
    }
} */

// Gera uma página estática que vai atualizar em determinado período, só funciona em prod, podemos simular rodando uma build
export const getStaticProps: GetStaticProps = async () => {
    const { data }  = await api.get('episodes', { 
      params: {
        _limit: 20,
        _sort:'published_at',
        _order:'desc'
      }
    });

    console.log('data: ', data);

    const episodes = await data.map((episode) => {
      return { 
        id: episode.id,
        title: episode.title,
        thumbnail: episode.thumbnail,
        publishedAt: format(parseISO(episode.published_at), 'd MMM yy', {
          locale: ptBR,
        }),
        durationAsString: convertDurationToTimeString(Number(episode.file.duration)),
        url: episode.file.url,
        members: episode.members,
        duration: Number(episode.file.duration)
      };

    });

    const latestEpisodes: Episode = episodes.slice(0, 2);
    const allEpisodes: Episode = episodes.slice(2, episodes.length);

    return {
      props: {
        latestEpisodes,
        allEpisodes,
      },
      revalidate: 60 * 60 * 8, // O estatico irá atualizar a cada 8 horas (60 seg * 60 = 1 hora * 8 = horas)
    }
}
