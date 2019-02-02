let updateTrainButton = $("#updateTrains");
let trainName;
let destination;
let frequency;
let firstArrival;
let now = moment();
const trainData = $("#trainData");
const currentTime = $("#currentTime");
// let dropdownFilled = false;
// var provider = new firebase.auth.GithubAuthProvider();
// Initialize Firebase
var config = {
  apiKey: "AIzaSyBqqVykbzogd6LI1YTGO6PmUbuH3VzsiZE",
  authDomain: "traintracker-e3faf.firebaseapp.com",
  databaseURL: "https://traintracker-e3faf.firebaseio.com",
  projectId: "traintracker-e3faf",
  storageBucket: "traintracker-e3faf.appspot.com",
  messagingSenderId: "416740466914"
};
firebase.initializeApp(config);
const database = firebase.database();

//initialize Materialize form
M.AutoInit();
$(".select-dropdown").on("contentChanged", function(event) {
    $(this).formSelect();
});

var uiConfig = {
    callbacks: {
        signInSuccessWithAuthResult: function(authResult, redirectUrl) {
          // User successfully signed in.
          return redirectUrl;
          // Return type determines whether we continue the redirect automatically
          // or whether we leave that to developer to handle.
          return true;
        },
        uiShown: function() {
          // The widget is rendered.
          // Hide the loader.
          document.getElementById('loader').style.display = 'none';
        }
      },
      // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
      signInFlow: 'redirect',
    signInSuccessUrl: '<url-to-redirect-to-on-success>',
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    //   firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    //   firebase.auth.TwitterAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
    //   firebase.auth.EmailAuthProvider.PROVIDER_ID,
    //   firebase.auth.PhoneAuthProvider.PROVIDER_ID,
    //   firebaseui.auth.AnonymousAuthProvider.PROVIDER_ID
    ],
    // tosUrl and privacyPolicyUrl accept either url string or a callback
    // function.
    // Terms of service url/callback.
    tosUrl: '<your-tos-url>',
    // Privacy policy url/callback.
    privacyPolicyUrl: function() {
      window.location.assign('<your-privacy-policy-url>');
    }
  };

  // Initialize the FirebaseUI Widget using Firebase.
  var ui = new firebaseui.auth.AuthUI(firebase.auth());
  // The start method will wait until the DOM is loaded.
  ui.start('#firebaseui-auth-container', uiConfig);




// var instance = M.Dropdown.getInstance();

  
// $(document).on("click", ".select-dropdown", function(event) {
//       console.log(event);
//       if (dropdownFilled == false) {
//         for (i=1; i<=60; i++) {
//          let option = $("<option>").attr("value", i).text(i);
//          $(".select-dropdown").append(option);
//         }  
//       };
//       $(".select-dropdown").trigger("contentChanged");
//       dropdownFilled = true;
//   });
const validateForm = (trainName, destination, frequency, firstArrival) => {
    if ($("input").val() === "") {
            M.toast({html: "Please fill out each item in the form to add a train.", classes: "red rounded", displayLength: 1000*5})
        } else if ($("input").val()) {
            database.ref("/trains").push({
                trainName: trainName,
                destination: destination,
                frequency: frequency,
                trainArrival: firstArrival,
            });
        }
};

const displayCurrentTime = () => {
    setTimeout(function(event) {
        currentTime.text(moment().format("dddd, MMMM Do YYYY, HH:mm:ss"));
        displayCurrentTime();
    },1000)
};
displayCurrentTime();

updateTrainButton.click(function(event) {
    trainName = $("#trainName").val().trim();
    destination = $("#destination").val().trim();
    frequency = $("#frequency").val().trim();
    firstArrival = $("#firstTrain").val().trim();
    validateForm(trainName, destination, frequency, firstArrival);
});

const trainArrival = (trainFirst, trainFrequency) => {
    // console.log(trainFirst, trainFrequency); //without the "Subtract a year" the time was off by a few minutes
    let start = moment(trainFirst, "HH:mm").subtract(1, "years");

    let currentTime = moment();
    // console.log("current time: " + moment(currentTime).format("hh:mm"));
    // console.log("Tfrequency " + trainFrequency);
    let timeDiff = moment().diff(moment(start), "minutes");

    // console.log("Time diff " + moment(timeDiff).format("HH:mm"));
    let remainingTime = timeDiff % trainFrequency;

    let untilArrival = trainFrequency - remainingTime;
    let nextTrain = moment().add(untilArrival, "minutes");
    
    let untilNextTrain = moment().to(nextTrain);
    return untilNextTrain;
};

// console.log(trainArrival("01:33", "17"));

const timeToArrival = (trainFirst, trainFrequency) => {
    // console.log(trainFirst, trainFrequency); //without the "Subtract a year" the time was off by a few minutes
    let start = moment(trainFirst, "HH:mm").subtract(1, "years");

    // console.log("current time: " + moment(currentTime).format("hh:mm"));
    // console.log("Tfrequency " + trainFrequency);
    let timeDiff = moment().diff(moment(start), "minutes");

    // console.log("Time diff " + moment(timeDiff).format("HH:mm"));
    let remainingTime = timeDiff % trainFrequency;

    // console.log("Remaining time " + remainingTime);
    let untilArrival = trainFrequency - remainingTime;
    return untilArrival;
};
// console.log(timeToArrival("01:33", "17"));

const populateTrains = () => {
    database.ref("/trains").on("value", function(snapshot) {
        data = snapshot.val();
        Object.keys(data).forEach(function(elem) {
        let newRow = $("<tr>");
        let addTrainName = $("<td>").text(data[elem].trainName);
        let addDestination = $("<td>").text(data[elem].destination);
        let addfrequency = $("<td>").text(data[elem].frequency);
        let addArrival = $("<td>").text(trainArrival(data[elem].trainArrival, data[elem].frequency));
        let addMinutesAway = $("<td>").text(timeToArrival(data[elem].trainArrival, data[elem].frequency));
        newRow.append(addTrainName, addDestination, addfrequency, addArrival, addMinutesAway);
        trainData.append(newRow);    
        });
    });
};

const getData = () => {
    setTimeout(function() {
        console.log("PING!");
        trainData.empty();
        getData();
        populateTrains();
    }, 1000)
};
getData();