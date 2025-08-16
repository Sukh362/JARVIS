(function(){
  const micBtn = document.getElementById('micBtn');
  const stopBtn = document.getElementById('stopBtn');
  const runBtn = document.getElementById('runBtn');
  const textCmd = document.getElementById('textCmd');
  const heard = document.getElementById('heard');
  const logEl = document.getElementById('log');

  const log = (msg) => {
    console.log(msg);
    logEl.textContent = (logEl.textContent + '\n' + msg).trim();
  };

          // =====================
// Jarvis App.js Full Integration
// =====================

// ---------------------
// Voice Recognition Setup
// ---------------------
var recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'hi-IN'; // Hindi
recognition.continuous = false;

// ---------------------
// Audio / Music Setup
// ---------------------
var songs = [
    "https://www.example.com/song1.mp3",
    "https://www.example.com/song2.mp3",
    "https://www.example.com/song3.mp3"
];
var audio = document.getElementById("myAudio");

// ---------------------
// Shuffle & Play Music
// ---------------------
function shuffleAll() {
    var randomIndex = Math.floor(Math.random() * songs.length);
    audio.src = songs[randomIndex];
    audio.play();
    speakText("Ab music baj raha hai: " + songs[randomIndex].split("/").pop());
}

// ---------------------
// Text-to-Speech Function
// ---------------------
function speakText(msg) {
    let speech = new SpeechSynthesisUtterance(msg);
    window.speechSynthesis.speak(speech);
}

// ---------------------
// Battery Info Function
// ---------------------
function speakBattery(level) {
    let msg = "Aapke phone me " + level + " percent battery bachi hai";
    speakText(msg);
}

function getBatteryStatus() {
    navigator.getBattery().then(function(battery) {
        let level = Math.floor(battery.level * 100);
        speakBattery(level);
    });
}

// ---------------------
// Voice Command Handler
// ---------------------
recognition.onresult = function(event) {
    var command = event.results[0][0].transcript.toLowerCase();

    // 🔋 Battery Command
    if(command.includes("battery") || command.includes("kitni battery")) {
        getBatteryStatus();
    }
    // 🎵 Shuffle / Play Music
    else if(command.includes("play music") || command.includes("shuffle all")) {
        shuffleAll();
    }
    // 👋 Jarvis Greeting Example
    else if(command.includes("hello") || command.includes("namaste")) {
        speakText("Namaste! Main aapki kaise madad kar sakta hoon?");
    }
    // 🌐 Open YouTube Example
    else if(command.includes("open youtube")) {
        window.open("https://www.youtube.com", "_blank");
        speakText("YouTube khol diya");
    }
    // ❌ Add more Jarvis commands here as needed
};

// ---------------------
// Start Listening Function
// ---------------------
function startListening() {
    recognition.start();
}

// ---------------------
// Auto Start on Page Load
// ---------------------
window.onload = function() {
    startListening();
};
                                 
