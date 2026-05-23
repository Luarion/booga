import { promises as fs } from 'node:fs';
import path from 'node:path';

export const runtime = 'nodejs';

type MusicTrack = {
  title: string;
  artist: string;
  src: string;
  fileName: string;
};

type MusicAlbum = {
  slug: string;
  title: string;
  artist: string;
  coverSrc: string;
  tracks: MusicTrack[];
};

const audioExtensions = new Set([
  '.flac',
  '.mp3',
  '.wav',
  '.m4a',
  '.ogg',
  '.aac',
]);

function encodePublicPath(...segments: string[]) {
  return `/${segments.map((segment) => encodeURIComponent(segment)).join('/')}`;
}

function parseAlbumName(folderName: string) {
  const [artist, ...rest] = folderName.split(' - ');
  if (rest.length === 0) {
    return {
      artist: folderName,
      title: folderName,
    };
  }

  return {
    artist: (artist ?? folderName).trim(),
    title: rest.join(' - ').trim(),
  };
}

function parseTrackName(fileName: string) {
  const baseName = path.basename(fileName, path.extname(fileName));
  const [artist, ...rest] = baseName.split(' - ');
  if (rest.length === 0) {
    return {
      artist: baseName,
      title: baseName,
    };
  }

  return {
    artist: (artist ?? baseName).trim(),
    title: rest.join(' - ').trim(),
  };
}

async function readMusicLibrary(): Promise<MusicAlbum[]> {
  const musicRoot = path.join(process.cwd(), 'public', 'music');
  const entries = await fs.readdir(musicRoot, { withFileTypes: true });
  const albums: MusicAlbum[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;

    const albumFolder = path.join(musicRoot, entry.name);
    const albumEntries = await fs.readdir(albumFolder, { withFileTypes: true });
    const coverFile = albumEntries.find(
      (albumEntry) =>
        albumEntry.isFile() && albumEntry.name.toLowerCase() === 'cover.jpg',
    );

    const trackFiles = albumEntries.filter(
      (albumEntry) =>
        albumEntry.isFile() &&
        audioExtensions.has(path.extname(albumEntry.name).toLowerCase()),
    );

    if (!coverFile || trackFiles.length === 0) continue;

    const { artist, title } = parseAlbumName(entry.name);
    const albumSlug = entry.name;

    albums.push({
      slug: albumSlug,
      title,
      artist,
      coverSrc: encodePublicPath('music', albumSlug, coverFile.name),
      tracks: trackFiles.map((trackFile) => {
        const trackMeta = parseTrackName(trackFile.name);
        return {
          title: trackMeta.title,
          artist: trackMeta.artist,
          src: encodePublicPath('music', albumSlug, trackFile.name),
          fileName: trackFile.name,
        };
      }),
    });
  }

  return albums;
}

export async function GET() {
  const albums = await readMusicLibrary();
  return Response.json(albums);
}
