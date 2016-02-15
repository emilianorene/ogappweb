//Valida si existe una session valida
 $(document).ready(function () {
	 	
	if (typeof (Storage) !== "undefined") {
		if(sessionStorage.id_usuario > 0)
		{
			//alert('user: '+sessionStorage.id_usuario);
			$('span.headerUserName').text(sessionStorage.nombre);
			if(sessionStorage.url_imagen != null && sessionStorage.url_imagen != "")
			{	
				//alert(sessionStorage.url_imagen);
				$('img.avatar').attr('src',sessionStorage.url_imagen); 
				
			}
			$('#user_menu').show();
			$('#guest_menu').hide();
		}
		else
		{
			//alert('Guest: '+sessionStorage.id_usuario);
			$('#user_menu').hide();
			$('#guest_menu').show();
		}
	}
	else
	{
		alert("Storage no soportado");
		$('#user_menu').hide();
		$('#guest_menu').show();
	}	
	
		
});	



//Script del login
$('#btn_signin').click(function () {  
    $('#signin-form').submit();
});

function ingresar()
{
	$.ajax(
		{
			type: "POST",
			url: "http://www.ipositivo.com/oga/v1/index.php",
			data: {tag:'login',email:$('#email').val(),password:$('#password').val()},
			crossDomain: true,
			dataType: "json",
			success: function (data, status, jqXHR) {                                
				//alert("Recibimos algo "+JSON.stringify(data));
				if(data.success == 1)
				{
					if (typeof (Storage) !== "undefined") {
						sessionStorage.id_usuario = data.id_usuario;
						sessionStorage.email = data.usuario.email;
						sessionStorage.nombre = data.usuario.nombre;
						sessionStorage.url_imagen = data.usuario.url_imagen;
						window.location.href = "explore.html";
					}
					else
					{
						alert("Storage no soportado");
					}	
				}
				else
				{
					alert(data.error_msg);
				}
							
				
			},
			error: function (xhr) {
				alert("Error al iniciar la sesion: "+xhr);

			}
		});
}


//Script del loguot
$('#btn_logout').click(function () {		
	
	if (typeof (Storage) !== "undefined") {
		sessionStorage.id_usuario = null;
		sessionStorage.email = '';
		sessionStorage.nombre = 'Anonimo';
		window.location.href = "explore.html";
	}
	else
	{
		alert("Storage no soportado");
	}	
});	

//Script del loguot
$('#btn_profile').click(function () {
    //alert("click profile");
	window.location.href = "myprofile.html";
});	
//Script del registrar
$('#btn_signup').click(function () {  
    $('#signup-form').submit();
});
function registrarse()
{
	$.ajax(
		{
			type: "POST",
			url: "http://www.ipositivo.com/oga/v1/index.php",
			data: {tag:'register',email:$('#signup-email').val(),password:$('#signup-password').val(),nombre:$('#signup-name').val(),categoria:'1'},
			crossDomain: true,
			dataType: "json",
			success: function (data, status, jqXHR) {                                
				if(data.success == 1)
				{
					if (typeof (Storage) !== "undefined") {
						sessionStorage.id_usuario = data.id_usuario;
						sessionStorage.email = data.usuario.email;
						sessionStorage.nombre = data.usuario.nombre;
						window.location.href = "explore.html";
					}
					else
					{
						alert("Storage no soportado");
					}	
				}
				else
				{
					alert(data.error_msg);
				}
				
			},
			error: function (xhr) {
				alert("Usuario no registrado, pruebe nuevamente");

			}
		});
}

// Validaciones
(function($,W,D)
{
    var JQUERY4U = {};

    JQUERY4U.UTIL =
    {
        setupFormValidation: function()
        {
            //form validation rules
            $("#signup-form").validate({
                rules: {
                    name: "required",
                    email: {
                        required: true,
                        email: true
                    },
                    password: {
                        required: true,
                        minlength: 5
                    },
                    repassword: {
                        required: true,
                        equalTo: "#signup-password"
                    }
                },
                messages: {
                    name: "Por favor ingrese su nombre",
                    password: {
                        required: "Por favor ingrese una contraseña",
                        minlength: "Su contraseña debe tener al menos 5 caracteres"
                    },
                    email: "Por favor ingrese su email",
                    repassword: {
                        required: "Por favor repita la contraseña",
                        equalTo: "Las contraseñas deben coincidir"
                    }
                },
                submitHandler: function(form) {
                    registrarse();
                }
            });

            //form validation rules
            $("#signin-form").validate({
                rules: {
                    email: {
                        required: true,
                        email: true
                    },
                    password: "required"
                },
                messages: {
                    email: "Por favor ingrese su email",
                    password: "Por favor ingrese su contraseña"
                },
                submitHandler: function(form) {
                    ingresar();
                }
            });
             
        }
    }

    //when the dom has loaded setup form validation rules
    $(D).ready(function($) {
        JQUERY4U.UTIL.setupFormValidation();
    });

})(jQuery, window, document);