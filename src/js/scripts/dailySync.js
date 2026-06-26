import { dialog } from 'electron/main';

export function dailySync() {
  dialog.showMessageBox({
    type: 'info',
    title: 'Daily sync is working.',
    message: 'Daily sync is working.',
    buttons: ['OK'],
  });
}
