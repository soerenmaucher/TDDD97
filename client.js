window.onload = function() {
    displayView();
};

displayView = function() {
  // the code required to display a view
  document.getElementById('welcomecontent').innerHTML = document.getElementById('welcomeview').innerHTML;
};

// password validation
function check(repeatedPassword) {
    if (repeatedPassword.value != document.getElementById("password").value) {
        repeatedPassword.setCustomValidity("Passwords don't match.");
    } else {
        // if input is valid, reset the error message
        repeatedPassword.setCustomValidity('');
    }
}
