export const SITE_URL = 'https://maksymkorchynskyi.github.io/veritas-extension-project/';

const REPO = 'https://github.com/MaksymKorchynskyi/veritas-extension-project';

export const LINKS = {
  repo: REPO,
  readme: `${REPO}#readme`,
  readmeUk: `${REPO}/blob/HEAD/README.uk.md`,
  quickStart: `${REPO}#quick-start`,
  api: `${REPO}#api`,
  scoring: `${REPO}#scoring-model`,
  benchmarks: `${REPO}#benchmarks`,
  limitations: `${REPO}#limitations`,
  contributing: `${REPO}#contributing`,
  issues: `${REPO}/issues`,
  license: `${REPO}/blob/HEAD/LICENSE`,
  scoringSource: `${REPO}/blob/HEAD/backend/app/services/scoring.py`,
} as const;

export const CLONE_COMMAND = `git clone ${REPO}.git`;

/** In-page anchors, shared by the header and the footer. */
export const NAV = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#scoring', label: 'Scoring' },
  { href: '#quick-start', label: 'Quick start' },
] as const;
