import readline from 'node:readline';
import { SerialPort } from 'serialport';

const SERIAL_PORT = process.env.SERIAL_PORT || '/dev/ttyUSB0';
const BAUD_RATE = parseInt(process.env.BAUD_RATE || '115200', 10);

let port = null;
let isConnected = false;

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: false,
});

function connect() {
	try {
		port = new SerialPort({
			path: SERIAL_PORT,
			baudRate: BAUD_RATE,
		});

		
		let buffer = '';

		port.on('data', (data) => {
			buffer += data.toString();
			const lines = buffer.split('\n');
			buffer = lines.pop() || ''; 

			for (const line of lines) {
				const trimmed = line.trim();
				if (trimmed) {
					try {
						JSON.parse(trimmed);
						
						console.log(trimmed);
					} catch (err) {
						
					}
				}
			}
		});

		port.on('error', (err) => {
			console.error('[serial-bridge] Port error:', err.message);
			isConnected = false;
			scheduleReconnect();
		});

		port.on('close', () => {
			console.error('[serial-bridge] Port closed');
			isConnected = false;
			scheduleReconnect();
		});

		port.on('open', () => {
			console.error('[serial-bridge] Port opened successfully');
			isConnected = true;
		});
	} catch (err) {
		console.error('[serial-bridge] Failed to open port:', err.message);
		scheduleReconnect();
	}
}

function scheduleReconnect() {
	setTimeout(connect, 5000);
}


rl.on('line', (line) => {
	console.error('[serial-bridge] Received command on stdin:', line);
	try {
		const data = JSON.parse(line);
		if (port && isConnected) {
			console.error('[serial-bridge] Writing to serial port:', line);
			port.write(line + '\n', (err) => {
				if (err) {
					console.error(
						'[serial-bridge] Error writing to serial port:',
						err.message,
					);
				} else {
					console.error('[serial-bridge] Serial port write successful');
				}
			});
		} else {
			console.error(
				'[serial-bridge] Cannot write: port open =',
				!!port,
				'connected =',
				isConnected,
			);
		}
	} catch (err) {
		console.error('[serial-bridge] Failed to parse command JSON:', err.message);
	}
});

rl.on('close', () => {
	process.exit(0);
});

process.on('SIGTERM', () => {
	if (port) {
		port.close();
	}
	process.exit(0);
});

process.on('SIGINT', () => {
	if (port) {
		port.close();
	}
	process.exit(0);
});

connect();
