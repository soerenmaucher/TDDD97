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
  event.preventDefault();
  var previousItem = event.target.childNodes[0];
  var data = event.dataTransfer.getData("text");

  if (previousItem != null) {
    event.target.replaceChild(document.getElementById(data), previousItem);
  } else {
    event.target.appendChild(document.getElementById(data));
  }
  if (document.getElementById('profilePick').innerHTML == "") {
    document.getElementById('profilePick').innerHTML = "Drag here to make profile picture.";
  }
  console.log('Dropped');
  return false;
}

/* Function reset the profile picture when the old one
*  is deleted. Called when dragged to tresh can.
*  no argument
*/
function setDefaultPicture () {

}
