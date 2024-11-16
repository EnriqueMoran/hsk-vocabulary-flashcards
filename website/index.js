const url = 'ws://127.0.0.1:3000';    // add your own url
const connection = new WebSocket(url);


var hskLevel = -1;            // hsk level character list to display
var availableTags = [];       // avaliable tags
var character = true;         // character view is active
var charInfo  = {
				 "character": "",
				 "pinyin": "",
				 "meaning": "",
				 "level": "",
				 "tags": "",
				 "other": "",
				 "type": ""
			    };



function start() {    // Initialize website and show all characters
	connection.send('find - type:character');
	fetchAvailableTags(); 
}


function fetchAvailableTags() {
    connection.send('findTags');  // Send a query to fetch all unique tags
}


function showContent() {    // Adjust items size
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

function adjustCharacterSize(size) {
	const items = document.querySelectorAll('.item');
	items.forEach(item => {
	  item.style.fontSize = `${size}px`;
	});
  }

function replaceHyphenWithSpace(event) {
    // Replace all occurrences of '-' with a space
    event.target.value = event.target.value.replace(/-/g, ' ');
}

function attachHyphenReplacement() {
    const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea'); // Select all text and number inputs
    inputs.forEach(input => {
        input.addEventListener('input', replaceHyphenWithSpace); // Add input event listener
    });
}

document.addEventListener('DOMContentLoaded', attachHyphenReplacement);

function changeContent(content) {    // Switch between showing characters and grammar
	character = content;
	document.getElementById("hanzi-list").innerHTML = "";    // Remove other hsk level characters

	query = 'find -';
	title = "HSK " + hskLevel + " Vocabulary list";

	if(hskLevel == 0) {
		title = "Extra Vocabulary list";
		query = query + ' level:' + hskLevel;
	} else if (hskLevel == -1){
		title = "HSK Vocabulary list";
		query = 'find -';
	}
	if (!character)
	{	
		title = "HSK Grammar list";
		if(hskLevel == 0) {
			title = "Extra Grammar list";
		} else if (hskLevel != -1){
			title = "HSK " + hskLevel + " Grammar list";
		}
	}
	document.getElementById("title").innerHTML = title;
	connection.send(query);
	
	showContent();
}


function setHskLevel(level) {
	document.getElementById("hanzi-list").innerHTML = "";    // Remove other hsk level characters
	hskLevel  = level;
	var title = "HSK Vocabulary list";
	query = 'find - type:character';

	if(hskLevel == 0) {
		title = "Extra Vocabulary list";
		query = query + ' level:' + hskLevel;
	} else if (hskLevel != -1){
		title = "HSK " + hskLevel + " Vocabulary list";
		query = query + ' level:' + hskLevel;
	}
	if (!character)
	{	
		title = "HSK Grammar list";
		if(hskLevel == 0) {
			title = "Extra Grammar list";
			query = 'find - type:grammar level:' + hskLevel;
		} else if (hskLevel != -1){
			title = "HSK " + hskLevel + " Grammar list";
			query = 'find - type:grammar level:' + hskLevel;
		}
		else {
			query = 'find - type:grammar';
		}
	}
	document.getElementById("title").innerHTML = title;
	connection.send(query);
}


function showInfo(event) {    // Show character data on mouse hovering
	var element = document.getElementById('info');

	element.style.position = "absolute";
	element.style.left     = event.target.getBoundingClientRect().x +'px';
	element.style.top      = (event.target.getBoundingClientRect().y + 70) +'px';
	element.classList.toggle("show");
}


function hideInfo() {
	document.getElementById("info").classList.remove("show");
}


connection.onopen = () => {
	console.log("Connection established");
	start();
}


connection.onerror = error => {
	console.log("Websocket error: " + error.data)
}


connection.onmessage = e => {
	var object = JSON.parse(e.data)
	if (object.type === 'tags') {
        availableTags = object.tags;  // Save tags list from response
        updateTagFilter();            // Update the tag filter dropdown
		updateTagsDropdown('tagsDropdown', 'tagsInput');
        updateTagsDropdown('tagsEditDropdown', 'tagsEdit');
    } else {
        showData(object);
    }
}


function sortResultsById(hanziList) {
    hanziList.sort(function(a, b) {
		const aId = a._id.$oid || (a._id && a._id.toString()) || '';
        const bId = b._id.$oid || (b._id && b._id.toString()) || '';
        return aId.localeCompare(bId);
    });
    return hanziList;
}


function showData(hanziList) {
    var ul = document.getElementById("hanzi-list");
    hanziList = sortResultsById(hanziList);

    ul.innerHTML = "";

    hanziList.forEach(function (hanzi) {
        var li = document.createElement("li");
        li.setAttribute("class", "item");

        li.setAttribute("data-character", hanzi.character);
        li.setAttribute("data-pinyin", hanzi.pinyin);
		li.setAttribute("data-level", hanzi.level);
        li.setAttribute("data-meaning", hanzi.meaning);
        li.setAttribute("data-tags", hanzi.tags ? hanzi.tags : "");
        li.setAttribute("data-other", hanzi.other);
        li.setAttribute("data-type", hanzi.type);


		li.ondblclick = function(event) {
			handleDoubleClick(event, hanzi);
		}
		

		if (character && hanzi.type == "character")
		{
			li.onmouseover = function(event) {
				var scrollTop = window.pageYOffset || 0;
				var element   = document.getElementById('info');
	
				element.style.position = "absolute";		
				element.style.left     = (event.target.getBoundingClientRect().x + 10) +'px';
				element.style.top      = (event.target.getBoundingClientRect().y + 60 + scrollTop) +'px';
				element.innerHTML      = '<div class="pinyin">' + hanzi.pinyin + '</div><br>' + '<div class="meaning">' + hanzi.meaning + '</div>';
				element.classList.toggle("show");
			};
	
			li.oncontextmenu = function(event) {    // Get character data
				event.preventDefault();
				var scrollTop = window.pageYOffset || 0;
				var menu      = document.getElementById("menu");
	
				menu.style.display = "block";
				menu.style.left    = event.x + 'px';
				menu.style.top     = event.y + scrollTop + 'px';
	
				charInfo["character"] = hanzi.character;
				charInfo["pinyin"]    = hanzi.pinyin;
				charInfo["meaning"]   = hanzi.meaning;
				charInfo["level"]     = hanzi.level;
	
				if(hanzi.other != null) {
					charInfo["other"] = hanzi.other;
				} else {
					charInfo["other"] = "";
				}	
				if(hanzi.tags != null) {
                    charInfo["tags"] = hanzi.tags;
					if (Array.isArray(hanzi.tags)) {
						hanzi.tags.forEach(function(tag) {
							if (!availableTags.includes(tag)) {
								availableTags.push(tag);
							}
						});
					}
					
                }
				else {
					charInfo["tags"] = "";
				}
			};
			li.onmouseleave = hideInfo;
			li.appendChild(document.createTextNode(hanzi.character));
			ul.appendChild(li);
		}
		else if (!character && hanzi.type == "grammar")
		{
	
			li.oncontextmenu = function(event) {    // Get character data
				event.preventDefault();
				var scrollTop = window.pageYOffset || 0;
				var menu      = document.getElementById("menu-grammar");
	
				menu.style.display = "block";
				menu.style.left    = event.x + 'px';
				menu.style.top     = event.y + scrollTop + 'px';
	
				charInfo["character"] = hanzi.character;
				charInfo["level"]     = hanzi.level;

				if(hanzi.other != null) {
					charInfo["other"] = hanzi.other;
				} else {
					charInfo["other"] = "";
				}	
			};
			li.onmouseleave = hideInfo;
			li.appendChild(document.createTextNode(hanzi.character));
			ul.appendChild(li);
		}
	});	
	showContent();
}

function updateTagFilter() {
    var tagSelect = document.getElementById("tagFilter");
    tagSelect.innerHTML = '<option value="All">All</option>';

    availableTags.forEach(function(tag) {
        var option = document.createElement("option");
        option.value = tag;
        option.textContent = tag;
        tagSelect.appendChild(option);
    });
}

function filterByTag() {
    var selectedTag = document.getElementById("tagFilter").value;
    var ul = document.getElementById("hanzi-list");
    ul.innerHTML = "";

    if (selectedTag === "All") {
        connection.send('find - type:character');
    } else {
        if (selectedTag.includes(' ')) {
            selectedTag = `"${selectedTag}"`;
        }
        connection.send(`find - tags:${selectedTag}`);
    }
}


function handleDoubleClick(event, hanzi) {
	playCharacterSound(hanzi.character);
	//playCharacterLocal(hanzi.character);
}

function playCharacterSound(character) {
	var audioURL = `https://data.dong-chinese.com/hsk-audio/${character}.mp3`;
	var audio = new Audio(audioURL);
	audio.play().catch(function(error) {
		console.log(`Couldnt play audio for: ${audioURL}`);
	})
}

function playCharacterLocal(character) {
	var encodedCharacter = encodeURIComponent(character);
	var audioURL = `audio/$cmn-${encodedCharacter}.mp3`;
	var audio = new Audio(audioURL);
	audio.play().catch(function(error) {
		console.log(`Couldnt play audio for: ${audioURL}`);
	})
}


function showAddChar() {
	document.getElementById("addCharBox").style.visibility = "visible";
}


function showAddGrammar() {
	document.getElementById("addGrammarBox").style.visibility = "visible";
}


function hideAddChar() {    // Hide and reset input fields
	document.getElementById("addCharBox").style.visibility = "hidden";
	document.getElementById("characterInput").value        = "";
	document.getElementById("pinyinInput").value           = "";
	document.getElementById("meaningInput").value          = "";
	document.getElementById("tagsInput").value            = "";
	document.getElementById("levelInput").value            = "";
	document.getElementById("otherInput").value            = "";
}


function hideAddGrammar() {    // Hide and reset input fields
	document.getElementById("addGrammarBox").style.visibility = "hidden";
	document.getElementById("characterInputGrammar").value    = "";
	document.getElementById("levelInputGrammar").value        = "";
	document.getElementById("otherInputGrammar").value        = "";
}


function showEditChar() {    // Fill input fields with character data
	var scrollTop = window.pageYOffset || 0;
	document.getElementById("editCharBox").style.top        = 50 + scrollTop + 'px';
	document.getElementById("editCharBox").style.visibility = "visible";
	document.getElementById("characterEdit").value          = charInfo.character;
	document.getElementById("pinyinEdit").value             = charInfo.pinyin;
	document.getElementById("meaningEdit").value            = charInfo.meaning;
	document.getElementById("levelEdit").value              = charInfo.level;
	document.getElementById("tagsEdit").value               = charInfo.tags;
	document.getElementById("otherEdit").value              = charInfo.other;
}


function showEditGrammar() {    // Fill input fields with grammar data
	console.log(charInfo);
	var scrollTop = window.pageYOffset || 0;
	document.getElementById("editGrammarBox").style.top        = 50 + scrollTop + 'px';
	document.getElementById("editGrammarBox").style.visibility = "visible";
	document.getElementById("titleEdit").value                 = charInfo.character;
	document.getElementById("levelEditGrammar").value          = charInfo.level;
	document.getElementById("otherEditGrammar").value          = charInfo.other;
}


function hideEditChar() {    // Hide input fields
	document.getElementById("editCharBox").style.visibility = "hidden";
}


function hideEditGrammar() {    // Hide input fields
	document.getElementById("editGrammarBox").style.visibility = "hidden";
}


function addChar() {
	var char = {
		character: document.getElementById("characterInput").value.trim(),
		pinyin: document.getElementById("pinyinInput").value.trim(),
		meaning: document.getElementById("meaningInput").value.trim(),
		level: document.getElementById("levelInput").value.trim(),
		tags: document.getElementById("tagsInput").value.trim().split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
		other: document.getElementById("otherInput").value.trim(),
		type: "character"
	};

	if(char.character == "" || char.pinyin == "" | char.meaning == "" | char.level == "") {
		alert("Character, pinyin and meaning field required!");
	} else {
		char.tags.forEach(tag => {
            if (!availableTags.includes(tag)) {
                availableTags.push(tag);
            }
        });

        updateTagsDatalist();

		connection.send("insertOne - " + JSON.stringify(char));
		changeContent(true);
		hideAddChar();
	}
}


function addGrammar() {
	var char = {
		character: document.getElementById("characterInputGrammar").value.trim(),
		level: document.getElementById("levelInputGrammar").value.trim(),
		other: document.getElementById("otherInputGrammar").value.trim(),
		type: "grammar"
	};

	if(char.character == "" || char.level == "") {
		alert("Title and level field required!");
	} else {
		connection.send("insertOne - " + JSON.stringify(char));
		changeContent(false);
	}
	hideAddGrammar();
}


function deleteChar() {    // Remove character from database
	var r = confirm("Remove character " + charInfo.character + "?");
	if(r){
		var char = {
			character: charInfo.character,
			pinyin: charInfo.pinyin,
			meaning: charInfo.meaning,
		};
		connection.send("deleteOne - " + JSON.stringify(char));
		changeContent(character);
	}
}

function deleteGrammar() {    // Remove grammar from database
	var r = confirm("Remove character " + charInfo.character + "?");
	if(r){
		var char = {
			character: charInfo.character,
			level: charInfo.level,
			other: charInfo.other,
		};
		connection.send("deleteOne - " + JSON.stringify(char));
		changeContent(character);
	}
}

function editChar() {
	var char = {
		character: charInfo.character,
		pinyin: charInfo.pinyin,
		meaning: charInfo.meaning,
		level: charInfo.level,
		tags: charInfo.tags,
		other: charInfo.other
	};
	var newValues = {
		character: document.getElementById("characterEdit").value.trim(),
		pinyin: document.getElementById("pinyinEdit").value.trim(),
		meaning: document.getElementById("meaningEdit").value.trim(),
		level: document.getElementById("levelEdit").value.trim(),
		tags: document.getElementById("tagsEdit").value.trim().split(',').map(tag => tag.trim()).filter(tag => tag !== ''),
		other: document.getElementById("otherEdit").value.trim(),
		type: "character"
	};
	if(newValues.character == "" || newValues.pinyin == "" | newValues.meaning == "" | newValues.level == "") {
		alert("Character, pinyin and meaning field required!");
	} else {
		newValues.tags.forEach(tag => {
            if (!availableTags.includes(tag)) {
                availableTags.push(tag);
            }
        });

        updateTagsDatalist();

		connection.send("updateOne - " + JSON.stringify(char) + " - " + JSON.stringify(newValues));
		hideEditChar();
		//changeContent(true);
	}
}

function updateTagsDatalist() {
    updateTagsDropdown('tagsDropdown', 'tagsInput');
    // Update for "Edit Character" modal
    updateTagsDropdown('tagsEditDropdown', 'tagsEdit');
}

function editGrammar() {
	var char = {
		character: charInfo.character,
		level: charInfo.level,
		other: charInfo.other,
		type: "grammar"
	};
	var newValues = {
		character: document.getElementById("titleEdit").value.trim(),
		level: document.getElementById("levelEditGrammar").value.trim(),
		other: document.getElementById("otherEditGrammar").value.trim()
	};
	if(newValues.character == "" || newValues.level == "") {
		alert("Character and level field required!");
	} else {
		connection.send("updateOne - " + JSON.stringify(char) + " - " + JSON.stringify(newValues));
		changeContent(false);
	}
	hideEditGrammar();
}


document.addEventListener("click", function(e) {    // Hide custom context menu
	document.getElementById("menu").style.display = "none";
	document.getElementById("menu-grammar").style.display = "none";
});


document.addEventListener('click', function (e) {
	if (!character)
	{
		document.getElementById("grammar-details-content").style.display = "block";
	}
	else
	{
		document.getElementById("grammar-details-content").style.display = "none";
	}

	if (e.target.classList.contains('item')) {

		var char =  e.target.getAttribute("data-character");
		var pinyin    =  e.target.getAttribute("data-pinyin");
		var meaning   =  e.target.getAttribute("data-meaning");
		var level     =  e.target.getAttribute("data-level");
		var tags      =  e.target.getAttribute("data-tags");
		var other     =  e.target.getAttribute("data-other");

		try {
			// Update detail information
			var numberOfCharacters = character.length;
		
			var detailTitleDiv = document.getElementById('detail-title');
		
			if (numberOfCharacters > 17)
			{
				detailTitleDiv.style.fontSize = '18px';
			}
			else if (numberOfCharacters > 14)
			{
				detailTitleDiv.style.fontSize = '22px';
			}
			else if (numberOfCharacters > 10)
			{
				detailTitleDiv.style.fontSize = '26px';
			}
			else if (numberOfCharacters > 7)
			{
				detailTitleDiv.style.fontSize = '30px';
			}
			else if (numberOfCharacters > 5)
			{
				detailTitleDiv.style.fontSize = '48px';
			}
			else{
				detailTitleDiv.style.fontSize = '56px';
			}

			if (!character)
			{
				var detailTitleDiv = document.getElementById('detail-title-grammar');
				detailTitleDiv.style.fontSize = '28px';
			}
		
			document.getElementById("detail-title").textContent = char;
			document.getElementById("detail-pinyin").textContent = pinyin;
			document.getElementById("detail-meaning").textContent = meaning;
			document.getElementById("detail-level").textContent = level;
			document.getElementById("detail-tags").textContent = tags;
			document.getElementById("detail-other").textContent = other;

			document.getElementById("detail-title-grammar").textContent = char;
			document.getElementById("detail-other-grammar").textContent = other;
		}
		catch{
	
		}
		const dropdowns = ['tagsDropdown', 'tagsEditDropdown'];
		dropdowns.forEach(dropdownId => {
			const dropdown = document.getElementById(dropdownId);
			const button = document.querySelector(`[id="${dropdownId}Button"]`);
			if (!dropdown.contains(e.target) && e.target !== button) {
				dropdown.style.display = 'none';
        }
    });

	}
});

document.body.addEventListener('click', function (e) {
	// Click outside
	if (!e.target.classList.contains('item')) {
	}
});

function updateTagsDropdown(dropdownId, inputId) {
    const dropdown = document.getElementById(dropdownId);
    const input = document.getElementById(inputId);
    dropdown.innerHTML = '';

    availableTags.forEach(tag => {
        const listItem = document.createElement('li');
        listItem.textContent = tag;

        listItem.addEventListener('click', () => {
            let currentTags = input.value.split(',').map(tag => tag.trim()).filter(tag => tag);

            if (!currentTags.includes(tag)) {
                currentTags.push(tag);
            }

            input.value = currentTags.join(', ') + ', ';
            dropdown.style.display = 'none';
        });

        dropdown.appendChild(listItem);
    });
}

function toggleDropdown(buttonId, dropdownId) {
    const dropdown = document.getElementById(dropdownId);
    dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
}

document.getElementById('tagsDropdownButton').addEventListener('click', () => {
    toggleDropdown('tagsDropdownButton', 'tagsDropdown');
    updateTagsDropdown('tagsDropdown', 'tagsInput');
});

document.getElementById('tagsEditDropdownButton').addEventListener('click', () => {
    toggleDropdown('tagsEditDropdownButton', 'tagsEditDropdown');
    updateTagsDropdown('tagsEditDropdown', 'tagsEdit');
});