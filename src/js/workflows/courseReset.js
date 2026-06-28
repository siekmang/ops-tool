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
  getCourseCandidatesByName,
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
    typeof getCourseCandidatesByName !== 'function' ||
    typeof resolveCourseIdByName !== 'function' ||
    typeof openLink !== 'function'
  ) {
    throw new Error('Course reset button is missing.');
  }

  const chooseCourseId = async (courseName, promptLabel) => {
    const candidates = await getCourseCandidatesByName(courseName);
    console.log(candidates);

    if (!candidates.length) return null;
    if (candidates.length === 1) return candidates[0].id;

    const choice = await showChoiceModal({
      dialog,
      title,
      optionContainer,
      message: promptLabel,
      options: candidates.map((course) => ({
        label: `${course.name}${course.courseCode ? ` (${course.courseCode})` : ''} [${course.id}]`,
        value: course.id,
      })),
    });

    return choice ?? null;
  };

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

      const targetCourseId = await chooseCourseId(
        courseName,
        'Which course matches the target name?'
      );
      if (!targetCourseId) {
        alert(`Could not find a unique match for "${courseName}".`);
        return;
      }

      const resolvedSourceCourseId = await chooseCourseId(
        sourceCourseName,
        'Which course matches the source name?'
      );
      if (!resolvedSourceCourseId) {
        alert(`Could not find a unique match for "${sourceCourseName}".`);
        return;
      }

      const { targetCourseId: refreshedTargetCourseId } =
        await resetAndImportCourse({
          canvasApiLink: config.CANVAS_API_LINK,
          apiKey: config.CANVAS_ACCESS_TOKEN,
          targetCourseId,
          targetCourseName: courseName,
          sourceCourseId: resolvedSourceCourseId,
          resolveCourseIdByName,
        });

      console.log('✓ Complete!');

      if (confirm('Open in browser?')) {
        openLink(
          `https://unity.instructure.com/courses/${refreshedTargetCourseId}/content_migrations`
        );
      }
    } catch (error) {
      console.error('Reset failed:', error);
      alert('Failed to reset course. Check console.');
    }
  });
}
