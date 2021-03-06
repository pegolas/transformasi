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

var provider = new firebase.auth.GoogleAuthProvider();
firebase.auth().languageCode = 'id';
var d = new Date();
var t = d.getTime();
var counter = t;
var selectedFileA;
var selectedFileB;


if (window.matchMedia('(max-width: 479px)').matches) {
    function close() {
        var d = document.querySelector('.mdl-layout');
        d.MaterialLayout.toggleDrawer();
    }
    document.querySelector('.mdl-layout__drawer, .mdl-layout__obfuscator').addEventListener('click', close);
} else {
};

$(document).ready(function () {
    $('#buttonA').attr("disabled", true);
    $("#fileA").prop("disabled", true);
});

$("#fileA").on("change", function (event) {
    event.preventDefault();
    selectedFileA = event.target.files[0];
    var elem = document.getElementById("progress");
    elem.innerHTML = 'Image is ' + selectedFileA.name;
    $('#buttonA').attr("disabled", false);
});

$("#fileB").on("change", function (event) {
    event.preventDefault();
    selectedFileB = event.target.files[0];
    var elem = document.getElementById("progress");
    elem.innerHTML = 'File is ' + selectedFileB.name;
    $("#fileA").prop("disabled", false);
});

$("#video_menu").on('click', function (event) {
    event.preventDefault();
    document.getElementById("elemenus").innerHTML = "Galeri Video";
    document.getElementById("youtube_div").style.display = "flex";
    document.getElementById("presentasi_div").style.display = "none";
});

$("#presentasi_menu").on('click', function (event) {
    event.preventDefault();
    document.getElementById("elemenus").innerHTML = "Arsip Presentasi";
    document.getElementById("youtube_div").style.display = "none";
    document.getElementById("presentasi_div").style.display = "flex";
});

function deleteTasks(id) {
    if (confirm("Are you sure?")) {
        deleteTask(id);
    }
    else {
        var elem = document.getElementById("progress");
        elem.innerHTML = 'Canceled.';
    }
}

function deleteVideos(id) {
    if (confirm("Are you sure?")) {
        deleteVideo(id);
    }
    else {
        var elem = document.getElementById("progressVideo");
        elem.innerHTML = 'Canceled.';
    }
}

function onstarted() {
    readTask();
    readYoutube();
    document.getElementById("elemenus").innerHTML = "Arsip Presentasi";
}

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
});

function createTask(bidang, judul, storageRefA, storageRefB) {
    var uploadTaskA = storageRefA.put(selectedFileA);
    var uploadTaskB = storageRefB.put(selectedFileB);
    uploadTaskA.on('state_changed', function (snapshot) {
    }, function (error) {
        var elem = document.getElementById("progress");
        elem.innerHTML = error;
    }, function () {
        uploadTaskA.snapshot.ref.getDownloadURL().then(function (thumbnail) {
            task(thumbnail)
        });
    });
    function task(thumbnail) {
        uploadTaskB.on('state_changed', function (snapshot) {
        }, function (error) {
            var elem = document.getElementById("progress");
            elem.innerHTML = error;
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
                        readTask();
                    })
                    .catch(err => {
                        var elem = document.getElementById("progress");
                        elem.innerHTML = err;
                    });
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
                <img src=${taskValue.thumbnail}>
            </div>
            <div class="mdl-card__actions">
            <div class="mdl-card__supporting-text mdl-card--border">${taskValue.judul}</div>
            <div class="mdl-card__supporting-text" style="text-align: right; color:rgb(33,150,243) !important">${taskValue.bidang}</div>
            <button onclick='window.open("${taskValue.link}")' class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored"><i class="material-icons">description</i></button>
            <button type="submit" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onclick="deleteTasks(${taskValue.id})"><i class="material-icons">delete_forever</i></button>
            </div>
        </div>
         `;
    });
}

document.getElementById("form2").addEventListener("submit", (e) => {
    var video_id = document.getElementById("video_id").value;
    var video_judul = document.getElementById("video_judul").value;
    e.preventDefault();
    createVideo(video_id, video_judul);
});

function createVideo(video_id, video_judul) {
    counter += 1;
    firebase.database().ref('youtube/' + counter).set({
        id: counter,
        videoJudul: video_judul,
        videoLink: 'https://www.youtube.com/embed/' + video_id + "?rel=0",
        videoThumbnail: 'https://i.ytimg.com/vi/' + video_id + '/hqdefault.jpg'
    });
    var elem = document.getElementById("progressVideo");
    elem.innerHTML = 'Link Initialized';
    fetch('https://transformasi-bapenda.firebaseio.com/youtube.json')
        .then(response => {
            return response.json()
        })
        .then(data => {
            var ObjectOfObjects = data;
            let arrayOfObjects = Object.keys(ObjectOfObjects).map(key => {
                let arrays = ObjectOfObjects[key]
                arrays.key = key
                return arrays
            })
            var keysSorted = arrayOfObjects.sort(function (a, b) { return b.id - a.id; });
            firebase.database().ref("video").set(keysSorted);
            var elem = document.getElementById("progressVideo");
            elem.innerHTML = 'Video Submitted';
        })
        .catch(err => {
            var elem = document.getElementById("progressVideo");
            elem.innerHTML = err
        });
}

function readYoutube() {
    var youtube = firebase.database().ref("youtube/");
    youtube.on("child_added", function (datayt) {
        var ytValue = datayt.val();
        document.getElementById("youtubeContent").innerHTML += `
        <div class="mdl-card mdl-shadow--2dp">
        <div class="mdl-card__title mdl-card--expand">
                <img src="${ytValue.videoThumbnail}">
            </div>
            <div class="mdl-card__actions" style="height: 98px;">
            <div class="mdl-card__supporting-text mdl-card--border" style="margin-bottom: 10px;">${ytValue.videoJudul}</div>
            <button type="submit" class="mdl-button mdl-js-button mdl-button--raised mdl-button--colored" onclick="deleteVideos(${ytValue.id})"><i class="material-icons">delete_forever</i></button>
            </div>
        </div>
         `;
    });
}

function deleteVideo(id) {
    var deleteRef = firebase.database().ref("youtube/" + id);
    deleteRef.remove();
    document.getElementById("youtubeContent").innerHTML = '';
    var elem = document.getElementById("progressVideo");
    elem.innerHTML = 'Link Initialized';
    fetch('https://transformasi-bapenda.firebaseio.com/youtube.json')
        .then(response => {
            return response.json()
        })
        .then(data => {
            var ObjectOfObjects = data;
            let arrayOfObjects = Object.keys(ObjectOfObjects).map(key => {
                let ar = ObjectOfObjects[key]
                ar.key = key
                return ar
            })
            var keysSorted = arrayOfObjects.sort(function (a, b) { return b.id - a.id; });
            firebase.database().ref("video").set(keysSorted);
            var elem = document.getElementById("progressVideo");
            elem.innerHTML = 'Video Deleted Successfully.';
            readYoutube();
        })
        .catch(err => {
            var elem = document.getElementById("progressVideo");
            elem.innerHTML = err;
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
                elem.innerHTML = error;
            });
            var thumbRef = snapshot.child("thumbnail").val();
            var thumbDel = firebase.storage().refFromURL(thumbRef);
            thumbDel.delete().then(function () {
                var elem = document.getElementById("progress");
                elem.innerHTML = 'Image Deleted Successfully.';
            }).catch(function (error) {
                var elem = document.getElementById("progress");
                elem.innerHTML = error;
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
            elem.innerHTML = err;
        });
}

var inputpass = document.getElementById("password_field");
inputpass.addEventListener("keyup", function (event) {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.getElementById("submitted").click();
    }
});

firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
        document.getElementById("user_div").style.display = "block";
        document.getElementById("youtube_div").style.display = "none";
        document.getElementById("login_div").style.display = "none";
        document.getElementsByTagName("body")[0].style.background = "#ffffff";

        var user = firebase.auth().currentUser;

        if (user != null) {

            var email_id = user.email;
            document.getElementById("user_para").innerHTML = email_id;

        }

    } else {
        document.getElementById("user_div").style.display = "none";
        document.getElementById("youtube_div").style.display = "none";
        document.getElementById("login_div").style.display = "block";
        document.getElementsByTagName("body")[0].style.background = "radial-gradient(circle, #039BE5, #01579b)";

    }
});

function login() {

    var userEmail = document.getElementById("email_field").value;
    var userPass = document.getElementById("password_field").value;

    firebase.auth().signInWithEmailAndPassword(userEmail, userPass).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;

        window.alert("Error : " + errorMessage);
    });

}

function logout() {
    firebase.auth().signOut();
}