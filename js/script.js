function $(id){
	return document.getElementById(id)
}

var beatsDiv = $('beats')

var defaultBPM = 120;
var defaultBeatCount = 2;
var defaultSubdivision = 4;

var subdivisionColor = "#2980b9";
var beatColor = "#2c3e50";
var bellColor = "#e67e22";
var synthColor = "#27ae60";
var nullColor = "#95a5a6";

var inputs = document.getElementsByClassName('controls')

for(var i = 0; i < inputs.length; i++){
	var input = inputs[i]
	input.onchange = function(e){
		console.log(e)
		console.log(this)
		var key = this.id.replace("Input","")
		console.log(key,this.value)
		config[key] = parseInt(this.value)
		if(key == "bpm"){
			if(metIsPlaying){
				stopMet()
				startMet()
			}
		}
		else
			syncConfigObj()

	}
}

var config = {
	bpm: defaultBPM,
	beatCount: defaultBeatCount,
	subdivision: defaultSubdivision
}

var hat = new Wad(Wad.presets.hiHatClosed);
var snare = new Wad(Wad.presets.snare)
Wad.presets.piano.env.sustain /= 3
Wad.presets.piano.env.release /= 3
var bell = new Wad(Wad.presets.piano)
var synth = new Wad({
	source:'sawtooth',
	env:{
		hold: 0.015,
		attack:0.01,
		decay: 0.005,
		release:Wad.presets.piano.env.release,
		sustain: Wad.presets.piano.env.sustain
	}
})

var beatElements = []

var intervals = []

function addInterval(intervalFunction, time){
	intervals.push(setInterval(function(){
		intervalFunction()
	}, time))
}

function clearAllIntervals(){
	intervals.forEach(function(e){
		clearInterval(e)
	})

	intervals = []
}

function playSound(sound, vol){
	if(!sound)
		return

	if(!vol)
		vol = 0.5

	sound.play({volume: vol})
}


var colorSoundMap = {
	[beatColor]: hat,
	[subdivisionColor]: snare,
	[bellColor]: bell,
	[synthColor]: synth,
	[nullColor]: null
}

function removeBeats(){
	while(beatsDiv.firstChild)
		beatsDiv.removeChild(beatsDiv.firstChild)
}


function rgb2hex(rgb){
	if(RegExp(/^#(?:[0-9a-fA-F]{3}){1,2}$/).test(rgb))
		return rgb

	rgb = rgb.match(/^rgba?[\s+]?\([\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?,[\s+]?(\d+)[\s+]?/i);
	return (rgb && rgb.length === 4) ? "#" +
		("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
		("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
		("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : '';
}

function setBackgroundColor(div, color){
	div.style.backgroundColor = color
}

function makeBeat(color, soundIndex){
	if(!color)
		color = beatColor

	var parentDiv = document.createElement('div')
	parentDiv.className="beatContainer"

	var childDiv = document.createElement('div')
	childDiv.className="beat"
	setBackgroundColor(childDiv, color)
	

	childDiv.onclick = function(){
		var divColor = rgb2hex(this.style.backgroundColor)
		var colorKeys = Object.keys(colorSoundMap)

		var newColor = colorKeys[(colorKeys.indexOf(divColor) + 1) % colorKeys.length]
		setBackgroundColor(this, newColor)
		

	}

	parentDiv.appendChild(childDiv)

	return parentDiv
}

function syncConfigObj(){//syncs the display with config, updating beat counts, etc
	removeBeats()
	var metWasPlaying = false
	if(metIsPlaying)
		metWasPlaying = true
	stopMet()
	for(var i = 0; i < config.beatCount; i++){
		for(var j = 0; j < config.subdivision; j++){
			var color = (j==0) ? beatColor : subdivisionColor
			beatsDiv.appendChild(makeBeat(color))
		}
	}

	beatElements = document.getElementsByClassName('beat')
	if(metWasPlaying)
		startMet()

}

var metIsPlaying = false;

function startMet(){
	clearAllIntervals()
	var index = 0;
	metIsPlaying = true

	var resolution = config.bpm * config.subdivision;
	var refreshRate = 60*1000/resolution;

	addInterval(function(){
		var currentBeat = beatElements[index]
		var sound = colorSoundMap[rgb2hex(currentBeat.style.backgroundColor)]

		playSound(sound, index == 0 ? 4 : 0)

		TweenMax.fromTo(currentBeat, refreshRate / 1000, {height: '5%'}, {height: '100%', yoyo: true, repeat: 1, ease: Power2.easeOut})

		index+=1
		index %= beatElements.length

	}, refreshRate)

	// var currentIndex = 
}

function stopMet(){

	clearAllIntervals()
	metIsPlaying = false
}

function toggleMet(){
	if(metIsPlaying)
		stopMet()
	else
		startMet()
}

window.onblur = function () { 
	stopMet()
};

function randomize(){
	for(var i = 0; i < beatElements.length; i++){
		var element = beatElements[i]
		var colorKeys = Object.keys(colorSoundMap)
		var index = parseInt(Math.random() * colorKeys.length)
		var color = colorKeys[index]
		setBackgroundColor(element, color)

	}
}

syncConfigObj()