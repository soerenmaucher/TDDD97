window.onload = function() {
  if(localStorage.getItem("token")){
    displayView(document.getElementById("profileview"));
  }
  else {
      displayView(document.getElementById("welcomeview"));
  }
};

displayView = function(view) {
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

//for now. Will probably be replaced later, but this way we don't have to manually remove token
function logout(){
localStorage.removeItem("token");
location.reload();
}
