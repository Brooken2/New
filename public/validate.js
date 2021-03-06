function login() {
	var username = $("#username").val();
	var password = $("#password").val();

	//console.log('We made it to the login() fucntion');
	//console.log(username);
	//console.log(password);
	
	var params = {
		username: username,
		password: password,
	};

	$.post("/login", params, function(result) {
		if (result && result.success) {
			//console.log('made it here');
			redir();
		} else {
			$("#status").text("Error logging in.");
		}
	});
}

function createUser(){

	var username = $("#username1").val();
	var password = $("#password1").val();
	var displayName = $("#displayName").val();
	
	var params = {
		username: username,
		password: password,
		displayName: displayName
	};

	$.post("/createUser", params, function(result) {
		if (result && result.success) {
			redir();
		} else {
			$("#status").text("Error Creating User in.");
		}
	});
}

function addGoals(){
	console.log("Is this doing something");
	var goal = $("#goal").val();
	var endDate = $("#endDate").val();
	var description = $("#description").val();
	
	//console.log(goal, endDate, description);
	
	var params = {
		goal: goal,
		endDate: endDate,
		description: description
	};
	
	$.post("/addnewGoals", params, function(result){
		console.log("i am not sure where we go wrong");
		if (result && result.success) {
			
			redir();
			/*var xmlhttp = new XMLHttpRequest();

			xmlhttp.onreadystatechange = function() {
				if (xmlhttp.readyState == XMLHttpRequest.DONE) {
					if (xmlhttp.status == 200){ 
					console.log("We are here in the REDIR");
					console.log(this.responseText);
					updatePage(this.responseText);
					}
					else if (xmlhttp.status == 400) {
						alert('There was an error 400');
					}
					else {
					alert('something else other than 200 was returned, Taylor says not 400 either, probs like 342');
					}
				}
			}
			xmlhttp.open("GET", "/getUser", true);
			xmlhttp.send();	*/
		} else {
			$("#status").text("Error Creating new Goal in.");
		}
	});
}

function redir2(){
		console.log("this is a new idea");
}



function redir(){
	var xmlhttp = new XMLHttpRequest();

	xmlhttp.onreadystatechange = function() {
		if (xmlhttp.readyState == XMLHttpRequest.DONE) {
			if (xmlhttp.status == 200){ 
				console.log("We are here in the REDIR");
				console.log(this.responseText);
				updatePage(this.responseText);
			}
			else if (xmlhttp.status == 400) {
				alert('There was an error 400');
			}
			else {
				alert('something else other than 200 was returned, Taylor says not 400 either, probs like 342');
			}
		}
	}
	xmlhttp.open("GET", "/getUser", true);
	xmlhttp.send();	
}

function updatePage(results){
	//console.log(results);
	
	var json = JSON.parse(results);
	var listJson = JSON.parse(json);
	
	console.log(listJson);
	var out = "";
	var content ="";
	var i;
	out += "<div class='container'><h2> Your Goal List</h2>";
	content += "<div class='list-group'>";
	for(i = 0; i < listJson.length; i++){
		content +=  "<a href='#' class='list-group-item'><h4 class='list-group-item-heading'>" + listJson[i].goalname + "</h4><p class='list-group-item-text'>" + listJson[i].description + "</p><small class='text-muted'>"+ listJson[i].enddate + "</small></a>";
	}
	content += "</div></div>"
	document.getElementById("div1").innerHTML = out;
	document.getElementById("addingNew").innerHTML = content;
	
	var addGoal = 
		"<div class='container'><h2>Add A New Goal</h2>"
		+ "<fieldset>" 
		+ "<label for=endDate>End Date:</label>"
        + "<input type='date' class='form-control' id='endDate' name='endDate' placeholder='Select an end date for your goal'/>"
		+ "<label for='goal'>Goal Name:</label>"
        + '<input type="text" class="form-control" id="goal" name="goal" placeholder="Enter your goals name" >'
		+ "<label for='description'>Description:</label>"
        + "<textarea id='description' class='form-control' id ='description' name='description' placeholder='What did you want to accomplish?'>"
		+ "</textarea></fieldset></div>";
	
	document.getElementById("addingNewGoals").innerHTML = addGoal;
	
}

function logout() {
	$.post("/logout", function(result) {
		if (result && result.success) {
			$("#status").text("Successfully logged out.");
			
		} else {
			$("#status").text("Error logging out.");
		}
	});
}