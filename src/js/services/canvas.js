export async function resetAndImportCourse({
  canvasApiLink,
  apiKey,
  targetCourseId,
  targetCourseName,
  sourceCourseId,
  resolveCourseIdByName,
  fetchImpl = fetch,
}) {
  if (
    !canvasApiLink ||
    !apiKey ||
    !targetCourseId ||
    !sourceCourseId ||
    typeof resolveCourseIdByName !== 'function'
  ) {
    throw new Error('Missing Canvas configuration.');
  }

  const baseUrl = canvasApiLink.replace(/\/$/, '');

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

  const resetData = await resetRes.json();
  const newCourseId = resetData.id || targetCourseId;

  const importRes = await fetchImpl(
    `${baseUrl}/courses/${newCourseId}/content_migrations`,
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

  console.log('Import result: ', importRes);

  if (!importRes.ok) {
    throw new Error('Import failed');
  }

  return {
    targetCourseId: newCourseId,
    sourceCourseId,
  };
}

export async function getCourseCandidatesByName(
  courseName,
  canvasApiLink,
  apiKey
) {
  try {
    const response = await fetch(
      `${canvasApiLink}/api/v1/courses?search_term=${encodeURIComponent(courseName)}&per_page=100`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (!response.ok) throw new Error(`Canvas API error: ${response.status}`);

    const courses = await response.json();
    return courses.map((course) => ({
      id: course.id,
      name: course.name,
      courseCode: course.course_code,
    }));
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return [];
  }
}
