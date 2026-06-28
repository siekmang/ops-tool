export async function saveToLog(formData) {
  if (!window.electronApi?.saveToLog) {
    throw new Error('Save-to-log bridge is missing.');
  }

  const result = await window.electronApi.saveToLog(formData);

  return result;
}
