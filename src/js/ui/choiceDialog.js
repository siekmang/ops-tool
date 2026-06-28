export async function showChoiceModal({
  dialog,
  title,
  optionContainer,
  message,
  options,
}) {
  return new Promise((resolve) => {
    if (!(dialog instanceof HTMLDialogElement)) {
      throw new Error('Choice dialog is missing.');
    }

    if (!title || !optionContainer) {
      throw new Error('Choice dialog content is missing.');
    }

    title.textContent = message;
    optionContainer.replaceChildren();

    let settled = false;
    const finish = (value) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    const handleCancel = () => finish(null);
    dialog.addEventListener('cancel', handleCancel, { once: true });

    options.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = option.label;
      button.addEventListener('click', () => {
        finish(option.value);
        dialog.close();
      });
      optionContainer.appendChild(button);
    });

    if (dialog.open) dialog.close();
    dialog.showModal();
  });
}
