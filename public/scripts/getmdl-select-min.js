var firebaseConfig = {
    apiKey: "AIzaSyD9CPSZ4hUua3AF_VjmNx_Nb8vl-qVpms8",
    authDomain: "transformasi-bapenda.firebaseapp.com",
    databaseURL: "https://transformasi-bapenda.firebaseio.com",
    projectId: "transformasi-bapenda",
    storageBucket: "transformasi-bapenda.appspot.com",
    messagingSenderId: "362597712245",
    appId: "1:362597712245:web:8562a40d56537d00"
};

firebase.initializeApp(firebaseConfig);

var d = new Date();
var t = d.getTime();
var counter = t;
var selectedFileA;
var selectedFileB;

$(document).ready(function () {
    $('#buttonA').attr("disabled", true);
    $("#fileA").prop("disabled", true);
});

$("#fileA").on("change", function (event) {
    selectedFileA = event.target.files[0];
    var elem = document.getElementById("progress");
    elem.innerHTML = 'Image is ' + selectedFileA.name;
    $('#buttonA').attr("disabled", false);
});

$("#fileB").on("change", function (event) {
    selectedFileB = event.target.files[0];
    var elem = document.getElementById("progress");
    elem.innerHTML = 'File is ' + selectedFileB.name;
    $("#fileA").prop("disabled", false);
});

document.getElementById("form").addEventListener("submit", (e) => {
    var bidang = document.getElementById("bidang").value;
    var judul = document.getElementById("judul").value;
    e.preventDefault();
    var filenameB = selectedFileB.name;
    var storageRefB = firebase.storage().ref('/presentasi/' + filenameB);
    var filenameA = selectedFileA.name;
    var elem = document.getElementById("progress");
    elem.innerHTML = 'Uploading Files...';
    var storageRefA = firebase.storage().ref('/thumbnail/' + filenameA);
    createTask(bidang, judul, storageRefA, storageRefB);
    form.reset();
});

function createTask(bidang, judul, storageRefA, storageRefB) {
    var uploadTaskA = storageRefA.put(selectedFileA);
    var uploadTaskB = storageRefB.put(selectedFileB);
    uploadTaskA.on('state_changed', function (snapshot) {
    }, function (error) {
        var elem = document.getElementById("progress");
        elem.innerHTML = 'Error';
    }, function () {
        uploadTaskA.snapshot.ref.getDownloadURL().then(function (thumbnail) {
            task(thumbnail)
        });
    });
    function task(thumbnail) {
        uploadTaskB.on('state_changed', function (snapshot) {
        }, function (error) {
            var elem = document.getElementById("progress");
            elem.innerHTML = 'Error';
        }, function () {
            uploadTaskB.snapshot.ref.getDownloadURL().then(function (link) {
                counter += 1;
                var presentasi = {
                    id: counter,
                    bidang: bidang,
                    judul: judul,
                    link: link,
                    thumbnail: thumbnail
                }
                let db = firebase.database().ref("presentasi/" + counter);
                db.set(presentasi);
                document.getElementById("tableContent").innerHTML = '';
                var elem = document.getElementById("progress");
                elem.innerHTML = 'Initializing Database...';
                fetch('https://transformasi-bapenda.firebaseio.com/presentasi.json')
                    .then(response => {
                        return response.json()
                    })
                    .then(data => {
                        var elem = document.getElementById("progress");
                        elem.innerHTML = 'Populate Object...';
                        var ObjectOfObjects = data;
                        let arrayOfObjects = Object.keys(ObjectOfObjects).map(key => {
                            let arrays = ObjectOfObjects[key]
                            arrays.key = key
                            return arrays
                        })
                        var elem = document.getElementById("progress");
                        elem.innerHTML = 'Restructuring Data...';
                        var keysSorted = arrayOfObjects.sort(function (a, b) { return b.id - a.id; });
                        firebase.database().ref("data").set(keysSorted);
                        var elem = document.getElementById("progress");
                        elem.innerHTML = 'Upload Successful.';
                    })
                    .catch(err => {
                        var elem = document.getElementById("progress");
                        elem.innerHTML = 'Error';
                    });
                readTask();
            });
        });
    }
}

function readTask() {
    var presentasi = firebase.database().ref("presentasi/");
    presentasi.on("child_added", function (data) {
        var taskValue = data.val();
        document.getElementById("tableContent").innerHTML += `
        <div class="mdl-card mdl-shadow--2dp">
            <div class="mdl-card__title mdl-card--expand">
                <img src=${taskValue.thumbnail} style="width:268px; height: 162px !important;">
            </div>
            <div class="mdl-card__supporting-text" style="text-align: right; color:#039be5 !important">${taskValue.bidang}</div>
            <div class="mdl-card__actions mdl-card--border">
            <div class="mdl-card__supporting-text">${taskValue.judul}</div>
            </div>
            <div class="mdl-card__actions mdl-card--border">
                <button onclick='window.open("${taskValue.link}")' class="mdl-button mdl-js-button mdl-js-ripple-effect">File</button>
                <button type="submit" class="mdl-button mdl-js-button mdl-js-ripple-effect" onclick="deleteTask(${taskValue.id})">Delete</button>
            </div>
        </div>
         `;
    });
}

function deleteTask(id) {
    var deleteRef = firebase.database().ref("presentasi/" + id);
    deleteRef.once("value")
        .then(function (snapshot) {
            var linkRef = snapshot.child("link").val();
            var linkDel = firebase.storage().refFromURL(linkRef);
            linkDel.delete().then(function () {
                var elem = document.getElementById("progress");
                elem.innerHTML = 'File Deleted Successfully.';
            }).catch(function (error) {
                var elem = document.getElementById("progress");
                elem.innerHTML = 'Error';
            });
            var thumbRef = snapshot.child("thumbnail").val();
            var thumbDel = firebase.storage().refFromURL(thumbRef);
            thumbDel.delete().then(function () {
                var elem = document.getElementById("progress");
                elem.innerHTML = 'Image Deleted Successfully.';
            }).catch(function (error) {
                var elem = document.getElementById("progress");
                elem.innerHTML = 'Error';
            });
        });
    deleteRef.remove();
    document.getElementById("tableContent").innerHTML = '';
    fetch('https://transformasi-bapenda.firebaseio.com/presentasi.json')
        .then(response => {
            return response.json()
        })
        .then(data => {
            var elem = document.getElementById("progress");
            elem.innerHTML = 'Populate Object...';
            var ObjectOfObjects = data;
            let arrayOfObjects = Object.keys(ObjectOfObjects).map(key => {
                let ar = ObjectOfObjects[key]
                ar.key = key
                return ar
            })
            var keysSorted = arrayOfObjects.sort(function (a, b) { return b.id - a.id; });
            firebase.database().ref("data").set(keysSorted);
            var elem = document.getElementById("progress");
            elem.innerHTML = 'Data Deleted Successfully.';
            readTask();
        })
        .catch(err => {
            var elem = document.getElementById("progress");
            elem.innerHTML = 'Error';
        });
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
  
      document.getElementById("user_div").style.display = "block";
      document.getElementById("login_div").style.display = "none";
  
      var user = firebase.auth().currentUser;
  
      if(user != null){
  
        var email_id = user.email;
        document.getElementById("user_para").innerHTML = email_id;
  
      }
  
    } else {
      // No user is signed in.
  
      document.getElementById("user_div").style.display = "none";
      document.getElementById("login_div").style.display = "block";
  
    }
  });
  
  function login(){
  
    var userEmail = document.getElementById("email_field").value;
    var userPass = document.getElementById("password_field").value;
  
    firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function(error) {
      // Handle Errors here.
      var errorCode = error.code;
      var errorMessage = error.message;
  
      window.alert("Error : " + errorMessage);
  
      // ...
    });
  
  }
  
  function logout(){
    firebase.auth().signOut();
  }