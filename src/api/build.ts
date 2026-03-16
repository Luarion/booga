const entrypoint = "./src/index.ts";
const outdir = "./dist";

const bundle = await Bun.build({
	entrypoints: [entrypoint],
	outdir: outdir,
	target: "bun",
	minify: true,
});

if (!bundle.success) {
	console.error("Error generando el bundle JS:", bundle.logs);
	process.exit(1);
}

const binary = await Bun.build({
	entrypoints: [entrypoint],
	compile: {
		outfile: `${outdir}/api`,
	},
	minify: true,
	target: "bun",
});

if (!binary.success) {
	console.error("Error generando el binario:", binary.logs);
	process.exit(1);
}

console.info("Success:");
console.info(`- JS Bundle: ${bundle.outputs[0]?.path}`);
console.info(`- Binary: ${binary.outputs[0]?.path}`);
