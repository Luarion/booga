'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import api from '@/lib/eden';

interface Reading {
  sensor_id: number | string;
  value: string;
  timestamp: Date;
}

interface SensorChartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  sensorId: number | null;
  sensorAlias: string;
}

export function SensorChartDialog({
  isOpen,
  onClose,
  sensorId,
  sensorAlias,
}: SensorChartDialogProps) {
  const [readings, setReadings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReadings = useCallback(async () => {
    if (!sensorId) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error, status } =
        await api.api.sensors[sensorId].readings.get();

      if (error) {
        setError(
          typeof error.value === 'string' ? error.value : 'Error fetching data',
        );
      } else if (data) {
        // Format the data for Recharts (e.g. format dates to string, values to number)
        const formatted = data
          .map((d: Reading) => ({
            time: new Date(d.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
            value: parseFloat(d.value),
          }))
          .reverse(); // Reverse to have chronological order (oldest to newest)
        setReadings(formatted);
      }
    } catch (err) {
      setError('Unexpected error fetching readings');
    } finally {
      setLoading(false);
    }
  }, [sensorId]);

  useEffect(() => {
    if (isOpen) {
      fetchReadings();
    }
  }, [isOpen, fetchReadings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog content */}
      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/10 bg-black/60 p-8 shadow-2xl shadow-purple-500/10 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              {sensorAlias}
            </span>{' '}
            Histórico
          </h2>
          <button
            onClick={onClose}
            className="rounded-full bg-white/5 p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="h-[400px] w-full">
          {loading ? (
            <div className="flex h-full w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            </div>
          ) : error ? (
            <div className="flex h-full w-full items-center justify-center text-red-400">
              {error}
            </div>
          ) : readings.length === 0 ? (
            <div className="flex h-full w-full items-center justify-center text-white/50">
              No hay lecturas para este sensor.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={readings}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#ffffff15"
                  vertical={false}
                />
                <XAxis
                  dataKey="time"
                  stroke="#ffffff50"
                  tick={{ fill: '#ffffff50', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#ffffff50"
                  tick={{ fill: '#ffffff50', fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    color: '#fff',
                  }}
                  itemStyle={{ color: '#a855f7' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#a855f7"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
