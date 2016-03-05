function $(id){
	return document.getElementById(id)
}

var beatsDiv = $('beats')

var defaultBPM = 120;
var defaultBeatCount = 4;
var defaultSubdivision = 2;

var subdivisionColor = "#2980b9";
var beatColor = "#2c3e50";
var pianoColor = "#e67e22";

var config = {
	bpm: defaultBPM,
	beatCount: defaultBeatCount,
	subdivision: defaultSubdivision
}

var hat = new Wad(Wad.presets.hiHatClosed);
var snare = new Wad(Wad.presets.snare)
var piano = new Wad(Wad.presets.piano)

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
	if(!vol)
		vol = 0.5
	sound.play({volume: vol})
}

// var colorSoundMap = {
// 	[beatColor]: playSound(hat),
// 	[subdivisionColor]: playSound(snare),
// 	[pianoColor]: playSound(piano)
// }
var colorSoundMap = {
	[beatColor]: hat,
	[subdivisionColor]: snare,
	[pianoColor]: piano
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

function makeBeat(color, soundIndex){
	if(!color)
		color = beatColor

	var parentDiv = document.createElement('div')
	parentDiv.className="beatContainer"

	var childDiv = document.createElement('div')
	childDiv.className="beat"
	childDiv.style.backgroundColor = color

	childDiv.onclick = function(){
		var divColor = rgb2hex(this.style.backgroundColor)
		var colorKeys = Object.keys(colorSoundMap)

		var newColor = colorKeys[(colorKeys.indexOf(divColor) + 1) % colorKeys.length]
		this.style.backgroundColor = newColor

	}

	parentDiv.appendChild(childDiv)

	return parentDiv
}

function syncConfigObj(){//syncs the display with config, updating beat counts, etc
	removeBeats()
	for(var i = 0; i < config.beatCount; i++){
		for(var j = 0; j < config.subdivision; j++){
			var color = (j==0) ? beatColor : subdivisionColor
			beatsDiv.appendChild(makeBeat(color))
		}
	}

	beatElements = document.getElementsByClassName('beat')

}

var metIsPlaying = false;

function startMet(){
	var index = 0;
	metIsPlaying = true

	var resolution = config.bpm * config.subdivision;
	var refreshRate = 60*1000/resolution;

	addInterval(function(){
		var currentBeat = beatElements[index]
		var sound = colorSoundMap[rgb2hex(currentBeat.style.backgroundColor)]

		playSound(sound, index == 0 ? 4 : 0.5)

		TweenMax.to(currentBeat, refreshRate / 1000, {height: '100%', yoyo: true, repeat: 1, ease: Power2.easeOut})

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

syncConfigObj()