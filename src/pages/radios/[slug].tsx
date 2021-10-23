import { format, parseISO } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR'
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';

import { useRouter } from 'next/router'
import next, { GetStaticPaths, GetStaticProps } from 'next';

import { api } from '../../services/api';
import { convertDurationToTimeString } from '../../utils/convertDurationToTimeString';

import styles from './episode.module.scss';
import { usePlayer } from '../../contexts/PlayerContext';

type Episode = {
  id: string;
  index: number | string;
  title: string;
  thumbnail: string;
  members: string;
  duration: number;
  durationAsString: string;
  url: string;
  publishedAt: string;
  description: string;
};

type EpisodeProps = {
  episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {

  console.log(episode)

  const { play } = usePlayer();

  return (
    <div className={styles.episode}>
      <Head>
        <title>{episode.title} | Radio Music 24/7</title>
      </Head>

      <div className={styles.thumbnailContainer}>
        <Link href="/">
          <button type="button">
            <img src="/arrow-left.svg" alt="Voltar" />
          </button>
        </Link>
        <Image
          width={700}
          height={160}
          src={episode.thumbnail}
          objectFit="cover"
        />
        <button type="button" onClick={() => play(episode)}>
          <img src="/play.svg" alt="Tocar episódio" />
        </button>
      </div>

      <header>
        <h1>{episode.title}</h1>
        <span>{episode.members}</span>
        <span>{episode.publishedAt}</span>
        <span>{episode.durationAsString}</span>
      </header>

      <div
        className={styles.description}
        dangerouslySetInnerHTML={{ __html: episode.description }}
      />
    </div>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const { data } = await api.get('traffic')

  const paths = await data.channels.map((_, index) => {
    return {
      params: {
        slug: `${index}`
      }
    }
  })

  return {
    paths,
    fallback: 'blocking'
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  String.prototype.replaceAt = function (index, char) {
    var a = this.split("");
    a[index] = char;
    return a.join("");
  }

  const { slug } = params;
  const data = await (await api.get(`/traffic`)).data.channels[Number(slug) - 1]

  const episode = {
    id: data.channel_id,
    title: data.title,
    index: slug,
    thumbnail: data.cover,
    members: data.artist,
    publishedAt: format(parseISO(
      new Date().toISOString()
        .replaceAt(23, "")
        .replaceAt(22, "")
        .replaceAt(21, "")
        .replaceAt(20, "")
        .replaceAt(19, "")
        .replaceAt(10, " ")
    ), 'd MMM yy', { locale: ptBR }),
    duration: '00:00:00',
    durationAsString: '00:00:00',
    description: data.name,
    url: data.stream_url,
  };

  return {
    props: {
      episode,
    },
    revalidate: 180, // 1 Minute
  }
}