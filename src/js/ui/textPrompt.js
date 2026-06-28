export function showTextPrompt({
  dialog,
  title,
  input,
  form,
  cancelButton,
  message,
  placeholder = '',
  value = '',
}) {
  return new Promise((resolve) => {
    if (
      !(dialog instanceof HTMLDialogElement) ||
      !(input instanceof HTMLInputElement) ||
      !(form instanceof HTMLFormElement) ||
      !(cancelButton instanceof HTMLElement) ||
      !title
    ) {
      throw new Error('Text prompt dialog is missing.');
    }

    title.textContent = message;
    input.placeholder = placeholder;
    input.value = value;

    let settled = false;
    const finish = (result) => {
      if (settled) return;
      settled = true;
      resolve(result);
    };

    const handleCancel = () => {
      finish(null);
      dialog.close();
    };
    dialog.addEventListener('cancel', handleCancel, { once: true });

    const handleSubmit = (event) => {
      event.preventDefault();
      finish(input.value.trim());
      dialog.close();
    };

    const handleClick = () => {
      finish(null);
      dialog.close();
    };

    form.addEventListener('submit', handleSubmit, { once: true });
    cancelButton.addEventListener('click', handleClick, { once: true });

    if (dialog.open) dialog.close();
    dialog.showModal();
    input.focus();
    input.select();
  });
}
