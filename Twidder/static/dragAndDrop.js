/* Function to allow drop from a dragged element.
*
*  argument[0]: ondragover-event
*/
function allowDrop(event) {
  event.preventDefault();
  return false;
}

/* Function to drag an element from one divition to another
*  gets called when a draggeble object is beeing dragged.
*  argument[0]: ondragstart-event
*/
function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
  console.log('Draging: ' + event.target.id);
  return false;
}

/* Function to drop an element to a devision where drop is
*  allowed gets called on the drop event.
*  argument[0]: ondrop-event
*/
function drop(event) {
  var token = localStorage.getItem("token");
  var email = localStorage.getItem("email");
  var data = email + token;
  var hashedData= hashData(data);
  var httpRequest = new XMLHttpRequest();
  profilePicture = "static/media/default.JPG";
  postRequest(httpRequest, "uploadprofilepicture/", JSON.stringify({'profilePicture' : profilePicture, 'email': email}), hashedData);
  document.getElementsByClassName('image')[0].src = profilePicture;

}

/* Function reset the profile picture when the old one
*  is deleted. Called when dragged to tresh can.
*  no argument
*/
