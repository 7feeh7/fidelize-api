import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import esbuild from "esbuild";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, "..");
const outDir = path.join(root, "dist/lambda");
const zipPath = path.join(root, "dist/lambda.zip");

const packageJson = JSON.parse(
	fs.readFileSync(path.join(root, "package.json"), "utf8"),
);

const pgVersion = packageJson.dependencies.pg;
const bcryptVersion = packageJson.dependencies.bcrypt;

const knexOptionalDrivers = [
	"better-sqlite3",
	"mysql",
	"mysql2",
	"mariadb",
	"mariadb/callback",
	"tedious",
	"oracledb",
	"pg-native",
	"sqlite3",
];

function resolveAliasImport(relativePath) {
	const basePath = path.join(root, "src", relativePath);
	const candidates = [
		basePath,
		`${basePath}.ts`,
		`${basePath}.tsx`,
		`${basePath}.js`,
		`${basePath}.mjs`,
		path.join(basePath, "index.ts"),
	];

	for (const candidate of candidates) {
		if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
			return candidate;
		}
	}

	return null;
}

const aliasPlugin = {
	name: "path-alias",
	setup(build) {
		build.onResolve({ filter: /^@\// }, (args) => {
			const resolved = resolveAliasImport(args.path.slice(2));

			if (!resolved) {
				return {
					errors: [
						{
							text: `Não foi possível resolver o alias ${args.path}`,
						},
					],
				};
			}

			return { path: resolved };
		});
	},
};

function run(command, options = {}) {
	execSync(command, { stdio: "inherit", ...options });
}

function createZip(sourceDir, destinationZip) {
	if (fs.existsSync(destinationZip)) {
		fs.unlinkSync(destinationZip);
	}

	if (process.platform === "win32") {
		const sourceGlob = path.join(sourceDir, "*").replace(/\\/g, "/");
		const destination = destinationZip.replace(/\\/g, "/");
		run(
			`powershell -NoProfile -Command "Compress-Archive -Path '${sourceGlob}' -DestinationPath '${destination}' -Force"`,
		);
		return;
	}

	run(`zip -r "${destinationZip}" .`, { cwd: sourceDir });
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

await esbuild.build({
	entryPoints: [path.join(root, "src/lambda.ts")],
	bundle: true,
	platform: "node",
	target: "node24",
	format: "cjs",
	outfile: path.join(outDir, "index.js"),
	external: ["pg", "bcrypt", ...knexOptionalDrivers],
	plugins: [aliasPlugin],
});

const mountPath =
	process.platform === "win32" ? outDir.replace(/\\/g, "/") : outDir;

run(
	`docker run --rm --entrypoint npm -v "${mountPath}:/var/task" -w /var/task public.ecr.aws/lambda/nodejs:24 install pg@${pgVersion} bcrypt@${bcryptVersion} --omit=dev`,
);

createZip(outDir, zipPath);

console.info(`Pacote Lambda gerado em ${zipPath}`);
