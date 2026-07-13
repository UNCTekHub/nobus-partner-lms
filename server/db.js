import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbDir = path.join(__dirname, 'data');
if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true });

const dbPath = process.env.DB_PATH || path.join(dbDir, 'lms.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    partner_id TEXT UNIQUE,
    rc_number TEXT NOT NULL,
    country TEXT DEFAULT 'Nigeria',
    state TEXT,
    phone TEXT,
    tier TEXT DEFAULT 'Registered',
    status TEXT DEFAULT 'active',
    enrollment_date TEXT,
    public_profile INTEGER DEFAULT 0,
    specializations TEXT DEFAULT '[]',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pending_organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    rc_number TEXT NOT NULL,
    contact_name TEXT NOT NULL,
    contact_email TEXT NOT NULL,
    phone TEXT,
    country TEXT DEFAULT 'Nigeria',
    state TEXT,
    estimated_staff INTEGER DEFAULT 1,
    submitted_date TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'pending',
    reviewed_by TEXT,
    reviewed_at TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    org_id TEXT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    role_category TEXT,
    status TEXT DEFAULT 'active',
    joined_date TEXT DEFAULT (datetime('now')),
    last_active TEXT DEFAULT (datetime('now')),
    learning_streak INTEGER DEFAULT 0,
    FOREIGN KEY (org_id) REFERENCES organizations(id)
  );

  CREATE TABLE IF NOT EXISTS lesson_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    completed_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, lesson_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS quiz_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    quiz_id TEXT NOT NULL,
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    passed INTEGER NOT NULL,
    completed_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    badge_name TEXT NOT NULL,
    earned_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, badge_name),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS completed_paths (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    path_id TEXT NOT NULL,
    completed_at TEXT DEFAULT (datetime('now')),
    UNIQUE(user_id, path_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS invitations (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    role_category TEXT DEFAULT 'Sales',
    invited_by TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TEXT DEFAULT (datetime('now')),
    expires_at TEXT,
    FOREIGN KEY (org_id) REFERENCES organizations(id),
    FOREIGN KEY (invited_by) REFERENCES users(id)
  );

  -- Password reset tokens
  CREATE TABLE IF NOT EXISTS password_resets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Login attempt tracking (brute-force protection)
  CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    ip_address TEXT,
    success INTEGER DEFAULT 0,
    attempted_at TEXT DEFAULT (datetime('now'))
  );

  -- Audit trail / activity log
  CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT,
    ip_address TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  -- Notifications center
  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Discussion forum
  CREATE TABLE IF NOT EXISTS discussions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    course_id TEXT,
    module_id TEXT,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    pinned INTEGER DEFAULT 0,
    closed INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS discussion_replies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    discussion_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    body TEXT NOT NULL,
    is_answer INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (discussion_id) REFERENCES discussions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Gamification: points and leaderboard
  CREATE TABLE IF NOT EXISTS user_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    action TEXT NOT NULL,
    points INTEGER NOT NULL,
    description TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Content versioning
  CREATE TABLE IF NOT EXISTS content_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id TEXT NOT NULL,
    module_id TEXT,
    lesson_id TEXT,
    field TEXT NOT NULL,
    old_value TEXT,
    new_value TEXT,
    changed_by TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (changed_by) REFERENCES users(id)
  );

  -- Quiz retake policy
  CREATE TABLE IF NOT EXISTS quiz_policies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    quiz_id TEXT UNIQUE NOT NULL,
    max_attempts INTEGER DEFAULT 3,
    cooldown_hours INTEGER DEFAULT 24,
    updated_by TEXT,
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- SSO / SAML configurations
  CREATE TABLE IF NOT EXISTS sso_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    entity_id TEXT,
    sso_url TEXT,
    certificate TEXT,
    enabled INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (org_id) REFERENCES organizations(id)
  );

  -- API keys for public API
  CREATE TABLE IF NOT EXISTS api_keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id TEXT NOT NULL,
    key_hash TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    permissions TEXT DEFAULT '["read"]',
    last_used TEXT,
    expires_at TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (org_id) REFERENCES organizations(id)
  );

  -- User profile extended fields
  CREATE TABLE IF NOT EXISTS user_profiles (
    user_id TEXT PRIMARY KEY,
    phone TEXT,
    job_title TEXT,
    bio TEXT,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'Africa/Lagos',
    language TEXT DEFAULT 'en',
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Deal registration (channel conflict protection)
  CREATE TABLE IF NOT EXISTS deals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id TEXT NOT NULL,
    submitted_by TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT,
    customer_industry TEXT,
    opportunity_name TEXT NOT NULL,
    description TEXT,
    services TEXT DEFAULT '[]',
    est_value INTEGER DEFAULT 0,
    expected_close_date TEXT,
    status TEXT DEFAULT 'pending',
    duplicate_of INTEGER,
    protection_expires TEXT,
    rejection_reason TEXT,
    reviewed_by TEXT,
    reviewed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (org_id) REFERENCES organizations(id),
    FOREIGN KEY (submitted_by) REFERENCES users(id)
  );

  -- Sales navigator: pipeline leads
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    org_id TEXT NOT NULL,
    created_by TEXT NOT NULL,
    company TEXT NOT NULL,
    contact_name TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    industry TEXT,
    stage TEXT DEFAULT 'lead',
    est_value INTEGER DEFAULT 0,
    services TEXT DEFAULT '[]',
    next_action TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (org_id) REFERENCES organizations(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
  );

  -- Sales navigator: activity notes on leads
  CREATE TABLE IF NOT EXISTS lead_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    note TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (lead_id) REFERENCES leads(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  -- Marketing materials library
  CREATE TABLE IF NOT EXISTS marketing_assets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_type TEXT,
    tags TEXT DEFAULT '[]',
    downloads INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Content hub: whitepapers, datasheets, case studies, FAQs
  CREATE TABLE IF NOT EXISTS content_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    summary TEXT,
    body TEXT,
    file_url TEXT,
    tags TEXT DEFAULT '[]',
    views INTEGER DEFAULT 0,
    active INTEGER DEFAULT 1,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Demo labs catalogue
  CREATE TABLE IF NOT EXISTS demo_labs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    service_area TEXT,
    difficulty TEXT DEFAULT 'Beginner',
    duration_minutes INTEGER DEFAULT 60,
    guide TEXT,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  -- Demo lab bookings
  CREATE TABLE IF NOT EXISTS lab_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lab_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    org_id TEXT,
    scheduled_date TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    status TEXT DEFAULT 'booked',
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (lab_id) REFERENCES demo_labs(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

export default db;
