var oDb = firebase.database();

var oDbKarte = oDb.ref('karte');
var oDbGradovi = oDb.ref('gradovi');

var oTablicaKarte = $('#tablica-karte');

//Ucitavanje karti iz baze podataka u tablicu
oDbKarte.on('value', function(oKarte)
{
	oTablicaKarte.find('tbody').empty();

	oKarte.forEach(function(oKartaSnap)
	{
		var oKarta = oKartaSnap.val();
		var sKartaKey = oKartaSnap.key;
		var sRow = '<tr><td>' + oKarta.datum + '</td><td>' + oKarta.polaziste + '</td><td>'+ oKarta.odrediste +'</td><td>' + oKarta.udaljenost + '</td><td id="tip-karte">' + oKarta.tip_karte + '</td><td>' + oKarta.cijena + '</td><td><button type="button" class="btn btn-sm btn-success" onclick="PregledKarte(\''+sKartaKey+'\')"><span class="glyphicon glyphicon-modal-window"></span></button></td></tr>';
		oTablicaKarte.find('tbody').prepend(sRow);

	});

	oTablicaKarte.DataTable({
		"language":
		{
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
		    "oAria": {
		        "sSortAscending":  ": aktiviraj za rastući poredak",
		        "sSortDescending": ": aktiviraj za padajući poredak"
		    }
		},
		"columnDefs":
		[
			{
				"targets": [6], 
				"searchable": false, 
				"orderable": false, 
				"visible": true
			}
		]
	});
});

//Polje gradovi za kreiranje karte
var oGradoviPolje = [];
var oModalKarte = $('#karteUnos'); 

oDbGradovi.once('value', function(oOdgovorPosluzitelja) 
{
	oOdgovorPosluzitelja.forEach(function(oGradSnapshot)
	{
		var oGrad = oGradSnapshot.val();
		if(oGrad.dostupnost == 'dostupan')
		{
			var grad_key = oGradSnapshot.key;
			var sOption = '<option value="'+grad_key+'">'+ oGrad.naziv +'</option>';
			oModalKarte.find('#inptPolaziste').append(sOption);

			// DISABLE UCITAVANJA ISTIH GRADOVA U MODALU
			var polazisteKey = $('#inptPolaziste').find(':selected').val();
			
			if(polazisteKey != grad_key)
			{
				oModalKarte.find('#inptOdrediste').append(sOption);
			} 
		}

		oGradoviPolje.push({"idGrada":oGradSnapshot.key, "nazivGrada":oGrad.naziv, "latitudaGrada":oGrad.latituda, "longitudaGrada":oGrad.longituda, "dostupnostGrada":oGrad.dostupnost});
	});
});

//funkcija za reload opcija u select-u #inptPolaziste pri promjeni grada
function PolazistaLiveUpdate()
{	
	var odredisteKey = $('#inptOdrediste').find(':selected').val();
	var polazisteKey = $('#inptPolaziste').find(':selected').val();

	oModalKarte.find('#inptPolaziste').empty();

	oGradoviPolje.forEach(function(oGrad)
		{
			if(oGrad.dostupnostGrada == 'dostupan' && oGrad.idGrada != odredisteKey)
			{
				var sOption = '<option id="'+ oGrad.idGrada +'" value="'+oGrad.idGrada+'">'+ oGrad.nazivGrada +'</option>';
				oModalKarte.find('#inptPolaziste').append(sOption);

				//kod reload-anja vraca selected property odabranom gradu
				if(oGrad.idGrada == polazisteKey)
				 {
				 	$('#inptPolaziste').find('#'+oGrad.idGrada).prop('selected', true);
				 }
			}
		});
}

//funkcija za reload opcija u select-u #inptOdrediste pri promjeni grada
function OdredistaLiveUpdate()
{	
	var polazisteKey = $('#inptPolaziste').find(':selected').val();
	var odredisteKey = $('#inptOdrediste').find(':selected').val();

	oModalKarte.find('#inptOdrediste').empty();

	oGradoviPolje.forEach(function(oGrad)
		{
			if(oGrad.dostupnostGrada == 'dostupan' && oGrad.idGrada != polazisteKey)
			{
				var sOption = '<option id="'+ oGrad.idGrada +'" value="'+oGrad.idGrada+'">'+ oGrad.nazivGrada +'</option>';
				oModalKarte.find('#inptOdrediste').append(sOption);

				//kod reload-anja vraca selected property odabranom gradu
				if(oGrad.idGrada == odredisteKey)
				 {
				 	$('#inptOdrediste').find('#'+oGrad.idGrada).prop('selected', true);
				 }
			}
		});
}

//Ucitaj danasnji datum u modalu
var date = new Date();


var btnKreirajKartu = $('#btnKreirajKartu');

btnKreirajKartu.on('click', function()
{
	var sPolaziste = $('#inptPolaziste').find(':selected').text();
	var	sOdrediste = $('#inptOdrediste').find(':selected').text();
	var sDanasnjiDatum = ''+date.getDate()+'.'+(date.getMonth()+1)+'.'+date.getFullYear()+'.';
	var sTipKarteValue = $('input[name=tipKarte]:checked').val(); 
	var sCijenaKarte = CijenaKarte(sPolaziste, sOdrediste, sTipKarteValue);
	var sUdaljenost = UdaljenostGradova(sPolaziste, sOdrediste).toFixed(2);
	
	var sKey = firebase.database().ref().child('karte').push().key;

	var oKarta = 
	{
		cijena: sCijenaKarte,
		datum: sDanasnjiDatum,
		odrediste: sOdrediste,
		polaziste: sPolaziste,
		tip_karte: sTipKarteValue,
		udaljenost: sUdaljenost
	}
	if(sCijenaKarte != undefined)
	{
		oTablicaKarte.DataTable().destroy();

		var oZapisKarte = {};
		oZapisKarte[sKey] = oKarta;
		oDbKarte.update(oZapisKarte);
		alert('Karta uspješno kreirana');
		$('#izradiKartuModal').modal('hide');
	}
	
});

var btnProvjeriCijenuKarte = $('#btnCijenaKarte');

btnProvjeriCijenuKarte.on('click', function()
{
	var sPolaziste = $('#inptPolaziste').find(':selected').text();
	var	sOdrediste = $('#inptOdrediste').find(':selected').text();
	var sDanasnjiDatum = ''+date.getDate()+'.'+(date.getMonth()+1)+'.'+date.getFullYear()+'.';
	var sTipKarteValue = $('input[name=tipKarte]:checked').val(); 
	var sCijenaKarte = CijenaKarte(sPolaziste, sOdrediste, sTipKarteValue);
	var sUdaljenost = UdaljenostGradova(sPolaziste, sOdrediste).toFixed(2);
	
	if(sCijenaKarte != undefined)
	{
		alert('Cijena karte iznosi: ' + sCijenaKarte + ' KN');
	}
	
});

function UdaljenostGradova(polaziste, odrediste)
{
	var sPolazisteLat;
	var sPolazisteLng;

	var sOdredisteLat;
	var sOdredisteLng;

	oGradoviPolje.forEach(function(oGradSnap)
	{
		var sNazivGrada = oGradSnap.nazivGrada;
		if(polaziste == sNazivGrada)
		{
			sPolazisteLat = parseFloat(oGradSnap.latitudaGrada);
			sPolazisteLng = parseFloat(oGradSnap.longitudaGrada);
		}
		if(odrediste == sNazivGrada)
		{
			sOdredisteLat = parseFloat(oGradSnap.latitudaGrada);
			sOdredisteLng = parseFloat(oGradSnap.longitudaGrada);
		}
	});

	var polazisteLatRad = sPolazisteLat * (Math.PI/180);
	var odredisteLatRad = sOdredisteLat * (Math.PI/180);
	var polazisteLngRad = sPolazisteLng * (Math.PI/180);
	var odredisteLngRad = sOdredisteLng * (Math.PI/180);

	var deltaLat = odredisteLatRad - polazisteLatRad;
	var deltaLng = odredisteLngRad - polazisteLngRad;

	//Haversine-ova formula
	var a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) + Math.cos(polazisteLatRad) * Math.cos(odredisteLatRad) * Math.sin(deltaLng/2) * Math.sin(deltaLng/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

	var radijusZemlje = 6371; //km

	var nUdaljenost = radijusZemlje * c;

	return nUdaljenost;
}

function CijenaKarte(polaziste, odrediste, tip)
{
	var cijenaKarte;

	var udaljenostKm = UdaljenostGradova(polaziste, odrediste).toFixed(2);
	var cijenaJednosmjerne = (udaljenostKm * 0.35).toFixed(2);
	var cijenaDvosmjerne = (0.7*(2*(udaljenostKm * 0.35))).toFixed(2);
	
	if(tip != undefined)
	{
		if(tip == 'jednosmjerna')
		{
			cijenaKarte = cijenaJednosmjerne;
		}
		else
		{
			cijenaKarte = cijenaDvosmjerne;
		}
	}
	else
	{
		alert('Unesite tip karte!');
	}

	return cijenaKarte;
}

function PregledKarte(sKartaKey)
{
	var oKartaRef = firebase.database().ref('karte/'+sKartaKey);

	oKartaRef.once('value', function(oKartaSnap){

		var oKarta = oKartaSnap.val();

		$('#idKarte').text(oKartaSnap.key);
		$('#datumKarte').text(oKarta.datum);
		$('#polazisteKarte').text(oKarta.polaziste);
		$('#odredisteKarte').text(oKarta.odrediste);
		$('#tipKarte').text(oKarta.tip_karte);
		$('#udaljenostKarte').text(oKarta.udaljenost + ' km');
		$('#cijenaKarte').text(oKarta.cijena + ' kn');

		$('#kartaModal').modal('show');
	});
}

function IspisKarte()
{
	location.reload();

	$('#printBtn').hide();
	$('#zatvoriKartuBtn').hide();

	//printMe metoda iz PrintMe plugin-a omogucava print samo odabranog html elementa
	$('#kartaModal').printMe();
}

function ObrisiPodatkeModalaKarte()
{
	$('input[name="tipKarte"]:checked').prop('checked', false);
}