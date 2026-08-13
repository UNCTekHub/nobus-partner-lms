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
          content: `## Positioning Nobus Compute: The Presales View

> **Why this matters:** Compute is the anchor of nearly every quote you will build; storage, networking and databases attach to it. Sizing it credibly, and explaining the pricing model without hesitation, is the core presales competency.

### What you will learn
- The FCS instance families and how to size from real utilization
- The pricing mechanics you must be able to compute on a whiteboard
- How to position Auto Scaling, Load Balancing and Dedicated Hosts in designs

### FCS: the compute foundation
Nobus Flexible Compute Service provides resizable virtual machines from the console (dashboard.nobus.io), CLI or API.

**Instance naming decodes as si.[vCPU].[RAM].[disk].[l|w]:** si.4.8.30.l = 4 vCPU, 8 GiB RAM, 30 GB root disk, Linux. Windows images use 50 GB roots (.50.w) and include the managed license.

**FCS instance types - pick the shape first, then the size:**
- **Standard (General Purpose):** balanced vCPU-to-memory - web/app servers and most general workloads
- **Compute Optimized:** more vCPU per GiB - batch processing, media transcoding, HPC, high-traffic front-ends
- **Memory Optimized:** more memory per vCPU - in-memory databases, real-time analytics, large caches
- **GPU Optimized:** GPU-accelerated - AI/ML training and inference, rendering, scientific compute

Each type spans a wide range of sizes (the table below shows size bands, not the full list - confirm exact flavors in the Quote Builder or console):

| Size band | Profile | Typical placement |
|---|---|---|
| si.1.x / si.2.x | 1-2 vCPU, 2-8 GiB | Web nodes, microservices, dev/test, VPN gateways |
| si.4.x | 4 vCPU, 4-32 GiB | Application servers, mid-size databases, ERP tiers |
| si.8.x | 8 vCPU, 16-64 GiB | Heavy databases, analytics, consolidation hosts |
| Burstable (si.8.64/si.16.64) | High RAM, bursty CPU | Staging, variable batch workloads |
| GPU / larger | Memory-, compute- and GPU-optimized shapes | AI/ML, HPC, analytics - available on request |

**OS coverage:** Ubuntu, Debian, Rocky Linux, AlmaLinux and other open-source Linux distributions license-free; Windows Server with managed licensing (+35,000 per instance-month) or BYOL on Dedicated Hosts.

### Pricing mechanics (whiteboard-ready)
- Published units: vCPU 93.50 and memory 96.80 per unit-day; entry instances from **9,309/month**; billing is pre-paid per cycle and accrues while instances are running or paused
- Rule of thumb: a Linux si.2.4 lands in the low-20k/month range, an si.4.8 roughly double; always confirm final figures in the Quote Builder or the official Pricing Calculator, which apply exact rates, exclusive partner pricing and 7.5% VAT
- The differentiators to state every time: **billed in local currency** and **zero egress fees**

### Right-sizing: your credibility lever
Never mirror the old server's spec. Most on-premise machines run at 15-25% utilization; measure (or ask for) actual peak CPU and RAM, size to peak plus 30% headroom, and let vertical resize or autoscaling absorb growth. A right-sized quote routinely comes in 30-40% under a spec-mirrored one, and it is the single fastest way to beat a competitor's lazy proposal.

### Auto Scaling (position it, always)
Scaling groups add or remove instances by policy: **dynamic** (live metrics), **predictive** (learned patterns) or **scheduled** (calendar). The service also health-checks and replaces failed instances and balances across availability zones, at **no extra charge** beyond the instances themselves.
> Positioning line: "During your Black Friday, the web tier grows from 2 to 10 instances by itself, then shrinks back. You pay for the surge only while it exists."

### Load Balancing (the front door of every web design)
HAProxy-pattern load balancing spreads TCP/HTTP traffic across instance backends with health checks and hostname-based routing (one LB can front several applications). Draw it into every multi-instance design: Floating IP into LB, LB into the autoscaling tier.

### Dedicated Hosting (the compliance and licensing card)
Entire physical servers reserved for one customer: maximum isolation for regulated workloads, and the home of **BYOL** (per-socket/per-core Microsoft and Oracle licenses, governed via the License Manager). When a customer mentions existing enterprise agreements, this is your answer; it regularly rescues deals that stall on licensing cost.

### Field example
A retailer's RFQ listed 12 servers copied from their 2019 hardware sheet. The losing bidder quoted 12 mirrored instances. The winning partner requested one month of utilization data, proposed 7 right-sized instances plus an autoscaling web tier, and came in 38% cheaper with better peak capacity. Same platform; the sizing discipline won.

### Key takeaways
- Decode si.[vCPU].[RAM].[disk].[os] instantly; size from measured peaks plus 30%, never from old spec sheets
- Know the units (93.50 / 96.80 per unit-day, entry 9,309) but finalize numbers in the Quote Builder
- Auto Scaling costs nothing extra and self-heals; Dedicated Hosts + BYOL is the licensing rescue card`
        },
        {
          id: 'pre-m1-l2',
          title: '1.2 Storage & Data Services',
          content: `## Storage Portfolio

### FBS (Block Storage) - "The Hard Drive in the Cloud"
- SSD-backed volumes that persist independently from the instance lifecycle
- **AES-256 encryption** for data at rest, in transit, and snapshots
- **Extendable volumes** - resize without detaching or restarting the instance
- **Delete on Termination:** Root volumes delete by default; additional volumes persist by default

| Type | Best Pitch | Performance |
|------|-----------|-------------|
| **GP2 (Standard SSD)** | "Default choice - fast, reliable, affordable" | 3 IOPS/GB, burst to 3,000 |
| **IO1 (Provisioned IOPS)** | "For your database tier - guaranteed IOPS" | Up to 64,000 IOPS |
| **ST1 (Throughput)** | "For your data warehouse - optimized for throughput" | HDD, throughput-focused |
| **SC1 (Cold)** | "For your archives - lowest cost per GB" | HDD, lowest cost |

**Snapshot selling points:**
- Incremental - only changed blocks saved, but any single snapshot can restore the full volume
- Copy across Availability Zones for DR
- Group snapshots for crash-consistent multi-volume backups
- Share snapshots with other accounts

### FOS (Object Storage) - "Unlimited File Storage"
- Containers (not nested) hold objects - like directories holding files
- Per-container access control and permissions
- Backup destination for all workloads
- Static website hosting, media/document storage, big data lake
- **No egress fees** within the same Availability Zone
- DELETE operations are **free**

### Managed Databases
Position as **operational savings** - "Your DBA manages queries, not patching and backups":

| Database | Pitch to Customer |
|----------|------------------|
| **MySQL** | "The world's most popular open-source DB. Perfect for web apps, CMS, e-commerce." |
| **PostgreSQL** | "Enterprise-grade with advanced features. Ideal for analytics, GIS, financial systems." |
| **MongoDB** | "Flexible document DB for rapid development. Great for mobile apps, IoT, content management." |
| **MS SQL Server** | "Native .NET integration. Essential for Windows shops running ERP or SharePoint." |

> **Presales Tip:** When a customer says "we run our own MySQL," ask: "How many hours per month does your team spend on database patching, backups, and failover testing?" Then show the managed service as a direct time-saver - typically 20-40 hours/month reclaimed.`
        },
        {
          id: 'pre-m1-l3',
          title: '1.3 Networking & Security Services',
          content: `## Networking for Solution Design

### Core Networking Components
- **VPC / DaaS:** Isolated network environments with custom IP ranges, subnets, route tables, gateways
- **Subnets:** Segment by tier (web, app, database) with DHCP and DNS configuration
- **Security Groups:** Stateful firewalls per instance - automatically applied to all associated instances
- **Cloud Firewall (FaaS):** Tenant-level perimeter control with ordered policy rules
- **Cloud Router:** BGP-enabled routing between subnets and external networks, static routes
- **Cloud Trunks:** Multi-network via single vNIC using VLAN segmentation for complex topologies
- **Floating IPs:** Static public IPv4 addresses - ₦1,500/month when reserved but unassigned, max 3 per account
- **DNS:** Free managed DNS with A, AAAA, CNAME, MX, TXT, NS, PTR records (ns1/ns2.nobus.com)
- **IPv4 only** - IPv6 not currently supported

### Connectivity Options
| Option | Best For | Bandwidth | Cost |
|--------|---------|-----------|------|
| **Public Internet** | Dev/test, small workloads | Variable | Included |
| **Site-to-Site VPN (pfSense)** | Hybrid connectivity | <1 Gbps | Low (FCS instance cost) |
| **NFT Hosted Connection** | Mid-market enterprise | 50 Mbps - 10 Gbps | Medium |
| **NFT Dedicated Connection** | Large enterprise, latency-sensitive | 1 Gbps or 10 Gbps | Premium |

### NFT Key Selling Points for Presales
- Bypasses public internet entirely - lower latency, consistent bandwidth
- Supports both IPv4 and IPv6
- Requires 802.1Q VLAN, BGP with MD5 auth, single-mode fiber
- LOA-CFA (Letter of Authorization) process - 7-day response window
- **Partner Revenue:** NPN-certified partners can resell hosted connections

### Security Services Stack
- **Security Groups:** Instance-level stateful packet filtering (web-sg, app-sg, db-sg pattern)
- **Cloud Firewall:** Tenant-level ordered policy rules - shared across tenants, auditable
- **Sophos XG Firewall:** Enterprise IPS, ATP with AI/ML, cloud sandboxing, dual AV, synchronized security
  - Deployment: 2 vCPU, 4 GB RAM, 2 vNIC (MTU 1458), two FBS volumes (30 GB + 80 GB)
- **FortiGate NGFW:** Deep packet inspection, UTM, SD-WAN, FortiGuard threat intelligence
- **Fortinet FortiSIEM:** Security information & event management - real-time threat detection, event correlation and compliance reporting
- **Nobus Cloud Backup (NCB)** (powered by Acronis Cyber Protect): Backup + ransomware protection + vulnerability scanning + antivirus
  - Multi-cloud and SaaS backup from AWS, Azure, Google Cloud, VMware, on-prem, plus Microsoft 365 (Exchange, OneDrive, SharePoint) and Google Workspace
  - Deployment: 100 GB min disk, 8192 MB min RAM

### Defense-in-Depth Architecture (for Financial Services RFPs)
\`\`\`
Internet → Cloud Firewall (FaaS) → Sophos XG / FortiGate
   → Security Groups (per-tier)
      → Web Tier (web-sg: 80,443)
      → App Tier (app-sg: 8080 from web-sg only)
      → DB Tier (db-sg: 3306 from app-sg only)
   → Nobus Cloud Backup (backup + anti-ransomware)
   → FBS Encryption (AES-256 at rest)
   → TLS (data in transit)
\`\`\`

> **Presales Tip:** For financial services prospects, PCI DSS is a must - map this stack to CBN framework requirements. Show: Security Groups + Nobus Cloud Native Firewall + next-generation cloud firewall (Sophos XG or FortiGate) + Nobus Cloud Backup + AES-256 encryption = full, PCI-DSS-ready architecture. Add NDPA data residency (Lagos DC) as the compliance cherry on top.`
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
- Customer manages their own control plane and worker nodes - full flexibility
- Use FCS Auto Scaling to scale worker nodes based on demand
- Pair with Managed PostgreSQL or MongoDB for stateful backend services

**8 Container Use Cases to Position:**
1. **Microservices architecture** - break monoliths into independently deployable services
2. **CI/CD pipelines** - automated build, test, and deploy workflows
3. **Dev/test environments** - spin up isolated environments in seconds
4. **Batch processing** - run compute-intensive jobs, scale down when done
5. **API gateways** - manage, route, and throttle API traffic
6. **Machine learning inference** - serve ML models at scale
7. **Multi-tenant SaaS** - isolate tenant workloads in separate namespaces
8. **Legacy modernisation** - containerise existing apps for portability

> **Presales Tip:** When positioning containers, focus on the business outcome: "Your dev team deploys 10x faster, your ops team manages fewer servers, and your CFO sees lower infrastructure costs." Don't lead with Kubernetes complexity.

---

### Managed Databases - Deep Dive for Solution Design

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

### Nobus Kafka Service - Event Streaming

Position Kafka for customers with **real-time data needs** - payment processing, IoT telemetry, log aggregation, or event-driven architectures.

**Core Concepts (know enough to position, not configure):**

| Concept | What It Means | Why Customers Care |
|---------|--------------|-------------------|
| **Topics** | Named channels for messages | Organise data streams by type (payments, logs, events) |
| **Partitions** | Parallel processing lanes within a topic | Higher throughput - more partitions = more parallelism |
| **Producers** | Applications that publish messages | Any app can send events to Kafka |
| **Consumers** | Applications that read messages | Multiple consumers can read independently |
| **Consumer Groups** | Coordinated consumers sharing the workload | Scale processing without duplicating messages |
| **Offsets** | Position tracking per consumer | Consumers can replay from any point - no data loss |
| **Brokers** | Kafka cluster nodes | Fault tolerance - if one broker fails, others continue |

**Use Cases to Position:**
- Real-time payment event processing (fintech)
- IoT sensor data ingestion (manufacturing, smart buildings)
- Log aggregation and monitoring pipelines
- Event sourcing for microservices
- Real-time analytics dashboards

> **Presales Tip:** When a customer mentions "real-time," "event-driven," or "streaming," that's your cue to introduce Kafka. Position it as: "Your applications publish events. Other applications consume them in real-time. No polling, no delays, no lost messages."

---

### Nobus Cloud Backup (NCB) - Cross-Cloud Protection

NCB (powered by **Acronis Cyber Protect**) is a unique differentiator - it backs up not just Nobus workloads but also **AWS, Azure, Google Cloud, VMware and on-premises** environments, plus SaaS: **Microsoft 365 (Exchange, OneDrive, SharePoint) and Google Workspace**.

**7 Key NCB Features:**
1. Full-image and file-level backup
2. Ransomware protection (AI-based detection)
3. Vulnerability scanning and patching
4. Multi-cloud and SaaS backup (AWS, Azure, Google Cloud, on-prem, Microsoft 365 and Google Workspace → Nobus)
5. Disaster recovery with automated failover
6. Centralised management console
7. Compliance reporting

**Licensing Options:**
- Per-workload licensing (servers, VMs, workstations)
- Per-GB storage licensing
- Bundle options for enterprise accounts

**Free Backup Offer:** Nobus provides a free backup allocation for qualifying customers - use this as a deal sweetener during negotiations.

> **Presales Tip:** NCB is your secret weapon for competitive deals. When a customer says "We already use AWS but need backup," position NCB: "Back up your AWS, Azure, on-prem AND Microsoft 365 / Google Workspace to Nobus. One backup solution, one invoice, in local currency. And if you ever want to migrate, your data is already here."

---

### Cloud Orchestration (Infrastructure as Code)

For mature DevOps teams, position Nobus Cloud Orchestration:
- Deploy entire infrastructure stacks from templates (YAML/JSON)
- Version-controlled infrastructure - track changes, rollback instantly
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
          },
          {
            q: 'What is the primary advantage of positioning managed databases over self-managed?',
            options: ['Lower storage costs', 'Operational time savings (no patching, backup management)', 'Faster query performance', 'More database options'],
          },
          {
            q: 'Which connectivity option is recommended for enterprise customers with latency-sensitive applications?',
            options: ['Public Internet', 'Site-to-Site VPN', 'Nobus Fast Transit (NFT)', 'Cloud Router'],
          },
          {
            q: 'A customer says "We need advanced analytics with geospatial data." Which managed database should you recommend?',
            options: ['MySQL', 'MongoDB', 'PostgreSQL (with PostGIS)', 'MS SQL Server'],
          },
          {
            q: 'What makes NCB (Nobus Cloud Backup) a unique competitive differentiator?',
            options: ['It is the cheapest backup solution', 'It supports multi-cloud and SaaS backup from AWS, Azure, Google Cloud, VMware, on-prem, Microsoft 365 and Google Workspace', 'It only backs up Nobus workloads', 'It uses tape-based backup'],
          },
          {
            q: 'When should you position Nobus Kafka Service to a customer?',
            options: ['When they need file storage', 'When they mention real-time, event-driven, or streaming requirements', 'When they need a traditional relational database', 'When they want to host static websites'],
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
          content: `## Common Customer Scenarios and Reference Architectures

> **Why this matters:** Presales credibility is built in the moment a customer describes their situation and you respond with a proven design, not a blank whiteboard. These five scenarios cover roughly 80% of the deals Nobus partners see. Learn them until you can sketch each one from memory.

### What you will learn
- The five most common customer scenarios and the reference architecture for each
- The Nobus services and instance sizes that fit each pattern
- The discovery questions that tell you which scenario you are in

### Scenario 1: Corporate website / e-commerce platform
- **Signals:** Public web traffic, seasonal spikes, marketing pressure for uptime
- **Architecture:** Floating IP into a load balancer, autoscaling web tier (2-10x FCS si.2.4.30.l), managed MySQL or PostgreSQL on FBS, FOS for media and static assets, daily FBS snapshots
- **Why it wins:** Autoscaling handles Black Friday without paying for peak capacity year-round; zero egress fees matter enormously for media-heavy sites
- **Sizing starter:** si.2.4 per web node, si.4.8 for the database; validate in the Pricing Calculator

### Scenario 2: Enterprise application migration (ERP, core systems)
- **Signals:** Hardware refresh due, dollar-billed hosting renewal, board pressure on capex
- **Architecture:** Right-sized FCS instances (si.4.16 or si.8.16 for app tiers, Windows or Linux), FBS volumes per workload, Site-to-Site VPN to head office, Sophos XG or FortiGate at the perimeter, Dedicated Host where BYOL licensing (Microsoft, Oracle) applies
- **Why it wins:** BYOL preserves their license investment; VPN keeps hybrid operation smooth during phased migration
- **Key question:** "Which applications hold licenses tied to physical cores or sockets?"

### Scenario 3: Disaster recovery / backup-first entry
- **Signals:** Ransomware fear, audit finding, a recent outage, cautious buyer
- **Architecture:** Nobus Cloud Backup (Acronis) protecting on-prem and even AWS/Azure workloads, FOS as the backup target, a pilot-light FCS environment for critical-system failover, quarterly restore drills
- **Why it wins:** Lowest-risk first step; the customer keeps production where it is and still gets protected. DR customers convert to full migration within 12-18 months.
- **Key numbers:** FOS at 60/GB-month makes retention affordable; snapshots bill only on consumed data

### Scenario 4: Cloud-native fintech / SaaS startup
- **Signals:** Microservices talk, Kubernetes on the CV, transaction spikes, investor pressure on burn rate
- **Architecture:** Managed Nobus Kubernetes Engine (Linux worker nodes), managed Kafka for event streaming, managed PostgreSQL or MongoDB, load balancing, security groups per service tier
- **Why it wins:** local billing extends runway; local latency beats eu-west-1 by 100ms+; PCI DSS certification unlocks payments work
- **Watch out:** Floating IPs do not attach to Kubernetes worker nodes; expose services through the load balancer

### Scenario 5: Regulated enterprise (bank, insurer, government)
- **Signals:** NDPA/CBN language, compliance officers in meetings, formal RFPs
- **Architecture:** Isolated virtual data center (DaaS), Sophos XG + security groups layered, AES-256 encrypted FBS everywhere, VPN or Nobus Fast Transit for dedicated connectivity, full audit logging, in-country data residency documented
- **Why it wins:** Data sovereignty is a legal requirement, not a preference; Tier III certification and ISO 27001 satisfy procurement checklists
- **Key move:** Bring the compliance one-pager from the Content Hub to the SECOND meeting, unprompted

### Matching scenario to discovery
Three questions place almost any customer:
1. "Is the workload customer-facing, internal, or protection/DR?"
2. "What is driving the timing: growth, renewal, risk, or compliance?"
3. "What must stay where it is, and what can move?"

### Key takeaways
- Five patterns cover 80% of deals: web/e-commerce, enterprise migration, DR-first, cloud-native, regulated
- Every architecture pairs a Nobus service list with a business reason; never present one without the other
- DR-first is the lowest-friction entry into cautious accounts, and it expands`
        },
        {
          id: 'pre-m2-l2',
          title: '2.2 Architecture Diagram Best Practices',
          content: `## Architecture Diagrams That Win Deals

> **Why this matters:** In most deals, your architecture diagram is the single most-shared artifact: it gets pasted into internal decks, emailed to the CFO, and screenshotted into WhatsApp. A clear diagram sells while you sleep; a cluttered one raises doubts you never get to answer.

### What you will learn
- The layering standard for professional cloud diagrams
- Nobus-specific notation and labeling conventions
- The three-version rule for different audiences

### The layering standard
Build every diagram in four horizontal layers, top to bottom, matching the path of a user request:
1. **Users and locations:** customers on the internet, staff at head office and branches
2. **Edge and security:** Floating IPs, load balancer, Sophos XG or FortiGate, VPN/Fast Transit terminations
3. **Compute:** FCS instances grouped in boxes per tier (web, app), autoscaling groups drawn as a stack with "2-10 instances" notation, Kubernetes clusters as one box with node count
4. **Data:** managed databases, FBS volumes, FOS buckets, backup flows (dashed arrows to Nobus Cloud Backup)

Group everything inside one labeled boundary: "Nobus Cloud - Lagos AZ (Tier III)". If DR spans zones, show the second zone as a lighter box.

### Labeling conventions (be precise, it signals competence)
- Name services correctly: "FCS si.4.8.30.l", not "server"; "FBS 500 GB", not "disk"; "FOS", not "S3"
- Every arrow gets a protocol and port where it matters: "HTTPS 443", "PostgreSQL 5432", "IPsec"
- Security groups drawn as colored borders around tiers, with a one-line rule summary: "web SG: 443 from internet only"
- Costs optional but powerful: a small monthly figure under each block turns the diagram into a business document

### The three-version rule
Produce every architecture at three altitudes:
1. **Executive (1 slide):** five boxes maximum, no ports, arrows labeled in business language ("customers", "head office"), the monthly total in one corner. For CFOs and steering committees.
2. **Solution (1 page):** the four-layer standard above. For IT managers and evaluation teams. This is the version in your proposal.
3. **Engineering (as needed):** subnets, CIDR ranges, security-group rules in full, failover behavior. For the customer's engineers during PoC and implementation.

Presenting the engineering version to an executive is the most common presales mistake in the field. Match the altitude to the room.

### Tools and hygiene
- Any tool works (draw.io, Lucidchart, PowerPoint); consistency beats fancy
- Use the official Nobus logo from Marketing Materials on customer-facing versions
- Date and version every diagram; architecture evolves during a deal and stale diagrams cause real confusion
- Keep an editable master; you will iterate after every technical meeting

### Field example
A partner competing for an insurer's migration sent the solution-level diagram with monthly costs under each tier. The customer's CFO, who never joined a single call, approved the budget from that one page. The competing proposal had better prose and no diagram. The diagram won.

### Key takeaways
- Four layers, top to bottom: users, edge/security, compute, data
- Precise Nobus service names and ports signal competence; vague boxes signal risk
- Three versions per architecture: executive, solution, engineering; never mix altitudes`
        },
      ],
      quiz: {
        id: 'quiz-pre-m2',
        title: 'Module 2 Quiz: Solution Architecture',
        questions: [
          {
            q: 'In a three-tier web architecture, which subnet should the database reside in?',
            options: ['Public subnet with Floating IP', 'Private subnet accessible only from app-sg', 'DMZ subnet', 'External subnet'],
          },
          {
            q: 'For an enterprise DR scenario, which connectivity option provides the lowest latency?',
            options: ['Public Internet', 'Site-to-Site VPN', 'Nobus Fast Transit (NFT)', 'FOS replication'],
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
          content: `## Building a TCO Model That Survives the CFO

> **Why this matters:** Technical wins die in finance reviews. The deal is only real when the numbers are, and a Total Cost of Ownership model built honestly, with sources, is the difference between "interesting" and "approved". This lesson gives you the model and a worked example with real Nobus rates.

### What you will learn
- The five cost categories a complete TCO must include
- Published Nobus rates you can quote from memory
- A worked three-year comparison: on-premise vs Nobus

### The five cost categories
A credible TCO compares ALL of these for the current state versus Nobus, over 3 years:
1. **Infrastructure:** hardware purchase/refresh, or cloud compute+storage charges
2. **Facilities:** power, diesel, cooling, rack space, physical security (routinely 30-40% of on-prem cost in Nigeria; never let this be forgotten)
3. **Connectivity:** bandwidth, leased lines, VPN
4. **People:** the fraction of engineer salaries spent racking, patching and babysitting hardware
5. **Risk:** downtime cost x expected hours (use their own outage history), plus FX exposure on dollar contracts

### Nobus rates to know cold (from nobus.io published pricing)
| Item | Rate |
|---|---|
| FCS entry instance | from 9,309/month |
| FCS vCPU / memory units | 93.50 and 96.80 per unit-day |
| FBS block storage | 120 per GB-month |
| FOS object storage | 60 per GB-month |
| Internet bandwidth | 6,000 per GB-month (burstable to 50 Mbps) |
| Floating IP | 1,500 per month |
| Windows license | +35,000 per instance-month |
| Egress fees | zero |
| VAT | 7.5%, always shown explicitly |

Build the actual line items in the Quote Builder; it applies these rates, exclusive partner pricing, and VAT automatically, and exports a CFO-ready PDF or XLSX.

### Worked example: mid-size company, 3-year view
Current state: 6 aging servers due for refresh, one rack, generator-backed office server room.

**On-premise path (3 years)**
- Hardware refresh: 28M (year 1)
- Power, diesel, cooling: 350k/month = 12.6M
- One engineer's time at 40%: 2.4M/year = 7.2M
- UPS/generator maintenance: 1.8M
- Downtime (their history: ~3 incidents/year, 6 hrs avg, 400k/hr): 21.6M
- **Total: ~71M, plus another refresh looming in year 4**

**Nobus path (3 years)**
- 6x FCS equivalents (mix of si.4.8 and si.2.4) + FBS + backups: ~1.15M/month = 41.4M
- Migration project (one-time, partner services): 3.5M
- Downtime at 99.982%: under 1M expected
- **Total: ~46M, capex-free, in local currency, with Tier III redundancy**

Headline for the executive summary: **"~35% lower three-year cost, zero capex, and 20x less expected downtime."**

### Rules of honest modeling
- Source every number: their invoices, their outage log, nobus.io published rates
- Use conservative assumptions and say so; a CFO who catches one inflated number discards the whole model
- Show the do-nothing column; inaction has a cost line too
- State FX assumptions explicitly for any dollar-denominated current costs

### Key takeaways
- Five categories: infrastructure, facilities, connectivity, people, risk; omit one and the model is fiction
- Facilities and downtime are where on-premise quietly loses; make them visible
- Conservative, sourced numbers beat optimistic ones; credibility is the product`
        },
        {
          id: 'pre-m3-l2',
          title: '3.2 RFP Response Framework',
          content: `## Responding to RFPs: The Framework

> **Why this matters:** Enterprise and government buyers procure through formal RFPs, and most partners answer them badly: generic boilerplate, ignored instructions, missed deadlines. A disciplined RFP practice is a durable competitive advantage precisely because it is rare.

### What you will learn
- The go/no-go filter that saves you from unwinnable RFPs
- The compliance-matrix method that structures a winning response
- How to answer the questions Nobus is strong on, and the ones it is not

### First decision: bid or no-bid (one hour, maximum)
Score these honestly before writing a word:
- **Did we know this RFP was coming?** Cold RFPs are usually wired for someone else. If you did not help shape it, your win probability is under 15%.
- **Can we meet every mandatory requirement?** One failed mandatory disqualifies the whole bid.
- **Is the budget real and stated?** Unbudgeted RFPs are market research on your time.
- **Do we have the two weeks of effort this takes?** A half-done RFP response damages your brand more than no response.
If the answer to two or more is no: decline politely, and ask for a meeting before their NEXT procurement cycle. That meeting is worth more than this bid.

### The compliance matrix method
1. Read the entire RFP twice before writing anything
2. Extract every numbered requirement into a spreadsheet: ID, requirement, mandatory/desirable, our answer, evidence
3. Mark each: **Fully compliant / Partially compliant / Non-compliant**, with one sentence of evidence
4. Write the response in THEIR structure and numbering, never your own template
5. Answer the question asked. If they ask "describe your backup capability", describe backup capability; do not paste the company history

### Standard evidence for common RFP sections
- **Infrastructure and availability:** Tier III-certified data centers across multiple African availability zones, 99.982% uptime guarantee, N+1 redundancy
- **Security:** ISO 27001, AES-256 at rest, encrypted transit, security groups + cloud firewalls + optional Sophos XG/FortiGate, shared-responsibility model explained
- **Data protection and residency:** NDPA compliance (Nigeria), ODPC compliance (Kenya), in-country storage, PCI DSS certified
- **Business continuity:** Nobus Cloud Backup (Acronis), cross-zone snapshot copies, documented restore drills
- **Pricing:** Quote Builder export (PDF or XLSX) with VAT explicit and validity stated; transparent published rates on nobus.io
- **Support:** local time-zone support plus your own managed-services SLA as the first line

### Handling the questions you cannot fully meet
Never bluff an RFP; evaluators compare answers across bidders and bluffs are obvious.
- Partial compliance, honestly framed: "Compliant via [approach], with the following consideration..."
- Roadmap answers only where true and publicly dated; never promise undated capabilities
- A credible workaround beats a fake yes: "Requirement met through Nobus Cloud Backup replication rather than native cross-region replication."

### Deadline discipline
- Build the timeline backward from submission with three days of buffer
- Clarification questions: submit early; the answers often reveal the buyer's real priorities
- One owner for the document, one reviewer who did NOT write it, one final compliance check against the matrix

### Key takeaways
- Most RFPs are lost at bid/no-bid; filter ruthlessly and invest in the ones you shaped
- The compliance matrix is the skeleton; their structure, their numbering, their questions
- Honest partial compliance with a workaround outscores confident fiction every time`
        },
      ],
      quiz: {
        id: 'quiz-pre-m3',
        title: 'Module 3 Quiz: TCO & RFP',
        questions: [
          {
            q: 'Over what time period should you present TCO comparisons to show the most compelling savings?',
            options: ['1 month', '1 year', '3 years', '5 years'],
          },
          {
            q: 'What is the single most important element that differentiates a winning RFP response?',
            options: ['Lowest price', 'Most pages', 'Reflecting the customer\'s specific language and pain points', 'Most technical detail'],
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
          content: `## Delivering Demos That Close

> **Why this matters:** A demo is not a product tour; it is a proof performance. The customer is not evaluating the console, they are evaluating whether THEIR problem visibly dissolves on screen. The difference between a tour and a proof is preparation and narrative, and that is a presales skill you can drill.

### What you will learn
- The Tell-Show-Confirm structure for every demo segment
- How to build a demo script around the customer's own discovery pain
- Recovery moves for when things break live (they will)

### The cardinal rule
**Never demo a feature; demo the death of a problem.** Every segment must map to a pain the customer stated in discovery. If they never mentioned Kubernetes, there is no Kubernetes in the demo, however proud of it you are.

### Structure: Tell, Show, Confirm (repeat per segment)
- **Tell (15 seconds):** "You said provisioning takes three weeks. Watch what it takes here."
- **Show (2-3 minutes):** Launch an FCS instance live from dashboard.nobus.io: image, flavor, security group, boot. Narrate what matters, silently skip what does not.
- **Confirm (15 seconds):** "That was 4 minutes, from your browser. How does that compare to today?" Wait for the answer; the confirmations are where the sale happens.

### The standard 25-minute Nobus demo arc
1. **Console orientation (3 min):** one dashboard for everything; calm, uncluttered, in English they already speak
2. **Provisioning proof (5 min):** launch a Linux si.2.4 live; show it booted; attach an FBS volume
3. **The customer's core pain (8 min):** the segment built specifically for THIS customer: a database restore, an autoscaling event, a VPN status page, a firewall rule
4. **Cost transparency (5 min):** the Pricing Calculator with their approximate workload; watch the CFO-type lean in
5. **Close (4 min):** recap each confirmation they gave you, then propose the PoC with dates

### Preparation checklist (non-negotiable)
- Rehearse the full arc twice, aloud, the day before; once alone, once for a colleague
- Pre-provision everything slow; live-launch only what is fast and reliable
- Book a Demo Lab session in PartnerCentral to rehearse the exact scenario
- Prepare the environment fresh: close tabs, silence notifications, 125% zoom so the back row reads the screen
- Have screenshots of every step as a fallback deck

### When it breaks live (the recovery ladder)
1. Stay flat: "Give it a second." (Half of failures resolve on the retry.)
2. Switch to your fallback screenshots without apology or drama: "While that finishes, here is exactly what completes."
3. If the demo gods are truly against you, convert to whiteboard and turn the failure into a support story: "And this is the point where you would have a Lagos engineer on the line, not a ticket queue in another continent."
A composed recovery sells more reliability than a flawless demo; buyers know real systems hiccup. They are watching how you handle it.

### After the demo
Same day: send a two-line recap listing each confirmed moment ("provisioning in 4 minutes, restore in 6"), the recording if made, and the proposed PoC dates. Demo energy decays in 48 hours; invoice it immediately.

### Key takeaways
- Every segment is Tell-Show-Confirm, mapped to a stated discovery pain
- Rehearse twice, pre-provision the slow parts, and carry a screenshot fallback
- The confirmations, not the features, are the demo's output; recap them same-day`
        },
        {
          id: 'pre-m4-l2',
          title: '4.2 Discovery-to-Proposal Workflow',
          content: `## The Discovery-to-Proposal Workflow

> **Why this matters:** Presales is a relay: discovery findings become an architecture, the architecture becomes a quote, the quote becomes a proposal, and any dropped baton kills the deal. This lesson is the end-to-end operating procedure that world-class presales engineers run on every opportunity, with PartnerCentral doing the bookkeeping.

### What you will learn
- The six-step workflow from first technical call to delivered proposal
- The artifacts each step must produce before the next begins
- Timeboxes that keep deals moving

### The workflow at a glance

| Step | Activity | Artifact produced | Timebox |
|---|---|---|---|
| 1 | Technical discovery | Workload inventory sheet | Week 1 |
| 2 | Current-state assessment | As-is diagram + constraints list | Week 1 |
| 3 | Solution design | Target architecture (3 altitudes) | Week 2 |
| 4 | Sizing and pricing | Quote in Quote Builder (NCS-Q ref) | Week 2 |
| 5 | Internal review | Red-team sign-off | 2 days |
| 6 | Proposal assembly & delivery | Proposal + presentation meeting | Week 3 |

### Step 1: Technical discovery
Beyond the sales-level SPIN call, you need engineering facts. Capture per workload: CPU/RAM/storage today, OS and versions, dependencies, licensing model (per-core matters for BYOL and Dedicated Hosts), data volumes, growth rate, RTO/RPO expectations, and interconnectivity (what talks to what, on which ports). Use a standard inventory sheet; memory is not a system.

### Step 2: Current-state assessment
Draw the as-is diagram and list hard constraints: compliance requirements (NDPA residency, PCI), non-movable systems, bandwidth realities at their sites, maintenance windows. Constraints discovered now are design inputs; discovered later, they are crises.

### Step 3: Solution design
Map every workload to a Nobus service and size: FCS flavor per server (right-size from measured usage, not the old box's spec: most on-prem servers run at 20% utilization), FBS volumes, FOS for archives and media, database engine and size, network design (security groups per tier, VPN or Fast Transit, floating IPs), security stack, and the backup/DR layer. Produce the three diagram altitudes from the diagramming lesson.

### Step 4: Sizing and pricing
Build the quote in the **Quote Builder**: line items from the design, quantities from the inventory, exclusive partner pricing applied where eligible, VAT shown. Sanity-check the total against the customer's stated current spend from discovery; if Nobus is not clearly favorable, revisit right-sizing before you present, not after.

### Step 5: Internal review (the step everyone skips, and should not)
A colleague who did not build the design tries to break it for 30 minutes: single points of failure, missed dependencies, unrealistic migration windows, sizing errors. Every deal gets a red team, even small ones. This habit is why some partners never get surprised in customer meetings.

### Step 6: Proposal assembly and delivery
Hand the sales lead the package: solution narrative, the solution-level diagram, the quote reference, implementation phases with dates, and your assumptions list. Present it in a meeting, never by email alone; the proposal walkthrough is where you handle objections while they are small. Attach the quote to the registered deal in PartnerCentral so the pipeline reflects reality.

### Cadence discipline
The entire workflow targets **three weeks** for a standard deal. Each artifact is stored with the lead in Sales Navigator; if you vanish tomorrow, a colleague picks up the deal without a single repeated customer question. That standard, more than any diagram, is what world-class looks like.

### Key takeaways
- Six steps, each with a named artifact; no artifact, no next step
- Right-size from measured utilization; the quote's credibility depends on it
- Red-team every design for 30 minutes; surprises belong in rehearsal, not customer meetings`
        },
      ],
      quiz: {
        id: 'quiz-pre-m4',
        title: 'Module 4 Quiz: Demo & Workflows',
        questions: [
          {
            q: 'What is the recommended maximum time for a product demo?',
            options: ['15 minutes', '30 minutes', '60 minutes', '90 minutes'],
          },
          {
            q: 'What is the primary output of the Discovery phase?',
            options: ['Architecture diagram', 'TCO model', 'Discovery notes document', 'Formal proposal'],
          },
          {
            q: 'Why should you pre-provision the demo environment instead of building live?',
            options: ['To save time', 'To avoid risk of live failures', 'Company policy', 'To show automation'],
          },
        ],
      },
    },
  ],
};

export default presalesCourse;
