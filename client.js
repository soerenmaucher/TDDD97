window.onload = function() {
  if(localStorage.getItem("token")){
    displayView(document.getElementById("profileview"));
    // Open the default tab
    document.getElementById("defaultOpen").click();
  }
  else {
      displayView(document.getElementById("welcomeview"));
  }
};

 function displayView(view) {
  // the code required to display a view
  document.getElementById('pagecontent').innerHTML = view.innerHTML;
};

// password validation
function comparepasswords(password, passwordconfirmation) {
    if ( password != passwordconfirmation) {
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
    var feedback= document.getElementById('feedback');
    var message= document.getElementById('message');
    message.innerHTML = text;
    feedback.style.display = "block";
}

function closefeedback(){
    var feedback= document.getElementById('feedback');
    feedback.style.display = "none";
}

//signup function
function signup(forminput){

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
      "email":email,
      "password":password,
      "firstname":firstname,
      "familyname":familyname,
      "gender":gender,
      "city":city,
      "country":country
      }


      result= serverstub.signUp(newUser);

    if (result.success & error_message == ""){
      feedback("Signup successful");
      }
    else{
      if (!result.success){
        error_message = error_message + result.message; //append both error messages
      }
        feedback(error_message);
    }

}
//signup function
function signin(forminput){
  if (true) {//validation not done yet!
    var email = forminput.email.value;
    var password = forminput.password.value;
    var returndata= serverstub.signIn(email, password);
    var token= returndata.data;

    if (returndata.success)  {
      localStorage.setItem("token", token);
      displayView(document.getElementById("profileview"));
    }
    else{
      feedback(returndata.message);
    }
  }
  else{
    //feedback
  }
}

// logout functionality
function logout(){
  var returnobject = serverstub.signOut(localStorage.getItem("token"));
      localStorage.removeItem("token");//signOut function doesn't remoave token. Otherwise on reload would be loggin back in
      localStorage.removeItem("email");
      displayView(document.getElementById("welcomeview"));
      feedback(returnobject.message);
}

//change Password
function changepassword(forminput){
  var oldpassword = forminput.oldpassword.value;
  var newpassword = forminput.newpassword.value;
  var passwordConfirmation= forminput.passwordConfirmation.value;
  var token = localStorage.getItem("token");
  var errormessage="";

  if(newpassword == passwordConfirmation){
    var returnobject = serverstub.changePassword(token, oldpassword, newpassword);
      feedback(returnobject.message);
  }
  else{
    feedback("Password confirmation and new password are not the same");
  }
}
