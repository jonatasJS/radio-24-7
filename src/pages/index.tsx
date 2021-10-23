import { GetStaticProps } from 'next';
import Image from 'next/image';
import Head from 'next/head';
import Link from 'next/link'
import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'

import { api } from '../services/api';
import { convertDurationToTimeString } from '../utils/convertDurationToTimeString';
import { usePlayer } from '../contexts/PlayerContext';

import styles from './home.module.scss';
import replaceAt from '../utils/replaceAt';

type Episode = {
  id: string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
}

type HomeProps = {
  latestEpisodes: Episode[];
  allEpisodes: Episode[];
}

export default function Home({ latestEpisodes, allEpisodes }: HomeProps) {
  const { playList } = usePlayer()

  const episodeList = [...latestEpisodes, ...allEpisodes];

  return (
    <div className={styles.homepage}>
      <Head>
        <title>Home | Radio Music 24/7</title>
      </Head>

      <section className={styles.latestEpisodes}>
        <h2>Últimos lançamentos</h2>

        <ul>
          {latestEpisodes.map((episode, index) => {
            return (
              <li key={episode.id}>
                <Image
                  width={192}
                  height={192}
                  src={episode.thumbnail}
                  alt={episode.title}
                  objectFit="cover"
                />

                <div className={styles.episodeDetails}>
                  <Link href={`/radios/${index + 1}`}>
                    <a>{episode.title}</a>
                  </Link>
                  <p>{episode.members}</p>
                  <span>{episode.publishedAt}</span>
                  <span>{episode.durationAsString}</span>
                </div>

                <button type="button" onClick={() => playList(episodeList, index)}>
                  <img src="/play-green.svg" alt="Tocar episódio" />
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <section className={styles.allEpisodes}>
        <h2>Todos estações</h2>

        <table cellSpacing={0}>
          <thead>
            <tr>
              <th></th>
              <th>Rádios</th>
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
                  <td style={{ width: 72 }}>
                    <Image
                      width={120}
                      height={120}
                      src={episode.thumbnail}
                      alt={episode.title}
                      objectFit="cover"
                    />
                  </td>
                  <td>
                    <Link href={`/radios/${index + 1}`}>
                      <a>{episode.title}</a>
                    </Link>
                  </td>
                  <td>{episode.members}</td>
                  <td style={{ width: 100 }}>{episode.publishedAt}</td>
                  <td>{episode.durationAsString}</td>
                  <td>
                    <button type="button" onClick={() => playList(episodeList, index + latestEpisodes.length)}>
                      <img src="/play-green.svg" alt="Tocar episódio" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </section>
    </div>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const { data } = await api.get('traffic', {
    params: {
      _limit: 12,
    }
  });

  String.prototype.replaceAt = function (index, char) {// eslint-disable-next-line  @typescript-eslint/no-explicit-any
    var a = this.split("");// eslint-disable-next-line  @typescript-eslint/no-explicit-any
    a[index] = char;// eslint-disable-next-line  @typescript-eslint/no-explicit-any
    return a.join("");// eslint-disable-next-line  @typescript-eslint/no-explicit-any
  }// eslint-disable-next-line  @typescript-eslint/no-explicit-any

  const episodes = data.channels.map((episode, index) => {
    return {
      id: episode.channel_id,
      index: index + 1,
      title: episode.title,
      thumbnail: episode.cover,
      members: episode.artist,
      publishedAt: format(parseISO(// eslint-disable-next-line  @typescript-eslint/no-explicit-any
        new Date().toISOString()// eslint-disable-next-line  @typescript-eslint/no-explicit-any
          .replaceAt(23, "")// eslint-disable-next-line  @typescript-eslint/no-explicit-any
          .replaceAt(22, "")// eslint-disable-next-line  @typescript-eslint/no-explicit-any
          .replaceAt(21, "")// eslint-disable-next-line  @typescript-eslint/no-explicit-any
          .replaceAt(20, "")// eslint-disable-next-line  @typescript-eslint/no-explicit-any
          .replaceAt(19, "")// eslint-disable-next-line  @typescript-eslint/no-explicit-any
          .replaceAt(10, " ")// eslint-disable-next-line  @typescript-eslint/no-explicit-any
      ), 'd MMM yy', { locale: ptBR }),// eslint-disable-next-line  @typescript-eslint/no-explicit-any
      duration: '00:00:00',
      durationAsString: '00:00:00',
      url: episode.stream_url,
    };
  });

  const latestEpisodes = episodes.slice(0, 2);
  const allEpisodes = episodes.slice(2, episodes.length);

  return {
    props: {
      latestEpisodes,
      allEpisodes,
    },
    revalidate: 60,
  }
}
