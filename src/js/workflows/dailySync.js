import { fetchDailySyncText } from '../services/todoist.js';

export function bindDailySync({
  button,
  modal,
  editor,
  copyButton,
  doneButton,
  getConfig,
}) {
  if (
    !(button instanceof HTMLElement) ||
    !(modal instanceof HTMLDialogElement) ||
    !(editor instanceof HTMLTextAreaElement) ||
    !(copyButton instanceof HTMLElement) ||
    !(doneButton instanceof HTMLElement) ||
    typeof getConfig !== 'function'
  ) {
    throw new Error('Daily sync bindings are missing.');
  }

  button.addEventListener('click', async () => {
    try {
      const config = await getConfig();
      const { text } = await fetchDailySyncText({
        apiKey: config.TODOIST_API_TOKEN,
        projectId: config.TODOIST_PROJECT_ID,
      });

      editor.value = text;
      modal.showModal();
    } catch (error) {
      console.error(error);
      alert('Failed to sync. Check console for details.');
    }
  });

  copyButton.addEventListener('click', async () => {
    await navigator.clipboard.writeText(editor.value);
  });

  doneButton.addEventListener('click', () => {
    modal.close();
  });
}
