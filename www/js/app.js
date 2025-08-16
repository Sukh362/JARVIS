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

  let firstTap = true;

  async function speak(text, locale) {
    if (!text) return;
    try {
      if (window.TTS && TTS.speak) {
        await TTS.speak({ text, locale: locale || 'en-IN', rate: 1.0 });
      } else if ('speechSynthesis' in window) {
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

  function startListening(lang) {
    return new Promise((resolve, reject) => {
      const plugin = window.plugins && window.plugins.speechRecognition;
      if (!plugin) {
        log('SpeechRecognition plugin missing.');
        return reject(new Error('plugin-missing'));
      }
      plugin.startListening(
        (matches) => resolve(matches),
        (err) => reject(err),
        {
          language: lang || 'en-IN',
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

    // -------------------------
    // Battery Check
    // -------------------------
    if (cmd.includes('battery') || cmd.includes('kitni battery')) {
      if(navigator.getBattery){
        navigator.getBattery().then(function(battery){
          let level = Math.floor(battery.level * 100);
          speak('Aapke phone me ' + level + ' percent battery bachi hai', 'hi-IN');
        });
      } else {
        speak('Battery info is not available on this device', 'hi-IN');
      }
      return;
    }

    // -------------------------
    // Open App Feature
    // -------------------------
    if(cmd.startsWith('open ')){
      const appName = cmd.replace('open ','').trim();
      openApp(appName);
      return;
    }

    // -------------------------
    // Open YouTube / Google Search
    // -------------------------
    if (cmd.includes('open youtube') || cmd.includes('youtube kholo') || cmd.includes('youtube')) {
      openLink('https://www.youtube.com/');
      speak('Opening YouTube', 'en-IN');
      return;
    }

    if (cmd.startsWith('search ') || cmd.startsWith('google ')) {
      const q = cmd.replace(/^search\s+|^google\s+/,'').trim();
      if (q) {
        openLink('https://www.google.com/search?q=' + encodeURIComponent(q));
        speak('Searching Google for ' + q, 'en-IN');
        return;
      }
    }

    if (cmd.includes('google par') && cmd.includes('search')) {
      const q = cmd.replace(/^.*google par\s*/,'').replace(/\s*search.*$/,'').trim();
      if (q) {
        openLink('https://www.google.com/search?q=' + encodeURIComponent(q));
        speak('Google par ' + q + ' search kar raha hoon', 'hi-IN');
        return;
      }
    }

    // Time
    if (cmd.includes('time') || cmd.includes('samay')) {
      const now = new Date();
      const say = now.toLocaleTimeString();
      speak('Time is ' + say, 'en-IN');
      return;
    }

    // Default
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

  // -------------------------
  // Open App Function
  // -------------------------
  function openApp(appName){
    if(!window.appAvailability){
      speak('App availability plugin not installed', 'en-IN');
      return;
    }

    // Mapping app name to package ids (Android)
    const apps = {
      'whatsapp': 'com.whatsapp',
      'instagram': 'com.instagram.android',
      'facebook': 'com.facebook.katana',
      'youtube': 'com.google.android.youtube',
      'gmail': 'com.google.android.gm',
      'maps': 'com.google.android.apps.maps'
      // Add more apps as needed
    };

    const packageId = apps[appName.toLowerCase()];
    if(!packageId){
      speak('App not found', 'en-IN');
      return;
    }

    appAvailability.check(
      packageId, 
      function() { 
        // App installed
        if(window.cordova && cordova.InAppBrowser){
          cordova.InAppBrowser.open('intent://#Intent;package='+packageId+';end', '_system');
        } else {
          speak('Cannot open app in browser', 'en-IN');
        }
      },
      function() { 
        // App not installed
        speak('App not found', 'en-IN');
      }
    );
  }

  async function onMic() {
    if(firstTap){
      speak('I am Jarvis, how can I help you?', 'en-IN');
      firstTap = false;
    }

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
    
