import { keywords, characters, vars } from './syntax-hightlighting-config.js';

const tab = '<span class="tab"></span>';

let isBlock = false;
let blockType = '';

let listLevel = -1;

function highlight(type, className) {
	return `<span class="${className}">${type}</span>`;
}

function parseMarker(line, marker, replacementTemplate, applyHighlighting) {
	let copy = '';
	let block = '';

	let inLocalBlock = false;

	for (let i = 0; i < line.length; i++) {
		let lookahead = '';

		for (let j = 0; j < marker.length && i + j < line.length; j++) {
			lookahead += line[i + j];
		}

		if (lookahead == marker) {
			if (inLocalBlock) {
				const toAdd = applyHighlighting
					? applySyntaxHighlighting(block)
					: block;

				block = '';

				copy += replacementTemplate.replaceAll('REPLACE', toAdd);
			}

			inLocalBlock = !inLocalBlock;
			i += marker.length - 1;
			continue;
		}

		if (inLocalBlock) {
			block += line[i];
			continue;
		}

		copy += line[i];
	}

	return copy;
}

function finalFormatting(original) {
	let line = original.replaceAll('    ', tab);
	line = line.replaceAll('\t', tab);

	if (line.includes('**')) {
		line = parseMarker(line, '**', '<b>REPLACE</b>');
	}

	if (line.includes('*')) {
		line = parseMarker(line, '*', '<i>REPLACE</i>');
	}

	if (line.includes('`')) {
		line = parseMarker(
			line,
			'`',
			'<div class="generic-block-inline">REPLACE</div>',
			true,
		);
	}

	if (line.includes('==')) {
		line = parseMarker(line, '==', '<span class="marker">REPLACE</span>');
	}

	return line;
}

function handleBlockMarker(line) {
	if (!isBlock) {
		blockType = line.slice(3);
		let className = 'generic-block ' + line.slice(3);

		isBlock = true;
		return `<div class="${className}">`;
	}

	isBlock = false;
	return '</div>';
}

function handleHeader(line) {
	let count = 0;

	for (let i = 0; i < line.length; i++) {
		if (line[i] != '#') break;
		count++;
	}

	return `<h${count}>${finalFormatting(line.slice(count + 1))}</h${count}>`;
}

function handleList(line) {
	return `<li>${finalFormatting(line.slice(2))}</li>`;
}

function applySyntaxHighlighting(line) {
	let formatted = line;
	let copy = '';

	for (let i = 0; i < formatted.length; i++) {
		copy += characters.includes(formatted[i])
			? highlight(formatted[i], 'character')
			: formatted[i];
	}

	formatted = copy;

	for (let keyword of vars) {
		formatted = formatted.replaceAll(
			keyword,
			highlight(keyword, 'vartype'),
		);
	}

	for (let keyword of keywords) {
		formatted = formatted.replaceAll(
			keyword,
			highlight(keyword, 'keyword'),
		);
	}

	if (line.includes("'")) {
		formatted = parseMarker(
			formatted,
			"'",
			'<span class="green">\'REPLACE\'</span>',
		);
	}

	return `${finalFormatting(formatted)}`;
}

function handleListDepth(line) {
	const indentation = line.length - line.trimStart().length;
	const correctListLevel = indentation / 4;

	console.log(correctListLevel + ' VS list depth: ' + listLevel);

	const difference = listLevel - correctListLevel;

	const correction = (correctListLevel < listLevel ? '</ul>' : '<ul>').repeat(
		Math.abs(difference),
	);

	listLevel -= difference;
	return correction + handleList(line.trim());
}

function processLine(line) {
	let curr = '';

	console.log(listLevel + ', ' + !line.trim().startsWith('-'));

	if (listLevel >= 0 && !line.trim().startsWith('-')) {
		curr += '</ul>'.repeat(listLevel - -1);
		listLevel = -1;
	}

	if (line.trim().startsWith('-') && !isBlock)
		return curr + handleListDepth(line);
	if (line.startsWith('```')) return curr + handleBlockMarker(line);
	if (line.trim() == '') return curr + (isBlock ? '<br>' : '');
	if (line.trim().startsWith('#') && !isBlock)
		return curr + handleHeader(line);
	if (line.trim().startsWith('<') && !isBlock)
		return curr + `${finalFormatting(line)}`;
	if (!isBlock) return curr + `<p>${finalFormatting(line)}</p>`;
	if (blockType.includes('ad')) return curr + `${finalFormatting(line)}`;
	return curr + applySyntaxHighlighting(line) + '<br>';
}

function renderFile(lines) {
	let constructedHtml = '';

	for (const original of lines) {
		const curr = processLine(original);
		constructedHtml += curr;
		console.log(curr);
		console.log('is block: ' + isBlock);
	}

	return constructedHtml;
}

export async function parseMarkdown(filename) {
	const file = await fetch(filename).then((r) => r.text());
	const lines = file.split('\r\n');

	let constructedHtml = JSON.parse(JSON.stringify(renderFile(lines).trim()));
	console.log(constructedHtml);

	document.querySelector('.md-container').innerHTML = constructedHtml;
}
