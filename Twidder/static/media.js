/* The upload function for the client side profile picture
*  gets called when user browses for a local file.
*
*/
function uploadProfilePicture() {
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

/* Function to update the server with the chosen profile
*  picture file. Gets called on submit. And uploads the current
*  file in the dropzone for profile picktures.
*/
function updateMedia(section) {
  var token = localStorage.getItem("token");
  var email;
  var profilePicture;
  if (section == 0) {
    email = currentUser;
    if (document.getElementById('profilePick').children[0]) {
      profilePicture = document.getElementById('profilePick').innerHTML;
    } else {
      console.log('There is no image in dragged field.');
      feedback('Select an image to upload.');
    }
  } else {
    email = browsedUser;
  }
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState == 4 & httpRequest.status == 200) {
      var httpResponse = JSON.parse(httpRequest.responseText);
      feedback(httpResponse.message);
    }
  };

  postRequest(httpRequest, "updateProfilePicture/"+email, JSON.stringify({'profilePicture' : profilePicture}));
  console.log('Profile picture updated.');
  feedback('Profile picture updated.');

  return false;
}
