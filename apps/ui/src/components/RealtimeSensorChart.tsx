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
  deviceType?: 'sensors' | 'actuators';
}

export function RealtimeSensorChart({
  sensorAlias: _,
  deviceType = 'sensors',
}: RealtimeSensorChartProps) {
  const [data, setData] = useState<RealtimeDataPoint[]>([]);
  const lastValueRef = useRef(deviceType === 'actuators' ? 0 : 50);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    
    const initialData: RealtimeDataPoint[] = Array.from(
      { length: 10 },
      (_, i) => {
        let randomValue = 50;
        if (deviceType === 'actuators') {
          randomValue = Math.random() > 0.5 ? 100 : 0;
        } else {
          randomValue = 50 + (Math.random() - 0.5) * 20;
        }
        return {
          time: `${i * 10}s`,
          value: randomValue,
        };
      },
    );
    setData(initialData);
    lastValueRef.current =
      initialData[initialData.length - 1]?.value ??
      (deviceType === 'actuators' ? 0 : 50);

    // Update every 1 second
    intervalRef.current = setInterval(() => {
      setData((prevData) => {
        let newValue = 50;
        if (deviceType === 'actuators') {
          // Actuators normally hold state, with occasional toggles
          newValue =
            Math.random() > 0.8
              ? lastValueRef.current === 100
                ? 0
                : 100
              : lastValueRef.current;
        } else {
          newValue = Math.max(
            30,
            Math.min(70, lastValueRef.current + (Math.random() - 0.5) * 8),
          );
        }
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
  }, [deviceType]);

  const isActuator = deviceType === 'actuators';

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorRealtimeValue" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor={isActuator ? '#f59e0b' : '#06b6d4'}
                stopOpacity={0.8}
              />
              <stop
                offset="95%"
                stopColor={isActuator ? '#f59e0b' : '#06b6d4'}
                stopOpacity={0}
              />
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
            ticks={isActuator ? [0, 100] : undefined}
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
                return isActuator
                  ? value === 100
                    ? 'ON'
                    : 'OFF'
                  : value.toFixed(1);
              }
              return value;
            }}
          />
          <Area
            type={isActuator ? 'stepAfter' : 'monotone'}
            dataKey="value"
            stroke={isActuator ? '#f59e0b' : '#06b6d4'}
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
