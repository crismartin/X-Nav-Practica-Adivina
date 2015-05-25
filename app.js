
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
	return d.toFixed(2);
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
		format: "json"
	});

	fotos.done(function(data) {		
		mostrarFoto(data);
	});
}


function mostrarFoto(data) {
	num_aleat =  getRandomInt(0, data.items.length);
	console.log(data.items.length);
	foto = data.items[num_aleat];

	$( "<img id='imagen_mostrada'>" ).attr( "src", foto.media.m ).appendTo( "#images" );
}


function mostrarResult(pos_select, sitio) {
	result = calcDistancia(pos_select.lat, pos_select.lng, sitio[0], sitio[1]);
	$("#result").text(result + " metros");
}


function salir(variable){
	variable = true;
}


function elementoAleat(datos) {
	num_aleat =  getRandomInt(0,datos.length);
	return datos[num_aleat];
}


// Variables del juego
var puntuacion = 0.0;
var num_fotos = 0;
var punt_anterior = 0.0;
var marker = undefined;
var mostrar;
var marker_sol = undefined;
var dificultad = 10000;
var nombre_juego;

function penalizar() {
	console.log("puntuacion: " + puntuacion);
	console.log("puntuacion_anterior: "+ punt_anterior);

	if(punt_anterior === puntuacion) {
		puntuacion = puntuacion + 7000;
		punt_anterior = puntuacion;
	}	
}


function mostrarPuntuacion() {
	punt_anterior = puntuacion;
	var puntos_jugada = parseFloat($("#result").html());
	puntuacion = puntuacion + puntos_jugada;
	console.log(puntos_jugada);
	console.log(puntuacion);
}


function resetPointJugada(){
	$("#result").text("0");
}

function reset_stadistics(){
	puntuacion = 0.0;
	num_fotos = 0;
	punt_anterior = 0.0;
}

function resetMarkers(map) {
	try{
		console.log("borrando...");
		console.log(marker);
		console.log(marker_sol);
    	map.removeLayer(marker);
		map.removeLayer(marker_sol);
    }catch(e){
    	//ignoro
    }
}


function iniciarJuego(map, datos, dificultad) {
	$("#start_game").css({"visibility": "hidden"});
	$("#end_game").css({"visibility": "visible"});
	$("#images").css({"visibility": "visible"});

	reset_stadistics();
	elemento = elementoAleat(datos);
	
	$("#punt_total").html("<p class='textos'>Distancia entre los puntos: "+
		"<span id='result'>0</span></p>");

	fotos = getFotos(elemento);
	num_fotos = 1;
	map.on('click', showPopUp);
	penalizar();
	resetMarkers();
   // me suscribo al evento
	mostrar = setInterval(function() {
		console.log("otra jugada");		
		resetMarkers(map);
		resetPointJugada();
		elemento = elementoAleat(datos);
		fotos = getFotos(elemento);
		map.on('click', showPopUp);
		num_fotos ++;
		penalizar();
	}, dificultad);

	function showPopUp(e){     
		resetMarkers(map);	
		map.off('click');
		marker = new L.marker(e.latlng, {draggable:true});
		map.addLayer(marker);
		marker.bindPopup("Has seleccionado este punto").openPopup();

		coordenadas = elemento.geometry.coordinates;
		name = elemento.properties.name;
		mostrarSolucion(map, coordenadas, name);
		mostrarResult(e.latlng, coordenadas);

		mostrarPuntuacion();
	}

    // Muestra un marcador donde se clicka en el mapa
}



function mostrarSolucion(map, coordenadas, name) {
	marker_sol = L.marker(coordenadas, 
		{color: 'red',
    	}).addTo(map);
	marker_sol.bindPopup(name).openPopup();	
}


function getFecha(){
	var f = new Date();
	result = (f.getDate() + "/" + (f.getMonth() +1) + "/" + f.getFullYear());
	hora = f.getHours();
    minuto = f.getMinutes();
    segundo = f.getSeconds();
    horaImprimible = hora + " : " + minuto + " : " + segundo;

    result = result + " - "+ horaImprimible;
    return result;
}


function addHistorial(juego_name, puntuacion) {	
	fecha = getFecha();


	var estado = {juego_name: "nombre", puntuacion: "puntuacion", fecha: "fecha"};
	link = juego_name, "?" + juego_name + "=" + puntuacion.toFixed(2) + "|" + fecha;
	nombre = juego_name + " | " + puntuacion.toFixed(2) + " | " + fecha;
	
	addLink(nombre);
	history.pushState(estado, link);
}


function addLink(nombre) {
	$("#history_menu").append('<li>' + nombre +'</li>');
}



function endGame(map) {

	clearTimeout(mostrar);
	map.off('click');
	resetMarkers(map);
	$("#punt_total").empty();

	// resto 7000 para compensar
	puntuacion = puntuacion - 7000;

	if(puntuacion === -7000 || puntuacion === 0){
		puntuacion = 100000;
	}

	addHistorial(nombre_juego, puntuacion);
	// mostrar numero de fotos
	result = "<p class='textos'><b>Fotos mostradas: </b>" + num_fotos + "<br>";
	result += "<b>Puntuacion total: </b>" + puntuacion.toFixed(2)+" puntos</p>";
	$("#punt_total").html(result);
	$('#punt_total').css({'color': 'red'});


	$("#titulo").text("¡Adivina dónde está!");
    $("#inicio_game").css({"visibility": "visible", "display": "inline"});
    $("#start_game").css({"visibility": "visible"});
}


function setDificultad() {
	dificultad = spinner.spinner("value");
	if(dificultad === null){
		dificultad = 10;
	}
	return dificultad*1000;
}


function startGame(map) {
	$("#images").css({"display": "inline"});
	nombre_juego = $( "#menu_juegos option:selected" ).text();
	datos = getDatos("juegos/" + nombre_juego +".json");
	$("#titulo").text(nombre_juego);
	dificultad = setDificultad();
    iniciarJuego(map, datos, dificultad);
    $("#inicio_game").css({"visibility": "collapse", "display":"none"});
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
	
	
	$("#start_game").click(function(){
		startGame(map);
	});
	

    $("#end_game").click(function(){
    	$("#end_game").css({"visibility": "hidden"});
    	$("#images").css({"visibility": "hidden", "display":"none"});  
    	endGame(map);
    });

	$( "#selectmenu" ).menu({
  		position: { my : "left+10 center", at: "right center" }
	});

	$( "#menu_juegos" ).selectmenu({
  		position: { my : "left+10 center", at: "right center" },
  		width: "150px"
	});

	spinner = $("#dificultad").spinner({min:4});

	start_game = $("#start_game").button();
	end_game = $("#end_game").button();

});