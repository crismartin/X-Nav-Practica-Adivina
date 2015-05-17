
self.onmessage = function(event){	
	var result = allCoordenadas(event.data);	
	self.postMessage(result);
}


function allCoordenadas(array) {
	var result = "";
		
	array.forEach(function (elemento, index) {
		result += "<li>" + elemento.media.m + "</li>";
	});

	return result;
}