'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
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

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/* ── Slider shared styles ────────────────────────────────────────────── */

function TrackSlider({
  value,
  max,
  onChange,
  onPointerDown,
  onPointerUp,
  ariaLabel,
}: {
  value: number;
  max: number;
  onChange: (v: number) => void;
  onPointerDown?: () => void;
  onPointerUp?: () => void;
  ariaLabel: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;

  return (
    <div className="group relative flex items-center w-full h-5">
      {/* Track background */}
      <div className="absolute inset-x-0 h-1 rounded-full bg-white/15 group-hover:h-1.5 transition-all" />
      {/* Filled portion */}
      <div
        className="absolute left-0 h-1 rounded-full bg-white/70 group-hover:h-1.5 group-hover:bg-white/90 transition-all"
        style={{ width: `${pct}%` }}
      />
      {/* Thumb (visible on hover) */}
      <div
        className="absolute h-3 w-3 rounded-full bg-white shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ left: `calc(${pct}% - 6px)` }}
      />
      <input
        type="range"
        min={0}
        max={max || 1}
        step="any"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        aria-label={ariaLabel}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
      />
    </div>
  );
}

function VolumeIcon({ level }: { level: number }) {
  if (level === 0) {
    return (
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06a8.99 8.99 0 0 0 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
      </svg>
    );
  }
  if (level < 0.5) {
    return (
      <svg
        aria-hidden="true"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
      </svg>
    );
  }
  return (
    <svg
      aria-hidden="true"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77 0-4.28-2.99-7.86-7-8.77z" />
    </svg>
  );
}

export default function MusicPlayer() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<Album | null>(null);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mountedDialog, setMountedDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

  /* Seek / progress state */
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);

  /* Volume state */
  const [volume, setVolume] = useState(0.8);
  const [prevVolume, setPrevVolume] = useState(0.8);

  /* Expand state */
  const [isExpanded, setIsExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  /* Keep audio volume in sync */
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

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

  const handleTimeUpdate = useCallback(() => {
    if (!isSeeking && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, [isSeeking]);

  function handleLoadedMetadata() {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
      setCurrentTime(0);
    }
  }

  function handleSeek(value: number) {
    setCurrentTime(value);
    if (audioRef.current) {
      audioRef.current.currentTime = value;
    }
  }

  function toggleMute(e: React.MouseEvent) {
    e.stopPropagation();
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    } else {
      setVolume(prevVolume || 0.8);
    }
  }

  return (
    <div className="w-80 rounded-2xl p-1">
      {currentTrack && (
        // biome-ignore lint/a11y/useMediaCaption: music track
        <audio
          ref={audioRef}
          src={currentTrack.src}
          onEnded={handleAudioEnded}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      )}
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: expandable container */}
      {/* biome-ignore lint/a11y/noStaticElementInteractions: expandable container */}
      <div 
        ref={containerRef}
        onClick={() => setIsExpanded(true)}
        className="w-full flex flex-col rounded-2xl bg-black/20 backdrop-blur-xl shadow-2xl border border-white/10 border-t-white/20 border-b-black/50 p-3 cursor-default transition-all"
      >
        {/* Top row: cover + info + controls */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openAlbums}
            className="relative size-14 shrink-0 rounded-xl bg-white/10 overflow-hidden cursor-pointer shadow-lg"
          >
            {current?.coverSrc ? (
              <Image
                src={current.coverSrc}
                alt={current.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-white/5" />
            )}
          </button>
          <div className="flex min-w-0 flex-col gap-0.5 text-left flex-1">
            <span className="truncate text-sm font-semibold text-white shadow-black/50 drop-shadow-sm">
              {currentTrack?.title ?? current?.title ?? 'Unknown Title'}
            </span>
            <span className="truncate text-xs text-white/60">
              {currentTrack?.artist ?? current?.artist ?? 'Unknown Artist'}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/80">
            <button
              type="button"
              onClick={prevTrack}
              className="hover:text-white transition-colors p-1"
              aria-label="Anterior"
            >
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>
            <button
              type="button"
              onClick={togglePlay}
              className="hover:text-white transition-colors p-1.5 rounded-full bg-white/10 hover:bg-white/20"
              aria-label={isPlaying ? 'Pausar' : 'Reproducir'}
            >
              {isPlaying ? (
                <svg
                  aria-hidden="true"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg
                  aria-hidden="true"
                  width="22"
                  height="22"
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
              className="hover:text-white transition-colors p-1"
              aria-label="Siguiente"
            >
              <svg
                aria-hidden="true"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Expandable sliders container */}
        <div
          className={`flex flex-col overflow-hidden transition-all duration-300 ease-out ${
            isExpanded
              ? 'max-h-32 opacity-100 mt-2.5 gap-2.5'
              : 'max-h-0 opacity-0 mt-0 gap-0 pointer-events-none'
          }`}
        >
          {/* Seek slider */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] tabular-nums text-white/45 w-8 text-right shrink-0">
              {formatTime(currentTime)}
            </span>
            <TrackSlider
              value={currentTime}
              max={duration}
              onChange={handleSeek}
              onPointerDown={() => setIsSeeking(true)}
              onPointerUp={() => setIsSeeking(false)}
              ariaLabel="Posición de la canción"
            />
            <span className="text-[10px] tabular-nums text-white/45 w-8 shrink-0">
              {formatTime(duration)}
            </span>
          </div>

          {/* Volume slider */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="text-white/50 hover:text-white/80 transition-colors shrink-0"
              aria-label={volume === 0 ? 'Activar sonido' : 'Silenciar'}
            >
              <VolumeIcon level={volume} />
            </button>
            <div className="w-full">
              <TrackSlider
                value={volume}
                max={1}
                onChange={setVolume}
                ariaLabel="Volumen"
              />
            </div>
          </div>
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
                              sizes="160px"
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
