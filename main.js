// Constants
const HEIGHT = 6;
const WIDTH = 7;

// Setup the board
function initialSetup() {
	for (let name in STRATEGIES) {
		$("<option></option>").attr("value", name).text(name).appendTo("#option_strategy");
	}

	for (let y = 0; y < HEIGHT + 1; y++) {
		for (let x = 0; x < WIDTH; x++) {
			$("<div></div>")
				.addClass("slot")
				.attr("id", "slot" + (y * WIDTH + x).toString())
				.appendTo("#board");
		}
	}

	for (let i = WIDTH * HEIGHT; i < WIDTH * (HEIGHT + 1); i++) {
		$("#slot" + i).addClass("buttonslot");
		$("<button></button>")
			.addClass("button")
			.text("Choose")
			.attr("id", "button" + (i - WIDTH * HEIGHT))
			.click((event) => addCounter(parseInt(event.currentTarget.id.substr(6)), 0))
			.appendTo("#slot" + i);
	}

	updateScale();
}

// Update board scaling initially/on resize
function updateScale() {
	var boardWidth = Math.min(window.innerWidth - 100, ((window.innerHeight - 100) * WIDTH) / (HEIGHT + 1));
	$("#board").css({ width: boardWidth + "px", height: (boardWidth * (HEIGHT + 1)) / WIDTH + "px" });
	var slotSize = boardWidth / WIDTH;
	for (let y = 0; y < HEIGHT + 1; y++) {
		for (let x = 0; x < WIDTH; x++) {
			$("#slot" + (y * WIDTH + x).toString()).css({ width: slotSize + "px", height: slotSize + "px", left: slotSize * x + "px", top: slotSize * y + "px" });
		}
	}
}

// Reset the game to play again
function resetGame() {
	counters = [];
	for (let i = 0; i < WIDTH; i++) counters.push([]);
	gameOver = false;

	$("#endgame").css("display", "none");
	$(".counter").remove();
	$(".button").attr("disabled", false);
}

// Add counter for either player or CPU
function addCounter(x, player) {
	let y = HEIGHT - counters[x].length - 1;
	$(".last_counter").removeClass("last_counter");
	$("<div></div>")
		.addClass("counter last_counter counter_" + player)
		.appendTo("#slot" + (y * WIDTH + x));
	counters[x].push(player);

	onTurnDone();

	if (player === 0 && !gameOver) setTimeout(cpuTurn, 1);
}

// Run updates after a turn has been taken
function onTurnDone() {
	updateButtons();

	updateWin();
}

// Disable buttons as needed
function updateButtons() {
	for (let x = 0; x < WIDTH; x++) {
		if (counters[x].length >= HEIGHT) $("#button" + x).attr("disabled", true);
	}
}

// Detect if a player has won
function detectWin() {
	let countersDone = [];
	for (let x = 0; x < WIDTH; x++) {
		countersDone[x] = [];
		for (let y = 0; y < HEIGHT; y++) {
			if (counters[x].length >= HEIGHT - y) countersDone[x][y] = counters[x][HEIGHT - y - 1];
			else countersDone[x][y] = -1;
		}
	}

	for (let y = 0; y < HEIGHT; y++) {
		for (let x = 0; x < WIDTH; x++) {
			if (countersDone[x][y] !== -1) {
				if (x + 4 <= WIDTH) {
					let win = true;
					for (let i = 1; i < 4; i++) if (countersDone[x + i][y] != countersDone[x][y]) win = false;
					if (win) return countersDone[x][y];
				}
				if (y + 4 <= HEIGHT) {
					let win = true;
					for (let i = 1; i < 4; i++) if (countersDone[x][y + i] != countersDone[x][y]) win = false;
					if (win) return countersDone[x][y];
				}
				if (x + 4 <= WIDTH && y + 4 <= HEIGHT) {
					let win = true;
					for (let i = 1; i < 4; i++) if (countersDone[x + i][y + i] != countersDone[x][y]) win = false;
					if (win) return countersDone[x][y];
				}
				if (x + 4 <= WIDTH && y >= 3) {
					let win = true;
					for (let i = 1; i < 4; i++) if (countersDone[x + i][y - i] != countersDone[x][y]) win = false;
					if (win) return countersDone[x][y];
				}
			}
		}
	}

	return -1;
}

// Show the endgame screen on victory/defeat
function updateWin() {
	let result = detectWin();
	if (result !== -1) {
		gameOver = true;
		$("#endgametext").text(result === 0 ? "You Win!" : "CPU Wins!");
		$("#endgame").css("display", "block");
	}
}

// Take the CPU turn using current strategy
function cpuTurn() {
	let x = STRATEGIES[$("#option_strategy").get(0).value](counters);

	addCounter(x, 1);
}

// Game variables
var counters = [];
for (let i = 0; i < WIDTH; i++) counters.push([]);
var gameOver = false;

// Perform initial setup
initialSetup();

// Update on window resize
$(window).resize(updateScale);
