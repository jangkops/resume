(function () {
  const typedText = document.getElementById('typedText');
  if (!typedText) return;

  const phrases = [
    'Cloud Architect',
    'Infra / Platform Engineer',
    'DevOps Pipeline Builder',
    'Kubernetes Administrator',
    'AWS Solutions Architect'
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let deleting = false;

  function tick() {
    const phrase = phrases[phraseIndex];
    if (!deleting) {
      charIndex += 1;
      typedText.textContent = phrase.slice(0, charIndex);
      if (charIndex === phrase.length) {
        deleting = true;
        setTimeout(tick, 1100);
        return;
      }
    } else {
      charIndex -= 1;
      typedText.textContent = phrase.slice(0, charIndex);
      if (charIndex === 0) {
        deleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 45 : 95);
  }

  tick();
})();