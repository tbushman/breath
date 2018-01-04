var $ = require('jquery');
var index = parseInt($('#theme').val(), 10);
var mode = $('#mode').val();
//var theme = $('#theme').val();
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
		"transform": ["translateY(-50%) rotate(0deg)", "translateY(-50%) rotate(270deg)"]
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
	}
];

//data = JSON.parse(data);
var transProperty = Object.keys(data[index])[0];
var transValues = data[index][transProperty];
var transProperties = Object.keys(data[index]);

transProperties = transProperties.filter(function(key){
	return Array.isArray(data[index][key]);
});

var alphabet = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'];
// number of transition properties in given theme
var tpLength = transProperties.length;
// how long to inhale or exhale
var time = parseInt($('#breath').val(), 10);
var cssTime = time / 1000;
// how long to hold breath
var hold = parseInt($('#hold').val(), 10);
var cssHold = hold / 1000;
// number of divs in theme
var arrLength = data[index].amount,

// predefine setInterval variable
setBreath, setSpeed;

$(document).ready(function(){
	updateCss(index, cssTime, cssHold);
});

function updateCss(index, cssTime, cssHold) {
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
	// each transition property is a className
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
	var arr = []
	for (var i = 0; i < data[index].amount; i++) {
		arr.push(i);
	}
	$('#style').append(css);
	
	for (var i in arr) {
		$('.container').append(
			"<div class='lung lung_"+i+"' title='"+mode+"'></div>"
		)
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
	time = parseInt($('#breath').val(), 10);
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
$(document).ready(function(){
	for (var i = 0; i < arrLength; i++) {
		var lung = document.getElementsByClassName('lung_'+i+'')[0];
		addClass(lung, tpLength);
	}
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
	// store global time var;
	time = e.target.valueAsNumber;

	// post server vars and reload page
	/*$.post('/change/'+index+'/'+time+'/'+hold+'', function(){
		window.location.href = '/init'
	})*/
	updateCss(index, time, hold);
});

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