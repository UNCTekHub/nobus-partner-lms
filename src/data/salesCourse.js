const salesCourse = {
  id: 'sales-enablement',
  title: 'Partner Sales Enablement Bootcamp',
  description: 'Comprehensive 2-day intensive training for partner sales teams, account managers, and business development professionals.',
  duration: '2 Days (16 Hours)',
  audience: 'Partner sales teams, account managers, business development',
  classSize: '10-15 participants per cohort',
  prerequisites: 'None (designed for salespeople, not technical staff)',
  icon: 'TrendingUp',
  color: 'nobus',
  objectives: [
    'Articulate Nobus Cloud\'s value proposition to different buyer personas',
    'Conduct effective discovery calls and qualification',
    'Position Nobus against AWS, Azure, and on-premise',
    'Build compelling proposals and ROI calculations',
    'Execute proof-of-concept sales strategies',
    'Navigate deal registration and commission processes',
  ],
  modules: [
    {
      id: 'sales-m1',
      title: 'Session 1: Nobus Cloud Overview',
      day: 1,
      time: '8:00 AM - 9:30 AM',
      lessons: [
        {
          id: 'sales-m1-l1',
          title: '1.1 About Nobus',
          content: `## Company Background

- **Company:** Nobus Cloud is a product of **Nkponani Limited**
- **Mission:** Democratize cloud computing in Africa
- **Data Center:** Hosted at **Rack Centre** (Tier III certified), Lagos, Nigeria
- **Platform:** OpenStack-based hyperscale cloud infrastructure
- **Console URL:** [cloud.nobus.io](https://cloud.nobus.io)

### Platform Credentials
- **Tier III Data Center** at Rack Centre — enterprise-grade reliability, redundant power, cooling, and network
- **OpenStack Foundation** — same open-source platform powering CERN, Walmart, and major telcos worldwide
- **PCI DSS Compliance** supported — customers in payment card processing can build PCI-compliant environments on Nobus
- **ISO 27001 Certified** — internationally recognized information security management

### Billing & Pricing
- **Naira Billing (NGN)** — all invoices in Nigerian Naira
- **No FX Exposure** — customers never worry about dollar exchange rate fluctuations
- **Pay-as-you-go** — no long-term commitments required
- **No Egress Fees** — data transfer out of Nobus is completely FREE

### Why This Matters for Your Sales

- **Local company** = easier procurement for Nigerian businesses (no offshore vendor approvals)
- **Rack Centre Tier III** = same facility trusted by banks and telecoms
- **Naira billing** = CFOs love budget certainty with no FX surprises
- **OpenStack-based** = customers with AWS/Azure experience can use familiar tools (Terraform, CLI, APIs)
- **PCI DSS support** = opens the door for fintech and banking customers handling card data`
        },
        {
          id: 'sales-m1-l2',
          title: '1.2 The Nobus Difference',
          content: `## Competitive Advantages (Your Selling Points)

### 1. Data Sovereignty
- Data stays in Nigeria at **Rack Centre, Lagos** — a Tier III certified facility
- Full **NDPR (Nigeria Data Protection Regulation)** compliance
- No foreign government access to customer data
- Critical for banks, government agencies, healthcare providers

> **Sales Pitch:** *"Unlike AWS or Azure where your data sits in Europe or the US, Nobus keeps your data at Rack Centre in Lagos — a Tier III certified facility. For banks and government agencies, this isn't just convenient — it's often a legal requirement under NDPR. Can you afford the regulatory risk of offshore data?"*

### 2. Naira Pricing — No Exchange Rate Risk
- All billing in Nigerian Naira (NGN)
- No foreign exchange exposure whatsoever
- Budget certainty month over month

> **Sales Pitch:** *"Your CFO budgets in Naira. AWS bills in dollars. When the exchange rate moves, your AWS bill changes overnight — even if you used the same resources. With Nobus, your bill is in Naira. Period. No surprises."*

### 3. Local Support — Same City, Same Timezone
- Support team based in Lagos
- Phone, email, and on-site support available
- Understand Nigerian business context and infrastructure challenges
- Can visit customer offices for enterprise accounts

> **Sales Pitch:** *"When your system goes down at 9 PM Lagos time, who answers? AWS support might take hours across time zones. Nobus support is HERE — same city, same timezone, speaking your language."*

### 4. Compliance First
- **ISO 27001** certified information security
- **PCI DSS** compliance supported for payment card environments
- **NDPR** aligned for data protection
- Built for regulated industries (banking, insurance, healthcare)

### 5. Cost Competitive — No Hidden Fees
- 15-30% cheaper than global hyperscalers for equivalent workloads
- **No egress fees** — data transfer out is completely FREE (AWS charges $0.09/GB!)
- Transparent pricing — what you see is what you pay

> **Sales Pitch:** *"AWS's egress fees alone can be 15-20% of your monthly bill. Every GB of data your users download, every API response — they charge for it. Nobus has ZERO egress fees. That's real money back in your pocket."*

### 6. Full Service Catalogue — Everything They Need
As a sales rep, know that Nobus offers a complete cloud platform:
- **FCS (Flexible Cloud Server)** — Virtual machines, launch in minutes, 15+ instance sizes
- **FBS (Flexible Block Storage)** — SSD-backed block storage, 1GB to 1TB, AES-256 encrypted
- **FOS (Flexible Object Storage)** — Unlimited file/media/backup storage
- **Networking:** VPC, Floating IPs, VPN, NFT (Fast Transit) for dedicated enterprise connectivity
- **Security:** Sophos XG Firewall, FortiGate Firewall, Acronis Cyber Protect
- **Managed Databases:** MySQL, PostgreSQL, MongoDB, MS SQL Server
- **Containers:** Managed Kubernetes (CKE) for container orchestration
- **Kafka:** Managed event streaming
- **DNS:** Free managed DNS for Nobus resources
- **Cloud Backup (NCB):** Cross-cloud backup — backs up AWS, Azure, on-prem, and Nobus workloads

> **Key Point:** You don't need to know how to configure these services — but you DO need to know they exist so you can have informed conversations and identify upsell opportunities.`
        },
        {
          id: 'sales-m1-l3',
          title: '1.3 The Market Opportunity',
          content: `## Cloud Adoption in Nigeria

- Massive untapped opportunity — the majority of Nigerian businesses are still on-premise
- Fast-growing cloud adoption driven by digital transformation, fintech boom, and regulatory pressure
- Nobus is uniquely positioned as the **only OpenStack-based Nigerian hyperscale cloud** with Tier III hosting

### Target Sectors (Priority Order) — With Specific Value Props

#### 1. Banking & Financial Services (Highest Value)
- **Why Nobus:** NDPR compliance, data sovereignty at Rack Centre, CBN regulatory alignment
- **Key Services:** Sophos XG Firewall for network security, FBS encrypted storage (AES-256), managed databases
- **Deal Size:** One bank deal = NGN 50M+/year
- **Entry Point:** Disaster recovery, dev/test environments, then production migration

#### 2. Fintech (Fast-Growing, Cloud-Native)
- **Why Nobus:** Kubernetes (CKE) for microservices architecture, Kafka for event streaming, auto-scaling for transaction spikes
- **Key Services:** CKE, Kafka, Load Balancers, managed PostgreSQL
- **Entry Point:** New application deployments, payment processing infrastructure

#### 3. Healthcare (Data Sensitivity)
- **Why Nobus:** Patient data must stay in Nigeria (NDPR), Acronis Cyber Protect for ransomware protection, AES-256 encrypted storage
- **Key Services:** FBS encrypted volumes, Acronis backup, Sophos XG firewall
- **Entry Point:** Electronic medical records, diagnostic imaging storage (FOS)

#### 4. Government (Mandate for Local)
- **Why Nobus:** Data sovereignty is a hard requirement, not a preference. Local support team, Naira billing simplifies procurement
- **Key Services:** VPC for network isolation, Security Groups, encrypted storage
- **Entry Point:** Agency websites, citizen-facing portals, email systems

#### 5. Telecom (Large Infrastructure)
- **Why Nobus:** NFT (Fast Transit) for dedicated high-bandwidth connectivity, scalable infrastructure
- **Key Services:** NFT, FCS high-compute flavors, managed databases

#### 6. E-commerce (Scalability Needs)
- **Why Nobus:** Auto-scaling for traffic spikes (Black Friday, sales events), load balancing across instances
- **Key Services:** Auto Scaling, Load Balancers, FOS for product images/media
- **Entry Point:** Peak traffic handling, media storage

#### 7. Education (Digital Transformation)
- **Why Nobus:** Affordable compute for learning management systems, Naira pricing fits education budgets

#### 8. Manufacturing (ERP Migration)
- **Why Nobus:** Migrate SAP/Oracle ERP to cloud, reduce CapEx on servers

> **Why This Matters:** These sectors have BUDGET and URGENCY. Focus your pipeline on sectors 1-4 first — they have the strongest compliance drivers that make cloud migration non-optional.`
        },
        {
          id: 'sales-m1-l4',
          title: '1.4 Buyer Personas',
          content: `## Understanding Your Buyers

### Persona 1: The CIO/CTO (Economic Buyer)
- **Age:** 40-55
- **Concerns:** Risk, reliability, compliance, career
- **Decision criteria:** Uptime SLAs, support, references
- **Pain points:** Aging infrastructure, OpEx budget pressure
- **What they care about:** "Will this work? Will I get fired if it fails?"

**How to Sell:**
- Lead with reliability and compliance (Rack Centre Tier III, ISO 27001)
- Show case studies from similar companies
- Offer referenceable customers
- Emphasize risk mitigation (Acronis backup, Sophos XG firewall, encrypted storage)
- Provide ROI analysis for CFO

---

### Persona 2: The IT Manager (Technical Buyer)
- **Age:** 30-45
- **Concerns:** Day-to-day operations, learning curve, support
- **Decision criteria:** Ease of use, documentation, support quality
- **Pain points:** Understaffed team, late nights fixing servers, NEPA/power issues

**How to Sell:**
- Demonstrate the Nobus console (cloud.nobus.io) — intuitive UI
- Highlight managed services (managed databases, CKE) = less work for them
- Emphasize local support — same timezone, phone support
- Show training options (Nobus Academy)
- Mention OpenStack CLI and Terraform support — tools they may already know

---

### Persona 3: The CFO (Financial Buyer)
- **Age:** 40-60
- **Concerns:** Cost, budget certainty, ROI, cash flow
- **Decision criteria:** TCO, OpEx vs. CapEx, payment terms

**How to Sell:**
- Lead with cost savings (15-30% vs AWS, zero egress fees)
- TCO calculator (show CapEx to OpEx benefit)
- Naira pricing stability — no FX risk
- Quick ROI (often <12 months)
- Free DNS, no egress fees = hidden savings vs competitors

---

### Persona 4: The CEO (Ultimate Buyer)
- **Age:** 45-65
- **Concerns:** Business growth, competitive advantage, risk

**How to Sell:**
- Business outcomes, not technology
- Speed to market (launch in minutes, not months)
- Competitive advantage (competitors already in cloud)
- Strategic partnership, not just a vendor`
        },
        {
          id: 'sales-m1-l5',
          title: '1.5 The Complete Nobus Product Portfolio',
          content: `## Everything Nobus Offers — A Sales-Friendly Reference

As a sales rep, you need to know the full product catalogue so you can identify opportunities and have informed conversations. You do NOT need to know how to configure these — but you need to know they exist and what problems they solve.

---

### Compute

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **FCS (Flexible Cloud Server)** | Virtual machines — Linux & Windows. 15+ instance flavors from 1 to 16 vCPU. Launch in minutes. | "Need a server? It's running in 5 minutes, not 5 weeks." |
| **Auto Scaling** | Automatically adds/removes instances based on demand | "Black Friday traffic spike? Your app scales automatically." |
| **Load Balancing** | Distributes traffic across multiple instances | "No single point of failure. Traffic balanced automatically." |

### Storage

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **FBS (Flexible Block Storage)** | Block storage from 1GB to 1TB. SSD-backed. AES-256 encrypted. Supports snapshots. | "Your data is encrypted at rest. Snapshots for instant rollback." |
| **FOS (Flexible Object Storage)** | Unlimited object storage for files, backups, media. Console: fos-az1.nobus.io | "Store unlimited files — backups, videos, documents. Pay only for what you use." |

### Networking

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **VPC / DaaS** | Private cloud networks — your own isolated virtual data center | "Your own private network in the cloud. Fully isolated." |
| **Floating IPs** | Static public IP addresses. NGN 1,500/month when reserved. | "Dedicated public IP for your application. Stays the same." |
| **NFT (Nobus Fast Transit)** | Dedicated connectivity from 50 Mbps to 10 Gbps. Enterprise-grade. | "Direct, dedicated connection to Nobus — not over public internet. Enterprise speed." |
| **VPN** | Site-to-site VPN via pfSense, IPSec | "Secure tunnel between your office and your Nobus cloud." |
| **DNS** | Managed DNS service — FREE for Nobus resources | "DNS is included at no extra cost." |
| **Cloud Router** | Route traffic between VPCs and networks | "Connect multiple networks together seamlessly." |
| **Cloud Trunks** | VLAN trunking for advanced networking | "Advanced network segmentation for enterprise architectures." |
| **Cloud Firewalls** | Network-level firewall rules | "Control what traffic enters and leaves your network." |

### Security

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **Sophos XG Firewall** | Enterprise firewall with IPS, ATP (Advanced Threat Protection), sandboxing | "Enterprise-grade security — intrusion prevention, threat detection, sandboxing. Same product banks use." |
| **FortiGate Firewall** | Next-gen firewall with SD-WAN capabilities | "Next-generation firewall with built-in SD-WAN. One appliance, multiple functions." |
| **Acronis Cyber Protect** | Backup + ransomware protection + antivirus in one | "Backup, anti-ransomware, and antivirus in a single solution. Protects against the threats keeping CISOs up at night." |
| **Security Groups** | Per-instance firewall rules | "Fine-grained access control on every single server." |

### Managed Services

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **Managed MySQL** | Fully managed MySQL database | "We manage patching, backups, scaling. Your team focuses on the app." |
| **Managed PostgreSQL** | Fully managed PostgreSQL database | "The world's most advanced open-source database — fully managed." |
| **Managed MongoDB** | Fully managed MongoDB (NoSQL) | "Document database for modern apps — fully managed." |
| **Managed MS SQL Server** | Fully managed Microsoft SQL Server | "Running .NET/Windows apps? SQL Server is available managed." |
| **Kubernetes (CKE)** | Managed container orchestration | "Run containers at scale. We manage the control plane." |
| **Kafka** | Managed event streaming | "Real-time data pipelines and event streaming — managed by us." |
| **Cloud Backup (NCB)** | Cross-cloud backup — backs up AWS, Azure, on-prem, AND Nobus | "Back up everything — even your AWS and Azure workloads — to Nobus. One backup solution for all clouds." |

### Platform Tools

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **Cloud Orchestration** | Infrastructure as Code — deploy entire stacks from templates | "Define your entire infrastructure in a template. Deploy in one click." |
| **Image Import/Export** | Migrate VM images from on-prem or other clouds | "Already have VMs? Import them directly to Nobus. No rebuild needed." |

---

> **Pro Tip for Sales:** When you hear a customer describe ANY infrastructure need, mentally map it to a Nobus product. "We need a database" = Managed Database. "We need backups" = NCB or Acronis. "We need security" = Sophos XG + Security Groups. Every need is an opportunity.`
        },
      ],
      quiz: {
        id: 'quiz-sales-m1',
        title: 'Session 1 Quiz: Nobus Cloud Overview',
        questions: [
          {
            q: 'What is the primary compliance advantage Nobus offers over AWS/Azure for Nigerian businesses?',
            options: ['Lower pricing', 'Data sovereignty - data stays in Nigeria (NDPR compliance)', 'More services available', 'Faster compute instances'],
            correct: 1,
          },
          {
            q: 'Which buyer persona is most concerned with TCO, OpEx vs CapEx, and budget certainty?',
            options: ['CIO/CTO', 'IT Manager', 'CFO', 'CEO'],
            correct: 2,
          },
          {
            q: 'What is the #1 priority target sector for Nobus Cloud sales?',
            options: ['E-commerce', 'Education', 'Banking & Financial Services', 'Manufacturing'],
            correct: 2,
          },
          {
            q: 'Which of the following is TRUE about Nobus pricing?',
            options: ['Nobus bills in USD', 'Nobus charges egress fees', 'Nobus bills in Naira with no egress fees', 'Nobus is more expensive than AWS'],
            correct: 2,
          },
          {
            q: 'Where is Nobus Cloud physically hosted?',
            options: ['AWS data center in Cape Town', 'Rack Centre (Tier III) in Lagos', 'Microsoft Azure facility in Abuja', 'Google Cloud region in Johannesburg'],
            correct: 1,
          },
          {
            q: 'What is NCB (Nobus Cloud Backup) capable of backing up?',
            options: ['Only Nobus workloads', 'Only on-premise servers', 'Cross-cloud: AWS, Azure, on-prem, and Nobus workloads', 'Only Windows servers'],
            correct: 2,
          },
          {
            q: 'Which Nobus product provides dedicated enterprise connectivity from 50 Mbps to 10 Gbps?',
            options: ['VPN', 'Floating IP', 'NFT (Nobus Fast Transit)', 'Cloud Router'],
            correct: 2,
          },
          {
            q: 'What is the cost of Nobus managed DNS for Nobus resources?',
            options: ['NGN 5,000/month', 'NGN 1,500/month', 'NGN 10,000/month', 'Free'],
            correct: 3,
          },
        ],
      },
    },
    {
      id: 'sales-m2',
      title: 'Session 2: Sales Process & Discovery',
      day: 1,
      time: '9:45 AM - 11:15 AM',
      lessons: [
        {
          id: 'sales-m2-l1',
          title: '2.1 The Nobus Sales Process',
          content: `## 6-Stage Sales Process

### Stage 1: Lead Generation (Your responsibility)
- **Outbound:** Cold calls, LinkedIn, events
- **Inbound:** Webinars, website, referrals
- **Marketing:** Content, SEO, partnerships
- **Your Goal:** Get 30-minute intro call

### Stage 2: Initial Discovery Call (30-45 min)
- Qualify: BANT (Budget, Authority, Need, Timeline)
- Understand: Current infrastructure, pain points
- Educate: Nobus value proposition
- **Your Goal:** Schedule deep-dive technical call

### Stage 3: Technical Discovery (60-90 min, includes Nobus engineer)
- Map current architecture
- Identify migration candidates
- Discuss concerns and objections
- Demonstrate Nobus platform (cloud.nobus.io)
- **Your Goal:** Agreement to proceed with proposal

### Stage 4: Proposal & PoC (1-2 weeks)
- Written proposal with pricing (Naira-denominated)
- Optional: Proof of Concept (4 weeks)
- Reference calls if requested
- **Your Goal:** Verbal commitment to proceed

### Stage 5: Negotiation & Close (1-2 weeks)
- Commercial terms, Contract review
- Executive sign-off, Purchase order
- **Your Goal:** Signed contract

### Stage 6: Implementation (1-3 months)
- Onboarding and migration
- Training, Go-live
- Transition to support
- **Your Goal:** Successful production deployment + testimonial

**Typical Timeline:** 2-4 months for new logo, 2-6 weeks for expansion`
        },
        {
          id: 'sales-m2-l2',
          title: '2.2 Discovery Framework: SPIN Selling',
          content: `## SPIN Selling Framework

### S - Situation Questions (Understand current state)
- "Walk me through your current infrastructure setup."
- "How many servers are you running today?"
- "Where is your data center located?"
- "Who manages your infrastructure?"
- "What percentage of your IT budget goes to infrastructure?"

### P - Problem Questions (Uncover pain)
- "How often do you experience downtime?"
- "What happens when you run out of capacity?"
- "How long does it take to provision new servers?"
- "What keeps you up at night about your current setup?"
- "Tell me about the last time infrastructure blocked a business initiative."

### I - Implication Questions (Amplify pain)
- "If you had another 6-hour outage, what would be the business impact?"
- "How much revenue do you lose per hour of downtime?"
- "If you can't scale for the Christmas rush, what happens?"
- "What does slow infrastructure provisioning cost you in time-to-market?"

### N - Need-Payoff Questions (Paint vision)
- "If you could provision servers in 5 minutes instead of 5 weeks, what would that enable?"
- "What if you only paid for what you actually use?"
- "How would 99.95% uptime change your operations?"
- "What could you do with the NGN 20M you'd save on infrastructure?"`
        },
        {
          id: 'sales-m2-l3',
          title: '2.3 Qualification: The BANT Framework',
          content: `## BANT Qualification Framework

### B - Budget
**Good Questions:**
- "What are you currently spending on infrastructure?"
- "Do you have budget approved for this fiscal year?"
- "Are you looking at CapEx or OpEx budget?"

**Don't Ask:** "How much money do you have?" (too direct)

**Decision Criteria:**
- GO: Budget identified and accessible
- CAUTION: "We need to find budget" (lower priority)
- STOP: "No budget and no path to budget"

---

### A - Authority
**Good Questions:**
- "Who else is involved in this decision?"
- "Walk me through your approval process."
- "Who has the final sign-off?"

**Decision Criteria:**
- GO: Speaking with decision-maker OR clear path to them
- CAUTION: Speaking with influencer (keep qualifying)
- STOP: Speaking with blocker or no access

---

### N - Need
**Good Questions:**
- "What's driving this initiative right now?"
- "What problem are you trying to solve?"
- "What happens if you don't solve this in the next 6 months?"

---

### T - Timeline
**Good Questions:**
- "When do you need this operational?"
- "What's driving that timeline?"
- "When does your fiscal year end?" (budget urgency)

## Qualifying Scorecard

| Criteria | Score (0-3) | Weight |
|----------|-------------|--------|
| Budget Identified | _ | 3x |
| Authority Access | _ | 3x |
| Compelling Need | _ | 2x |
| Timeline <90 days | _ | 2x |
| Right Fit (use case) | _ | 1x |

- **25+**: High priority, schedule technical deep-dive immediately
- **15-24**: Medium priority, continue discovery
- **<15**: Low priority, disqualify or nurture`
        },
      ],
      quiz: {
        id: 'quiz-sales-m2',
        title: 'Session 2 Quiz: Sales Process & Discovery',
        questions: [
          {
            q: 'In the SPIN selling framework, what do "I" questions do?',
            options: ['Identify the current situation', 'Amplify the pain of the problem', 'Present the Nobus solution', 'Investigate the budget'],
            correct: 1,
          },
          {
            q: 'What is the typical timeline for closing a new logo deal?',
            options: ['1-2 weeks', '2-4 months', '6-12 months', '1-2 days'],
            correct: 1,
          },
          {
            q: 'A prospect scores 28 on the BANT qualifying scorecard. What should you do?',
            options: ['Disqualify them', 'Continue discovery', 'Schedule technical deep-dive immediately', 'Nurture the lead'],
            correct: 2,
          },
          {
            q: 'What is the goal of Stage 2 (Initial Discovery Call)?',
            options: ['Get a signed contract', 'Schedule a deep-dive technical call', 'Deliver a proposal', 'Begin implementation'],
            correct: 1,
          },
        ],
      },
    },
    {
      id: 'sales-m3',
      title: 'Session 3: Competitive Positioning',
      day: 1,
      time: '11:30 AM - 1:00 PM',
      lessons: [
        {
          id: 'sales-m3-l1',
          title: '3.1 Your Competition',
          content: `## Primary Competitors

1. **AWS (Amazon Web Services)** - 800 lb gorilla, market leader
2. **Microsoft Azure** - Enterprise-focused, strong in Microsoft shops
3. **Google Cloud** - Data/AI-focused
4. **On-Premise** - Status quo (biggest competitor!)

### Secondary
- Other Nigerian cloud providers (if any)
- Hosting companies positioning as "cloud"

> **Key Insight:** On-Premise is your REAL competition. Most Nigerian businesses are still on-premise! Every on-prem server is an opportunity for Nobus.`
        },
        {
          id: 'sales-m3-l2',
          title: '3.2 Battlecard: Nobus vs. AWS',
          content: `## Nobus vs. AWS Comparison

| Factor | Nobus | AWS | Your Talking Point |
|--------|-------|-----|-------------------|
| **Data Location** | Rack Centre, Lagos (Tier III) | Nearest region: Cape Town or Europe | "Your data stays in Nigeria at Rack Centre. NDPR compliant by design." |
| **Currency** | Bill in Naira (NGN) | Bill in USD | "No exchange rate risk. Your bill is in Naira — period." |
| **Support** | Lagos-based, same timezone, phone | Different timezone, mostly online tickets | "When your system crashes at 9 PM, we answer in Lagos." |
| **Pricing** | 15-30% cheaper for equivalent workloads | Premium pricing + hidden egress fees | "Same quality, better price. Plus zero egress fees." |
| **Egress Fees** | NONE — completely free | $0.09/GB (can be 15-20% of bill) | "Data transfer out is FREE on Nobus. AWS charges per GB." |
| **Compliance** | ISO 27001, PCI-DSS supported, NDPR | ISO 27001, PCI-DSS | "Equally certified, but data stays in Nigeria." |
| **Complexity** | Focused catalogue of essential services | 200+ services, overwhelming complexity | "We focus on what Nigerian businesses actually need." |
| **Onboarding** | White-glove migration support | Self-service, figure it out yourself | "We train your team. Walk you through migration step by step." |
| **Tooling** | OpenStack CLI, Terraform, REST APIs | AWS CLI, Terraform, SDKs | "Your team can use Terraform, CLI, APIs — same DevOps tools they know." |
| **Compute** | FCS — 15+ flavors, launch in minutes | EC2 — hundreds of instance types | "Right-sized for Nigerian workloads. No analysis paralysis." |
| **Storage** | FBS (encrypted, SSD) + FOS (unlimited) | EBS + S3 | "SSD-backed, AES-256 encrypted storage. Object storage unlimited." |
| **Security** | Sophos XG, FortiGate, Acronis included in catalogue | Marketplace add-ons at extra cost | "Enterprise firewalls and backup built into our platform." |

### What TO Say
- "AWS is excellent for global companies with multi-region needs. For Nigerian businesses prioritizing data sovereignty, local support, and cost predictability, Nobus is the better fit."
- "Many of our customers evaluated AWS and chose Nobus because of Naira billing, zero egress fees, and having support in the same city."
- "Your team can use the same tools — Terraform, CLI — so there's no retraining cost."

### What NOT to Say
- "AWS sucks" (unprofessional, damages your credibility)
- "We're better than AWS at everything" (not believable — be honest about trade-offs)`
        },
        {
          id: 'sales-m3-l3',
          title: '3.3-3.4 Battlecards: Azure & On-Premise',
          content: `## Nobus vs. Azure

| Factor | Nobus | Azure | Talking Point |
|--------|-------|-------|---------------|
| **Focus** | Nigerian SMBs to Enterprise | Microsoft-centric shops | "If you're 100% Microsoft everywhere, Azure has integration advantages. If not, Nobus is simpler and cheaper." |
| **Integration** | Cloud-agnostic — Linux, Windows, any stack | Deep Microsoft integration (AD, 365) | "Nobus supports Linux, Windows, any stack. No vendor lock-in." |
| **Pricing** | Transparent, in Naira | Complex licensing, USD billing | "Nobus pricing is simple: NGN X per hour, no surprise licensing fees." |
| **Data Location** | Rack Centre, Lagos | Nearest: South Africa | "Your data stays in Nigeria, not South Africa." |
| **Managed DBs** | MySQL, PostgreSQL, MongoDB, MS SQL Server | Azure SQL, Cosmos DB, etc. | "We support MS SQL Server too — managed, in Nigeria." |

---

## Nobus vs. On-Premise (Status Quo)

**This is your REAL competition.** Most Nigerian businesses are still on-premise!

| Factor | On-Premise | Nobus | Talking Point |
|--------|-----------|-------|---------------|
| **CapEx** | NGN 50M+ upfront for servers | NGN 0 upfront, pay-as-you-go | "No need to write a NGN 50M cheque. Pay monthly from NGN 50K." |
| **OpEx** | NGN 10-20M/year (power, staff, cooling) | NGN 5-15M/year | "No power costs, no cooling, no hardware staff." |
| **Scalability** | Buy ahead, wait weeks | Instant — launch FCS in minutes | "Black Friday traffic? Scale in 5 minutes, not 5 weeks." |
| **Downtime** | Your problem entirely | Nobus manages infrastructure | "Server fails? We replace it in minutes. You don't even know." |
| **Compliance** | Build it yourself (expensive) | ISO 27001 certified, PCI-DSS supported | "You need ISO 27001? We already have it. You inherit compliance." |
| **Power / NEPA** | Generator dependency, diesel costs | Rack Centre has redundant power systems | "Power goes out in Lagos? Rack Centre has redundant power — UPS, generators, dual utility feeds. Zero impact on your workloads." |
| **Security** | Buy firewalls, hire security staff | Sophos XG, FortiGate, Acronis available | "Enterprise security built in — not a NGN 20M+ add-on project." |
| **Backup** | Tapes, external drives, hope | NCB cross-cloud backup, Acronis Cyber Protect | "Automated backups with ransomware protection. Not a tape in a drawer." |
| **Connectivity** | Your ISP | NFT (Fast Transit) — dedicated 50Mbps to 10Gbps | "Direct, dedicated connection to your cloud. Not dependent on public internet." |

### Common On-Premise Objections

**"But we already own the servers."**
> "True, but that's sunk cost. What's cheaper for the NEXT 3 years — maintaining aging hardware or Nobus?"

**"Our data is too sensitive for cloud."**
> "Your data would be at Rack Centre — the same Tier III facility where banks host. AES-256 encrypted storage. Sophos XG firewall. More secure than most on-prem setups."

**"Cloud is expensive."**
> "Let's do the math. Your server: NGN 2M purchase + NGN 500K/year power/cooling/staff. Nobus equivalent: NGN 100K/month. In 3 years, we're cheaper — PLUS you get redundancy, backup, and 24/7 support."

**"What about when internet goes down?"**
> "That's exactly what NFT (Fast Transit) solves — a dedicated connection from 50 Mbps to 10 Gbps, bypassing the public internet entirely. Enterprise-grade connectivity."`
        },
      ],
      quiz: {
        id: 'quiz-sales-m3',
        title: 'Session 3 Quiz: Competitive Positioning',
        questions: [
          {
            q: 'What is Nobus\'s BIGGEST competitor in Nigeria?',
            options: ['AWS', 'Azure', 'Google Cloud', 'On-Premise (Status Quo)'],
            correct: 3,
          },
          {
            q: 'What is a key advantage Nobus has over AWS regarding data transfer?',
            options: ['Faster network speeds', 'No egress fees', 'More data centers', 'Free inbound data'],
            correct: 1,
          },
          {
            q: 'When a prospect says "AWS is the industry standard," what should you NOT say?',
            options: ['"AWS is excellent for global companies"', '"Many of our customers evaluated AWS and chose Nobus"', '"AWS sucks"', '"For Nigerian businesses, Nobus is often the better fit"'],
            correct: 2,
          },
          {
            q: 'What Nobus product addresses the on-premise objection "What about when internet goes down?"',
            options: ['VPN', 'Floating IP', 'NFT (Nobus Fast Transit) — dedicated connectivity', 'Cloud Router'],
            correct: 2,
          },
        ],
      },
    },
    {
      id: 'sales-m4',
      title: 'Session 4: Proposal Development',
      day: 1,
      time: '2:00 PM - 3:30 PM',
      lessons: [
        {
          id: 'sales-m4-l1',
          title: '4.1 Proposal Structure',
          content: `## Every Proposal Must Include These 8 Sections

### 1. Executive Summary (1 page)
- Their problem
- Our solution
- Key benefits (3-5 bullet points)
- Total investment (in Naira)
- Next steps

> **Keep it short!** Execs won't read past page 1 if not hooked.

### 2. Understanding Your Business (1 page)
- Demonstrate you listened in discovery
- Repeat their pain points back
- Show you understand their industry

### 3. Proposed Solution (2-3 pages)
- High-level architecture diagram
- Specific Nobus services included (FCS flavors, FBS volumes, networking)
- How it solves their problems
- Why this approach

### 4. Implementation Plan (1 page)
- Timeline: Weeks 1-4, 5-8, 9-12
- Milestones
- Roles and responsibilities
- Training plan

### 5. Pricing (1-2 pages)
- Monthly recurring costs (itemized by Nobus product)
- One-time setup costs (if any)
- 12-month projection
- 3-year TCO comparison vs. current state
- Payment terms
- **Always include:** Floating IPs, FBS storage, backup (NCB/Acronis), and note that DNS is FREE

### 6. Success Stories (1 page)
- 2-3 brief customer stories
- Similar company size or industry
- Quantified results
- Quote from customer if possible

### 7. Why Nobus (1 page)
- Data sovereignty (Rack Centre, Lagos)
- Compliance (ISO 27001, PCI-DSS, NDPR)
- Support quality (local, same timezone)
- Company stability (Nkponani Limited)
- Partnership approach

### 8. Next Steps (1/2 page)
- Clear call-to-action
- Timeline for decision
- Who to contact

**Total length: 10-12 pages max.** Nobody reads 50-page proposals.`
        },
        {
          id: 'sales-m4-l2',
          title: '4.2 Pricing Your Proposal',
          content: `## Step-by-Step Pricing Guide

### Step 1: Size the Workload
Ask in discovery:
- How many applications?
- How many users?
- How much data?
- Current infrastructure specs?
- Performance requirements?

### Step 2: Map to Nobus Services (Use Actual Nobus Flavors)

Nobus FCS instance flavors follow a naming convention: \`[type].[vCPUs].[RAM_GB].[Disk_GB].[OS]\`

Common flavors you'll use in proposals:
- **si.1.2.20.l** — 1 vCPU, 2GB RAM, 20GB disk, Linux (small apps, dev/test)
- **si.2.4.30.l** — 2 vCPU, 4GB RAM, 30GB disk, Linux (web servers, small apps)
- **si.4.8.60.l** — 4 vCPU, 8GB RAM, 60GB disk, Linux (medium workloads)
- **si.8.16.120.l** — 8 vCPU, 16GB RAM, 120GB disk, Linux (databases, heavy apps)
- **si.16.32.240.l** — 16 vCPU, 32GB RAM, 240GB disk, Linux (enterprise workloads)
- Windows variants use \`.w\` suffix instead of \`.l\`

---

### Example Proposal: Web Application Migration

**Current State (On-Prem):**
- 2 web servers, 1 database server, 1 backup server
- 2TB storage, unreliable power, no disaster recovery
- Cost: NGN 15M/year (CapEx + OpEx including diesel, staff, cooling)

**Nobus Proposed Solution:**

| Item | Nobus Product | Spec | Monthly Cost |
|------|--------------|------|-------------|
| Web Server 1 | FCS | si.2.4.30.l (2 vCPU, 4GB, 30GB) | NGN 50,000 |
| Web Server 2 | FCS | si.2.4.30.l (2 vCPU, 4GB, 30GB) | NGN 50,000 |
| Database Server | FCS | si.4.8.60.l (4 vCPU, 8GB, 60GB) | NGN 120,000 |
| Database Storage | FBS | 500GB SSD, AES-256 encrypted | NGN 25,000 |
| Backup Storage | FBS | 1TB SSD for snapshots | NGN 40,000 |
| Cloud Backup | NCB | Automated daily backup, 30-day retention | NGN 30,000 |
| Load Balancer | LB | Distributes traffic across web servers | NGN 25,000 |
| Floating IP (Web) | Floating IP | 1x static public IP | NGN 1,500 |
| Floating IP (DB Admin) | Floating IP | 1x static public IP | NGN 1,500 |
| DNS | Nobus DNS | Managed DNS for domain | **FREE** |
| **TOTAL** | | | **NGN 343,000/month** |

**Annual Cost: NGN 4,116,000/year**
**Savings vs On-Prem: NGN 15M - NGN 4.1M = NGN 10.9M/year (73% reduction!)**

---

### Example Proposal: Fintech with Security Stack

| Item | Nobus Product | Spec | Monthly Cost |
|------|--------------|------|-------------|
| App Servers (x3) | FCS | si.4.8.60.l | NGN 360,000 |
| Database (Primary) | Managed PostgreSQL | 4 vCPU, 16GB | NGN 200,000 |
| Database (Replica) | Managed PostgreSQL | 4 vCPU, 16GB | NGN 200,000 |
| Block Storage | FBS | 2TB SSD, encrypted | NGN 80,000 |
| Object Storage | FOS | 5TB for logs/media | NGN 50,000 |
| Firewall | Sophos XG | Enterprise IPS + ATP | NGN 150,000 |
| Backup | Acronis Cyber Protect | All servers + ransomware protection | NGN 100,000 |
| Floating IPs (x3) | Floating IP | Static public IPs | NGN 4,500 |
| DNS | Nobus DNS | | **FREE** |
| **TOTAL** | | | **NGN 1,144,500/month** |

### Step 3: Add Contingency
- Development/Test environment: +50% of production cost
- Training: NGN 500K one-time
- Migration support: NGN 1-2M one-time
- Safety buffer: +10%

### Step 4: Position the Price
**Good:** "For NGN 343,000 per month — less than the cost of one junior developer — you get enterprise-grade infrastructure at Rack Centre with 99.95% uptime, automated backups, managed DNS at no extra cost, and local support."

**Bad:** "It costs NGN 343,000 per month." (Just a number, no context)

> **Always highlight free items:** DNS is free. Egress is free. These are real savings vs AWS/Azure.`
        },
      ],
      quiz: {
        id: 'quiz-sales-m4',
        title: 'Session 4 Quiz: Proposal Development',
        questions: [
          {
            q: 'What is the recommended maximum length for a proposal?',
            options: ['5 pages', '10-12 pages', '25 pages', '50 pages'],
            correct: 1,
          },
          {
            q: 'How should you position the price to a customer?',
            options: ['Just state the number plainly', 'Compare it to a relatable cost and highlight value', 'Always offer a discount upfront', 'Avoid discussing price entirely'],
            correct: 1,
          },
          {
            q: 'What does the Nobus FCS flavor "si.2.4.30.l" represent?',
            options: ['2 servers, 4TB storage, 30 users, Linux', '2 vCPU, 4GB RAM, 30GB disk, Linux', '2GHz CPU, 4 cores, 30GB RAM, Large', 'Series 2, Generation 4, 30-day billing, Linux'],
            correct: 1,
          },
          {
            q: 'Which of these items should ALWAYS be included in a Nobus proposal at no cost?',
            options: ['Sophos XG Firewall', 'Managed DNS and zero egress fees', 'Acronis Cyber Protect', 'NFT Fast Transit'],
            correct: 1,
          },
        ],
      },
    },
    {
      id: 'sales-m5',
      title: 'Session 5: Proof of Concept Strategy',
      day: 1,
      time: '3:45 PM - 5:00 PM',
      lessons: [
        {
          id: 'sales-m5-l1',
          title: '5.1-5.2 When to Recommend & Structure a PoC',
          content: `## When to Recommend a PoC

### YES - Recommend PoC when:
- Large deal (>NGN 10M/year)
- Risk-averse buyer
- Technical complexity or uncertainty
- Competitive situation (we're not incumbent)
- First cloud project for the company

### NO - Skip PoC when:
- Small deal (<NGN 2M/year)
- Simple, well-understood use case
- They're already convinced
- Existing customer expanding

### PoC vs. Pilot vs. Trial
- **PoC:** Validates feasibility. Usually free. 2-4 weeks.
- **Pilot:** Small production deployment. Paid (discounted). 1-3 months.
- **Trial:** Test drive. Free tier or credit. Days to weeks.

## PoC Charter Template

| Section | Details |
|---------|---------|
| **Objective** | Demonstrate that Nobus can host [APPLICATION] |
| **Success Criteria** | Performance <100ms, 99.95% uptime, Pass security scan, 30%+ savings |
| **Scope** | Migrate specific application, production-like architecture |
| **Timeline** | 4 weeks (Setup - Migration - Testing - Analysis) |
| **Investment** | Nobus waives infra costs; Customer: 2 engineers, 8 hrs/week |

> **Critical:** Get them to agree UPFRONT what "success" looks like. Otherwise, they'll keep adding requirements and never decide.`
        },
        {
          id: 'sales-m5-l2',
          title: '5.3-5.4 PoC Execution & Converting to Production',
          content: `## PoC Execution Tips

### Before You Start
- Get signed PoC charter
- Confirm decision date (don't let it drag on)
- Assign Nobus technical resource
- Schedule weekly check-ins
- Set up communication channel (WhatsApp/Slack)

### During the PoC
- Weekly status updates (even if "no change")
- Document everything (screenshots, metrics)
- Proactively solve problems
- Build relationship with technical team
- Identify internal champion

### After the PoC
- Present results formally (PowerPoint)
- Quantify success (numbers, not opinions)
- Get testimonial from technical team
- Ask for the business (don't be shy!)

## Converting PoC to Production

### Common Stall Tactics (and How to Overcome)

**Stall:** "PoC was successful! We need to run another test..."
> **Response:** "Great! What specifically wasn't validated? Let's address that concern directly."

**Stall:** "Let me socialize this internally..."
> **Response:** "Absolutely. How can I help? Would it help if I presented to your team?"

**Stall:** "We want to test AWS too..."
> **Response:** "Of course! When is AWS's PoC scheduled? Can we agree that if Nobus matches or beats their results, you'll move forward with us?"

### The Close
> "The PoC was successful — you saw [specific results]. You mentioned [pain point] is costing you [amount]. We can solve it. What questions remain before we proceed?"

Then **SHUT UP**. First person who speaks loses. Let silence do the work.`
        },
      ],
      quiz: {
        id: 'quiz-sales-m5',
        title: 'Session 5 Quiz: PoC Strategy',
        questions: [
          {
            q: 'When should you SKIP a PoC?',
            options: ['Large deal with risk-averse buyer', 'Competitive situation', 'Existing customer expanding with simple use case', 'First cloud project for the company'],
            correct: 2,
          },
          {
            q: 'What is the most critical thing to do BEFORE starting a PoC?',
            options: ['Set up monitoring', 'Get agreement on success criteria upfront', 'Build the architecture', 'Train the customer team'],
            correct: 1,
          },
          {
            q: 'A prospect says "The PoC was great, but we want to test AWS too." What is the best response?',
            options: ['Badmouth AWS to discourage them', 'Agree and ask when AWS PoC is scheduled, then propose a comparison commitment', 'Offer a 50% discount immediately', 'Tell them AWS won\'t work for them'],
            correct: 1,
          },
          {
            q: 'What should you do immediately after the prospect says "What questions remain before we proceed?"',
            options: ['List all features again', 'Offer a discount', 'Stay silent — let them respond first', 'Schedule another meeting'],
            correct: 2,
          },
        ],
      },
    },
    {
      id: 'sales-m6',
      title: 'Session 6: Objection Handling',
      day: 2,
      time: '8:00 AM - 10:00 AM',
      lessons: [
        {
          id: 'sales-m6-l1',
          title: '6.1 The Objection Handling Framework',
          content: `## 5-Step Objection Handling Framework

1. **Listen** (don't interrupt)
2. **Acknowledge** (show empathy)
3. **Question** (understand the real objection)
4. **Answer** (address the concern)
5. **Confirm** (check if resolved)

### Example
**Prospect:** "Your price is too high."

**Bad Response:** "No it's not! AWS is more expensive!"

**Good Response:**
1. Listen: [Let them finish]
2. Acknowledge: "I understand price is a concern..."
3. Question: "...help me understand what you're comparing us to?"
4. Answer: [Tailored response based on their comparison]
5. Confirm: "Does that address your concern, or is there something else?"`
        },
        {
          id: 'sales-m6-l2',
          title: '6.2-6.3 Top Objections & Hidden Objections',
          content: `## Handling Price Objections

**"That's too expensive."**

Don't argue! Ask: "Help me understand — what's too expensive relative to? What were you expecting?"

**If comparing to on-prem:**
> "You're spending NGN 15M/year today including power, staff, and cooling. We're NGN 4.1M with backups, security, and support included. That's 73% cheaper. What am I missing?"

**If comparing to AWS:**
> "AWS quoted NGN X? Let's compare apples to apples. Does their quote include egress fees? Those alone can be 15-20% of the bill. Does it include enterprise firewall? DNS? Nobus includes free egress and free DNS. Customers typically find Nobus 20-30% less total."

**If no budget:**
> "Can we phase this? Start with just production on si.2.4.30.l instances for NGN 300K/month, add dev/test in Q2?"

**If pushing for discount:**
> "Here's what I can do: [10% discount for annual prepay OR bundled services OR extended payment terms]. Does that help?"

### What NOT to do
- Immediately discount (trains them to ask for more)
- Badmouth the competition
- Argue about value
- Give up and walk away

---

## The "Hidden Objection"

Sometimes the stated objection isn't the real objection.

### Signs of a Hidden Objection
- Your answer doesn't resolve their concern
- They keep bringing up same objection differently
- Body language seems off
- They won't commit even after objections "resolved"

### How to Uncover
> "I feel like there's something else concerning you. What is it?"
> "If we solved [stated objection], would you move forward? Or is there something else?"

### Common Hidden Objections
- Fear of change / career risk
- Political issues internally
- Already decided on competitor
- No real budget
- Not the decision maker`
        },
      ],
      quiz: {
        id: 'quiz-sales-m6',
        title: 'Session 6 Quiz: Objection Handling',
        questions: [
          {
            q: 'What is the FIRST step in the objection handling framework?',
            options: ['Answer immediately', 'Listen without interrupting', 'Question their logic', 'Present counter-evidence'],
            correct: 1,
          },
          {
            q: 'A prospect keeps raising the same objection in different ways even after you\'ve addressed it. This likely indicates:',
            options: ['They need more technical details', 'A hidden objection', 'They want a discount', 'They need to talk to their team'],
            correct: 1,
          },
          {
            q: 'A prospect says "AWS quoted us less." What is the best response approach?',
            options: ['Immediately match the AWS price', 'Ask to compare apples to apples — does AWS include egress fees, DNS, firewall?', 'Tell them AWS is lying', 'Walk away from the deal'],
            correct: 1,
          },
          {
            q: 'Which of the following is a common hidden objection?',
            options: ['The price is genuinely too high', 'They need more storage', 'Fear of change or career risk if migration fails', 'They want Windows instead of Linux'],
            correct: 2,
          },
        ],
      },
    },
  ],
};

export default salesCourse;
