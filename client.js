window.onload = function() {
    if (localStorage.getItem("token")) {
        displayView(document.getElementById("profileView"));
        // Open the default tab
        document.getElementById("defaultOpen").click();
    } else {
        displayView(document.getElementById("welcomeView"));
    }
};

    // the code required to display a view
function displayView(view) {
    document.getElementById('pageContent').innerHTML = view.innerHTML;
};

// password validation
function comparePasswords(password, passwordConfirmation) {
    if (password != passwordConfirmation) {
        return "Passwords don't match </br>";
    } else {
        return "";
    }
}

// openTab function to open tabs on click
function openTab(evt, section) {
    var i, tabContent, tablinks;
    tabContent = document.getElementsByClassName("tabContent");
    for (i = 0; i < tabContent.length; i++) {
        tabContent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(section).style.display = "block";
    evt.currentTarget.className += " active";
}

// feedback function
function feedback(text) {
    var feedback = document.getElementById('feedback');
    var message = document.getElementById('errorMessage');
    message.innerHTML = text;
    feedback.style.display = "block";
}

function closeFeedback() {
    var feedback = document.getElementById('feedback');
    var message = document.getElementById('errorMessage');
    message.innerHTML = "";
    feedback.style.display = "none";

}

//signup function
function signup(formInput) {
    var firstName = formInput.firstName.value;
    var familyName = formInput.familyName.value;
    var gender = formInput.gender.value;
    var city = formInput.city.value;
    var country = formInput.country.value;
    var email = formInput.email.value;
    var password = formInput.password.value;
    var passwordConfirmation = formInput.passwordConfirmation.value;
    //call function to compare passwords here
    var errorMessage = comparePasswords(password, passwordConfirmation);
    var newUser = {
        "email": email,
        "password": password,
        "firstname": firstName,
        "familyname": familyName,
        "gender": gender,
        "city": city,
        "country": country
    }
    if(errorMessage == ""){
      result = serverstub.signUp(newUser);
          if (result.success) {
              feedback("Signup successful");
          }
          else {
            feedback(result.message);
          }
      }
      else{
      feedback(errorMessage);
      }
    }
//signup function
function signin(formInput) {
    if (true) { //validation not done yet!
        var email = formInput.email.value;
        var password = formInput.password.value;
        var returndata = serverstub.signIn(email, password);
        var token = returndata.data;

        if (returndata.success) {
            localStorage.setItem("token", token);
            displayView(document.getElementById("profileView"));
            // Open the default tab
            document.getElementById("defaultOpen").click();
        } else {
            feedback(returndata.message);
        }
    } else {
        //feedback
    }
}

// logout functionality
function logout() {
    var returnObject = serverstub.signOut(localStorage.getItem("token"));
    localStorage.removeItem("token"); //signOut function doesn't remoave token. Otherwise on reload would be loggin back in
    localStorage.removeItem("email");
    displayView(document.getElementById("welcomeView"));
    feedback(returnObject.message);
}

//change Password
function changePassword(formInput) {
    var oldPassword = formInput.oldPassword.value;
    var newPassword = formInput.newPassword.value;
    var passwordConfirmation = formInput.passwordConfirmation.value;
    var token = localStorage.getItem("token");

    if (newPassword == passwordConfirmation) {
        var returnObject = serverstub.changePassword(token, oldPassword, newPassword);
        feedback(returnObject.message);
    } else {
        feedback("Password confirmation and new password are not the same");
    }
}

var browsedUser = ""; //save current user that was looking for in browser view

// a indicates which view is active and form data includes the message
function postMessage(section, formData) {
  var token = localStorage.getItem("token");
    if (section == 0) { //if on home view is active we get our own email
      var email = serverstub.getUserDataByToken(token).data.email;
      var message =formData.ownMessage.value;
    }
    else{
          var email = browsedUser;
          var message =formData.message.value;
    }
    returnObject = serverstub.postMessage(token, message, email);
    feedback(returnObject.message);
}

// is called by update button and on load of tab. a indicates which view is active
function updateWall(section) {
    i = section;
    var email = browsedUser;
    var token = localStorage.getItem("token");
    returnObject = serverstub.getUserMessagesByEmail(token, email);
    if (i == 0) { //if on home view is active returnObject is overwritten
        returnObject = serverstub.getUserMessagesByToken(token);
    }
    var posts = returnObject.data;
    var userWall = document.getElementsByClassName("messageWall")[i];
    userWall.innerHTML = "";
    for (var j = 0; j < posts.length; j++) { //creating HTML for messageWall
        userWall.innerHTML += "<div class='post'>" + posts[j].content + "</br>(" + posts[j].writer + ")</div></br>";
    }
}

function getUserData(section, formData) {
    i = section;
    var token = localStorage.getItem("token");
    if (section == 0) { //if home tab is active we get data only by token
        var returnObject = serverstub.getUserDataByToken(token);
    } else {
        var email = formData.email.value;
        browsedUser = email;
        var returnObject = serverstub.getUserDataByEmail(token, email);
    }
    if (returnObject.success) {
        userdata = returnObject.data;
        document.getElementsByClassName("profile")[i].style.display = "block";
        document.getElementsByClassName("displayFirstName")[i].innerHTML = userdata.firstname;
        document.getElementsByClassName("displayFamilyName")[i].innerHTML = userdata.familyname;
        document.getElementsByClassName("displayGender")[i].innerHTML = userdata.gender;
        document.getElementsByClassName("displayCity")[i].innerHTML = userdata.city;
        document.getElementsByClassName("displayCountry")[i].innerHTML = userdata.country;
        document.getElementsByClassName("displayEmail")[i].innerHTML = userdata.email;
        updateWall(i); //we also update the wall
    } else {
        feedback(returnObject.message);
        document.getElementsByClassName("profile")[i].style.display = "none"; //if user doesn't exist hide profileview
    }

}
