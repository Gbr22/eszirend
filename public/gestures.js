var hammertime = new Hammer(document.getElementById("content"), {

});
console.log("Hello from gestures!");
hammertime.on('swipe', function(ev) {
	console.log(ev);
	if (ev.deltaX > 0){
		goleft();
	} else if (ev.deltaX < 0){
		
		goright();
	}
	

});
hammertime.get('swipe').set({ direction: Hammer.DIRECTION_HORIZONTAL });