import { Elysia, t } from 'elysia';
import serial, { type LedParams } from '@/lib/serial';

// Initialize serial connection when the module loads
serial.connect();

const ledParamsSchema = t.Object({
	brightness: t.Integer({ minimum: 0, maximum: 255 }),
	speed: t.Integer({ minimum: 1, maximum: 100 }),
	saturation: t.Integer({ minimum: 0, maximum: 255 }),
	hueOffset: t.Integer({ minimum: 0, maximum: 255 }),
});

const plugin = new Elysia({
	prefix: '/leds',
	detail: { tags: ['leds'] },
})
	.get('/status', ({ status }) => status(200, serial.getParams()), {
		response: { 200: ledParamsSchema },
	})
	.ws('/ws', {
		body: t.Object({
			brightness: t.Optional(t.Integer({ minimum: 0, maximum: 255 })),
			speed: t.Optional(t.Integer({ minimum: 1, maximum: 100 })),
			saturation: t.Optional(t.Integer({ minimum: 0, maximum: 255 })),
			hueOffset: t.Optional(t.Integer({ minimum: 0, maximum: 255 })),
		}),

		open(ws) {
			// Send current state to newly connected client
			ws.send(JSON.stringify(serial.getParams()));

			// Register a listener so this client receives updates from the ESP32
			const listener = (params: LedParams) => {
				ws.send(JSON.stringify(params));
			};
			// Store the listener reference on the ws object for cleanup
			(ws.data as any).__ledListener = listener;
			serial.addListener(listener);
		},

		message(_ws, data) {
			console.info('[ws] Received parameter update from UI:', data);
			// Forward partial param updates to the ESP32
			serial.setParams(data as Partial<LedParams>);
		},

		close(ws) {
			const listener = (ws.data as any).__ledListener;
			if (listener) {
				serial.removeListener(listener);
			}
		},
	});

export default plugin;
