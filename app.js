
function removeFotos() {
    $("#images").empty();
}


function fotoSearch(etiqueta) {
	var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";

	var fotos = $.getJSON( flickerAPI, {
		tags: etiqueta + ", capital, monument",
		text: etiqueta,
		format: "json"
	});

	fotos.done(function(data) {		
		var worker = new Worker("worker_fotos.js");
		console.log(data.items);
		data.items.length = 4;
		worker.postMessage(data.items);	

		worker.onmessage = function(event){
			$("#imagenes").append(event.data);		
			worker.terminate();
		}
	});
};


function pedirFichero(fichero){	

	$.getJSON(fichero, function (data) {		
		//console.log(data.features.length);
		var worker = new Worker("worker_coords.js");
		worker.postMessage(data.features);	

		worker.onmessage = function(event){
			$("#coords").append(event.data);		
			worker.terminate();
		}
	}).done(function(data){
		$.each(data.features, function (key, val) {			
		    $.each(val.properties, function(name,valor){		    	
		    	console.log("valor: " + valor);
		       	fotoSearch(valor);
		    })              
		});	
	});
}


$(document).ready(function(){	
	pedirFichero("juegos/Capitales.json");	

	$("#selectmenu").selectmenu(); 
});