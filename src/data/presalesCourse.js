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

- **Instance naming convention:** si.{vCPU}.{RAM}.{disk}.{os} — .l=Linux, .w=Windows
- **Entry-level (si.1.x / si.2.x):** 1-2 vCPU, 2-8 GB RAM — web servers, microservices, dev/test
- **Mid-range (si.4.x):** 4 vCPU, 4-32 GB RAM — enterprise apps, SAP, SharePoint, databases
- **High-performance (si.8.x):** 8 vCPU, 16-32 GB RAM — direct hardware access, non-virtualized licensing
- **Burstable (si.8.64 / si.16.64):** 8-16 vCPU, 64 GB RAM — variable workloads, staging environments
- **OS support:** Ubuntu, CentOS, Debian, Rocky Linux, Oracle Linux, Windows Server 2019/2022
- **Pre-billing model:** Instances billed from launch — educate customers on cost management
- **Custom NMIs:** Create golden images from existing instances for standardised deployments
- **VM Import/Export:** Migrate existing VMs from on-premise to Nobus NMIs

### Auto Scaling
Position for customers with **variable workloads**:
- **Scaling Groups:** Logical groups of identical instances
- **Scaling Policies:** Rules based on CPU, memory, or custom metrics
- **Min/Max Capacity:** Set floor and ceiling on instance count
- **Launch Configuration:** Pre-defined NMI, flavor, and network settings
- Best for: e-commerce (seasonal spikes), SaaS (growing user base), batch processing

### Flexible Load Balancing
Required for any **production web application**:
- **Protocols:** HTTP, HTTPS, TCP, UDP
- **Health checks** with configurable interval, threshold, and timeout
- **Session persistence** (sticky sessions) for stateful apps
- Works natively within Nobus VPC subnet

> **Presales Tip:** Always diagram Auto Scaling + Load Balancing together. Customers understand scalability better when they see the traffic flow visually. Example: "During Black Friday, your web tier auto-scales from 2 to 10 instances. The load balancer distributes traffic across all of them. When traffic drops, you scale back to 2 — paying only for what you used."`
        },
        {
          id: 'pre-m1-l2',
          title: '1.2 Storage & Data Services',
          content: `## Storage Portfolio

### FBS (Block Storage) — "The Hard Drive in the Cloud"
- Volume sizes: **1 GB to 1 TB**, persist independently from instances
- **AES-256 encryption** for data at rest, in transit, and snapshots
- **Extendable volumes** — resize without detaching or restarting the instance
- **Delete on Termination:** Root volumes delete by default; additional volumes persist by default

| Type | Best Pitch | Performance |
|------|-----------|-------------|
| **GP2 (Standard SSD)** | "Default choice — fast, reliable, affordable" | 3 IOPS/GB, burst to 3,000 |
| **IO1 (Provisioned IOPS)** | "For your database tier — guaranteed IOPS" | Up to 64,000 IOPS |
| **ST1 (Throughput)** | "For your data warehouse — optimized for throughput" | HDD, throughput-focused |
| **SC1 (Cold)** | "For your archives — lowest cost per GB" | HDD, lowest cost |

**Snapshot selling points:**
- Incremental — only changed blocks saved, but any single snapshot can restore the full volume
- Copy across Availability Zones for DR
- Group snapshots for crash-consistent multi-volume backups
- Share snapshots with other accounts

### FOS (Object Storage) — "Unlimited File Storage"
- Console: **https://fos-az1.nobus.io/**
- Containers (not nested) hold objects — like directories holding files
- Per-container access control and permissions
- Backup destination for all workloads
- Static website hosting, media/document storage, big data lake
- **No egress fees** within the same Availability Zone
- DELETE operations are **free**

### Managed Databases
Position as **operational savings** — "Your DBA manages queries, not patching and backups":

| Database | Pitch to Customer |
|----------|------------------|
| **MySQL** | "The world's most popular open-source DB. Perfect for web apps, CMS, e-commerce." |
| **PostgreSQL** | "Enterprise-grade with advanced features. Ideal for analytics, GIS, financial systems." |
| **MongoDB** | "Flexible document DB for rapid development. Great for mobile apps, IoT, content management." |
| **MS SQL Server** | "Native .NET integration. Essential for Windows shops running ERP or SharePoint." |

> **Presales Tip:** When a customer says "we run our own MySQL," ask: "How many hours per month does your team spend on database patching, backups, and failover testing?" Then show the managed service as a direct time-saver — typically 20-40 hours/month reclaimed.`
        },
        {
          id: 'pre-m1-l3',
          title: '1.3 Networking & Security Services',
          content: `## Networking for Solution Design

### Core Networking Components
- **VPC / DaaS:** Isolated network environments with custom IP ranges, subnets, route tables, gateways
- **Subnets:** Segment by tier (web, app, database) with DHCP and DNS configuration
- **Security Groups:** Stateful firewalls per instance — automatically applied to all associated instances
- **Cloud Firewall (FaaS):** Tenant-level perimeter control with ordered policy rules
- **Cloud Router:** BGP-enabled routing between subnets and external networks, static routes
- **Cloud Trunks:** Multi-network via single vNIC using VLAN segmentation for complex topologies
- **Floating IPs:** Static public IPv4 addresses — ₦1,500/month when reserved but unassigned, max 3 per account
- **DNS:** Free managed DNS with A, AAAA, CNAME, MX, TXT, NS, PTR records (ns1/ns2.nobus.com)
- **IPv4 only** — IPv6 not currently supported

### Connectivity Options
| Option | Best For | Bandwidth | Cost |
|--------|---------|-----------|------|
| **Public Internet** | Dev/test, small workloads | Variable | Included |
| **Site-to-Site VPN (pfSense)** | Hybrid connectivity | <1 Gbps | Low (FCS instance cost) |
| **NFT Hosted Connection** | Mid-market enterprise | 50 Mbps – 10 Gbps | Medium |
| **NFT Dedicated Connection** | Large enterprise, latency-sensitive | 1 Gbps or 10 Gbps | Premium |

### NFT Key Selling Points for Presales
- Bypasses public internet entirely — lower latency, consistent bandwidth
- Supports both IPv4 and IPv6
- Requires 802.1Q VLAN, BGP with MD5 auth, single-mode fiber
- LOA-CFA (Letter of Authorization) process — 7-day response window
- **Partner Revenue:** NPN-certified partners can resell hosted connections

### Security Services Stack
- **Security Groups:** Instance-level stateful packet filtering (web-sg, app-sg, db-sg pattern)
- **Cloud Firewall:** Tenant-level ordered policy rules — shared across tenants, auditable
- **Sophos XG Firewall:** Enterprise IPS, ATP with AI/ML, cloud sandboxing, dual AV, synchronized security
  - Deployment: 2 vCPU, 4 GB RAM, 2 vNIC (MTU 1458), two FBS volumes (30 GB + 80 GB)
- **FortiGate NGFW:** Deep packet inspection, UTM, SD-WAN, FortiGuard threat intelligence
- **Acronis Cyber Protect:** Backup + ransomware protection + vulnerability scanning + antivirus
  - Supports cross-cloud backup from AWS, Azure, GCP, VMware, on-prem
  - Deployment: 100 GB min disk, 8192 MB min RAM

### Defense-in-Depth Architecture (for Financial Services RFPs)
\`\`\`
Internet → Cloud Firewall (FaaS) → Sophos XG / FortiGate
   → Security Groups (per-tier)
      → Web Tier (web-sg: 80,443)
      → App Tier (app-sg: 8080 from web-sg only)
      → DB Tier (db-sg: 3306 from app-sg only)
   → Acronis Cyber Protect (backup + anti-ransomware)
   → FBS Encryption (AES-256 at rest)
   → TLS (data in transit)
\`\`\`

> **Presales Tip:** For financial services prospects, map this stack to CBN framework requirements. Show: Security Groups + Cloud Firewall + Sophos XG + Acronis + AES-256 encryption = full compliance-ready architecture. Add NDPR data residency (Lagos DC) as the compliance cherry on top.`
        },
        {
          id: 'pre-m1-l4',
          title: '1.4 Containers, Databases & Managed Services',
          content: `## Positioning Managed Services

The managed services portfolio is where Nobus delivers the strongest operational savings story. Every managed service = less work for the customer's overworked IT team.

---

### Container Orchestration (Kubernetes on Nobus)

Nobus supports **self-managed Kubernetes** on FCS instances. Position this for customers modernising legacy monoliths or building new cloud-native applications.

**Key Presales Points:**
- Deploy Kubernetes using **kubeadm, kubelet, and kubectl** on FCS instances
- Customer manages their own control plane and worker nodes — full flexibility
- Use FCS Auto Scaling to scale worker nodes based on demand
- Pair with Managed PostgreSQL or MongoDB for stateful backend services

**8 Container Use Cases to Position:**
1. **Microservices architecture** — break monoliths into independently deployable services
2. **CI/CD pipelines** — automated build, test, and deploy workflows
3. **Dev/test environments** — spin up isolated environments in seconds
4. **Batch processing** — run compute-intensive jobs, scale down when done
5. **API gateways** — manage, route, and throttle API traffic
6. **Machine learning inference** — serve ML models at scale
7. **Multi-tenant SaaS** — isolate tenant workloads in separate namespaces
8. **Legacy modernisation** — containerise existing apps for portability

> **Presales Tip:** When positioning containers, focus on the business outcome: "Your dev team deploys 10x faster, your ops team manages fewer servers, and your CFO sees lower infrastructure costs." Don't lead with Kubernetes complexity.

---

### Managed Databases — Deep Dive for Solution Design

Position managed databases as **operational time savings**. The typical self-managed database costs 20-40 hours/month in DBA time (patching, backups, monitoring, failover testing). Managed services eliminate this entirely.

| Database | Engine | Best For | Key Features | Ideal Customer |
|----------|--------|----------|-------------|----------------|
| **MS SQL Server** | T-SQL | .NET/Windows enterprise apps | Multiple editions (Express → Enterprise), native Windows integration, SQL Agent jobs | Banks running .NET core banking, enterprises on SharePoint/Dynamics |
| **MySQL** | MySQL | Web applications, CMS | GPL licensed, cross-platform, InnoDB engine, replication | E-commerce (WooCommerce, Magento), WordPress, Laravel apps |
| **PostgreSQL** | PostgreSQL | Analytics, GIS, financial systems | ACID compliant, PostGIS for geospatial, advanced indexing, JSON support, 100+ extensions | Fintech, logistics (route optimization), data warehousing, scientific computing |
| **MongoDB** | MongoDB | Modern apps, IoT, content | Document/NoSQL model, flexible schema, horizontal sharding, aggregation pipeline | Mobile backends, IoT data, content management, rapid prototyping |

**How to Position Each Database in Discovery:**

- Customer says *"We run SAP / SharePoint / .NET apps"* → **MS SQL Server**
- Customer says *"We have a WordPress site / PHP application"* → **MySQL**
- Customer says *"We need advanced analytics / GIS / ACID transactions"* → **PostgreSQL**
- Customer says *"We're building a new mobile app / need flexible schema"* → **MongoDB**

---

### Nobus Kafka Service — Event Streaming

Position Kafka for customers with **real-time data needs** — payment processing, IoT telemetry, log aggregation, or event-driven architectures.

**Core Concepts (know enough to position, not configure):**

| Concept | What It Means | Why Customers Care |
|---------|--------------|-------------------|
| **Topics** | Named channels for messages | Organise data streams by type (payments, logs, events) |
| **Partitions** | Parallel processing lanes within a topic | Higher throughput — more partitions = more parallelism |
| **Producers** | Applications that publish messages | Any app can send events to Kafka |
| **Consumers** | Applications that read messages | Multiple consumers can read independently |
| **Consumer Groups** | Coordinated consumers sharing the workload | Scale processing without duplicating messages |
| **Offsets** | Position tracking per consumer | Consumers can replay from any point — no data loss |
| **Brokers** | Kafka cluster nodes | Fault tolerance — if one broker fails, others continue |

**Use Cases to Position:**
- Real-time payment event processing (fintech)
- IoT sensor data ingestion (manufacturing, smart buildings)
- Log aggregation and monitoring pipelines
- Event sourcing for microservices
- Real-time analytics dashboards

> **Presales Tip:** When a customer mentions "real-time," "event-driven," or "streaming," that's your cue to introduce Kafka. Position it as: "Your applications publish events. Other applications consume them in real-time. No polling, no delays, no lost messages."

---

### Nobus Cloud Backup (NCB) — Cross-Cloud Protection

NCB is powered by **Acronis Cyber Protect** and is a unique differentiator — it backs up not just Nobus workloads but also **AWS, Azure, GCP, VMware, and on-premises** environments.

**7 Key NCB Features:**
1. Full-image and file-level backup
2. Ransomware protection (AI-based detection)
3. Vulnerability scanning and patching
4. Cross-cloud backup (AWS → Nobus, Azure → Nobus, on-prem → Nobus)
5. Disaster recovery with automated failover
6. Centralised management console
7. Compliance reporting

**Licensing Options:**
- Per-workload licensing (servers, VMs, workstations)
- Per-GB storage licensing
- Bundle options for enterprise accounts

**Free Backup Offer:** Nobus provides a free backup allocation for qualifying customers — use this as a deal sweetener during negotiations.

> **Presales Tip:** NCB is your secret weapon for competitive deals. When a customer says "We already use AWS but need backup," position NCB: "Back up your AWS, Azure, AND on-prem workloads to Nobus. One backup solution, one invoice, in Naira. And if you ever want to migrate, your data is already here."

---

### Cloud Orchestration (Infrastructure as Code)

For mature DevOps teams, position Nobus Cloud Orchestration:
- Deploy entire infrastructure stacks from templates (YAML/JSON)
- Version-controlled infrastructure — track changes, rollback instantly
- Repeatable deployments across environments (dev → staging → production)

> **Presales Tip:** "Infrastructure as Code means your entire environment is a template. Disaster recovery? Deploy the template. New environment? Deploy the template. Audit trail? It's in version control."`
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
          {
            q: 'A customer says "We need advanced analytics with geospatial data." Which managed database should you recommend?',
            options: ['MySQL', 'MongoDB', 'PostgreSQL (with PostGIS)', 'MS SQL Server'],
            correct: 2,
          },
          {
            q: 'What makes NCB (Nobus Cloud Backup) a unique competitive differentiator?',
            options: ['It is the cheapest backup solution', 'It supports cross-cloud backup from AWS, Azure, GCP, VMware, and on-prem', 'It only backs up Nobus workloads', 'It uses tape-based backup'],
            correct: 1,
          },
          {
            q: 'When should you position Nobus Kafka Service to a customer?',
            options: ['When they need file storage', 'When they mention real-time, event-driven, or streaming requirements', 'When they need a traditional relational database', 'When they want to host static websites'],
            correct: 1,
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
