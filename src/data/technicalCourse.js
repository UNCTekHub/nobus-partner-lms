const technicalCourse = {
  id: 'technical-enablement',
  title: 'Partner Technical Enablement Bootcamp',
  description: 'Comprehensive 3-day intensive technical training for partner engineers, pre-sales engineers, and solution architects.',
  duration: '3 Days (24 Hours)',
  audience: 'Partner technical teams, pre-sales engineers, implementation specialists',
  classSize: '10-15 participants per cohort',
  prerequisites: 'Basic cloud knowledge (or completion of Sales Enablement Module)',
  icon: 'Server',
  color: 'accent',
  objectives: [
    'Understand Nobus Cloud architecture and service catalogue',
    'Deploy and manage FCS instances, FBS volumes, and FOS storage',
    'Configure networking, security groups, VPNs, and firewalls',
    'Architect solutions using containers, Kubernetes, and managed databases',
    'Design backup, DR, and business continuity strategies',
    'Execute cloud migration projects using the Nobus Migration Playbook',
    'Handle technical objections with confidence',
    'Achieve NCS Associate Technical Certification',
  ],
  modules: [
    {
      id: 'tech-m1',
      title: 'Module 1: Cloud Architecture & Platform Overview',
      lessons: [
        {
          id: 'tech-m1-l1',
          title: '1.1 What is Nobus Cloud Services (NCS)?',
          content: `## Nobus Cloud Services (NCS)

Nobus Cloud Services (NCS) is **Nigeria's first native hyperscale public cloud platform**, operated by Nkponani Limited and hosted at **Rack Centre** — one of Africa's premier Tier III data centre facilities in Lagos.

Nobus provides a software-defined, on-demand cloud infrastructure for businesses across Nigeria and the broader African continent, with **payment in Naira (NGN)**.

### Partner Positioning Note
> Position NCS as the **sovereign cloud of choice** for Nigerian enterprises — data stays in-country, costs are in Naira, and latency to Nigerian users is dramatically lower than hyperscaler alternatives hosted in Europe or the US.`
        },
        {
          id: 'tech-m1-l2',
          title: '1.2 Platform Architecture',
          content: `## Platform Architecture

NCS is built on an **OpenStack-based hyperscale framework**, delivering Infrastructure-as-a-Service (IaaS) across all major compute, storage, and networking domains.

### Core Architectural Pillars

| Pillar | Description |
|--------|-------------|
| **Availability Zones (AZs)** | Isolated physical infrastructure segments within the Nobus data centre. Instances and volumes are pinned to specific AZs. |
| **Software-Defined Networking** | Neutron-based virtual network fabric supporting VPCs, subnets, routers, security groups, and floating IPs. |
| **SSD-Backed Storage** | All primary block storage (FBS) is SSD-backed, ensuring consistent sub-millisecond latency. |
| **Unified Management Console** | cloud.nobus.io provides full lifecycle control of all resources. |
| **API-First Design** | All operations accessible via REST APIs, enabling full automation and Infrastructure-as-Code. |`
        },
        {
          id: 'tech-m1-l3',
          title: '1.3 Service Catalogue & Access',
          content: `## Service Catalogue Summary

| Category | Service | Key Use Case |
|----------|---------|-------------|
| **Compute** | Flexible Compute Service (FCS) | Virtual machines on demand |
| **Compute** | Auto Scaling | Automated capacity management |
| **Compute** | Flexible Load Balancing | Traffic distribution |
| **Block Storage** | Flexible Block Storage (FBS) | Database, OS volumes |
| **Object Storage** | Flexible Object Storage (FOS) | Backups, media, archives |
| **Networking** | Nobus Fast Transit (NFT) | Dedicated private connectivity |
| **Networking** | VPN / Cloud Router | Secure hybrid connectivity |
| **Security** | Cloud Firewall / Security Groups | Network perimeter security |
| **Security** | Sophos XG / FortiGate FW | Advanced threat protection |
| **Containers** | Cloud Container / CKE | Docker & Managed K8s |
| **Database** | MySQL / PostgreSQL / MongoDB | Managed database services |
| **Messaging** | Nobus Kafka Service | Event streaming |
| **Backup** | Nobus Cloud Backup (NCB) | Workload-level backup |

## Access & Authentication

- **Web Console:** https://cloud.nobus.io
- **REST API:** OpenStack-compatible API endpoints
- **CLI Tools:** Standard OpenStack CLI (python-openstackclient)
- **Terraform Provider:** OpenStack provider for Terraform

> **Tech Tip:** Because Nobus is OpenStack-compatible, customers migrating from other OpenStack-based platforms can reuse their Terraform scripts and Ansible playbooks with minimal modification.

## Billing Model
- FCS Instances are **pre-billed at launch** — costs accrue while instance exists
- Storage (FBS, FOS, snapshots) billed independently of instance state
- Floating IPs incur charges regardless of attachment
- Inbound data transfer is **free**
- All billing in **Nigerian Naira (NGN)**`
        },
      ],
      quiz: {
        id: 'quiz-tech-m1',
        title: 'Module 1 Quiz: Platform Overview',
        questions: [
          {
            q: 'What technology stack is Nobus Cloud built on?',
            options: ['AWS CloudFormation', 'OpenStack-based hyperscale framework', 'VMware vSphere', 'Custom proprietary stack'],
            correct: 1,
          },
          {
            q: 'Which statement about Nobus billing is TRUE?',
            options: ['Stopped instances are free', 'FCS instances are pre-billed and accrue costs even when stopped', 'Outbound data is free', 'Billing is in USD'],
            correct: 1,
          },
          {
            q: 'What facility hosts the Nobus data centre?',
            options: ['MainOne MDXi', 'Rack Centre (Tier III)', 'AWS Lagos Region', 'Azure Nigeria DC'],
            correct: 1,
          },
        ],
      },
    },
    {
      id: 'tech-m2',
      title: 'Module 2: Flexible Compute Service (FCS)',
      lessons: [
        {
          id: 'tech-m2-l1',
          title: '2.1-2.2 FCS Overview & Instance Types',
          content: `## What is FCS?

Nobus Flexible Compute Service (FCS) is the **core virtual machine service** of the Nobus platform. FCS enables provisioning of resizable virtual servers (instances) on demand.

## Instance Types & Flavors

| Flavor Series | Characteristics & Best Use Cases |
|--------------|----------------------------------|
| **Standard si.1.x / si.2.x** | Balance of compute, memory & networking. Ideal for general-purpose workloads, web apps, dev/test. |
| **Standard si.4.x** | Higher vCPU counts (4-32 cores). Ideal for application servers, middleware, enterprise apps. |
| **Windows Instances** | Windows Server licensing (managed or BYOL). For Active Directory, SQL Server, .NET apps. |
| **Linux Instances** | Ubuntu, CentOS, Nobus Linux. No licensing cost. |`
        },
        {
          id: 'tech-m2-l2',
          title: '2.3-2.4 Machine Images & Launching Instances',
          content: `## Nobus Machine Images (NMIs)

NMIs are pre-configured VM templates (equivalent to AMIs on AWS):

- **FBS-backed NMIs** (recommended) — data persists on stop/start
- **Instance Store-backed NMIs** — ephemeral, data lost on stop/termination
- **Custom NMIs** — created from existing instances for standardised deployments

### Selecting an NMI
1. Open cloud.nobus.io → Images under Compute section
2. Filter by OS and Root Device Type
3. Note the NMI ID
4. Use the NMI ID when launching a new instance

## Launching an FCS Instance - Step by Step

1. Log in to the Nobus Management Dashboard (cloud.nobus.io)
2. Click **Cloud Config Panel** → select **Compute** from Projects
3. Click **Launch Instance** and provide:
   - Instance Name
   - NMI selection
   - Flavor (instance type)
   - Availability Zone
   - Key Pair for SSH access
4. Configure **Networking**: select VPC/subnet, assign Floating IP if needed
5. Configure **Security Groups**: define inbound/outbound rules
6. Configure **Storage**: attach additional FBS volumes as needed
7. Click **Launch** — instance provisions in minutes

> **Critical:** FCS instances are pre-billed from launch. Advise customers to **terminate** (not just stop) test instances they no longer need.`
        },
        {
          id: 'tech-m2-l3',
          title: '2.5-2.6 Auto Scaling & Load Balancing',
          content: `## Auto Scaling

Automatically adjusts FCS instance count based on demand.

### Key Concepts
- **Scaling Group:** Logical group of identical FCS instances
- **Scaling Policies:** Rules for when to scale out/in (e.g., CPU utilization thresholds)
- **Min/Max Capacity:** Floor and ceiling on instance count
- **Launch Configuration:** NMI, flavor, and network settings for new instances

> **Best Practice:** Always combine Auto Scaling with Flexible Load Balancing for production workloads.

## Flexible Load Balancing

Distributes incoming traffic across multiple FCS instances:

- Supports **HTTP, HTTPS, TCP, and UDP** protocols
- **Health checks** with configurable interval, threshold, and timeout
- **Session persistence** (sticky sessions) for stateful applications
- Works natively within a Nobus VPC subnet`
        },
      ],
      quiz: {
        id: 'quiz-tech-m2',
        title: 'Module 2 Quiz: FCS',
        questions: [
          {
            q: 'What happens to data on an Instance Store-backed NMI when the instance is stopped?',
            options: ['Data is persisted to FBS', 'Data is lost', 'Data is backed up to FOS', 'Data is moved to another AZ'],
            correct: 1,
          },
          {
            q: 'What should always be combined with Auto Scaling for production workloads?',
            options: ['Cloud Firewall', 'Flexible Load Balancing', 'Nobus Fast Transit', 'Cloud Backup'],
            correct: 1,
          },
        ],
      },
    },
    {
      id: 'tech-m3',
      title: 'Module 3: Storage Services - FBS & FOS',
      lessons: [
        {
          id: 'tech-m3-l1',
          title: '3.1-3.2 FBS Overview & Operations',
          content: `## Flexible Block Storage (FBS)

Durable, network-attached block storage volumes for FCS instances.

### FBS Volume Types

| Type | Backing | Performance | Best For |
|------|---------|-------------|----------|
| **GP2** | SSD | 3 IOPS/GB, burst to 3,000 IOPS | Boot volumes, dev/test, general apps |
| **IO1** | SSD | Up to 64,000 IOPS, single-digit ms latency | Mission-critical databases, OLTP |
| **ST1** | HDD | Throughput-focused | Log processing, data warehouses, big data |
| **SC1** | HDD | Lowest cost per GB | Cold archives, infrequently accessed data |

### Attaching & Mounting a Volume

\`\`\`bash
# 1. Create volume in console (specify type, size, AZ)
# 2. Attach to instance via console
# 3. SSH into instance:
sudo mkfs -t ext4 /dev/vdb       # Format
sudo mkdir /data                   # Create mount point
sudo mount /dev/vdb /data          # Mount
# 4. Add to /etc/fstab for persistence across reboots
\`\`\``
        },
        {
          id: 'tech-m3-l2',
          title: '3.3-3.5 Snapshots & Object Storage (FOS)',
          content: `## FBS Snapshots

Point-in-time backups stored in FOS. **Incremental** — only changed blocks are saved.

- **Lazy loading:** Volumes from snapshots are immediately accessible
- **Incremental billing:** Only pay for delta changes
- **Snapshot sharing:** Cross-account for DR scenarios

> **Best Practice:** Stop the instance before snapshotting root device volumes. For databases, flush buffers first.

---

## Flexible Object Storage (FOS)

Massively scalable object storage for unstructured data.

### Core Concepts
- **Containers (Buckets):** Top-level namespace for objects
- **Objects:** Files + metadata stored in containers
- **Versioning:** Preserves all versions for recovery
- **Replication:** Copies objects across Availability Zones

### Pricing Model

| Operation | Pricing |
|-----------|---------|
| PUT, COPY, POST, LIST | Per request |
| GET, SELECT | Per request |
| DELETE, CANCEL | **Free** |
| Inbound data | **Free** |
| Outbound to FCS (same zone) | **Free** |
| Outbound to internet | Per GB |

### FOS Integration with CloudBerry Backup
1. Select OpenStack as storage provider
2. Set Auth URL: \`authext.nobus.io\`
3. Enter Nobus username and API key
4. Specify FOS container as backup destination
5. Schedule backup jobs and retention policies`
        },
      ],
      quiz: {
        id: 'quiz-tech-m3',
        title: 'Module 3 Quiz: Storage Services',
        questions: [
          {
            q: 'Which FBS volume type is best for mission-critical databases requiring high IOPS?',
            options: ['GP2', 'IO1', 'ST1', 'SC1'],
            correct: 1,
          },
          {
            q: 'FBS snapshots are stored in which Nobus service?',
            options: ['FCS', 'FBS', 'FOS', 'NCB'],
            correct: 2,
          },
          {
            q: 'What is the cost of DELETE operations in Nobus FOS?',
            options: ['Per request', 'Per GB', 'Free', 'Monthly flat fee'],
            correct: 2,
          },
        ],
      },
    },
    {
      id: 'tech-m4',
      title: 'Module 4: Networking on Nobus Cloud',
      lessons: [
        {
          id: 'tech-m4-l1',
          title: '4.1 Networking Architecture',
          content: `## Core Networking Components

| Component | Description |
|-----------|-------------|
| **VPC / DaaS** | Logically isolated network environment with custom IP addressing and routing |
| **Subnets** | IP address ranges within a VPC. AZ-specific. |
| **Cloud Router** | Routing between subnets and external networks. Supports BGP. |
| **Floating IPs** | Reserved public IPv4 addresses for HA failover |
| **Security Groups** | Stateful virtual firewalls at instance level |
| **Cloud Firewall (FaaS)** | Tenant-level logical firewall |
| **Cloud Trunks** | Multi-network via single vNIC (VLAN tagging) |
| **Nobus Fast Transit (NFT)** | Dedicated private connection from premises to Nobus |
| **Site-to-Site VPN** | Encrypted IPSec tunnels for hybrid connectivity |
| **Nobus DNS** | Managed DNS service |`
        },
        {
          id: 'tech-m4-l2',
          title: '4.2 Security Groups Configuration',
          content: `## Security Group Rules

- **Direction:** Inbound (ingress) or Outbound (egress)
- **Protocol:** TCP, UDP, ICMP, or All
- **Port Range:** Single port (22) or range (8080-8090)
- **Source/Destination:** CIDR block or another Security Group ID

### Common Configurations

| Use Case | Inbound Rules | Best Practice |
|----------|---------------|---------------|
| **Linux Web Server** | TCP 22 (SSH) from admin CIDR; TCP 80, 443 from 0.0.0.0/0 | Never open port 22 to 0.0.0.0/0 in production |
| **Windows Server** | TCP 3389 (RDP) from admin CIDR; TCP 80/443 if web-facing | RDP must never be world-open |
| **Database Tier** | TCP 3306/5432 from App Server SG only | No public Floating IP. Backend only. |
| **Load Balancer** | TCP 80, 443 from 0.0.0.0/0 | Backend instances reference LB security group |`
        },
        {
          id: 'tech-m4-l3',
          title: '4.3-4.4 Fast Transit & VPN',
          content: `## Nobus Fast Transit (NFT)

Dedicated, exclusive network connections bypassing the public internet.

**Bandwidth Options:** 50 Mbps to 10 Gbps
> Note: 1 Gbps and above require certified Nobus Partner Network (NPN) status.

### Provisioning Process
1. Determine NFT location, bandwidth, and redundancy requirements
2. Submit connection request to Nobus Cloud Support
3. Receive Letter of Authorization (LOA-CFA) via email
4. Provide LOA-CFA to network carrier for cross connect
5. Create virtual interfaces to access Nobus services

> **Partner Opportunity:** NPN-certified partners can resell dedicated connectivity for recurring revenue.

---

## Site-to-Site VPN

For customers who need rapid hybrid connectivity without NFT cost:

- **NAT Traversal** supported
- **Custom Tunnel Options:** Inside tunnel IPs, pre-shared keys, BGP ASN
- **BGP Integration:** Dynamic route advertisement over VPN tunnel`
        },
      ],
      quiz: {
        id: 'quiz-tech-m4',
        title: 'Module 4 Quiz: Networking',
        questions: [
          {
            q: 'What is the recommended practice for SSH (port 22) access to production Linux servers?',
            options: ['Open to 0.0.0.0/0', 'Restrict to specific admin IP/CIDR', 'Disable SSH entirely', 'Use port 80 instead'],
            correct: 1,
          },
          {
            q: 'What bandwidth tier requires Nobus Partner Network (NPN) certification for NFT?',
            options: ['50 Mbps', '500 Mbps', '1 Gbps and above', 'All tiers'],
            correct: 2,
          },
        ],
      },
    },
    {
      id: 'tech-m5',
      title: 'Module 5: Security Architecture & Compliance',
      lessons: [
        {
          id: 'tech-m5-l1',
          title: '5.1-5.2 Shared Responsibility & Security Services',
          content: `## Shared Responsibility Model

### Nobus Responsibility (Security OF the Cloud)
- Physical data centre security (Tier III, biometrics, CCTV)
- Hypervisor security and tenant isolation
- Network infrastructure
- Data encryption in transit between NCS components
- MFA and RBAC for platform administration
- IDS/IPS on network perimeter
- SLA compliance and uptime guarantees

### Customer Responsibility (Security IN the Cloud)
- OS patching and hardening
- Application-level security
- IAM: user accounts, roles, permissions
- Data encryption at rest
- Security Group and Firewall configuration
- Backup and recovery management
- Industry regulatory compliance (PCI-DSS, NDPR, etc.)

## Built-in Security Controls
- **Security Groups:** Instance-level stateful packet filtering
- **Cloud Firewall (FaaS):** Tenant-level perimeter control
- **Network ACLs:** Stateless access control at subnet level
- **TLS Encryption:** All data in transit secured with TLS
- **MFA:** Available for dashboard login — mandate for all admin accounts
- **RBAC:** Granular permission assignment`
        },
        {
          id: 'tech-m5-l2',
          title: '5.3-5.5 Advanced Security & Compliance',
          content: `## Sophos XG Firewall

Enterprise-grade threat protection deployed within customer environments:

- **IPS:** Real-time exploit and attack detection
- **Advanced Threat Protection:** AI-powered zero-day threat detection
- **Cloud Sandboxing:** Behavioural analysis of suspicious files
- **Dual Antivirus Engines**
- **Web & Application Control:** Policy-based filtering
- **Email Protection:** Anti-spam, anti-phishing, encryption
- **Synchronized Security:** Coordinated threat response

## FortiGate Firewall

Alternative enterprise firewall for Fortinet-standardized environments:

- **Next-Gen Firewall (NGFW):** Deep packet inspection + IPS
- **SD-WAN:** Multi-site connectivity
- **VPN:** IPSec and SSL VPN
- **FortiGuard:** Real-time global threat intelligence

## Nigerian Compliance Frameworks

| Framework | Relevance |
|-----------|-----------|
| **NDPR** | Data about Nigerian citizens must comply with NDPR. Nobus hosting supports data residency. |
| **CBN Cybersecurity** | Banks must comply with CBN IT security standards. Nobus Tier III, encryption, and access controls align. |
| **PCI-DSS** | Nobus supports credit card data processing/storage. Application layer compliance is customer's responsibility. |`
        },
      ],
      quiz: {
        id: 'quiz-tech-m5',
        title: 'Module 5 Quiz: Security & Compliance',
        questions: [
          {
            q: 'In the shared responsibility model, who is responsible for OS patching?',
            options: ['Nobus', 'The customer', 'Both equally', 'Neither — it\'s automated'],
            correct: 1,
          },
          {
            q: 'Which Nigerian regulation requires data about citizens to be processed in accordance with data residency guidelines?',
            options: ['PCI-DSS', 'CBN Framework', 'NDPR', 'ISO 27001'],
            correct: 2,
          },
        ],
      },
    },
    {
      id: 'tech-m6',
      title: 'Module 6: Containers, Kubernetes & Databases',
      lessons: [
        {
          id: 'tech-m6-l1',
          title: '6.1-6.3 Containers & Kubernetes',
          content: `## Nobus Cloud Containers

Docker-based containerised applications without managing host infrastructure.

- **Images:** Docker-compatible container images
- **Containers:** Isolated, lightweight, portable runtime instances
- **Networking:** Attached to Nobus VPC networks with FBS for persistent storage

## Cloud Kubernetes Engine (CKE)

Managed Kubernetes without operational overhead.

| Concept | Description |
|---------|-------------|
| **Cluster** | Set of worker nodes managed by a control plane (CKE manages control plane) |
| **Node** | FCS instance running containerised workloads |
| **Pod** | Smallest deployable unit — one or more containers |
| **Deployment** | Desired state for pods (replica count, update strategy) |
| **Service** | Network endpoint for pods (ClusterIP, NodePort, LoadBalancer) |
| **Ingress** | HTTP/HTTPS routing to internal services |
| **Persistent Volume** | FBS volume for stateful data |

### HA Architecture Best Practices
- **Multi-AZ worker nodes** across Availability Zones
- **Cluster Autoscaler** for automatic node scaling
- **Horizontal Pod Autoscaler (HPA)** for pod replica scaling
- **Load Balancer Service** for external traffic
- **FBS Persistent Volumes** for stateful workloads`
        },
        {
          id: 'tech-m6-l2',
          title: '6.4-6.5 Managed Databases & Kafka',
          content: `## Managed Database Services

| Database | Type | Best Use Cases |
|----------|------|---------------|
| **MySQL** | Relational / SQL | Web apps, CMS, e-commerce, ERP |
| **PostgreSQL** | Relational / SQL + JSON | Analytics, GIS, financial systems |
| **MongoDB** | Document / NoSQL | Content management, IoT, mobile backends |
| **MS SQL Server** | Relational / Commercial | .NET workloads, Windows ERP |

## Nobus Kafka Service

Managed Apache Kafka for event streaming and real-time data pipelines:

- **Application event streaming:** Decouple microservices with async queues
- **Real-time analytics:** Stream data to analytics platforms
- **Log aggregation:** Centralize logs from multiple FCS instances
- **IoT data ingestion:** Handle high-throughput telemetry data`
        },
      ],
      quiz: {
        id: 'quiz-tech-m6',
        title: 'Module 6 Quiz: Containers & Databases',
        questions: [
          {
            q: 'What is the smallest deployable unit in Kubernetes?',
            options: ['Container', 'Pod', 'Node', 'Cluster'],
            correct: 1,
          },
          {
            q: 'Which managed database is best suited for GIS applications and complex queries?',
            options: ['MySQL', 'PostgreSQL', 'MongoDB', 'MS SQL Server'],
            correct: 1,
          },
        ],
      },
    },
    {
      id: 'tech-m7',
      title: 'Module 7: Backup, DRaaS & Business Continuity',
      lessons: [
        {
          id: 'tech-m7-l1',
          title: '7.1-7.4 Backup & DR Architecture',
          content: `## Nobus Cloud Backup (NCB)

Powered by **Acronis Cyber Protect**:

- **Advanced Backup & Recovery:** Granular recovery for files, apps (Exchange, SQL Server), and full images
- **Cyber Protection:** Backup + antivirus + anti-ransomware + vulnerability assessment
- **Multi-platform:** Nobus FCS, on-premise, and third-party cloud (AWS, Azure, GCP, VMware)
- **Cost Efficiency:** Up to 50% reduction vs. standalone tools

## Disaster Recovery Tiers

| Tier | RTO | RPO | Architecture |
|------|-----|-----|-------------|
| **Backup & Restore** | Hours | Hours | FBS snapshots to FOS + NCB. Lowest cost. |
| **Pilot Light** | 30-60 min | Minutes | Core infra pre-provisioned in standby. Scale up on failover. |
| **Warm Standby** | Minutes | Seconds | Scaled-down production in secondary AZ. Auto-redirect via LB. |
| **Active-Active** | Zero | Zero | Full parallel environments. Highest cost. Tier-1 critical only. |

## Snapshot Best Practices

- **Lifecycle policy:** Daily (7 days), Weekly (4 weeks), Monthly (12 months)
- **Tag consistently:** Environment, Application, Owner, Date
- **Test recovery quarterly** — never assume snapshots work without testing
- **Database snapshots:** Flush and quiesce before snapshotting
  - MySQL: \`FLUSH TABLES WITH READ LOCK\`
  - PostgreSQL: \`pg_start_backup() / pg_stop_backup()\``
        },
      ],
      quiz: {
        id: 'quiz-tech-m7',
        title: 'Module 7 Quiz: Backup & DR',
        questions: [
          {
            q: 'Which DR tier provides zero RTO and zero RPO?',
            options: ['Backup & Restore', 'Pilot Light', 'Warm Standby', 'Active-Active'],
            correct: 3,
          },
          {
            q: 'How often should snapshot recovery be tested?',
            options: ['Daily', 'Weekly', 'Monthly', 'Quarterly'],
            correct: 3,
          },
        ],
      },
    },
    {
      id: 'tech-m8',
      title: 'Module 8: Hands-On Labs',
      lessons: [
        {
          id: 'tech-m8-l1',
          title: 'Lab 1: Provision a Web Server',
          content: `## Lab 1 — Provision a Web Server with FCS

**Objective:** Launch an FCS instance, configure security, attach floating IP, deploy Apache.

### Steps

1. Log in to **cloud.nobus.io**
2. Create Security Group \`web-sg\`:
   - Inbound TCP 22 from your IP
   - Inbound TCP 80 from 0.0.0.0/0
   - Inbound TCP 443 from 0.0.0.0/0
3. Launch FCS Instance:
   - NMI: Ubuntu 20.04
   - Flavor: si.2.4
   - Security Group: web-sg
   - Generate new SSH key pair
4. Assign a **Floating IP** from Networking section
5. SSH into instance:
\`\`\`bash
ssh -i your-key.pem ubuntu@<floating-ip>
\`\`\`
6. Install Apache:
\`\`\`bash
sudo apt-get update && sudo apt-get install -y apache2
\`\`\`
7. Verify: Open browser → \`http://<floating-ip>\` — Apache default page should display`
        },
        {
          id: 'tech-m8-l2',
          title: 'Lab 2: Attach & Mount FBS Volume',
          content: `## Lab 2 — Attach and Mount an FBS Volume

**Objective:** Create, attach, and mount an FBS data volume as persistent storage.

### Steps

1. Navigate to **Volumes** → **Create Volume**
   - Size: 50 GB
   - Type: GP2
   - AZ: Match your instance
2. Select volume → **Actions** → **Attach Volume** → Select instance
3. SSH in and verify:
\`\`\`bash
lsblk                              # Look for /dev/vdb
sudo mkfs -t ext4 /dev/vdb         # Format
sudo mkdir /mnt/data                # Create mount point
sudo mount /dev/vdb /mnt/data       # Mount
\`\`\`
4. Make permanent:
\`\`\`bash
echo '/dev/vdb /mnt/data ext4 defaults 0 0' | sudo tee -a /etc/fstab
\`\`\`
5. Verify: \`df -h\` — confirm /mnt/data shows 50 GB`
        },
        {
          id: 'tech-m8-l3',
          title: 'Lab 3: Upload to FOS & Lab 4: VPN',
          content: `## Lab 3 — Upload Objects to Nobus FOS

1. Navigate to **Object Storage** → **Create Container**
   - Name: \`partner-test-bucket\`
2. **Upload Object** → select local file
3. Click object name to view metadata and access URL
4. Test direct access via browser or curl
5. Enable **Versioning** on the container

---

## Lab 4 — Configure Site-to-Site VPN

### On Nobus Side:
1. Navigate to **Networking** → **VPN**
2. Create **VPN Service:** select the target router
3. Create **IKE Policy:** AES-256, SHA-256
4. Create **IPSec Policy:** tunnel mode, ESP
5. Create **VPN Connection:** enter peer gateway IP, pre-shared key, local/remote subnets

### On Customer Side:
Configure matching IKE/IPSec profile on their router (Cisco, Fortinet, Palo Alto, MikroTik) pointing to the Nobus floating IP.`
        },
      ],
      quiz: {
        id: 'quiz-tech-m8',
        title: 'Module 8 Quiz: Hands-On Labs',
        questions: [
          {
            q: 'What command formats a new FBS volume as ext4 on Linux?',
            options: ['sudo format /dev/vdb ext4', 'sudo mkfs -t ext4 /dev/vdb', 'fdisk /dev/vdb', 'sudo mount -t ext4 /dev/vdb'],
            correct: 1,
          },
          {
            q: 'Which file must be edited to persist a volume mount across reboots?',
            options: ['/etc/hosts', '/etc/fstab', '/etc/mount.conf', '/etc/volumes'],
            correct: 1,
          },
        ],
      },
    },
    {
      id: 'tech-m9',
      title: 'Module 9: Migration Playbook',
      lessons: [
        {
          id: 'tech-m9-l1',
          title: '9.1-9.2 Migration Framework & Checklist',
          content: `## The 5Rs Migration Framework

| Strategy | Description | Nobus Fit |
|----------|-------------|-----------|
| **Rehost (Lift & Shift)** | Move VMs as-is to FCS. Minimal changes. Fastest path. | VM Import/Export or manual rebuild |
| **Replatform** | Move with targeted optimizations (e.g., self-managed MySQL → Managed MySQL) | Leverage managed services |
| **Refactor** | Redesign for cloud-native: containerize on CKE, use FOS, Auto Scaling | Highest effort, highest long-term benefit |
| **Retire** | Decommission unneeded workloads. Reduces migration scope. | — |
| **Retain** | Keep specific workloads on-prem. Use NFT or VPN for hybrid. | Hybrid connectivity |

## Migration Checklist

### Phase 1 — Discovery & Assessment
- ☐ Inventory all servers: OS, RAM, CPU, disk, network
- ☐ Identify application dependencies
- ☐ Define RTO/RPO requirements
- ☐ Assess compliance requirements (NDPR, CBN, PCI-DSS)
- ☐ Estimate sizing using NCS Monthly Calculator

### Phase 2 — Preparation
- ☐ Create VPC, subnets, and security groups
- ☐ Set up VPN or NFT connectivity
- ☐ Create base NMIs
- ☐ Set up monitoring and alerting

### Phase 3 — Migration Execution
- ☐ Migrate non-production first, validate
- ☐ Stage data via FBS snapshots and FOS
- ☐ Pilot cutover with maintenance window
- ☐ Production cutover, update DNS
- ☐ Monitor 48-72 hours post-cutover

### Phase 4 — Optimization
- ☐ Right-size instances based on actual utilization
- ☐ Implement Auto Scaling for variable workloads
- ☐ Move cold data from FBS to FOS
- ☐ Enable scheduled FBS snapshots`
        },
      ],
      quiz: {
        id: 'quiz-tech-m9',
        title: 'Module 9 Quiz: Migration',
        questions: [
          {
            q: 'Which migration strategy involves the LEAST application changes?',
            options: ['Refactor', 'Replatform', 'Rehost (Lift & Shift)', 'Retire'],
            correct: 2,
          },
          {
            q: 'How long should you monitor after production cutover?',
            options: ['4 hours', '24 hours', '48-72 hours', '1 week'],
            correct: 2,
          },
        ],
      },
    },
    {
      id: 'tech-m10',
      title: 'Module 10: Monitoring & Support',
      lessons: [
        {
          id: 'tech-m10-l1',
          title: '10.1-10.3 Monitoring, Troubleshooting & Support',
          content: `## Recommended Monitoring Stack

- **System Metrics:** Prometheus Node Exporter, Telegraf, or Zabbix agent
- **Application Metrics:** Prometheus-compatible endpoints
- **Log Aggregation:** ELK Stack or Graylog on dedicated FCS instances
- **Alerting:** CPU > 85%, disk > 80%, health check failures → email/Slack
- **Dashboard:** Grafana connected to Prometheus

## Common Troubleshooting

### Instance Cannot Be Reached via SSH
1. Verify instance is **Running** in console
2. Check Floating IP is assigned and associated
3. Verify Security Group allows TCP 22 from your IP
4. Check NMI boot log in console output
5. Verify correct SSH key pair

### FBS Volume Not Visible
1. Confirm attachment shows "in-use" in console
2. Run \`lsblk\` to list block devices
3. Try \`sudo partprobe\` or rescan
4. Mount if previously formatted

### No Internet Access
1. Verify Floating IP assigned
2. Check Security Group egress rules
3. Verify Cloud Router has default route to external gateway
4. Test: \`ping 8.8.8.8\` or \`curl http://example.com\`

## Support Channels

| Channel | Usage |
|---------|-------|
| **Support Portal** (cloud.nobus.io) | Primary channel for technical tickets |
| **Email Support** | Non-urgent queries and billing |
| **Partner Hotline** | Priority support for certified partners |
| **Documentation** | nobus.io/documentation |`
        },
      ],
      quiz: {
        id: 'quiz-tech-m10',
        title: 'Module 10 Quiz: Monitoring & Support',
        questions: [
          {
            q: 'What is the recommended CPU utilization threshold for alerting?',
            options: ['50%', '70%', '85%', '95%'],
            correct: 2,
          },
          {
            q: 'If an instance has no internet access, what should you check first?',
            options: ['FBS volume status', 'Floating IP and Security Group egress rules', 'NMI version', 'Instance flavor'],
            correct: 1,
          },
        ],
      },
    },
    {
      id: 'tech-m11',
      title: 'Module 11: Technical Objection Handling',
      lessons: [
        {
          id: 'tech-m11-l1',
          title: '11.1 Technical Objections & Responses',
          content: `## Common Technical Objections

### "Nobus doesn't have as many services as AWS or Azure."
> "80% of enterprise workloads run on compute, storage, and networking — all of which Nobus provides at production grade. For any gaps, we can architect a hybrid solution using NFT connectivity."

### "We are concerned about uptime — this is a Nigerian company."
> "Nobus is hosted at Rack Centre, a Tier III certified facility — 99.982% uptime with N+1 redundancy. Being Nigerian-operated is an advantage — no undersea cable dependency for local data, and support engineers are in your time zone."

### "Our developers know AWS APIs — steep learning curve?"
> "Nobus is built on OpenStack. Terraform's OpenStack provider works natively. Core concepts (instances, security groups, object storage, VPC) are identical — just different names: FCS = EC2, FBS = EBS, FOS = S3."

### "Can Nobus help with CBN/NDPR compliance?"
> "Absolutely. Data hosted on Nobus resides entirely within Nigeria, supporting NDPR data residency. We can provide a compliance mapping document showing how Nobus controls align to CBN requirements."

### "What happens if Nobus goes down?"
> "FBS data is replicated across multiple servers. FBS snapshots to FOS create additional recovery points. We design backup and DR plans using FOS replication and NCB to meet your RPO."

### "We had a bad experience with another local cloud provider."
> "Let's propose a structured Proof of Concept with clear success criteria. Run your workload on Nobus for 2-4 weeks and measure against your own benchmarks."`
        },
      ],
      quiz: {
        id: 'quiz-tech-m11',
        title: 'Module 11 Quiz: Technical Objections',
        questions: [
          {
            q: 'What percentage of enterprise workloads run on core compute, storage, and networking?',
            options: ['50%', '65%', '80%', '95%'],
            correct: 2,
          },
          {
            q: 'What Tier III uptime guarantee does Rack Centre provide?',
            options: ['99.5%', '99.9%', '99.95%', '99.982%'],
            correct: 3,
          },
        ],
      },
    },
    {
      id: 'tech-m12',
      title: 'Module 12: Certification Path',
      lessons: [
        {
          id: 'tech-m12-l1',
          title: '12.1-12.2 Competency Levels & Assessment',
          content: `## Partner Technical Competency Levels

| Level | Requirements | Benefits |
|-------|-------------|----------|
| **Level 1 — Associate** | Complete this curriculum + pass NCS Associate Assessment | Authorized for FCS/FBS deployments. Access to partner resources. |
| **Level 2 — Professional** | Level 1 + 3 successful deployments + Advanced Architecture Workshop | Authorized for complex architectures, migrations, K8s. Listed in Partner Directory. |
| **Level 3 — Expert / NPN Certified** | Level 2 + NFT certification + 10 deployments + 2 enterprise accounts | Authorized for all NFT tiers. Priority support. Access to pre-sales team. |

## NCS Associate Assessment Domains

| Domain | Weight |
|--------|--------|
| **FCS** — Instance management, NMIs, flavors, Auto Scaling | 25% |
| **Storage** — FBS volumes, snapshots, FOS containers | 20% |
| **Networking** — VPC, Security Groups, Floating IPs, VPN | 20% |
| **Security** — Shared responsibility, firewalls, compliance | 15% |
| **Architecture** — HA patterns, DR tiers, migration | 15% |
| **Operations** — Monitoring, troubleshooting, support | 5% |

> **Passing Score:** 75% or higher
> **Format:** 50 multiple-choice questions, 90 minutes`
        },
      ],
      quiz: {
        id: 'quiz-tech-m12',
        title: 'Module 12 Quiz: Certification',
        questions: [
          {
            q: 'What is the passing score for the NCS Associate Technical Assessment?',
            options: ['60%', '70%', '75%', '80%'],
            correct: 2,
          },
          {
            q: 'How many successful customer deployments are needed for Level 2 Professional certification?',
            options: ['1', '3', '5', '10'],
            correct: 1,
          },
        ],
      },
    },
  ],
};

export default technicalCourse;
