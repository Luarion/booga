import type { id } from '@/db/schema/common';

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
