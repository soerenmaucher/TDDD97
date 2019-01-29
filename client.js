window.onload = function() {
    displayView();
};

displayView = function() {
  // the code required to display a view
  document.getElementById('welcomecontent').innerHTML = document.getElementById('welcomeview').innerHTML;
};

// password validation
function comparepasswords() {
    if (document.getElementById("passwordConfirmation").value != document.getElementById("password").value) {
        feedback("Passwords don't match!");
    } else {
        // if input is valid, reset the error message
        repeatedPassword.setCustomValidity('');
    }

}

// feedback function
function feedback(text) {
    var feedback= document.getElementById('feedback');
    var message= document.getElementById('message');
    message.innerHTML = text;
    feedback.style.display = "block";
}

function closefeedback(){
    var feedback= document.getElementById('feedback');
    feedback.style.display = "none";
}
