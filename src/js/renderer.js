import { createOutputModal } from './ui/outputModal.js';
import { bindFaqDialog } from './ui/faqDialog.js';
import { bindRepoControls } from './ui/repoControls.js';
import { bindDailySync } from './workflows/dailySync.js';
import { bindCourseReset } from './workflows/courseReset.js';
import { saveToLog } from './services/saveToLog.js';

document.addEventListener('DOMContentLoaded', () => {
  const openCourseByName = async (courseName) => {
    const config = await getConfig();
    const candidates =
      await window.electronApi.getCourseCandidatesByName(courseName);

    if (!candidates.length) {
      alert(`Could not find course: ${courseName}`);
      return;
    }

    const courseId = candidates[0].id;
    window.electronApi.openLink(
      `https://unity.instructure.com/courses/${courseId}`
    );
  };

  const outputModal = createOutputModal({
    modal: document.getElementById('output-modal'),
    box: document.getElementById('output-box'),
    closeButton: document.getElementById('close-button'),
  });

  window.electronApi.onOutput(outputModal.show);
  window.electronApi.onError(outputModal.show);

  const getConfig = () => window.electronApi.getConfig();

  const bindButton = (id, handler) => {
    const button = document.getElementById(id);
    if (!button) throw new Error(`Missing button: ${id}`);
    button.addEventListener('click', handler);
  };

  bindButton('lxd-open-ide', () => window.electronApi.openInIde('lxd-tools'));
  bindButton('lxd-open-dir', () => window.electronApi.open('lxd-tools'));
  bindButton('lxd-test', () =>
    window.electronApi.runCommand({
      command: 'npm',
      args: ['test'],
      key: 'lxd-tools',
    })
  );
  bindButton('lxd-build', () =>
    window.electronApi.runCommand({
      command: 'npm',
      args: ['run', 'build:dev'],
      key: 'lxd-tools',
    })
  );
  bindButton('lxd-status', () =>
    window.electronApi.runCommand({
      command: 'git',
      args: ['status'],
      key: 'lxd-tools',
    })
  );
  bindButton('lxd-github', () =>
    window.electronApi.openLink(
      'https://github.com/Unity-Environmental-University/lxd-tools'
    )
  );

  bindRepoControls({
    input: document.getElementById('path'),
    recentSelect: document.getElementById('recent-paths'),
    browseButton: document.getElementById('browse-path'),
    openIdeButton: document.getElementById('repo-open-ide'),
    statusButton: document.getElementById('repo-status'),
    openInIde: window.electronApi.openInIde,
    runCommand: window.electronApi.runCommand,
    pickDirectory: window.electronApi.pickDirectory,
  });
  bindButton('dev-folder', () => window.electronApi.open('dev-folder'));

  bindButton('trello', () =>
    window.electronApi.openLink(
      'https://trello.com/b/XTLJLLI9/agile-learning-tech-board?filter=member:greg_siekman'
    )
  );
  bindButton('todoist', () => window.electronApi.open('todoist'));
  bindButton('course-101', () =>
    openCourseByName(`DEV_TEST101: Greg's Test Course`)
  );
  bindButton('course-505', () => openCourseByName('DEV_TEST505'));

  bindFaqDialog({
    openButton: document.getElementById('log-faq'),
    dialog: document.getElementById('input-dialog'),
    cancelButton: document.getElementById('cancel-btn'),
    form: document.getElementById('input-form'),
    fields: {
      asker: document.getElementById('asker'),
      query: document.getElementById('query'),
      answer: document.getElementById('answer'),
      domain: document.getElementById('domain'),
      effort: document.getElementById('effort'),
    },
    onSubmit: async (formData) => {
      console.log('Form Data:', formData);
      const result = await saveToLog(formData);

      if (result.copiedToClipboard) {
        alert(`${result.message}\n\nThe FAQ entry is on your clipboard.`);
      } else {
        alert(result.message);
      }

      return result;
    },
  });

  bindDailySync({
    button: document.getElementById('daily-sync'),
    modal: document.getElementById('sync-modal'),
    editor: document.getElementById('sync-editor'),
    copyButton: document.getElementById('copy-btn'),
    doneButton: document.getElementById('done-btn'),
    getConfig,
  });

  bindCourseReset({
    button: document.getElementById('course-reset'),
    dialog: document.getElementById('canvas-modal'),
    title: document.getElementById('modal-title'),
    optionContainer: document.getElementById('modal-options'),
    sourceDialog: document.getElementById('source-id-dialog'),
    sourceTitle: document.getElementById('source-id-title'),
    sourceForm: document.getElementById('source-id-form'),
    sourceInput: document.getElementById('source-id-input'),
    sourceCancelButton: document.getElementById('source-id-cancel'),
    getConfig,
    getCourseCandidatesByName: window.electronApi.getCourseCandidatesByName,
    resolveCourseIdByName: window.electronApi.resolveCourseIdByName,
    openLink: window.electronApi.openLink,
  });
});
