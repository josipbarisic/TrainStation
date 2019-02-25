var btnLogout = document.getElementById("logoutBtn");
//Logout event
btnLogout.addEventListener('click', function(log){
	firebase.auth().signOut();
	window.open('index.html', '_self');
});