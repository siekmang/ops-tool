import { dialog } from 'electron/main';

export function resetTest() {
  dialog.showMessageBox({
    type: 'info',
    title: 'Reset test is working.',
    message: 'Reset test is working.',
    buttons: ['OK'],
  });
}
