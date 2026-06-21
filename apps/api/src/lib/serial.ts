import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

export interface LedParams {
	brightness: number;
	speed: number;
	saturation: number;
	hueOffset: number;
}

type ParamListener = (params: LedParams) => void;

class SerialManager {
	private params: LedParams = {
		brightness: 128,
		speed: 50,
		saturation: 255,
		hueOffset: 0,
	};

	private ledListeners: Set<ParamListener> = new Set();
	private connected = false;
	private directBridgeProcess: any = null;

	connect(): void {
		if (this.connected) return;
		this.connected = true;
		console.info('[serial] Serial manager connected');

		
		if (process.on && process.send) {
			process.on('message', (msg: any) => {
				try {
					if (msg.type === 'serial:data' && msg.line) {
						const parsed = JSON.parse(msg.line);
						if (parsed.type === 'led-params' && parsed.params) {
							this.params = parsed.params;
							this.notifyListeners();
						}
					}
				} catch (err) {
					
				}
			});
		} else {
			
			this.startDirectBridge();
		}
	}

	private startDirectBridge() {
		const serialPortPath = process.env.SERIAL_PORT;
		if (!serialPortPath) {
			console.info(
				'[serial] SERIAL_PORT not set, direct serial bridge disabled',
			);
			return;
		}

		console.info(
			`[serial] Spawning direct serial bridge on ${serialPortPath}...`,
		);
		const bridgePath = resolve(import.meta.dirname, 'serial-bridge.js');
		this.directBridgeProcess = spawn('node', [bridgePath], {
			stdio: ['pipe', 'pipe', 'inherit'],
			env: process.env,
		});

		this.directBridgeProcess.stdout.on('data', (chunk: Buffer) => {
			const lines = chunk.toString().split('\n');
			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;
				console.info('[serial] Received line from bridge stdout:', trimmed);
				try {
					const parsed = JSON.parse(trimmed);
					if (parsed.type === 'led-params' && parsed.params) {
						this.params = parsed.params;
						this.notifyListeners();
					}
				} catch (err) {
					// Ignore non-JSON or malformed messages
				}
			}
		});

		this.directBridgeProcess.on('exit', (code: number) => {
			console.warn(
				`[serial] Direct serial bridge exited with code ${code}. Reconnecting in 3s...`,
			);
			this.directBridgeProcess = null;
			setTimeout(() => this.startDirectBridge(), 3000);
		});

		this.directBridgeProcess.on('error', (err: any) => {
			console.error('[serial] Direct serial bridge error:', err);
		});
	}

	getParams(): LedParams {
		return { ...this.params };
	}

	setParams(partial: Partial<LedParams>): void {
		console.info('[serial] setParams called with partial update:', partial);
		this.params = { ...this.params, ...partial };
		this.notifyListeners();

		// Send updated params to serial bridge
		if (process.send) {
			console.info(
				'[serial] process.send is available. Dispatching serial:write to primary process:',
				this.params,
			);
			process.send({
				type: 'serial:write',
				line: JSON.stringify({
					type: 'led-params',
					params: this.params,
				}),
			});
		} else if (
			this.directBridgeProcess &&
			this.directBridgeProcess.stdin.writable
		) {
			console.info(
				'[serial] Writing directly to direct bridge stdin:',
				this.params,
			);
			this.directBridgeProcess.stdin.write(
				JSON.stringify({
					type: 'led-params',
					params: this.params,
				}) + '\n',
			);
		} else {
			console.warn(
				'[serial] No way to send update: process.send undefined and direct bridge not writable',
			);
		}
	}

	addListener(listener: ParamListener): void {
		this.ledListeners.add(listener);
	}

	removeListener(listener: ParamListener): void {
		this.ledListeners.delete(listener);
	}

	private notifyListeners(): void {
		for (const listener of this.ledListeners) {
			listener(this.getParams());
		}
	}
}

const serial = new SerialManager();
export default serial;
