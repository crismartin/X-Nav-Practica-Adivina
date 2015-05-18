
function removeFotos() {
    $("#images").empty();
}



function fotoSearch(etiqueta) {
	removeFotos();

	var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";

	$.getJSON( flickerAPI, {
		tags: etiqueta + ", capital, monument",
		text: etiqueta,
		format: "json"
	}).done(function( data ) {
	
		//console.log(data.items);
		//console.log(data.items.length);
		num_aleat =  Math.floor((Math.random() * (data.items.length-1)) + 0);
		
		foto = data.items[num_aleat];
		$( "<img>" ).attr( "src", foto.media.m ).appendTo( "#images" );
	});
};



function pedirFichero(fichero){
	$.getJSON(fichero, function (data) {

		console.log(data.features.length);
		
		
		$.each(data.features, function (key, val) {
		    $.each(val.properties, function(name,valor){
		    	console.log(valor);
		       	fotoSearch(valor);
		    })              
		});	
	});
}



$(document).ready(function(){

	var array = new Array();

	var fichero = $.getJSON('/juegos/Capitale.json', function (data) {	
		console.log(data.features.length);

		$.each(data.features, function (key, val) {
		    $.each(val.properties, function(name,valor){
		    	console.log(valor);
		       	fotoSearch(valor);
		    })              
		});	
	});


	console.log(fichero);

	fichero.done(function(data){
		console.log("may now ");
		console.log(data);
	});


	$("#selectmenu").selectmenu(); 

   /*
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

    /*
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
    */


});