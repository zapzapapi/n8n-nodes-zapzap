const path = require('path');
const { task, src, dest } = require('gulp');

// Copia os ícones SVG/PNG dos nodes e credentials para dist/ mantendo a estrutura.
// Padrão oficial do n8n-nodes-starter.
task('build:icons', copyIcons);

function copyIcons() {
	const nodeSource = path.resolve('nodes', '**', '*.{png,svg}');
	const nodeDestination = path.resolve('dist', 'nodes');

	src(nodeSource, { encoding: false }).pipe(dest(nodeDestination));

	const credSource = path.resolve('credentials', '**', '*.{png,svg}');
	const credDestination = path.resolve('dist', 'credentials');

	return src(credSource, { encoding: false }).pipe(dest(credDestination));
}
