import type { id } from '@booga/db/schema';

export const idType = (n: id) => {
	switch (typeof n) {
		case 'bigint':
			return BigInt(n);

		case 'number':
			return Number(n);

		default:
			break;
	}
};
