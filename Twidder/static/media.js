/* Function that previews the browsed pocture in the preview
*  field in the home tab. Get called when the selected file is changed.
*
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
  if (document.getElementById('profilePick').children[0]) {
    var profilePicture = document.getElementById('profilePick').innerHTML;
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
*/
function displayProfilePicture(section) {
  console.log('display PP!');
  var token = localStorage.getItem("token");
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 & httpRequest.status == 200) {
      var httpResponse = JSON.parse(httpRequest.responseText);
      if(httpResponse.success){
        if (section == 0) {
          var pictureBox = document.getElementById('profilePick');
          pictureBox.innerHTML = "";
        }
      } else { feedback(httpResponse.message); }
    }
  };
  var dope = getRequest(httpRequest, "profilepicture/", null, token);
  console.log('not stuck! ');
  return false;
}
