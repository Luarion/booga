'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

type Album = {
  dir: string;
  name: string;
  cover: string | null;
  tracks: { file: string; name: string }[];
};

export default function MusicPlayer() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [current, setCurrent] = useState<Album | null>(null);
  const [mountedDialog, setMountedDialog] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);

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
          setCurrent(data[0] ?? null);
        }
      })
      .catch(() => setError('Failed loading albums'))
      .finally(() => setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  function openAlbums() {
    setMountedDialog(true);
    setOpenDialog(true);
  }
  function closeAlbums() {
    setOpenDialog(false);
    setTimeout(() => setMountedDialog(false), 260);
  }

  return (
    <div className="h-12 w-1/2 rounded-2xl gap-3 p-2">
      <button
        type="button"
        onClick={openAlbums}
        className="w-full flex items-center gap-3 rounded-2xl bg-white/10 p-2"
      >
        <div className="relative size-8 shrink-0 rounded bg-white/10 overflow-hidden">
          {current?.cover ? (
            <Image
              src={current.cover}
              alt={current.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full bg-white/5" />
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-0.5">
          <span className="truncate text-sm font-semibold">
            {current?.name ?? 'Unknown Title'}
          </span>
          <span className="truncate text-xs text-white/50">
            {current?.tracks?.[0]?.name ?? 'Unknown Artist'}
          </span>
        </div>
        <div className="flex flex-1 items-center gap-2 text-[10px] text-white/40 justify-end">
          <span className="text-xs">
            {current ? `${current.tracks.length} pistas` : ''}
          </span>
        </div>
      </button>

      {mountedDialog ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center px-4 py-6 backdrop-blur-md ${openDialog ? 'bg-slate-950/45' : 'bg-slate-950/0'} transition-all`}
        >
          <button
            type="button"
            className="absolute inset-0 z-0"
            onClick={closeAlbums}
          />
          <div
            className={`relative z-10 w-[min(92vw,900px)] max-h-[86vh] bg-transparent rounded-4xl p-6 transition-all ${openDialog ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.35em] text-white/45">
                  Álbumes
                </p>
                <h3 className="mt-1 text-xl font-semibold text-white">
                  Elige un álbum
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAlbums}
                className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-white/80"
              >
                Cerrar
              </button>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4 overflow-auto max-h-[60vh]">
              {loading ? (
                <div className="col-span-full text-center text-white/60">
                  Cargando álbumes...
                </div>
              ) : error ? (
                <div className="col-span-full text-center text-red-400">
                  {error}
                </div>
              ) : albums.length === 0 ? (
                <div className="col-span-full text-center text-white/60">
                  No hay álbumes
                </div>
              ) : (
                albums.map((al) => (
                  <button
                    key={al.dir}
                    type="button"
                    onClick={() => {
                      setCurrent(al);
                      closeAlbums();
                    }}
                    className="flex flex-col items-stretch gap-2 rounded-2xl bg-black/10 p-3 text-left"
                  >
                    <div className="relative h-36 w-full overflow-hidden rounded-md bg-white/5">
                      {al.cover ? (
                        <Image
                          src={al.cover}
                          alt={al.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/5" />
                      )}
                    </div>
                    <div className="mt-1">
                      <div className="text-sm font-semibold text-white truncate">
                        {al.name}
                      </div>
                      <div className="text-xs text-white/50">
                        {al.tracks.length} pistas
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
