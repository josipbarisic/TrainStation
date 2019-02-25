//Referenca na bazu
var oDb = firebase.database();

//Referenca gradovi
var oDbGradovi = oDb.ref('gradovi');

var oTablicaGradova = $('#tablica-gradovi');

oDbGradovi.on('value', function(oOdgovorPosluzitelja) 
{
	oTablicaGradova.find('tbody').empty();
	var nRbr = 1;

	oOdgovorPosluzitelja.forEach(function(oGradSnapshot)
	{
		var sGradKey = oGradSnapshot.key;
		var oGrad = oGradSnapshot.val();
		var sRow ='<tr><td>' + (nRbr++) + '.</td><td>' + oGrad.naziv + '</td><td>'+ DostupnostIkona(oGrad.dostupnost) +'</td><td><button type="button" class="btn btn-sm btn-warning" onclick="ModalUrediDostupnost(\''+sGradKey+'\')"><span class="glyphicon glyphicon-pencil"></span></button></td></tr>';
		
		oTablicaGradova.find('tbody').append(sRow);
	});

	oTablicaGradova.DataTable({
		//Opcije za DataTable
			"language":
			{
				//stringovi koji se koriste u tablici
			    "sEmptyTable":      "Nema podataka u tablici",
			    "sInfo":            "Prikazano _START_ do _END_ od _TOTAL_ rezultata",
			    "sInfoEmpty":       "Prikazano 0 do 0 od 0 rezultata",
			    "sInfoFiltered":    "(filtrirano iz _MAX_ ukupnih rezultata)",
			    "sInfoPostFix":     "",
			    "sInfoThousands":   ",",
			    "sLengthMenu":      "Prikaži _MENU_ rezultata po stranici",
			    "sLoadingRecords":  "Dohvaćam...",
			    "sProcessing":      "Obrađujem...",
			    "sSearch":          "Pretraži:",
			    "sZeroRecords":     "Ništa nije pronađeno",
			    "oPaginate": {
			        "sFirst":       "Prva",
			        "sPrevious":    "Nazad",
			        "sNext":        "Naprijed",
			        "sLast":        "Zadnja"
			    },
			    //Accessible Rich Internet Applications - definira uloge elemenata (ako se koristi npr. screen reader aplikacija)
			    "oAria": {
			        "sSortAscending":  ": aktiviraj za rastući poredak",
			        "sSortDescending": ": aktiviraj za padajući poredak"
			    }
			},
			//definira properties za određene("targets") stupce
			"columnDefs":
			[
				{
					"targets": [2, 3], 
					"searchable": false, 
					"orderable": false, 
					"visible": true
				}
			]
		});
});

function DostupnostIkona(dostupnost)
{
	if(dostupnost == 'dostupan')
	{
		var ikona = '<span class="glyphicon glyphicon-ok"></span>';
		return ikona;
	}
	else
	{
		var ikona = '<span class="glyphicon glyphicon-remove"></span>';
		return ikona;
	}
}

function DodajGrad() 
{
	var sGradNaziv = $('#inptNazivGrada').val();
	var dodajGradModal = $('#gradModal');

	var sDostupnostValue = $('input[name="dostupnostInpt"]:checked').val();

	var sLatituda = $('#inptLatituda').val();
	var sLongituda = $('#inptLongituda').val();

	if(sGradNaziv != "" && sDostupnostValue != "" && sLatituda != "" && sLongituda != "")
	{
		//Obrisi DataTable() iz tablice (ucitava se ponovno pri promijeni podataka u bazi podataka)
		oTablicaGradova.DataTable().destroy();

		// Generiranje novoga ključa u bazi
		var sKey = firebase.database().ref().child('gradovi').push().key;

	    var oGrad = 
	    {
	    	dostupnost: sDostupnostValue,
	        latituda: sLatituda,
	        longituda: sLongituda,
	        naziv: sGradNaziv
	    };

	    // Zapiši u Firebase
	    var oZapisGrada = {};
	    oZapisGrada[sKey] = oGrad;
	    //console.log(oZapisGrada);
	    oDbGradovi.update(oZapisGrada);

	    //Zatvori modal i obrisi upisane podatke
	    dodajGradModal.modal('toggle');
	    ObrisiPodatkeModala();
	}
	else
	{
		alert("Sva polja su obavezna!");
	}
}

// Uredi dostupnost
function SpremiUredjenuDostupnost(sGradKey)
{
	oTablicaGradova.DataTable().destroy();
	
	var oGradRef = oDbGradovi.child(sGradKey);

	var sGradDostupnost = $('input[name="urediDostupnostInpt"]:checked').val();

	var oGrad = 
	{
		'dostupnost': sGradDostupnost
	};
	oGradRef.update(oGrad);
}

function ModalUrediDostupnost(sGradKey)
{	
	var oGradRef = oDbGradovi.child(sGradKey);

	var urediRadioButton = $('input[name="urediDostupnostInpt"]');


	oGradRef.once('value', function(oOdgovorPosluzitelja)
	{
		var oGrad = oOdgovorPosluzitelja.val();

		for(i = 0; i<urediRadioButton.length;i++)
		{
			if (oGrad.dostupnost == urediRadioButton[i].getAttribute("value"))
			{
				//console.log(oGrad.dostupnost);
				urediRadioButton[i].setAttribute('checked', true);
			}
		}
		
		$('#btnUrediDostupnost').attr('onclick', 'SpremiUredjenuDostupnost(\''+sGradKey+'\')');

		$('#dostupnostModal').modal('show');
	});
}

function ObrisiPodatkeModala()
{
	$('#inptNazivGrada').val("");

	$('input[name="dostupnostInpt"]:checked').prop('checked', false);

	$('#inptLatituda').val("");
	$('#inptLongituda').val("");
}