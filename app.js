var alreadyChoose = "choosen"
var smoker = "smoker"

let founded = false;
let played = false;

let durationExpired = 60000

var sound

let cameraLoaded = false

var titleTemp

titleTemp = document.title
document.title = "Mohon tunggu sebentar"


import {photomodeComponent} from './js/photomode'

AFRAME.registerComponent('photo-mode', photomodeComponent)

function changeInstructionText(){
	document.getElementById("instruction").innerHTML = ""
}

function runLoadingbar(){
	$(".preload").addClass("open")
	document.querySelector(".progress-bar").setAttribute('style', 'width: 0%')
	setTimeout(function() {
		document.querySelector(".progress-bar").setAttribute('style', 'width: 10%')
	}, 5000)
	setTimeout(function() {
		document.querySelector(".progress-bar").setAttribute('style', 'width: 30%')
	}, 10000)
	setTimeout(function() {
		document.querySelector(".progress-bar").setAttribute('style', 'width: 50%')
	}, 15000)
	setTimeout(function() {
		document.querySelector(".progress-bar").setAttribute('style', 'width: 70%')
	}, 25000)
}

function closeInstruction(){
	$(".scanIdText").removeClass("bgWhite")
	$(".scanIdText").removeClass("open")
	$("#instruction").addClass("text-white")
	$("#powered").addClass("text-white")
	$(".btn").removeClass("open")
}

function openInstruction(){
	$("#instruction").removeClass("text-white")
	$(".scanIdText").addClass("bgWhite")
	$(".btn").addClass("open")
	$("#powered").removeClass("text-white")
}

function setWithExpiry(key, value, ttl) {
	const now = new Date()

	const item = {
		value: value,
		expiry: now.getTime() + ttl
	}
	localStorage.setItem(key, JSON.stringify(item))
}

function getWithExpiry(key){
	const itemStr = localStorage.getItem(key)
	if (!itemStr){
		return null
	}
	const item = JSON.parse(itemStr)
	const now = new Date()
	if (now.getTime() > item.expiry){
		localStorage.removeItem(key)
		return null
	}
	return item.value
}

function setExpire(key){
	const itemStr = localStorage.getItem(key)
	if (!itemStr){
		return null
	}
	const item = JSON.parse(itemStr)
	const now = new Date()
	if (now.getTime() > item.expiry){
		localStorage.removeItem(key)
	}

}

function isContainExpiry(key){
	let result = false
	if (key in localStorage){
		result = true
	} else {
		result = false
	}
	return result
}

function isUserSmoker(){
	let result = false
	switch(localStorage.getItem(smoker)){
	case "true":
		result = true
		break
	case "false":
		result = false
		break
	}
	return result
}

window.onload = () => {
	Howler.autoUnlock = false
	setExpire(alreadyChoose)

	var scene = document.querySelector('a-scene')
	scene.addEventListener('loaded', (e)=>{
		document.title = titleTemp
		if (!isContainExpiry(alreadyChoose)){
			document.getElementById("instruction").innerHTML = "Scan KTP kamu untuk memulai"
			$(".scanIdText").addClass("open")
		}
	})


	if (isContainExpiry(alreadyChoose)){
		document.getElementById("instruction").innerHTML = "Tempelkan KTP kamu di dada seperti ini, lalu scan menggunakan smartphone kamu"
		openInstruction()
		$(".scanIdText").addClass("open")
		if (isUserSmoker()){
			sound = new Howl({
				src: ['audio-kotor.mp3'],
				preload: true,
				loop: true,
				volume: 1,
				onend: function () {
					console.log('Audio finished');
				}
			})
		} else {
			sound = new Howl({
				src: ['audio-sehat.mp3'],
				preload: true,
				loop: true,
				volume: 1,
				onend: function () {
					console.log('Audio finished');
				}
			})
		}
	} else {
		//runLoadingbar()
	}
}


function buttonSmoker(){
	localStorage.setItem(smoker, "true")
	//localStorage.setItem(alreadyChoose, "true")
	setWithExpiry(alreadyChoose, "true", durationExpired)
	window.location.replace('./')
}

function buttonNonSmoker(){
	localStorage.setItem(smoker, "false")
	//localStorage.setItem(alreadyChoose, "true")
	setWithExpiry(alreadyChoose, "true", durationExpired)
	window.location.replace('./')
}

AFRAME.registerComponent('paruparu', {
	schema: {
		name: {type: 'string'}
	},
	init: function () {

		const {object3D, sceneEl} = this.el

		// Hide the image target until it is found
		object3D.visible = false

		const paruObject = document.createElement('a-entity')
        

		if (isContainExpiry(alreadyChoose)){
			paruObject.setAttribute('scale', '8.5 8.5 8.5')
			paruObject.setAttribute('position', '0 -1 0')
			paruObject.setAttribute('emissive', '#f5f5f5')
			paruObject.setAttribute('emissiveIntensity', '1')
			if (isUserSmoker()){
				paruObject.setAttribute('gltf-model', '#kotor-model')
			} else {
				paruObject.setAttribute('gltf-model', '#sehat-model')
			}
			this.el.appendChild(paruObject)
            
		}


		// showImage handles displaying and moving the virtual object to match the image
		const showImage = ({detail}) => {

			if (isContainExpiry(alreadyChoose)){
				if (!played){
					paruObject.setAttribute('animation-mixer', 'clip: motion; loop: repeat; timeScale: 1')
					played = true
				}
				if (!founded){
					sound.play()
					founded = true
				}

				$(".scanIdText").removeClass("open")

				// Updating position/rotation/scale using object3D is more performant than setAttribute
				object3D.position.copy(detail.position)
				object3D.quaternion.copy(detail.rotation)
				object3D.scale.set(detail.scale, detail.scale, detail.scale)
				object3D.visible = true
			} else {
				window.location.replace('./option.html')
			}
		}

		// hideImage handles hiding the virtual object when the image target is lost
		const hideImage = () => {
			if (played){
				paruObject.setAttribute('animation-mixer', 'timeScale: 0')
				played = false
			}
			if (founded){
				sound.pause()
				founded = false
			}

			object3D.visible = false
			document.getElementById("instruction").innerHTML = "Scan KTP kamu untuk memulai"
			$(".scanIdText").addClass("open")
		}

		// These events are routed and dispatched by xrextras-generate-image-targets
		this.el.addEventListener('xrimagefound', showImage)
		this.el.addEventListener('xrimageupdated', showImage)
		this.el.addEventListener('xrimagelost', hideImage)
	}
})

// xrextras-generate-image-targets uses this primitive to automatically populate multiple image targets
AFRAME.registerPrimitive('paruparu-ktp', {
	defaultComponents: {
		paruparu: {},
	},

	mappings: {
		name: 'paruparu.name'
	}
})