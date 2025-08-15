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

  // Simple TTS wrapper (Cordova plugin)
  async function speak(text, locale) {
    if (!text) return;
    try {
      if (window.TTS && TTS.speak) {
        await TTS.speak({ text, locale: locale || 'en-IN', rate: 1.0 });
      } else if ('speechSynthesis' in window) {
        // Fallback for browser preview (not used in Cordova build)
        const u = new SpeechSynthesisUtterance(text);
        u.lang = locale || 'en-IN';
        window.speechSynthesis.speak(u);
      } else {
        log('TTS not available');
      }
    } catch (e) {
      log('TTS error: ' + e);
    }
  }

  // Recognize voice using cordova-plugin-speechrecognition
  function startListening(lang) {
    return new Promise((resolve, reject) => {
      const plugin = window.plugins && window.plugins.speechRecognition;
      if (!plugin) {
        log('SpeechRecognition plugin missing. Did you add cordova-plugin-speechrecognition?');
        return reject(new Error('plugin-missing'));
      }
      plugin.startListening(
        (matches) => resolve(matches),
        (err) => reject(err),
        {
          language: lang || 'en-IN', // try 'hi-IN' for Hindi
          matches: 1,
          prompt: 'Speak your command…',
          showPopup: true,
          showPartial: false
        }
      );
    });
  }

  async function ensurePermissions() {
    const plugin = window.plugins && window.plugins.speechRecognition;
    if (!plugin) return false;
    return new Promise((resolve) => {
      plugin.hasPermission((has) => {
        if (has) return resolve(true);
        plugin.requestPermission(() => resolve(true), () => resolve(false));
      }, () => resolve(false));
    });
  }

  function handleCommand(raw) {
    const cmd = (raw || '').toLowerCase().trim();
    heard.textContent = 'Heard: ' + cmd;
    log('> ' + cmd);

    // Basic intents
    if (cmd.includes('open youtube') || cmd.includes('youtube kholo') || cmd.includes('youtube')) {
      openLink('https://www.youtube.com/');
      speak('Opening YouTube', 'en-IN');
      return;
    }

    // search intent (English)
    if (cmd.startsWith('search ') || cmd.startsWith('google ')) {
      const q = cmd.replace(/^search\s+|^google\s+/,'').trim();
      if (q) {
        openLink('https://www.google.com/search?q=' + encodeURIComponent(q));
        speak('Searching Google for ' + q, 'en-IN');
        return;
      }
    }

    // search intent (Hindi: "google par ... search karo")
    if (cmd.includes('google par') && cmd.includes('search')) {
      const q = cmd.replace(/^.*google par\s*/,'').replace(/\s*search.*$/,'').trim();
      if (q) {
        openLink('https://www.google.com/search?q=' + encodeURIComponent(q));
        speak('Google par ' + q + ' search kar raha hoon', 'hi-IN');
        return;
      }
    }

    if (cmd.includes('time') || cmd.includes('samay')) {
      const now = new Date();
      const say = now.toLocaleTimeString();
      speak('Time is ' + say, 'en-IN');
      return;
    }

    // default
    speak('Sorry, I did not understand.', 'en-IN');
  }

  function openLink(url) {
    try {
      if (window.cordova && cordova.InAppBrowser) {
        cordova.InAppBrowser.open(url, '_system');
      } else {
        window.open(url, '_blank');
      }
    } catch (e) {
      window.open(url, '_blank');
    }
  }

  async function onMic() {
    heard.textContent = 'Listening…';
    try {
      const ok = await ensurePermissions();
      if (!ok) {
        await speak('Microphone permission required');
        return;
      }
      const matches = await startListening('en-IN'); // change to 'hi-IN' for Hindi default
      const text = (matches && matches[0]) || '';
      handleCommand(text);
    } catch (e) {
      log('Listen error: ' + e);
      speak('Sorry, I could not hear you', 'en-IN');
    }
  }

  function onStop() {
    const plugin = window.plugins && window.plugins.speechRecognition;
    if (plugin && plugin.stopListening) plugin.stopListening(()=>{},()=>{});
  }

  function onRun() {
    handleCommand(textCmd.value);
  }

  document.addEventListener('deviceready', () => {
    log('Device ready.');
  }, false);

  micBtn.addEventListener('click', onMic);
  stopBtn.addEventListener('click', onStop);
  runBtn.addEventListener('click', onRun);
})();
