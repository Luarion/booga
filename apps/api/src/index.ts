import { spawn } from 'node:child_process';
import cluster from 'node:cluster';
import os from 'node:os';
import { resolve } from 'node:path';
import process from 'node:process';

const useCluster =
	process.env.NODE_ENV === 'production' && typeof Bun === 'undefined';

if (useCluster && cluster.isPrimary) {
	const workers = new Set<any>();

	function setupWorker(worker: any) {
		workers.add(worker);
		worker.on('message', (message: any) => {
			console.info(
				`[primary] Direct worker message from ${worker.id}:`,
				message,
			);
			if (message && message.type === 'serial:write') {
				if (bridgeProcess && bridgeProcess.stdin.writable) {
					console.info('[primary] Writing to serial bridge:', message.line);
					bridgeProcess.stdin.write(message.line + '\n');
				} else {
					console.warn('[primary] Serial bridge not writable or not started');
				}
			}
		});
	}

	// Start the workers
	const numWorkers = os.availableParallelism();
	for (let i = 0; i < numWorkers; i++) {
		const worker = cluster.fork();
		setupWorker(worker);
	}

	// Manage workers lifetime
	cluster.on('exit', (worker) => {
		console.warn(`Worker ${worker.process.pid} died. Restarting...`);
		workers.delete(worker);
		const newWorker = cluster.fork();
		setupWorker(newWorker);
	});

	// Bridge child process variable
	let bridgeProcess: any = null;
	let reconnectTimer: any = null;

	function startBridge() {
		const serialPortPath = process.env.SERIAL_PORT;
		if (!serialPortPath) {
			console.info('[primary] SERIAL_PORT not set, serial bridge disabled');
			return;
		}

		console.info(`[primary] Starting serial bridge on ${serialPortPath}...`);
		const bridgePath = resolve(import.meta.dirname, 'lib/serial-bridge.js');
		bridgeProcess = spawn('node', [bridgePath], {
			stdio: ['pipe', 'pipe', 'inherit'],
			env: process.env,
		});

		bridgeProcess.stdout.on('data', (chunk: Buffer) => {
			const lines = chunk.toString().split('\n');
			for (const line of lines) {
				const trimmed = line.trim();
				if (!trimmed) continue;

				// Broadcast to all workers
				for (const worker of workers) {
					if (worker.isConnected()) {
						worker.send({ type: 'serial:data', line: trimmed });
					}
				}
			}
		});

		bridgeProcess.on('exit', (code: number) => {
			console.warn(`[primary] Serial bridge exited with code ${code}.`);
			bridgeProcess = null;
			scheduleReconnect();
		});

		bridgeProcess.on('error', (err: any) => {
			console.error('[primary] Serial bridge error:', err);
		});
	}

	function scheduleReconnect() {
		if (reconnectTimer) return;
		reconnectTimer = setTimeout(() => {
			reconnectTimer = null;
			startBridge();
		}, 3000);
	}

	// Listen to messages from workers
	cluster.on('message', (worker, message) => {
		console.info(
			`[primary] Received message from worker ${worker?.id || 'unknown'}:`,
			message,
		);
		if (message && message.type === 'serial:write') {
			if (bridgeProcess && bridgeProcess.stdin.writable) {
				console.info('[primary] Writing to serial bridge:', message.line);
				bridgeProcess.stdin.write(message.line + '\n');
			} else {
				console.warn('[primary] Serial bridge not writable or not started');
			}
		}
	});

	// Start the serial bridge
	startBridge();
} else {
	await import('./server');
	console.log(`Worker ${process.pid} started`);
}
