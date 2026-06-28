import { resetAndImportCourse } from '../services/canvas.js';
import { showChoiceModal } from '../ui/choiceDialog.js';
import { showTextPrompt } from '../ui/textPrompt.js';

const COURSES = [
  {
    name: 'DEV_TEST101',
    sources: [
      { label: 'DEV_EVPC102', value: 'DEV_EVPC102' },
      { label: 'DEV_UG_Template', value: 'DEV_UG_Template' },
      { label: 'Custom Source', value: 'custom' },
    ],
  },
  {
    name: 'DEV_TEST505',
    sources: [
      { label: 'DEV_PROF505', value: 'DEV_PROF505' },
      { label: 'DEV_GRAD_TEMPLATE', value: 'DEV_GRAD_TEMPLATE' },
      { label: 'Custom Source', value: 'custom' },
    ],
  },
];

export function bindCourseReset({
  button,
  dialog,
  title,
  optionContainer,
  sourceDialog,
  sourceTitle,
  sourceForm,
  sourceInput,
  sourceCancelButton,
  getConfig,
  resolveCourseIdByName,
  openLink,
}) {
  if (
    !(button instanceof HTMLElement) ||
    !(dialog instanceof HTMLDialogElement) ||
    !(title instanceof HTMLElement) ||
    !(optionContainer instanceof HTMLElement) ||
    !(sourceDialog instanceof HTMLDialogElement) ||
    !(sourceTitle instanceof HTMLElement) ||
    !(sourceForm instanceof HTMLFormElement) ||
    !(sourceInput instanceof HTMLInputElement) ||
    !(sourceCancelButton instanceof HTMLElement) ||
    typeof getConfig !== 'function' ||
    typeof resolveCourseIdByName !== 'function' ||
    typeof openLink !== 'function'
  ) {
    throw new Error('Course reset button is missing.');
  }

  button.addEventListener('click', async () => {
    const config = await getConfig();

    const courseName = await showChoiceModal({
      dialog,
      title,
      optionContainer,
      message: 'Which course?',
      options: COURSES.map((course) => ({
        label: course.name,
        value: course.name,
      })),
    });
    if (!courseName) return;

    const selectedCourseData = COURSES.find(
      (course) => course.name === courseName
    );
    if (!selectedCourseData) return;

    const sourceChoice = await showChoiceModal({
      dialog,
      title,
      optionContainer,
      message: 'Import from?',
      options: selectedCourseData.sources,
    });
    if (!sourceChoice) return;

    const sourceCourseName =
      sourceChoice === 'custom'
        ? await showTextPrompt({
            dialog: sourceDialog,
            title: sourceTitle,
            input: sourceInput,
            form: sourceForm,
            cancelButton: sourceCancelButton,
            message: 'Enter source course name',
            placeholder: 'Course name',
          })
        : sourceChoice;
    if (!sourceCourseName) return;

    try {
      console.log(
        `Resetting ${selectedCourseData.name} and importing from ${sourceCourseName}...`
      );

      const { targetCourseId } = await resetAndImportCourse({
        canvasApiLink: config.CANVAS_API_LINK,
        apiKey: config.CANVAS_ACCESS_TOKEN,
        targetCourseName: courseName,
        sourceCourseName,
        resolveCourseIdByName,
      });

      console.log('✓ Complete!');

      if (confirm('Open in browser?')) {
        openLink(`https://canvas.instructure.com/courses/${targetCourseId}`);
      }
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Failed to reset course. Check console.');
    }
  });
}
