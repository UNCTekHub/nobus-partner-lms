// Canonical learning-path catalog, server-side source of truth. Kept in lockstep
// with the client course data (src/data/*Course.js ids) and progress.js.
// Lives at server root, NOT server/data/ (that directory is gitignored).

export const PATHS = [
  { id: 'sales-enablement', name: 'Sales Enablement Bootcamp', category: 'Sales' },
  { id: 'presales-enablement', name: 'Presales & Solution Selling', category: 'Presales' },
  { id: 'technical-enablement', name: 'Technical Enablement Bootcamp', category: 'Technical' },
];

export const PATH_IDS = PATHS.map((p) => p.id);

export function pathById(id) {
  return PATHS.find((p) => p.id === id) || null;
}

// lesson_ids are prefixed with the path's first token (sales*/presales*/technical*)
function pathPrefix(pathId) {
  return pathId.split('-')[0];
}

// A user's status for a single path: completed (path certified) > in_progress
// (any lesson started) > not_started. `db` is the better-sqlite3 handle.
export function userPathStatus(db, userId, pathId) {
  const done = db.prepare('SELECT 1 FROM completed_paths WHERE user_id = ? AND path_id = ?').get(userId, pathId);
  if (done) return 'completed';
  const started = db.prepare("SELECT COUNT(*) AS c FROM lesson_progress WHERE user_id = ? AND lesson_id LIKE ?")
    .get(userId, pathPrefix(pathId) + '%').c;
  return started > 0 ? 'in_progress' : 'not_started';
}
