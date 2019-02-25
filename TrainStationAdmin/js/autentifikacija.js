$('body').hide();
		
firebase.auth().onAuthStateChanged(function(firebaseUser) 
{
	if (firebaseUser != null) 
	{
	  console.log("Logged in");
	  $('body').show();
	} 
	else 
	{
	  window.open('index.html', '_self');
  	}
});
