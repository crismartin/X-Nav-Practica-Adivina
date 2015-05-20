
function removeFotos() {
    $("#images").empty();
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


function getDatos(fichero) {
	var json = null;

	json = $.ajax({
	        'async': false,
	        'global': false,
	        'url': fichero,
	        'dataType': "json",
	        'success': function (data) {
	        	json = data;
	        	//console.log(json);
	        }
	    });

	if(json.status === 404){
		return null;
	}else{
		aux = json.responseJSON.features;
		return aux;
	}
}


function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}


function getFotos(sitio) {

	removeFotos();

	etiqueta = sitio.properties.name;

	var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";

	var fotos = $.getJSON( flickerAPI, {
		tags: etiqueta,
		text: etiqueta,
		format: "json"
	});

	fotos.done(function(data) {		
		num_aleat =  getRandomInt(0, data.items.length);
		//console.log(num_aleat);
		foto = data.items[num_aleat];
		$( "<img>" ).attr( "src", foto.media.m ).appendTo( "#images" );
	});
}


function mostrarResult(pos_select, sitio) {
	result = calcDistancia(pos_select.lat, pos_select.lng, sitio[0], sitio[1]);
	$("#result").text(result);
}


function salir(variable){
	variable = true;
}


function elementoAleat(datos) {
	num_aleat =  getRandomInt(0,datos.length);
	return datos[num_aleat];
}



var puntuacion = 0.0;
var num_fotos = 0;

function mostrarPuntuacion() {
	var puntos_jugada = parseFloat($("#result").html());
	puntuacion = puntuacion + puntos_jugada;
	console.log(puntos_jugada);
	console.log(puntuacion);
}



function iniciarJuego(map, datos, dificultad) {
	elemento = elementoAleat(datos);

	getFotos(elemento);
	num_fotos = 1;

	var mostrar = setInterval(function() {
		elemento = elementoAleat(datos);
		getFotos(elemento)
		num_fotos ++;
		console.log(num_fotos);
	}, dificultad);


    // Muestra un marcador donde se clicka en el mapa
    var marker;

    function showPopUp(e) {
    	if((typeof marker) !== "undefined"){
    		map.removeLayer(marker);
    	}
    	marker = new L.marker(e.latlng, {draggable:true});
    	map.addLayer(marker);
    	marker.bindPopup("Has seleccionado este punto").openPopup();
      	mostrarResult(e.latlng, elemento.geometry.coordinates);
      	mostrarPuntuacion();
    }


    // me suscribo al evento
    map.on('click', showPopUp);
}



$(document).ready(function(){

	// Mapas //
	var map = L.map('map').setView([28.92163, -2.3125], 1);

	L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
			'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
			'Imagery © <a href="http://mapbox.com">Mapbox</a>',
		id: 'examples.map-i875mjb7'
	}).addTo(map);


	datos = getDatos("juegos/Capitales.json");
	
    iniciarJuego(map, datos, 10000);

});
