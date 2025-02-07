const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")


const settings                   = document.getElementById("settings")
const settingsLabel              = document.getElementById("settings-label")
const settingsAutosize           = document.getElementById("settings-autosize")
const settingsRows               = document.getElementById("settings-rows")
const settingsColumns            = document.getElementById("settings-columns")
const settingsGap                = document.getElementById("settings-gap")
const settingsCards              = document.getElementById("settings-cards")
const settingsDrawAllCards       = document.getElementById("settings-draw-all-cards")
const settingsResetAutohide      = document.getElementById("settings-reset-autohide")
const settingsCardIncrease       = document.getElementById("settings-card-increase")
const settingsCardIncreaseValue  = document.getElementById("settings-card-increase-value")
const settingsAutohide           = document.getElementById("settings-autohide")
const settingsAutohideDelay      = document.getElementById("settings-autohide-delay")
const settingsAutohideMultiplier = document.getElementById("settings-autohide-multiplier")
const settingsApply              = document.getElementById("settings-apply")
const settingsContinueOnMistakes = document.getElementById("settings-continue-on-mistakes")

const results          = document.getElementById("results")
const resultsHeader    = document.getElementById("results-header")
const resultsGrade     = document.getElementById("results-grade")
const resultsLast      = document.getElementById("results-last-correct-number")
const resultsTotal     = document.getElementById("results-total-time")
const resultsObserving = document.getElementById("results-observing-time")
const resultsClicking  = document.getElementById("results-clicking-time")

const scoresPlayerdata = document.getElementById("scores-playerdata")
const scoresResults = document.getElementById("scores-results")
const scoresLabel = document.getElementById("scores-label")

const blankFunction = function(){}

var autosize = true

var rows = 3   // rows
var columns = 5   // columns
var cards = 7   // number of cards
var gap = 0.1 // gap

var start      = 0
var firstClick = 0
var lastClick  = 0
var lastCorrectNumber

var drawAllCards = false

var autohide             = false
var autohideDelay        = 0
var autohideMultiplier   = 0
var initialAutohideDelay = 0
var resetAutohide        = false

var cardIncrease       = false
var cardIncreaseValue  = 0

var continueOnMistakes       = false

var mx, my // mouseX, mouseY
var ww, wh // windowWidth, windowHeight
var gw, gh // gapWidth, gapHeight
var cw, ch // cellWidth, cellHeight
var hw, hh // halfWidth, halfHeight
var markWidth
var markMargin
var size1, size2, size3, size4

var board
var currentNumber      = 0
var forceHide          = false
var onFocus            = false
var lastTimeout

var scores = {}

function setSizes() {
	ww = canvas.clientWidth
	wh = canvas.clientHeight
	gw = Math.floor( ww*gap / (columns+1) )
	gh = Math.floor( wh*gap / (rows+1) )
	cw = Math.floor( (ww - gw*(columns+1)) / columns )
	ch = Math.floor( (wh - gh*(rows+1)) / rows )
	hw = Math.floor(cw/2)
	hh = Math.floor(ch/2)
	size1 = Math.min(ww*0.05,wh*0.08)
	size2 = Math.min(ww*0.05,(wh-size1)*0.04)
	size3 = Math.min(ch*0.6,cw*0.6/(cards.toString()).length)
	size4 = Math.min(ch,cw*1.2)
	markWidth = Math.min(ch*0.07,cw*0.07)
	markMargin = Math.min(ch*0.2,cw*0.2)
}

function setCanvas() {
	canvas.width  = canvas.clientWidth
	canvas.height = canvas.clientHeight
	setSizes()
	redrawGame()
}

function removeTimeout() {
	if (lastTimeout !== undefined) {
		clearTimeout(lastTimeout)
		lastTimeout = undefined
	}
}

function hideCards() {
	forceHide = true
	if (currentNumber == 1) {
		firstClick = Date.now()
		redrawGame()
	}
}

function startGame() {
	if (autosize) {
		const oldRows = rows
		const oldColumns = columns
		const oldGap = gap

		rows = 1
		columns = 1
	
		fitSize(cards * 2)
		
		if (
			oldRows != rows ||
			oldColumns != columns ||
			oldGap != gap
		) {
			setSizes()
		}
	}
	
	board = []

	var i, x, y
	for (i = 0; i < rows; i++) {
		board[i] = []
	}
	
	lastCorrectNumber = 0
	currentNumber = 1
	
	var remainingCells = rows*columns
	var randomCell
	for (i = 1; i <= cards; i++) {
		randomCell = Math.floor(Math.random() * remainingCells)
		boardTraversion: {
			for (y = 0; y < rows; y++) {
				const row = board[y]
				for (x = 0; x < columns; x++) {
					if (!row[x]) {
						if (--randomCell < 0) {
							row[x] = i
							break boardTraversion
						}
					}
				}
			}
		}
		remainingCells--
	}
	removeTimeout()
	if (autohide) {
		lastTimeout = setTimeout(hideCards, autohideDelay)
	}
	forceHide = false
	start = Date.now()
	redrawGame()
}

function mouseClick(mouseEvent) {
	setMousePos(mouseEvent)
	click()
}

function keyboardClick(mouseEvent) {
	if (onFocus) {
		click()
	}
}

function click() {
	if (currentNumber < 1) {
		startGame()
	} else {
		const xOffset = (mx - gw) % (gw + cw)
		const yOffset = (my - gh) % (gh + ch)
		if (
			xOffset >= 0 &&
			xOffset < cw &&
			yOffset >= 0 &&
			yOffset < ch
		) {
			const x = Math.floor((mx - gw) / (gw + cw))
			const y = Math.floor((my - gh) / (gh + ch))
			const cellValue = board[y][x]
			if (cellValue >= currentNumber || drawAllCards && currentNumber > 1 && !(cellValue < currentNumber)) {
				removeTimeout()
				if (currentNumber == 1 && !forceHide) {
					firstClick = Date.now()
				}
				lastClick = Date.now()
				lastClickedX = x
				lastClickedY = y
				// Correct cell
				if (cellValue == currentNumber) {
					lastCorrectNumber = currentNumber
					if (currentNumber == Math.floor(cards)) {
						currentNumber = -2
						if (cardIncrease) {
							const oldCards = cards
							cards += cardIncreaseValue / cards
							if (autohide) {
								if (Math.floor(oldCards) != Math.floor(cards)) {
									autohideDelay = initialAutohideDelay
								} else {
									autohideDelay *= autohideMultiplier
								}
							}
						} else if (autohide) {
							autohideDelay *= autohideMultiplier
						}
					} else {
						currentNumber++
					}
					redrawGame()
				// Wrong cell
				} else {
					currentNumber = -1
					redrawGame()
				}
			}
		}
	}
}

function setMousePos(mouseEvent) {
	mx = mouseEvent.offsetX
	my = mouseEvent.offsetY
	// redrawGame()
}

setCanvas()

canvas.addEventListener("mouseenter", function(){onFocus = true})
canvas.addEventListener("mouseover" , function(){onFocus = true})
canvas.addEventListener("mouseleave", function(){onFocus = false})

// canvas.addEventListener("mouseover", setMousePos)
// canvas.addEventListener("mouseout" , setMousePos)
canvas.addEventListener("mousemove", setMousePos)

// canvas.addEventListener("resize", setCanvas)
window.addEventListener("resize"   , setCanvas)
canvas.addEventListener("resize"   , setCanvas)
scoresLabel.addEventListener("click", function () {setTimeout(setCanvas, 0)})
// canvas.addEventListener("resize"   , function(){console.log("wut")})
// canvas.addEventListener("mouseover", setCanvas)

canvas.addEventListener("mousedown", mouseClick)
window.addEventListener("keydown"  , keyboardClick)

settingsAutosize.addEventListener("change", function() {
	const checked = settingsAutosize.checked
	settingsRows.disabled = checked
	settingsColumns.disabled = checked
})

settingsAutohide.addEventListener("change", function() {
	const checked = !settingsAutohide.checked
	settingsAutohideDelay.disabled = checked
	settingsAutohideMultiplier.disabled = checked
	settingsResetAutohide.disabled = checked
})

settingsCardIncrease.addEventListener("change", function() {
	const checked = !settingsCardIncrease.checked
	settingsCardIncreaseValue.disabled = checked
})

settingsApply.addEventListener("click", function() {
	cards = Number(settingsCards.value)
	
	autosize = settingsAutosize.checked
	
	const oldRows = rows
	const oldColumns = columns
	const oldGap = gap
	
	if (!autohide) {
		rows = Number(settingsRows.value)
		columns = Number(settingsColumns.value)
		
		fitSize()
			
		settingsRows.value = rows
		settingsColumns.value = columns
	}
	
	gap != Number(settingsGap.value)/100
	
	if (
		oldRows != rows ||
		oldColumns != columns ||
		oldGap != gap
	) {
		setSizes()
	}
	
	drawAllCards = settingsDrawAllCards.checked
	
	cardIncrease = settingsCardIncrease.checked
	if (cardIncrease) {
		cardIncreaseValue = Number(settingsCardIncreaseValue.value)
	}
	
	autohide = settingsAutohide.checked
	if (autohide) {
		autohideDelay        = Number(settingsAutohideDelay.value)
		autohideMultiplier   = Number(settingsAutohideMultiplier.value)/100
		initialAutohideDelay = autohideDelay
		resetAutohide        = settingsResetAutohide.checked
	}
	
	continueOnMistakes = settingsContinueOnMistakes.checked
	
	currentNumber = 0
	redrawGame()
})

function fitSize(tempCards) {
	const height = canvas.height
	const width = canvas.width

	if (!tempCards)
		tempCards = cards
	
	while (rows * columns < tempCards) {		
		// Make cells as square as possible
		
		if (
			Math.abs(1 - width / height * (rows+1) / columns) <
			Math.abs(1 - width / height * rows / (columns+1))
		) {
			rows++
		} else {
			columns++
		}
	}
	// settingsRows.value = rows
	// settingsColumns.value = columns
}

function redrawGame() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = document.getElementsByTagName("BODY")[0].style.color

	function drawTable(x, y, arr) {
		const len = arr.length
		var i
		for (i = 0; i < len; i += 2) {
			ctx.textAlign = "right"
			ctx.fillText(arr[i], x, y)
			ctx.textAlign = "left"
			ctx.fillText(arr[i+1], x, y)
			y += size2 * 1.1
		}
	}
	
	// ctx.fillStyle = "orange"
	// ctx.beginPath();
	// ctx.arc(mx, my, 10, 0, 2 * Math.PI);
	// ctx.fill();
	
	var draw
	
	if (currentNumber != 0) {
		var x, y
		
		if (currentNumber < 0) {
			if (currentNumber < -1) {
				ctx.fillStyle = "rgb(30,100,30)";
				
				draw = function(cellValue) {
					if (cellValue > 0) {
						ctx.font = size3 + "px sans-serif"
						ctx.textAlign = "center"
						ctx.fillText(
							cellValue,
							gw + x*(gw+cw) + hw,
							gh + y*(gh+ch) + hh + size3*0.35
						)
					}
				}
			} else {
				draw = function(cellValue) {
					ctx.fillStyle = "rgb(100,30,30)";
					if (cellValue > lastCorrectNumber) {
						ctx.fillRect(
							gw + x*(gw+cw),
							gh + y*(gh+ch),
							cw,
							ch
						)
						ctx.fillStyle = "rgb(0,0,0)";
						ctx.font = size3 + "px sans-serif"
						ctx.textAlign = "center"
						ctx.fillText(
							cellValue,
							gw + x*(gw+cw) + hw,
							gh + y*(gh+ch) + hh + size3*0.35
						)
						ctx.fillStyle = "rgb(100,30,30)";
					} else if (cellValue > 0) {
						ctx.font = size3 + "px sans-serif"
						ctx.textAlign = "center"
						ctx.fillText(
							cellValue,
							gw + x*(gw+cw) + hw,
							gh + y*(gh+ch) + hh + size3*0.35
						)
					}
				}
			}
		} else if (currentNumber < 2 && !forceHide) {
			ctx.fillStyle = "white";
			draw = function(cellValue) {
				if (cellValue > 0) {
					ctx.font = size3 + "px sans-serif"
					ctx.textAlign = "center"
					ctx.fillText(
						cellValue,
						gw + x*(gw+cw) + hw,
						gh + y*(gh+ch) + hh + size3*0.35
					)
				}
			}
		} else {
			ctx.fillStyle = "white";
			draw = function(cellValue) {
				if (cellValue >= currentNumber || drawAllCards && !(cellValue < currentNumber)) {
					ctx.fillRect(
						gw + x*(gw+cw),
						gh + y*(gh+ch),
						cw,
						ch
					)
				}
			}
		}
		
		for (y = 0; y < rows; y++) {
			for (x = 0; x < columns; x++) {
				draw(board[y][x])
			}
		}
		
		if (currentNumber == -1) {			
			if (board[lastClickedY][lastClickedX] > lastCorrectNumber) {
				ctx.fillStyle = "rgb(0,0,0)";
			} else {
				ctx.fillStyle = "rgb(100,30,30)";
			}
			
			a = markWidth / Math.sqrt((cw - markMargin * 2)**2 / (ch - markMargin * 2)**2 + 1)
			b = markWidth / Math.sqrt((ch - markMargin * 2)**2 / (cw - markMargin * 2)**2 + 1)
			
			ctx.beginPath();
			ctx.moveTo(
				gw + lastClickedX*(gw+cw) + markMargin,
				gh + lastClickedY*(gh+ch) + markMargin + b,
			);
			ctx.lineTo(
				gw + lastClickedX*(gw+cw) + markMargin + a,
				gh + lastClickedY*(gh+ch) + markMargin,
			);
			ctx.lineTo(
				gw + lastClickedX*(gw+cw) + cw - markMargin,
				gh + lastClickedY*(gh+ch) + ch - markMargin - b,
			);
			ctx.lineTo(
				gw + lastClickedX*(gw+cw) + cw - markMargin - a,
				gh + lastClickedY*(gh+ch) + ch - markMargin,
			);
			ctx.closePath();
			
			ctx.fill()
			
			ctx.beginPath();
			ctx.moveTo(
				gw + lastClickedX*(gw+cw) + cw - markMargin,
				gh + lastClickedY*(gh+ch) + markMargin + b,
			);
			ctx.lineTo(
				gw + lastClickedX*(gw+cw) + cw - markMargin - a,
				gh + lastClickedY*(gh+ch) + markMargin,
			);
			ctx.lineTo(
				gw + lastClickedX*(gw+cw) + markMargin,
				gh + lastClickedY*(gh+ch) + ch - markMargin - b,
			);
			ctx.lineTo(
				gw + lastClickedX*(gw+cw) + markMargin + a,
				gh + lastClickedY*(gh+ch) + ch - markMargin,
			);
			ctx.closePath();
			
			ctx.fill()
			
			// ctx.font = "100 " + size4 + "px sans-serif"
			// ctx.textAlign = "center"
			// ctx.fillText(
				// "X",
				// gw + lastClickedX*(gw+cw) + hw,
				// gh + lastClickedY*(gh+ch) + hh + size4*0.35
			// )
		}
	}

	if (currentNumber < 1) {
		if (currentNumber < 0) {
			results.style.display = "table"
			resultsLast.innerText = lastCorrectNumber
			if (currentNumber < -1) {
				resultsGrade.innerText = "PASS"
				resultsHeader.style.backgroundColor = "#00ff0055"
			} else {
				resultsGrade.innerText = "FAIL"
				resultsHeader.style.backgroundColor = "#ff000055"
			}
			resultsTotal.innerText     = Math.max(lastClick - start, 0)
			resultsObserving.innerText = Math.max(firstClick - start, 0)
			resultsClicking.innerText  = Math.max(lastClick - firstClick, 0)
		} else {
			results.style.display = "none"
		}
		
		ctx.fillStyle = "white";
		
		ctx.font = size1 + "px sans-serif"
		ctx.textAlign = "center"
		ctx.fillText(
			"click anywhere to continue",
			canvas.width/2,
			canvas.height/2
		)
		ctx.font = "100 " + size2 + "px Monospace"
		
		table = []
		
		table.push("autosize: ", autosize ? "yes" : "no")
		if (!autosize) {
			table.push(
				"rows: ", rows,
				"columns: ", columns
			)
		}
		
		table.push(
			"cards: ", cards
		)
		
		table.push("card increase: ", cardIncrease ? "yes" : "no")
		if (cardIncrease) {
			table.push("card increase value: ", cardIncreaseValue)
		}
		
		table.push("autohide: ", autohide  ? "yes" : "no")
		if (autohide) {
			table.push("autohide delay: ", Math.round(autohideDelay) + "ms")
			table.push("autohide multiplier: ", (autohideMultiplier * 100) + "%")
		}
		
		table.push(
			"draw all cards: ", drawAllCards ? "yes" : "no",
			"gap: "           , (gap * 100) + "%"
		)

		
		drawTable(
			canvas.width/2,
			canvas.height/2 + size1/2 + size2,
			table
		)
		
	} else {
		results.style.display = "none"
	}
	
	function drawBoard() {
	}
	
}

function pp1(lastCorrectNumber, observeTime, clickTime) {
	const memorySizePP = lastCorrectNumber * (1 - 1/factorial(lastCorrectNumber))/11
	const memorySpeedPP = 400/observeTime
	const memoryPP = memorySpeedPP*memorySizePP
	
	const aimPP = 120/(clickTime/lastCorrectNumber)
	
	return [
		"PP", 2**memoryPP + 2**aimPP,
		"Memory PP", memoryPP,
		"Aim PP", aimPP
	]
}

function factorial(num) {
	var i = 1
	for (; num >= 2; num--) {
		i *= num
	}
	return i
}

function addScore(scoreData) {
	const len = scoreData.length
	
}