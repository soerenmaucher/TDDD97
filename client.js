window.onload = function() {
    displayView();
};

displayView = function() {
  // the code required to display a view
  document.getElementById('welcomecontent').innerHTML = document.getElementById('welcomeview').innerHTML;
};

// password validation
function check(input) {
    if (input.value != document.getElementById("password").value) {
        input.setCustomValidity("Password Must be Matching.");
    } else {
        // input is valid -- reset the error message
        input.setCustomValidity('');
    }
}
