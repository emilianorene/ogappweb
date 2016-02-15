var props = []; 

var tipo_transaccion = ["No Definido","Alquiler","Venta"];
 $(document).ready(function () {
	 	// Traer inmuebles del main
	$.ajax(
	{
		type: "POST",
		url: "http://www.ipositivo.com/oga/v1/index.php",
		data: {tag:'get_detalle_usuario',
		       IdUsuario: getParameterByName("id")			   
			  },
		dataType: "json",
		crossDomain: true,
		success: function (data, status, jqXHR) {                                
				
				if(data.success == 1)
				{
					var inmuebles = data['inmuebles'];
					//alert("Recibimos algo "+JSON.stringify(data['usuario']));
					for(i in inmuebles)
					{
						//alert("item "+JSON.stringify(data[i]));
						props.push({ 
							title : inmuebles[i].titulo,
							image : inmuebles[i].url_img_principal,
							type : tipo_transaccion[inmuebles[i].id_tipo_transaccion-1],
							price : inmuebles[i].precio,
							address : inmuebles[i].direccion, 
							bedrooms : inmuebles[i].habitaciones,
							bathrooms : inmuebles[i].banos,
							area : inmuebles[i].area+' m2',
							position : {
								lat : inmuebles[i].latitud,
								lng : inmuebles[i].longitud
							},
							markerIcon : "marker-ogapp.png",
							id :  inmuebles[i].id_inmueble
						});	
					}		
						cargarMapa();
						cargarDatos_Usuario(data['usuario'][0]);
						cargarListado(inmuebles);	
				        	
						
				}
				else
					alert("Error: "+data['error_msg']);
				
		},
		error: function (xhr) {
			alert("Error al traer info: "+xhr.responseText);

		}
	});
		
});	

function cargarDatos_Usuario(usuario)
{
	//alert("Usuario "+JSON.stringify(usuario.nombre));

    $('a.btn-facebook').attr('href',usuario.facebook),
    $('a.btn-twitter').attr('href',usuario.twitter)    

    $('div.skype').text(usuario.skype);
	$('div.pc-name').text(usuario.nombre);
	$('div.telefono').text(usuario.telefono);
	$('div.celular').text(usuario.celular);
	$('div.email').text(usuario.email);
	if(usuario.url_imagen != null && usuario.url_imagen != "")
		$('div.pc-avatar img').attr('src',usuario.url_imagen); 
}

function cargarListado(data)
{
	$('#listado').empty();
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
	
	var cityOptions = {
		types : [ '(cities)' ]
	};
	var city = document.getElementById('city');
	var city_menu_left = document.getElementById('city_menu_left');
	var cityAuto = new google.maps.places.Autocomplete(city, cityOptions);
	var cityMenuLeftAuto = new google.maps.places.Autocomplete(city_menu_left, cityOptions);
}
function cargarMapa()
{
	// Custom options for map
    var options = {
            zoom : 12,
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

        // reposition of prices and area reange sliders tooltip
        var priceSliderRangeLeft = parseInt($('.priceSlider .ui-slider-range').css('left'));
        var priceSliderRangeWidth = $('.priceSlider .ui-slider-range').width();
        var priceSliderLeft = priceSliderRangeLeft + ( priceSliderRangeWidth / 2 ) - ( $('.priceSlider .sliderTooltip').width() / 2 );
        $('.priceSlider .sliderTooltip').css('left', priceSliderLeft);

        var areaSliderRangeLeft = parseInt($('.areaSlider .ui-slider-range').css('left'));
        var areaSliderRangeWidth = $('.areaSlider .ui-slider-range').width();
        var areaSliderLeft = areaSliderRangeLeft + ( areaSliderRangeWidth / 2 ) - ( $('.areaSlider .sliderTooltip').width() / 2 );
        $('.areaSlider .sliderTooltip').css('left', areaSliderLeft);
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
        map.setCenter(new google.maps.LatLng(-25.291714,-57.612168));
        map.setZoom(12);

        if ($('#address').length > 0) {
            newMarker = new google.maps.Marker({
                position: new google.maps.LatLng(-25.291714,-57.612168),
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

    // functionality for custom dropdown select list
    $('.dropdown-select li a').click(function() {
        if (!($(this).parent().hasClass('disabled'))) {
            $(this).prev().prop("checked", true);
            $(this).parent().siblings().removeClass('active');
            $(this).parent().addClass('active');
            $(this).parent().parent().siblings('.dropdown-toggle').children('.dropdown-label').html($(this).text());
        }
    });

    $('.priceSlider').slider({
        range: true,
        min: 0,
        max: 2000000,
        values: [100000, 500000],
        step: 1000,
        slide: function(event, ui) {
            $('.priceSlider .sliderTooltip .stLabel').html(
                '$' + ui.values[0].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + 
                ' <span class="fa fa-arrows-h"></span> ' +
                '$' + ui.values[1].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
            );
            var priceSliderRangeLeft = parseInt($('.priceSlider .ui-slider-range').css('left'));
            var priceSliderRangeWidth = $('.priceSlider .ui-slider-range').width();
            var priceSliderLeft = priceSliderRangeLeft + ( priceSliderRangeWidth / 2 ) - ( $('.priceSlider .sliderTooltip').width() / 2 );
            $('.priceSlider .sliderTooltip').css('left', priceSliderLeft);
        }
    });
    $('.priceSlider .sliderTooltip .stLabel').html(
        '$' + $('.priceSlider').slider('values', 0).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + 
        ' <span class="fa fa-arrows-h"></span> ' +
        '$' + $('.priceSlider').slider('values', 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,")
    );
    var priceSliderRangeLeft = parseInt($('.priceSlider .ui-slider-range').css('left'));
    var priceSliderRangeWidth = $('.priceSlider .ui-slider-range').width();
    var priceSliderLeft = priceSliderRangeLeft + ( priceSliderRangeWidth / 2 ) - ( $('.priceSlider .sliderTooltip').width() / 2 );
    $('.priceSlider .sliderTooltip').css('left', priceSliderLeft);

    $('.areaSlider').slider({
        range: true,
        min: 0,
        max: 2000,
        values: [200, 1000],
        step: 10,
        slide: function(event, ui) {
            $('.areaSlider .sliderTooltip .stLabel').html(
                ui.values[0].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' m2' +
                ' <span class="fa fa-arrows-h"></span> ' +
                ui.values[1].toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' m2'
            );
            var areaSliderRangeLeft = parseInt($('.areaSlider .ui-slider-range').css('left'));
            var areaSliderRangeWidth = $('.areaSlider .ui-slider-range').width();
            var areaSliderLeft = areaSliderRangeLeft + ( areaSliderRangeWidth / 2 ) - ( $('.areaSlider .sliderTooltip').width() / 2 );
            $('.areaSlider .sliderTooltip').css('left', areaSliderLeft);
        }
    });
    $('.areaSlider .sliderTooltip .stLabel').html(
        $('.areaSlider').slider('values', 0).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' m2' +
        ' <span class="fa fa-arrows-h"></span> ' +
        $('.areaSlider').slider('values', 1).toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,") + ' m2'
    );
    var areaSliderRangeLeft = parseInt($('.areaSlider .ui-slider-range').css('left'));
    var areaSliderRangeWidth = $('.areaSlider .ui-slider-range').width();
    var areaSliderLeft = areaSliderRangeLeft + ( areaSliderRangeWidth / 2 ) - ( $('.areaSlider .sliderTooltip').width() / 2 );
    $('.areaSlider .sliderTooltip').css('left', areaSliderLeft);

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

    $("#slider1").slider({
        range: "min",
        value: 50,
        min: 1,
        max: 100,
        slide: repositionTooltip,
        stop: repositionTooltip
    });
    $("#slider1 .ui-slider-handle:first").tooltip({ title: $("#slider1").slider("value"), trigger: "manual"}).tooltip("show");

    $("#slider2").slider({
        range: "max",
        value: 70,
        min: 1,
        max: 100,
        slide: repositionTooltip,
        stop: repositionTooltip
    });
    $("#slider2 .ui-slider-handle:first").tooltip({ title: $("#slider2").slider("value"), trigger: "manual"}).tooltip("show");

    $("#slider3").slider({
        range: true,
        min: 0,
        max: 500,
        values: [ 190, 350 ],
        slide: repositionTooltip,
        stop: repositionTooltip
    });
    $("#slider3 .ui-slider-handle:first").tooltip({ title: $("#slider3").slider("values", 0), trigger: "manual"}).tooltip("show");
    $("#slider3 .ui-slider-handle:last").tooltip({ title: $("#slider3").slider("values", 1), trigger: "manual"}).tooltip("show");

    $('#autocomplete').autocomplete({
        source: ["ActionScript", "AppleScript", "Asp", "BASIC", "C", "C++", "Clojure", "COBOL", "ColdFusion", "Erlang", "Fortran", "Groovy", "Haskell", "Java", "JavaScript", "Lisp", "Perl", "PHP", "Python", "Ruby", "Scala", "Scheme"],
        focus: function (event, ui) {
            var label = ui.item.label;
            var value = ui.item.value;
            var me = $(this);
            setTimeout(function() {
                me.val(value);
            }, 1);
        }
    });

    $('#tags').tagsInput({
        'height': 'auto',
        'width': '100%',
        'defaultText': 'Add a tag',
    });

    $('#datepicker').datepicker();

    // functionality for autocomplete address field
    if ($('#address').length > 0) {
        var address = document.getElementById('address');
        var addressAuto = new google.maps.places.Autocomplete(address);

        google.maps.event.addListener(addressAuto, 'place_changed', function() {
            var place = addressAuto.getPlace();

            if (!place.geometry) {
                return;
            }
            if (place.geometry.viewport) {
                map.fitBounds(place.geometry.viewport);
            } else {
                map.setCenter(place.geometry.location);
            }
            newMarker.setPosition(place.geometry.location);
            newMarker.setVisible(true);
            $('#latitude').text(newMarker.getPosition().lat());
            $('#longitude').text(newMarker.getPosition().lng());

            return false;
        });
    }

    $('input, textarea').placeholder();
	
	$('.modal-su').click(function() {
		$('#signin').modal('hide');
		$('#signup').modal('show');
	});

	$('.modal-si').click(function() {
		$('#signup').modal('hide');
		$('#signin').modal('show');
	});	
	

}

$('#btn_filtrar').click(function () {
    var prices = $('.priceSlider').slider("option", "values");
    var areas = $('.priceSlider').slider("option", "values");
	window.location.href = "explore.html?operacion="+$('input[name=tType]:checked').val()+
										'&tipoInmueble='+$('input[name=pType]:checked').val()+
										'&habitaciones='+$('#bedrooms').val()+
										'&banos='+$('#bathrooms').val()+
										'&precioDesde='+prices[0]+
										'&precioHasta='+prices[1]+ 
                                        '&areaDesde='+areas[0]+
                                        '&areaHasta='+areas[1];
});	

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}