const url = '';    // add your own url
const connection = new WebSocket(url);


var character = true;    // character view is active
var hskLevel;    // hsk level character list to display
var charInfo = {
				"character": "",    // character to edit
				"pinyin": "",
				"meaning": "",
				"example": "",
				"level": "",
				"notes": ""
			};


function start() {
	connection.send('find - ');    // show all characters
}

     
function showContent() {    // adjust items size
	var items = document.getElementsByClassName('item');
  	for(i = 0; i < items.length; i++) {
  		if(character){
  			items[i].style.fontSize = "36px";
  		}
    	else {
    		items[i].style.fontSize = "25px";
    	}
  	}
}


function changeContent(content) {    // change between showing characters and pinyin
	character = content;
	document.getElementById("hanzi-list").innerHTML = "";    // remove other hsk level characters
	connection.send('find - level:' + hskLevel);
	showContent();
}


function setHskLevel(level) {
	document.getElementById("hanzi-list").innerHTML = "";    // remove other hsk level characters
	hskLevel = level;
	if(level == 0){
		document.getElementById("title").innerHTML = "Extra Vocabulary list";
	} else {
		document.getElementById("title").innerHTML = "HSK " + level + " Vocabulary list";
		var query = 'level:' + level;
		connection.send('find - ' + query);
	}
}


function showInfo(event) {    // show character data (when mouse is over it)
	var element = document.getElementById('info');
	element.style.position = "absolute";
	element.classList.toggle("show");
	element.style.left = event.target.getBoundingClientRect().x +'px';
	element.style.top = (event.target.getBoundingClientRect().y + 70) +'px';
}


function removeInfo() {
	document.getElementById("info").classList.remove("show");
}


connection.onopen = () => {
	console.log("Connection established")
	start();
}


connection.onerror = error => {
	console.log("Websocket error: " + error)
}


connection.onmessage = e => {
	var object = JSON.parse(e.data)
  	if(character){
  		showHanzi(object);
  	}else{
  		showPinyin(object);
  	}
  	
}


function showHanzi(hanziList) {
	var ul = document.getElementById("hanzi-list");
	hanziList.forEach(function (hanzi){
		var li = document.createElement("li");
		li.setAttribute("class", "item");

		li.onmouseover = function(event) {
			var scrollTop = window.pageYOffset || 0;
			var element = document.getElementById('info');
			element.style.position = "absolute";
			element.classList.toggle("show");
			element.style.left = (event.target.getBoundingClientRect().x + 10) +'px';
			element.style.top = (event.target.getBoundingClientRect().y + 60 + scrollTop) +'px';
			element.innerHTML = '<div class="pinyin">' + hanzi.pinyin + '</div><br>' + hanzi.meaning + '<br>';

			if(hanzi.example != null && hanzi.example != "") {
				element.innerHTML += '<br><div class="example">' + hanzi.example + '</div>';
			}
			if(hanzi.notes != null && hanzi.notes != "") {
				element.innerHTML += '<br>' + hanzi.notes;
			}
		};

		li.oncontextmenu = function(event) {    // get character data
			event.preventDefault();
			var scrollTop = window.pageYOffset || 0;
			var menu = document.getElementById("menu");
			menu.style.display = "block";
			menu.style.left = event.x + 'px';
			menu.style.top = event.y + scrollTop + 'px';
			charInfo["character"] = hanzi.character;
			charInfo["pinyin"] = hanzi.pinyin;
			charInfo["meaning"] = hanzi.meaning;
			charInfo["level"] = hanzi.level;

			if(hanzi.example != null) {
				charInfo["example"] = hanzi.example;
			} else {
				charInfo["example"] = "";
			}
			if(hanzi.notes != null) {
				charInfo["notes"] = hanzi.notes;
			} else {
				charInfo["notes"] = "";
			}		
		};
		li.onmouseleave = removeInfo;
		li.appendChild(document.createTextNode(hanzi.character));
		ul.appendChild(li);
	});	
	showContent();
}


function showPinyin(hanziList) {
	var ul = document.getElementById("hanzi-list");
	hanziList.forEach(function (hanzi){
		var li = document.createElement("li");
		li.setAttribute("class", "item");

		li.onmouseover = function(event) {
			var scrollTop = window.pageYOffset || 0;
			var element = document.getElementById('info');
			element.style.position = "absolute";
			element.classList.toggle("show");
			element.style.left = (event.target.getBoundingClientRect().x + 10) + 'px';
			element.style.top = (event.target.getBoundingClientRect().y + 60 + scrollTop) + 'px';
			element.innerHTML = '<div class="example">' + hanzi.character + '</div><br>' + hanzi.meaning + '<br>';
			if(hanzi.example != null && hanzi.example != "") {
				element.innerHTML += '<br>' + hanzi.example + '<br>';
			}
			if(hanzi.notes != null && hanzi.notes != "") {
				element.innerHTML += '<br>' + hanzi.notes;
			}
		};

		li.oncontextmenu = function(event) {    // get character data
			event.preventDefault();
			var scrollTop = window.pageYOffset || 0;
			var menu = document.getElementById("menu");
			menu.style.display = "block";
			menu.style.left = event.x + 'px';
			menu.style.top = event.y + scrollTop + 'px';
			charInfo["character"] = hanzi.character;
			charInfo["pinyin"] = hanzi.pinyin;
			charInfo["meaning"] = hanzi.meaning;
			charInfo["level"] = hanzi.level;
			if(hanzi.example != null) {
				charInfo["example"] = hanzi.example;
			} else {
				charInfo["example"] = "";
			}
			if(hanzi.notes != null) {
				charInfo["notes"] = hanzi.notes;
			} else {
				charInfo["notes"] = "";
			}
		};
		li.onmouseleave = removeInfo;
		li.appendChild(document.createTextNode(hanzi.pinyin));
		ul.appendChild(li);
	});	
	showContent();
}


function showAddChar() {
	document.getElementById("addCharBox").style.visibility = "visible";
}


function hideAddChar() {    // hide and reset input fields
	document.getElementById("addCharBox").style.visibility = "hidden";
	document.getElementById("characterInput").value = "";
	document.getElementById("pinyinInput").value = "";
	document.getElementById("meaningInput").value = "";
	document.getElementById("levelInput").value = "";
	document.getElementById("exampleInput").value = "";
	document.getElementById("notesInput").value = "";
}


function showEditChar() {    // fill input fields with character data
	var scrollTop = window.pageYOffset || 0;
	document.getElementById("editCharBox").style.top = 50 + scrollTop + 'px';
	document.getElementById("editCharBox").style.visibility = "visible";
	document.getElementById("characterEdit").value = charInfo.character;
	document.getElementById("pinyinEdit").value = charInfo.pinyin;
	document.getElementById("meaningEdit").value = charInfo.meaning;
	document.getElementById("levelEdit").value = charInfo.level;
	document.getElementById("exampleEdit").value = charInfo.example;
	document.getElementById("notesEdit").value = charInfo.notes;
}


function hideEditChar() {    // hide input fields
	document.getElementById("editCharBox").style.visibility = "hidden";
}


function addChar() {
	var char = {
		character: document.getElementById("characterInput").value.trim(),
		pinyin: document.getElementById("pinyinInput").value.trim(),
		meaning: document.getElementById("meaningInput").value.trim(),
		level: document.getElementById("levelInput").value.trim(),
		example: document.getElementById("exampleInput").value.trim(),
		notes: document.getElementById("notesInput").value.trim()
	};

	if(char.character == "" || char.pinyin == "" | char.meaning == "" | char.level == "") {
		alert("Character, pinyin and meaning field required!");
	} else {
		connection.send("insertOne - " + JSON.stringify(char));
		location.reload();    // reload page
	}
}


function deleteChar() {    // remove character from database
	var r = confirm("Remove character " + charInfo.character + "?");
	if(r){
		var char = {
			character: charInfo.character,
			pinyin: charInfo.pinyin,
			meaning: charInfo.meaning,
		};
		connection.send("deleteOne - " + JSON.stringify(char));
		location.reload();    // reload page
	}
}


function editChar() {
	var char = {
		character: charInfo.character,
		pinyin: charInfo.pinyin,
		meaning: charInfo.meaning,
		level: charInfo.level,
		example: charInfo.example,
		notes: charInfo.notes
	};

	var newValues = {
		character: document.getElementById("characterEdit").value.trim(),
		pinyin: document.getElementById("pinyinEdit").value.trim(),
		meaning: document.getElementById("meaningEdit").value.trim(),
		level: document.getElementById("levelEdit").value.trim(),
		example: document.getElementById("exampleEdit").value.trim(),
		notes: document.getElementById("notesEdit").value.trim()
	};
	if(char.character == "" || char.pinyin == "" | char.meaning == "" | char.level == "") {
		alert("Character, pinyin and meaning field required!");
	} else {
		connection.send("updateOne - " + JSON.stringify(char) + " - " + JSON.stringify(newValues));
		location.reload();    // reload page
	}
}


document.addEventListener("click", function(e) {    // hide custom context menu
	document.getElementById("menu").style.display = "none";
});