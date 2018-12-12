var $ = require('jquery'),
	ipcRenderer = require('electron').ipcRenderer,
	screen = window.screen,
	screenWidth = screen.availWidth,
	screenHeight = screen.availHeight,
	index = parseInt($('#theme').val(), 10),
	mode = $('#mode').val();

// Each design has general properties: "amount" is # of divs, and container is the divs' wrapper
// Each design also has css properties for ["inhale", "exhale"]
var data = [
	{
		"amount": 1,
		"container": {
			"height": "100%",
			"top": "0"
		},
		"width": ["10%", "calc(100% - 30px)"],
		"height": ["10%", "calc(100% - 30px)"],
		"background-color": ["#000000", "#ffffff"],
		"border-radius": ["0%", "100%"],
		"border-left": ["15px solid #E01270", "60px solid #545BD2"],
		"border-right": ["15px solid #EC1A3B", "60px solid #3A328E"],
		"border-top": ["15px solid #EF4F7B", "60px solid #0174B8"],
		"border-bottom": ["15px solid #BD1A86", "60px solid #1E4DA1"],
		"min-height": ["10%", "10%"],
		"margin-top": ["0", "0"],
		"margin-right": ["auto", "auto"],
		"margin-bottom": ["0", "0"],
		"margin-left": ["auto", "auto"],
		"top": ["50%", "50%"],
		"transform": ["translateY(-50%) translateZ(0) rotate(0deg)", "translateY(-50%) translateZ(0) rotate(270deg)"]
	},
	{
		"amount": 6,
		"container": {
			"height": "auto",
			"top": "auto"
		},
		"background-color": ["#0F2C4F", "#70CCD8"],
		"margin-top": ["2px", "6%"],
		"width": ["100%", "100%"],
		"height": ["8px", "80px"]
	},
	{
		// inspired by https://tympanus.net/codrops/2013/05/22/examples-of-pseudo-elements-animations-and-transitions/
		"amount": 1,
		"container": {
			"height": "100%",
			"top": "0"
		},
		"border-radius": ["100%", "100%"],
		"box-shadow": [
			"inset 42px 0 0 rgba(74,61,206, 0.2), inset 0 42px 0 rgba(74,61,206, 0.2), inset -42px 0 0 rgba(74,61,206, 0.2), inset 0 -42px 0 rgba(74,61,206, 0.2)",
			"inset 42px 0 0 rgba(224,18,112, 0.5), inset 0 42px 0 rgba(84,91,210, 0.5), inset -42px 0 0 rgba(33,252,221, 0.5), inset 0 -42px 0 rgba(218,21,33, 0.5)"
		],
		"width": ["25%", "calc(100% - 30px)"],
		"height": ["25%", "calc(100% - 30px)"],
		"background-color": ["#ffffff", "#ffffff"],
		"min-height": ["10%", "10%"],
		"margin-top": ["0", "0"],
		"margin-right": ["auto", "auto"],
		"margin-bottom": ["0", "0"],
		"margin-left": ["auto", "auto"],
		"top": ["50%", "50%"],
		"transform": ["translate(0,-50%) translateZ(0) rotate(0deg)", "translate(0,-50%) translateZ(0) rotate(270deg)"]
	}
	
];
// Make vars globally available
var transProperties, setBreath, setSpeed;; 

var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
// how long to inhale or exhale
var time = parseInt($('#breath').val(), 10);
var cssTime = time / 1000;
// how long to hold breath
var hold = parseInt($('#hold').val(), 10);
var cssHold = hold / 1000;

ipcRenderer.send('screen-size', {screenwidth: screenWidth, screenheight: screenHeight, theme: 0})
ipcRenderer.on('theme', function(event, message) {
	index = parseInt(message, 10);
	$('#theme').val(message);
	setTimeout(function(){
		//store time var
		time = parseInt($('#breath').val(), 10);
		cssTime = time / 1000;
		
		// store hold var
		hold = parseInt($('#hold').val(), 10);
		cssHold = hold / 1000;
		
		updateCss(index, cssTime, cssHold);
		ipcRenderer.send('screen-size', {screenwidth: screenWidth, screenheight: screenHeight, theme: index});
	},1500);
});

$(document).ready(function(){
	updateCss(index, cssTime, cssHold);

	stopInterval();
});

$(document).on('change', '#breath', function(e){
	// change hold input (hidden) to scale when breath input changes
	// calc change
	var minVal = Math.min(e.target.valueAsNumber, time);
	var maxVal = Math.max(e.target.valueAsNumber, time);
	var diff = maxVal - minVal;
	
	// if increase
	if (e.target.valueAsNumber > time) {
		$('.mod').not('#breath').each(function(i, node){
			var thisVal = parseInt($(node).val(), 10);
			$(node).val(thisVal + diff);
		});
		
	} else {
		// decrease
		$('.mod').not('#breath').each(function(i, node){
			var thisVal = parseInt($(node).val(), 10);
			$(node).val(thisVal - diff);
		});
	}
	
	// reset clock
	stopInterval();
	// store hold var
	hold = parseInt($('#hold').val(), 10);
	cssHold = hold / 1000;
	// store global time var;
	time = e.target.valueAsNumber;
	cssTime = time / 1000;
	
	index = parseInt($('#theme').val(), 10);
	updateCss(index, cssTime, cssHold);
});

function updateCss(index, cssTime, cssHold) {
	$('#style').html('');
	$('.container').html('');

	var transProperty = Object.keys(data[index])[0];
	var transValues = data[index][transProperty];
	transProperties = Object.keys(data[index]);

	transProperties = transProperties.filter(function(key){
		return Array.isArray(data[index][key]);
	});
	
	var css = `
		@charset 'UTF-8';
		:root { 
			--transProperty: ${transProperties.join(',')};
		}
		.container {
			height: ${data[index].container.height};
			top: ${data[index].container.top};
		}
		.lung {
			transition-property: var(--transProperty);
			transition-duration: ${cssTime ? cssTime : 4}s;
			position: relative;
		}
		.lung[title='in'] {
			transition-delay: ${cssHold ? cssHold : 2}s;
		}
	`;
	
	// each transition property is an alphabetical className
	for (var i in transProperties) {
		if (i < 26) {
			css += `.lung[title='in'].${alphabet[i]} {
				${transProperties[i]}: ${data[index][transProperties[i]][1]};
			} 
			.lung[title='out'].${alphabet[i]} {
				${transProperties[i]}: ${data[index][transProperties[i]][0]};
			}`
		}
	}

	$('#style').append(css);

	for (var i = 0; i < data[index].amount; i++) {
		$('.container').append(
			"<div class='lung lung_"+i+"' title='"+mode+"'></div>"
		)
	}
	for (var i = 0; i < data[index].amount; i++) {
		var lung = document.getElementsByClassName('lung_'+i+'')[0];
		addClass(lung, transProperties.length);
	}
}

function switchBreath() {
	$('.lung').each(function(i, l){
		// either 'in' or 'out' 
		// 'in' has a delay
		var title = l.getAttribute('title');
		// each lung div initiated and switched between 'in' or 'out'
		var breath = new EachBreath(l, title);
		breath.switched(l, breath.newTitle, breath.newTime, breath.newHold);
	});

}
function animationLoop(fn, delay) {
	// https://www.paulirish.com/2011/requestanimationframe-for-smart-animating/
	var start = new Date().getTime(), handle = {};
	function loop() {
		var current = new Date().getTime(),
		delta = current - start;
		if (delta >= delay) {
			fn.call();
			start = new Date().getTime();
		}
		handle.value = requestAnimationFrame(loop);
		
	}
	handle.value = requestAnimationFrame(loop);
	return handle;
}


function resetBreath(){
	// a breath interval is either 'in' or 'out', with the hold value split
	// evenly between
	setBreath = animationLoop(switchBreath, time+(hold/2));
}
function stopInterval(){
	if (!setBreath) {
		setBreath = animationLoop(switchBreath, time+(hold/2));
	}
	cancelAnimationFrame(setBreath.value);
	// store vars
	hold = parseInt($('#hold').val(), 10);
	cssHold = hold / 1000;
	time = parseInt($('#breath').val(), 10);
	cssTime = time / 1000;
	// icon placement
	switch(hold){
		case 1000:
			$('.tb-input').css('background-position', 'top 23px left 14px');
			break;
		case 2000:
			$('.tb-input').css('background-position', 'top 23px center');
			break;
		case 3000:
			$('.tb-input').css('background-position', 'top 23px right 14px');
			break;
		default:
			$('.tb-input').css('background-position', 'top 23px center');
	}
	resetBreath();
}

// for each transition property, add a class to each .lung node with alphabetical character
function addClass(node, tpL){
	for (var i = 0; i < tpL; i++) {
		node.classList.add(''+alphabet[i]+'');
	}
}
function EachBreath(node, title){
	var newTitle;
	if (title === 'in') {
		newTitle = 'out'
		hold = 0;
	} else {
		newTitle = 'in'
		hold = parseInt($('#hold').val(), 10);
	}
	this.newTitle = newTitle;
	this.newTime = parseInt($('#breath').val(), 10);
	this.newHold = hold;
}
EachBreath.prototype.switched = function(node, newTitle, newTime, newHold){
	node.setAttribute('title', newTitle);
	$('#mode').val(newTitle);
	// the exhale transform ends before the setBreath interval, leaving half var newHold
	// the other half is set into the transform-delay style for inhale
	// if newHold is 0, this transform-delay property statement equates to 0
	node.setAttribute('style', 'transition-duration: '+ newTime/1000 + 's; transition-delay: '+ (newHold/1000)/2 +'s');
}