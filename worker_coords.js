
self.onmessage = function(event){	
	var result = allCoordenadas(event.data);
	self.postMessage(result);
}


function allCoordenadas(array) {
	var result = "";
	
	array.forEach(function (elemento, index) {
		result += "<li>" + elemento.geometry.coordinates[0] + "," + 
				elemento.geometry.coordinates[1] + "</li>";
	});

	return result;
}