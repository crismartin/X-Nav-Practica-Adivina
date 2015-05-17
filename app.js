
function removeFotos() {
    $("#images").empty();
}


function fotoSearch(etiqueta) {
	removeFotos();

	var flickerAPI = "http://api.flickr.com/services/feeds/photos_public.gne?jsoncallback=?";

	$.getJSON( flickerAPI, {
		tags: etiqueta + ", capital, monument",
		text: "madrid",
		format: "json"
	}).done(function( data ) {
	
		//console.log(data.items);
		//console.log(data.items.length);
		num_aleat =  Math.floor((Math.random() * (data.items.length-1)) + 0);
		
		foto = data.items[num_aleat];
		$( "<img>" ).attr( "src", foto.media.m ).appendTo( "#images" );
	});
};



function ficherazo(){
	var fichero = $.getJSON('/juegos/Capitale.json', function (data) {

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

	$("#selectmenu").selectmenu(); 

});