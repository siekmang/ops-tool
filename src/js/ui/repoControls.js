const RECENT_REPOS_KEY = 'ops-tool.recent-repos';
const MAX_RECENT_REPOS = 8;

function loadRecentRepos() {
  try {
    const raw = localStorage.getItem(RECENT_REPOS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveRecentRepos(paths) {
  localStorage.setItem(RECENT_REPOS_KEY, JSON.stringify(paths));
}

function rememberRepoPath(path) {
  const normalized = path.trim();
  if (!normalized) return loadRecentRepos();

  const next = [
    normalized,
    ...loadRecentRepos().filter((entry) => entry !== normalized),
  ].slice(0, MAX_RECENT_REPOS);

  saveRecentRepos(next);
  return next;
}

function renderRecentRepos(select) {
  const recents = loadRecentRepos();
  select.replaceChildren();

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = recents.length ? 'Recent repos' : 'No recent repos';
  select.appendChild(placeholder);

  recents.forEach((repoPath) => {
    const option = document.createElement('option');
    option.value = repoPath;
    option.textContent = repoPath;
    select.appendChild(option);
  });
}

export function bindRepoControls({
  input,
  recentSelect,
  browseButton,
  openIdeButton,
  statusButton,
  openInIde,
  runCommand,
  pickDirectory,
}) {
  if (
    !(input instanceof HTMLInputElement) ||
    !(recentSelect instanceof HTMLSelectElement) ||
    !(browseButton instanceof HTMLElement) ||
    !(openIdeButton instanceof HTMLElement) ||
    !(statusButton instanceof HTMLElement) ||
    typeof openInIde !== 'function' ||
    typeof runCommand !== 'function' ||
    typeof pickDirectory !== 'function'
  ) {
    throw new Error('Repo control bindings are missing.');
  }

  renderRecentRepos(recentSelect);

  recentSelect.addEventListener('change', () => {
    if (recentSelect.value) {
      input.value = recentSelect.value;
    }
  });

  browseButton.addEventListener('click', async () => {
    const selectedPath = await pickDirectory();
    if (!selectedPath) return;

    input.value = selectedPath;
    renderRecentRepos(recentSelect);
    recentSelect.value = selectedPath;
  });

  openIdeButton.addEventListener('click', () => {
    const repoPath = input.value.trim();
    if (!repoPath) return;

    openInIde(repoPath);
    rememberRepoPath(repoPath);
    renderRecentRepos(recentSelect);
    recentSelect.value = repoPath;
  });

  statusButton.addEventListener('click', () => {
    const repoPath = input.value.trim();
    if (!repoPath) return;

    runCommand({
      command: 'git',
      args: ['status'],
      key: repoPath,
    });

    rememberRepoPath(repoPath);
    renderRecentRepos(recentSelect);
    recentSelect.value = repoPath;
  });
}
