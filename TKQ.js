var myModal = document.getElementById('delModal')
var myInput = document.getElementById('CancelDelButton')

myModal.addEventListener('shown.bs.modal', function () {
  myInput.focus()
})

var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
  return new bootstrap.Tooltip(tooltipTriggerEl)
})

window.addEventListener("beforeunload", function (event) {
	event.preventDefault();
	let confirmationMessage = "Etes-vous sûr de vouloir rafraichir la page, toute passation non sauvegardée sera perdu !";
	event.returnValue = confirmationMessage;     // Gecko, Trident, Chrome 34+
	return confirmationMessage;              // Gecko, WebKit, Chrome <34
});


var Stopwatch = function(elem, options) {

	var timer = createTimer(),
		offset,
		clock,
		interval;

	var startButton = document.getElementById("playBtn");
	startButton.addEventListener("click", function(event) {
			start();
			event.preventDefault();
		});
	var pauseButton = document.getElementById("pauseBtn");
	pauseButton.addEventListener("click", function(event) {
			stop();
			event.preventDefault();
		});
	

	// default options
	options = options || {};
	options.delay = options.delay || 1;

	// append elements     
	elem.insertBefore(timer, elem.firstChild);

	// initialize
	reset();

	// private functions
	function createTimer() {
		return document.createElement("span");
	}

	function start() {
		if (!interval) {
			offset = Date.now();
			interval = setInterval(update, options.delay);
			startButton.classList.add("d-none");
			pauseButton.classList.remove("d-none");
		}
	}

	function stop() {
		if (interval) {
			clearInterval(interval);
			interval = null;
			startButton.classList.remove("d-none");
			pauseButton.classList.add("d-none");
		}
	}

	function reset() {
		clock = 0;
		render();
		startButton.classList.remove("d-none");
		pauseButton.classList.add("d-none");
	}

	function update() {
		clock += delta();
		render();
	}

	function render() {
		let hour = Math.floor(clock/3600000);
		let min = Math.floor(clock/60000) - hour*60;
		let sec = Math.floor(clock/1000) - hour*3600 - min*60;
		timer.innerHTML = (hour<=9 ? "0" : "")+hour+":"+(min<=9?"0":"")+min+":"+(sec<=9?"0":"")+sec;
	}

	function delta() {
		var now = Date.now(),
		d = now - offset;

		offset = now;
		return d;
	}
	
	function restart(){
		reset();
		start();
		startButton.classList.add("d-none");
		pauseButton.classList.remove("d-none");
	}
	
	function getClock(){
		return clock;
	}
	
	function setClock(newTimer){
		clock = newTimer;
		render();
	}

	// public API
	this.restart = restart;
	this.stop = stop;
	this.getClock = getClock;
	this.setClock = setClock;
};

var d = document.getElementById("d-timer");
dTimer = new Stopwatch(d, {
	delay: 1000
});

var menuPassation = document.getElementById("menu_passation");
var menuInfo = document.getElementById("menu_info");
var menuBD = document.getElementById("menu_bd");

var passation = document.getElementById("passation");
var info = document.getElementById("info");
var bd = document.getElementById("bd");

var selectedLine = -1; // si égal à -1 => aucune ligne sélectionnée

document.getElementById("datePassation").value = new Date().toJSON().split('T')[0];

var db_version = 5 // version de la base de donnée en cas de changement de la structure

var openDBRequest = window.indexedDB.open("database", db_version);
var database = null;

openDBRequest.onupgradeneeded = function() {
	// triggers if the client had no database
	database = openDBRequest.result;
	if (!database.objectStoreNames.contains('childs_v'+db_version)) {
		database.createObjectStore('childs_v'+db_version, {autoIncrement:true}); // create it
	}
};

openDBRequest.onerror = function() {
	console.error("Error", openDBRequest.error);
};

openDBRequest.onsuccess = function() {
	database = openDBRequest.result;
	refreshDB();
};


$(document).ready(function(){
	$("ul.navbar-nav li a").click(function(e){ 
		e.preventDefault();
		let target = $(this).attr('href'); //get the link you want to load data from
		
		passation.classList.add("d-none");
		info.classList.add("d-none");
		bd.classList.add("d-none");
		
		document.getElementById(target).classList.remove("d-none");
		
		menuPassation.classList.remove("active");
		menuPassation.classList.add("text-white");
		menuPassation.removeAttribute("aria-current");
		menuInfo.classList.remove("active");
		menuInfo.classList.add("text-white");
		menuInfo.removeAttribute("aria-current");
		menuBD.classList.remove("active");
		menuBD.classList.add("text-white");
		menuBD.removeAttribute("aria-current");
		
		document.getElementById("menu_"+target).classList.add("active");
		document.getElementById("menu_"+target).classList.remove("text-white");
		document.getElementById("menu_"+target).setAttribute("aria-current", "page");
	});
});

function disableNotTV(tv){
	if(tv.checked){
		let notTV = document.querySelectorAll(`input[type="checkbox"][subset="notTV"]`);
		for (var i = 0 ; i < notTV.length ; i++){
			notTV[i].checked = false;
		}
	}
}

function disableTV(notTv){
	if(notTv.checked){
		document.getElementById("InfoCompTV").checked = false;
	}
}

function collapseMenu(){
	let menu = document.getElementById('mobileMenu');
	if (window.getComputedStyle(menu).display == "block")
		menu.click();
}

function updateModalText(id){
	let question = document.getElementById(id).innerHTML;
	let modalTexts = document.getElementsByName("modalText");
	for (var i = 0 ; i < modalTexts.length ; i++){
		modalTexts[i].innerHTML = question;
	}
}

function toggle(srcTag, target1, target2){
	if (srcTag.checked){
		document.getElementById(target1).setAttribute('disabled', true);
		document.getElementById(target1).value = "";
		if (target2 != null){
			document.getElementById(target2).setAttribute('disabled', true);
			document.getElementById(target2).value = "";
		}
	}
	else{
		document.getElementById(target1).removeAttribute('disabled');
		if (target2 != null)
			document.getElementById(target2).removeAttribute('disabled');
	}
}

function removeLine(id){
	selectedLine = id;
}

function removeSelectedLine(){
	if (database != null){
		let transaction = database.transaction("childs_v"+db_version, "readwrite");
		let childs = transaction.objectStore("childs_v"+db_version);
		let objectStoreRequest;
		if (selectedLine == -1)
			objectStoreRequest = childs.clear();
		else{
			objectStoreRequest = childs.delete(selectedLine);
			selectedLine = -1;
		}
		objectStoreRequest.onsuccess = (event) => {
			refreshDB();
		};
		
	}
}

function refreshDB(){
	if (database != null){
		let htmlContent = document.getElementById("bdContent");
		// remove all childs nodes
		while (htmlContent.firstChild) {
			htmlContent.removeChild(htmlContent.firstChild);
		}
		let transaction = database.transaction("childs_v"+db_version, "readwrite");
		let childs = transaction.objectStore("childs_v"+db_version);
		childs.openCursor().onsuccess = (event) => {
			const cursor = event.target.result;
			if (cursor) {
				let trTag = document.createElement("tr");
				// add remove line button
				let tdTag = document.createElement("td");
				tdTag.innerHTML = "<td><button type='button' class='btn btn-danger' onclick='removeLine("+cursor.key+")' data-bs-toggle='modal' data-bs-target='#delModal' data-bs-toggle='tooltip' title='Supprimer cette ligne'><img src='./Images/trash.png' height='20'></button></td>";
				tdTag.className = "align-middle";
				trTag.appendChild(tdTag);
				// add edit line button
				tdTag = document.createElement("td");
				tdTag.innerHTML = "<td><button type='button' class='btn btn-primary' onclick='editLine("+cursor.key+")' data-bs-toggle='tooltip' title='Editer cette ligne'><img src='./Images/pen.png' height='20'></button></td>";
				tdTag.className = "align-middle";
				trTag.appendChild(tdTag);
				// add id field
				tdTag = document.createElement("td");
				tdTag.appendChild(document.createTextNode(cursor.key));
				trTag.appendChild(tdTag);
				// add other 
				for (const [key, value] of Object.entries(cursor.value)) {
					tdTag = document.createElement("td");
					let content = value;
					if (!isNaN(Number(content)) && content != "")
						content = Math.round(Number(content)*100)/100;
					tdTag.appendChild(document.createTextNode(content));
					trTag.appendChild(tdTag);
				}
				htmlContent.appendChild(trTag);
				cursor.continue();
			} else {
				console.log("database displayed");
				if (htmlContent.childNodes.length > 1)
					document.getElementById("clearBaseButton").classList.remove("d-none");
				else
					document.getElementById("clearBaseButton").classList.add("d-none");
			}
		};
	}
}

function exportToCSV() {
	// Variable to store the final csv data
	var csv_data = [];
	// Get each row data
	var rows = document.getElementsByTagName('tr');
	for (var i = 0; i < rows.length; i++) {
		// Get each column data
		var cols = rows[i].querySelectorAll('td,th');
		// Stores each csv row data
		var csvrow = [];
		for (var j = 2; j < cols.length; j++) { // les deux premières colonnes servent à supprimer ou éditer une ligne, on ne les exportent pas
			// Get the text data of each cell of
			// a row and push it to csvrow
			csvrow.push(cols[j].innerHTML);
		}
		// Combine each column value with a semicolon
		csv_data.push(csvrow.join(';'));
	}
	// combine each row data with new line character
	csv_data = csv_data.join('\n');
	
	// Create CSV file object and feed our
	// csv_data into it
	CSVFile = new Blob([csv_data], { type: "text/csv" });
	
	// Create to temporary link to initiate
	// download process
	var temp_link = document.createElement('a');
	
	// Download csv file
	temp_link.download = "export.csv";
	var url = window.URL.createObjectURL(CSVFile);
	temp_link.href = url;

	// This link should not be displayed
	temp_link.style.display = "none";
	document.body.appendChild(temp_link);

	// Automatically click the link to trigger download
	temp_link.click();
	document.body.removeChild(temp_link);
}

function newTest(){
	selectedLine = -1;
	document.getElementById("form").classList.remove("d-none");
	document.getElementById("btnStart").removeAttribute('disabled');
	document.getElementById("results").classList.add("d-none");
	document.getElementById("TKQContent").classList.add("d-none");
			
	document.getElementById("saveUpdate").innerHTML = "Enregistrer";
	
	//clean form
	let radios = document.querySelectorAll(`input[type="radio"]:checked`);
	for (var i = 0; i < radios.length; i++) {
		radios[i].checked = false;
	}
	let inputs = document.querySelectorAll(`input[type="number"]`);
	for (var i = 0; i < inputs.length; i++) {
		inputs[i].value = "";
		inputs[i].removeAttribute('disabled');
	}
	inputs = document.querySelectorAll(`input[type="text"]`);
	for (var i = 0; i < inputs.length; i++) {
		inputs[i].value = "";
		inputs[i].removeAttribute('disabled');
	}
	let checkBox = document.querySelectorAll(`input[type="checkbox"]`);
	for (var i = 0; i < checkBox.length; i++) {
		checkBox[i].checked = false;
	}
	document.getElementById("dateNaissance").value = "";
	document.getElementById("commentaire").value = "";
}

function startTest(){
	document.getElementById("TKQContent").classList.remove("d-none");
	document.getElementById("btnStart").disabled = true;
	
	// start timer
	dTimer.restart();
}

function computeScore(){
	// hide timer controls
	dTimer.stop();
	document.getElementById("playBtn").classList.add("d-none");
	document.getElementById("pauseBtn").classList.add("d-none");
	
	document.getElementById("results").classList.add("d-none"); // on commence par cacher le résultat au cas où des données d'entrée seraient non valide (valeurs négatives par exemple).
	
	let inputNumbers = document.querySelectorAll(`input[type="number"]`)
	for (var i = 0 ; i < inputNumbers.length ; i++)
		if (!inputNumbers[i].validity.valid){
			let id = inputNumbers[i].id;
			inputNumbers[i].scrollIntoView(true);
			alert ("Veuillez vérifier le champs \""+id.split('-')[0]+"\" !");
			return;
		}
	
	let scoreOR = document.querySelectorAll(`input[type="radio"][subset="OR"]:checked`).length;
	document.getElementById("scoreOR").innerText = scoreOR;
	let nspOR = document.querySelectorAll(`input[type="radio"][subset="OR_NSP"]:checked`).length;
	document.getElementById("scoreOR_NSP").innerText = nspOR;
	
	let scoreSEQ = document.querySelectorAll(`input[type="radio"][subset="SEQ"]:checked`).length;
	document.getElementById("scoreSEQ").innerText = scoreSEQ;
	let nspSEQ = document.querySelectorAll(`input[type="radio"][subset="SEQ_NSP"]:checked`).length;
	document.getElementById("scoreSEQ_NSP").innerText = nspSEQ;
	
	let scoreTU = document.querySelectorAll(`input[type="radio"][subset="TU"]:checked`).length;
	document.getElementById("scoreTU").innerText = scoreTU;
	let nspTU = document.querySelectorAll(`input[type="radio"][subset="TU_NSP"]:checked`).length;
	document.getElementById("scoreTU_NSP").innerText = nspTU;
	
	let scoreCLO = document.querySelectorAll(`input[type="radio"][subset="CLO"]:checked`).length;
	document.getElementById("scoreCLO").innerText = scoreCLO;
	let nspCLO = document.querySelectorAll(`input[type="radio"][subset="CLO_NSP"]:checked`).length;
	document.getElementById("scoreCLO_NSP").innerText = nspCLO;
	
	let scoreS1 = document.querySelectorAll(`input[type="radio"][set="S1"]:checked`).length;
	document.getElementById("scoreS1").innerText = scoreS1;
	let nspS1 = nspOR+nspSEQ+nspTU+nspCLO
	document.getElementById("scoreS1_NSP").innerText = nspS1;
	
	let scoreAGE = 0;
	let answerAGE1 = document.getElementById("AGE1-input").value;
	if (answerAGE1 >= 4 && answerAGE1 <= 10)
		scoreAGE += 2;
	else if (answerAGE1 >= 2 && answerAGE1 <= 15)
		scoreAGE += 1;
	let answerAGE2 = document.getElementById("AGE2-input").value;
	if (answerAGE2 >= 15 && answerAGE2 <= 30)
		scoreAGE += 2;
	else if (answerAGE2 >= 5 && answerAGE2 <= 40)
		scoreAGE += 1;
	let answerAGE3 = document.getElementById("AGE3-input").value;
	if (answerAGE3 >= 20 && answerAGE3 <= 55)
		scoreAGE += 2;
	else if (answerAGE3 > 55 && answerAGE3 <= 90)
		scoreAGE += 1;
	
	let birthday = new Date(document.getElementById("dateNaissance").value);
	
	let today = new Date();
	
	let birthdayLastYear = new Date(birthday.getTime());
	birthdayLastYear.setFullYear(today.getFullYear()-1);
	let birthdayThisYear = new Date(birthday.getTime());
	birthdayThisYear.setFullYear(today.getFullYear());
	let birthdayNextYear = new Date(birthday.getTime());
	birthdayNextYear.setFullYear(today.getFullYear()+1);
	
	let nbMonth_next = 0;
	let nbMonth_prev = 0;
	let dayDuration = 1000*60*60*24;
	let monthDuration = dayDuration*(365/12);
	
	if (Math.floor(birthdayThisYear.getTime()/dayDuration) < Math.floor(today.getTime()/dayDuration)){
		nbMonth_prev = Math.abs(today.getTime() - birthdayThisYear.getTime())/monthDuration;
		nbMonth_next = Math.abs(birthdayNextYear.getTime() - today.getTime())/monthDuration;
	} else if (Math.floor(birthdayThisYear.getTime()/dayDuration) > Math.floor(today.getTime()/dayDuration)){
		nbMonth_prev = Math.abs(today.getTime() - birthdayLastYear.getTime())/monthDuration;
		nbMonth_next = Math.abs(birthdayThisYear.getTime() - today.getTime())/monthDuration;
	} else {
		nbMonth_prev = 0;
		nbMonth_next = 0;
	}
	
	let scoreCYC = document.querySelectorAll(`input[type="radio"][subset="CYC"]:checked`).length;
	
	console.log(nbMonth_prev+" "+nbMonth_next);
	
	let answerCYC3 = document.getElementById("CYC3-input").value;
	
	if (answerCYC3 == null || answerCYC3 === "")
		scoreCYC += 0;
	else{
		if (answerCYC3 >= 12)
			answerCYC3 = answerCYC3-12; // pour gérer le cas où la date d'anniversaire est dans le mois en cours
		if (Math.abs(nbMonth_prev - answerCYC3) <= 1)
			scoreCYC += 3;
		else if (Math.abs(nbMonth_prev - answerCYC3) <= 3)
			scoreCYC += 2;
		else if (Math.abs(nbMonth_prev - answerCYC3) < 12)
			scoreCYC += 1;
		else
			scoreCYC += 0;
	}
	
	let answerCYC4 = document.getElementById("CYC4-input").value;
	
	if (answerCYC4 == null || answerCYC4 === "")
		scoreCYC += 0;
	else {
		if (answerCYC4 >= 12)
			answerCYC4 = answerCYC4-12; // pour gérer le cas où la date d'anniversaire est dans le mois en cours
		if (Math.abs(nbMonth_next - answerCYC4) <= 1)
			scoreCYC += 3;
		else if (Math.abs(nbMonth_next - answerCYC4) <= 3)
			scoreCYC += 2;
		else if (Math.abs(nbMonth_next - answerCYC4) < 12)
			scoreCYC += 1;
		else
			scoreCYC += 0;
	}
	
	let scoreCUR = 0;
	let answerCUR = document.getElementById("CUR-input_h").value*60+document.getElementById("CUR-input_min").value*1; // on multiplie par 1 pour récupérer un nombre, sinon le + fait une concaténation
	if (answerCUR != null && answerCUR != "" && answerCUR > 0)
		scoreCUR = Math.round(Math.max(0, 10 - 10*Math.abs(Math.log10((dTimer.getClock()/60000)/answerCUR))));
	
	document.getElementById("scoreAGE").innerText = scoreAGE;
	let nspAGE = document.querySelectorAll(`input[type="checkbox"][subset="AGE_NSP"]:checked`).length;
	document.getElementById("scoreAGE_NSP").innerText = nspAGE;
	
	document.getElementById("scoreCYC").innerText = scoreCYC;
	let nspCYC1 = document.querySelectorAll(`input[type="radio"][subset="CYC_NSP"]:checked`).length;
	let nspCYC2 = document.querySelectorAll(`input[type="checkbox"][subset="CYC_NSP"]:checked`).length;
	document.getElementById("scoreCYC_NSP").innerText = nspCYC1+nspCYC2;
	
	document.getElementById("scoreCUR").innerText = Math.round(scoreCUR*100)/100;
	let nspCUR = document.querySelectorAll(`input[type="checkbox"][subset="CUR_NSP"]:checked`).length;
	document.getElementById("scoreCUR_NSP").innerText = nspCUR;
	
	let scoreS2 = scoreAGE + scoreCYC + scoreCUR;
	document.getElementById("scoreS2").innerText = Math.round(scoreS2*100)/100;
	let nspS2 = nspAGE+nspCYC1+nspCYC2+nspCUR
	document.getElementById("scoreS2_NSP").innerText = nspS2;
	
	let scoreTKQ = scoreS1 + scoreS2;
	document.getElementById("scoreTKQ").innerText = Math.round(scoreTKQ*100)/100;
	document.getElementById("scoreTKQ_NSP").innerText = nspS1+nspS2;
	
	document.getElementById("results").classList.remove("d-none"); // Tout c'est bien passé, on affiche les résultats
	
	// autoscroll to the end of the page
	window.scrollTo(0, document.body.scrollHeight);
}

function savePassation(){
	if (database != null){
		let transaction = database.transaction("childs_v"+db_version, "readwrite");
		let childs = transaction.objectStore("childs_v"+db_version);
		let child = {
			codeXP: document.getElementById("codeXP").value,
			datePassation: document.getElementById("datePassation").value,
			codeEnfant: document.getElementById("codeEnfant").value,
			dateNaissance: document.getElementById("dateNaissance").value,
			infoComp: document.getElementById("InfoCompTV").checked ? "SDA" : ((document.getElementById("InfoCompULIS").checked ? "ULIS" : "")+" "+(document.getElementById("InfoCompDYS").checked ? "DYS" : "")+" "+(document.getElementById("InfoCompTSA").checked ? "TSA" : "")+" "+(document.getElementById("InfoCompTDAH").checked ? "TDAH" : "")),
			scoreOR: document.getElementById("scoreOR").innerText,
			scoreSEQ: document.getElementById("scoreSEQ").innerText,
			scoreTU: document.getElementById("scoreTU").innerText,
			scoreCLO: document.getElementById("scoreCLO").innerText,
			scoreAGE: document.getElementById("scoreAGE").innerText,
			scoreCYC: document.getElementById("scoreCYC").innerText,
			scoreCUR: document.getElementById("scoreCUR").innerText,
			scoreS1: document.getElementById("scoreS1").innerText,
			scoreS2: document.getElementById("scoreS2").innerText,
			scoreTKQ: document.getElementById("scoreTKQ").innerText,
			or1: document.getElementById("OR1-success-outlined").checked?1:(document.getElementById("OR1-danger-outlined").checked?0:-1),
			or1_com: document.getElementById("OR1-comment-content").value,
			or2: document.getElementById("OR2-success-outlined").checked?1:(document.getElementById("OR2-danger-outlined").checked?0:-1),
			or2_com: document.getElementById("OR2-comment-content").value,
			or3: document.getElementById("OR3-success-outlined").checked?1:(document.getElementById("OR3-danger-outlined").checked?0:-1),
			or3_com: document.getElementById("OR3-comment-content").value,
			or4: document.getElementById("OR4-success-outlined").checked?1:(document.getElementById("OR4-danger-outlined").checked?0:-1),
			or4_com: document.getElementById("OR4-comment-content").value,
			or5: document.getElementById("OR5-success-outlined").checked?1:(document.getElementById("OR5-danger-outlined").checked?0:-1),
			or5_com: document.getElementById("OR5-comment-content").value,
			seq1: document.getElementById("SEQ1-success-outlined").checked?1:(document.getElementById("SEQ1-danger-outlined").checked?0:-1),
			seq1_com: document.getElementById("SEQ1-comment-content").value,
			seq2: document.getElementById("SEQ2-success-outlined").checked?1:(document.getElementById("SEQ2-danger-outlined").checked?0:-1),
			seq2_com: document.getElementById("SEQ2-comment-content").value,
			seq3: document.getElementById("SEQ3-success-outlined").checked?1:(document.getElementById("SEQ3-danger-outlined").checked?0:-1),
			seq3_com: document.getElementById("SEQ3-comment-content").value,
			tu1: document.getElementById("TU1-success-outlined").checked?1:(document.getElementById("TU1-danger-outlined").checked?0:-1),
			tu1_com: document.getElementById("TU1-comment-content").value,
			tu2: document.getElementById("TU2-success-outlined").checked?1:(document.getElementById("TU2-danger-outlined").checked?0:-1),
			tu2_com: document.getElementById("TU2-comment-content").value,
			tu3: document.getElementById("TU3-success-outlined").checked?1:(document.getElementById("TU3-danger-outlined").checked?0:-1),
			tu3_com: document.getElementById("TU3-comment-content").value,
			tu4: document.getElementById("TU4-success-outlined").checked?1:(document.getElementById("TU4-danger-outlined").checked?0:-1),
			tu4_com: document.getElementById("TU4-comment-content").value,
			clo1: document.getElementById("CLO1-success-outlined").checked?1:(document.getElementById("CLO1-danger-outlined").checked?0:-1),
			clo1_com: document.getElementById("CLO1-comment-content").value,
			clo2: document.getElementById("CLO2-success-outlined").checked?1:(document.getElementById("CLO2-danger-outlined").checked?0:-1),
			clo2_com: document.getElementById("CLO2-comment-content").value,
			clo3: document.getElementById("CLO3-success-outlined").checked?1:(document.getElementById("CLO3-danger-outlined").checked?0:-1),
			clo3_com: document.getElementById("CLO3-comment-content").value,
			clo4: document.getElementById("CLO4-success-outlined").checked?1:(document.getElementById("CLO4-danger-outlined").checked?0:-1),
			clo4_com: document.getElementById("CLO4-comment-content").value,
			clo5: document.getElementById("CLO5-success-outlined").checked?1:(document.getElementById("CLO5-danger-outlined").checked?0:-1),
			clo5Why: document.getElementById("CLO5WHY-secondary-outlined").checked?-1:document.getElementById("CLO5-input").value,
			clo5_com: document.getElementById("CLO5-comment-content").value,
			age1: document.getElementById("AGE1-secondary-outlined").checked?-1:document.getElementById("AGE1-input").value,
			age1_com: document.getElementById("AGE1-comment-content").value,
			age2: document.getElementById("AGE2-secondary-outlined").checked?-1:document.getElementById("AGE2-input").value,
			age2_com: document.getElementById("AGE2-comment-content").value,
			age3: document.getElementById("AGE3-secondary-outlined").checked?-1:document.getElementById("AGE3-input").value,
			age3_com: document.getElementById("AGE3-comment-content").value,
			cyc2: document.getElementById("CYC2-success-outlined").checked?1:(document.getElementById("CYC2-danger-outlined").checked?0:-1),
			cyc2_com: document.getElementById("CYC2-comment-content").value,
			cyc3: document.getElementById("CYC3-secondary-outlined").checked?-1:document.getElementById("CYC3-input").value,
			cyc3_com: document.getElementById("CYC3-comment-content").value,
			cyc4: document.getElementById("CYC4-secondary-outlined").checked?-1:document.getElementById("CYC4-input").value,
			cyc4_com: document.getElementById("CYC4-comment-content").value,
			chrono: dTimer.getClock()/60000,
			cur: document.getElementById("CUR-secondary-outlined").checked?-1:document.getElementById("CUR-input_h").value*60+document.getElementById("CUR-input_min").value*1, // on multiplie par 1 pour récupérer un nombre, sinon le + fait une concaténation
			cur_com: document.getElementById("CUR-comment-content").value,
			comment: document.getElementById("commentaire").value
		};
		if (selectedLine == -1){
			let request = childs.add(child);
			request.onsuccess = function() {
				console.log("Child added to the store", request.result);
				refreshDB();
				alert("Passation enregistrée dans la base de données");
				
				window.scrollTo(0, 0);
			};
		} else {
			let request = childs.put(child, selectedLine);
			request.onsuccess = function() {
				console.log("Child updated to the store", request.result);
				refreshDB();
				alert("Passation mise à jour dans la base de données");
				
				window.scrollTo(0, 0);
			};
		}
	}
}

function editLine(id){
	if (database != null){
		let transaction = database.transaction("childs_v"+db_version, "readwrite");
		let childs = transaction.objectStore("childs_v"+db_version);
		let objectStoreRequest = childs.get(id);
		objectStoreRequest.onsuccess = function(event){
			newTest();
			startTest();
			selectedLine = id; // important de le faire après l'appel de newTest()
			const record = objectStoreRequest.result;
			document.getElementById("codeXP").value = record.codeXP;
			document.getElementById("datePassation").value = record.datePassation;
			document.getElementById("codeEnfant").value = record.codeEnfant;
			document.getElementById("dateNaissance").value = record.dateNaissance;
			document.getElementById("InfoCompTV").checked = record.infoComp.includes("TV");
			document.getElementById("InfoCompULIS").checked = record.infoComp.includes("ULIS");
			document.getElementById("InfoCompDYS").checked = record.infoComp.includes("DYS");
			document.getElementById("InfoCompTSA").checked = record.infoComp.includes("TSA");
			document.getElementById("InfoCompTDAH").checked = record.infoComp.includes("TDAH");
			document.getElementById("scoreOR").innerText = record.scoreOR;
			document.getElementById("scoreSEQ").innerText = record.scoreSEQ;
			document.getElementById("scoreTU").innerText = record.scoreTU;
			document.getElementById("scoreCLO").innerText = record.scoreCLO;
			document.getElementById("scoreAGE").innerText = record.scoreAGE;
			document.getElementById("scoreCYC").innerText = record.scoreCYC;
			document.getElementById("scoreCUR").innerText = record.scoreCUR;
			document.getElementById("scoreS1").innerText = record.scoreS1;
			document.getElementById("scoreS2").innerText = record.scoreS2;
			document.getElementById("scoreTKQ").innerText = record.scoreTKQ;
			
			document.getElementById("OR1-success-outlined").checked = record.or1==1;
			document.getElementById("OR1-danger-outlined").checked = record.or1==0;
			document.getElementById("OR1-secondary-outlined").checked = record.or1==-1;
			document.getElementById("OR1-comment-content").value = record.or1_com;
			
			document.getElementById("OR2-success-outlined").checked = record.or2==1;
			document.getElementById("OR2-danger-outlined").checked = record.or2==0;
			document.getElementById("OR2-secondary-outlined").checked = record.or2==-1;
			document.getElementById("OR2-comment-content").value = record.or2_com;
			
			document.getElementById("OR3-success-outlined").checked = record.or3==1;
			document.getElementById("OR3-danger-outlined").checked = record.or3==0;
			document.getElementById("OR3-secondary-outlined").checked = record.or3==-1;
			document.getElementById("OR3-comment-content").value = record.or3_com;
			
			document.getElementById("OR4-success-outlined").checked = record.or4==1;
			document.getElementById("OR4-danger-outlined").checked = record.or4==0;
			document.getElementById("OR4-secondary-outlined").checked = record.or4==-1;
			document.getElementById("OR4-comment-content").value = record.or4_com;
			
			document.getElementById("OR5-success-outlined").checked = record.or5==1;
			document.getElementById("OR5-danger-outlined").checked = record.or5==0;
			document.getElementById("OR5-secondary-outlined").checked = record.or5==-1;
			document.getElementById("OR5-comment-content").value = record.or5_com;
			
			document.getElementById("SEQ1-success-outlined").checked = record.seq1==1;
			document.getElementById("SEQ1-danger-outlined").checked = record.seq1==0;
			document.getElementById("SEQ1-secondary-outlined").checked = record.seq1==-1;
			document.getElementById("SEQ1-comment-content").value = record.seq1_com;
			
			document.getElementById("SEQ2-success-outlined").checked = record.seq2==1;
			document.getElementById("SEQ2-danger-outlined").checked = record.seq2==0;
			document.getElementById("SEQ2-secondary-outlined").checked = record.seq2==-1;
			document.getElementById("SEQ2-comment-content").value = record.seq2_com;
			
			document.getElementById("SEQ3-success-outlined").checked = record.seq3==1;
			document.getElementById("SEQ3-danger-outlined").checked = record.seq3==0;
			document.getElementById("SEQ3-secondary-outlined").checked = record.seq3==-1;
			document.getElementById("SEQ3-comment-content").value = record.seq3_com;
			
			document.getElementById("TU1-success-outlined").checked = record.tu1==1;
			document.getElementById("TU1-danger-outlined").checked = record.tu1==0;
			document.getElementById("TU1-secondary-outlined").checked = record.tu1==-1;
			document.getElementById("TU1-comment-content").value = record.tu1_com;
			
			document.getElementById("TU2-success-outlined").checked = record.tu2==1;
			document.getElementById("TU2-danger-outlined").checked = record.tu2==0;
			document.getElementById("TU2-secondary-outlined").checked = record.tu2==-1;
			document.getElementById("TU2-comment-content").value = record.tu2_com;
			
			document.getElementById("TU3-success-outlined").checked = record.tu3==1;
			document.getElementById("TU3-danger-outlined").checked = record.tu3==0;
			document.getElementById("TU3-secondary-outlined").checked = record.tu3==-1;
			document.getElementById("TU3-comment-content").value = record.tu3_com;
			
			document.getElementById("TU4-success-outlined").checked = record.tu4==1;
			document.getElementById("TU4-danger-outlined").checked = record.tu4==0;
			document.getElementById("TU4-secondary-outlined").checked = record.tu4==-1;
			document.getElementById("TU4-comment-content").value = record.tu4_com;
			
			document.getElementById("CLO1-success-outlined").checked = record.clo1==1;
			document.getElementById("CLO1-danger-outlined").checked = record.clo1==0;
			document.getElementById("CLO1-secondary-outlined").checked = record.clo1==-1;
			document.getElementById("CLO1-comment-content").value = record.clo1_com;
			
			document.getElementById("CLO2-success-outlined").checked = record.clo2==1;
			document.getElementById("CLO2-danger-outlined").checked = record.clo2==0;
			document.getElementById("CLO2-secondary-outlined").checked = record.clo2==-1;
			document.getElementById("CLO2-comment-content").value = record.clo2_com;
			
			document.getElementById("CLO3-success-outlined").checked = record.clo3==1;
			document.getElementById("CLO3-danger-outlined").checked = record.clo3==0;
			document.getElementById("CLO3-secondary-outlined").checked = record.clo3==-1;
			document.getElementById("CLO3-comment-content").value = record.clo3_com;
			
			document.getElementById("CLO4-success-outlined").checked = record.clo4==1;
			document.getElementById("CLO4-danger-outlined").checked = record.clo4==0;
			document.getElementById("CLO4-secondary-outlined").checked = record.clo4==-1;
			document.getElementById("CLO4-comment-content").value = record.clo4_com;
			
			document.getElementById("CLO5-success-outlined").checked = record.clo5==1;
			document.getElementById("CLO5-danger-outlined").checked = record.clo5==0;
			document.getElementById("CLO5-secondary-outlined").checked = record.clo5==-1;
			
			if (record.clo5Why==-1){
				document.getElementById("CLO5-input").value = "";
				document.getElementById("CLO5-input").setAttribute('disabled', true);
			} else{
				document.getElementById("CLO5-input").value = record.clo5Why;
				document.getElementById("CLO5-input").removeAttribute('disabled');
			}
			document.getElementById("CLO5WHY-secondary-outlined").checked = record.clo5Why==-1;
			document.getElementById("CLO5-comment-content").value = record.clo5_com;
			
			if (record.age1==-1){
				document.getElementById("AGE1-input").value = "";
				document.getElementById("AGE1-input").setAttribute('disabled', true);
			} else {
				document.getElementById("AGE1-input").value = record.age1;
				document.getElementById("AGE1-input").removeAttribute('disabled');
			}
			document.getElementById("AGE1-secondary-outlined").checked = record.age1==-1;
			document.getElementById("AGE1-comment-content").value = record.age1_com;
			
			if (record.age2==-1){
				document.getElementById("AGE2-input").value = "";
				document.getElementById("AGE2-input").setAttribute('disabled', true);
			} else {
				document.getElementById("AGE2-input").value = record.age2;
				document.getElementById("AGE2-input").removeAttribute('disabled');
			}
			document.getElementById("AGE2-secondary-outlined").checked = record.age2==-1;
			document.getElementById("AGE2-comment-content").value = record.age2_com;
			
			if (record.age3==-1){
				document.getElementById("AGE3-input").value = "";
				document.getElementById("AGE3-input").setAttribute('disabled', true);
			} else {
				document.getElementById("AGE3-input").value = record.age3;
				document.getElementById("AGE3-input").removeAttribute('disabled');
			}
			document.getElementById("AGE3-secondary-outlined").checked = record.age3==-1;
			document.getElementById("AGE3-comment-content").value = record.age3_com;
			
			document.getElementById("CYC2-success-outlined").checked = record.cyc2==1;
			document.getElementById("CYC2-danger-outlined").checked = record.cyc2==0;
			document.getElementById("CYC2-secondary-outlined").checked = record.cyc2==-1;
			document.getElementById("CYC2-comment-content").value = record.cyc2_com;
			
			if (record.cyc3==-1){
				document.getElementById("CYC3-input").value = "";
				document.getElementById("CYC3-input").setAttribute('disabled', true);
			} else {
				document.getElementById("CYC3-input").value = record.cyc3;
				document.getElementById("CYC3-input").removeAttribute('disabled');
			}
			document.getElementById("CYC3-secondary-outlined").checked = record.cyc3==-1;
			document.getElementById("CYC3-comment-content").value = record.cyc3_com;
			
			if (record.cyc4==-1){
				document.getElementById("CYC4-input").value = "";
				document.getElementById("CYC4-input").setAttribute('disabled', true);
			} else {
				document.getElementById("CYC4-input").value = record.cyc4;
				document.getElementById("CYC4-input").removeAttribute('disabled');
			}
			document.getElementById("CYC4-secondary-outlined").checked = record.cyc4==-1;
			document.getElementById("CYC4-comment-content").value = record.cyc4_com;
			
			dTimer.setClock(record.chrono*60000);
			
			document.getElementById("CUR-secondary-outlined").checked = record.cur==-1;
			if (record.cur != -1){
				document.getElementById("CUR-input_h").value = Math.floor(record.cur/60);
				document.getElementById("CUR-input_h").removeAttribute('disabled');
				document.getElementById("CUR-input_min").value = record.cur%60;
				document.getElementById("CUR-input_min").removeAttribute('disabled');
			} else {
				document.getElementById("CUR-input_h").value = "";
				document.getElementById("CUR-input_h").setAttribute('disabled', true);
				document.getElementById("CUR-input_min").value = "";
				document.getElementById("CUR-input_min").setAttribute('disabled', true);
			}
			document.getElementById("CUR-comment-content").value = record.cur_com;
			
			document.getElementById("commentaire").value = record.comment;
			
			dTimer.stop();
			
			// Revenir sur l'onglet passation
			document.getElementById("menu_passation").click();
			
			document.getElementById("saveUpdate").innerHTML = "Mettre à jour";
		};
	}
}