var previousItem;

/* Function to allow drop from a dragged element.
*
*
*/
function allowDrop(event) {
  event.preventDefault();
}

/* Function to drag an element from one divition to another
*  gets called when a draggeble object is beeing dragged.
*
*/
function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
  console.log('Draging: ' + event.target.id);
}

/* Function to drop an element to a devision where drop is
*  allowed gets called on the drop event.
*
*/
function drop(event) {
  event.preventDefault();
  previousItem = event.target.childNodes[0];
  var data = event.dataTransfer.getData("text");

  if (previousItem != null) {
    event.target.replaceChild(document.getElementById(data), previousItem);
  } else {
    event.target.appendChild(document.getElementById(data));
  }
  console.log('Dropped');

  if (document.getElementById('profilePick').innerHTML == "") {
    document.getElementById('profilePick').innerHTML = "Drag here to make profile picture.";
  }

}
