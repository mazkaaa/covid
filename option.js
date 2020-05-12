var alreadyChoose = "choosen"
var smoker = "smoker"
let durationExpired = 60000

function setWithExpiry(key, value, ttl) {
	const now = new Date()

	const item = {
		value: value,
		expiry: now.getTime() + ttl
	}
	localStorage.setItem(key, JSON.stringify(item))
}

function buttonSmoker(){
	localStorage.setItem(smoker, "true")
	setWithExpiry(alreadyChoose, "true", durationExpired)
	window.location.replace('./')
}

function buttonNonSmoker(){
	localStorage.setItem(smoker, "false")
	setWithExpiry(alreadyChoose, "true", durationExpired)
	window.location.replace('./')
}