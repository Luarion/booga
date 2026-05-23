export const idType = (n: number | bigint | string) => {
	switch (typeof n) {
		case 'bigint':
			return BigInt(n);

		case 'number':
			return Number(n);

		default:
			break;
	}
};
