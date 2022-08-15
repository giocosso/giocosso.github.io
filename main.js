// working variables
let debugOn = false;
let listMainType = 'search'; //first page loaded

let searchFormValue = '';
let findIFormKeys = [];
let findCFormKeys = [];

// get ingredients sorted into groups
let ingredientsSorted = [];
let groupsSorted = [];

for (let i = 0; i < (Object.keys(ingredientsOrderObject).length); i++) {
	let grp = ingredientsOrderObject[i]; // grp is Group ID
	groupsSorted.push(grp);
	let temp = [];
	for (let x in ingredientObject) { //x is ingredient ID
		if (ingredientObject[x].groupID == grp) {
			if (Boolean(ingredientObject[x].preselect)) {
				findCFormKeys.push(x);
			}
			temp.push(x);
		}
	};
	temp.sort();
	ingredientsSorted = ingredientsSorted.concat(temp);
};

// check for ingredients which don't have valid group ID
let orderValues = Object.values(ingredientsOrderObject);
for (let x in ingredientObject) { //x is ingredient ID
	if (!orderValues.includes(ingredientObject[x].groupID)) {
		debugLog('ingredientObject', x, 'does not have a valid group ID');
	}
};

/*
Update HTML
===========*/

// Menu
document.getElementById('searchMenuItem').innerHTML = pageNameObject['search'].name;
document.getElementById('findCMenuItem').innerHTML = pageNameObject['findC'].name;
document.getElementById('findIMenuItem').innerHTML = pageNameObject['findI'].name;
//document.getElementById('infoMenuItem').innerHTML = pageNameObject['info'].name;

document.getElementById('searchPageInfo').innerHTML = pageNameObject['search'].info;
document.getElementById('findCPageInfo').innerHTML = pageNameObject['findC'].info;
document.getElementById('findIPageInfo').innerHTML = pageNameObject['findI'].info;
//document.getElementById('infoPageInfo').innerHTML = pageNameObject['info'].info;

// Populate Find Forms
function buildGroupItem(gid, garray, gpage) { // Ingredient Group ID, Ingredient ID Array, Page ID

	let grpName = ingredientGroupsObject[gid].name;
	let grpInfo = ingredientGroupsObject[gid].info;
	let titleId = '';
	let titleClass = 'title';

	if (grpInfo.length > 0) {
		grpInfo = ' <span class="subtitle">(' + grpInfo + ')</span>';
	}

	if (gpage == 'findI') {
		titleClass += ' w3-hide';
		titleId = ' id="' + gpage + gid + '"';
	} else if (gpage == 'findC') {
		// stuff to do
	}

	let h = '<p ' + titleId + ' class="' + titleClass + '">' + grpName + grpInfo + '</p>';
	h += '<dl>';

	garray.forEach(function (i) {
		let dtId = i;
		let dtClass = '';
		let dtEvent = '';

		if (gpage == 'findC') {
			if (findCFormKeys.includes(i)) {
				dtClass = 'selected';
			}
			dtEvent = 'onClick="findCFormUpdate(this);return false"';
		} else if (gpage == 'findI') {
			dtClass = 'w3-hide';
			dtId = gpage + dtId;
		}

		h += '<dt id="' + dtId + '" class="' + dtClass + '" ' + dtEvent + '>' + ingredientObject[i].name + '</dt>';
	});

	h += '</dl>';
	return h;
}

let findCFormHtml = '';
let findIFormHtml = '';
groupsSorted.forEach(function (g) { // g is groupID
	let ingrArray = [];
	let grpID = g;
	ingredientsSorted.forEach(function (i) { // i is ingredient ID
		let ingrID = i;
		let ingrGrpID = ingredientObject[ingrID].groupID;
		if (ingrGrpID == grpID) {
			ingrArray.push(ingrID);
		}
	});
	findCFormHtml += buildGroupItem(grpID, ingrArray, 'findC');
	findIFormHtml += buildGroupItem(grpID, ingrArray, 'findI');
});
document.getElementById('findCForm').innerHTML = findCFormHtml;
document.getElementById('findIForm').innerHTML = findIFormHtml;

//inputs
let searchInputObject = document.getElementById('searchFormInput');
searchInputObject.placeholder = 'search...';

/*
Event Listeners
===============*/

searchInputObject.addEventListener('keyup', function (event) {
	searchFormUpdate(event.target.value);
});
searchInputObject.addEventListener('search', function (event) {
	searchFormUpdate(event.target.value);
});

/*
functions
=========*/

function listMainTypeChange(t) {

	if (t) {
		listMainType = t;
	}

	let b = document.getElementById('pageContainer').classList;

	let pageIdArray = Object.keys(pageNameObject);
	pageIdArray.forEach(function (pid) {

		let a = document.getElementById(pid + 'Form').classList;
		let c = document.getElementById(pid + 'MenuItem').classList;
		let d = document.getElementById(pid + 'PageInfo').classList;

		if (listMainType == pid) {
			if (a.contains('w3-hide')) {
				a.remove('w3-hide')
			};
			if (!b.contains(pid)) {
				b.add(pid);
			}
			if (!c.contains('selected')) {
				c.add('selected');
			}
			if (d.contains('w3-hide')) {
				d.remove('w3-hide')
			};
		} else {
			if (!a.contains('w3-hide')) {
				a.add('w3-hide')
			}; // reset page forms
			if (b.contains(pid)) {
				b.remove(pid);
			} // reset page class
			if (c.contains('selected')) {
				c.remove('selected');
			} // reset menu
			if (!d.contains('w3-hide')) {
				d.add('w3-hide')
			}; // reset page Info box
		}
	});

	rUpdateList();
}

function searchFormUpdate(v) {
	searchFormValue = v.toLowerCase().trim();
	rUpdateList();
}

function findCFormUpdate(n) {
	if (findCFormKeys.includes(n.id)) {
		findCFormKeys = findCFormKeys.filter(function (v) {
			return v != n.id;
		});
		n.classList.remove('selected');
	} else {
		findCFormKeys.push(n.id);
		n.classList.add('selected');
	}
	rUpdateList();
}

function findIFormUpdate(n) {

	let d = document.getElementById(n + '-heading').classList;

	if (!findIFormKeys.includes(n)) {
		findIFormKeys.push(n);
		d.add('selected');
		debugLog('findIFormUpdate', n, 'Recipe added. Last item in list: ' + findIFormKeys[findIFormKeys.length - 1]);
	} else if (findIFormKeys.includes(n)) {
		findIFormKeys = findIFormKeys.filter(function (v) {
			return v != n;
		});
		d.remove('selected');
		debugLog('findIFormUpdate', n, 'Recipe removed. Last item in list: ' + findIFormKeys[findIFormKeys.length - 1]);
	}

	// hide all form elements at start
	let pNodes = document.getElementById('findIForm').getElementsByTagName('p');
	for (let i = 0; i < pNodes.length; i++) {
		let p = pNodes[i].classList;
		if (!p.contains('w3-hide')) {
			p.add('w3-hide');
		}
	}
	let dtNodes = document.getElementById('findIForm').getElementsByTagName('dt');
	for (let i = 0; i < dtNodes.length; i++) {
		dtNodes[i].className = 'w3-hide';
	}

	// Show items on Shopping List
	if (findIFormKeys.length > 0) {

		let noIDCount = [];
		let IDCount = [];

		findIFormKeys.forEach(function (r) { // loop through recipes

			let recpID = r;
			let ingredientKeyArray = recipeObject[recpID]['ingredients']; // get each ingredient list
			ingredientKeyArray.forEach(function (x) { // loop through recipe ingredients

				let ingrID = x.id;
				let ingrType = x.type;
				let ingrName = x.name;

				if (ingrID == '') { // no ingredient ID
					if (!noIDCount.includes(ingrName)) {
						noIDCount.push(ingrName);
					}

				} else {

					let grpID = ingredientObject[ingrID].groupID;
					let grpClassList = document.getElementById('findI' + grpID).classList;
					if (grpClassList.contains('w3-hide')) {
						grpClassList.remove('w3-hide');
					} // show group heading

					let ingrClassList = document.getElementById('findI' + ingrID).classList;
					if (!ingrClassList.contains('default')) { // check if already set as default
						if (ingrType == 'optional') { // is optional
							if (ingrClassList.contains('w3-hide')) { // nothing set
								ingrClassList.remove('w3-hide');
								ingrClassList.add('optional');
							}
						} else if (ingrType == 'garnish') { // is a garnish
							if (ingrClassList.contains('w3-hide')) { // nothing set
								ingrClassList.remove('w3-hide');
								ingrClassList.add('garnish');
							} else if (ingrClassList.contains('optional')) { // set as optional
								ingrClassList.remove('optional');
								ingrClassList.add('garnish');
							}
						} else { // is a default ingredient
							if (ingrClassList.contains('w3-hide')) { // nothing set
								ingrClassList.remove('w3-hide');
								ingrClassList.add('default');
							} else if (ingrClassList.contains('optional')) {
								ingrClassList.remove('optional');
								ingrClassList.add('default');
							} else if (ingrClassList.contains('garnish')) {
								ingrClassList.remove('garnish');
								ingrClassList.add('default');
							}
						};
					}
					if (!IDCount.includes(ingrID)) { // to get final count
						IDCount.push(ingrID)
					};

				}
			});
		});

		document.getElementById('findIPageInfo').innerHTML = '<a href="#findIForm"><span>' + (IDCount.length) + '</span> ingredients are on your shopping list</a>';

	} else {

		document.getElementById('findIPageInfo').innerHTML = pageNameObject['findI'].info;

	}
}

function toggleRecipeContent(t) {
	var a = document.getElementById(t + '-content').classList;
	a.toggle('w3-hide');
	var b = document.getElementById(t + '-heading').classList;
	b.toggle('open');
};

function debugLog(dParent, dChild, dDetails) {
	if (debugOn) {
		console.log('[' + dParent + '] ' + dChild.replace(/&nbsp;/g, ' ') + ' > ' + dDetails);
	}
}

function rUpdateList() {
	let findIFormList = [];
	let findIFormListOptional = [];

	let recipeCount = 0;
	let showCount = false;

	rIdArray = Object.keys(recipeObject);
	rIdArray.sort();

	let listMainHtml = ''; //

	rIdArray.forEach(function (recipeKey) {

		let showRecipe;

		//<---- Recipe Values
		let pageValue = recipeObject[recipeKey].page;
		let nameValue = recipeObject[recipeKey].name;
		let methodArray = Object.values(recipeObject[recipeKey].method);
		let bartoolsArray = Object.values(recipeObject[recipeKey].bartools);
		let bartoolsDisplay = '';
		if (bartoolsArray.length > 0) {
			bartoolsDisplay = bartoolsArray.map(function (v) {
				return bartoolsObject[v].name;
			});
		}
		let ingredientIdArray = Object.values(recipeObject[recipeKey].ingredients);
		let glasswareArray = Object.values(recipeObject[recipeKey].glassware);
		if (glasswareArray.length > 0) {
			glasswareDisplay = glasswareArray.map(function (v) {
				if (v) {
					return glasswareObject[v].name;
				}
			});
		}
		let glasswareClass = glasswareArray.toString();
		//----->

		//<---- dynamic HTML snippets
		let headingClass = '';
		let headingName = nameValue;
		if (pageValue) {
			headingName += '<span class="recipePage">p' + pageValue + '</span>';
		}
		let contentClass = glasswareClass.replace(/,/g, ' ');
		let optionalText = ' (optional)';
		let unassignedIDText = ' (Not Linked to Database)';

		let findICheckbox = '';
		//----->

		//<---- Ingredient Values
		let ingredientDefault = [];
		let ingredientGarnish = [];
		let ingredientSearch = [];
		let ingredientFindC = [];
		let unassignedIngredientID = [];

		console.log(ingredientsSorted.length);
		ingredientsSorted.forEach(function (ingrSID) { // This is needed to sort the ingredients by group
			ingredientIdArray.forEach(function (ingrObj) { // ingredient object from recipe
				if (ingrSID == ingrObj.id) {
					let rIngrID = ingrObj.id;
					let rIngrName = ingrObj.name;
					let rIngrType = ingrObj.type;
					let rIngrQty = ingrObj.quantity;

					let displayName = (rIngrQty + ' ' + rIngrName).trim().replace(/ /g, '&nbsp;');

					switch (rIngrType) {
					case 'optional':
						displayName += optionalText;
						ingredientDefault.push(displayName);
						break;

					case 'garnish':
						ingredientGarnish.push(displayName);
						break;

					default:
						ingredientFindC.push(rIngrID)
						ingredientDefault.push(displayName);
					}

					ingredientSearch.push(rIngrName.toLowerCase());
				}
			});
		});
		// check for ingredients which don't have ID
		ingredientIdArray.forEach(function (ingrObj) {
			if (!ingredientsSorted.includes(ingrObj.id)) {
				displayName = (ingrObj.quantity + ' ' + ingrObj.name + unassignedIDText).trim().replace(/ /g, '&nbsp;');
				ingredientDefault.push(displayName);
				debugLog(nameValue, ingrObj.name, 'does not have a valid ingredient ID');
			}
		});
		//----->

		switch (listMainType) {
		case 'search':
			showRecipe = false;
			if (searchFormValue) {
				showCount = true;
				headingClass += ' selected';
				let x = nameValue.toLowerCase();
				if (Boolean(x.match(searchFormValue))) {
					showRecipe = true;
					//debugLog(nameValue, x, 'recipe name matches search: '+searchFormValue);
				}
				if (!Boolean(showRecipe)) {
					ingredientSearch.forEach(function (v) {
						if (!Boolean(showRecipe)) {
							if (v.match(searchFormValue) && !v.match(optionalText)) {
								showRecipe = true;
								//debugLog(nameValue, v, 'ingredient name matches search: '+searchFormValue);
							}
						}
					});
				}
			} else {
				showRecipe = true;
				showCount = false;
			}
			break;

		case 'findC':
			showRecipe = true;
			showCount = true;
			ingredientFindC.forEach(function (v) {
				if (Boolean(showRecipe)) {
					if (!findCFormKeys.includes(v)) {
						showRecipe = false;
						//debugLog(nameValue, v, 'ingredient not selected in form: '+findCFormKeys);
					}
				}
			});
			headingClass += ' selected';
			break;

		case 'findI':
			showRecipe = true;
			showCount = false;
			if (findIFormKeys.includes(recipeKey)) {
				headingClass += ' selected';
			}
			findICheckbox += '<div class="findICheckbox" onClick="findIFormUpdate(\'' + recipeKey + '\')"></div>';
			break;
		}

		if (Boolean(showRecipe)) {

			recipeCount += 1;

			// recipe heading
			listMainHtml += '<header id="' + recipeKey + '-heading" class="w3-bar w3-display-container' + headingClass + '">';
			listMainHtml += '<a href="javascript:void(0)" class="w3-bar-item w3-button" onclick="toggleRecipeContent(\'' + recipeKey + '\');">' + headingName + '</a>' + findICheckbox;
			listMainHtml += '</header>';

			// recipe content
			listMainHtml += '<section class="light w3-cell-row w3-hide ' + contentClass + '" id="' + recipeKey + '-content">';

			// ingredients
			listMainHtml += '<div class="shade w3-cell w3-mobile w3-container">';
			listMainHtml += '<p class="title">Ingredients</p>';
			listMainHtml += '<ul>';
			listMainHtml += '<li>';
			listMainHtml += ingredientDefault.join('</li><li>');
			listMainHtml += '</li>';
			listMainHtml += '</ul>';

			if (ingredientGarnish.length > 0) {
				listMainHtml += '<div class="garnish">';
				listMainHtml += ingredientGarnish.join(', ');
				listMainHtml += '</div>';
			}

			if (glasswareDisplay.length > 0) {
				listMainHtml += '<div class="glassware">' + glasswareDisplay.join(', ') + '</div>';
			}

			if (bartoolsDisplay.length > 0) {
				listMainHtml += '<div class="bartools">' + bartoolsDisplay.join(', ') + '</div>';
			}

			listMainHtml += '</div>';

			// instructions
			listMainHtml += '<div class="w3-cell w3-mobile w3-container">';
			listMainHtml += '<p class="title">Method</p>';

			listMainHtml += '<ol>';
			methodArray.forEach(function (v) {
				listMainHtml += '<li>' + v + '</li>';
			});
			listMainHtml += '</ol>';

			listMainHtml += '</div>';
			listMainHtml += '</section>';

		}
	});

	let infoHtml = pageNameObject[listMainType].info;

	switch (listMainType) {
	case 'search':

		if (Boolean(showCount)) {

			if (recipeCount > 0) {
				infoHtml = '<span>' + recipeCount + '</span>';
			} else {
				infoHtml = 'No';
			}
			infoHtml += ' cocktail';
			if (recipeCount != 1) {
				infoHtml += 's';
			}
			infoHtml += ' found';

		}
		break;

	case 'findC':

		if (Boolean(showCount)) {

			if (recipeCount > 0) {
				infoHtml = '<a href="#listMain"><span>' + recipeCount + '</span> cocktail';
				if (recipeCount > 1) {
					infoHtml += 's';
				}
				infoHtml += ' found</a>';
			}
		}
		break;

	case 'findI':
		infoHtml = document.getElementById('findIPageInfo').innerHTML;
		break;
	}

	document.getElementById('listMain').innerHTML = listMainHtml;
	document.getElementById(listMainType + 'PageInfo').innerHTML = infoHtml;

}

// loads the first page
listMainTypeChange(listMainType);
