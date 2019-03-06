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

function updateMedia() {
  console.log('update!!');
  if (document.getElementById('profilePick').innerHTML == ''Drag here to make profile picture.'') {
    console.log('no image');
  }

  return false;
}
