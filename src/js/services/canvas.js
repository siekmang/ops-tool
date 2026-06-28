export async function resetAndImportCourse({
  canvasApiLink,
  apiKey,
  targetCourseName,
  sourceCourseName,
  fetchImpl = fetch,
}) {
  if (!canvasApiLink || !apiKey || !targetCourseName || !sourceCourseName) {
    throw new Error('Missing Canvas configuration.');
  }

  const baseUrl = canvasApiLink.replace(/\/$/, '');
  const targetCourseId = ''; // TODO Implement a find course by name using Canvas API
  const sourceCourseId = ''; // TODO Implement a find course by name using Canvas API

  if (!targetCourseId || !sourceCourseId) {
    throw new Error('Could not resolve one or more Canvas course IDs.');
  }

  const resetRes = await fetchImpl(
    `${baseUrl}/courses/${targetCourseId}/reset_content`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'OpsTool/1.0.0 (Greg Siekman; opstool@siekmang.com)',
      },
    }
  );

  if (!resetRes.ok) {
    throw new Error('Reset failed');
  }

  const refreshedTargetCourseId = ''; // TODO Implement a find course by name using Canvas API
  if (!refreshedTargetCourseId) {
    throw new Error('Could not re-resolve the target course after reset.');
  }

  const importRes = await fetchImpl(
    `${baseUrl}/courses/${refreshedTargetCourseId}/content_migrations`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'OpsTool/1.0.0 (Greg Siekman; opstool@siekmang.com)',
      },
      body: JSON.stringify({
        migration_type: 'course_copy_importer',
        settings: {
          source_course_id: sourceCourseId,
        },
      }),
    }
  );

  if (!importRes.ok) {
    throw new Error('Import failed');
  }

  return {
    targetCourseId: refreshedTargetCourseId,
    sourceCourseId,
  };
}
