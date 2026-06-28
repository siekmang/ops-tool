export function bindFaqDialog({
  openButton,
  dialog,
  cancelButton,
  form,
  fields,
  onSubmit,
  getDate = () => new Date().toLocaleString(),
}) {
  if (!(dialog instanceof HTMLDialogElement)) {
    throw new Error('FAQ dialog is missing.');
  }

  if (!form || !openButton || !cancelButton) {
    throw new Error('FAQ dialog bindings are missing.');
  }

  let date = '';

  openButton.addEventListener('click', () => {
    date = getDate();
    dialog.showModal();
  });

  cancelButton.addEventListener('click', () => {
    dialog.close();
    date = '';
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const data = {
      date,
      asker: fields.asker.value,
      ask: fields.query.value,
      answer: fields.answer.value,
      topic: fields.domain.value,
      labor: fields.effort.value,
    };

    onSubmit(data)
      .then(() => {
        form.reset();
        dialog.close();
        date = '';
      })
      .catch((error) => {
        console.error(error);
      });
  });
}
