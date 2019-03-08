window.onload = function() {
    if (localStorage.getItem("token")) {
        connectSocket(localStorage.getItem("token"));
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

    var httpRequest = new XMLHttpRequest();

     httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 & httpRequest.status == 200) {
          var httpResponse = JSON.parse(httpRequest.responseText);
              feedback(httpResponse.message); //should we directly get logged in?
        }
      };
      postRequest(httpRequest,"signup" ,JSON.stringify({'firstName' : firstName, 'familyName' : familyName, 'gender' : gender, 'country' : country, 'city' : city, 'email' : email, 'password' : password, 'passwordConfirmation' : passwordConfirmation  }), null);
      return false;
}

//signin function
function signin(formInput) {
    if (true) { //validation not done yet!
        var email = formInput.email.value;
        var password = formInput.password.value;

        var httpRequest = new XMLHttpRequest();

         httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState == 4 & httpRequest.status == 200) {
              var httpResponse = JSON.parse(httpRequest.responseText);
                    if(httpResponse.success){
                      token = httpResponse.data;
                      localStorage.setItem("token", token);
                      connectSocket(token);
                      displayView(document.getElementById("profileView"));
                    }
                    else{
                      feedback(httpResponse.message);
                    }
            }};
          postRequest(httpRequest,"signin" ,JSON.stringify({'email' : email, 'password' : password}), null);
          return false;
    }
}

// logout functionality
function logout() {
    var httpRequest = new XMLHttpRequest();
    var token= localStorage.getItem("token");
    httpRequest.onreadystatechange = function() {
       if (httpRequest.readyState == 4 & httpRequest.status == 200) {
         var httpResponse = JSON.parse(httpRequest.responseText);
               if(httpResponse.success){
                 localStorage.removeItem("token");
                 displayView(document.getElementById("welcomeView"));
                 feedback(httpResponse.message);
               }
               else{
                 feedback(httpResponse.message);
               }
       }
     };
    postRequest(httpRequest,"logout" ,null, token);
    return false;
}

//change Password
function changePassword(formInput) {
    var oldPassword = formInput.oldPassword.value;
    var newPassword = formInput.newPassword.value;
    var passwordConfirmation = formInput.passwordConfirmation.value;
    var token = localStorage.getItem("token");
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
       if (httpRequest.readyState == 4 & httpRequest.status == 200) {
         var httpResponse = JSON.parse(httpRequest.responseText);
         feedback(httpResponse.message);
       }
     };
    postRequest(httpRequest,"newpassword" ,JSON.stringify({'oldPassword' : oldPassword, 'newPassword' : newPassword, 'passwordConfirmation' : passwordConfirmation}), token);
    return false;
}

var browsedUser = ""; //save current user that was looking for in browser view
var currentUser="";
// a indicates which view is active and form data includes the message
function postMessage(section, formData) {
  var token = localStorage.getItem("token");
  var email;
  var message;
  if (section == 0){
    email = currentUser
    message =formData.ownMessage.value;
  }
  else {
    email= browsedUser;
    message =formData.message.value;
  }
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
         if (httpRequest.readyState == 4 & httpRequest.status == 200) {
           var httpResponse = JSON.parse(httpRequest.responseText);
           feedback(httpResponse.message);
         }
       };
      postRequest(httpRequest,"post/"+email, JSON.stringify({'message' : message}), token);
      return false;
  }

// is called by update button and on load of tab. a indicates which view is active
function updateWall(section) {
    i = section;
    var email="";
    if (section == 1){
      email = "/"+browsedUser;
    }
    var token = localStorage.getItem("token");
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
           if (httpRequest.readyState == 4 & httpRequest.status == 200) {
             var httpResponse = JSON.parse(httpRequest.responseText);
             if(httpResponse.success){
                 var posts = httpResponse.data;
                 var userWall = document.getElementsByClassName("messageWall")[i];
                 userWall.innerHTML = "";
                 for (var j = posts.length-1; j >-1; j--) { //creating HTML for messageWall
                     userWall.innerHTML += "<div class='post'>" + posts[j][1] + "</br>(" + posts[j][3]+ ")</div></br>";
                 }
               }
              else{
                feedback(httpResponse.message);
              }
           }
         };
        getRequest(httpRequest,"usermessages"+email, null, token);
        return false;
}

function getMyUserData() {
    i = 0;
    var token = localStorage.getItem("token");
        var httpRequest = new XMLHttpRequest();
        httpRequest.onreadystatechange = function() {
           if (httpRequest.readyState == 4 & httpRequest.status == 200) {
             var httpResponse = JSON.parse(httpRequest.responseText);
             if(httpResponse.success){
               userdata = httpResponse.data;
               document.getElementsByClassName("profile")[i].style.display = "block";
               document.getElementsByClassName("displayFirstName")[i].innerHTML = userdata[0];
               document.getElementsByClassName("displayFamilyName")[i].innerHTML =  userdata[1];
               document.getElementsByClassName("displayGender")[i].innerHTML =  userdata[2];
               document.getElementsByClassName("displayCity")[i].innerHTML =  userdata[3];
               document.getElementsByClassName("displayCountry")[i].innerHTML =  userdata[4];
               document.getElementsByClassName("displayEmail")[i].innerHTML =  userdata[5];
               //document.getElementById("profilePick")[i].innerHTML = userdata[6];
               currentUser=userdata[5];
               updateWall(i);
               displayProfilePicture(i);
             }
             else{
               feedback(httpResponse.message);
             }
           }
         };
        getRequest(httpRequest,"getmyself" ,null, token);
        return false;
}


function getUserData(formdata) {
    i = 1;
    var email = formdata.email.value;
    browsedUser = email;
    var token = localStorage.getItem("token");
    var httpRequest = new XMLHttpRequest();
      httpRequest.onreadystatechange = function() {
           if (httpRequest.readyState == 4 & httpRequest.status == 200) {
             var httpResponse = JSON.parse(httpRequest.responseText);
             if(httpResponse.success){
               userdata = httpResponse.data;
               document.getElementsByClassName("profile")[i].style.display = "block";
               document.getElementsByClassName("displayFirstName")[i].innerHTML = userdata[0];
               document.getElementsByClassName("displayFamilyName")[i].innerHTML =  userdata[1];
               document.getElementsByClassName("displayGender")[i].innerHTML =  userdata[2];
               document.getElementsByClassName("displayCity")[i].innerHTML =  userdata[3];
               document.getElementsByClassName("displayCountry")[i].innerHTML =  userdata[4];
               document.getElementsByClassName("displayEmail")[i].innerHTML =  userdata[5];
               //document.getElementById("profilePick")[i].innerHTML = userdata[6];
               updateWall(i);
             }
             else{
               feedback(httpResponse.message);
               document.getElementsByClassName("profile")[i].style.display = "none"; //if user doesn't exist hide profileview
             }
           }
         };
        getRequest(httpRequest,"getuser/"+email ,null,token);
        return false;
}

//general function that can be used for post requests to safe some code
function postRequest(request, url, data, token){
  request.open("POST", url, true);
  if (token!=null)
  {
    	request.setRequestHeader("token", token);
  }
	request.setRequestHeader("Content-type","application/json; charset=utf-8");
	request.send(data);
}


function getRequest(request, url, data, token){
  request.open("GET", url, true);
  if (token!=null)
  {
    	request.setRequestHeader("token", token);
  }
	request.setRequestHeader("Content-type","application/json; charset=utf-8");
	request.send(data);
}


//here we connect to the socket and implement all the functions regrding open, message, colse etc.
 function connectSocket(token){
var ws = new WebSocket("ws://127.0.0.1:5000/api");
  ws.onopen = function()
{
   console.log("connection built");
    ws.send(token);
};

ws.onmessage = function(response)
{
    if (JSON.parse(response.data) == "logout"){
      //logout without closing connection again
      ws.send("close");
      localStorage.removeItem("token");
      //same functionality as logout
      displayView(document.getElementById("welcomeView"));
      feedback("You have been logged out from another device");
    }

    if (JSON.parse(response.data) == "close"){
      //only closing
      ws.send("close");
    }
};

ws.onclose = function()
{
  console.log("connection closed");
};

ws.onerror = function()
{console.log("Error with Sockets");
};
}
