// Speak function
function speak(text, locale = 'en-GB') {
    if ('speechSynthesis' in window) {
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = locale;
        speechSynthesis.speak(utterance);
        addReply("Jarvis: " + text);
    }
}

// Add reply to panel
function addReply(message) {
    const panel = document.getElementById("responsePanel");
    const div = document.createElement("div");
    div.classList.add("reply");
    div.textContent = message;
    panel.appendChild(div);
}

// Handle command
function handleCommand(text) {
    addReply("You: " + text);
    if (text.includes("time")) {
        const now = new Date();
        speak("The time is " + now.toLocaleTimeString());
    } else {
        speak("I am not sure about that.");
    }
}

// Normal mic listening
function onMic() {
    if (!('webkitSpeechRecognition' in window)) {
        alert("Speech recognition not supported");
        return;
    }
    const rec = new webkitSpeechRecognition();
    rec.lang = "en-IN";
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = function (event) {
        let text = event.results[0][0].transcript.toLowerCase();
        handleCommand(text);
    };
    rec.start();
}


// Mic button click
document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("micButton").addEventListener("click", onMic);
    startWakeWordListener();
});
