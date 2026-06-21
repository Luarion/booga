'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { getApiBaseUrl } from '@/lib/apiBaseUrl';

export interface LedParams {
  brightness: number;
  speed: number;
  saturation: number;
  hueOffset: number;
}


export function useLedControl(active = false) {
  const [params, setParams] = useState<LedParams>({
    brightness: 128,
    speed: 50,
    saturation: 255,
    hueOffset: 0,
  });
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const backoffRef = useRef(3000);

  
  const lastSentRef = useRef<number>(0);
  const pendingUpdateRef = useRef<Partial<LedParams> | null>(null);
  const throttleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (throttleTimerRef.current) {
      clearTimeout(throttleTimerRef.current);
      throttleTimerRef.current = null;
    }
    pendingUpdateRef.current = null;
    if (wsRef.current) {
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.onmessage = null;
      wsRef.current.onopen = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  useEffect(() => {
    if (!active) {
      cleanup();
      backoffRef.current = 3000;
      return;
    }

    let cancelled = false;

    function connect() {
      if (cancelled) return;

      const baseUrl = getApiBaseUrl();
      const cleanBaseUrl = baseUrl.replace(/\/api\/?$/, '');
      const wsUrl = cleanBaseUrl.replace(/^http/, 'ws') + '/api/leds/ws';

      console.info(`[LED] Connecting to WebSocket: ${wsUrl}`);
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.info('[LED] WebSocket connection established');
        setConnected(true);
        backoffRef.current = 3000; // Reset backoff on success
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setParams((prev) => ({ ...prev, ...data }));
        } catch (err) {
          console.error('[LED] Failed to parse WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        if (cancelled) return;
        console.warn('[LED] WebSocket connection closed, retrying…');
        setConnected(false);
        scheduleReconnect();
      };

      ws.onerror = () => {
        // onclose fires after onerror — no need to double-log
      };
    }

    function scheduleReconnect() {
      if (cancelled || reconnectTimerRef.current) return;
      const delay = backoffRef.current;
      backoffRef.current = Math.min(delay * 1.5, 30000); // Cap at 30 s
      reconnectTimerRef.current = setTimeout(() => {
        reconnectTimerRef.current = null;
        connect();
      }, delay);
    }

    connect();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, [active, cleanup]);

  const sendUpdate = useCallback((update: Partial<LedParams>) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(update));
    }
  }, []);

  const updateParam = useCallback(
    (partial: Partial<LedParams>) => {
      setParams((prev) => {
        const nextParams = { ...prev, ...partial };

        // Accumulate the updates
        pendingUpdateRef.current = { ...pendingUpdateRef.current, ...partial };

        const now = Date.now();
        const timeSinceLastSend = now - lastSentRef.current;

        if (timeSinceLastSend >= 60) {
          if (throttleTimerRef.current) {
            clearTimeout(throttleTimerRef.current);
            throttleTimerRef.current = null;
          }
          sendUpdate(pendingUpdateRef.current!);
          pendingUpdateRef.current = null;
          lastSentRef.current = now;
        } else {
          if (!throttleTimerRef.current) {
            throttleTimerRef.current = setTimeout(() => {
              throttleTimerRef.current = null;
              if (pendingUpdateRef.current) {
                sendUpdate(pendingUpdateRef.current);
                pendingUpdateRef.current = null;
                lastSentRef.current = Date.now();
              }
            }, 60 - timeSinceLastSend);
          }
        }

        return nextParams;
      });
    },
    [sendUpdate],
  );

  return {
    params,
    connected,
    updateParam,
  };
}
