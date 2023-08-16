const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")


const settings                   = document.getElementById("settings")
const settingsLabel              = document.getElementById("settings-label")
const settingsRows               = document.getElementById("settings-rows")
const settingsColumns            = document.getElementById("settings-columns")
const settingsGap                = document.getElementById("settings-gap")
const settingsCards              = document.getElementById("settings-cards")
const settingsCardIncrease       = document.getElementById("settings-card-increase")
const settingsCardIncreaseValue  = document.getElementById("settings-card-increase-value")
const settingsAutohide           = document.getElementById("settings-autohide")
const settingsAutohideDelay      = document.getElementById("settings-autohide-delay")
const settingsAutohideMultiplier = document.getElementById("settings-autohide-multiplier")
const settingsApply              = document.getElementById("settings-apply")

const results          = document.getElementById("results")
const resultsHeader    = document.getElementById("results-header")
const resultsGrade     = document.getElementById("results-grade")
const resultsLast      = document.getElementById("results-last-number")
const resultsTotal     = document.getElementById("results-total-time")
const resultsObserving = document.getElementById("results-observing-time")
const resultsClicking  = document.getElementById("results-clicking-time")

const scoresPlayerdata = document.getElementById("scores-playerdata")
const scoresResults = document.getElementById("scores-results")
const scoresLabel = document.getElementById("scores-label")

const blankFunction = function(){}

var r = 3   // rows
var c = 5   // columns
var n = 7   // number of cards
var g = 0.1 // gap

var start      = 0
var firstClick = 0
var lastClick  = 0
var lastNumber = 0

var autohide           = false
var autohideDelay      = 0
var autohideMultiplier = 0
var cardIncrease       = false
var cardIncreaseValue  = 0

var mx, my // mouseX, mouseY
var ww, wh // windowWidth, windowHeight
var gw, gh // gapWidth, gapHeight
var cw, ch // cellWidth, cellHeight
var hw, hh // halfWidth, halfHeight
var size1, size2, size3

var gameData
var currentNumber      = 0
var forceHide          = false
var onFocus            = false
var lastTimeout

var scores = {}

function setVectors(rows, columns) {
	r = rows
	c = columns
	currentNumber = 0
	redrawGame()
}

function setCards(numberOfCards) {
	n = numberOfCards
	currentNumber = 0
	redrawGame()
}

function setGap(gap) {
	if (gap) {
		g = gap
	}
	ww = canvas.clientWidth
	wh = canvas.clientHeight
	gw = Math.floor( ww*g / (c+1) )
	gh = Math.floor( wh*g / (r+1) )
	cw = Math.floor( (ww - gw*(c+1)) / c )
	ch = Math.floor( (wh - gh*(r+1)) / r )
	hw = Math.floor(cw/2)
	hh = Math.floor(ch/2)
	size1 = Math.min(ww*0.05,wh*0.08)
	size2 = Math.min(ww*0.05,(wh-size1)*0.04)
	size3 = Math.min(ch*0.6,cw*0.6)
}

function setCanvas() {
	canvas.width  = canvas.clientWidth
	canvas.height = canvas.clientHeight
	setGap()
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
	gameData = []
	var i, x, y
	for (i = 0; i < r; i++) {
		gameData[i] = []
	}
	currentNumber = 1
	
	var remainingCells = r*c
	var randomCell
	n = Math.min(n, remainingCells)
	for (i = 1; i <= n; i++) {
		randomCell = Math.floor(Math.random() * remainingCells)
		dataLoop: {
			for (y = 0; y < r; y++) {
				const row = gameData[y]
				for (x = 0; x < c; x++) {
					if (!row[x]) {
						if (--randomCell < 0) {
							row[x] = i
							break dataLoop
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
			const data = gameData[y][x]
			if (data >= currentNumber) {
				removeTimeout()
				if (currentNumber == 1 && !forceHide) {
					firstClick = Date.now()
				}
				lastClick = Date.now()
				lastNumber = currentNumber
				if (data == currentNumber) {
					if (currentNumber == Math.floor(n)) {
						currentNumber = -1
						autohideDelay *= autohideMultiplier
						n += cardIncreaseValue / n
					} else {
						currentNumber++
					}
					redrawGame()
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

settingsAutohide.addEventListener("change", function() {
	const checked = !settingsAutohide.checked
	settingsAutohideDelay.disabled = checked
	settingsAutohideMultiplier.disabled = checked
})

settingsCardIncrease.addEventListener("change", function() {
	const checked = !settingsCardIncrease.checked
	settingsCardIncreaseValue.disabled = checked
})

settingsApply.addEventListener("click", function() {
	const checked = !settingsAutohide.checked
	r = Number(settingsRows.value)
	c = Number(settingsColumns.value)
	n = Number(settingsCards.value)
	
	setGap(Number(settingsGap.value)/100)
	
	cardIncrease = settingsCardIncrease.checked
	if (cardIncrease) {
		cardIncreaseValue = Number(settingsCardIncreaseValue.value)
	}
	
	autohide = settingsAutohide.checked
	if (autohide) {
		autohideDelay      = Number(settingsAutohideDelay.value)
		autohideMultiplier = Number(settingsAutohideMultiplier.value)/100
	}
	
	currentNumber = 0
	redrawGame()
})

function redrawGame() {
	ctx.clearRect(0, 0, canvas.width, canvas.height)
	ctx.fillStyle = document.getElementsByTagName("BODY")[0].style.color
	var draw

	if (currentNumber < 1) {
		if (currentNumber == -1) {
			results.style.display = "table"
			resultsLast.innerText = lastNumber
			if (lastNumber == Math.floor(n)) {
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
		ctx.font = size1 + "px Arial"
		ctx.textAlign = "center"
		ctx.fillText(
			"click anywhere to continue",
			canvas.width/2,
			canvas.height/2
		)
		ctx.font = "100 " + size2 + "px Monospace"
		const table = [
			"rows: "    , r,
			"columns: " , c,
			"gap: "     , (g * 100) + "%",
			"cards: "   , n
		]
		
		table.push("card increase: ", onOff(cardIncrease))
		if (cardIncrease) {
			table.push("card increase value: ", cardIncreaseValue)
		}
		
		table.push("autohide: ", onOff(autohide))
		if (autohide) {
			table.push("autohide delay: ", Math.round(autohideDelay) + "ms")
			table.push("autohide multiplier: ", (autohideMultiplier * 100) + "%")
		}
		
		drawtable(
			canvas.width/2,
			canvas.height/2 + size1/2 + size2,
			table
		)
		
	} else {
		results.style.display = "none"
		var x, y
		
		if (currentNumber < 2 && !forceHide) {
			draw = function(data) {
				if (data > 0) {
					drawNumber(data)
				}
			}
		} else {
			draw = function(data) {
				if (data >= currentNumber) {
					drawRect()
				}
			}
		}
		
		function drawNumber(data) {
			ctx.font = size3 + "px Arial"
			ctx.textAlign = "center"
			ctx.fillText(
				data,
				gw + x*(gw+cw) + hw,
				gh + y*(gh+ch) + hh
			)
		}
		
		function drawRect() {
			ctx.fillRect(
				gw + x*(gw+cw),
				gh + y*(gh+ch),
				cw,
				ch
			)
		}
		
		for (y = 0; y < r; y++) {
			for (x = 0; x < c; x++) {
				draw(gameData[y][x])
			}
		}
	}

	function drawtable(x, y, arr) {
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
	
}

function pp1(lastNumber, observeTime, clickTime) {
	const memorySizePP = lastNumber * (1 - 1/factorial(lastNumber))/11
	const memorySpeedPP = 400/observeTime
	const memoryPP = memorySpeedPP*memorySizePP
	
	const aimPP = 120/(clickTime/lastNumber)
	
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

function onOff(cond) {
	if (cond) {
		return "on"
	} else {
		return "off"
	}
}

function addScore(scoreData) {
	const len = scoreData.length
	
}