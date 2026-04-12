const presalesCourse = {
  id: 'presales-enablement',
  title: 'Presales & Solution Selling Path',
  description: 'Comprehensive training for presales engineers and solution architects covering Nobus service catalogue, solution design, TCO modeling, and discovery-to-proposal workflows.',
  duration: '2 Days (16 Hours)',
  audience: 'Presales engineers, solution architects, technical account managers',
  classSize: '10-15 participants per cohort',
  prerequisites: 'Basic cloud knowledge recommended',
  icon: 'Lightbulb',
  color: 'purple',
  objectives: [
    'Master the Nobus Cloud service catalogue and use-case mapping',
    'Design solution architectures for common customer scenarios',
    'Build TCO models and ROI calculations for proposals',
    'Respond effectively to RFPs using Nobus capabilities',
    'Deliver compelling technical demos of the Nobus platform',
    'Run discovery-to-proposal workflows end to end',
  ],
  modules: [
    {
      id: 'pre-m1',
      title: 'Module 1: Nobus Service Catalogue Mastery',
      lessons: [
        {
          id: 'pre-m1-l1',
          title: '1.1 Compute Services for Presales',
          content: `## Positioning Nobus Compute

### Flexible Compute Service (FCS)
The core compute offering — virtual machines on demand. Key presales talking points:

- **Instance flexibility:** Standard and compute-optimized flavors from 1 to 32 vCPUs
- **OS support:** Ubuntu, CentOS, Nobus Linux, Windows Server (managed or BYOL)
- **Pre-billing model:** Instances are billed from launch — educate customers on cost management
- **Custom NMIs:** Create golden images for standardized deployments

### Auto Scaling
Position for customers with **variable workloads**:
- E-commerce with seasonal spikes
- SaaS applications with growing user bases
- Batch processing with periodic high-CPU demands

### Flexible Load Balancing
Required for any **production web application**:
- HTTP/HTTPS/TCP/UDP support
- Health checks with automatic failover
- Session persistence for stateful apps

> **Presales Tip:** Always diagram Auto Scaling + Load Balancing together. Customers understand scalability better when they see the traffic flow visually.`
        },
        {
          id: 'pre-m1-l2',
          title: '1.2 Storage & Data Services',
          content: `## Storage Portfolio

### FBS (Block Storage) — "The Hard Drive in the Cloud"
| Type | Best Pitch |
|------|-----------|
| **GP2** | "Default choice — fast, reliable, affordable" |
| **IO1** | "For your database tier — guaranteed IOPS" |
| **ST1** | "For your data warehouse — optimized for throughput" |
| **SC1** | "For your archives — lowest cost per GB" |

### FOS (Object Storage) — "Unlimited File Storage"
- Backup destination for all workloads
- Static website hosting
- Media and document storage
- Big data lake foundation
- **No egress fees** within the same Availability Zone

### Managed Databases
Position as **operational savings**:
- MySQL, PostgreSQL, MongoDB, MS SQL Server
- "Your DBA manages queries, not patching and backups"
- Automated backups, monitoring, and failover

> **Presales Tip:** When a customer says "we run our own MySQL," ask: "How many hours per month does your team spend on database patching, backups, and failover testing?" Then show the managed service as a direct time-saver.`
        },
        {
          id: 'pre-m1-l3',
          title: '1.3 Networking & Security Services',
          content: `## Networking for Solution Design

### Core Networking Components
- **VPC / DaaS:** Isolated network environments — one per customer workload
- **Subnets:** Segment by tier (web, app, database)
- **Security Groups:** Stateful firewalls per instance
- **Cloud Firewall:** Tenant-level perimeter control
- **Floating IPs:** Public-facing addresses with HA failover

### Connectivity Options
| Option | Best For | Cost |
|--------|---------|------|
| **Public Internet** | Dev/test, small workloads | Included |
| **Site-to-Site VPN** | Hybrid connectivity, <1Gbps | Low |
| **Nobus Fast Transit (NFT)** | Enterprise, latency-sensitive, >1Gbps | Premium |

### Security Services
- **Sophos XG Firewall:** Enterprise threat protection (IPS, ATP, sandboxing)
- **FortiGate Firewall:** For Fortinet-standardized environments
- **Acronis Cyber Protect:** Backup + ransomware protection in one

> **Presales Tip:** For financial services prospects, lead with the security stack. Show: Security Groups + Cloud Firewall + Sophos XG + Acronis = defense-in-depth architecture that maps to CBN framework requirements.`
        },
      ],
      quiz: {
        id: 'quiz-pre-m1',
        title: 'Module 1 Quiz: Service Catalogue',
        questions: [
          {
            q: 'Which FBS volume type should you recommend for a mission-critical Oracle database?',
            options: ['GP2', 'IO1', 'ST1', 'SC1'],
            correct: 1,
          },
          {
            q: 'What is the primary advantage of positioning managed databases over self-managed?',
            options: ['Lower storage costs', 'Operational time savings (no patching, backup management)', 'Faster query performance', 'More database options'],
            correct: 1,
          },
          {
            q: 'Which connectivity option is recommended for enterprise customers with latency-sensitive applications?',
            options: ['Public Internet', 'Site-to-Site VPN', 'Nobus Fast Transit (NFT)', 'Cloud Router'],
            correct: 2,
          },
        ],
      },
    },
    {
      id: 'pre-m2',
      title: 'Module 2: Solution Architecture Patterns',
      lessons: [
        {
          id: 'pre-m2-l1',
          title: '2.1 Common Customer Scenarios',
          content: `## Reference Architectures

### Scenario 1: Web Application Migration
**Customer profile:** Company running 3-5 physical servers for a customer-facing web application.

**Nobus Architecture:**
- 2x FCS instances (web tier) behind Flexible Load Balancer
- 1x FCS instance (app tier) in private subnet
- 1x Managed MySQL database
- FBS GP2 volumes for application data
- FOS container for static assets and backups
- Security Groups: web-sg, app-sg, db-sg (layered access)
- Auto Scaling on web tier for traffic spikes

**Key selling points:** Scalability, HA, no single point of failure, lower TCO

---

### Scenario 2: Disaster Recovery
**Customer profile:** Enterprise needing DR for on-premises critical systems.

**Nobus Architecture:**
- NFT or VPN connectivity to on-prem
- Pilot light: minimal FCS instances pre-provisioned
- FBS snapshots replicated on schedule
- Nobus Cloud Backup (Acronis) for full workload protection
- Automated failover runbook

**Key selling points:** RPO in minutes, RTO under 1 hour, fraction of the cost of a second data center

---

### Scenario 3: Cloud-Native Application
**Customer profile:** Fintech building a new microservices application.

**Nobus Architecture:**
- Cloud Kubernetes Engine (CKE) cluster
- Managed PostgreSQL for transactional data
- Nobus Kafka Service for event streaming
- FOS for document storage
- Sophos XG for compliance-grade security

**Key selling points:** Modern architecture, auto-scaling pods, managed infrastructure`
        },
        {
          id: 'pre-m2-l2',
          title: '2.2 Architecture Diagram Best Practices',
          content: `## Building Effective Architecture Diagrams

### Every Diagram Should Show:
1. **Network boundaries** — VPC, subnets, availability zones
2. **Traffic flow** — arrows showing request path from user to backend
3. **Security layers** — where firewalls, security groups, and encryption apply
4. **Data flow** — how data moves between services
5. **Backup/DR** — snapshot schedules, replication targets

### Three-Tier Architecture Template
\`\`\`
Internet
   ↓
[Load Balancer] — Public Subnet
   ↓
[Web Servers] — Private Subnet (web-sg: 80,443 from LB)
   ↓
[App Servers] — Private Subnet (app-sg: 8080 from web-sg)
   ↓
[Database] — Private Subnet (db-sg: 3306 from app-sg only)
   ↓
[FOS Backup] — Object Storage
\`\`\`

### Do's and Don'ts
- ✅ **Do** include cost estimates next to each component
- ✅ **Do** show the customer's current architecture alongside the Nobus proposal
- ✅ **Do** highlight security controls at each layer
- ❌ **Don't** make diagrams too complex — executives lose interest after 6 boxes
- ❌ **Don't** show internal Nobus infrastructure — keep it at the service level`
        },
      ],
      quiz: {
        id: 'quiz-pre-m2',
        title: 'Module 2 Quiz: Solution Architecture',
        questions: [
          {
            q: 'In a three-tier web architecture, which subnet should the database reside in?',
            options: ['Public subnet with Floating IP', 'Private subnet accessible only from app-sg', 'DMZ subnet', 'External subnet'],
            correct: 1,
          },
          {
            q: 'For an enterprise DR scenario, which connectivity option provides the lowest latency?',
            options: ['Public Internet', 'Site-to-Site VPN', 'Nobus Fast Transit (NFT)', 'FOS replication'],
            correct: 2,
          },
        ],
      },
    },
    {
      id: 'pre-m3',
      title: 'Module 3: TCO Modeling & ROI',
      lessons: [
        {
          id: 'pre-m3-l1',
          title: '3.1 Building a TCO Model',
          content: `## Total Cost of Ownership Framework

### Step 1: Capture Current Costs (On-Prem or Competitor)
- **Hardware CapEx:** Server purchase, storage arrays, networking equipment
- **Software licensing:** OS, database, virtualization, backup software
- **Facilities:** Power, cooling, rack space, physical security
- **Personnel:** System admins, DBAs, network engineers (fraction of FTE)
- **Downtime cost:** Revenue lost per hour of outage x average outages/year
- **Opportunity cost:** Projects delayed by infrastructure provisioning

### Step 2: Map to Nobus Costs
- FCS instances (hourly or monthly)
- FBS volumes (per GB/month)
- FOS storage (per GB/month + requests)
- Networking (Floating IPs, NFT if applicable)
- Managed services (databases, Kubernetes)
- Backup (NCB licensing)
- Support tier (included vs. premium)

### Step 3: Compare Over 3 Years

| Year | On-Premise | Nobus Cloud |
|------|-----------|-------------|
| Year 1 | ₦50M (servers) + ₦15M (ops) = ₦65M | ₦4.5M (prod) + ₦2M (dev) + ₦2M (setup) = ₦8.5M |
| Year 2 | ₦15M (ops) | ₦7M (optimized) |
| Year 3 | ₦15M (ops) | ₦7M |
| **TOTAL** | **₦95M** | **₦22.5M** |
| **SAVINGS** | — | **₦72.5M (76% reduction)** |

> **Presales Tip:** Always present the 3-year view. Year 1 alone may not show dramatic savings due to migration costs, but the 3-year TCO tells the real story.`
        },
        {
          id: 'pre-m3-l2',
          title: '3.2 RFP Response Framework',
          content: `## Responding to RFPs Effectively

### Standard RFP Sections & How to Win

**1. Company Overview**
- Nobus = Nkponani Limited, Nigerian-owned, Tier III hosted
- Emphasize local presence, data sovereignty, compliance certs

**2. Technical Requirements**
- Map each requirement to a specific Nobus service
- Include architecture diagram for proposed solution
- Reference documentation URLs for each service

**3. Security & Compliance**
- ISO 27001, PCI-DSS, NDPR alignment
- Shared responsibility model documentation
- Detail encryption, MFA, RBAC capabilities

**4. SLA & Support**
- 99.95% uptime SLA for FCS
- Local support team, same timezone
- Partner hotline for certified partners

**5. Pricing**
- Monthly breakdown + annual projection
- 3-year TCO comparison
- Include training and migration as line items

**6. References**
- Similar industry, similar scale
- Quantified results (cost savings, uptime, migration time)

> **Presales Tip:** The best RFP responses are not generic — they repeat the customer's specific language and pain points from the RFP back to them in each section. Show you read it, not just templated a response.`
        },
      ],
      quiz: {
        id: 'quiz-pre-m3',
        title: 'Module 3 Quiz: TCO & RFP',
        questions: [
          {
            q: 'Over what time period should you present TCO comparisons to show the most compelling savings?',
            options: ['1 month', '1 year', '3 years', '5 years'],
            correct: 2,
          },
          {
            q: 'What is the single most important element that differentiates a winning RFP response?',
            options: ['Lowest price', 'Most pages', 'Reflecting the customer\'s specific language and pain points', 'Most technical detail'],
            correct: 2,
          },
        ],
      },
    },
    {
      id: 'pre-m4',
      title: 'Module 4: Demo Delivery & Discovery Workflows',
      lessons: [
        {
          id: 'pre-m4-l1',
          title: '4.1 Delivering Effective Demos',
          content: `## Demo Best Practices

### Before the Demo
- ☐ Confirm what the customer wants to see (don't assume)
- ☐ Pre-provision demo environment (never build live — too risky)
- ☐ Test everything 1 hour before the meeting
- ☐ Prepare a backup plan if live demo fails (screenshots, recorded video)
- ☐ Know who will be in the room and their roles

### Demo Flow (30 minutes max)
1. **Context (2 min):** "Based on our discovery, here's what we'll show you today..."
2. **Dashboard tour (5 min):** Show cloud.nobus.io — instances, volumes, networking
3. **Core use case (15 min):** Launch instance → attach storage → configure security → show monitoring
4. **Differentiator (5 min):** Data sovereignty, Naira billing, local support
5. **Q&A (remaining time):** Let them drive

### What TO Demo
- ✅ Instance launch speed (provision in <5 minutes)
- ✅ Security group configuration (show ease of use)
- ✅ Dashboard clarity (compare to AWS console complexity)
- ✅ Naira pricing on the billing page

### What NOT to Demo
- ❌ Features that are still in beta
- ❌ Complex networking unless they specifically asked
- ❌ Admin operations that aren't customer-facing`
        },
        {
          id: 'pre-m4-l2',
          title: '4.2 Discovery-to-Proposal Workflow',
          content: `## End-to-End Workflow

### Phase 1: Discovery Call (with Sales partner)
- Understand current environment (servers, apps, data)
- Identify pain points and business drivers
- Capture technical requirements
- **Output:** Discovery notes document

### Phase 2: Solution Design (Presales)
- Map requirements to Nobus services
- Design architecture diagram
- Size instances and storage
- Identify security and compliance requirements
- **Output:** Draft architecture + sizing

### Phase 3: TCO Model (Presales + Sales)
- Calculate current costs
- Build Nobus cost projection
- Show 3-year savings
- **Output:** TCO comparison spreadsheet

### Phase 4: Proposal (Sales + Presales review)
- Combine architecture, TCO, and commercial terms
- Include implementation timeline
- Add success stories and references
- **Output:** Formal proposal document (10-12 pages max)

### Phase 5: Technical Validation
- Demo or PoC if needed
- Answer technical deep-dive questions
- Security review with customer's IT team
- **Output:** Technical sign-off

> **Presales Tip:** Your job is to make the customer's technical team your champions. If the CTO's engineers trust the architecture, the CTO will sign. Invest time in building that technical relationship.`
        },
      ],
      quiz: {
        id: 'quiz-pre-m4',
        title: 'Module 4 Quiz: Demo & Workflows',
        questions: [
          {
            q: 'What is the recommended maximum time for a product demo?',
            options: ['15 minutes', '30 minutes', '60 minutes', '90 minutes'],
            correct: 1,
          },
          {
            q: 'What is the primary output of the Discovery phase?',
            options: ['Architecture diagram', 'TCO model', 'Discovery notes document', 'Formal proposal'],
            correct: 2,
          },
          {
            q: 'Why should you pre-provision the demo environment instead of building live?',
            options: ['To save time', 'To avoid risk of live failures', 'Company policy', 'To show automation'],
            correct: 1,
          },
        ],
      },
    },
  ],
};

export default presalesCourse;
