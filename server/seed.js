import 'dotenv/config';
import db from './db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const hash = (pw) => bcrypt.hashSync(pw, 10);
const uid = () => crypto.randomUUID();

console.log('Seeding database...');

// Clear existing data
db.exec(`
  DELETE FROM completed_paths;
  DELETE FROM badges;
  DELETE FROM quiz_results;
  DELETE FROM lesson_progress;
  DELETE FROM invitations;
  DELETE FROM users;
  DELETE FROM pending_organizations;
  DELETE FROM organizations;
`);

// Organizations
const orgs = [
  {
    id: 'org-001', name: 'Acme Technologies Ltd', partner_id: 'NBS-NG-2026-001',
    rc_number: 'RC-123456', state: 'Lagos', phone: '+234 801 234 5678',
    tier: 'Gold', status: 'active', enrollment_date: '2026-01-15',
    public_profile: 1, specializations: JSON.stringify(['Cloud Migration Specialist']),
  },
  {
    id: 'org-002', name: 'DataStream Solutions', partner_id: 'NBS-NG-2026-002',
    rc_number: 'RC-789012', state: 'Abuja', phone: '+234 802 345 6789',
    tier: 'Registered', status: 'active', enrollment_date: '2026-03-01',
    public_profile: 0, specializations: JSON.stringify([]),
  },
  {
    id: 'org-003', name: 'CloudFirst Nigeria', partner_id: 'NBS-NG-2026-003',
    rc_number: 'RC-345678', state: 'Lagos', phone: '+234 803 456 7890',
    tier: 'Platinum', status: 'active', enrollment_date: '2025-11-10',
    public_profile: 1, specializations: JSON.stringify(['Cloud Migration Specialist', 'Security Practice Certified']),
  },
];

const insertOrg = db.prepare(`
  INSERT INTO organizations (id, name, partner_id, rc_number, country, state, phone, tier, status, enrollment_date, public_profile, specializations)
  VALUES (@id, @name, @partner_id, @rc_number, 'Nigeria', @state, @phone, @tier, @status, @enrollment_date, @public_profile, @specializations)
`);

for (const org of orgs) insertOrg.run(org);

// Pending Organizations
const pendingOrgs = [
  {
    id: 'org-pending-001', name: 'TechVentures Africa', rc_number: 'RC-999888',
    contact_name: 'Adebayo Ogunleye', contact_email: 'adebayo@techventures.ng',
    phone: '+234 809 876 5432', state: 'Lagos', estimated_staff: 8,
    submitted_date: '2026-04-10', status: 'pending',
  },
  {
    id: 'org-pending-002', name: 'Greenfield IT Services', rc_number: 'RC-555666',
    contact_name: 'Ngozi Okafor', contact_email: 'ngozi@greenfieldit.com',
    phone: '+234 807 654 3210', state: 'Enugu', estimated_staff: 5,
    submitted_date: '2026-04-11', status: 'pending',
  },
];

const insertPending = db.prepare(`
  INSERT INTO pending_organizations (id, name, rc_number, contact_name, contact_email, phone, country, state, estimated_staff, submitted_date, status)
  VALUES (@id, @name, @rc_number, @contact_name, @contact_email, @phone, 'Nigeria', @state, @estimated_staff, @submitted_date, @status)
`);

for (const po of pendingOrgs) insertPending.run(po);

// Users (password: "demo" for all)
const users = [
  {
    id: 'user-001', org_id: 'org-001', name: 'Chinedu Okeke',
    email: 'chinedu@acmetech.ng', password_hash: hash('demo'),
    role: 'org_admin', role_category: 'Technical', status: 'active',
    joined_date: '2026-01-15', last_active: '2026-04-12', learning_streak: 12,
  },
  {
    id: 'user-002', org_id: 'org-001', name: 'Amaka Nwosu',
    email: 'amaka@acmetech.ng', password_hash: hash('demo'),
    role: 'user', role_category: 'Sales', status: 'active',
    joined_date: '2026-01-20', last_active: '2026-04-11', learning_streak: 5,
  },
  {
    id: 'user-003', org_id: 'org-001', name: 'Emeka Eze',
    email: 'emeka@acmetech.ng', password_hash: hash('demo'),
    role: 'user', role_category: 'Presales', status: 'active',
    joined_date: '2026-02-05', last_active: '2026-04-10', learning_streak: 0,
  },
  {
    id: 'user-004', org_id: 'org-002', name: 'Fatima Bello',
    email: 'fatima@datastream.ng', password_hash: hash('demo'),
    role: 'org_admin', role_category: 'Sales', status: 'active',
    joined_date: '2026-03-01', last_active: '2026-04-12', learning_streak: 3,
  },
  {
    id: 'user-super', org_id: null, name: 'Nobus Admin',
    email: 'admin@nobus.io', password_hash: hash('admin123'),
    role: 'super_admin', role_category: null, status: 'active',
    joined_date: '2025-01-01', last_active: '2026-04-12', learning_streak: 0,
  },
];

const insertUser = db.prepare(`
  INSERT INTO users (id, org_id, name, email, password_hash, role, role_category, status, joined_date, last_active, learning_streak)
  VALUES (@id, @org_id, @name, @email, @password_hash, @role, @role_category, @status, @joined_date, @last_active, @learning_streak)
`);

for (const u of users) insertUser.run(u);

// Badges
const insertBadge = db.prepare(`INSERT INTO badges (user_id, badge_name) VALUES (?, ?)`);
insertBadge.run('user-001', 'NCS Associate');
insertBadge.run('user-002', 'Sales Certified');

// Completed paths
const insertPath = db.prepare(`INSERT INTO completed_paths (user_id, path_id) VALUES (?, ?)`);
insertPath.run('user-001', 'technical-enablement');
insertPath.run('user-002', 'sales-enablement');

// Add some lesson progress for user-002 (completed sales path)
const salesLessons = [
  'sales-m1-l1','sales-m1-l2','sales-m1-l3',
  'sales-m2-l1','sales-m2-l2',
  'sales-m3-l1','sales-m3-l2',
  'sales-m4-l1','sales-m4-l2',
];
const insertLesson = db.prepare(`INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id) VALUES (?, ?)`);
for (const lid of salesLessons) insertLesson.run('user-002', lid);

// Add quiz results for user-002
const insertQuiz = db.prepare(`INSERT INTO quiz_results (user_id, quiz_id, score, total, passed) VALUES (?, ?, ?, ?, ?)`);
insertQuiz.run('user-002', 'quiz-sales-m1', 3, 3, 1);
insertQuiz.run('user-002', 'quiz-sales-m2', 2, 2, 1);
insertQuiz.run('user-002', 'quiz-sales-m3', 2, 2, 1);
insertQuiz.run('user-002', 'quiz-sales-m4', 3, 3, 1);

console.log('Seed complete!');
console.log(`  ${orgs.length} organizations`);
console.log(`  ${pendingOrgs.length} pending applications`);
console.log(`  ${users.length} users`);
console.log('');
console.log('Demo accounts:');
console.log('  admin@nobus.io / admin123  (Super Admin)');
console.log('  chinedu@acmetech.ng / demo  (Org Admin - Acme)');
console.log('  amaka@acmetech.ng / demo    (User - Acme, Sales)');
console.log('  fatima@datastream.ng / demo  (Org Admin - DataStream)');
