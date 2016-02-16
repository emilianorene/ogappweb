
var tipo_transaccion = ["No Definido","Alquiler","Venta"];
var props = [];
var propiedad;
var lat;
var lng;

 $(document).ready(function () {
	
	if(getParameterByName("id") > 0)
	{
		initSharesButtons(getParameterByName("id"));
		// Traer inmuebles del main
		$.ajax(
		{
			type: "POST",
			url: "http://www.ipositivo.com/oga/v1/index.php",
			data: {tag:'getInmuebleCompleto_tag',IdInmueble:getParameterByName("id")},
			dataType: "json",
			crossDomain: true,
			success: function (data, status, jqXHR) {                                
					//alert("Recibimos algo "+JSON.stringify(data));
					// Cargar datos de la propiedad
					cargarDetalle(data);
					lat = data.inmuebles[0].latitud;
					lng = data.inmuebles[0].longitud;
					// json for properties markers on map
					props.push({
						title : data.inmuebles[0].titulo,
						image : data.inmuebles[0].url_img_principal,
						type : tipo_transaccion[data.inmuebles[0].id_tipo_transaccion-1],
						price : data.inmuebles[0].precio,
						address : data.inmuebles[0].direccion, 
						bedrooms : data.inmuebles[0].habitaciones,
						bathrooms : data.inmuebles[0].banos,
						area : data.inmuebles[0].area+' m2',
						position : {
							lat : data.inmuebles[0].latitud,
							lng : data.inmuebles[0].longitud
						},
						markerIcon : "marker-ogapp.png"					
					});		
					cargarMapa(lat,lng);						
			},
			error: function (xhr) {
				alert("Error al traer info: "+xhr.responseText);

			}
		});
		
		// Traer imagenes de un inmueble
		$.ajax(
		{
			type: "POST",
			url: "http://www.ipositivo.com/oga/v1/index.php",
			data: {tag:'getImagenesxInmueble',IdInmueble:getParameterByName("id")},
			dataType: "json",
			crossDomain: true,
			success: function (data, status, jqXHR) {                                
					//alert("Recibimos algo "+JSON.stringify(data));
					//Cargar imagenes en el slider
					cargarSlider(data);
			},
			error: function (xhr) {
				alert("Error al traer info: "+xhr.responseText);
			}
		});
		
		$.ajax(
		{
			type: "POST",
			url: "http://www.ipositivo.com/oga/v1/index.php",
			data: {tag:'get_inmuebles_filtrados',
				   latitud: lat,
				   longitud: lng,	   
				   idMoneda:'2'
				   },
			dataType: "json",
			crossDomain: true,
			success: function (data, status, jqXHR) {                                
				
					cargarListado(data);	
							
			},
			error: function (xhr) {
				alert("Error al traer info: "+xhr.responseText);

			}
		});		
	}	
			
});		
	
function initSharesButtons(id)
{
	$('.btn-facebook').attr('href','https://www.facebook.com/sharer/sharer.php?u=http://www.ipositivo.com/ogapp_web/single.html?id='+id);
	$('.btn-twitter').attr('href','https://twitter.com/share?url=http://www.ipositivo.com/ogapp_web/single.html?id='+id);
	$('.btn-google').attr('href','https://plus.google.com/share?url=http://www.ipositivo.com/ogapp_web/single.html?id='+id);
}
	
function cargarListado(data)
{
	//alert(JSON.stringify(data));
	$('#listado').empty();
	if(data.length > 0)
	{
		for(i in data)
		{
			$('#listado').append('<div class="col-xs-12 col-sm-12 col-md-6 col-lg-6">'+
												'<a href="single.html?id='+ data[i].id_inmueble +'" class="card">'+
													'<div class="figure">'+
														'<img src="'+data[i].url_img_principal+'" alt="image">'+
														'<div class="figCaption">'+
															'<div>$'+data[i].precio+'</div>'+
														'</div>'+
														'<div class="figView"><span class="icon-eye"></span></div>'+
														'<div class="figType">'+tipo_transaccion[data[i].id_tipo_transaccion-1]+'</div>'+
													'</div>'+
													'<h2>'+data[i].titulo+'</h2>'+
													'<div class="cardAddress"><span class="icon-pointer"></span>'+ data[i].direccion+'</div>'+
													'<ul class="cardFeat">'+
														'<li><span class="fa fa-moon-o"></span>'+data[i].habitaciones+'</li>'+
														'<li><span class="icon-drop"></span>'+data[i].banos+'</li>'+
														'<li><span class="icon-frame"></span>'+data[i].area+' m2</li>'+
													'</ul>'+
													'<div class="clearfix"></div>'+
												'</a>'+
											'</div>');
			
		}
	}	

}	

function cargarMapa()
{			
	// Custom options for map
	var options = {
			zoom : 14,
			mapTypeId : 'Styled',
			disableDefaultUI: true,
			mapTypeControlOptions : {
				mapTypeIds : [ 'Styled' ]
			}
		};
	var styles = [{
		stylers : [ {
			hue : "#cccccc"
		}, {
			saturation : -100
		}]
	}, {
		featureType : "road",
		elementType : "geometry",
		stylers : [ {
			lightness : 100
		}, {
			visibility : "simplified"
		}]
	}, {
		featureType : "road",
		elementType : "labels",
		stylers : [ {
			visibility : "on"
		}]
	}, {
		featureType: "poi",
		stylers: [ {
			visibility: "off"
		}]
	}];

	var newMarker = null;
	var markers = [];
	
	// custom infowindow object
	var infobox = new InfoBox({
		disableAutoPan: false,
		maxWidth: 202,
		pixelOffset: new google.maps.Size(-101, -285),
		zIndex: null,
		boxStyle: {
			background: "url('images/infobox-bg.png') no-repeat",
			opacity: 1,
			width: "202px",
			height: "245px"
		},
		closeBoxMargin: "28px 26px 0px 0px",
		closeBoxURL: "",
		infoBoxClearance: new google.maps.Size(1, 1),
		pane: "floatPane",
		enableEventPropagation: false
	});

	// function that adds the markers on map
	var addMarkers = function(props, map) {
		$.each(props, function(i,prop) {
			var latlng = new google.maps.LatLng(prop.position.lat,prop.position.lng);
			var marker = new google.maps.Marker({
				position: latlng,
				map: map,
				icon: new google.maps.MarkerImage( 
					'images/' + prop.markerIcon,
					null,
					null,
					null,
					new google.maps.Size(36, 36)
				),
				draggable: false,
				animation: google.maps.Animation.DROP,
			});
			var infoboxContent = '<div class="infoW">' +
											'<div class="propImg">' +
												'<img src="' + prop.image + '">' +
												'<div class="propBg">' +
													'<div class="propPrice">' + prop.price + '</div>' +
													'<div class="propType">' + prop.type + '</div>' +
												'</div>' +
											'</div>' +
											'<div class="paWrapper">' +
												'<div class="propTitle">' + prop.title + '</div>' +
												'<div class="propAddress">' + prop.address + '</div>' +
											'</div>' +
											'<ul class="propFeat">' +
												'<li><span class="fa fa-moon-o"></span> ' + prop.bedrooms + '</li>' +
												'<li><span class="icon-drop"></span> ' + prop.bathrooms + '</li>' +
												'<li><span class="icon-frame"></span> ' + prop.area + '</li>' +
											'</ul>' +
											'<div class="clearfix"></div>' +
											'<div class="infoButtons">' +
												'<a class="btn btn-sm btn-round btn-gray btn-o closeInfo">Cerrar</a>' +
												'<a href="single.html?id='+prop.id+'" class="btn btn-sm btn-round btn-green viewInfo">Ver</a>' +
											'</div>' +
										 '</div>';


			google.maps.event.addListener(marker, 'click', (function(marker, i) {
				return function() {
					infobox.setContent(infoboxContent);
					infobox.open(map, marker);
				}
			})(marker, i));

			$(document).on('click', '.closeInfo', function() {
				infobox.open(null,null);
			});

			markers.push(marker);
		});
	}

	var map;
	var windowHeight;
	var windowWidth;
	var contentHeight;
	var contentWidth;
	var isDevice = true;

	// calculations for elements that changes size on window resize
	var windowResizeHandler = function() {
		windowHeight = window.innerHeight;
		windowWidth = $(window).width();
		contentHeight = windowHeight - $('#header').height();
		contentWidth = $('#content').width();

		$('#leftSide').height(contentHeight);
		$('.closeLeftSide').height(contentHeight);
		$('#wrapper').height(contentHeight);
		$('#mapView').height(contentHeight);
		$('#content').height(contentHeight);
		setTimeout(function() {
			$('.commentsFormWrapper').width(contentWidth);
		}, 300);

		if (map) {
			google.maps.event.trigger(map, 'resize');
		}

		// Add custom scrollbar for left side navigation
		if(windowWidth > 767) {
			$('.bigNav').slimScroll({
				height : contentHeight - $('.leftUserWraper').height()
			});
		} else {
			$('.bigNav').slimScroll({
				height : contentHeight
			});
		}
		if($('.bigNav').parent('.slimScrollDiv').size() > 0) {
			$('.bigNav').parent().replaceWith($('.bigNav'));
			if(windowWidth > 767) {
				$('.bigNav').slimScroll({
					height : contentHeight - $('.leftUserWraper').height()
				});
			} else {
				$('.bigNav').slimScroll({
					height : contentHeight
				});
			}
		}

	}

	var repositionTooltip = function( e, ui ){
		var div = $(ui.handle).data("bs.tooltip").$tip[0];
		var pos = $.extend({}, $(ui.handle).offset(), { 
						width: $(ui.handle).get(0).offsetWidth,
						height: $(ui.handle).get(0).offsetHeight
					});
		var actualWidth = div.offsetWidth;

		var tp = {left: pos.left + pos.width / 2 - actualWidth / 2}
		$(div).offset(tp);

		$(div).find(".tooltip-inner").text( ui.value );
	}

	windowResizeHandler();
	$(window).resize(function() {
		windowResizeHandler();
	});

	setTimeout(function() {
		$('body').removeClass('notransition');

		map = new google.maps.Map(document.getElementById('mapView'), options);
		var styledMapType = new google.maps.StyledMapType(styles, {
			name : 'Styled'
		});

		map.mapTypes.set('Styled', styledMapType);
		map.setCenter(new google.maps.LatLng(lat,lng));
		map.setZoom(14);

		if ($('#address').length > 0) {
			newMarker = new google.maps.Marker({
				position: new google.maps.LatLng(lat,lng),
				map: map,
				icon: new google.maps.MarkerImage( 
					'images/marker-new.png',
					null,
					null,
					// new google.maps.Point(0,0),
					null,
					new google.maps.Size(36, 36)
				),
				draggable: true,
				animation: google.maps.Animation.DROP,
			});

			google.maps.event.addListener(newMarker, "mouseup", function(event) {
				var latitude = this.position.lat();
				var longitude = this.position.lng();
				$('#latitude').text(this.position.lat());
				$('#longitude').text(this.position.lng());
			});
		}

		addMarkers(props, map);
	}, 300);

	if(!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)) {
		$('body').addClass('no-touch');
		isDevice = false;
	}

	// Header search icon transition
	$('.search input').focus(function() {
		$('.searchIcon').addClass('active');
	});
	$('.search input').blur(function() {
		$('.searchIcon').removeClass('active');
	});

	// Notifications list items pulsate animation
	$('.notifyList a').hover(
		function() {
			$(this).children('.pulse').addClass('pulsate');
		},
		function() {
			$(this).children('.pulse').removeClass('pulsate');
		}
	);

	// Exapnd left side navigation
	var navExpanded = false;
	$('.navHandler, .closeLeftSide').click(function() {
		if(!navExpanded) {
			$('.logo').addClass('expanded');
			$('#leftSide').addClass('expanded');
			if(windowWidth < 768) {
				$('.closeLeftSide').show();
			}
			$('.hasSub').addClass('hasSubActive');
			$('.leftNav').addClass('bigNav');
			if(windowWidth > 767) {
				$('.full').addClass('m-full');
			}
			windowResizeHandler();
			navExpanded = true;
		} else {
			$('.logo').removeClass('expanded');
			$('#leftSide').removeClass('expanded');
			$('.closeLeftSide').hide();
			$('.hasSub').removeClass('hasSubActive');
			$('.bigNav').slimScroll({ destroy: true });
			$('.leftNav').removeClass('bigNav');
			$('.leftNav').css('overflow', 'visible');
			$('.full').removeClass('m-full');
			navExpanded = false;
		}
	});

	// functionality for map manipulation icon on mobile devices
	$('.mapHandler').click(function() {
		if ($('#mapView').hasClass('mob-min') || 
			$('#mapView').hasClass('mob-max') || 
			$('#content').hasClass('mob-min') || 
			$('#content').hasClass('mob-max')) {
				$('#mapView').toggleClass('mob-max');
				$('#content').toggleClass('mob-min');
		} else {
			$('#mapView').toggleClass('min');
			$('#content').toggleClass('max');
		}

		setTimeout(function() {
			var priceSliderRangeLeft = parseInt($('.priceSlider .ui-slider-range').css('left'));
			var priceSliderRangeWidth = $('.priceSlider .ui-slider-range').width();
			var priceSliderLeft = priceSliderRangeLeft + ( priceSliderRangeWidth / 2 ) - ( $('.priceSlider .sliderTooltip').width() / 2 );
			$('.priceSlider .sliderTooltip').css('left', priceSliderLeft);

			var areaSliderRangeLeft = parseInt($('.areaSlider .ui-slider-range').css('left'));
			var areaSliderRangeWidth = $('.areaSlider .ui-slider-range').width();
			var areaSliderLeft = areaSliderRangeLeft + ( areaSliderRangeWidth / 2 ) - ( $('.areaSlider .sliderTooltip').width() / 2 );
			$('.areaSlider .sliderTooltip').css('left', areaSliderLeft);

			if (map) {
				google.maps.event.trigger(map, 'resize');
			}

			$('.commentsFormWrapper').width($('#content').width());
		}, 300);

	});

	// Expand left side sub navigation menus
	$(document).on("click", '.hasSubActive', function() {
		$(this).toggleClass('active');
		$(this).children('ul').toggleClass('bigList');
		$(this).children('a').children('.arrowRight').toggleClass('fa-angle-down');
	});

	if(isDevice) {
		$('.hasSub').click(function() {
			$('.leftNav ul li').not(this).removeClass('onTap');
			$(this).toggleClass('onTap');
		});
	}

	$('.volume .btn-round-right').click(function() {
		var currentVal = parseInt($(this).siblings('input').val());
		if (currentVal < 10) {
			$(this).siblings('input').val(currentVal + 1);
		}
	});
	$('.volume .btn-round-left').click(function() {
		var currentVal = parseInt($(this).siblings('input').val());
		if (currentVal > 1) {
			$(this).siblings('input').val(currentVal - 1);
		}
	});

	$('.handleFilter').click(function() {
		$('.filterForm').slideToggle(200);
	});

	//Enable swiping
	$(".carousel-inner").swipe( {
		swipeLeft:function(event, direction, distance, duration, fingerCount) {
			$(this).parent().carousel('next'); 
		},
		swipeRight: function() {
			$(this).parent().carousel('prev');
		}
	});

	$(".carousel-inner .card").click(function() {
		window.open($(this).attr('data-linkto'), '_self');
	});

	$('#content').scroll(function() {
		if ($('.comments').length > 0) {
			var visible = $('.comments').visible(true);
			if (visible) {
				$('.commentsFormWrapper').addClass('active');
			} else {
				$('.commentsFormWrapper').removeClass('active');
			}
		}
	});

	$('.btn').click(function() {
		if ($(this).is('[data-toggle-class]')) {
			$(this).toggleClass('active ' + $(this).attr('data-toggle-class'));
		}
	});

	$('.tabsWidget .tab-scroll').slimScroll({
		height: '235px',
		size: '5px',
		position: 'right',
		color: '#939393',
		alwaysVisible: false,
		distance: '5px',
		railVisible: false,
		railColor: '#222',
		railOpacity: 0.3,
		wheelStep: 10,
		allowPageScroll: true,
		disableFadeOut: false
	});

	$('.progress-bar[data-toggle="tooltip"]').tooltip();
	$('.tooltipsContainer .btn').tooltip();

	var cityOptions = {
		types : [ '(cities)' ]
	};
	var city = document.getElementById('city');
	var city_menu_left = document.getElementById('city_menu_left');
	var cityAuto = new google.maps.places.Autocomplete(city, cityOptions);
	var cityMenuLeftAuto = new google.maps.places.Autocomplete(city_menu_left, cityOptions);
	
	$('input, textarea').placeholder();
						
}


function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function cargarDetalle(data)
{
	var propiedad = data.inmuebles[0];
	var usuario = data.usuario[0];
	$('h1.pageTitle').text(propiedad.titulo);
	$('div.address').text(propiedad.direccion);
	$('ul.stats li').text(propiedad.cantidad_vistas+' Vistas');
	$('div.description p').text(propiedad.descripcion);
	$('div.agentName').text(usuario.nombre);
	$('div.agentPhone').text(usuario.email);
	$('div.agentEmail').text(usuario.telefono);
    $('#bedrooms').text(propiedad.habitaciones+' Habitaciones');
    $('#bathrooms').text(propiedad.banos+' Baños');
    $('#area').text(propiedad.area+' m2');
	$('div.agentAvatar').click(function() {
		window.location.href = "profile.html?id="+propiedad.id_usuario;
	});
	$('div.agentAvatar img').attr('src',usuario.url_imagen); 
    
    //var ch_garage = $("input[name=garage]").is(':checked') ? 1 : 0;
    var i=0
    var amenities = [
        propiedad.garage==0?false:true,
        propiedad.piscina==0?false:true,
        propiedad.jardin==0?false:true,
        propiedad.alarma==0?false:true,
        propiedad.deposito==0?false:true,
        propiedad.quincho==0?false:true,
        propiedad.aire==0?false:true,
        propiedad.servicio==0?false:true,
        
    ];
    $( "div.amItem" ).each(function( index ) {
      //alert(amenities[i]);
        
      amenities[i]==true?$( this ).addClass(''):$( this ).addClass('inactive');
        i++;
    });
	
	
}
function cargarSlider(data)
{
	var slider_indicator = $("#carouselFull ol.carousel-indicators");
	var slider_inner = $("#carouselFull div.carousel-inner");
	for(i in data)
	{
		if(i == 0)
		{
			slider_indicator.append('<li data-target="#carouselFull" data-slide-to="'+i+'" class="active"></li>');	
			slider_inner.append('<div class="item active">'+
							'<center><img src="'+data[i].url_imagen+'" style="height:300px;width:auto"></center>'+
							'<div class="container">'+
								'<div class="carousel-caption">'+   
								'</div>'+
							'</div>'+
						'</div>');
		}
		else
		{
			slider_indicator.append('<li data-target="#carouselFull" data-slide-to="'+i+'"></li>');	
			slider_inner.append('<div class="item">'+
							'<center><img src="'+data[i].url_imagen+'" style="height:300px;width:auto"></center>'+
							'<div class="container">'+
								'<div class="carousel-caption">'+   
								'</div>'+
							'</div>'+
						'</div>');			
		}
	}
}

$( document ).keypress(function(e) {
    if(e.which == 13) {
        var address = $("#city").val();
    
		var geocoder = new google.maps.Geocoder();

		geocoder.geocode( { 'address': address}, function(results, status) {

		  if (status == google.maps.GeocoderStatus.OK) {
				$("#latitude").val(results[0].geometry.location.lat());
				$("#longitude").val(results[0].geometry.location.lng()); 
			} 
			if($('input[type=checkbox]:checked').length == 1)
			{
				operacion = $('input[type=checkbox]:checked').val();
			}

			window.location.href = 'explore.html?lat='+$("#latitude").val()+
												'&lng='+$("#longitude").val()        
		});     
		
		
    }

});
