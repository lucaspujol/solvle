function createOverlay() {
  if (document.getElementById('hello-world-overlay')) {
    return;
  }

  const overlay = document.createElement('div');
  overlay.id = 'hello-world-overlay';

  const text = document.createElement('div');
  text.textContent = 'Hello World!';

  const button = document.createElement('button');
  button.textContent = 'Log Message';
  button.id = 'log-button';
  button.addEventListener('click', function() {
    console.log('Button clicked from Firefox extension!');
    console.log('Current page:', window.location.href);
  });

  overlay.appendChild(text);
  overlay.appendChild(button);
  document.body.appendChild(overlay);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createOverlay);
} else {
  createOverlay();
}