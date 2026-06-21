'use client';

import { ModalHeader } from '@/components/ModalHeader';
import { ModalOverlay } from '@/components/ModalOverlay';
import type { LedParams } from '@/hooks/useLedControl';

interface LedControlPanelProps {
  mounted: boolean;
  open: boolean;
  onClose: () => void;
  params: LedParams;
  connected: boolean;
  onParamChange: (partial: Partial<LedParams>) => void;
}

export function LedControlPanel({
  mounted,
  open,
  onClose,
  params,
  connected,
  onParamChange,
}: LedControlPanelProps) {
  const baseHue = (params.hueOffset / 255) * 360;
  const sat = (params.saturation / 255) * 100;
  const bright = (params.brightness / 255) * 100;

  // Calculate speed: higher speed = shorter animation duration. Max speed = 100, min speed = 1.
  const duration =
    params.speed > 0 ? `${Math.max(0.5, (101 - params.speed) / 10)}s` : '0s';

  const statusIndicator = (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5">
      {connected ? (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500"></span>
          </span>
          <span className="text-xs font-semibold text-green-400">
            Conectado
          </span>
        </>
      ) : (
        <>
          <span className="relative flex h-2.5 w-2.5">
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500 animate-pulse"></span>
          </span>
          <span className="text-xs font-semibold text-rose-400">
            Desconectado
          </span>
        </>
      )}
    </div>
  );

  return (
    <ModalOverlay mounted={mounted} open={open} onClose={onClose} width="850px">
      <ModalHeader
        subtitle="Parámetros en Tiempo Real"
        title="Controlador de Tira LED"
        onClose={onClose}
        actions={statusIndicator}
      />

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Controls */}
        <div className="flex flex-col gap-5">
          {/* Brightness */}
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/15 p-4 transition-all hover:bg-black/25">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-white/80">Brillo</span>
              <span className="font-mono text-amber-400 font-bold">
                {params.brightness}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={params.brightness}
              onChange={(e) =>
                onParamChange({ brightness: Number(e.target.value) })
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-amber-400 hover:accent-amber-300 focus:outline-none"
            />
          </div>

          {/* Speed */}
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/15 p-4 transition-all hover:bg-black/25">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-white/80">
                Velocidad de Animación
              </span>
              <span className="font-mono text-purple-400 font-bold">
                {params.speed}
              </span>
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={params.speed}
              onChange={(e) => onParamChange({ speed: Number(e.target.value) })}
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-purple-500 hover:accent-purple-400 focus:outline-none"
            />
          </div>

          {/* Saturation */}
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/15 p-4 transition-all hover:bg-black/25">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-white/80">Saturación</span>
              <span className="font-mono text-blue-400 font-bold">
                {params.saturation}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={params.saturation}
              onChange={(e) =>
                onParamChange({ saturation: Number(e.target.value) })
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-blue-400 hover:accent-blue-300 focus:outline-none"
            />
          </div>

          {/* Hue Offset */}
          <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/15 p-4 transition-all hover:bg-black/25">
            <div className="flex justify-between items-center text-sm">
              <span className="font-semibold text-white/80">
                Desplazamiento de Tono
              </span>
              <span className="font-mono text-emerald-400 font-bold">
                {params.hueOffset}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="255"
              value={params.hueOffset}
              onChange={(e) =>
                onParamChange({ hueOffset: Number(e.target.value) })
              }
              className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-white/10 accent-emerald-400 hover:accent-emerald-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Preview */}
        <div className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-black/35 p-6 shadow-inner overflow-hidden min-h-[280px]">
          <style
            dangerouslySetInnerHTML={{
              __html: `
            @keyframes moveGradient {
              0% { background-position: 0% 50%; }
              100% { background-position: 300% 50%; }
            }
          `,
            }}
          />

          <div className="absolute inset-0 z-0">
            <div
              className="h-full w-full transition-all duration-300"
              style={{
                backgroundImage: `linear-gradient(90deg, 
                  hsl(${baseHue}, ${sat}%, 50%), 
                  hsl(${(baseHue + 120) % 360}, ${sat}%, 50%), 
                  hsl(${(baseHue + 240) % 360}, ${sat}%, 50%), 
                  hsl(${baseHue}, ${sat}%, 50%)
                )`,
                backgroundSize: '300% 100%',
                opacity: Math.max(0.05, bright / 255),
                animation:
                  params.speed > 0
                    ? `moveGradient ${duration} linear infinite`
                    : 'none',
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-slate-950/70" />
          </div>

          <div className="relative z-10 flex flex-col h-full justify-between gap-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-white/60">
                Vista previa del efecto
              </h3>
              <p className="text-xs text-white/40 mt-1">
                Simulación del efecto Plasma 2D basado en FastLED
              </p>
            </div>

            {/* Simulated LED strip */}
            <div className="relative flex items-center justify-center py-8">
              {/* Simulated LEDs as a grid of glowing dots */}
              <div className="grid grid-cols-8 gap-1.5 w-fit p-3 rounded-2xl bg-black/60 border border-white/5 backdrop-blur-sm shadow-lg justify-items-center">
                {Array.from({ length: 32 }).map((_, i) => {
                  const pixelHue = (baseHue + i * 11) % 360;
                  return (
                    <div
                      key={i}
                      className="size-3 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: `hsl(${pixelHue}, ${sat}%, ${Math.max(10, bright * 0.75)}%)`,
                        boxShadow:
                          bright > 20
                            ? `0 0 8px 2px hsl(${pixelHue}, ${sat}%, 50%)`
                            : 'none',
                        opacity: Math.max(0.2, bright / 255),
                      }}
                    />
                  );
                })}
              </div>
            </div>

            <div className="text-[10px] text-white/30 text-right">
              Plasma 2D (FastLED) • GPIO 4
            </div>
          </div>
        </div>
      </div>
    </ModalOverlay>
  );
}
