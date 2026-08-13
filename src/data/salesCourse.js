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

> **Why this matters:** Every sales conversation starts with credibility. Before a customer trusts Nobus with their infrastructure, they will test whether YOU know who Nobus is, where it runs, and why it exists. This lesson gives you that foundation, cold.

### What you will learn
- The Nobus company story and how to tell it in 60 seconds
- The infrastructure facts that establish enterprise credibility
- The billing model that wins CFO conversations

### The company in one paragraph
Nobus Cloud Services (NCS) is a public cloud provider purpose-built for Africa's digital evolution, operated by **Nkponani Limited**. Its mission is to unlock Africa's digital potential: enterprise-grade cloud, priced in local currency, run from African soil, supported by African engineers. The tagline says it plainly: *"Africa deserves nothing less."*

### Infrastructure facts you must know by heart

| Fact | Detail | Why the customer cares |
|---|---|---|
| Data centers | Nobus Cloud infrastructure is **hosted in** Tier III data centers across three availability zones: nobus-wa-az1 (Rack Centre, Ikeja Lagos), nobus-wa-az2 (OADC, Lekki Lagos), nobus-ea-az1 (ADC, Nairobi, Kenya) | Same facility class trusted by banks and telcos |
| Anchor region | Lagos, Nigeria (including Rack Centre) | In-country data residency for local customers |
| East Africa | nobus-ea-az1 (ADC) in Nairobi, Kenya | In-region service for East African customers |
| Uptime | 99.982% guarantee with N+1 redundancy | Beats most on-premise setups by a wide margin |
| Platform | Hyperscale cloud infrastructure | Standard tooling (Terraform, CLI, REST APIs) works as engineers expect |
| Console | dashboard.nobus.io | One console for every service; easy to demo |

### The billing model (your strongest opener)
- **local billing.** Every invoice in local currency. The customer's budget and their bill live in the same currency, so exchange-rate swings never touch them.
- **Pre-billing system.** Customers fund a wallet; resources bill from the start of each cycle while running. Auto-billing tops up from a saved card 3 days before the cycle if the wallet is low, so services never stop unexpectedly.
- **Pay-as-you-use.** Entry compute starts around **9,309 per month**. No long-term commitment required.
- **No egress fees.** Data leaving Nobus is free. On AWS, egress alone can be 15-20% of the monthly bill.

### Compliance posture
For the **local market**, Nobus is **ISO 27001 certified**, **PCI DSS certified** and **NDPA compliant** (Nigeria Data Protection Act) - the exact credentials banks, government and healthcare buyers demand. For **Kenya**, Nobus is **ODPC compliant** (Office of the Data Protection Commissioner), covering workloads in the Nairobi zone.

### Tell the story in 60 seconds (memorize this)
> "Nobus is Africa's cloud. Nobus Cloud infrastructure is hosted in Tier III data centers across African availability zones, two in Lagos (Ikeja and Lekki) and one in Nairobi, Kenya. You get the same building blocks as AWS: virtual machines, block and object storage, Kubernetes, managed databases, firewalls. The difference is that your data stays in Africa, your bill is in local currency, your support engineer is in your time zone, and there are no egress fees. That is why banks, fintechs and government agencies are moving here."

### Key takeaways
- Nobus does not own the buildings: its infrastructure is **hosted in** Tier III data centers across three zones, Ikeja and Lekki in Lagos plus Nairobi in Kenya
- Lead with local billing and zero egress fees in every first conversation
- For the local market, **ISO 27001, PCI DSS and NDPA compliance** are your credibility anchors with technical and compliance buyers; uptime and data residency reinforce them`
        },
        {
          id: 'sales-m1-l2',
          title: '1.2 The Nobus Difference',
          content: `## Competitive Advantages (Your Selling Points)

### 1. Data Sovereignty
- local customer data stays in-country, in **two Tier III-certified Nigerian availability zones**: nobus-wa-az1 (Rack Centre, Ikeja) and nobus-wa-az2 (OADC, Lekki)
- Full **NDPA (Nigeria Data Protection Act)** compliance
- No foreign government access to customer data
- Critical for banks, government agencies, healthcare providers

> **Sales Pitch:** *"Unlike AWS or Azure where your data sits in Europe or the US, Nobus keeps your data in Nigeria, in Tier III certified local data centers. For banks and government agencies, this isn't just convenient; it's often a legal requirement under NDPA. Can you afford the regulatory risk of offshore data?"*

### 2. Local Pricing - No Exchange Rate Risk
- All billing in local currency
- No foreign exchange exposure whatsoever
- Budget certainty month over month

> **Sales Pitch:** *"Your CFO budgets in local currency. AWS bills in dollars. When the exchange rate moves, your AWS bill changes overnight - even if you used the same resources. With Nobus, your bill is in local currency. Period. No surprises."*

### 3. Local Support - Same City, Same Timezone
- Support team based in Lagos
- Phone, email, and on-site support available
- Understand local business context and infrastructure challenges
- Can visit customer offices for enterprise accounts

> **Sales Pitch:** *"When your system goes down at 9 PM Lagos time, who answers? AWS support might take hours across time zones. Nobus support is HERE - same city, same timezone, speaking your language."*

### 4. Compliance First (local market)
- **ISO 27001** certified information security
- **PCI DSS** certified for payment card environments
- **NDPA** compliant for data protection in Nigeria
- **ODPC** compliant for data protection in Kenya
- Built for regulated industries (banking, insurance, healthcare)

### 5. Cost Competitive - No Hidden Fees
- 30-40% cheaper than global hyperscalers for equivalent workloads
- **No egress fees** - data transfer out is completely FREE (AWS charges $0.09/GB!)
- Transparent pricing - what you see is what you pay

> **Sales Pitch:** *"AWS's egress fees alone can be 15-20% of your monthly bill. Every GB of data your users download, every API response - they charge for it. Nobus has ZERO egress fees. That's real money back in your pocket."*

### 6. Full Service Catalogue - Everything They Need
As a sales rep, know that Nobus offers a complete cloud platform:
- **FCS (Flexible Compute Service)** - Virtual machines, launch in minutes, 15+ instance sizes
- **FBS (Flexible Block Storage)** - SSD-backed block storage, AES-256 encrypted
- **FOS (Flexible Object Storage)** - Unlimited file/media/backup storage
- **Networking:** VPC, Floating IPs, VPN, NFT (Fast Transit) for dedicated enterprise connectivity
- **Security:** Sophos XG Firewall, FortiGate Firewall, Fortinet FortiSIEM, Acronis Cyber Protect
- **Managed Databases:** MySQL, PostgreSQL, MongoDB, MS SQL Server
- **Containers:** Managed Kubernetes (NKE) for container orchestration
- **Kafka:** Managed event streaming
- **DNS:** Free managed DNS for Nobus resources
- **Nobus Cloud Backup (NCB):** Multi-cloud backup - protects AWS, Azure, Google Cloud, on-prem and Nobus workloads, plus Microsoft 365 (Exchange, OneDrive, SharePoint) and Google Workspace

> **Key Point:** You don't need to know how to configure these services - but you DO need to know they exist so you can have informed conversations and identify upsell opportunities.`
        },
        {
          id: 'sales-m1-l3',
          title: '1.3 The Market Opportunity',
          content: `## Cloud Adoption in Nigeria

- Massive untapped opportunity - the majority of local businesses are still on-premise
- Fast-growing cloud adoption driven by digital transformation, fintech boom, and regulatory pressure
- Nobus is uniquely positioned as the **only African-native hyperscale cloud** with Tier III availability zones in Lagos (Ikeja and Lekki) and Nairobi, Kenya

### Target Sectors (Priority Order) - With Specific Value Props

#### 1. Banking & Financial Services (Highest Value)
- **Why Nobus:** PCI DSS certification (a must for the financial sector's payment-card data), NDPA compliance, in-country data sovereignty, CBN regulatory alignment
- **Key Services:** Next-generation cloud firewall services for network security, FBS encrypted storage (AES-256), managed databases
- **Deal Size:** One bank deal = 50M+/year
- **Entry Point:** Disaster recovery, dev/test environments, then production migration

#### 2. Fintech (Fast-Growing, Cloud-Native)
- **Why Nobus:** Nobus Kubernetes Engine (NKE) for microservices architecture, Kafka for event streaming, monitoring and alerting so the team scales ahead of transaction spikes
- **Migration driver:** Many fintechs sit on a foreign hyperscaler (AWS/Azure/GCP) and now face a **data localization mandate** - customer and transaction data must reside in-country. That mandate is the single biggest trigger to migrate to Nobus, which keeps the data in Nigeria while preserving the cloud-native tooling they already use.
- **Key Services:** NKE, Kafka, Load Balancers, managed PostgreSQL
- **Entry Point:** New application deployments, payment processing infrastructure, or a compliance-driven migration off a foreign hyperscaler

#### 3. Healthcare (Data Sensitivity)
- **Why Nobus:** Patient data must stay in Nigeria (NDPA), Acronis Cyber Protect for ransomware protection, AES-256 encrypted storage
- **Key Services:** FBS encrypted volumes, Nobus Cloud Backup, next-generation cloud firewall services
- **Entry Point:** Electronic medical records, diagnostic imaging storage (FOS)

#### 4. Government (Mandate for Local)
- **Why Nobus:** Data sovereignty is a hard requirement, not a preference. Local support team, local billing simplifies procurement
- **Key Services:** VPC for network isolation, Security Groups, encrypted storage
- **Entry Point:** Agency websites, citizen-facing portals, email systems

#### 5. Telecom (Large Infrastructure)
- **Why Nobus:** NFT (Fast Transit) for dedicated high-bandwidth connectivity, scalable infrastructure
- **Key Services:** NFT, FCS high-compute flavors, managed databases

#### 6. E-commerce (Scalability Needs)
- **Why Nobus:** Right-sized instances with monitoring and threshold alerts so you add capacity ahead of traffic spikes (Black Friday, sales events), load balancing across instances
- **Key Services:** Load Balancers, monitoring & alerting, FOS for product images/media
- **Entry Point:** Peak traffic handling, media storage

#### 7. Education (Digital Transformation)
- **Why Nobus:** Affordable compute for learning management systems, local pricing fits education budgets

#### 8. Manufacturing (ERP Migration)
- **Why Nobus:** Migrate SAP/Oracle ERP to cloud, reduce CapEx on servers

> **Why This Matters:** These sectors have BUDGET and URGENCY. Focus your pipeline on sectors 1-4 first - they have the strongest compliance drivers that make cloud migration non-optional.`
        },
        {
          id: 'sales-m1-l4',
          title: '1.4 Buyer Personas',
          content: `## Buyer Personas: Who You Are Selling To

> **Why this matters:** The same Nobus platform is bought for four completely different reasons. Sell FX savings to a CTO and you lose. Sell Kubernetes to a CFO and you lose. Matching the message to the persona is the single highest-leverage sales skill in this course.

### What you will learn
- The four buying personas in a typical local enterprise deal
- What each persona cares about, fears, and needs to hear
- The opening question that unlocks each persona

### Persona 1: The CFO / Finance Director (the economic buyer)
- **Cares about:** Budget certainty, cash flow, audit trail, avoiding surprise costs
- **Fears:** Dollar-billed cloud invoices that swing 20-30% with the exchange rate; hidden fees
- **Your message:** "Your cloud bill in local currency, fixed to usage, zero egress fees, VAT-transparent quotes."
- **Proof points:** local invoicing, the Nobus Pricing Calculator, a side-by-side TCO from the Quote Builder
- **Opening question:** *"When the local currency moved last year, what happened to your infrastructure budget?"*

### Persona 2: The CTO / Head of Engineering (the technical buyer)
- **Cares about:** Reliability, scalability, standard tooling, not being locked into a dead-end platform
- **Fears:** A "local" cloud that is really one rack in a closet; losing engineering credibility
- **Your message:** "Hyperscale infrastructure: Terraform, APIs and CLI work as expected. Tier III multi-AZ, 99.982% uptime, proactive monitoring and alerting, and managed Kubernetes included."
- **Proof points:** Live console demo (dashboard.nobus.io), instance catalog (si.1 to si.16 families), a demo-lab session
- **Opening question:** *"If you could re-architect today, what would you keep and what would you drop?"*

### Persona 3: The Head of IT / Operations Manager (the day-2 owner)
- **Cares about:** Support quality, migration effort, backups, keeping the lights on with a small team
- **Fears:** Being stranded at 9 PM with a ticket queue in another time zone
- **Your message:** "Lagos-based support in your time zone, managed backups with Acronis, and we (the partner) run first-level support under our managed services."
- **Proof points:** Nobus Cloud Backup (protects Nobus, on-prem, AWS, Azure, GCP and VMware), your own support SLA
- **Opening question:** *"Walk me through what happened the last time something went down after hours."*

### Persona 4: The Compliance / Risk Officer (the veto holder)
- **Cares about:** NDPA, data residency, auditability, regulator comfort
- **Fears:** Signing off on offshore data storage and being personally accountable later
- **Your message:** "Data stays in-country in Tier III-certified facilities. NDPA compliant in Nigeria, ODPC compliant in Kenya, ISO 27001 certified, PCI DSS certified."
- **Proof points:** Compliance one-pager from the Content Hub, encryption story (AES-256 at rest, encrypted transit)
- **Opening question:** *"How does your current provider evidence NDPA compliance when the regulator asks?"*

### Multi-threading: the golden rule
Deals stall when you are single-threaded. In every opportunity, map all four personas by name within the first two meetings, and give each one their own version of the value proposition. Log them as contacts on the lead in Sales Navigator so your whole team sees the map.

### Field example
A partner selling to a mid-size insurer led with Kubernetes to the IT manager and stalled for a month. They re-opened with the CFO using one line: "Your DR site renews in dollars in March; we can cut that 30% and bill it in local currency." The CFO pulled the CTO in, and the deal closed in five weeks. Same platform, different persona, different outcome.

### Key takeaways
- Four personas: CFO (money), CTO (architecture), IT Ops (day-2), Compliance (risk)
- Prepare a one-line value statement and one opening question per persona before every meeting
- Multi-thread early and record every stakeholder on the lead in Sales Navigator`
        },
        {
          id: 'sales-m1-l5',
          title: '1.5 The Complete Nobus Product Portfolio',
          content: `## Everything Nobus Offers - A Sales-Friendly Reference

As a sales rep, you need to know the full product catalogue so you can identify opportunities and have informed conversations. You do NOT need to know how to configure these - but you need to know they exist and what problems they solve.

---

### Compute

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **FCS (Flexible Compute Service)** | Virtual machines - Linux & Windows. 15+ instance flavors from 1 to 16 vCPU. Launch in minutes. | "Need a server? It's running in 5 minutes, not 5 weeks." |
| **Monitoring & Scaling** | Right-sized instances with proactive monitoring and threshold alerts; your team scales up (resize) or out (add nodes) on an informed decision | "Black Friday coming? We size for the peak and alert you early - you add capacity on purpose, no surprise scaling, no runaway bill." |
| **Load Balancing** | Distributes traffic across multiple instances | "No single point of failure. Traffic balanced automatically." |

### Storage

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **FBS (Flexible Block Storage)** | SSD-backed block storage. AES-256 encrypted. Supports snapshots. | "Your data is encrypted at rest. Snapshots for instant rollback." |
| **FOS (Flexible Object Storage)** | Unlimited object storage for files, backups, media. | "Store unlimited files - backups, videos, documents. Pay only for what you use." |

### Networking

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **VPC / DaaS** | Private cloud networks - your own isolated virtual data center | "Your own private network in the cloud. Fully isolated." |
| **Floating IPs** | Static public IP addresses. 1,500/month when reserved. | "Dedicated public IP for your application. Stays the same." |
| **NFT (Nobus Fast Transit)** | Dedicated connectivity from 50 Mbps to 10 Gbps. Enterprise-grade. | "Direct, dedicated connection to Nobus - not over public internet. Enterprise speed." |
| **VPN** | Site-to-site VPN via pfSense, IPSec | "Secure tunnel between your office and your Nobus cloud." |
| **DNS** | Managed DNS service - FREE for Nobus resources | "DNS is included at no extra cost." |
| **Cloud Router** | Route traffic between VPCs and networks | "Connect multiple networks together seamlessly." |
| **Cloud Trunks** | VLAN trunking for advanced networking | "Advanced network segmentation for enterprise architectures." |
| **Cloud Firewalls** | Network-level firewall rules | "Control what traffic enters and leaves your network." |

### Security

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **Sophos XG Firewall** | Enterprise firewall with IPS, ATP (Advanced Threat Protection), sandboxing | "Enterprise-grade security - intrusion prevention, threat detection, sandboxing. Same product banks use." |
| **FortiGate Firewall** | Next-gen firewall with SD-WAN capabilities | "Next-generation firewall with built-in SD-WAN. One appliance, multiple functions." |
| **Fortinet FortiSIEM** | Security information & event management - real-time threat detection, correlation and compliance reporting | "See threats across your whole environment in one place, with the audit trail compliance teams need." |
| **Acronis Cyber Protect** | Backup + ransomware protection + antivirus in one | "Backup, anti-ransomware, and antivirus in a single solution. Protects against the threats keeping CISOs up at night." |
| **Security Groups** | Per-instance firewall rules | "Fine-grained access control on every single server." |

### Managed Services

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **Managed MySQL** | Fully managed MySQL database | "We manage patching, backups, scaling. Your team focuses on the app." |
| **Managed PostgreSQL** | Fully managed PostgreSQL database | "The world's most advanced open-source database - fully managed." |
| **Managed MongoDB** | Fully managed MongoDB (NoSQL) | "Document database for modern apps - fully managed." |
| **Managed MS SQL Server** | Fully managed Microsoft SQL Server | "Running .NET/Windows apps? SQL Server is available managed." |
| **Kubernetes (NKE)** | Managed container orchestration | "Run containers at scale. We manage the control plane." |
| **Kafka** | Managed event streaming | "Real-time data pipelines and event streaming - managed by us." |
| **Nobus Cloud Backup (NCB)** | Multi-cloud backup across AWS, Azure, Google Cloud, on-prem and Nobus, plus Microsoft 365 (Exchange, OneDrive, SharePoint) and Google Workspace | "Back up everything - even AWS, Azure and Microsoft 365 - to Nobus. One backup for all your clouds and SaaS." |

### Platform Tools

| Product | What It Does | Sales Talking Point |
|---------|-------------|-------------------|
| **Cloud Orchestration** | Infrastructure as Code - deploy entire stacks from templates | "Define your entire infrastructure in a template. Deploy in one click." |
| **Image Import/Export** | Migrate VM images from on-prem or other clouds | "Already have VMs? Import them directly to Nobus. No rebuild needed." |

---

> **Pro Tip for Sales:** When you hear a customer describe ANY infrastructure need, mentally map it to a Nobus product. "We need a database" = Managed Database. "We need backups" = Nobus Cloud Backup (NCB). "We need security" = Cloud next-generation firewall with Sophos XG or FortiGate + Nobus Cloud Native Firewall. Every need is an opportunity.`
        },
      ],
      quiz: {
        id: 'quiz-sales-m1',
        title: 'Session 1 Quiz: Nobus Cloud Overview',
        questions: [
          {
            q: 'What is the primary compliance advantage Nobus offers over AWS/Azure for local businesses?',
            options: ['Lower pricing', 'Data sovereignty - data stays in Nigeria (NDPA compliance)', 'More services available', 'Faster compute instances'],
          },
          {
            q: 'Which buyer persona is most concerned with TCO, OpEx vs CapEx, and budget certainty?',
            options: ['CIO/CTO', 'IT Manager', 'CFO', 'CEO'],
          },
          {
            q: 'What is the #1 priority target sector for Nobus Cloud sales?',
            options: ['E-commerce', 'Education', 'Banking & Financial Services', 'Manufacturing'],
          },
          {
            q: 'Which of the following is TRUE about Nobus pricing?',
            options: ['Nobus bills in USD', 'Nobus charges egress fees', 'Nobus bills in local currency with no egress fees', 'Nobus is more expensive than AWS'],
          },
          {
            q: 'Where does Nobus Cloud infrastructure run?',
            options: ['US and European data centers', 'Tier III-certified availability zones: two in Lagos (Ikeja and Lekki) and one in Nairobi, Kenya', 'Microsoft Azure facility in Abuja', 'Google Cloud region in Johannesburg'],
          },
          {
            q: 'What is NCB (Nobus Cloud Backup) capable of backing up?',
            options: ['Only Nobus workloads', 'Only on-premise servers', 'Multi-cloud and SaaS: AWS, Azure, Google Cloud, on-prem and Nobus, plus Microsoft 365 and Google Workspace', 'Only Windows servers'],
          },
          {
            q: 'Which Nobus product provides dedicated enterprise connectivity from 50 Mbps to 10 Gbps?',
            options: ['VPN', 'Floating IP', 'NFT (Nobus Fast Transit)', 'Cloud Router'],
          },
          {
            q: 'What is the cost of Nobus managed DNS for Nobus resources?',
            options: ['5,000/month', '1,500/month', '10,000/month', 'Free'],
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
          content: `## The Nobus Partner Sales Process

> **Why this matters:** Winging it produces random results. A defined sales process makes your pipeline predictable, makes handoffs clean, and tells you exactly what to do next on every deal. This is the process the best Nobus partners run, stage by stage.

### What you will learn
- The seven stages from first touch to renewal
- The exit criteria that must be true before a deal moves forward
- Where PartnerCentral tools (Sales Navigator, Deal Registration, Quote Builder) plug into each stage

### The seven stages

| # | Stage | Goal | Exit criteria (all must be true) | PartnerCentral action |
|---|---|---|---|---|
| 1 | Prospect | Identify a company with a real infrastructure trigger | Named contact, known trigger event | Create the lead in Sales Navigator |
| 2 | Discover | Understand pain, environment and stakes | SPIN questions answered; current spend known | Log discovery notes on the lead |
| 3 | Qualify | Confirm this is winnable and worth it | BANT scored; personas mapped | Move lead to Qualified |
| 4 | Register | Protect the opportunity | Deal registered and approved | Register the deal (active protection) |
| 5 | Propose | Put a number and a design in front of the buyer | Quote delivered; proposal presented to the economic buyer | Build the quote in Quote Builder; attach it to the deal |
| 6 | Prove | Remove the last technical doubt | PoC success criteria met and signed off | Book demo-lab sessions for the customer |
| 7 | Close & grow | Win, onboard, then expand | Contract signed; first invoice paid | Mark deal Won; plan the expansion follow-up |

### Triggers that start deals (stage 1 fuel)
- Dollar-billed cloud renewal approaching (FX pain)
- Hardware refresh quote landed (20M+ capex shock)
- NDPA or CBN audit finding on offshore data
- Outage or ransomware scare
- New CTO or CFO (new brooms review infrastructure)

### The two rules that separate professionals from amateurs
1. **Never skip Register.** An unregistered deal has no channel protection and earns no partner benefits. Register the moment qualification passes, while the field is still yours.
2. **Never propose before Discover is complete.** A proposal without discovery is a price sheet, and price sheets get shopped to your competitors.

### Cadence discipline
- Every lead in Sales Navigator carries a **next action** with a date. No blank next actions, ever.
- Review your pipeline weekly: anything untouched for 14 days gets a decision, move it forward or mark it lost.
- Weighted forecast (the dashboard does this for you): Lead 10%, Qualified 30%, Proposal 60%, Won 100%.

### Field example
A Lagos partner ran this process on a logistics company: trigger was a $4,200/month AWS bill. Discovery took two calls, qualification one. They registered the deal on day 9, quoted 2.1M/month with exclusive partner pricing applied, ran a two-week PoC on FCS with a managed PostgreSQL database, and closed in 47 days. The deal now renews annually and has expanded twice.

### Key takeaways
- Seven stages, each with hard exit criteria; the stage is not done until the criteria are
- Register deals early: protection and partner benefits both depend on it
- Keep Sales Navigator current; your forecast is only as honest as your next actions`
        },
        {
          id: 'sales-m2-l2',
          title: '2.2 Discovery Framework: SPIN Selling',
          content: `## Discovery: SPIN Selling for Cloud Deals

> **Why this matters:** Customers do not buy cloud because you described it well. They buy because THEY said out loud that their current situation is costing them money, risk or sleep. SPIN is the question framework that gets them there, and it works exceptionally well for infrastructure sales.

### What you will learn
- The four SPIN question types and the order they run in
- A ready-to-use Nobus question bank for each type
- How to run a 30-minute discovery call that sets up the whole deal

### The SPIN sequence
**S - Situation. P - Problem. I - Implication. N - Need-payoff.** You are walking the customer from facts, to pain, to the cost of that pain, to wanting your solution. Do not skip steps and do not rush to pitch.

### Situation questions (5 minutes, maximum 4 questions)
Learn the landscape. Do your homework first; asking things you could have Googled burns credibility.
- "Where do your production workloads run today: on-premise, AWS, Azure, local hosting?"
- "What does your infrastructure spend look like monthly, roughly, and in what currency?"
- "Who manages it day to day, and how big is that team?"
- "When does your current contract or hardware warranty expire?"

### Problem questions (10 minutes, the heart of the call)
Surface dissatisfaction. Listen more than you speak.
- "How has the exchange rate affected your cloud budget over the last year?"
- "How long does it take to get a new server or environment provisioned today?"
- "What happened during your last outage, and how did support respond?"
- "How comfortable is your compliance team with where customer data physically sits?"
- "What is your backup and recovery story if ransomware hits tomorrow?"

### Implication questions (10 minutes, where deals are made)
Make the cost of the problem explicit. This is what separates SPIN from a survey.
- "If the local currency moves another 20%, what does that do to this year's IT budget?"
- "When provisioning takes three weeks, what does that delay cost the business teams waiting on it?"
- "If the regulator ruled your offshore data non-compliant, what would remediation cost?"
- "What would eight hours of downtime cost you in revenue and reputation?"

### Need-payoff questions (5 minutes, let them sell themselves)
- "If your bill were in local currency and fixed to usage, how would that change budgeting?"
- "If you could spin up environments in minutes instead of weeks, what would your team ship sooner?"
- "If data residency were solved outright, what does that free your compliance team to approve?"

### The close of the discovery call
Summarize what you heard in THEIR words, confirm it, and book the next step before hanging up:
> "So today you spend about $5,000 monthly, billed in dollars, provisioning takes weeks, and compliance is uneasy about data location. If we can fix all three, you said that changes your year. I would like to bring back a local-currency quote and a proposed architecture next Thursday. Who else should be in that meeting?"

### Key takeaways
- SPIN order is non-negotiable: facts, pain, cost of pain, desire for the fix
- Implication questions do the heavy lifting; prepare at least three per deal
- End every discovery call with a summary in the customer's own words and a booked next step`
        },
        {
          id: 'sales-m2-l3',
          title: '2.3 Qualification: The BANT Framework',
          content: `## Qualification: The BANT Framework

> **Why this matters:** Your scarcest resource is time. Chasing unwinnable deals is how partner pipelines die. BANT (Budget, Authority, Need, Timeline) is a fast, honest filter that tells you which deals deserve your effort, and which to walk away from.

### What you will learn
- How to score each BANT dimension for a Nobus opportunity
- The questions that reveal each dimension without interrogating the customer
- When to disqualify, and how to do it without burning the relationship

### The four dimensions, scored

Rate each dimension 1-3 in Sales Navigator notes. A deal below 8/12 is not ready for a proposal.

**Budget (does money exist for this?)**
- 3: Budget approved or an existing spend you are displacing (an AWS bill, a hardware refresh quote)
- 2: Budget likely but not yet approved; CFO aware of the initiative
- 1: "We would need to find budget"
- *Ask:* "Is this replacing existing spend, or is it new budget? Who signs off at this size?"

**Authority (are you talking to power?)**
- 3: Economic buyer (CFO/CEO/CTO) in the conversation
- 2: Champion with direct access to the economic buyer
- 1: Researcher or junior contact with no path upward
- *Ask:* "Beyond yourself, who else weighs in before something like this is approved?"

**Need (is the pain real and admitted?)**
- 3: Customer stated the pain and its cost in their own words (your SPIN work done right)
- 2: Pain visible to you but not yet acknowledged by them
- 1: "Things are fine, just exploring"
- *Ask:* "If nothing changes for 12 months, what happens?"

**Timeline (is there a forcing event?)**
- 3: Hard date: contract renewal, audit deadline, hardware end-of-life, project launch
- 2: Stated intent within two quarters
- 1: "Someday"
- *Ask:* "What happens on your side if this is not done by [their stated date]?"

### Reading the score
- **10-12:** Register the deal today. This is a real opportunity; protect it.
- **8-9:** Work the weak dimension deliberately (usually Authority or Timeline) before proposing.
- **Below 8:** Nurture, do not pursue. Put them on a 60-day follow-up with one useful asset from the Content Hub.

### Disqualifying gracefully
Walking away well creates future deals. Script:
> "Based on what you have shared, I do not think the timing is right for this to succeed, and I will not waste your time. Let me send you our NDPA data-residency whitepaper, and I will check back in when your renewal window opens in Q3."

### Field example
A partner scored a government prospect: Budget 3 (approved project), Need 3 (audit finding), Timeline 3 (fiscal-year deadline), Authority 1 (talking to a webmaster). Instead of proposing, they spent two weeks getting introduced to the Director of ICT, moved Authority to 3, then registered and won a 12M/year deal. The score told them exactly which lever to pull.

### Key takeaways
- Score every deal 1-3 on Budget, Authority, Need, Timeline; be honest
- Below 8/12: nurture, never propose
- The score does not just qualify the deal; it tells you precisely what to fix next`
        },
      ],
      quiz: {
        id: 'quiz-sales-m2',
        title: 'Session 2 Quiz: Sales Process & Discovery',
        questions: [
          {
            q: 'In the SPIN selling framework, what do "I" questions do?',
            options: ['Identify the current situation', 'Amplify the pain of the problem', 'Present the Nobus solution', 'Investigate the budget'],
          },
          {
            q: 'What is the typical timeline for closing a new logo deal?',
            options: ['1-2 weeks', '2-4 months', '6-12 months', '1-2 days'],
          },
          {
            q: 'A prospect scores 28 on the BANT qualifying scorecard. What should you do?',
            options: ['Disqualify them', 'Continue discovery', 'Schedule technical deep-dive immediately', 'Nurture the lead'],
          },
          {
            q: 'What is the goal of Stage 2 (Initial Discovery Call)?',
            options: ['Get a signed contract', 'Schedule a deep-dive technical call', 'Deliver a proposal', 'Begin implementation'],
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
          content: `## The Competitive Landscape

> **Why this matters:** You will never sell Nobus in a vacuum. Every deal has an incumbent, an alternative, or the strongest competitor of all: doing nothing. Knowing the whole battlefield, not just AWS, lets you position before the customer raises comparisons.

### What you will learn
- The five competitor categories you will actually meet in deals
- Each category's real strengths (never lie about these) and exploitable weaknesses
- The positioning line that beats each one

### Category 1: Global hyperscalers (AWS, Azure, GCP)
- **Their strengths:** Enormous service catalogs, brand safety ("nobody gets fired for buying AWS"), mature tooling
- **Their weaknesses in this market:** Dollar billing with FX exposure, egress fees, data offshore (NDPA friction), support in distant time zones, complexity that demands expensive skills
- **Your line:** "Same core building blocks: compute, storage, Kubernetes, managed databases. Your data in Africa, your bill in local currency, your support in your time zone, and zero egress fees."
- Detailed battlecards for AWS and Azure follow in the next lessons.

### Category 2: Local hosting providers and small VPS shops
- **Their strengths:** Cheap headline prices, local billing
- **Their weaknesses:** Single-site infrastructure, no real cloud services (no load balancing, no managed Kubernetes, no object storage), weak SLAs, no compliance posture
- **Your line:** "Hosting gives you a server. Nobus gives you a platform: Tier III multi-AZ, 99.982% uptime, monitoring and alerting with easy scale-up/scale-out, managed databases, enterprise firewalls. When you grow, hosting runs out of road."

### Category 3: On-premise (the hardware refresh)
- **Their strengths:** Full control, sunk-cost familiarity, "we already own the server room"
- **Their weaknesses:** 20M+ capex cycles every 4-5 years, diesel and cooling costs, single point of failure, key-person risk in the IT team
- **Your line:** "Compare the full five-year cost: hardware, power, cooling, staff, and the outage you have not had yet. Pay-as-you-use from 9,309/month, with Tier III redundancy you could never build in-house."

### Category 4: Doing nothing (the silent killer)
- **Reality:** More deals die to inertia than to any competitor. No decision feels safe.
- **Your weapon:** The implication questions from SPIN. Attach a cost to standing still: FX drift on the next renewal, the audit deadline, the aging warranty.
- **Your line:** "Doing nothing is also a decision, and it has a price. Let me show you what the next 12 months cost on your current path versus this one."

### Category 5: Other Nobus partners
- **Reality:** Channel conflict happens. Your defense is speed, registration, and staying engaged.
- **Your weapon:** Deal Registration. The first qualified partner to register earns **active protection**: the deal stays yours for as long as you keep the account engaged and delivering value, not a ticking countdown. Register the moment BANT passes, never sit on a qualified deal overnight, and log a value update whenever you advance the account so protection never lapses. Go silent and the deal can be reviewed and released to another partner.

### Ethics of competitive selling
Never fabricate competitor weaknesses. State facts you can defend, acknowledge genuine strengths, and reframe to where Nobus objectively wins: currency, residency, egress, support proximity, and total cost. Customers trust sellers who are fair to competitors.

### Key takeaways
- Five battlefields: hyperscalers, local hosts, on-premise, inertia, and other partners
- Prepare for "do nothing" as seriously as for AWS; it kills more deals
- Registration speed is your only defense against channel conflict; use it`
        },
        {
          id: 'sales-m3-l2',
          title: '3.2 Battlecard: Nobus vs. AWS',
          content: `## Nobus vs. AWS Comparison

| Factor | Nobus | AWS | Your Talking Point |
|--------|-------|-----|-------------------|
| **Data Location** | Nigeria, Tier III multi-AZ | Nearest region: Cape Town or Europe | "Your data stays in Nigeria. NDPA compliant by design." |
| **Currency** | Bill in local currency  | Bill in USD | "No exchange rate risk. Your bill is in local currency - period." |
| **Support** | Lagos-based, same timezone, phone | Different timezone, mostly online tickets | "When your system crashes at 9 PM, we answer in Lagos." |
| **Pricing** | 30-40% cheaper for equivalent workloads | Premium pricing + hidden egress fees | "Same quality, better price. Plus zero egress fees." |
| **Egress Fees** | NONE - completely free | $0.09/GB (can be 15-20% of bill) | "Data transfer out is FREE on Nobus. AWS charges per GB." |
| **Compliance** | ISO 27001, PCI-DSS supported, NDPA | ISO 27001, PCI-DSS | "Equally certified, but data stays in Nigeria." |
| **Complexity** | Focused catalogue of essential services | 200+ services, overwhelming complexity | "We focus on what local businesses actually need." |
| **Onboarding** | White-glove migration support | Self-service, figure it out yourself | "We train your team. Walk you through migration step by step." |
| **Tooling** | OpenStack CLI, Terraform, REST APIs | AWS CLI, Terraform, SDKs | "Your team can use Terraform, CLI, APIs - same DevOps tools they know." |
| **Compute** | FCS - 15+ flavors, launch in minutes | EC2 - hundreds of instance types | "Right-sized for local workloads. No analysis paralysis." |
| **Storage** | FBS (encrypted, SSD) + FOS (unlimited) | EBS + S3 | "SSD-backed, AES-256 encrypted storage. Object storage unlimited." |
| **Security** | Sophos XG, FortiGate, Acronis included in catalogue | Marketplace add-ons at extra cost | "Enterprise firewalls and backup built into our platform." |

### What TO Say
- "AWS is excellent for global companies with multi-region needs. For local businesses prioritizing data sovereignty, local support, and cost predictability, Nobus is the better fit."
- "Many of our customers evaluated AWS and chose Nobus because of local billing, zero egress fees, and having support in the same city."
- "Your team can use the same tools - Terraform, CLI - so there's no retraining cost."

### What NOT to Say
- "AWS sucks" (unprofessional, damages your credibility)
- "We're better than AWS at everything" (not believable - be honest about trade-offs)`
        },
        {
          id: 'sales-m3-l3',
          title: '3.3-3.4 Battlecards: Azure & On-Premise',
          content: `## Nobus vs. Azure

| Factor | Nobus | Azure | Talking Point |
|--------|-------|-------|---------------|
| **Focus** | local SMBs to Enterprise | Microsoft-centric shops | "If you're 100% Microsoft everywhere, Azure has integration advantages. If not, Nobus is simpler and cheaper." |
| **Integration** | Cloud-agnostic - Linux, Windows, any stack | Deep Microsoft integration (AD, 365) | "Nobus supports Linux, Windows, any stack. No vendor lock-in." |
| **Pricing** | Transparent, in local currency | Complex licensing, USD billing | "Nobus pricing is simple: X per hour, no surprise licensing fees." |
| **Data Location** | Nigeria, Tier III multi-AZ | Nearest: South Africa | "Your data stays in Nigeria, not South Africa." |
| **Managed DBs** | MySQL, PostgreSQL, MongoDB, MS SQL Server | Azure SQL, Cosmos DB, etc. | "We support MS SQL Server too - managed, in Nigeria." |

---

## Nobus vs. On-Premise (Status Quo)

**This is your REAL competition.** Most local businesses are still on-premise!

| Factor | On-Premise | Nobus | Talking Point |
|--------|-----------|-------|---------------|
| **CapEx** | 50M+ upfront for servers | 0 upfront, pay-as-you-go | "No need to write a 50M cheque. Pay monthly from 50K." |
| **OpEx** | 10-20M/year (power, staff, cooling) | 5-15M/year | "No power costs, no cooling, no hardware staff." |
| **Scalability** | Buy ahead, wait weeks | Instant - launch FCS in minutes | "Black Friday traffic? Scale in 5 minutes, not 5 weeks." |
| **Downtime** | Your problem entirely | Nobus manages infrastructure | "Server fails? We replace it in minutes. You don't even know." |
| **Compliance** | Build it yourself (expensive) | ISO 27001 certified, PCI-DSS supported | "You need ISO 27001? We already have it. You inherit compliance." |
| **Power / NEPA** | Generator dependency, diesel costs | Nobus data centers have redundant power systems | "Power goes out in Lagos? Our Tier III data centers have redundant power: UPS, generators, dual utility feeds. Zero impact on your workloads." |
| **Security** | Buy firewalls, hire security staff | Sophos XG, FortiGate, Acronis available | "Enterprise security built in - not a 20M+ add-on project." |
| **Backup** | Tapes, external drives, hope | NCB cross-cloud backup, Acronis Cyber Protect | "Automated backups with ransomware protection. Not a tape in a drawer." |
| **Connectivity** | Your ISP | NFT (Fast Transit) - dedicated 50Mbps to 10Gbps | "Direct, dedicated connection to your cloud. Not dependent on public internet." |

### Common On-Premise Objections

**"But we already own the servers."**
> "True, but that's sunk cost. What's cheaper for the NEXT 3 years - maintaining aging hardware or Nobus?"

**"Our data is too sensitive for cloud."**
> "Your data would sit in a Tier III certified facility, the same class of data center where banks host. AES-256 encrypted storage. Sophos XG firewall. More secure than most on-prem setups."

**"Cloud is expensive."**
> "Let's do the math. Your server: 2M purchase + 500K/year power/cooling/staff. Nobus equivalent: 100K/month. In 3 years, we're cheaper - PLUS you get redundancy, backup, and 24/7 support."

**"What about when internet goes down?"**
> "That's exactly what NFT (Fast Transit) solves - a dedicated connection from 50 Mbps to 10 Gbps, bypassing the public internet entirely. Enterprise-grade connectivity."`
        },
      ],
      quiz: {
        id: 'quiz-sales-m3',
        title: 'Session 3 Quiz: Competitive Positioning',
        questions: [
          {
            q: 'What is Nobus\'s BIGGEST competitor in Nigeria?',
            options: ['AWS', 'Azure', 'Google Cloud', 'On-Premise (Status Quo)'],
          },
          {
            q: 'What is a key advantage Nobus has over AWS regarding data transfer?',
            options: ['Faster network speeds', 'No egress fees', 'More data centers', 'Free inbound data'],
          },
          {
            q: 'When a prospect says "AWS is the industry standard," what should you NOT say?',
            options: ['"AWS is excellent for global companies"', '"Many of our customers evaluated AWS and chose Nobus"', '"AWS sucks"', '"For local businesses, Nobus is often the better fit"'],
          },
          {
            q: 'What Nobus product addresses the on-premise objection "What about when internet goes down?"',
            options: ['VPN', 'Floating IP', 'NFT (Nobus Fast Transit) - dedicated connectivity', 'Cloud Router'],
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
          content: `## Proposal Structure: Documents That Close

> **Why this matters:** Your proposal is often the only artifact that travels to decision-makers you never meet. It must sell Nobus, and you, in the room where you are not present. A world-class proposal is a decision document, not a brochure.

### What you will learn
- The seven-section structure that wins enterprise proposals
- How to write an executive summary that a CFO reads to the end
- How to present pricing so the value lands before the number does

### The seven sections, in order

**1. Executive summary (one page, written last, read first)**
The formula: *their situation, their cost of inaction, your solution in one sentence, the outcome with numbers, the ask.*
> "Acme processes 40,000 orders monthly on infrastructure that renews in dollars this March. At current FX rates that renewal costs 31% more than last year. We propose migrating to Nobus Cloud: equivalent capacity, billed in local currency, with zero egress fees, cutting projected annual infrastructure cost from 48M to 33M while moving customer data onshore for NDPA compliance. We ask for approval to begin a two-week proof of concept on 1 May."

**2. Understanding of your requirements**
Replay discovery in their words. This section proves you listened; it is why discovery quality decides proposal quality. List their stated problems as bullets, each with the business impact they told you.

**3. Proposed solution**
Architecture narrative plus a simple diagram. Name Nobus services precisely (FCS compute, FBS block storage, FOS object storage, managed PostgreSQL, Sophos XG firewall, Site-to-Site VPN) and map each to a requirement from section 2. No orphan technology: if it does not answer a requirement, cut it.

**4. Investment (never "cost")**
Generated from the Quote Builder and attached as the formal quotation (ref NCS-Q-xxxxx). Show monthly and annual, with VAT explicit. Present the exclusive partner pricing line when applied. Anchor against their current spend or the do-nothing cost calculated in section 1.

**5. Implementation plan**
Phased, with dates and owners: migration windows, testing, cutover, rollback plan. Include your managed-services offer (setup fee plus monthly support) as its own line so the customer sees ongoing partnership, not a drive-by sale.

**6. Why Nobus, why us**
Three Nobus proofs (Tier III multi-AZ across Africa, 99.982% uptime, NDPA/ODPC/ISO 27001) and three partner proofs (your certifications from this academy, reference customers, your support SLA).

**7. Next step and validity**
One specific ask with a date, and quote validity (30 days, matching the Quote Builder terms).

### Formatting standards
- Maximum 10 pages; executives stop at 11
- Their logo on the cover alongside yours; it is about them
- Every number sourced: from their own figures, the Quote Builder, or nobus.io published rates
- A named human signs it, with a phone number that answers

### Field example
Two partners quoted the same fintech. Partner A sent a 3-page price list. Partner B sent this structure, opening with the customer's own words about their audit deadline. Same platform, nearly the same price. Partner B won; the CFO later said the proposal "was the only one that showed they understood the problem."

### Key takeaways
- Executive summary formula: situation, cost of inaction, solution, outcome with numbers, ask
- Section 2 (their requirements, their words) is where proposals are won
- Always anchor investment against current spend or the cost of doing nothing`
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
- **si.1.2.20.l** - 1 vCPU, 2GB RAM, 20GB disk, Linux (small apps, dev/test)
- **si.2.4.30.l** - 2 vCPU, 4GB RAM, 30GB disk, Linux (web servers, small apps)
- **si.4.8.60.l** - 4 vCPU, 8GB RAM, 60GB disk, Linux (medium workloads)
- **si.8.16.120.l** - 8 vCPU, 16GB RAM, 120GB disk, Linux (databases, heavy apps)
- **si.16.32.240.l** - 16 vCPU, 32GB RAM, 240GB disk, Linux (enterprise workloads)
- Windows variants use \`.w\` suffix instead of \`.l\`

---

### Example Proposal: Web Application Migration

**Current State (On-Prem):**
- 2 web servers, 1 database server, 1 backup server
- 2TB storage, unreliable power, no disaster recovery
- Cost: 15M/year (CapEx + OpEx including diesel, staff, cooling)

**Nobus Proposed Solution:**

| Item | Nobus Product | Spec | Monthly Cost |
|------|--------------|------|-------------|
| Web Server 1 | FCS | si.2.4.30.l (2 vCPU, 4GB, 30GB) | 50,000 |
| Web Server 2 | FCS | si.2.4.30.l (2 vCPU, 4GB, 30GB) | 50,000 |
| Database Server | FCS | si.4.8.60.l (4 vCPU, 8GB, 60GB) | 120,000 |
| Database Storage | FBS | 500GB SSD, AES-256 encrypted | 25,000 |
| Backup Storage | FBS | 1TB SSD for snapshots | 40,000 |
| Cloud Backup | NCB | Automated daily backup, 30-day retention | 30,000 |
| Load Balancer | LB | Distributes traffic across web servers | 25,000 |
| Floating IP (Web) | Floating IP | 1x static public IP | 1,500 |
| Floating IP (DB Admin) | Floating IP | 1x static public IP | 1,500 |
| DNS | Nobus DNS | Managed DNS for domain | **FREE** |
| **TOTAL** | | | **343,000/month** |

**Annual Cost: 4,116,000/year**
**Savings vs On-Prem: 15M - 4.1M = 10.9M/year (73% reduction!)**

---

### Example Proposal: Fintech with Security Stack

| Item | Nobus Product | Spec | Monthly Cost |
|------|--------------|------|-------------|
| App Servers (x3) | FCS | si.4.8.60.l | 360,000 |
| Database (Primary) | Managed PostgreSQL | 4 vCPU, 16GB | 200,000 |
| Database (Replica) | Managed PostgreSQL | 4 vCPU, 16GB | 200,000 |
| Block Storage | FBS | 2TB SSD, encrypted | 80,000 |
| Object Storage | FOS | 5TB for logs/media | 50,000 |
| Firewall | Sophos XG | Enterprise IPS + ATP | 150,000 |
| Backup | Acronis Cyber Protect | All servers + ransomware protection | 100,000 |
| Floating IPs (x3) | Floating IP | Static public IPs | 4,500 |
| DNS | Nobus DNS | | **FREE** |
| **TOTAL** | | | **1,144,500/month** |

### Step 3: Add Contingency
- Development/Test environment: +50% of production cost
- Training: 500K one-time
- Migration support: 1-2M one-time
- Safety buffer: +10%

### Step 4: Position the Price
**Good:** "For 343,000 per month, less than the cost of one junior developer, you get enterprise-grade infrastructure hosted in Tier III data centers in Nigeria with a 99.982% uptime guarantee, automated backups, managed DNS at no extra cost, and local support."

**Bad:** "It costs 343,000 per month." (Just a number, no context)

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
          },
          {
            q: 'How should you position the price to a customer?',
            options: ['Just state the number plainly', 'Compare it to a relatable cost and highlight value', 'Always offer a discount upfront', 'Avoid discussing price entirely'],
          },
          {
            q: 'What does the Nobus FCS flavor "si.2.4.30.l" represent?',
            options: ['2 servers, 4TB storage, 30 users, Linux', '2 vCPU, 4GB RAM, 30GB disk, Linux', '2GHz CPU, 4 cores, 30GB RAM, Large', 'Series 2, Generation 4, 30-day billing, Linux'],
          },
          {
            q: 'Which of these items should ALWAYS be included in a Nobus proposal at no cost?',
            options: ['Sophos XG Firewall', 'Managed DNS and zero egress fees', 'Acronis Cyber Protect', 'NFT Fast Transit'],
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
          content: `## Proof of Concept: When and How to Structure One

> **Why this matters:** A PoC is the most expensive sales tool you have. Run well, it removes the final doubt and makes the sale inevitable. Run loosely, it becomes free consulting that drags for months and dies quietly. The difference is structure, agreed before anything is provisioned.

### What you will learn
- When a PoC helps a deal and when it stalls one
- The five elements every PoC agreement must contain
- Standard PoC patterns for common Nobus workloads

### When to recommend a PoC
Run a PoC when ALL of these are true:
- The deal is qualified (BANT 8+) and **registered** (protection running)
- A specific technical doubt blocks the signature ("will our app perform?", "can we really migrate?")
- The economic buyer has agreed, in writing, on what success means and what happens after success

Do NOT run a PoC when:
- It is a substitute for a decision ("let's just try it" with no criteria)
- The blocker is price or authority, not technology; a PoC cannot fix those
- The customer will not name success criteria; that is a browsing customer, not a buying one

### The five elements of a PoC agreement (one page, signed)

| Element | Standard |
|---|---|
| Objective | One sentence: the specific doubt being retired |
| Success criteria | 3-5 measurable tests, agreed in writing before start |
| Scope | Exactly which workloads and services; everything else is out |
| Duration | 14 days standard, 30 maximum; a PoC without an end date is a hobby |
| Commitment | What happens on success: "criteria met = we proceed to contract" |

### Example success criteria (steal these)
- "Application response time under 200ms at 500 concurrent users on si.4.8 instances"
- "Database migration completes with zero data loss, verified by row counts and checksums"
- "Failover to the standby instance completes in under 5 minutes"
- "VPN tunnel to head office sustains 100 Mbps with packet loss under 0.5%"

### Standard PoC patterns
- **Web workload:** 2x FCS si.2.4 Linux behind a load balancer, with monitoring and alerts to add nodes (scale out to 4), FBS-backed managed PostgreSQL. Proves performance and scaling.
- **Migration proof:** Lift one non-critical VM via image import, run it in parallel for a week, compare. Proves the migration path.
- **DR/backup proof:** Nobus Cloud Backup protecting one production on-prem server, one restore drill. Proves recoverability, sells the whole DR story.
- **Connectivity proof:** Site-to-Site VPN with pfSense, latency and throughput measured. Proves hybrid operation.

Use Demo Labs in PartnerCentral to rehearse the exact scenario before running it live with the customer.

### Who pays
Standard: customer pays for consumed resources at list (it is small: a two-week PoC on two si.2.4 instances is a few thousand local currency per day), you invest the engineering time. Skin in the game on both sides keeps the PoC honest. Free PoCs attract free-loaders.

### Key takeaways
- PoC only after qualification, registration, and written success criteria
- Five elements: objective, criteria, scope, duration, commitment; one page, signed
- 14 days standard; a PoC without an end date is where deals go to die`
        },
        {
          id: 'sales-m5-l2',
          title: '5.3-5.4 PoC Execution & Converting to Production',
          content: `## Running the PoC and Converting It to Production

> **Why this matters:** Winning the PoC on paper is not the same as converting it. Between "criteria met" and "contract signed" is a gap where deals stall, budgets vanish, and champions change jobs. This lesson is the execution playbook that closes that gap.

### What you will learn
- The week-by-week execution rhythm of a 14-day PoC
- How to keep the economic buyer engaged while engineers test
- The conversion meeting: turning results into a signature

### The 14-day execution rhythm

**Days 1-2: Setup and kickoff**
- Provision exactly the agreed scope (nothing extra, nothing missing)
- Kickoff call: restate the success criteria out loud with all stakeholders present, share the test schedule
- Give the customer's engineers console access; guided hands-on time builds ownership

**Days 3-10: Testing with a drumbeat**
- Run the agreed tests in order; log every result against its criterion the same day
- Send a two-line progress note every 48 hours to BOTH the technical contact and the economic buyer: "Criterion 2 of 5 passed today: migration completed, zero data loss. On schedule."
- Something will go wrong; that is normal. Fix it fast and visibly. How you handle the wobble IS the support demo.

**Days 11-12: Results compilation**
- Produce a one-page scorecard: each criterion, the measured result, pass/fail
- Rehearse the story: what was proven, what it means for the production design

**Days 13-14: The conversion meeting (the whole point)**
Attendees must include the economic buyer; if they cannot attend, move the meeting, not the agenda.
1. Scorecard walkthrough: criteria vs results (5 minutes, let the numbers speak)
2. "You agreed that meeting these criteria meant proceeding. The criteria are met." (Pause. Silence. Let it land.)
3. Present the production quote, already built in Quote Builder with exclusive partner pricing applied, referencing the PoC evidence
4. Propose the migration start date and ask for the order

### Handling the three classic stalls
- **"We need more time to evaluate."** "Of course. Which criterion do you feel is unproven? Happy to re-test that one this week." (Re-anchors to the agreement; usually there is none.)
- **"Budget has shifted."** "Understood. Since the technical case is proven, shall we present the scorecard and the local-currency savings to [CFO] together?" (Escalate with evidence.)
- **"Let's extend the PoC."** "The environment stays available under a paid pilot, at the production rate. The 14-day evaluation is complete." (Never extend for free; it devalues everything.)

### After the win
- Mark the deal **Won** in PartnerCentral the day the contract signs (this also records your benefit eligibility)
- Convert the PoC environment to production where possible: migration is faster and the customer already trusts it
- Book the 30-day expansion review before the ink dries: backup, DR, a second workload

### Key takeaways
- A 48-hour progress drumbeat to both technical and economic buyers keeps momentum
- The conversion meeting is the deliverable; the economic buyer must be in the room
- Never extend a PoC for free; convert it to a paid pilot or close it`
        },
      ],
      quiz: {
        id: 'quiz-sales-m5',
        title: 'Session 5 Quiz: PoC Strategy',
        questions: [
          {
            q: 'When should you SKIP a PoC?',
            options: ['Large deal with risk-averse buyer', 'Competitive situation', 'Existing customer expanding with simple use case', 'First cloud project for the company'],
          },
          {
            q: 'What is the most critical thing to do BEFORE starting a PoC?',
            options: ['Set up monitoring', 'Get agreement on success criteria upfront', 'Build the architecture', 'Train the customer team'],
          },
          {
            q: 'A prospect says "The PoC was great, but we want to test AWS too." What is the best response?',
            options: ['Badmouth AWS to discourage them', 'Agree and ask when AWS PoC is scheduled, then propose a comparison commitment', 'Offer a 50% discount immediately', 'Tell them AWS won\'t work for them'],
          },
          {
            q: 'What should you do immediately after the prospect says "What questions remain before we proceed?"',
            options: ['List all features again', 'Offer a discount', 'Stay silent - let them respond first', 'Schedule another meeting'],
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
          content: `## The Objection Handling Framework

> **Why this matters:** An objection is not rejection; it is engagement. Customers only object to things they are seriously considering. The sellers who fear objections lose; the sellers who welcome them, and handle them with a repeatable method, close. This is that method.

### What you will learn
- The LACE framework for any objection, any time
- Why the pause matters more than the answer
- How to tell real objections from smokescreens

### The LACE framework

**L - Listen. Fully.**
Do not interrupt, do not flinch, do not start composing your answer while they speak. Let them finish completely, then pause for two full seconds. The pause signals that you took it seriously, and very often they keep talking and hand you the real objection underneath.

**A - Acknowledge. Without agreeing.**
Validate the concern as reasonable; never be defensive.
> "That is a fair question, and honestly it is the first thing most CTOs ask us."
Acknowledging costs you nothing and drops their guard. Arguing raises it.

**C - Clarify. Find the objection under the objection.**
Most stated objections are proxies. Ask one probing question before answering anything:
- "Help me understand: when you say it is expensive, are you comparing to your current spend, or to another quote?"
- "When you say you are worried about reliability, is there a specific incident driving that?"
The answer you give to the clarified objection is twice as effective as the answer to the stated one.

**E - Evidence. Then confirm.**
Answer the clarified concern with proof, not adjectives: a number, a fact, a reference, a demonstration. Then confirm it landed:
> "Does that address the concern, or is there a part of it still open?"
Never stack three answers on one objection; one piece of strong evidence, then confirm.

### Worked example
> **Customer:** "We are worried a local cloud cannot match AWS reliability."
> **Listen:** (full attention, two-second pause)
> **Acknowledge:** "Completely fair, and you should hold us to that standard."
> **Clarify:** "Is the concern about the data centers themselves, or about the platform's track record?"
> **Customer:** "Mostly the data centers, honestly."
> **Evidence:** "Nobus Cloud infrastructure is hosted in Tier III-certified data centers across multiple availability zones, with a 99.982% uptime guarantee and N+1 redundancy: the same facility class where Nigerian banks host their core systems. I can also set up a two-week proof of concept so your team measures it directly."
> **Confirm:** "Would seeing those numbers from your own workload settle it?"

### Smokescreen detection
If you answer an objection well and a brand-new unrelated objection immediately appears, you are not handling objections; you are chasing a smokescreen. Name it kindly:
> "We have covered data location, reliability and pricing. It feels like something else may be holding this back. What is really giving you pause?"
That question, asked warmly, has closed more stuck deals than any discount.

### Practice standard
Every objection you hear in the field goes into your team's shared playbook with the LACE response that worked. Review it monthly. World-class teams rehearse objections the way pilots rehearse engine failures: before they happen.

### Key takeaways
- LACE: Listen, Acknowledge, Clarify, Evidence, then confirm it landed
- The clarifying question is the highest-value move; stated objections are usually proxies
- Serial objections mean a hidden concern; name it gently and ask for the real one`
        },
        {
          id: 'sales-m6-l2',
          title: '6.2-6.3 Top Objections & Hidden Objections',
          content: `## The Objection Playbook: Top Objections and the Hidden Ones

> **Why this matters:** You already know the framework (LACE). This lesson is the ammunition: the objections you will hear most in African enterprise deals, with clarifying questions and evidence that work. Internalize these; do not read them off a card in the meeting.

### What you will learn
- Field-tested responses to the eight most common objections
- The three hidden objections that customers rarely say out loud
- How to pre-empt objections before they are raised

### The top eight, with responses

**1. "Nobus is too small / we have never heard of you."**
- Clarify: "Is the concern about the platform's capability, or about long-term viability?"
- Evidence: Tier III multi-AZ infrastructure, 99.982% uptime guarantee, OpenStack (the platform CERN runs), ISO 27001, with zones in Lagos (Ikeja and Lekki) and Nairobi. Offer a reference call with an existing customer.

**2. "AWS/Azure has more services."**
- Clarify: "Which specific services on your roadmap are you concerned about?"
- Evidence: List their actual workload needs against the Nobus catalog (compute, block/object storage, Kubernetes, Kafka, four managed database engines, enterprise firewalls). 95% of enterprise workloads use core services Nobus covers fully. For the rare gap, NCB even backs up workloads that stay on AWS.

**3. "It is too expensive."**
- Clarify: "Compared to your current spend, or another proposal?"
- Evidence: Rebuild the comparison in the Quote Builder including what they forget: egress fees (Nobus: zero), FX drift (Nobus: local currency), and the 7.5% VAT shown transparently. Apply exclusive partner pricing. Nobus typically lands 30-40% under hyperscalers on like-for-like.

**4. "We are worried about migration disruption."**
- Clarify: "What is the maximum downtime window the business can absorb?"
- Evidence: Phased migration plan, image import/export tooling, parallel-run approach proven in the PoC, and your managed-services team doing the heavy lifting. Offer the migration lab demo.

**5. "Our data is fine where it is."**
- Clarify: "Has compliance formally reviewed where it sits under NDPA?"
- Evidence: NDPA compliance, in-country residency in Tier III facilities, the regulator trend line. Share the data-sovereignty whitepaper from the Content Hub.

**6. "What if Nobus goes down?"**
- Clarify: "What is your current uptime, honestly measured?"
- Evidence: 99.982% guarantee, N+1 redundancy, multi-AZ architecture options, plus a DR design with backups you can restore anywhere. Most on-prem setups cannot document 99% honestly.

**7. "We do not have cloud skills in-house."**
- Clarify: "Would you prefer to build that team, or have it handled?"
- Evidence: That is precisely the partner model: your managed services run day-2 operations, first-level support is local, and this academy certifies your engineers. Their team upskills on the console (dashboard.nobus.io), which is simpler than AWS by design.

**8. "We are locked into our current contract."**
- Clarify: "When exactly does it renew, and what is the exit clause?"
- Evidence: Perfect: register the deal now, run the PoC in month one, plan a cutover aligned to the renewal date. Lock-in is a timeline, not a no.

### The three hidden objections
1. **"I am afraid of looking foolish for choosing a non-obvious vendor."** Give them air cover: references, certifications, the uptime SLA in writing, and a phased rollout that never bets everything at once.
2. **"This threatens my job / my team's relevance."** Position the IT team as the heroes running a modern platform, not casualties of it. Include their names in the implementation plan.
3. **"I do not trust the salesperson yet."** Slow down. Deliver something small and useful for free (an architecture review, a whitepaper walkthrough). Trust converts more objections than evidence does.

### Pre-emption: the professional move
Raise the two objections you expect BEFORE the customer does: "You might be wondering how our reliability compares to AWS. Let me show you the data up front." Pre-empted objections build enormous credibility; the same objection raised later, answered defensively, costs it.

### Key takeaways
- Eight standard objections: know the clarifying question and the evidence for each, cold
- Hidden objections are emotional (fear, status, trust); answer them with cover, inclusion and patience
- Pre-empt your two most likely objections at the start of every proposal meeting`
        },
      ],
      quiz: {
        id: 'quiz-sales-m6',
        title: 'Session 6 Quiz: Objection Handling',
        questions: [
          {
            q: 'What is the FIRST step in the objection handling framework?',
            options: ['Answer immediately', 'Listen without interrupting', 'Question their logic', 'Present counter-evidence'],
          },
          {
            q: 'A prospect keeps raising the same objection in different ways even after you\'ve addressed it. This likely indicates:',
            options: ['They need more technical details', 'A hidden objection', 'They want a discount', 'They need to talk to their team'],
          },
          {
            q: 'A prospect says "AWS quoted us less." What is the best response approach?',
            options: ['Immediately match the AWS price', 'Ask to compare apples to apples - does AWS include egress fees, DNS, firewall?', 'Tell them AWS is lying', 'Walk away from the deal'],
          },
          {
            q: 'Which of the following is a common hidden objection?',
            options: ['The price is genuinely too high', 'They need more storage', 'Fear of change or career risk if migration fails', 'They want Windows instead of Linux'],
          },
        ],
      },
    },
  ],
};

export default salesCourse;
