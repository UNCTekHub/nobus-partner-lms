import 'dotenv/config';
import db from './db.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const hash = (pw) => bcrypt.hashSync(pw, 10);

console.log('Seeding database...');

// === Portal content (marketing assets, content hub, demo labs) ===
// Platform-level content: seeded whenever the tables are empty, even on existing databases.
function seedPortalContent() {
  const assetCount = db.prepare('SELECT COUNT(*) as count FROM marketing_assets').get().count;
  if (assetCount === 0) {
    const insertAsset = db.prepare(`
      INSERT INTO marketing_assets (title, description, category, file_url, file_type, tags)
      VALUES (@title, @description, @category, @file_url, @file_type, @tags)
    `);
    const assets = [
      { title: 'Nobus Cloud Logo Pack', description: 'Official Nobus logos in PNG and SVG for co-branded material (light and dark variants).', category: 'Logos & Brand', file_url: 'https://nobus.io/', file_type: 'ZIP', tags: JSON.stringify(['brand', 'logo', 'co-branding']) },
      { title: 'Nobus Partner Brand Guidelines', description: 'How to use the Nobus brand in partner marketing: colors, typography, logo clearance.', category: 'Logos & Brand', file_url: 'https://nobus.io/', file_type: 'PDF', tags: JSON.stringify(['brand', 'guidelines']) },
      { title: 'Nobus Cloud Corporate Brochure', description: 'Customer-facing overview of the full Nobus service catalogue with Naira pricing story.', category: 'Brochures', file_url: 'https://nobus.io/documentation/fcs', file_type: 'PDF', tags: JSON.stringify(['overview', 'catalogue']) },
      { title: 'FCS Compute Solution Brief', description: 'Two-pager on Flexible Compute Service: instance families, autoscaling, dedicated hosting, BYOL.', category: 'Brochures', file_url: '/marketing/fcs-compute-solution-brief.pdf', file_type: 'PDF', tags: JSON.stringify(['fcs', 'compute']) },
      { title: 'AWS/Azure vs Nobus Battle Card', description: 'Competitive positioning: Naira billing, zero egress fees, local support, NDPA data residency.', category: 'Battle Cards', file_url: 'https://nobus.io/nobus-pricing-calculator', file_type: 'PDF', tags: JSON.stringify(['competitive', 'aws', 'azure']) },
      { title: 'Security Stack Battle Card', description: 'Selling Sophos XG, FortiGate NGFW and Acronis Cyber Protect on Nobus.', category: 'Battle Cards', file_url: 'https://nobus.io/documentation/cloud-security', file_type: 'PDF', tags: JSON.stringify(['security', 'sophos', 'fortigate', 'acronis']) },
      { title: 'Cloud Migration Email Sequence', description: '5-email nurture campaign template for on-premise to Nobus migration prospects.', category: 'Email Templates', file_url: 'https://nobus.io/', file_type: 'DOCX', tags: JSON.stringify(['email', 'migration', 'nurture']) },
      { title: 'Naira Billing Social Kit', description: 'LinkedIn/X post templates and graphics on the "budget in Naira, pay in Naira" message.', category: 'Social Media', file_url: 'https://nobus.io/', file_type: 'ZIP', tags: JSON.stringify(['social', 'naira', 'billing']) },
      { title: 'Nobus Platform Pitch Deck', description: 'Editable customer presentation: platform overview, services, pricing model, case studies.', category: 'Presentations', file_url: 'https://nobus.io/', file_type: 'PPTX', tags: JSON.stringify(['pitch', 'deck', 'sales']) },
      { title: 'Nobus Pricing Calculator Guide', description: 'Walkthrough deck for building customer cost estimates with the Nobus Pricing Calculator.', category: 'Presentations', file_url: 'https://nobus.io/nobus-pricing-calculator', file_type: 'PDF', tags: JSON.stringify(['pricing', 'calculator', 'tco']) },
    ];
    for (const a of assets) insertAsset.run(a);
    console.log(`  Seeded ${assets.length} marketing assets`);
  }

  // Repoint the FCS brief to the generated branded PDF (idempotent; fixes existing DBs).
  const FCS_BRIEF = '/marketing/fcs-compute-solution-brief.pdf';
  db.prepare("UPDATE marketing_assets SET file_url = ?, file_type = 'PDF', updated_at = datetime('now') WHERE title = 'FCS Compute Solution Brief' AND file_url != ?").run(FCS_BRIEF, FCS_BRIEF);

  const contentCount = db.prepare('SELECT COUNT(*) as count FROM content_items').get().count;
  if (contentCount === 0) {
    const insertContent = db.prepare(`
      INSERT INTO content_items (title, type, summary, body, file_url, tags)
      VALUES (@title, @type, @summary, @body, @file_url, @tags)
    `);
    const items = [
      {
        title: 'Data Sovereignty and NDPA: Why Nigerian Enterprises Are Repatriating Their Cloud',
        type: 'whitepaper',
        summary: 'How NDPA compliance, FX volatility and latency are driving Nigerian banks, fintechs and government agencies to local cloud infrastructure.',
        body: `## Executive Summary\n\nNigerian enterprises face a triple squeeze: **NDPA data-residency expectations**, **dollar-denominated cloud bills** in a volatile FX market, and **latency** to European and US regions. This paper examines how a Tier III, Lagos-hosted cloud addresses all three.\n\n## The FX Problem\n\nA ₦50M annual AWS budget can swing by 20-30% purely on exchange-rate movement. Nobus bills in Naira: the price agreed is the price paid.\n\n## Data Residency\n\nNobus infrastructure is hosted at Rack Centre (Tier III certified), Lagos. Customer data never leaves Nigeria, simplifying NDPA compliance for regulated industries.\n\n## Performance\n\nLagos-hosted workloads serve Nigerian users at single-digit millisecond latency versus 100ms+ to eu-west-1.\n\n## Conclusion\n\nFor workloads serving Nigerian users under Nigerian regulation, local cloud is no longer a compromise - it is the optimum.`,
        file_url: null,
        tags: JSON.stringify(['NDPA', 'data sovereignty', 'compliance', 'whitepaper']),
      },
      {
        title: 'Nobus FCS Datasheet - Flexible Compute Service',
        type: 'datasheet',
        summary: 'Instance families, specifications, autoscaling and pricing for the Nobus Flexible Compute Service.',
        body: `## Nobus Flexible Compute Service (FCS)\n\nResizable compute capacity in the cloud, from ₦9,309/month.\n\n### Instance Families\n\n| Family | vCPU | Memory | Typical Use |\n|---|---|---|---|\n| si.2.x | 2 | 2-8 GiB | Web servers, dev/test |\n| si.4.x | 4 | 4-32 GiB | Enterprise apps, databases |\n| si.8.x | 8 | 16-64 GiB | High performance workloads |\n\nNaming: \`si.<vCPU>.<RAM>.<disk>.<l|w>\` - .30.l = Linux 30 GB, .50.w = Windows 50 GB.\n\n### Key Features\n- Dynamic, predictive and scheduled autoscaling (no extra charge)\n- Nobus Machine Images (Windows managed licensing or BYOL, open-source Linux)\n- FBS block volumes 1 GB - 1 TB, AES-256 encrypted\n- Security groups, floating IPs, availability zones\n- PCI DSS compliant environments supported\n\n### Pricing\n- vCPU unit: ₦93.50 · Memory unit: ₦96.80\n- Pre-billing: charges start at running, stop at shutdown`,
        file_url: 'https://nobus.io/documentation/fcs',
        tags: JSON.stringify(['FCS', 'compute', 'datasheet']),
      },
      {
        title: 'Nobus Storage Datasheet - FBS & FOS',
        type: 'datasheet',
        summary: 'Block storage (FBS) and unlimited object storage (FOS) specifications and Naira pricing.',
        body: `## Flexible Block Storage (FBS)\n\n- Durable block volumes, 1 GB - 1 TB, single-instance attach\n- AES-256 at rest, encrypted in transit, incremental snapshots\n- Resize without downtime; snapshots copy across availability zones\n- **₦120/GB-month** provisioned storage · **₦120/GB-month** snapshots (stored in FOS)\n\n## Flexible Object Storage (FOS)\n\n- Effectively unlimited object storage in containers\n- Per-container access control and logs\n- **₦60/GB** storage (all tiers) · transfer in free · requests ₦2 per 1,000\n\n## Nobus Cloud Backup\n\nAcronis-powered protection for Nobus, on-prem, AWS, Azure, GCP and VMware workloads: ransomware protection, forensic backup, vulnerability scanning, single console.`,
        file_url: 'https://nobus.io/documentation/fbs',
        tags: JSON.stringify(['FBS', 'FOS', 'storage', 'backup', 'datasheet']),
      },
      {
        title: 'Case Study: Fintech Cuts Infrastructure Spend 40% Moving to Nobus',
        type: 'case-study',
        summary: 'A Lagos payments company migrated 60 workloads from AWS to Nobus FCS and eliminated egress fees and FX exposure.',
        body: `## The Customer\n\nA fast-growing Lagos payments processor running 60+ workloads on AWS.\n\n## The Problem\n\n- Monthly AWS bill swinging with the exchange rate\n- Egress fees approaching 18% of total spend\n- NDPA pressure to keep transaction data in Nigeria\n\n## The Solution\n\nPartner-led migration to Nobus FCS with FBS volumes, managed PostgreSQL, Sophos XG perimeter and Site-to-Site VPN to their office network. CloudOrchestration templates automated the environment build.\n\n## The Results\n\n- **40% lower** monthly infrastructure cost\n- **Zero egress fees** - instant saving on every GB served\n- **PCI DSS** compliant environment at Rack Centre Tier III\n- Budget certainty: bills in Naira, no FX exposure`,
        file_url: null,
        tags: JSON.stringify(['case study', 'fintech', 'migration', 'cost savings']),
      },
      {
        title: 'FAQ: Answering the 12 Most Common Customer Objections',
        type: 'faq',
        summary: 'Ready answers for partners: reliability, security, pricing, migration and comparison questions customers ask.',
        body: `## "Is a local cloud as reliable as AWS?"\nNobus runs on OpenStack at Rack Centre, a Tier III certified facility - the same standard trusted by banks and telcos, with redundant power, cooling and network.\n\n## "What if I need to scale suddenly?"\nFCS Autoscaling adds instances automatically (dynamic, predictive or scheduled) at no extra charge.\n\n## "How is my data secured?"\nAES-256 encryption at rest, encrypted transit, security groups, cloud firewalls, plus optional Sophos XG / FortiGate NGFW and Acronis Cyber Protect. ISO 27001 and PCI DSS supported.\n\n## "Can we keep our Microsoft licenses?"\nYes - Dedicated Hosting supports BYOL for Microsoft and Oracle per-socket, per-core and per-VM licenses.\n\n## "What does migration involve?"\nThe FCS Image Import/Export service migrates existing VMs into Nobus Machine Images; certified partners run structured migration engagements.\n\n## "Why not just stay on-premise?"\nCompare a ₦25M hardware refresh plus power, cooling and staff against pay-as-you-use FCS from ₦9,309/month with no upfront commitment.`,
        file_url: null,
        tags: JSON.stringify(['faq', 'objection handling', 'sales']),
      },
      {
        title: 'Reference Architecture: HA Web Application on Nobus',
        type: 'whitepaper',
        summary: 'Blueprint for a highly available web tier: load balancing, autoscaling, FBS-backed databases and floating IPs.',
        body: `## Architecture Overview\n\n\`\`\`\nInternet -> Floating IP -> Load Balancer (HAProxy)\n  -> Autoscaling web tier (FCS si.2.x, 2-10 instances)\n  -> Managed PostgreSQL (FBS-backed, snapshots to FOS)\n\`\`\`\n\n## Components\n\n1. **Floating IP** on the load balancer for failover without DNS changes\n2. **HAProxy** front end with health checks and sticky sessions\n3. **Autoscaling group** across availability zones\n4. **Security groups**: 80/443 public on LB; web tier accepts only LB traffic; DB accepts only web tier\n5. **FBS snapshots** on schedule, stored in FOS, copied cross-zone for DR\n6. **Cloud Firewall** policy in front of the whole data center\n\n## Sizing Guidance\n\nStart si.2.4.30.l per web node, si.4.8.30.l for the database; validate with the Nobus Pricing Calculator.`,
        file_url: 'https://nobus.io/documentation/networking',
        tags: JSON.stringify(['reference architecture', 'HA', 'presales']),
      },
    ];
    for (const c of items) insertContent.run(c);
    console.log(`  Seeded ${items.length} content hub items`);
  }

  const labCount = db.prepare('SELECT COUNT(*) as count FROM demo_labs').get().count;
  if (labCount === 0) {
    const insertLab = db.prepare(`
      INSERT INTO demo_labs (title, description, service_area, difficulty, duration_minutes, guide)
      VALUES (@title, @description, @service_area, @difficulty, @duration_minutes, @guide)
    `);
    const labs = [
      {
        title: 'Deploy Your First FCS Instance',
        description: 'Launch a Linux FCS instance, connect over SSH with a key pair, and attach an FBS volume.',
        service_area: 'Compute', difficulty: 'Beginner', duration_minutes: 60,
        guide: `## Lab Guide\n\n1. Sign in at [dashboard.nobus.io](https://dashboard.nobus.io) with the lab credentials provided.\n2. Create a key pair (Project > Compute > Key Pairs) and download the .pem file.\n3. Launch an instance: choose the **Ubuntu-22.04-64bit** NMI and the **si.2.4.30.l** flavor.\n4. Assign the default security group; add an SSH rule (TCP 22) from your IP.\n5. Associate a Floating IP and connect: \`ssh -i lab.pem ubuntu@<floating-ip>\`.\n6. Create a 10 GB FBS volume and attach it; format and mount it on the instance.\n7. Tear down: detach the volume, release the Floating IP, terminate the instance.`,
      },
      {
        title: 'Configure FOS Backup for a Workload',
        description: 'Create FOS containers, upload objects, and schedule FBS snapshot backups into object storage.',
        service_area: 'Storage & Backup', difficulty: 'Beginner', duration_minutes: 60,
        guide: `## Lab Guide\n\n1. Open the FOS console (Project > Object Store).\n2. Create a container named \`lab-backups\` and set access to private.\n3. Upload a sample file and inspect its metadata.\n4. Snapshot the FBS volume from Lab 1 (Project > Volumes > Create Snapshot).\n5. Verify the snapshot is stored and note the incremental-only billing model (₦120/GB-month).\n6. Restore the snapshot into a new volume and mount it to confirm recovery.`,
      },
      {
        title: 'Set Up a Cloud Firewall and Security Groups',
        description: 'Build a layered network security posture: security groups per tier plus a data-center-wide firewall policy.',
        service_area: 'Networking & Security', difficulty: 'Intermediate', duration_minutes: 90,
        guide: `## Lab Guide\n\n1. Create three security groups: \`web\` (80/443 from 0.0.0.0/0), \`app\` (8080 from web), \`db\` (5432 from app).\n2. Launch one instance in each group and verify connectivity with \`curl\` / \`nc\`.\n3. Create a firewall policy: allow established, deny all inbound except 443, log rejects.\n4. Create a firewall from the policy and bind it to the data center router.\n5. Demonstrate the first-match rule ordering by re-ordering an allow above a deny.\n6. Discussion: when to use security groups vs cloud firewalls vs Sophos XG / FortiGate.`,
      },
      {
        title: 'Site-to-Site VPN with pfSense',
        description: 'Connect a simulated branch office to a Nobus data center over IPsec using the pfSense image.',
        service_area: 'Networking & Security', difficulty: 'Advanced', duration_minutes: 120,
        guide: `## Lab Guide\n\n1. Launch the **pfsense-64bit** image (min 2048 MB RAM, 30 GB disk).\n2. Open security group ports: UDP 500, UDP 4500, ESP, SSH 22, HTTPS 443.\n3. Configure IPsec phase 1 (IKEv2, AES256, SHA2, DH group with PFS) and phase 2 to the peer network.\n4. Bring the tunnel up and verify with ping across the tunnel.\n5. Add a second tunnel and demonstrate ECMP for resiliency.\n6. Discussion: positioning Site-to-Site VPN vs Nobus Fast Transit for enterprise connectivity.`,
      },
      {
        title: 'Deploy a Kubernetes Cluster',
        description: 'Provision a managed Nobus Kubernetes cluster, deploy a sample microservice, and scale it.',
        service_area: 'Containers', difficulty: 'Intermediate', duration_minutes: 120,
        guide: `## Lab Guide\n\n1. Request a managed cluster (3 workers, si.2.4.30.l) via the console.\n2. Download the kubeconfig and verify with \`kubectl get nodes\`.\n3. Deploy the sample app: \`kubectl apply -f https://<lab-repo>/sample-app.yaml\`.\n4. Expose it with a LoadBalancer service and test from the internet.\n5. Scale: \`kubectl scale deploy sample-app --replicas=5\` and watch self-healing by deleting a pod.\n6. Discussion: NKS vs self-managed Kubernetes on FCS; note Floating IPs are not supported on worker nodes.`,
      },
      {
        title: 'Provision a Managed Database (PostgreSQL)',
        description: 'Stand up a managed PostgreSQL service, connect an app, and demonstrate failover and backups.',
        service_area: 'Databases', difficulty: 'Intermediate', duration_minutes: 90,
        guide: `## Lab Guide\n\n1. Request a managed PostgreSQL cluster via the database services console.\n2. Configure the security group so only the app tier can reach 5432.\n3. Connect with \`psql\` and load the sample dataset.\n4. Snapshot the database volume; restore into a second instance.\n5. Review the HA story: automatic failover and replication.\n6. Discussion: engine selection - MSSQL vs MySQL vs PostgreSQL vs MongoDB by workload.`,
      },
      {
        title: 'Automate with CloudOrchestration Templates',
        description: 'Deploy a full application stack (instances, volumes, security groups, floating IP) from a single Heat template.',
        service_area: 'Automation', difficulty: 'Advanced', duration_minutes: 120,
        guide: `## Lab Guide\n\n1. Review the provided Heat template: parameters, resources, outputs.\n2. Launch a stack (Project > Orchestration > Stacks) with rollback-on-failure enabled.\n3. Watch resource creation order and inspect the stack topology.\n4. Update the stack to add a second web instance - observe in-place change.\n5. Delete the stack and confirm all resources are cleaned up.\n6. Discussion: CloudFormation compatibility - running existing AWS IaC on Nobus with minimal changes.`,
      },
    ];
    for (const l of labs) insertLab.run(l);
    console.log(`  Seeded ${labs.length} demo labs`);
  }
}

// Check if data already exists - don't wipe real data
const existingUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;

if (existingUsers > 0) {
  console.log('Database already has data. Ensuring Nobus admin exists...');

  // Always ensure the Nobus super admin exists. Set ADMIN_PASSWORD in server/.env
  // to rotate the credential away from the default in this public repository.
  const adminPassword = process.env.ADMIN_PASSWORD || 'Nobus@2026!';
  const admin = db.prepare('SELECT id FROM users WHERE email = ?').get('admin@nobus.cloud');
  if (!admin) {
    db.prepare(`
      INSERT INTO users (id, org_id, name, email, password_hash, role, role_category, status, joined_date)
      VALUES (?, NULL, ?, ?, ?, 'super_admin', NULL, 'active', datetime('now'))
    `).run('user-nobus-admin', 'Nobus Cloud Admin', 'admin@nobus.cloud', hash(adminPassword));
    console.log('Created Nobus admin: admin@nobus.cloud');
  } else if (process.env.ADMIN_PASSWORD) {
    db.prepare('UPDATE users SET password_hash = ? WHERE email = ?')
      .run(hash(process.env.ADMIN_PASSWORD), 'admin@nobus.cloud');
    console.log('Nobus admin password rotated from ADMIN_PASSWORD env.');
  } else {
    console.log('Nobus admin already exists.');
  }

  seedPortalContent();
  console.log('Seed complete (preserved existing data).');
  process.exit(0);
}

// === First-time seed: populate with demo data ===

// Create Nobus Cloud as the platform organization
db.prepare(`
  INSERT INTO organizations (id, name, partner_id, rc_number, country, state, phone, tier, status, enrollment_date, public_profile, specializations)
  VALUES (?, ?, ?, ?, 'Nigeria', ?, ?, 'Elite', 'active', ?, 1, ?)
`).run(
  'org-nobus', 'Nobus Cloud', 'NBS-NG-2025-000', 'RC-000001',
  'Lagos', '+234 800 000 0001', '2025-01-01',
  JSON.stringify(['Cloud Infrastructure', 'Platform Management'])
);

// Demo partner organizations
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

// Pending Organizations (demo)
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

// Users
const users = [
  // === NOBUS SUPER ADMIN - the real platform admin ===
  {
    id: 'user-nobus-admin', org_id: null, name: 'Nobus Cloud Admin',
    email: 'admin@nobus.cloud', password_hash: hash('Nobus@2026!'),
    role: 'super_admin', role_category: null, status: 'active',
    joined_date: '2025-01-01', last_active: '2026-04-13', learning_streak: 0,
  },
  // === Demo partner users ===
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

// Portal content: marketing assets, content hub, demo labs
seedPortalContent();

// Demo pipeline leads for Acme Technologies
const insertLead = db.prepare(`
  INSERT INTO leads (org_id, created_by, company, contact_name, contact_email, industry, stage, est_value, services, next_action)
  VALUES (@org_id, @created_by, @company, @contact_name, @contact_email, @industry, @stage, @est_value, @services, @next_action)
`);
const demoLeads = [
  { org_id: 'org-001', created_by: 'user-002', company: 'Zenith Microfinance', contact_name: 'Tunde Adewale', contact_email: 'tunde@zenithmfb.ng', industry: 'Financial Services', stage: 'proposal', est_value: 4500000, services: JSON.stringify(['FCS', 'FBS', 'Sophos XG']), next_action: 'Present TCO comparison vs AWS on Friday' },
  { org_id: 'org-001', created_by: 'user-002', company: 'Lagos Retail Group', contact_name: 'Bisi Ojo', contact_email: 'bisi@lagosretail.com', industry: 'Retail', stage: 'qualified', est_value: 2200000, services: JSON.stringify(['FCS', 'Autoscaling', 'Load Balancing']), next_action: 'Schedule discovery call with IT manager' },
  { org_id: 'org-001', created_by: 'user-003', company: 'EduTech Nigeria', contact_name: 'Kemi Balogun', contact_email: 'kemi@edutech.ng', industry: 'Education', stage: 'lead', est_value: 900000, services: JSON.stringify(['FOS', 'Cloud Backup']), next_action: 'Send FOS datasheet' },
  { org_id: 'org-001', created_by: 'user-002', company: 'SwiftPay Solutions', contact_name: 'Ibrahim Musa', contact_email: 'ibrahim@swiftpay.ng', industry: 'Fintech', stage: 'won', est_value: 6800000, services: JSON.stringify(['FCS', 'Managed PostgreSQL', 'VPN']), next_action: null },
];
for (const l of demoLeads) insertLead.run(l);

// Demo registered deals
const insertDeal = db.prepare(`
  INSERT INTO deals (org_id, submitted_by, customer_name, customer_email, customer_industry, opportunity_name, description, services, est_value, expected_close_date, status, last_activity_at, last_activity_note)
  VALUES (@org_id, @submitted_by, @customer_name, @customer_email, @customer_industry, @opportunity_name, @description, @services, @est_value, @expected_close_date, @status, @last_activity_at, @last_activity_note)
`);
insertDeal.run({
  org_id: 'org-001', submitted_by: 'user-002', customer_name: 'Zenith Microfinance',
  customer_email: 'tunde@zenithmfb.ng', customer_industry: 'Financial Services',
  opportunity_name: 'Core banking migration to Nobus', description: 'Migrate core banking VMs to FCS with Sophos XG perimeter and FBS-backed PostgreSQL.',
  services: JSON.stringify(['FCS', 'FBS', 'Sophos XG', 'PostgreSQL']), est_value: 4500000,
  expected_close_date: '2026-08-30', status: 'approved',
  last_activity_at: new Date(Date.now() - 6 * 86400000).toISOString().slice(0, 19).replace('T', ' '),
  last_activity_note: 'Presented TCO comparison to CFO',
});
insertDeal.run({
  org_id: 'org-002', submitted_by: 'user-004', customer_name: 'Federal Health Agency',
  customer_email: null, customer_industry: 'Public Sector',
  opportunity_name: 'Health records platform hosting', description: 'NDPA-compliant hosting for national health records with Cloud Backup and DR.',
  services: JSON.stringify(['FCS', 'FOS', 'Cloud Backup', 'VPN']), est_value: 12000000,
  expected_close_date: '2026-09-15', status: 'pending',
  last_activity_at: null, last_activity_note: null,
});

console.log('Seed complete!');
console.log(`  ${orgs.length + 1} organizations (including Nobus Cloud)`);
console.log(`  ${pendingOrgs.length} pending applications`);
console.log(`  ${users.length} users`);
console.log('');
console.log('=== Nobus Platform Admin ===');
console.log('  admin@nobus.cloud / Nobus@2026!  (Super Admin - full platform control)');
console.log('');
console.log('=== Demo Partner Accounts ===');
console.log('  chinedu@acmetech.ng / demo  (Org Admin - Acme)');
console.log('  amaka@acmetech.ng / demo    (User - Acme, Sales)');
console.log('  fatima@datastream.ng / demo  (Org Admin - DataStream)');
