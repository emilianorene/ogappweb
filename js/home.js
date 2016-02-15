var props = []; 
var tipo_transaccion = ["No Definido","Alquiler","Venta"];
 $(document).ready(function () {
	 	// Traer inmuebles del main
	$.ajax(
	{
		type: "POST",
		url: "http://www.ipositivo.com/oga/v1/index.php",
		data: {tag:'listar_inmueble'},
		dataType: "json",
		crossDomain: true,
		success: function (data, status, jqXHR) {                                
				//alert("Recibimos algo "+JSON.stringify(data));
				var propiedad;
				for(i in data)
				{
				    //alert("item "+JSON.stringify(data[i]));
					props.push({ 
						title : data[i].titulo,
						image : data[i].url_img_principal,
						type : tipo_transaccion[data[i].id_tipo_transaccion-1],
						price : data[i].precio,
						address : data[i].direccion, 
						bedrooms : data[i].habitaciones,
						bathrooms : data[i].banos,
						area : data[i].area+' m2',
						position : {
							lat : data[i].latitud,
							lng : data[i].longitud
						},
						markerIcon : "marker-ogapp.png",
						id :  data[i].id_inmueble
					});
					
					
				}
				cargarListado(data);
				cargarMapa();		
									
		},
		error: function (xhr) {
			alert("Error al traer info: "+xhr.responseText);

		}
	});
	
	
});	


function cargarListado(data)
{
	$('#listado').empty();
	for(i in data)
	{
		$('#listado').append('<div class="col-xs-12 col-sm-6 col-md-4 col-lg-4">'+
											'<a href="single.html?id='+ data[i].id_inmueble +'" class="propWidget-2">'+
												'<div class="fig">'+
												    '<center>'+
													'<img src="'+data[i].url_img_principal+'">'+
													'<img class="blur" src="'+data[i].url_img_principal+'">'+
													'<div class="opac"></div>'+
													' <div class="priceCap osLight"><span>'+data[i].precio+'</span></div>'+
													'<div class="figType">'+tipo_transaccion[data[i].id_tipo_transaccion-1]+'</div>'+
													'<h3 class="osLight">'+data[i].titulo+'</h3>'+
													'<div class="address">'+ data[i].direccion+'</div>'+
													'</center>'+
												'</div>'+
											'</a>'+
										'</div>');
    }
	
	
	/*
	var cityOptions = {
	types : [ '(cities)' ]
	};
	var city = document.getElementById('city');
	var cityAuto = new google.maps.places.Autocomplete(city, cityOptions);	
	*/
}

function cargarMapa()
{
		var markers = [];
		
		var options = {
				zoom : 5,
				mapTypeId : 'Styled',
				disableDefaultUI: true,
				mapTypeControlOptions : {
					mapTypeIds : [ 'Styled' ]
				},
				scrollwheel: false
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
						// new google.maps.Point(0,0),
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

		setTimeout(function() {
			$('body').removeClass('notransition');

			if ($('#home-map').length > 0) {
				map = new google.maps.Map(document.getElementById('home-map'), options);
				var styledMapType = new google.maps.StyledMapType(styles, {
					name : 'Styled'
				});

				map.mapTypes.set('Styled', styledMapType);
				map.setCenter(new google.maps.LatLng(-25.291714,-57.612168));
				map.setZoom(13);

				addMarkers(props, map);
			}
		}, 300);

		if(!(('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch)) {
			$('body').addClass('no-touch');
		}

		 $('.dropdown-select li a').click(function() {
			if (!($(this).parent().hasClass('disabled'))) {
				$(this).prev().prop("checked", true);
				$(this).parent().siblings().removeClass('active');
				$(this).parent().addClass('active');
				$(this).parent().parent().siblings('.dropdown-toggle').children('.dropdown-label').html($(this).text());
			}
		});

		var cityOptions = {
			types : [ '(cities)' ]
		};
		var city = document.getElementById('city');
		var cityAuto = new google.maps.places.Autocomplete(city, cityOptions);

		$('#advanced').click(function() {
			$('.adv').toggleClass('hidden-xs');
		});

		$('.home-navHandler').click(function() {
			$('.home-nav').toggleClass('active');
			$(this).toggleClass('active');
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

		$('.modal-su').click(function() {
			$('#signin').modal('hide');
			$('#signup').modal('show');
		});

		$('.modal-si').click(function() {
			$('#signup').modal('hide');
			$('#signin').modal('show');
		});

		$('input, textarea').placeholder();				
}
$('.btn-buscar').click(function () {

    var operacion = "";

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

        window.location.href = "explore.html?operacion="+operacion+
                                            '&habitaciones='+$('input[name=bedno]:checked').val()+
                                            '&banos='+$('input[name=bathno]:checked').val()+
                                            '&precioDesde='+$('#precio_desde').val()+
                                            '&precioHasta='+$('#precio_hasta').val()+
                                            '&lat='+$("#latitude").val()+
                                            '&lgn='+$("#longitude").val()        
    });     
    


    

                                            
});	