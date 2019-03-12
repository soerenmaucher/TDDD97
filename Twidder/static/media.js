/* Function that checks if the chosen file is an video file
*  returns true or false.
*  arg[0] = file to be uploaded
*/
function isVideo(file) {

  var filename = file.name;
  var fileExtention = filename.split('.').pop();
  var videoExtentions = ['ogg','mp4','webm'];
  return videoExtentions.indexOf(fileExtention.toLowerCase()) > -1;
}

/* Function that checks if the chosen file is an image file
*  returns true or false.
*  arg[0] = file to be uploaded
*/
function isPicture(file) {

  var filename = file.name;
  var fileExtention = filename.split('.').pop();
  var imageExtentions = ["jpeg", "jpg", "png", "gif"];
  return imageExtentions.indexOf(fileExtention.toLowerCase()) > -1;
}

/* Function that previews the browsed pocture in the preview
*  field in the home tab. Get called when the selected file is changed.
*  Takes no arguments.
*/
function uploadProfilePicture() {
  var imageelement = document.getElementsByClassName('image')[0];
  var file = document.getElementsByName('imgupload')[0].files[0];
  var reader  = new FileReader();
  if (isPicture(file)) {

    reader.addEventListener("load", function () {
      imageelement.src = reader.result;
      saveimage(reader.result);
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  } else {
    feedback('The selected file is not an image file.');
  }
  return false;
}

/* Function to upload profile picture to the server
*  Gets called on submit in the home tab. And uploads the current
*  file in the dropzone for profile picktures.
*  Takes no arguments.
*/
function saveimage(image) {
  var imageelement = document.getElementsByClassName('image')[0];
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 & httpRequest.status == 200) {
      var httpResponse = JSON.parse(httpRequest.responseText);
      feedback(httpResponse.message);
    }
  };

  var token = localStorage.getItem("token");
  var email = localStorage.getItem("email");
    var data = email + token;
    var hashedData= hashData(data);
    postRequest(httpRequest, "uploadprofilepicture/", JSON.stringify({'profilePicture' : image, 'email': email}), hashedData);
    console.log('Profile picture updated.');
    feedback('Profile picture updated.');

  return false;
}

/* Function to display profle picture on home tab
*  and show others pictures next to message in the browse
*  tab. Called when profile is updated or user is searched.
*  argument[0]: 0 = home, 1 = browse
*/
function displayMyProfilePicture() {

  var httpRequest = new XMLHttpRequest();
  var imageelement = document.getElementsByClassName('image')[0];
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 & httpRequest.status == 200) {
      var httpResponse = JSON.parse(httpRequest.responseText);
      if(httpResponse.success){
        var post = httpResponse.data[0][1];
        if (post) {
            imageelement.src= post;
          }
        }
      } else {
        //feedback(httpResponse.message);
      }
  };
  var token = localStorage.getItem("token");
  var myEmail = localStorage.getItem("email");
  var data = myEmail + token;
  var hashedData= hashData(data);
  postRequest(httpRequest, "profilepicture/", JSON.stringify({'myEmail': myEmail}),hashedData);
  return false;
}


function displayProfilePicture() {
  var imageelement = document.getElementsByClassName('image')[1];
  imageelement.src= 'static/media/default.jpg';
  //document.getElementById('userProfilePick').innerHTML = "<img class='image' src='static/media/default.JPG'  alt='Image preview'>";
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {

    if (httpRequest.readyState == 4 & httpRequest.status == 200) {
      var httpResponse = JSON.parse(httpRequest.responseText);
      if(httpResponse.success){
        var post = httpResponse.data[0][1];
        if (post) {
            document.getElementsByClassName('image')[1].src = post;
          }
        }
      } else {
        //feedback(httpResponse.message);
      }
  };
  var token = localStorage.getItem("token");
  var myEmail = localStorage.getItem("email");
  var data = browsedUser + token;
  var hashedData= hashData(data);
  var email = browsedUser;
  postRequest(httpRequest, "profilepicture/"+email, JSON.stringify({'myEmail': myEmail}), hashedData);
  return false;
}

function videoUpload()
{
  var videoelement = document.getElementsByClassName("video")[0];
  var file = document.getElementsByName('videoupload')[0].files[0];
  var reader  = new FileReader();
  if (isVideo(file)) {
    reader.addEventListener("load", function () {
      videoelement.src = reader.result;
      postvideo(reader.result);
    }, false);

    if (file) {
      reader.readAsDataURL(file);
    }
  } else {
    feedback('The selected file is not a video file.');
  }
}

function postvideo(video)
{
  var token = localStorage.getItem("token");
  var email = localStorage.getItem("email");
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 & httpRequest.status == 200) {
      var httpResponse = JSON.parse(httpRequest.responseText);
      feedback(httpResponse.message);
    }
  };
  //document.getElementsByClassName('videocontainer')[0].innerHTML;
  console.log(video);
    var data = email + token;
    var hashedData= hashData(data);
    postRequest(httpRequest, "uploadvideo", JSON.stringify({'video' : video, 'email': email}), hashedData);
    console.log('video uploaded');
    feedback('video uploaded');
    return false;
}


function displaymyvideo() {
  document.getElementsByClassName("video")[0].src= "/static/media/default.mp4";
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 & httpRequest.status == 200) {
      var httpResponse = JSON.parse(httpRequest.responseText);
      if(httpResponse.success){
        var post = httpResponse.data[0][1];
        if (post) {
            document.getElementsByClassName("video")[0].src= post;
          }
        }
      } else {
        //feedback(httpResponse.message);
      }
  };
  var token = localStorage.getItem("token");
  var myEmail = localStorage.getItem("email");
  var data = myEmail + token;
  var hashedData= hashData(data);
  postRequest(httpRequest, "getvideo", JSON.stringify({'myEmail': myEmail}), hashedData);
  return false;
}

function displayvideo() {
  document.getElementsByClassName("video")[1].src= "/static/media/default.mp4";
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 & httpRequest.status == 200) {
      var httpResponse = JSON.parse(httpRequest.responseText);
      if(httpResponse.success){
        var post = httpResponse.data[0][1];
        if (post) {
            document.getElementsByClassName("video")[1].src= post;
          }
        }
      } else {
        //feedback(httpResponse.message);
      }
  };
  var token = localStorage.getItem("token");
  var myEmail = localStorage.getItem("email");
  var email = browsedUser;
  var data = browsedUser + token;
  var hashedData= hashData(data);
  postRequest(httpRequest, "getvideo/"+email, JSON.stringify({'myEmail': myEmail}), hashedData);
  return false;
}
