'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type MusicTrack = {
  title: string;
  artist: string;
  src: string;
  fileName: string;
};

type Album = {
  slug: string;
  title: string;
  artist: string;
  coverSrc: string;
  tracks: MusicTrack[];
};

export default function MusicPlayer() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<Album | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mountedDialog, setMountedDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('/api/music')
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (!Array.isArray(data)) {
          setError('No albums found');
          setAlbums([]);
        } else {
          setAlbums(data);
          if (data.length > 0) {
            setCurrent(data[0]);
            setCurrentTrackIndex(0);
          }
        }
      })
      .catch(() => setError('Failed loading albums'))
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  function selectAlbum(al: Album) {
    setCurrent(al);
    setCurrentTrackIndex(0);
    setIsPlaying(true);
    closeAlbums();
  }

  function openAlbums() {
    setMountedDialog(true);
    setOpenDialog(true);
  }
  function closeAlbums() {
    setOpenDialog(false);
    setTimeout(() => setMountedDialog(false), 260);
  }

  const currentTrack = current?.tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(() => setIsPlaying(false));
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying]);

  function togglePlay(e: React.MouseEvent) {
    e.stopPropagation();
    setIsPlaying(!isPlaying);
  }

  function prevTrack(e: React.MouseEvent) {
    e.stopPropagation();
    if (!current) return;
    setCurrentTrackIndex((prev) =>
      prev > 0 ? prev - 1 : current.tracks.length - 1,
    );
    setIsPlaying(true);
  }

  function nextTrack(e?: React.MouseEvent) {
    e?.stopPropagation();
    if (!current) return;
    setCurrentTrackIndex((prev) =>
      prev < current.tracks.length - 1 ? prev + 1 : 0,
    );
    setIsPlaying(true);
  }

  function handleAudioEnded() {
    nextTrack();
  }

  return (
    <div className="h-12 w-1/2 rounded-2xl gap-3 p-2">
      {currentTrack && (
        // biome-ignore lint/a11y/useMediaCaption: music track
        <audio
          ref={audioRef}
          src={currentTrack.src}
          onEnded={handleAudioEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
      )}
      <div className="w-full flex items-center gap-3 rounded-2xl bg-white/10 p-2">
        <button
          type="button"
          onClick={openAlbums}
          className="relative size-8 shrink-0 rounded bg-white/10 overflow-hidden cursor-pointer"
        >
          {current?.coverSrc ? (
            <Image
              src={current.coverSrc}
              alt={current.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/5" />
          )}
        </button>
        <button
          type="button"
          onClick={openAlbums}
          className="flex min-w-0 flex-col gap-0.5 text-left flex-1"
        >
          <span className="truncate text-sm font-semibold text-white">
            {currentTrack?.title ?? current?.title ?? 'Unknown Title'}
          </span>
          <span className="truncate text-xs text-white/50">
            {currentTrack?.artist ?? current?.artist ?? 'Unknown Artist'}
          </span>
        </button>
        <div className="flex items-center gap-2 text-white/80 pr-2">
          <button
            type="button"
            onClick={prevTrack}
            className="hover:text-white transition-colors"
            aria-label="Anterior"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={togglePlay}
            className="hover:text-white transition-colors"
            aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
          >
            {isPlaying ? (
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
            ) : (
              <svg
                aria-hidden="true"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </button>
          <button
            type="button"
            onClick={nextTrack}
            className="hover:text-white transition-colors"
            aria-label="Siguiente"
          >
            <svg
              aria-hidden="true"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            </svg>
          </button>
        </div>
      </div>

      {mountedDialog
        ? createPortal(
            <div
              className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-md transition-all duration-300 ease-out ${
                openDialog
                  ? 'bg-slate-950/45 opacity-100'
                  : 'bg-slate-950/0 opacity-0'
              }`}
            >
              <button
                type="button"
                aria-label="Cerrar álbumes"
                onClick={closeAlbums}
                className="absolute inset-0 z-0 cursor-default bg-transparent"
              />
              <div
                className={`relative z-10 w-[min(92vw,900px)] max-h-[86vh] bg-white/12 backdrop-blur-md shadow-2xl border border-white/15 border-t-white/25 border-b-white/5 rounded-4xl p-6 flex flex-col items-stretch transition-all duration-300 ease-out ${
                  openDialog
                    ? 'translate-y-0 scale-100 opacity-100'
                    : 'translate-y-4 scale-95 opacity-0'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
                      Álbumes
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">
                      Elige un álbum
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeAlbums}
                    className="shrink-0 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/20 hover:text-white"
                  >
                    X
                  </button>
                </div>

                <div className="mt-6 flex-1 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-auto">
                  {loading ? (
                    <div className="col-span-full flex items-center justify-center text-white/60">
                      Cargando álbumes...
                    </div>
                  ) : error ? (
                    <div className="col-span-full rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-6 text-sm text-red-100">
                      {error}
                    </div>
                  ) : albums.length === 0 ? (
                    <div className="col-span-full flex items-center justify-center text-white/60">
                      No hay álbumes
                    </div>
                  ) : (
                    albums.map((al) => (
                      <button
                        key={al.slug}
                        type="button"
                        onClick={() => selectAlbum(al)}
                        className={`flex flex-col items-stretch gap-2 rounded-2xl bg-white/8 border p-3 text-left transition-all hover:bg-white/12 hover:border-white/30 ${current?.slug === al.slug ? 'border-white/40 ring-1 ring-white/20' : 'border-white/10'}`}
                      >
                        <div className="relative h-36 w-full overflow-hidden rounded-lg bg-white/5">
                          {al.coverSrc ? (
                            <Image
                              src={al.coverSrc}
                              alt={al.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full bg-white/5" />
                          )}
                        </div>
                        <div className="mt-1">
                          <div className="text-sm font-semibold text-white truncate">
                            {al.title}
                          </div>
                          <div className="text-xs text-white/50">
                            {al.tracks.length} pista
                            {al.tracks.length === 1 ? '' : 's'}
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>

                <div className="mt-3 text-xs text-white/45">
                  {albums.length} álbum{albums.length === 1 ? '' : 'es'}
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
