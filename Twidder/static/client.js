// Declaration of golbal variables:
var browsedUser = "";

/* Onload funcion for the window to update the window on logg in or
*  page refresh, it astablishes socket using the token for the user.
*  No arguments.
*
*/
window.onload = function() {
    if (localStorage.getItem("token")) {
        connectSocket(localStorage.getItem("token"));
        displayView(document.getElementById("profileView"));
        document.getElementById("defaultOpen").click();
    } else {
        displayView(document.getElementById("welcomeView"));
    }
};


/* Function to display the veiew.
*  arg[0] = what view should be displayed
*/
function displayView(view) {
  document.getElementById('pageContent').innerHTML = view.innerHTML;
}

/* Function to open a tab from the tabmenu.
*  arg[0] = klick event
*  arg[0] = what tab should be opend, Home, Browse or Account.
*/
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

/* Function to display a message for the user
*  arg[0] = string of text to be displayed.
*/
function feedback(text) {
    var feedback = document.getElementById('feedback');
    var message = document.getElementById('errorMessage');
    message.innerHTML = text;
    feedback.style.display = "block";
}

/* Function to eraze a message and close the feedback
*  and close the feedbac window.
*  No arguments.
*/
function closeFeedback() {
    var feedback = document.getElementById('feedback');
    var message = document.getElementById('errorMessage');
    message.innerHTML = "";
    feedback.style.display = "none";

}

/* Function sign up a new user. Adds the user data from the
*  form on the welcome page to the database and creates a new user.
*  arg[0] = formInput from the form at the welcome page.
*/
function signup(formInput) {
    var firstName = formInput.firstName.value;
    var familyName = formInput.familyName.value;
    var gender = formInput.gender.value;
    var city = formInput.city.value;
    var country = formInput.country.value;
    var email = formInput.email.value;
    var password = formInput.password.value;
    var passwordConfirmation = formInput.passwordConfirmation.value;

    var httpRequest = new XMLHttpRequest();

     httpRequest.onreadystatechange = function() {
        if (httpRequest.readyState == 4 & httpRequest.status == 200) {
          var httpResponse = JSON.parse(httpRequest.responseText);
              feedback(httpResponse.message);
        }
      };
      postRequest(httpRequest,"signup" ,JSON.stringify({'firstName' : firstName, 'familyName' : familyName, 'gender' : gender, 'country' : country, 'city' : city, 'email' : email, 'password' : password, 'passwordConfirmation' : passwordConfirmation  }), null);
      return false;
}

/* Function logg in a user. Checks if the user is in the database
*  and if the hashed passwords are maching.
*  arg[0] = formInput from the form at the welcome page.
*/
function signin(formInput) {
    if (true) {
        var email = formInput.email.value;
        var password = formInput.password.value;
        var httpRequest = new XMLHttpRequest();

         httpRequest.onreadystatechange = function() {
            if (httpRequest.readyState == 4 & httpRequest.status == 200) {
              var httpResponse = JSON.parse(httpRequest.responseText);
                    if(httpResponse.success){
                      token = httpResponse.data;
                      localStorage.setItem("email", email);
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


/* Function to logg out the a user.
*  Sends a post request to the server to remove a user from
*  the loggedIn table.
*  No argument.
*/
function logout() {
    var httpRequest = new XMLHttpRequest();
    var token= localStorage.getItem("token");
    var email = localStorage.getItem("email");
    httpRequest.onreadystatechange = function() {
       if (httpRequest.readyState == 4 & httpRequest.status == 200) {
         var httpResponse = JSON.parse(httpRequest.responseText);
               if(httpResponse.success){
                 localStorage.removeItem("token");
                  localStorage.removeItem("email");
                 displayView(document.getElementById("welcomeView"));
                 feedback(httpResponse.message);
               }
               else{
                 feedback(httpResponse.message);
               }
       }
     };
     var data = email + token;
     var hashedData= hashData(data);
    postRequest(httpRequest,"logout" ,JSON.stringify({'email': email}), hashedData);
    return false;
}

/* Function remove old and set a new password for a user.
*
*  arg[0] = the form input from the password form in the account tab.
*/
function changePassword(formInput) {
    var oldPassword = formInput.oldPassword.value;
    var newPassword = formInput.newPassword.value;
    var passwordConfirmation = formInput.passwordConfirmation.value;
    var email = localStorage.getItem("email");
    var token = localStorage.getItem("token");
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
       if (httpRequest.readyState == 4 & httpRequest.status == 200) {
         var httpResponse = JSON.parse(httpRequest.responseText);
         feedback(httpResponse.message);
       }
     };
     //Hashing token
     var data = email + newPassword + oldPassword + token;
     hashedData= hashData(data);
    postRequest(httpRequest, "newpassword" ,JSON.stringify({'email': email,'oldPassword' : oldPassword, 'newPassword' : newPassword, 'passwordConfirmation' : passwordConfirmation}), hashedData);
    return false;
}


/* Function to post a message makes a post request
*  and adda the message to the database and the user wall.
*  arg[0] = 0 for the home tab and, 1 for the browsed tab.
*/
function postMessage(section, formData) {
  var token = localStorage.getItem("token");
  var myEmail = localStorage.getItem('email');
  var email;
  var message;
  if (section == 0){
    email = localStorage.getItem('email');
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

      var data = myEmail+ email+ message + token;
      hashedData= hashData(data); //including token
      postRequest(httpRequest,"post/"+email, JSON.stringify({'message' : message, 'myEmail': myEmail}), hashedData);
      return false;
  }

/* Function update the you own wall, gets messages from
*  the database and the updates wall.
*  Called on page update and when update button is pressed.
*  No argument.
*/
function updateMyWall(){
  var token = localStorage.getItem("token");
  var myEmail = localStorage.getItem("email");
  i=0;
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
            }
         }
       };
      var data = myEmail + token;
      hashedData= hashData(data); //including token
      postRequest(httpRequest,"mymessages",JSON.stringify({'myEmail' : myEmail}),  hashedData);
      return false;
}

/* Function update the user wall, gets messages from
*  the database and the updates the user wall.
*  Called on page update and when update button is pressed.
*  No argument.
*/
function updateUserWall() {
  var token = localStorage.getItem("token");
  var myEmail = localStorage.getItem("email");
  var email= browsedUser;
  i=1;
    var httpRequest = new XMLHttpRequest();
    httpRequest.onreadystatechange = function() {
           if (httpRequest.readyState == 4 & httpRequest.status == 200) {
             var userWall = document.getElementsByClassName("messageWall")[i];
             userWall.innerHTML = "";
             var httpResponse = JSON.parse(httpRequest.responseText);
             if(httpResponse.success){
                 var posts = httpResponse.data;
                 for (var j = posts.length-1; j >-1; j--) { //creating HTML for messageWall
                     userWall.innerHTML += "<div class='post'>" + posts[j][1] + "</br>(" + posts[j][3]+ ")</div></br>";
                 }
               }
              else{
              }
           }
         };
         var data = myEmail+ email + token;
         hashedData= hashData(data); //including token
         postRequest(httpRequest,"usermessages",JSON.stringify({'myEmail' : myEmail, 'email': email}),  hashedData);
         return false;
}

/* Get function update your own user information, to get all the user data
*  from the database for displaying in the profile view.
*  No argument.
*/
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
         localStorage.setItem('email',userdata[5]);
         displayMyProfilePicture();
         updateMyWall();
         displaymyvideo();
       }
       else{
         feedback(httpResponse.message);
       }
     }
   };
  email= localStorage.getItem('email');
  data= email+ token;
  hashedData= hashData(data);
  postRequest(httpRequest,"getmyself" ,JSON.stringify({'email' : email}), hashedData);
  return false;
}

/* Get function update browsed user information, to get all the user data
*  from the database for displaying in the profile view.
*  No argument.
*/
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
         displayProfilePicture();
         updateUserWall();
         displayvideo();
       }
       else{
         feedback(httpResponse.message);
         document.getElementsByClassName("profile")[i].style.display = "none"; //if user doesn't exist hide profileview
       }
     }
   };
  myEmail= localStorage.getItem('email');
  data= email+ myEmail+ token;
  hashedData= hashData(data);
  postRequest(httpRequest,"getuser" ,JSON.stringify({'email': email, 'myEmail' : myEmail}),hashedData);
  return false;
}

/* A general function for making post request from the client side
*  to to the server side, used to get and post data to the database.
*  arg[0] = XML request used
*  arg[1] = url for app.route
*  arg[2] = the data sent to the database
*  arg[3] = the hashed data
*/
function postRequest(request, url, data, hashedData){
  request.open("POST", url, true);
  if (hashedData!=null)
  {
    	request.setRequestHeader("hashedData", hashedData);
  }
	request.setRequestHeader("Content-type","application/json; charset=utf-8");
	request.send(data);
}

/* A general function for making get request from the client side
*  to to the server side, used to get and post data to the database.
*  arg[0] = XML request used
*  arg[1] = url for app.route
*  arg[2] = the data sent to the database
*  arg[3] = the hashed data
*/
function getRequest(request, url, data, hashedData){
  request.open("GET", url, true);
  if (hashedData!=null)
  {
    	request.setRequestHeader("hashedData", hashedData);
  }
	request.setRequestHeader("Content-type","application/json; charset=utf-8");
	request.send(data);
}

/* Function for connecting a user with a web socket.
*  It has subfunctions to handle response messages, closing the connection
*  and errors. the url is set to the local port and a connection is built.
*  arg[0] = the user token
*/
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

/* Function to hash data using the external SHA512 hashing script.
*
*  arg[0] = data to be hashed
*  return: the hashed data.
*/
function hashData(data)
{
  var hashedData = CryptoJS.SHA512(data);
  return hashedData;
}
