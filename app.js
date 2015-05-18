
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



function calcDistancia(lat1, lon1, lat2, lon2) {
	rad = function(x) {return x*Math.PI/180;}

	var R     = 6378.137; //Radio de la tierra en km
	var dLat  = rad( lat2 - lat1 );
	var dLong = rad( lon2 - lon1 );

	var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(rad(lat1)) * 
			Math.cos(rad(lat2)) * Math.sin(dLong/2) * Math.sin(dLong/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;

	// retorna 3 decimales
	return d.toFixed(3);
}


// devuelve las coordenadas que estan en el index
// despues de haberlas dejado allí mediante
// la llamada asincrona del json
function getCoors(id) {

}



function getDatos(fichero) {
	var json = null;

	json = $.ajax({
	        'async': false,
	        'global': false,
	        'url': fichero,
	        'dataType': "json",
	        'success': function (data) {
	        	json = data;
	        }
	    });

	if(json.status === 404){
		return null;
	}else{
		aux = json.responseJSON.features;
		return aux;
	}
}


function getFotos(array_sitios) {




}



$(document).ready(function(){

	datos = getDatos("juegos/Capitales.json");
	console.log(datos);

	var map = L.map('map').setView([28.92163, -2.3125], 1);

	L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'examples.map-i875mjb7'
	}).addTo(map);


    // SMuestra un marcador donde se clicka en el mapa
    var marker;
    function showPopUp(e) {
    	if((typeof marker) !== "undefined"){
    		map.removeLayer(marker);
    	}
    	marker = new L.marker(e.latlng, {draggable:true});
    	map.addLayer(marker);
    	marker.bindPopup("Has seleccionado este punto").openPopup();
    }

    // me suscribo al evento
    map.on('click', showPopUp);





});