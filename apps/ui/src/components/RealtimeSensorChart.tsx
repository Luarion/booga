'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface RealtimeDataPoint {
  time: string;
  value: number;
}

interface RealtimeSensorChartProps {
  sensorAlias?: string;
}

export function RealtimeSensorChart({
  sensorAlias: _,
}: RealtimeSensorChartProps) {
  const [data, setData] = useState<RealtimeDataPoint[]>([]);
  const lastValueRef = useRef(50);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Initialize with 10 data points
    const initialData: RealtimeDataPoint[] = Array.from(
      { length: 10 },
      (_, i) => {
        const randomValue = 50 + (Math.random() - 0.5) * 20;
        return {
          time: `${i * 10}s`,
          value: randomValue,
        };
      },
    );
    setData(initialData);
    lastValueRef.current = initialData[initialData.length - 1]?.value ?? 50;

    // Update every 1 second
    intervalRef.current = setInterval(() => {
      setData((prevData) => {
        const newValue = Math.max(
          30,
          Math.min(70, lastValueRef.current + (Math.random() - 0.5) * 8),
        );
        lastValueRef.current = newValue;

        const newPoint: RealtimeDataPoint = {
          time: `${prevData.length * 10}s`,
          value: newValue,
        };

        // Keep only last 30 data points
        const updated = [...prevData, newPoint];
        if (updated.length > 30) {
          updated.shift();
        }
        return updated;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRealtimeValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
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
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#000000cc',
              border: '1px solid #ffffff20',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#ffffff' }}
            formatter={(value) => {
              if (typeof value === 'number') {
                return value.toFixed(1);
              }
              return value;
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="#06b6d4"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorRealtimeValue)"
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
