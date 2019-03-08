/* Function that previews the browsed pocture in the preview
*  field in the home tab. Get called when the selected file is changed.
*  Takes no arguments.
*/
function previewProfilePicture() {

  var image = document.getElementById('previewFiled');
  var file = document.querySelector('input[type=file]').files[0];
  var reader  = new FileReader();

  reader.addEventListener("load", function () {
    image.src = reader.result;
  }, false);

  if (file) {
    reader.readAsDataURL(file);
  }
  return false;
}

/* Function to upload profile picture to the server
*  Gets called on submit in the home tab. And uploads the current
*  file in the dropzone for profile picktures.
*  Takes no arguments.
*/
function uploadProfilePicture() {

  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 & httpRequest.status == 200) {
      var httpResponse = JSON.parse(httpRequest.responseText);
      feedback(httpResponse.message);
    }
  };

  var token = localStorage.getItem("token");
  if (document.getElementById('uploadbox').children[0]) {
    var profilePicture = document.getElementById('uploadbox').innerHTML;
    postRequest(httpRequest, "uploadprofilepicture/", JSON.stringify({'profilePicture' : profilePicture}), token);
    console.log('Profile picture updated.');
    feedback('Profile picture updated.');
  } else {
    console.log('There is no image in the dropzone');
    feedback('Select an image to upload.');
  }

  return false;
}

/* Function to display profle picture on home tab
*  and show others pictures next to message in the browse
*  tab. Called when profile is updated or user is searched.
*  argument[0]: 0 = home, 1 = browse
*/
function displayProfilePicture(section) {

  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 & httpRequest.status == 200) {
      var httpResponse = JSON.parse(httpRequest.responseText);
      if(httpResponse.success){
        var post = httpResponse.data[0][1];
        if (post) {
          if (section == 0) {
            document.getElementById('uploadbox').innerHTML = post;
          } else if (section == 1) {
            document.getElementById('userProfilePick').innerHTML = post;
          }
        }
      } else {
        //feedback(httpResponse.message);
      }
    }
  };

  var token = localStorage.getItem("token");
  if (section == 1) {
    var email = browsedUser;
    getRequest(httpRequest, "profilepicture/"+email, null, token);
  } else {
    getRequest(httpRequest, "profilepicture/", null, token);
  }

  return false;
}
