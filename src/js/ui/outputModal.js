export function createOutputModal({ modal, box, closeButton }) {
  if (!(modal instanceof HTMLElement) || !(box instanceof HTMLElement)) {
    throw new Error('Output modal is missing required elements.');
  }

  const close = () => {
    modal.style.display = 'none';
    box.textContent = '';
  };

  const show = (data) => {
    modal.style.display = 'block';
    box.textContent += data;
    box.scrollTop = box.scrollHeight;
  };

  closeButton?.addEventListener('click', close);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'block') {
      close();
    }
  });

  return { show, close };
}
