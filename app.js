
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
		       	fotoSearch(valor);
		    })              
		});	
	});
}


$(document).ready(function(){	
	pedirFichero("juegos/Capitales.json");	

	var map = L.map('map').setView([51.505, -0.09], 13);

	L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'examples.map-i875mjb7'
	}).addTo(map);


    // Show lat and long at cliked (event) point, with a popup
    var popup = L.popup();
    function showPopUp(e) {
	popup
            .setLatLng(e.latlng)
            .setContent("Coordinates: " + e.latlng.toString())
            .openOn(map);
    }
    // Subscribe to the "click" event
    map.on('click', showPopUp);

    // Show a circle around current location
    function onLocationFound(e) {
	var radius = e.accuracy / 2;
	L.marker(e.latlng).addTo(map)
            .bindPopup("You are within " + radius +
		       " meters from this point<br/>" +
		       "Coordinates: " + e.latlng.toString())
	    .openPopup();
	L.circle(e.latlng, radius).addTo(map);
    }
    // Subscribe to the "location found" event
    map.on('locationfound', onLocationFound);

    // Show alert if geolocation failed
    function onLocationError(e) {
	alert(e.message);
    }
    // Subscribe to the "location error" event
    map.on('locationerror', onLocationError);

    // Set the view to current location
    map.locate({setView: true, maxZoom: 16});  

	$("#selectmenu").selectmenu(); 
});