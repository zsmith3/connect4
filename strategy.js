// STRATEGY 1: Random

// Pick a move completely at random
function stratRandom(counters) {
	let x = null;
	while (x === null || counters[x].length >= HEIGHT) x = Math.floor(Math.random() * WIDTH);

	return x;
}

// STRATEGY 2: Very simple look ahead (1 move)

// Get number of sequences of each length for each player
function getStrings(counters) {
	let countersDone = [];
	for (let x = 0; x < WIDTH; x++) {
		countersDone[x] = [];
		for (let y = 0; y < HEIGHT; y++) {
			if (counters[x].length >= HEIGHT - y) countersDone[x][y] = counters[x][HEIGHT - y - 1];
			else countersDone[x][y] = -1;
		}
	}

	let counts = [
		[0, 0, 0, 0, 0],
		[0, 0, 0, 0, 0],
	];

	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < WIDTH; x++) {
			if (countersDone[x][y] !== -1) {
				if (x === 0 || countersDone[x - 1][y] !== countersDone[x][y]) {
					let len = 1;
					for (; len < 4 && x + len < WIDTH; len++) if (countersDone[x + len][y] != countersDone[x][y]) break;
					counts[countersDone[x][y]][len]++;
				}
				if (y === 0 || countersDone[x][y - 1] !== countersDone[x][y]) {
					let len = 1;
					for (; len < 4 && y + len < HEIGHT; len++) if (countersDone[x][y + len] != countersDone[x][y]) break;
					counts[countersDone[x][y]][len]++;
				}
				if (x === 0 || y === 0 || countersDone[x - 1][y - 1] !== countersDone[x][y]) {
					let len = 1;
					for (; len < 4 && x + len < WIDTH && y + len < HEIGHT; len++) if (countersDone[x + len][y + len] != countersDone[x][y]) break;
					counts[countersDone[x][y]][len]++;
				}
				if (x === 0 || y === HEIGHT - 1 || countersDone[x - 1][y + 1] !== countersDone[x][y]) {
					let len = 1;
					for (; len < 4 && x + len < WIDTH && y - len >= 0; len++) if (countersDone[x + len][y - len] != countersDone[x][y]) break;
					counts[countersDone[x][y]][len]++;
				}
			}
		}
	}

	return counts;
}

// Look ahead by one move and attempt to score outcomes
function stratAhead1(counters) {
	let minScore = 1000;
	let bestX = 0;
	for (let x = 0; x < WIDTH; x++) {
		if (counters[x].length < HEIGHT) {
			let score = 0;
			counters[x].push(1);
			for (let x2 = 0; x2 < WIDTH; x2++) {
				counters[x2].push(0);
				let results = getStrings(counters);
				score += 100 * results[0][4] + 10 * results[0][3] + results[0][2];
				counters[x2].pop();
			}
			counters[x].pop();
			if (score < minScore) {
				minScore = score;
				bestX = x;
			}
		}
	}

	return bestX;
}

// STRATEGY 3: Simple look ahead (6 moves)

// Detect if the last counter placed leads to a win
function detectNewWin(counters, newX) {
	let countersDone = [];
	for (let x = 0; x < WIDTH; x++) {
		countersDone[x] = [];
		for (let y = 0; y < HEIGHT; y++) {
			if (counters[x].length >= HEIGHT - y) countersDone[x][y] = counters[x][HEIGHT - y - 1];
			else countersDone[x][y] = -1;
		}
	}
	let newY = HEIGHT - counters[newX].length;

	for (let dy = -1; dy <= 1; dy++) {
		for (let dx = -1; dx <= 1; dx++) {
			if (dx === 0 && dy === 0) continue;

			let win = true;
			for (let i = 1; i < 4; i++) {
				let x2 = newX + dx * i;
				let y2 = newY + dy * i;
				if (x2 < 0 || x2 >= WIDTH || y2 < 0 || y2 >= HEIGHT || countersDone[x2][y2] !== countersDone[newX][newY]) {
					win = false;
					break;
				}
			}
			if (win) return true;
		}
	}

	return false;
}

// Look ahead by 5 moves and score by counting how many outcomes result in victory/defeat
function stratAhead2(counters) {
	var movesAhead = 3;
	var nMoves = movesAhead * 2 - 1;
	var nSequences = Math.pow(WIDTH, nMoves);
	var maxScore = -10000;
	var bestX = 0;
	// Try each move
	for (let x = 0; x < WIDTH; x++) {
		if (counters[x].length >= HEIGHT) continue;

		var score = 0;
		// Iterate over all possible sequences for the next few moves
		for (let seq = 0; seq < nSequences; seq++) {
			// Construct sequence of moves
			let moves = [x];
			let curseq = seq;
			for (let p = nMoves - 1; p >= 0; p--) {
				let pow = Math.pow(WIDTH, p);
				moves.push(Math.floor(curseq / pow));
				curseq %= pow;
			}

			// Apply moves to new counters array and detect victory/defeat
			let newCounters = [];
			for (let x2 = 0; x2 < WIDTH; x2++) {
				newCounters[x2] = [];
				for (let c of counters[x2]) newCounters[x2].push(c);
			}
			let curplayer = 1;
			for (let x2 of moves) {
				if (newCounters[x2].length >= HEIGHT) break;
				newCounters[x2].push(curplayer);
				if (detectNewWin(newCounters, x2)) {
					if (curplayer === 1) score += 1;
					else score -= 1;
					break;
				}
				curplayer = 1 - curplayer;
			}
		}
		if (score > maxScore) {
			maxScore = score;
			bestX = x;
		}
	}

	return bestX;
}

// All strategy functions
const STRATEGIES = {
	Random: stratRandom,
	["Look ahead 1"]: stratAhead1,
	["Look ahead 2"]: stratAhead2,
};
