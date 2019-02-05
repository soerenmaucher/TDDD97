window.onload = function() {
    if (localStorage.getItem("token")) {
        displayView(document.getElementById("profileview"));
        // Open the default tab
        document.getElementById("defaultOpen").click();
    } else {
        displayView(document.getElementById("welcomeview"));
    }
};

    // the code required to display a view
function displayView(view) {
    document.getElementById('pagecontent').innerHTML = view.innerHTML;
};

// password validation
function comparepasswords(password, passwordconfirmation) {
    if (password != passwordconfirmation) {
        return "Passwords don't match </br>";
    } else {
        return "";
    }
}

// openTab function to open tabs on click
function openTab(evt, section) {
    var i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
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
    var message = document.getElementById('errormessage');
    message.innerHTML = text;
    feedback.style.display = "block";
}

function closefeedback() {
    var feedback = document.getElementById('feedback');
    var message = document.getElementById('errormessage');
    message.innerHTML = "";
    feedback.style.display = "none";

}

//signup function
function signup(forminput) {
    var firstname = forminput.first_name.value;
    var familyname = forminput.family_name.value;
    var gender = forminput.gender.value;
    var city = forminput.city.value;
    var country = forminput.country.value;
    var email = forminput.email.value;
    var password = forminput.password.value;
    var passwordconfirmation = forminput.passwordConfirmation.value;
    //call function to compare passwords here
    var error_message = comparepasswords(password, passwordconfirmation);
    var newUser = {
        "email": email,
        "password": password,
        "firstname": firstname,
        "familyname": familyname,
        "gender": gender,
        "city": city,
        "country": country
    }
    result = serverstub.signUp(newUser);
    if (result.success & error_message == "") {
        feedback("Signup successful");
    } else {
        if (!result.success) {
            error_message = error_message + result.message; //append both error messages
        }
        feedback(error_message);
    }

}
//signup function
function signin(forminput) {
    if (true) { //validation not done yet!
        var email = forminput.email.value;
        var password = forminput.password.value;
        var returndata = serverstub.signIn(email, password);
        var token = returndata.data;

        if (returndata.success) {
            localStorage.setItem("token", token);
            displayView(document.getElementById("profileview"));
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
    var returnobject = serverstub.signOut(localStorage.getItem("token"));
    localStorage.removeItem("token"); //signOut function doesn't remoave token. Otherwise on reload would be loggin back in
    localStorage.removeItem("email");
    displayView(document.getElementById("welcomeview"));
    feedback(returnobject.message);
}

//change Password
function changepassword(forminput) {
    var oldpassword = forminput.oldpassword.value;
    var newpassword = forminput.newpassword.value;
    var passwordConfirmation = forminput.passwordConfirmation.value;
    var token = localStorage.getItem("token");
    var errormessage = "";

    if (newpassword == passwordConfirmation) {
        var returnobject = serverstub.changePassword(token, oldpassword, newpassword);
        feedback(returnobject.message);
    } else {
        feedback("Password confirmation and new password are not the same");
    }
}

var otherUser = ""; //save current user that was looking for in browser view

// a indicates which view is active and form data includes the message
function postMessage(a, formdata) {
    var message = formdata.message.value;
    var token = localStorage.getItem("token");
    var email = otherUser;
    if (a == 0) { //if on home view is active we get our own email
        var email = serverstub.getUserDataByToken(token).data.email;
    }
    returnobject = serverstub.postMessage(token, message, email);
    feedback(returnobject.message);
}

// is called by update button and on load of tab. a indicates which view is active
function updateWall(a) {
    i = a;
    var email = otherUser;
    var token = localStorage.getItem("token");
    returnobject = serverstub.getUserMessagesByEmail(token, email);
    if (i == 0) { //if on home view is active returnobject is overwritten
        returnobject = serverstub.getUserMessagesByToken(token);
    }
    var posts = returnobject.data;
    var userWall = document.getElementsByClassName("messageWall")[i];
    userWall.innerHTML = "";
    for (var j = 0; j < posts.length; j++) { //creating HTML for messageWall
        userWall.innerHTML += "<div class='post'>" + posts[j].content + "</br>(" + posts[j].writer + ")</div></br>";
    }
}

function getuserdata(a, formdata) {
    i = a;
    var token = localStorage.getItem("token");
    if (a == 0) { //if home tab is active we get data only by token
        var returnobject = serverstub.getUserDataByToken(token);
    } else {
        var email = formdata.email.value;
        otherUser = email;
        var returnobject = serverstub.getUserDataByEmail(token, email);
    }
    if (returnobject.success) {
        userdata = returnobject.data;
        document.getElementsByClassName("profile")[i].style.display = "block";
        document.getElementsByClassName("displayFirstName")[i].innerHTML = userdata.firstname;
        document.getElementsByClassName("displayFamilyName")[i].innerHTML = userdata.familyname;
        document.getElementsByClassName("displayGender")[i].innerHTML = userdata.gender;
        document.getElementsByClassName("displayCity")[i].innerHTML = userdata.city;
        document.getElementsByClassName("displayCountry")[i].innerHTML = userdata.country;
        document.getElementsByClassName("displayEmail")[i].innerHTML = userdata.email;
        updateWall(i); //we also update the wall
    } else {
        feedback(returnobject.message);
        document.getElementsByClassName("profile")[i].style.display = "none"; //if user doesn't exist hide profileview
    }
}
