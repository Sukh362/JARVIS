// Flag for greeting
let jarvisGreeted = false;

// Run once when device is ready
document.addEventListener("deviceready", function () {
    if (!jarvisGreeted) {
        speak('I am Jarvis, how can I help you?', 'en-GB');
        jarvisGreeted = true;
    }
}, false);

// Mic button click
document.getElementById("micButton").addEventListener("click", function () {
    requestMicPermissionAndListen();
});

// Request mic permission
function requestMicPermissionAndListen() {
    if (!window.plugins || !window.plugins.speechRecognition) {
        console.error("SpeechRecognition plugin not available.");
        speak("Speech recognition is not available on this device", 'en-GB');
        return;
    }

    window.plugins.speechRecognition.hasPermission(function (isGranted) {
        if (!isGranted) {
            window.plugins.speechRecognition.requestPermission(function () {
                startListening();
            }, function (err) {
                console.error("Permission denied:", err);
                speak("Microphone permission denied", 'en-GB');
            });
        } else {
            startListening();
        }
    }, function (err) {
        console.error("Permission check failed:", err);
    });
}

// Start listening
function startListening() {
    window.plugins.speechRecognition.startListening(function (matches) {
        console.log('User said:', matches);
        if (matches.length > 0) {
            let text = matches[0];
            handleCommand(text); // तुम्हारे app का existing command handler
        }
    }, function (err) {
        console.error("Listening error:", err);
        speak("Sorry, I could not hear you", 'en-GB');
    }, {
        language: "en-IN", // 'hi-IN' अगर Hindi चाहिए
        matches: 1,
        prompt: "Listening...",
        showPopup: true
    });
}

// Speak function (TTS)
function speak(text, locale = 'en-GB') {
    return new Promise((resolve, reject) => {
        if (window.TTS) {
            window.TTS.speak({
                text: text,
                locale: locale,
                rate: 1.0
            }, resolve, reject);
        } else if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = locale;
            speechSynthesis.speak(utterance);
            resolve();
        } else {
            console.warn("No TTS engine available");
            resolve();
        }
    });
}
