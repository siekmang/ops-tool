document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('output-modal');
  const box = document.getElementById('output-box');

  let date;

  /** Helper to show data
   * @param {string} data - The stringified data to be shown, result of a command
   */
  function showOutput(data) {
    if (!modal || !box)
      throw new Error('Necessary components missing for showing output.');

    modal.style.display = 'block';
    box.innerText += data;

    box.scrollTop = box.scrollHeight;

    // Verify what's happening
    console.log(
      'Box Height:',
      box.scrollHeight,
      'Scroll Position:',
      box.scrollTop
    );
  }

  function closeModal() {
    const modal = document.getElementById('output-modal');
    const box = document.getElementById('output-box');

    if (!modal || !box)
      throw new Error('Necessary components missing for showing output.');

    modal.style.display = 'none';
    box.innerText = ''; // This wipes the logs clean
  }

  document.getElementById('close-button').addEventListener('click', closeModal);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.style.display === 'block') {
      closeModal();
    }
  });

  function getLastWorkDay() {
    const d = new Date();
    let dayOffset = 1;
    if (d.getDay() === 1) dayOffset = 3;
    if (d.getDay() === 0) dayOffset = 2;
    d.setDate(d.getDate() - dayOffset);
    return d.toISOString();
  }

  window.electronApi.onOutput((data) => showOutput(data));
  window.electronApi.onError((data) => showOutput(data));

  document.getElementById('log-faq').addEventListener('click', () => {
    date = new Date().toLocaleString();
    const dialog = document.getElementById('input-dialog');
    dialog.showModal(); // This opens the <dialog> as a modal
  });

  document.getElementById('cancel-btn').addEventListener('click', () => {
    document.getElementById('input-dialog').close();
  });

  document.getElementById('input-form').addEventListener('submit', (e) => {
    e.preventDefault(); // Stop form submission

    const formData = {
      date: date,
      asker: document.getElementById('asker').value,
      ask: document.getElementById('query').value,
      answer: document.getElementById('answer').value,
      topic: document.getElementById('domain').value,
      labor: document.getElementById('effort').value,
    };

    console.log('Form Data:', formData);
    // TODO Save this to a JSON somewhere that will sync across my devices

    document.getElementById('input-dialog').close();
    date = '';
  });

  /** This is the daily sync function. It pulls tasks from Todoist and makes them editable in a format that is close to how I would send them in Teams. */
  document.getElementById('daily-sync').addEventListener('click', async () => {
    const config = await window.electronApi.getConfig();
    const syncModal = document.getElementById('sync-modal');
    const syncEditor = document.getElementById('sync-editor');

    const apiKey = config.TODOIST_API_TOKEN;
    const projectId = config.TODOIST_PROJECT_ID;
    const lastWorkDay = getLastWorkDay();
    const now = new Date().toISOString();

    console.log('apiKey: ', apiKey);
    console.log('projectId: ', projectId);

    try {
      // Get completed tasks
      const completedRes = await fetch(
        `https://api.todoist.com/api/v1/tasks/completed/by_completion_date?project_id=${projectId}&since=${lastWorkDay}&until=${now}`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      // Get today's tasks
      const todayRes = await fetch(
        `https://api.todoist.com/api/v1/tasks/filter?query=%23Work%20%26%20today`,
        { headers: { Authorization: `Bearer ${apiKey}` } }
      );

      if (!completedRes.ok || !todayRes.ok) {
        throw new Error(
          `API failed: ${completedRes.status} ${todayRes.status}`
        );
      }

      const completedData = await completedRes.json();

      const todayData = await todayRes.json();

      const completedTitles =
        completedData.results?.map((t) => t.content).join(', ') || '';
      const todayTitles =
        todayData.results?.map((t) => t.content).join(', ') || '';

      // Update the existing textarea
      syncEditor.value = `Yesterday: ${completedTitles}\n\nToday: ${todayTitles}`;

      // Show the dialog
      syncModal.showModal();
    } catch (err) {
      console.error(err);
      alert('Failed to sync. Check console for details.');
    }
  });

  document.getElementById('copy-btn').addEventListener('click', () => {
    const text = document.getElementById('sync-editor').value;
    navigator.clipboard.writeText(text);
  });

  document.getElementById('done-btn').addEventListener('click', () => {
    document.getElementById('sync-modal').close();
  });

  document
    .getElementById('course-reset')
    .addEventListener('click', async () => {
      const config = await window.electronApi.getConfig();
      const apiKey = config.CANVAS_ACCESS_TOKEN;
      let selectedCourse;
      let selectedSource;

      // Step 1: Choose which course to reset
      const courseChoice = await new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.innerHTML = `
        <div style="padding: 20px;">
          <p>Which course do you want to reset?</p>
          <button onclick="this.parentElement.parentElement.remove(); window.courseReset_resolve('8061526')">TEST 101</button>
          <button onclick="this.parentElement.parentElement.remove(); window.courseReset_resolve('8045765')">TEST 505</button>
        </div>
      `;
        window.courseReset_resolve = resolve;
        document.body.appendChild(modal);
      });

      selectedCourse = courseChoice;
      const selectedCourseName =
        selectedCourse === '8061526' ? 'TEST 101' : 'TEST 505';

      // Step 2: Choose import source based on course
      // TODO Fix to map them to their id
      const sources =
        selectedCourse === '8061526'
          ? ['EVPC102', 'Custom ID']
          : ['PROF505', 'Custom ID'];

      const sourceChoice = await new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.innerHTML = `
        <div style="padding: 20px;">
          <p>Where do you want to import from?</p>
          ${sources.map((s) => `<button onclick="this.parentElement.parentElement.remove(); window.courseReset_resolve('${s}')">${s}</button>`).join('')}
        </div>
      `;
        window.courseReset_resolve = resolve;
        document.body.appendChild(modal);
      });

      selectedSource = sourceChoice;

      // Handle custom ID
      if (selectedSource === 'Custom ID') {
        selectedSource = prompt('Enter course ID:');
        if (!selectedSource) return;
      }

      // Step 3: Reset and import
      try {
        console.log(`Resetting ${selectedCourseName}...`);

        // TODO: Reset endpoint
        // const resetRes = await fetch(`YOUR_CANVAS_API/courses/{courseId}/reset`, {
        //   method: 'POST',
        //   headers: { Authorization: `Bearer ${apiKey}` }
        // });

        console.log(`Importing from ${selectedSource}...`);

        // TODO: Import endpoint
        // const importRes = await fetch(`YOUR_CANVAS_API/courses/{courseId}/import`, {
        //   method: 'POST',
        //   headers: { Authorization: `Bearer ${apiKey}` },
        //   body: JSON.stringify({ source_course_id: selectedSource })
        // });

        console.log('✓ Complete!');

        const openBrowser = confirm('Open in browser?');
        if (openBrowser) {
          window.electronApi.openLink(
            `https://canvas.instructure.com/courses/TEST${selectedCourse}`
          );
        }
      } catch (err) {
        console.error('Reset failed:', err);
        alert('Failed to reset course. Check console.');
      }
    });
});
