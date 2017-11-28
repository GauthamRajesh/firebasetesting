var user;
var config = {
  apiKey: "AIzaSyDCUVgvbrvXT7YdlQ-odDSj20pedLPF-j4",
  authDomain: "webhosting-e5933.firebaseapp.com",
  databaseURL: "https://webhosting-e5933.firebaseio.com",
  projectId: "webhosting-e5933",
  storageBucket: "webhosting-e5933.appspot.com",
  messagingSenderId: "387634382023"
};
firebase.initializeApp(config);
window.onGoogleYoloLoad = (googleyolo) => {
  console.log("Library Ready");
};
FB.init({
  appId      : '299948567076900',
  status     : true,
  xfbml      : true,
  version    : 'v2.6'
});
FB.Event.subscribe('auth.authResponseChange', checkLoginState);
function checkLoginState(event) {
  if(event.authResponse) {
      var unsubscribe = firebase.auth().onAuthStateChanged(function(firebaseUser) {
      unsubscribe();
      if(!isUserEqual(event.authResponse, firebaseUser)) {
        var credential = firebase.auth.FacebookAuthProvider.credential(
            event.authResponse.accessToken);
        firebaseSignIn(credential);
      } else {
        user = firebaseUser;
        addToDatabase(user);
        window.location.href = "../index.html";
      }
    });
  } else {
    firebase.auth().signOut();
  }
}
function isUserEqual(facebookAuthResponse, firebaseUser) {
  if(firebaseUser) {
    var providerData = firebaseUser.providerData;
    for(var i = 0; i < providerData.length; i++) {
      if(providerData[i].providerId === firebase.auth.FacebookAuthProvider.PROVIDER_ID &&
          providerData[i].uid === facebookAuthResponse.userID) {
        return true;
      }
    }
  }
  return false;
}
function loginGoogle() {
  const retrievePromise = googleyolo.retrieve({
      supportedAuthMethods: [
          "https://accounts.google.com"
      ],
      supportedIdTokenProviders: [{
          uri: "https://accounts.google.com",
          clientId: "387634382023-kk7u0neve684nh3vh6po3qad1bb329qb.apps.googleusercontent.com"
      }]
  });
  retrievePromise.then((credential) => {
      var credentialFirebase = firebase.auth.GoogleAuthProvider.credential(
          credential.idToken);
      firebaseSignIn(credentialFirebase);
  }, (error) => {
    if(error.type === 'noCredentialsAvailable') {
        googleyoloHint();
    }
  });
}
function googleyoloHint() {
  const hintPromise = googleyolo.hint({
      supportedAuthMethods: [
          "https://accounts.google.com"
      ],
      supportedIdTokenProviders: [{
          uri: "https://accounts.google.com",
          clientId: "387634382023-kk7u0neve684nh3vh6po3qad1bb329qb.apps.googleusercontent.com"
      }]
  });
  hintPromise.then((credential) => {
    if(credential.idToken) {
      var credentialFirebase = firebase.auth.GoogleAuthProvider.credential(
          credential.idToken);
      firebaseSignIn(credentialFirebase);
    }
  }, (error) => {
    switch (error.type) {
      case "noCredentialsAvailable":
        manualGoogleSignIn();
        break;
      default:
        break;
    }
  });
}
function firebaseSignIn(credential) {
  console.log("Entering firebaseSignIn");
  firebase.auth().signInWithCredential(credential).then(function(userCredential) {
    console.log(userCredential);
    addToDatabase(userCredential);
  }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      console.log(error);
  });
}
function manualGoogleSignIn() {
  console.log("Entering method");
  var provider = new firebase.auth.GoogleAuthProvider();
  firebase.auth().signInWithRedirect(provider);
  firebase.auth().getRedirectResult().then(function(result) {
    if(result.credential) {
      var token = result.credential.accessToken;
      console.log("Successful");
      user = result.user;
      addToDatabase(user);
      window.location.href = "../index.html";
    } else {
      console.log("An error");
    }
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      var email = error.email;
      var credential = error.credential;
      console.error(error);
    });
}
function loginFacebook() {
  FB.login(function(response) {
    if(response.status === 'connected') {
      console.log("Successful");
    }
  });
}
function addToDatabase(user) {
  console.log("Entering addToDatabase");
  var name = user.displayName;
  var email = user.email;
  var uid = user.uid;
  console.log(user);
  firebase.database().ref('users/' + uid).set({
    username: name,
    email: email
  }).then(function() {
    console.log("successful adding to firebase");
  }).catch(function(error) {
    console.error(error);
  });
}
function signOut() {
  console.log(user);
  var providerData = user.providerData;
  for(var i = 0; i < providerData.length; i++) {
    if(providerData[i].providerId === firebase.auth.FacebookAuthProvider.PROVIDER_ID) {
      FB.api('/me/permissions', 'DELETE', function(response) {
        if(response == true) {
            console.log("Revoked permissions");
        } else {
          console.log("Error");
        }
      });
      firebase.auth().signOut().then(function() {
        console.log("Sign out facebook successful");
        FB.logout(function(response) {
          console.log("Facebook completely signed out");
        });
      }).catch(function(error) {
        console.log(error);
      });
    } else if(providerData[i].providerId === firebase.auth.GoogleAuthProvider.PROVIDER_ID) {
      firebase.auth().signOut().then(function() {
        console.log("Sign out successful");
        googleyolo.disableAutoSignIn().then(() => {
          console.log("even more successful");
        });
      }).catch(function(error) {
        console.log(error);
      });
    }
  }
}
function loginGithub() {
  var provider = new firebase.auth.GithubAuthProvider();
  provider.addScope('read:user');
  firebase.auth().signInWithPopup(provider).then(function(result) {
    var token = result.credential.accessToken;
    var secret = result.credential.secret;
    user = result.user;
    console.log(user);
    addToDatabase(user);
  }).catch(function(error) {
    console.log(error);
  });
}
