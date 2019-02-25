var txtEmail=document.getElementById("txtEmail");
var txtPassword=document.getElementById("txtPassword");

var btnLogin = document.getElementById("btnLogin");
var btnSignUp = document.getElementById("btnSignUp");
var loginModal = document.getElementById("loginModal");

//Dohvati Auth servis za web aplikaciju
var firebaseAuth = firebase.auth();

//klik na Enter aktivira btnLogin event 'click'
loginModal.addEventListener("keyup", function(event){

	if(event.keyCode == 13)
	{
		document.getElementById('btnLogin').click();
	}
});

//Login event
btnLogin.addEventListener('click', function(response)
{
	var email=txtEmail.value;
	var pass = txtPassword.value;

	var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

	if(email.match(mailFormat))
	{
		//Sign in firebase metoda
		//Catch metoda za handle errora
		firebaseAuth.signInWithEmailAndPassword(email, pass).catch(function()
			{
				alert("Pogrešan e-mail ili lozinka!");
			});
	}
	else
	{
		alert("Pogrešan e-mail format!");
	}
});


//SignUp function
btnSignUp.addEventListener('click', function(response)
{
	var email=txtEmail.value;
	var pass = txtPassword.value;
	var mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

	if(email.match(mailFormat))
	{
		//Sign up firebase metoda
		//Catch metoda za handle errora
		firebaseAuth.createUserWithEmailAndPassword(email, pass).catch(function()
			{
				alert("Korisnik s odabranim e-mailom već postoji!");
			});
	}
	else
	{
		alert("Pogrešan e-mail format!");
	}	
});

//Realtime listener
firebase.auth().onAuthStateChanged(function(firebaseUser)
{
	//firebaseUser parametar = firebase podaci prijavljenog korisnika
	if(firebaseUser != null)
	{
		window.open('administracija.html', '_self');
	}
	else
	{
		console.log("Logged out");
	}
});