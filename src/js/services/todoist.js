export function getLastWorkDay() {
  const d = new Date();
  let dayOffset = 1;

  if (d.getDay() === 1) dayOffset = 3;
  if (d.getDay() === 0) dayOffset = 2;

  d.setDate(d.getDate() - dayOffset);
  d.setHours(7, 0, 0, 0);

  return d.toISOString();
}

export async function fetchDailySyncText({
  apiKey,
  projectId,
  fetchImpl = fetch,
}) {
  if (!apiKey || !projectId) {
    throw new Error('Missing Todoist configuration.');
  }

  const lastWorkDay = getLastWorkDay();
  const now = new Date().toISOString();

  const completedRes = await fetchImpl(
    `https://api.todoist.com/api/v1/tasks/completed/by_completion_date?project_id=${projectId}&since=${lastWorkDay}&until=${now}`,
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  const todayRes = await fetchImpl(
    'https://api.todoist.com/api/v1/tasks/filter?query=%23Work%20%26%20today',
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  if (!completedRes.ok || !todayRes.ok) {
    throw new Error(`API failed: ${completedRes.status} ${todayRes.status}`);
  }

  const [completedData, todayData] = await Promise.all([
    completedRes.json(),
    todayRes.json(),
  ]);

  const completedTitles =
    completedData.results?.map((task) => task.content).join(', ') || '';
  const todayTitles =
    todayData.results?.map((task) => task.content).join(', ') || '';

  return {
    completedTitles,
    todayTitles,
    text: `Yesterday: ${completedTitles}\n\nToday: ${todayTitles}`,
  };
}
