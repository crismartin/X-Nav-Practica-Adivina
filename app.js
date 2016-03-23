
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



function getDatos(nombre_fichero, features) {
	var json = null;
	var url = "juegos/" + nombre_fichero +".json";

	//compruebo si esta en local el fichero json
	json = localStorage.getItem(nombre_fichero);
	try{
		json = JSON.parse(json);
		if(json !== null){
			console.log("entro aqui");
			return json.features;
		}	
	}catch(e){

	}

	json = $.ajax({
	        'async': false,
	        'global': false,
	        'url': url,
	        'dataType': "json",
	        'success': function (data) {
	        	json = data;	        	
	        }
	    });

	if(json.status === 404){
		console.log("no lo encuentra");
		return null;
	}else if(features === true){
		console.log("devuelvo features");
		aux = json.responseJSON;
		localStorage.setItem(nombre_fichero, JSON.stringify(aux)); //guardo en local		
		aux = json.responseJSON.features;
		console.log(aux);
		return aux;
	}else{
		console.log("devuelvo objeto entero");
		aux = json.responseJSON;
		localStorage.setItem(nombre_fichero, JSON.stringify(aux)); //guardo en local
		console.log(aux);
		return json.responseJSON;
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
var modo_edicion = false;


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


    // Muestra un marcador donde se clicka en el mapa
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
	datos = getDatos(nombre_juego, true);
	console.log("datos");
	console.log(datos);

	$("#titulo").text(nombre_juego);
	dificultad = setDificultad();
    iniciarJuego(map, datos, dificultad);
    $("#inicio_game").css({"visibility": "collapse", "display":"none"});
}



/*									
----------------------------------
		   * Opcion 2 *
		Modo edicion de GeoJson
----------------------------------
*/

function onOff(iniciar, nombre){

	if(iniciar){
		$("#titulo").text("Editando '"+ nombre + "'...");
		$("#inicio_game").css({"visibility": "collapse", "display":"none"});
		$("#punt_total").css({"visibility": "collapse", "display":"none"});
		$("#fin_edicion").css({"visibility": "visible", "display":"inline"});
		$("#area_edicion").css({"visibility": "visible", "display":"inline"});
	}else{
		$("#area_edicion").css({"visibility": "collapse", "display":"none"});
		$("#fin_edicion").css({"visibility": "collapse", "display":"none"});
		$("#titulo").text("¡Empieza a jugar!...");
		$("#inicio_game").css({"visibility": "visible", "display":"inline"});
		$("#punt_total").css({"visibility": "visible", "display":"inline"});
		$("#modo_edicion").css({"visibility": "visible", "display":"inline"});
	}
}


function decidirCiudad(objeto){
	try{
		ciudad = objeto.responseJSON.address.city;

		if(ciudad === undefined){
			ciudad = objeto.responseJSON.address.state;
		}
	}catch(e){
		ciudad = "Oceano";
	}

	return ciudad;
}


function nameSitio(latitud, longitud){
	ciudad = $.ajax({
			async: false,
			dataType: "json",
			url: "http://nominatim.openstreetmap.org/reverse",
			type: "get",
			data: {format: "json", lat:latitud, lon:longitud},
			'success': function (data) {
	        		json = data;
	        	}	        	
	        });

	if(ciudad.status === 404){
		console.log("ciudad desconocida por Nomi");
		return "Madrid";
	
	}else {
		ciudad = decidirCiudad(ciudad);
		console.log(ciudad);
		return ciudad;
	}
}




function editar(map) {		
	nombre_juego = $( "#menu_juegos option:selected" ).text();
	onOff(true, nombre_juego);

	// busco el fichero
	contenido = localStorage.getItem(nombre_juego);

	if(contenido === null){
		console.log("estoy en null");
		cotenido = getDatos(nombre_juego, false);
		contenido = localStorage.getItem(nombre_juego);		
	}

	area = $("#texto_edicion");
	area.text(contenido);
	
	map.on('click', addFeatures);

	function addFeatures(e){
    	fichero = $("#texto_edicion").val();
    	datos = $.parseJSON(fichero);    //objeto JSon
		resetMarkers(map);		
		marker = new L.marker(e.latlng, {draggable:true});
		map.addLayer(marker);		
		marker.bindPopup("Agregado. lat: "+ e.latlng.lat.toFixed(5) +
						 ", long: " + e.latlng.lng.toFixed(5))
				.openPopup();

		ciudad = nameSitio(e.latlng.lat, e.latlng.lng);		
		feature = crearFeature(e.latlng.lat, e.latlng.lng, ciudad);
		console.log(datos);
		datos.features.push(feature);
		area.text(JSON.stringify(datos));
	}	
}

function crearFeature(lat, lng, nombre){
	coordenadas = [lat.toFixed(5), lng.toFixed(5)];
	feature = {"type": "Feature",
				"geometry": {"coordinates": coordenadas},
				"properties": {"name": nombre}
			};
	return feature;		
}


function finEdicion(map){

	onOff(false);
	datos = $("#texto_edicion").val();
	nombre_juego = $( "#menu_juegos option:selected" ).text();
	localStorage[nombre_juego] = datos;
	resetMarkers(map);	
}


/*
-------------------------------------
	
			Main de la app

-------------------------------------
*/


$(document).ready(function(){
	
	// Mapas //
	var map = L.map('map').setView([28.92163, -2.3125], 1);

	L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    	attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
	}).addTo(map);
	
	start_game = $("#start_game").button();
	end_game = $("#end_game").button();
	edicion = $("#edicion").button();
	fin_edit = $("#fin_edicion").button();


	start_game.click(function(){
		$("#modo_edicion").css({"visibility":"hidden", "display":"none"});
		startGame(map);
	});
	
    end_game.click(function(){
    	$("#end_game").css({"visibility": "hidden"});
    	$("#images").css({"visibility": "hidden", "display":"none"}); 
    	$("#modo_edicion").css({"visibility":"visible", "display":"inline"}); 
    	endGame(map);
    });


	$("#selectmenu").menu({
  		position: { my : "left+10 center", at: "right center" }
	});

	$("#menu_juegos").selectmenu({
  		position: { my : "left+10 center", at: "right center" },
  		width: "150px"
	});

	spinner = $("#dificultad").spinner({min:4});


	edicion.click(function(){
		$("#modo_edicion").css({"visibility": "hidden", "display":"none"});
		editar(map);
	});

	fin_edit.click(function(){
		finEdicion(map);
		console.log("finalizo edicion");
	});
});