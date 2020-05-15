var alreadyChoose = "choosen"
var smoker = "smoker"

let founded = false;
let played = false;

let durationExpired = 60000

var sound

var titleTemp

titleTemp = document.title
document.title = "Mohon tunggu sebentar"

let illusTemp = '<div class="img-illus text-center mb-3">' + 
					'<img src="img/body-parts.png" class="img-fluid rounded mb-3">' +
					'<img src="img/190701213143-penaj.jpg" class="img-fluid rounded">' +
				'</div>'


let photoContainer = null

async function closeInstruction(){
	await setCloseInstruction()
	document.getElementById("illus-wrapper").innerHTML = ''
	photoContainer.style.display = 'block'
}

function setCloseInstruction(){
	return new Promise(resolve => {
		$(".scanIdText").removeClass("bgWhite")
		$(".scanIdText").removeClass("open")
		$("#instruction").addClass("text-white")
		$("#powered").addClass("text-white")
		$(".btn").removeClass("open")
		$(".img-illus").removeClass("open")
		resolve()
	})
}

async function openInstruction(){
	await setOpenInstruction()
	photoContainer.style.display = 'none'
}
function setOpenInstruction(){
	return new Promise(resolve => {
		$("#instruction").removeClass("text-white")
		$(".scanIdText").addClass("bgWhite")
		$(".btn").addClass("open")
		$(".img-illus").addClass("open")
		$("#powered").removeClass("text-white")
		resolve()
	})
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
	scene.addEventListener('loaded', () =>{
		
	})
}

AFRAME.registerComponent('uitutor', {
	init: function(){
		const tutorContainer = document.getElementById("tutor")
		const closeButton = document.getElementById("closetutor")
		$(".tutor").addClass("open")
		closeButton.addEventListener('click', () => {
			$(".tutor").removeClass("open")
			tutorContainer.innerHTML = ''
			$(".scanIdText").addClass("open")
		})
	}
})

AFRAME.registerComponent('preloadobject', {
	init: function(){
		const assetEl = document.createElement("a-assets")
		const sceneEl = this.el
		sceneEl.appendChild(assetEl)
		if (isContainExpiry(alreadyChoose)){
			if (isUserSmoker()){
				assetEl.innerHTML = '<a-asset-item id="kotor-model" src="kotor2.glb"></a-asset-item>'
			} else {
				assetEl.innerHTML = '<a-asset-item id="sehat-model" src="sehat2.glb"></a-asset-item>'
			}
		}
	}
})

AFRAME.registerComponent('voiceover', {
	init: function() {
		if (isContainExpiry(alreadyChoose)){
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
		}
	}
})

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
			paruObject.setAttribute('scale', '8 8 8')
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

AFRAME.registerComponent('photo-mode', {
	init: function() {
		const container = document.getElementById('photoModeContainer')
		const image = document.getElementById('photoModeImage')
		const shutterButton = document.getElementById('shutterButton')
		const closeButton = document.getElementById('closeButton')
  
		// Container starts hidden so it isn't visible when the page is still loading
		//container.style.display = 'block'
  
		closeButton.addEventListener('click', () => {
			container.classList.remove('photo')
		})
  
		shutterButton.addEventListener('click', () => {
			// Emit a screenshotrequest to the xrweb component
			this.el.sceneEl.emit('screenshotrequest')
  
			// Show the flash while the image is being taken
			// eslint-disable-next-line indent
        container.classList.add('flash')
		})
  
		this.el.sceneEl.addEventListener('screenshotready', e => {
			// Hide the flash
			container.classList.remove('flash')
  
			// If an error occurs while trying to take the screenshot, e.detail will be empty.
			// We could either retry or return control to the user
			if (!e.detail) {
				return
			}
  
			// e.detail is the base64 representation of the JPEG screenshot
			image.src = 'data:image/jpeg;base64,' + e.detail
  
			// Show the photo
			container.classList.add('photo')
		})
	}
})
  