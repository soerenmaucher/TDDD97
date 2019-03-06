var previousItem;

function allowDrop(event) {
  event.preventDefault();
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
  console.log('Draggn ' + event.target.id);
}

function drop(event) {
  event.preventDefault();
  previousItem = event.target.childNodes[0];
  var data = event.dataTransfer.getData("text");

  if (previousItem != null) {
    event.target.replaceChild(document.getElementById(data), previousItem);
  } else {
    event.target.appendChild(document.getElementById(data));
  }
  console.log('Droppn');

  if (document.getElementById('profilePick').innerHTML == "") {
    document.getElementById('profilePick').innerHTML = "Drag here to make profile picture.";
  }

}
