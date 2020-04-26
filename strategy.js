// Pick a move completely at random
function stratRandom(counters) {
	let x = null;
	while (x === null || counters[x].length >= HEIGHT) x = Math.floor(Math.random() * WIDTH);

	return x;
}

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
function stratOneAhead(counters) {
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

// All strategy functions
const STRATEGIES = {
	Random: stratRandom,
	["One move ahead"]: stratOneAhead,
};
