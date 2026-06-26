import { dialog } from 'electron/main';

export function logFaq() {
  dialog.showMessageBox({
    type: 'info',
    title: 'Log FAQ is working.',
    message: 'Log FAQ is working.',
    buttons: ['OK'],
  });
}
