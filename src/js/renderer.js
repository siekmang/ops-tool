// @ts-check

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('output-modal');
  const box = document.getElementById('output-box');

  /** Helper to show data
   * @param {string} data - The stringified data to be shown, result of a command
   */
  function showOutput(data) {
    if (!modal || !box)
      throw new Error('Necessary components missing for showing output.');

    modal.style.display = 'block';
    box.innerText += data;

    box.scrollTop = box.scrollHeight;

    // Verify what's happening
    console.log(
      'Box Height:',
      box.scrollHeight,
      'Scroll Position:',
      box.scrollTop
    );
  }

  function closeModal() {
    const modal = document.getElementById('output-modal');
    const box = document.getElementById('output-box');

    if (!modal || !box)
      throw new Error('Necessary components missing for showing output.');

    modal.style.display = 'none';
    box.innerText = ''; // This wipes the logs clean
  }

  // @ts-expect-error trying to protect from a null that won't happen
  document.getElementById('close-button').addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.style.display === 'block') {
      closeModal();
    }
  });

  // Listen for success output
  window.electronApi.onOutput((data) => showOutput(data));

  // LISTEN FOR ERRORS TOO!
  window.electronApi.onError((data) => showOutput(data));
});
