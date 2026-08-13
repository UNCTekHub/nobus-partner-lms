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
          content: `## What is Nobus Cloud Services (NCS)?

> **Why this matters:** As a technical engineer you are the person the customer's engineers will test. This lesson gives you the platform's identity, scope and vocabulary so you can hold that conversation with authority from day one.

### What you will learn
- What NCS is, who operates it, and where it physically runs
- The full service catalogue at a glance
- The vocabulary that maps Nobus concepts to AWS/Azure equivalents

### The platform
Nobus Cloud Services (NCS) is Nigeria's first native hyperscale public cloud platform, operated by **Nkponani Limited** and purpose-built for Africa's digital evolution. It is built on **OpenStack**, the open-source cloud platform that also powers CERN, Walmart and major global telcos, which means standard tooling (Terraform, OpenStack CLI, REST APIs) works as engineers expect.

### Where it runs
- **West Africa AZ 1 (nobus-wa-az1):** Rack Centre, Ikeja, Lagos, Nigeria
- **West Africa AZ 2 (nobus-wa-az2):** OADC, Lekki, Lagos, Nigeria
- **East Africa AZ 1 (nobus-ea-az1):** ADC, Nairobi, Kenya
- **99.982% uptime guarantee** with N+1 redundancy on power, cooling and network
- Managed entirely from one console: **dashboard.nobus.io**

### The service catalogue at a glance

| Domain | Services |
|---|---|
| Compute | FCS instances (si.1 to si.16 families, Linux and Windows), Dedicated Hosting (BYOL), Load Balancing, monitoring & alerting |
| Storage | FBS block volumes (AES-256), FOS object storage (unlimited), snapshots |
| Networking | Virtual data centers (DaaS), Floating IPs, Site-to-Site VPN, Nobus Fast Transit, Cloud Router (BGP), Cloud Trunks, DNS |
| Security | Security Groups, Cloud Firewalls, Sophos XG, FortiGate NGFW, Fortinet FortiSIEM, Nobus Cloud Backup |
| Containers | Nobus Kubernetes Engine, Cloud Containers, Managed Kafka |
| Databases | Managed MSSQL, MySQL, PostgreSQL, MongoDB |
| Operations | CloudOrchestration (Heat + CloudFormation-compatible IaC), Cloud Backup, monitoring |

### Translation table (for engineers coming from AWS/Azure)

| Nobus | AWS | Azure |
|---|---|---|
| FCS instance | EC2 instance | Virtual Machine |
| NMI (Nobus Machine Image) | AMI | VM Image |
| FBS volume | EBS volume | Managed Disk |
| FOS container | S3 bucket | Blob container |
| Floating IP | Elastic IP | Public IP |
| Security Group | Security Group | NSG |
| DaaS virtual data center | VPC | VNet |
| CloudOrchestration stack | CloudFormation stack | ARM template |

### Billing model (engineers get asked this constantly)
Pre-billing: resources charge from the start of each cycle while in **running or paused** states; build, shutting-down and deleted states do not bill. Auto-billing tops up from a saved card 3 days before the cycle if the wallet is short. All billing in local currency, entry compute from 9,309/month, and **zero egress fees**.

### Key takeaways
- Hyperscale, Tier III multi-AZ across Africa, 99.982% uptime, one console
- Know the translation table cold; it is how you win credibility with AWS-trained engineers
- Running and paused instances bill; stopped billing requires shutdown or termination`
        },
        {
          id: 'tech-m1-l2',
          title: '1.2 Platform Architecture',
          content: `## Platform Architecture

> **Why this matters:** Every design decision you will make (placement, redundancy, networking, storage) hangs off how the platform is physically and logically organized. Get this mental model right and everything else in this course clicks into place.

### What you will learn
- The physical layer: regions, availability zones, Tier III facilities
- The logical layer: projects, virtual data centers, networks
- How the OpenStack foundation shapes what is possible

### The physical layer
- **Regions and availability zones (AZs):** Nobus runs three Tier III-certified zones: **nobus-wa-az1** (Rack Centre, Ikeja Lagos), **nobus-wa-az2** (OADC, Lekki Lagos) and **nobus-ea-az1** (ADC, Nairobi, Kenya). An AZ is a physically isolated facility with independent power, cooling and network; zone names appear in the console when you place resources.
- **Tier III means:** concurrent maintainability, N+1 redundancy on every critical system, 99.982% uptime design. You can honestly tell customers this exceeds what any office server room achieves.
- **Design rule:** production workloads that need high availability should spread across AZs; FBS snapshots can be copied cross-zone for disaster recovery.

### The logical layer
- **Projects:** the tenancy boundary. Each customer project isolates its resources, quotas and billing. Everything you provision lives inside a project.
- **Virtual data center (DaaS):** a logically isolated network environment per project: you define IPv4 CIDR ranges, subnets, route tables and gateways. Creating one is free; you pay only for resources inside it. (IPv4 only today; plan addressing accordingly.)
- **Networks and subnets:** instances attach to subnets; private IPs are assigned by DHCP from your ranges. Public reachability comes from Floating IPs mapped by NAT.
- **Security layering:** security groups filter at the instance NIC (stateful), cloud firewalls filter at the network edge (policy-based, first-match), and appliance firewalls (Sophos XG, FortiGate) add deep inspection where required.

### The compute fabric
- Hypervisor-virtualized compute pools serve **FCS instances** in four types - Standard (general purpose), Compute-Optimized, Memory-Optimized and GPU-Optimized - across size families si.1 through si.16, plus burstable classes
- **Dedicated Hosts** carve out entire physical servers for compliance isolation and BYOL licensing (per-socket/per-core Microsoft and Oracle licenses), integrated with the Nobus License Manager
- **Instance naming decodes as** si.[vCPU].[RAM].[disk].[l|w]: si.4.8.30.l is 4 vCPU, 8 GiB RAM, 30 GB disk, Linux

### The storage fabric
- **FBS** provides network-attached block volumes that live independently of instances (detach, reattach, resize without downtime), AES-256 encrypted at rest and in transit
- **FOS** provides distributed object storage across data zones; FBS snapshots are stored in FOS, incrementally
- This separation is why cloud beats a physical server: the disk outlives the machine

### The OpenStack foundation (what it buys you)
- Standard APIs: anything that speaks OpenStack (Terraform providers, SDKs, the CLI) works
- **CloudOrchestration:** Heat templates natively, plus an AWS CloudFormation-compatible API, so existing IaC migrates with minimal changes
- No proprietary lock-in: skills and automation transfer in and out

### Key takeaways
- Physical: Tier III multi-AZ; logical: project > virtual data center > subnets > instances
- Storage is decoupled from compute; volumes and snapshots outlive instances
- OpenStack underneath means standard tooling and honest portability`
        },
        {
          id: 'tech-m1-l3',
          title: '1.3 Service Catalogue & Access',
          content: `## Service Catalogue and Access Methods

> **Why this matters:** Engineers judge a platform in the first ten minutes of touching it. Knowing every way in (console, keys, CLI, API) and the access-control model lets you onboard a customer team smoothly and securely on day one.

### What you will learn
- The four access methods and when each is right
- Key-pair authentication and first-login procedure for Linux and Windows
- Access hygiene standards you should set for every customer

### Access method 1: the web console (dashboard.nobus.io)
The primary interface: full lifecycle control of every service (Project > Compute, Volumes, Network, Object Store, Orchestration, DNS). This is where you will demo, teach and do most day-2 administration. It is deliberately simpler than AWS's console; use that in your positioning.

### Access method 2: SSH key pairs (Linux instances)
- Create or import a key pair before launching (Project > Compute > Key Pairs); Nobus stores the public key, you download the .pem private key **once**
- First login: ssh -i mykey.pem ubuntu@[floating-ip] (user varies by image: ubuntu, centos, etc.)
- On Windows workstations, PuTTY users convert .pem to .ppk with PuTTYgen
- **Standard:** one key pair per administrator, never shared; lost private keys cannot be re-downloaded, only replaced

### Access method 3: Windows instances
Launch with a key pair, then retrieve the auto-generated administrator password from the console (decrypted with your private key), and connect over RDP (open TCP 3389 in the security group **to the admin's IP only**, never 0.0.0.0/0). Windows instances carry the managed license (+35,000/month) unless BYOL on a Dedicated Host.

### Access method 4: API and CLI (automation)
- OpenStack-compatible REST APIs and CLI for scripting and CI/CD pipelines
- CloudOrchestration accepts Heat templates natively and CloudFormation-format templates through a compatible API: infrastructure-as-code from day one
- Terraform's OpenStack provider works for teams standardizing on it

### The image catalogue (what you can launch)
- **Open-source Linux:** Ubuntu (e.g. Ubuntu-22.04-64bit), Rocky Linux, AlmaLinux, Debian and other distributions, license-free
- **Windows Server:** managed licensing included, or BYOL on Dedicated Hosts
- **Nobus Machine Images (NMIs):** preconfigured templates; build golden images from a configured instance for standardized fleet deployments
- **Appliance images:** pfsense-64bit (VPN/routing), Security-Sophos-XG-Firewall, Security-Fortigate-FortiOS, acronis-cyberprotect
- **Import/Export:** the FCS image import/export service brings existing VMs in (your migration path) and takes images out (no lock-in story)

### Access hygiene: the standard you set on every engagement
1. Named accounts per human; no shared logins, ever
2. Key pairs per admin; revoke on staff exit the same day
3. Security groups scope management ports (22, 3389) to known office/VPN IPs
4. Document who holds which access in the customer runbook you hand over
5. Console credentials for the customer's team issued at handover training, not before

### Key takeaways
- Console for operations and demos; keys for shell access; API/CLI/IaC for automation
- Private keys download once; treat them like passwords, per-person, revocable
- Set access hygiene standards on day one; retrofitting them after an incident is misery`
        },
      ],
      quiz: {
        id: 'quiz-tech-m1',
        title: 'Module 1 Quiz: Platform Overview',
        questions: [
          {
            q: 'What technology stack is Nobus Cloud built on?',
            options: ['AWS CloudFormation', 'OpenStack-based hyperscale framework', 'VMware vSphere', 'Custom proprietary stack'],
          },
          {
            q: 'Which statement about Nobus billing is TRUE?',
            options: ['Stopped instances are free', 'FCS instances are pre-billed and accrue costs even when stopped', 'Outbound data is free', 'Billing is in USD'],
          },
          {
            q: 'Where does Nobus infrastructure run?',
            options: ['A single facility in Abuja', 'Tier III-certified data centres across multiple availability zones in Africa', 'AWS Lagos Region', 'Azure Nigeria DC'],
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

Nobus Flexible Compute Service (FCS) is a web service that provides **resizable compute capacity in the cloud**. FCS allows creating Virtual Machines (VM) on-demand, configuring security and networking, and managing storage. You only pay for resources actually consumed, in instance-hours.

### Key Features
- Virtual computing environments (instances) with configurable CPU, memory, storage, and networking
- Preconfigured templates called **Nobus Machine Images (NMIs)**
- Secure login using **key pairs** (SSH)
- **FBS volumes** for persistent block storage
- **Instance Snapshots** to preserve disk state
- **Security Groups** to control inbound/outbound traffic
- **Floating IP** addresses for static public access
- Logically isolated virtual networks via **Data Center as a Service (DaaS)**

## Instance Naming Convention

Nobus uses a structured naming: **si.{vCPU}.{RAM_GB}.{Disk_GB}.{OS}**
- **.l** = Linux (no license cost)
- **.w** = Windows Server (license included)

## Instance Types & Flavors

FCS offers four instance **types** - choose the shape for the workload, then the size:
- **Standard (General Purpose):** balanced vCPU-to-memory - web/app servers and most general workloads
- **Compute Optimized:** more vCPU per GiB - batch processing, media transcoding, HPC, high-traffic front-ends
- **Memory Optimized:** more memory per vCPU - in-memory databases, real-time analytics, large caches
- **GPU Optimized:** GPU-accelerated - AI/ML training and inference, rendering, scientific compute

The flavor tables below are **examples of common sizes within these types**, not the full catalogue - sizes scale well beyond them, and GPU/memory-optimized shapes are available on request. Confirm exact flavors in the console or Quote Builder.

### Entry-Level (1-2 vCPU) - Web Servers, Microservices, Dev/Test
| Flavor | vCPU | RAM | Disk | OS | Best For |
|--------|------|-----|------|----|----------|
| si.1.2.30.l | 1 | 2 GB | 30 GB | Linux | Lightweight web servers, caching |
| si.2.2.30.l | 2 | 2 GB | 30 GB | Linux | Containerized microservices |
| si.2.4.6.30.l | 2 | 4-6 GB | 30 GB | Linux | Distributed data stores |
| si.2.8.30.l | 2 | 8 GB | 30 GB | Linux | Arm ecosystem workloads |
| si.2.2.50.w | 2 | 2 GB | 50 GB | Windows | Small Windows apps |
| si.2.4.50.w | 2 | 4 GB | 50 GB | Windows | .NET dev/test |
| si.2.4.6.50.w | 2 | 4-6 GB | 50 GB | Windows | Windows development |
| si.2.8.50.w | 2 | 8 GB | 50 GB | Windows | Windows services |

### Mid-Range (4 vCPU) - Enterprise Apps, Databases, Backend Servers
| Flavor | vCPU | RAM | Disk | OS | Best For |
|--------|------|-----|------|----|----------|
| si.4.4.30.l | 4 | 4 GB | 30 GB | Linux | Application servers |
| si.4.6.30.l | 4 | 6 GB | 30 GB | Linux | Middleware, caching fleets |
| si.4.16.30.l | 4 | 16 GB | 30 GB | Linux | Small/medium databases |
| si.4.24.30.l | 4 | 24 GB | 30 GB | Linux | SAP, SharePoint, cluster computing |
| si.4.32.30.l | 4 | 32 GB | 30 GB | Linux | Enterprise applications |
| si.4.4.50.w - si.4.24.50.w | 4 | 4-24 GB | 50 GB | Windows | Windows enterprise apps |

### High-Performance (8 vCPU) - Direct Hardware Access, Bare-Metal-Like
| Flavor | vCPU | RAM | Disk | OS | Best For |
|--------|------|-----|------|----|----------|
| si.8.16.30.l | 8 | 16 GB | 30 GB | Linux | Non-virtualized licensing |
| si.8.24.30.l | 8 | 24 GB | 30 GB | Linux | Low-level hardware features |
| si.8.32.30.l | 8 | 32 GB | 30 GB | Linux | High-compute workloads |
| si.8.16.50.w - si.8.32.50.w | 8 | 16-32 GB | 50 GB | Windows | Windows high-performance |

### Burstable (8-16 vCPU, 64 GB) - Variable Workloads
| Flavor | vCPU | RAM | Disk | OS | Best For |
|--------|------|-----|------|----|----------|
| si.8.64.30.l | 8 | 64 GB | 30 GB | Linux | Websites, code repos, staging |
| si.16.64.30.l | 16 | 64 GB | 30 GB | Linux | Microservices, build/test |
| si.8.64.50.w | 8 | 64 GB | 50 GB | Windows | Windows web apps |
| si.16.64.50.w | 16 | 64 GB | 50 GB | Windows | Windows build environments |

> **Important:** FCS Instances are **pre-billed at launch** - costs accrue while the instance exists, even when stopped. Advise customers to **terminate** (not just stop) instances they no longer need.`
        },
        {
          id: 'tech-m2-l2',
          title: '2.3-2.4 Machine Images & Launching Instances',
          content: `## Nobus Machine Images (NMIs)

NMIs are pre-configured VM templates (equivalent to AMIs on AWS):

- **FBS-backed NMIs** (recommended) - data persists on stop/start
- **Instance Store-backed NMIs** - ephemeral, data lost on stop/termination
- **Custom NMIs** - created from existing instances for standardised deployments

### Available Public Images

| Image Name | Format | Size | Min Disk | Min RAM | Notes |
|-----------|--------|------|----------|---------|-------|
| **Ubuntu-22.04-64bit** | QCOW2 | ~600 MB | 30 GB | 2048 MB | Most popular Linux choice |
| **debian-10-generic-64Bit** | QCOW2 | 217 MB | 20 GB | 1024 MB | Minimal Debian |
| **debian-11-genericcloud-64Bit** | QCOW2 | 247 MB | 30 GB | 2048 MB | Current Debian stable |
| **debian-12-generic-64Bit** | QCOW2 | 361 MB | 30 GB | 2048 MB | Latest Debian |
| **Rocky-Linux-8-64bit** | QCOW2 | ~600 MB | 30 GB | 2048 MB | Enterprise Linux (RHEL-compatible) |
| **Rocky-Linux-9-64bit** | QCOW2 | ~600 MB | 30 GB | 2048 MB | Latest Rocky |
| **Oracle_Linux_9_64bit** | QCOW2 | 561 MB | 40 GB | - | Oracle database workloads |
| **Windows-Server-2019** | QCOW2 | ~12 GB | 50 GB | 4096 MB | Windows Server (licensed) |
| **Windows-Server-2022** | QCOW2 | ~12 GB | 50 GB | 4096 MB | Latest Windows Server |
| **pfsense-64bit** | QCOW2 | 2.94 GB | 30 GB | 2048 MB | Firewall/VPN appliance |
| **acronis-cyberprotect** | QCOW2 | 6.50 GB | **100 GB** | **8192 MB** | Backup & security |
| **Security-Fortigate-FortiOS** | QCOW2 | ~2 GB | 30 GB | 2048 MB | FortiGate NGFW |
| **Security-Sophos-XG-Firewall-DiskI** | QCOW2 | ~3 GB | 30 GB | 4096 MB | Sophos primary disk |
| **cirros-0.5.1-64bit** | QCOW2 | 15 MB | 10 GB | 1024 MB | Tiny test image |

> **Note:** Nobus also supports VM Import/Export - you can upload private images from your local environment and convert them into NMIs.

## Launching an FCS Instance - Step by Step

1. Log in to **dashboard.nobus.io** → click **Cloud Config Panel**
2. Navigate to **Project → Compute → Instances** → click **Launch Instance**
3. **Details tab:**
   - **Instance Name** - becomes the initial hostname
   - **Availability Zone** - default is \`nova\` (must match bootable volume AZ if using boot-from-volume)
   - **Count** - number of identical instances (max 10 by default)
4. **Source tab:**
   - **Boot Source:** Boot from image, Boot from snapshot, or Boot from volume
   - Select the NMI (e.g., Ubuntu-22.04-64bit)
5. **Flavor tab:** Select instance size (e.g., si.4.16.30.l)
6. **Networks tab:** Select your VPC subnet (click + to add)
7. **Security Groups tab:** Assign security group(s)
8. **Key Pair tab:** Select or create an SSH key pair
9. Click **Launch Instance**

The instance state transitions: **Build → Active (Running)**. You can then assign a Floating IP for public access.

> **Critical:** FCS instances are pre-billed from launch. Advise customers to **terminate** (not just stop) test instances they no longer need. Stopped instances still incur charges.`
        },
        {
          id: 'tech-m2-l3',
          title: '2.5-2.6 Monitoring-Driven Scaling & Load Balancing',
          content: `## Scaling and Load Balancing

> **Why this matters:** How you talk about scaling separates a credible engineer from a hand-waver. Nobus does **not** silently auto-scale infrastructure behind the customer's back. We right-size, then watch, then help the customer make a deliberate scaling decision. Get this right and you sell control and predictable cost, not "magic elasticity" you cannot actually deliver.

> **Say it correctly:** "We do not auto-scale the backend infrastructure dynamically. We provision a right-sized instance and pair it with proactive monitoring and alerting. When utilization approaches a defined threshold, the system raises an alert so your team can make an informed decision to scale up (vertical resize) or scale out as needed. You stay in control of capacity and cost, with no surprise scaling events."

### What you will learn
- The Nobus scaling model: right-size, monitor, alert, decide
- The two scaling responses - scale up (vertical resize) and scale out - and when each applies
- Load balancer architecture with HAProxy, including the config concepts

### The Nobus scaling model
There is no hidden scaling engine adding and removing instances on its own. Instead:
1. **Right-size at provisioning:** size to measured peak plus ~30% headroom, so day-to-day demand is comfortably covered
2. **Proactive monitoring:** track CPU, memory, disk and custom application metrics continuously
3. **Threshold alerting:** when utilization approaches a defined threshold, the system raises an alert to the customer's team
4. **Informed decision:** the team decides how to respond - nothing changes automatically, so there are no surprise scaling events and no bill shocks

### The two scaling responses
| Response | What happens | Best for |
|---|---|---|
| Scale up (vertical resize) | Add vCPU / RAM to the existing instance (brief reboot) | A single workload outgrowing its box: databases, monoliths, app servers |
| Scale out (horizontal) | Add another instance behind the load balancer | Stateless web/API tiers where traffic can be spread across nodes |

Vertical resize is the simplest lever and covers most cases. Scale-out is for stateless tiers already fronted by a load balancer - sessions in the database or cache, files in FOS, never on local disk.

### Design guidance
- Right-size from measured peaks, not from the old server's spec sheet; headroom is how you avoid constant threshold alerts
- Put anything production-facing behind a load balancer across two AZs so scale-out is a capacity decision, not a rebuild
- Set alert thresholds where the team has time to act (for example CPU sustained above 70-75%), not at the point of exhaustion
- Agree the escalation path up front: who receives the alert, and who is authorised to approve a resize or an added instance

### Load Balancing: the front door
The platform load-balancing pattern uses **HAProxy** (commonly on pfSense) as a high-availability proxy for TCP and HTTP applications:
- **Frontend:** receives traffic on the Floating IP (80/443)
- **ACLs:** map hostnames to backends, so one load balancer serves many applications (domain1.com to backend A, domain2.com to backend B)
- **Backends:** target groups of FCS instances with health checks; unhealthy members are ejected automatically
- **Default backend:** catches unmatched traffic
- **Statistics dashboard:** live session and backend health view (commonly on port 2200), your operations demo

Security group for a typical LB: 80/443 open to the internet, 22 and the stats port restricted to admin IPs. The load balancer makes scale-out a clean operation: add a new instance to the backend pool and it starts receiving traffic once it passes health checks.

### The reference pattern (memorize this diagram)
Internet -> Floating IP -> Load balancer (HAProxy) -> Load-balanced web tier (multi-AZ, monitored) -> Managed database (FBS-backed)
- Floating IP survives LB replacement (remap, no DNS change)
- Web tier scales out by a deliberate decision when alerts fire; database scales up (vertical resize)
- Every tier's security group admits only the tier above it

### Field demo script (8 minutes)
1. Show the monitoring dashboard: CPU, memory and disk on a running instance, with the alert thresholds set
2. Generate load; watch utilization climb and the threshold alert fire
3. Show the two responses: a vertical resize of the instance, or adding a node to the load balancer's backend pool
4. Close: "Nothing moved without you approving it. You get the heads-up early and you stay in control of the spend. That is the operational difference we are selling."

### Key takeaways
- Nobus does not auto-scale silently: we right-size, monitor, alert, and the customer decides
- Two responses - scale up (vertical resize) and scale out (add a node behind the LB); no surprise scaling events
- HAProxy frontends with ACL-based routing let one load balancer serve many applications and make scale-out clean`
        },
      ],
      quiz: {
        id: 'quiz-tech-m2',
        title: 'Module 2 Quiz: FCS',
        questions: [
          {
            q: 'What happens to data on an Instance Store-backed NMI when the instance is stopped?',
            options: ['Data is persisted to FBS', 'Data is lost', 'Data is backed up to FOS', 'Data is moved to another AZ'],
          },
          {
            q: 'How does Nobus handle scaling for FCS workloads?',
            options: ['Right-sized instances with monitoring and threshold alerts; the customer decides to resize or add nodes', 'Infrastructure auto-scales dynamically with no customer involvement', 'Instances are automatically added and removed by machine-learned forecasts', 'Scaling only happens on a fixed monthly schedule'],
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

Nobus FBS provides **durable, block-level storage devices** that you can attach to FCS instances. FBS volumes behave like raw, unformatted block devices - you can create a file system on top or use them as raw block devices. Volumes persist independently from the life of an instance.

### Key Characteristics
- **Persistence:** FBS volumes persist independently from the running life of an FCS instance
- **Availability Zone:** Created in a specific AZ and can only attach to instances in the same AZ
- **Multiple volumes:** Multiple volumes can be attached to one instance, but each volume attaches to one instance at a time
- **Encryption:** AES-256 encryption for data at rest, data in transit, and snapshots - all automatically encrypted
- **Extendable:** You can increase volume size, change type, and reset performance **without detaching or restarting** the instance

### Delete on Termination Behavior
- **Root volume:** Deleted by default when instance terminates (set DeleteOnTermination=false to persist)
- **Additional volumes:** Persist by default when instance terminates (set DeleteOnTermination=true to auto-delete)
- **Important:** FBS volumes are billed regardless of instance state - you pay for the volume even if the instance is terminated

### FBS Volume Types

| Type | Backing | Performance | Best For |
|------|---------|-------------|----------|
| **Standard SSD (GP2)** | SSD | 3 IOPS/GB, burst to 3,000 IOPS | Boot volumes, dev/test, general apps |
| **Provisioned IOPS (IO1)** | SSD | Up to 64,000 IOPS, single-digit ms latency | Mission-critical databases, OLTP |
| **Throughput Optimized (ST1)** | HDD | Throughput-focused | Log processing, data warehouses, big data |
| **Cold Storage (SC1)** | HDD | Lowest cost per GB | Cold archives, infrequently accessed data |

### Creating an FBS Volume - Step by Step
1. Log in to dashboard.nobus.io → **Project → Volumes → Volumes**
2. Click **Create Volume**
3. Specify:
   - **Volume Name** and optional **Description**
   - **Volume Source:** No source (empty), Snapshot, Image, or existing Volume
   - **Size (GB):** 1 to 1,000 GB
   - **Availability Zone:** Must match target instance
4. Click **Create Volume**

### Attaching & Mounting

\`\`\`bash
# After attaching via console (Volumes → Manage Attachments → select instance):
lsblk                              # Verify /dev/vdb appears
sudo mkfs -t ext4 /dev/vdb         # Format (ONLY for new empty volumes!)
sudo mkdir /data                    # Create mount point
sudo mount /dev/vdb /data           # Mount
echo '/dev/vdb /data ext4 defaults 0 0' | sudo tee -a /etc/fstab  # Persist
\`\`\`

### Extending a Volume (No Downtime)
1. Select volume → **Actions → Extend Volume**
2. Enter new size → click **Extend**
3. After modification, you may need to detach/reattach or restart the instance
4. **Wait at least 5 hours** before making additional modifications to the same volume`
        },
        {
          id: 'tech-m3-l2',
          title: '3.3-3.5 Snapshots & Object Storage (FOS)',
          content: `## FBS Snapshots

Point-in-time backups of FBS volumes. **Incremental** - only changed blocks since the last snapshot are saved, but you only need the most recent snapshot to fully restore a volume.

### Snapshot Features
- **Immediately accessible:** Volumes created from snapshots are usable right away
- **Incremental billing:** You only pay for additional data beyond the original volume
- **Cross-AZ copy:** Copy snapshots to other Availability Zones for DR and migration
- **Sharing:** Share snapshots with specific accounts or make them public
- **Automatic encryption:** Snapshots of encrypted volumes are automatically encrypted

### Creating a Snapshot
1. Navigate to **Volumes → Snapshots → Create Snapshot**
2. Select **Volume** as the resource type
3. Select the target volume
4. Optionally add description and tags
5. Click **Create Snapshot**

### Important Considerations
- **Stop the instance** before snapshotting root device volumes for consistency
- You can snapshot attached, in-use volumes - data is captured at the moment the command is issued
- **Concurrent limit:** Maximum 5 snapshots in progress per account
- **Database best practice:** Flush and quiesce before snapshot:
  - MySQL: \`FLUSH TABLES WITH READ LOCK\`
  - PostgreSQL: \`pg_start_backup() / pg_stop_backup()\`
- Deleting a snapshot only removes data **uniquely referenced** by that snapshot - data referenced by other snapshots is preserved

### Group Snapshots
Capture **crash-consistent snapshots across multiple FBS volumes** simultaneously - critical for applications that span multiple volumes (e.g., database data + logs on separate volumes).

---

## Flexible Object Storage (FOS)

Nobus FOS is an extensive distributed storage platform for **any type or amount of file** - backups, archives, media files, static websites, and data lakes.

### Core Concepts
- **Containers:** Top-level storage namespaces (similar to S3 buckets). Containers are **not nested** - you cannot create a container inside another container, but you can have multiple containers.
- **Objects:** Files + associated metadata stored within containers
- **Access Control:** Per-container permissions - who can create, delete, and list objects
- **Console URL:** Manage FOS from the Nobus console

### FOS Operations - Step by Step

**Creating a Container:**
1. Open FOS console → **Object Storage → Containers**
2. Click **Create Container**
3. Provide a name → click **Create**
4. You are only charged for storing objects and data transfer

**Uploading Objects:**
1. Select your container
2. Click **Upload Object** → select file
3. The object inherits the container's access permissions

**Managing Objects:**
- **Edit:** Modify object metadata
- **Copy:** Duplicate objects between containers
- **Delete Container:** Click **More → Delete Container** (container must be empty first)

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
          },
          {
            q: 'FBS snapshots are stored in which Nobus service?',
            options: ['FCS', 'FBS', 'FOS', 'NCB'],
          },
          {
            q: 'What is the cost of DELETE operations in Nobus FOS?',
            options: ['Per request', 'Per GB', 'Free', 'Monthly flat fee'],
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
          content: `## Nobus Data Center as a Service (DaaS) - Networking Overview

Nobus DaaS allows connection to public or private network infrastructure with encrypted VPN or dedicated Fast Transit connections. You have **complete control** over your virtual networking environment: IP address ranges, subnets, route tables, and network gateways.

### Available Network Services
- Security Groups, Firewall as a Service (FaaS), Network ACLs
- Load Balancer, monitoring & threshold alerting
- Software-defined network infrastructure (switches, routers)

> **Important:** Nobus currently supports **IPv4 only**. IPv6 is not supported. You must specify an IPv4 CIDR block when creating a network.

### IP Addressing
- **Private IPv4:** Allocated via DHCP from your subnet's CIDR range (RFC 1918). Used for inter-instance communication within the same DaaS network.
- **Public IPv4:** Auto-assigned from Nobus's pool. Mapped to private IP via NAT. **Released when instance is stopped or terminated** - you get a new one on restart.
- **Floating IPs:** Static public IPv4 addresses that persist across stop/start. See Floating IPs section below.

| Component | Description |
|-----------|-------------|
| **VPC / DaaS** | Logically isolated network environment with custom IP addressing and routing |
| **Subnets** | IP address ranges within a VPC with DHCP, DNS, and gateway configuration |
| **Cloud Router** | Routing between subnets and external networks. Supports BGP and static routes. |
| **Floating IPs** | Reserved static public IPv4 addresses - persist across instance lifecycle |
| **Security Groups** | Stateful virtual firewalls at instance level |
| **Cloud Firewall (FaaS)** | Tenant-level logical firewall with ordered policy rules |
| **Cloud Trunks** | Multi-network via single vNIC using VLAN segmentation |
| **Nobus Fast Transit (NFT)** | Dedicated private connection from premises to Nobus (50Mbps - 10Gbps) |
| **Site-to-Site VPN** | Encrypted IPSec tunnels via pfSense for hybrid connectivity |
| **Nobus DNS** | Managed DNS service (free for Nobus resources) |

### Creating a Network - Step by Step
1. Navigate to **Project → Network → Networks** → click **Create Network**
2. **Network tab:** Name, Shared (admin only), Admin State, check "Create Subnet"
3. **Subnet tab:** Subnet Name, Network Address (CIDR), IP Version (IPv4), Gateway IP
4. **Subnet Details:** Enable DHCP, Allocation Pools, DNS Name Servers, Host Routes
5. Click **Create** - the network appears on the Networks dashboard`
        },
        {
          id: 'tech-m4-l2',
          title: '4.2 Security Groups Configuration',
          content: `## Security Groups & Firewalls

Security groups are **sets of IP filter rules** applied to network interfaces of instances, permitting inbound and outbound traffic flow. Changes to security groups are **automatically applied** to all instances using that group.

### Security Group Rule Components
1. **Rule Template:** Custom TCP, Custom UDP, Custom ICMP, or predefined (SSH, HTTP, etc.)
2. **Port/Port Range:** Single port (22) or range (8080-8090)
3. **Remote Source:** CIDR block (e.g., 0.0.0.0/0) or another Security Group ID
4. **Direction:** Inbound (ingress) or Outbound (egress)

### Creating a Security Group
1. Navigate to **Project → Network → Security Groups** → **Create Security Group**
2. Enter name and description
3. Click **Create** → then **Manage Rules** to add rules

### Common Security Group Configurations

| Use Case | Protocol | Port | Source | Notes |
|----------|----------|------|--------|-------|
| **Web Server (HTTP)** | TCP | 80 | 0.0.0.0/0 | Public web traffic |
| **Web Server (HTTPS)** | TCP | 443 | 0.0.0.0/0 | Encrypted web traffic |
| **SSH Access** | TCP | 22 | Admin IP/CIDR only | **NEVER** open to 0.0.0.0/0 in production |
| **RDP Access** | TCP | 3389 | Admin IP/CIDR only | Windows remote desktop |
| **MySQL Database** | TCP | 3306 | App Server SG only | Backend only - no Floating IP |
| **PostgreSQL** | TCP | 5432 | App Server SG only | Backend only |
| **MongoDB** | TCP | 27017 | App Server SG only | Backend only |
| **MS SQL Server** | TCP | 1433 | App Server SG only | Backend only |
| **Ping/ICMP** | ICMP | All | Specific CIDR | For diagnostics |
| **DNS** | UDP/TCP | 53 | 0.0.0.0/0 | DNS server |
| **Load Balancer** | TCP | 80, 443 | 0.0.0.0/0 | Backends reference LB SG |

## Cloud Firewalls (FaaS)

Tenant-level logical firewalls with **ordered policy-based rules**:

- **Firewall Rules:** IP source/dest, protocol, port, action (Allow/Deny/Reject)
- **Firewall Policies:** Ordered collection of rules - traffic matching the first rule stops further evaluation
- **Policies can be shared** across tenants and **audited** (audited flag resets to False when rules change)
- **Firewalls** are associated with routers and reference one policy

### Creating a Firewall
1. Create firewall rules: **Project → Network → Firewalls → Rules → Create Rule**
2. Create a policy: **Firewalls → Policies → Create Policy** → add rules (order matters!)
3. Create the firewall: **Firewalls → Create Firewall** → select policy and router(s)

## Floating IP Addresses

Static, publicly-accessible IPv4 addresses that can be assigned to any FCS instance in the same datacenter.

### Key Details
- **Free** when assigned to an instance
- **₦1,500/month** when reserved but NOT assigned (due to IPv4 scarcity)
- **Limit:** 3 floating IPs per account initially (increase via dashboard quota request)
- **Reassignment:** Can be moved between instances at any time, regardless of instance state
- Floating IPs **do NOT replace** the instance's original public IP - they are additional
- **No PTR/rDNS** support
- **Not supported** on Kubernetes worker nodes

### Creating and Associating
1. **Project → Network → Floating IPs** → **Allocate IP to Project**
2. Select Pool → click **Allocate IP**
3. Click **Associate** → select instance and port
4. Alternative: **Compute → Instances** → Actions → **Associate Floating IP**`
        },
        {
          id: 'tech-m4-l3',
          title: '4.3-4.4 Fast Transit & VPN',
          content: `## Nobus Fast Transit (NFT)

Dedicated, exclusive network connections that link your private network **directly to a Nobus Fast Transit point**, bypassing the public internet entirely.

### Connection Types

| Type | Port Speeds | How to Get |
|------|------------|------------|
| **Dedicated Connection** | 1 Gbps or 10 Gbps | Request via Nobus; you or your carrier orders the cross-connect |
| **Hosted Connection** | 50 Mbps, 100 Mbps, 200 Mbps, 300 Mbps, 400 Mbps, 500 Mbps, 1 Gbps, 2 Gbps, 5 Gbps, 10 Gbps | Via NPN Partner who provisions on your behalf |

> **Note:** 1 Gbps and above hosted connections require certified Nobus Partner Network (NPN) status.

### Network Requirements
- **Fiber:** Single-mode fiber with 1000BASE-LX (1310nm) for 1G or 10GBASE-LR (1310nm) for 10G
- **Port:** Manually configure port speed and full-duplex mode
- **VLAN:** 802.1Q VLAN encapsulation required across entire connection
- **Routing:** BGP with MD5 authentication required
- **BFD:** Bidirectional Forwarding Detection automatically enabled (configure on your router)
- **IP:** Supports both IPv4 and IPv6

### Virtual Interfaces
- **Public virtual interface:** Access public Nobus services (e.g., FOS)
- **Private virtual interface:** Access your DaaS/VPC network

### Provisioning Process
1. Determine NFT location, bandwidth, and redundancy needs
2. Submit connection request to Nobus Cloud Support
3. Receive **Letter of Authorization - Connecting Facility Assignment (LOA-CFA)** via email
4. Provide LOA-CFA to your NPN Partner or network carrier for cross-connect
5. If you don't have equipment at the NFT point, an NPN Partner can arrange it
6. Once connection is up, create virtual interfaces in the Nobus Management Console
7. **Respond to info requests within 7 days** or the connection is deleted

> **Partner Revenue Opportunity:** NPN-certified partners can resell dedicated connectivity as recurring revenue. NFT-authorized partners provision hosted connections for their customers.

---

## Site-to-Site VPN with pfSense

For customers needing hybrid connectivity without NFT cost. Nobus uses **pfSense** - an open-source firewall/VPN appliance.

### VPN Instance Setup
- **Image:** pfsense-64bit (2.94 GB, min 30GB disk, 2048MB RAM)
- **Required Security Group Ports:**

| Protocol | Port | Purpose |
|----------|------|---------|
| UDP | 500 | IKE - encryption key management |
| UDP | 4500 | IPSec NAT-Traversal |
| ESP | 50 | IPSec data |
| AH | 51 | IPSec authentication |
| TCP | 22 | SSH access to instance |
| TCP | 80 | pfSense web UI |
| TCP | 443 | pfSense web UI (HTTPS) |

### IPSec Configuration
- Supports **IKEv1 and IKEv2**
- Encryption: **AES128 or AES256**
- Key exchange: **Diffie-Hellman groups** (Perfect Forward Secrecy)
- Authentication: **SHA1 or SHA2** hashing
- **NAT Traversal** supported for networks behind NAT
- **BGP integration** for dynamic route advertisement over the tunnel
- Custom tunnel options: inside tunnel IPs, pre-shared keys, BGP ASN
- **ECMP** (Equal-Cost Multi-Path) routing for bandwidth aggregation across multiple tunnels

### Accessing pfSense
1. Launch pfsense-64bit instance with required security groups
2. Assign a Floating IP
3. Access web GUI: \`https://<floating-ip>\`
4. Default credentials: **admin / pfsense**
5. Navigate to **VPN → IPsec** to configure tunnels

---

## Cloud Router

Cloud Router enables **dynamic route exchange** between your virtual cloud environment and peer networks using **BGP**.

### Creating a Cloud Router
1. **Project → Network → Routers** → **Create Router**
2. Specify Name, enable Admin State, select External Network
3. **Add Interface:** Connect a subnet to the router (uses gateway IP or custom IP)
4. **Add Static Route:** Specify Destination CIDR and Next Hop (must be on a connected subnet)

### BGP Use Cases
- Automatic route learning for VPN tunnels
- Multi-cloud and hybrid network peering
- Dynamic failover between primary and backup connections

## Cloud Trunks

Network trunks allow **multiple networks to be connected to an instance using a single vNIC**.

### Key Concepts
- **Parent Port:** The primary port associated with the trunk (used when launching the instance)
- **Subports:** Additional network connections, each with a segmentation ID (VLAN tag)
- You can dynamically attach and detach subports **without disrupting** the running instance

### Creating a Trunk
1. **Project → Network → Trunks** → **Create Trunk**
2. Create a parent port → create the trunk referencing that port
3. Add subports at creation time or to an existing trunk
4. Launch instance specifying the parent port

> **Note:** Launching an instance directly on a subport is not supported. Always use the parent port.

## Nobus DNS

Managed DNS service for mapping domain names to IP addresses. **Free for all Nobus resources.**

### Supported Record Types
| Record | Purpose |
|--------|---------|
| **A** | Maps domain to IPv4 address |
| **AAAA** | Maps domain to IPv6 address |
| **CNAME** | Alias one domain to another |
| **MX** | Directs mail to email servers |
| **TXT** | Text records (SPF, verification) |
| **NS** | Authoritative name servers |
| **PTR** | Reverse DNS lookup |

### Nobus Name Servers
- **ns1.nobus.com** and **ns2.nobus.com**
- Nobus does NOT provide domain registration - register with a registrar and point NS records to Nobus

### Creating DNS Zones
1. **Project → DNS → Zones** → **Create Zone**
2. Enter your domain name (e.g., example.com)
3. System checks for duplicates, then creates the zone
4. Add records: select type (A, CNAME, MX, etc.), enter data, set TTL
5. Delegate domain: update your registrar's NS records to ns1.nobus.com and ns2.nobus.com

> **Tip:** Longer TTL values reduce DNS lookups but make updates slower. For frequently changing records, use TTL of 300-600 seconds.`
        },
      ],
      quiz: {
        id: 'quiz-tech-m4',
        title: 'Module 4 Quiz: Networking',
        questions: [
          {
            q: 'What is the recommended practice for SSH (port 22) access to production Linux servers?',
            options: ['Open to 0.0.0.0/0', 'Restrict to specific admin IP/CIDR', 'Disable SSH entirely', 'Use port 80 instead'],
          },
          {
            q: 'What bandwidth tier requires Nobus Partner Network (NPN) certification for NFT?',
            options: ['50 Mbps', '500 Mbps', '1 Gbps and above', 'All tiers'],
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
          content: `## The Shared Responsibility Model and the Security Stack

> **Why this matters:** Security is the first question enterprise evaluators ask and the fastest way to lose credibility if you answer vaguely. The shared responsibility model is the map: it says exactly what Nobus secures, what the customer (and you, as their partner) must secure, and which tools do each job.

### What you will learn
- The precise split of security duties between Nobus and the customer
- The layered security toolset and what each layer is for
- How to run the security conversation with an enterprise evaluator

### The model: who secures what

**Nobus secures the cloud itself:**
- Physical security of Tier III data centres (24/7 facility control)
- Infrastructure: hypervisors, storage fabric, core network
- Platform encryption machinery, IDS/IPS, SIEM monitoring, incident response process
- Compliance certifications (local market): ISO 27001 certified, PCI DSS certified, NDPA compliant; GDPR posture; ODPC compliant (Kenya)

**The customer (with you) secures what runs IN the cloud:**
- Data classification and encryption choices
- Identity: strong passwords, MFA enforcement, role-based access, key-pair hygiene
- Network policy: security groups, firewall rules, exposed ports
- Operating systems: patching, hardening, anti-malware
- Application security and activity monitoring

The one-line version for meetings: **"Nobus secures the building and the platform; we secure what you put in it, together."** Never imply the platform makes customer-side negligence safe; evaluators respect the honest split.

### The layered toolset (defense in depth)

| Layer | Tool | What it does |
|---|---|---|
| Instance NIC | Security Groups | Stateful allow rules per port/protocol/source; changes propagate to attached instances instantly |
| Network edge | Cloud Firewalls | Policy-based, ordered rules (first match wins), allow/deny/reject, IPv4 and IPv6 |
| Deep inspection | Sophos XG Firewall | NGFW appliance: synchronized security, AI threat detection, web/app control, email protection (min 2 vCPU / 4 GB, 30+80 GB disks) |
| Deep inspection (alt) | FortiGate NGFW | FortiOS: IPS, application control, DPI, UTM, SD-WAN, FortiGuard intelligence |
| SIEM & compliance | Fortinet FortiSIEM | Security information & event management: real-time threat detection, event correlation, and compliance reporting |
| Data at rest | FBS encryption | AES-256 on volumes and snapshots, encrypted in transit between instance and storage |
| Workload protection | Nobus Cloud Backup (powered by Acronis Cyber Protect) | Multi-cloud & SaaS backup + anti-ransomware + vulnerability scanning + forensic backup (min 8 GB RAM / 100 GB) |
| Connectivity | Site-to-Site VPN | IPsec, AES128/256, DH groups with PFS, SHA1/SHA2 |

### Design defaults you should apply on every engagement
1. Security groups per tier, least privilege: web admits 443 from the internet; app admits only the web SG; database admits only the app SG
2. Management ports (22, 3389) restricted to named admin IPs or reached via VPN; never 0.0.0.0/0
3. FBS encryption on for all volumes carrying customer data (it is standard; say so)
4. One NGFW appliance (Sophos or FortiGate) at the perimeter of any regulated-industry design
5. Nobus Cloud Backup on anything the customer cannot afford to lose, with a tested restore, not just a backup

### Running the enterprise security conversation
1. Open with the shared responsibility split (whiteboard it; two columns)
2. Walk the layers table top to bottom, mapping each to their stated concerns
3. Name the certifications once, precisely: ISO 27001 certified, PCI DSS certified, NDPA compliant (Nigeria), ODPC compliant (Kenya)
4. Close with the restore-drill offer: "Security you have not tested is a hope. We schedule quarterly restore drills."

### Key takeaways
- Nobus: physical, infrastructure, platform, certifications. Customer + partner: data, identity, network policy, OS, apps
- Defense in depth: security groups + cloud firewalls + NGFW appliance + encryption + protected backups
- Least-privilege security groups per tier is the default posture, not the premium option`
        },
        {
          id: 'tech-m5-l2',
          title: '5.3-5.5 Advanced Security & Compliance',
          content: `## Sophos XG Firewall

Enterprise-grade threat protection deployed within customer Nobus environments. Provides all the latest advanced technology to protect networks from ransomware and advanced threats.

### Key Features
- **IPS:** Real-time exploit and attack detection
- **Advanced Threat Protection:** AI-powered zero-day threat detection with machine learning
- **Cloud Sandboxing:** Behavioural analysis of suspicious files
- **Dual Antivirus Engines**
- **Web & Application Control:** Policy-based filtering
- **Email Protection:** Anti-spam, anti-phishing, encryption
- **Synchronized Security:** Automatically responds to threats based on real-time endpoint data
- **Central Management:** Unified console for monitoring and managing network security

### Sophos XG Deployment on Nobus - Step by Step

**Minimum Requirements:**
- 2 vCPU, 4 GB vRAM, 2 vNIC
- **Warning:** Nobus network MTU is **1458** - configure accordingly
- Two FBS volumes required:
  - **DiskI** (Security-Sophos-XG-Firewall-DiskI): **minimum 30 GB**
  - **DiskII** (Security-Sophos-XG-Firewall-DiskII): **minimum 80 GB**

**Setup Steps:**
1. **Create two FBS volumes** from the Sophos images:
   - Volume 1: Source = Security-Sophos-XG-Firewall-DiskI, Size ≥ 30 GB
   - Volume 2: Source = Security-Sophos-XG-Firewall-DiskII, Size ≥ 80 GB
2. **Launch FCS instance** using Volume 1 as boot source (Boot from Volume)
3. **Attach Volume 2** (auxiliary) to the running instance
4. **Hard reboot** the instance (Actions → Hard Reboot)
5. **Access the Sophos XG GUI** via the instance's Floating IP in a web browser
6. **Activate and register** the firewall with your Sophos license
7. **Configure** firewall rules, IPS policies, and VPN settings

> **Important:** Configure vCPU and vRAM according to your Sophos license. Do not exceed the max vCPUs specified in the license, or XG Firewall enters failsafe mode.

## FortiGate Next-Generation Firewall (NGFW)

Alternative enterprise firewall for Fortinet-standardized environments:

- **Next-Gen Firewall (NGFW):** Deep packet inspection + intrusion prevention + application control
- **Unified Threat Management (UTM):** Antivirus, web filtering, VPN in a single device
- **Secure SD-WAN:** Multi-site connectivity with security built in
- **High Performance:** Handles high traffic volumes with low latency
- **Centralized Management:** Control multiple FortiGate devices centrally
- **FortiGuard Labs:** Real-time global threat intelligence
- **Cloud Integration:** Secures cloud environments and integrates with cloud services

**Deployment:** Select **Security-Fortigate-FortiOS** from image list during instance creation. Contact cloud support for license activation.

## Nobus Cloud Backup (NCB) - powered by Acronis Cyber Protect

Protect mission-critical systems from servers to desktops/laptops:

- **Advanced Backup & Recovery** for various workloads (Nobus cloud, on-prem, AWS, Azure, Google Cloud, VMware, plus Microsoft 365 (Exchange, OneDrive, SharePoint) and Google Workspace)
- **Ransomware Protection** for all systems
- **Forensic Backup** - capture and preserve evidence
- **Vulnerability Scan** across your infrastructure
- **Antivirus Protection** integrated with backup
- **Single management view** for all protected workloads
- **Cost reduction** up to 50% vs. standalone tools
- Available in **consumption-based** or **per-workload** licensing models

**Deployment:** Select **acronis-cyberprotect** from image list. Min Disk: **100 GB**, Min RAM: **8192 MB**. Download User Guide and Admin Guide from the Acronis portal after deployment.

> **Key Selling Point:** On-premise customers and customers with AWS/Azure/GCP can backup their applications to Nobus - making Nobus a backup-as-a-service destination for multi-cloud environments.

## Nigerian Compliance Frameworks

| Framework | Relevance | How Nobus Helps |
|-----------|-----------|-----------------|
| **NDPA** | Data about Nigerian citizens must comply with NDPA | Data residency in Nigeria, encryption, access controls |
| **ODPC (Kenya)** | Data about Kenyan citizens under Kenya's Data Protection Act | Nobus is ODPC compliant; residency in the Nairobi zone (nobus-ea-az1) |
| **CBN Cybersecurity** | Banks must comply with CBN IT security standards | Tier III DC, AES-256 encryption, MFA, RBAC, IDS/IPS |
| **PCI-DSS** | Credit card data processing/storage | Nobus is PCI-DSS compliant; application-layer compliance is customer's responsibility |
| **ISO 27001** | International information security standard | Nobus is ISO 27001 certified |
| **GDPR** | EU data protection (for international customers) | Data processing agreements, encryption, access controls |`
        },
      ],
      quiz: {
        id: 'quiz-tech-m5',
        title: 'Module 5 Quiz: Security & Compliance',
        questions: [
          {
            q: 'In the shared responsibility model, who is responsible for OS patching?',
            options: ['Nobus', 'The customer', 'Both equally', 'Neither - it\'s automated'],
          },
          {
            q: 'Which Nigerian regulation requires data about citizens to be processed in accordance with data residency guidelines?',
            options: ['PCI-DSS', 'CBN Framework', 'NDPA', 'ISO 27001'],
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

Cloud containers are lightweight, portable units that package an application and its dependencies together, ensuring consistent operation across different environments.

### Benefits
- **Portability:** Run on any system with the container runtime
- **Isolation:** Each container runs in its own environment, preventing conflicts
- **Scalability:** Easily scale up/down based on demand

### Use Cases on Nobus
1. **Microservices Architecture** - Deploy loosely coupled services independently
2. **CI/CD Pipelines** - Automate build, test, and deployment for faster release cycles
3. **Hybrid Cloud Deployments** - Run identical containers across public and private clouds
4. **Development & Testing** - Create isolated, consistent environments
5. **Application Modernization** - Refactor legacy apps into containerized microservices
6. **Serverless Functions** - Event-driven containers for efficient resource usage
7. **Data Processing (ETL)** - Scalable extract-transform-load workflows
8. **Security & Compliance** - Isolate applications to reduce attack surface

> Contact Nobus cloud support to get started with cloud containers.

## Nobus Kubernetes Engine (NKE)

Nobus provides managed Kubernetes services - Kubernetes without the overhead of managing control plane infrastructure.

### What Nobus Manages
- **Provisioning:** Setting up the cluster with resources
- **Configuration:** Networking, storage, and security settings
- **Monitoring & Logging:** Health and performance tools
- **Scaling:** Usage-based cluster scaling
- **Security:** Best practices for the K8s environment

### Core Kubernetes Concepts

| Concept | Description |
|---------|-------------|
| **Cluster** | Set of worker nodes managed by a control plane |
| **Node** | FCS instance running containerised workloads |
| **Pod** | Smallest deployable unit - one or more containers |
| **Deployment** | Desired state for pods (replica count, update strategy) |
| **Service** | Network endpoint for pods (ClusterIP, NodePort, LoadBalancer) |
| **Ingress** | HTTP/HTTPS routing to internal services |
| **Persistent Volume** | FBS volume for stateful data |

### "Kubernetes the Hard Way" (Manual Setup)
For customers who prefer manual cluster setup, the process involves:
1. Provisioning FCS instances as nodes
2. Installing **kubeadm**, **kubelet**, and **kubectl** on each node
3. Initializing the control plane with \`kubeadm init\`
4. Joining worker nodes using the token from initialization
5. Configuring **Container Network Interface (CNI)** for inter-pod communication
6. Deploying applications using **YAML manifests**
7. Implementing monitoring and maintenance routines

### HA Architecture Best Practices
- **Multi-AZ worker nodes** across Availability Zones
- **Cluster Autoscaler** for automatic node scaling
- **Horizontal Pod Autoscaler (HPA)** for pod replica scaling
- **Load Balancer Service** for external traffic
- **FBS Persistent Volumes** for stateful workloads
- **Floating IPs** are NOT supported on K8s worker nodes`
        },
        {
          id: 'tech-m6-l2',
          title: '6.4-6.5 Managed Databases & Kafka',
          content: `## Managed Database Services

Nobus cloud database services provide scalability, high availability, cost optimization, simplified management, and enhanced security.

### Microsoft SQL Server (MSSQL)
- **Type:** Relational RDBMS by Microsoft
- **Language:** Transact-SQL (T-SQL) - stored procedures, triggers, user-defined functions
- **Integration:** Tight integration with Windows Server, Visual Studio, .NET Framework
- **Editions:** Express (free) through Enterprise for large-scale deployments
- **Best For:** .NET workloads, Windows ERP, Active Directory-integrated apps, enterprise reporting

### MySQL
- **Type:** Open-source relational RDBMS (GPL license)
- **Cross-Platform:** Windows, macOS, Linux
- **Scalability:** Replication, sharding, and clustering support
- **Ecosystem:** Massive community, plugins, widely used with PHP, Python, Ruby on Rails
- **Best For:** Web applications, CMS (WordPress), e-commerce, ERP systems

### PostgreSQL
- **Type:** Open-source object-relational DBMS (MIT-like license)
- **Advanced Features:** ACID compliance, advanced indexing, extensions, JSON support
- **Geospatial:** PostGIS extension for GIS applications
- **Full-Text Search:** Built-in full-text search capabilities
- **Best For:** Analytics, financial systems, geospatial apps, complex queries, scientific computing

### MongoDB
- **Type:** Open-source NoSQL document database (SSPL license)
- **Data Model:** Flexible JSON-like documents with dynamic schemas
- **Scalability:** Horizontal scaling with sharding, vertical scaling, replication
- **Query Language:** Rich query API with filtering, sorting, aggregation, geospatial indexes
- **Best For:** Content management, mobile apps, real-time analytics, IoT, rapid prototyping

| Database | Type | License | Best Use Cases |
|----------|------|---------|---------------|
| **MSSQL** | Relational / SQL | Commercial | .NET, Windows ERP, enterprise reporting |
| **MySQL** | Relational / SQL | GPL | Web apps, CMS, e-commerce |
| **PostgreSQL** | Object-Relational | MIT-like | Analytics, GIS, financial systems |
| **MongoDB** | Document / NoSQL | SSPL | CMS, IoT, mobile, rapid dev |

> Contact Nobus cloud support to get started with setting up your database cluster.

## Nobus Managed Kafka Service

Apache Kafka is an open-source distributed **event streaming platform** for high-throughput, fault-tolerant, real-time data processing.

### Core Concepts
| Concept | Description |
|---------|-------------|
| **Producer** | Application that sends messages to a topic |
| **Consumer** | Application that reads messages from a topic |
| **Topic** | Category where records are published; partitioned for scalability |
| **Partition** | Division of a topic for parallel processing |
| **Broker** | Kafka server that stores data and serves clients |
| **Consumer Group** | Consumers sharing load - each message goes to one consumer in the group |
| **Offset** | Unique ID per message within a partition for position tracking |

### Use Cases
- **Real-time analytics:** Process and analyze data streams in real time
- **Data integration:** Connect databases, data warehouses, and analytics tools
- **Log aggregation:** Centralize logs from multiple FCS instances and services
- **Event sourcing:** Store state changes as event sequences for replay
- **IoT data ingestion:** Handle high-throughput telemetry from devices

### Benefits of Managed Kafka on Nobus
- **Managed scaling:** grow the Kafka cluster on request as throughput demands, with broker and lag monitoring to signal when
- **Managed maintenance:** Nobus handles upgrades, patching, and monitoring
- **High availability:** Built-in redundancy across Availability Zones
- **Pay-as-you-go:** Only pay for resources consumed
- **Security:** Encryption, IAM, network security built in
- **Integration:** Connects to other Nobus services (databases, FOS, FCS)`
        },
      ],
      quiz: {
        id: 'quiz-tech-m6',
        title: 'Module 6 Quiz: Containers & Databases',
        questions: [
          {
            q: 'What is the smallest deployable unit in Kubernetes?',
            options: ['Container', 'Pod', 'Node', 'Cluster'],
          },
          {
            q: 'Which managed database is best suited for GIS applications and complex queries?',
            options: ['MySQL', 'PostgreSQL', 'MongoDB', 'MS SQL Server'],
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

Protect mission-critical systems from servers to desktops/laptops. Powered by **Acronis Cyber Protect**:

### NCB Features
1. **Advanced Backup & Recovery** for various workloads - cloud, on-premise, third-party cloud (AWS, Azure, Google Cloud, VMware), plus SaaS: Microsoft 365 (Exchange, OneDrive, SharePoint) and Google Workspace
2. **Ransomware Protection** for all systems
3. **Forensic Backup** - preserve evidence for investigation
4. **Vulnerability Scan** across your entire infrastructure
5. **Antivirus Protection** integrated with backup workflows
6. **Single management view** for all protected workloads
7. **Cost reduction** up to 50% vs. standalone backup + security tools

### Licensing Options
- **Consumption-based:** Pay per GB stored
- **Per-workload:** Fixed price per protected system

### Multi-Cloud & SaaS Backup
NCB supports backing up workloads from **any source** to Nobus:
- On-premise servers and desktops
- AWS, Azure and Google Cloud hosted applications
- VMware-based hypervisor environments
- Microsoft 365 (Exchange, OneDrive, SharePoint) and Google Workspace
- Other third-party cloud providers

> **Key Sales Point:** Nobus offers **free backup of your entire infrastructure** - subject to terms and conditions of the customer agreement. This is a unique differentiator.

### Acronis Deployment
- Image: **acronis-cyberprotect** (6.50 GB, Min Disk: 100 GB, Min RAM: 8192 MB)
- Download the **User Guide** and **Admin Guide** from the Acronis portal after deployment
- See Customer Support documentation for advanced configuration

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
- **Test recovery quarterly** - never assume snapshots work without testing
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
          },
          {
            q: 'How often should snapshot recovery be tested?',
            options: ['Daily', 'Weekly', 'Monthly', 'Quarterly'],
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
          content: `## Lab 1: Provision a Production-Grade Web Server

> **Objective:** Launch a Linux FCS instance, secure it correctly, assign public access, and serve a web page. This is the foundational workflow every Nobus engineer must perform confidently in front of a customer. Target time: 45 minutes.

### Prerequisites
- Partner lab credentials for dashboard.nobus.io
- A terminal with SSH (or PuTTY on Windows, with PuTTYgen)

### Part A: Key pair (5 min)
1. Console: Project > Compute > Key Pairs > Create Key Pair
2. Name it lab1-[yourname], type SSH, create, and the .pem downloads automatically
3. Secure it locally: on Linux/macOS run: chmod 400 lab1-yourname.pem
   (Windows/PuTTY: import the .pem into PuTTYgen, save as .ppk)
**Checkpoint:** you hold the private key; Nobus holds only the public half. If you lose the .pem, you cannot re-download it.

### Part B: Security group (5 min)
1. Project > Network > Security Groups > Create: name web-lab1
2. Add rules:
   - SSH, TCP 22, source: YOUR current public IP with /32 (find it via any what-is-my-ip service)
   - HTTP, TCP 80, source: 0.0.0.0/0
3. Note what you did NOT do: 22 is not open to the world. This is the habit that separates professionals.

### Part C: Launch the instance (10 min)
1. Project > Compute > Instances > Launch Instance
2. Name: web-lab1 | Source: image **Ubuntu-22.04-64bit** | Flavor: **si.2.4.30.l** (2 vCPU, 4 GiB, 30 GB)
3. Network: the lab subnet | Security group: web-lab1 | Key pair: lab1-[yourname]
4. Launch, and watch the status move Build -> Running (typically 2-4 minutes)
**Checkpoint:** note that billing starts at Running: pre-billing in action.

### Part D: Floating IP and connection (10 min)
1. Project > Network > Floating IPs > Allocate IP, then Associate it to web-lab1
2. Connect: ssh -i lab1-yourname.pem ubuntu@[floating-ip]
3. First-connection host fingerprint prompt: type yes
**Troubleshooting drill:** if the connection hangs, the cause is almost always (a) security group source IP wrong, (b) wrong username for the image, or (c) wrong key. Check in that order; this diagnostic order will serve you for years.

### Part E: Serve a page (10 min)
Run on the instance:
1. sudo apt update && sudo apt install -y nginx
2. echo "[Customer name] on Nobus Cloud - deployed by [you]" | sudo tee /var/www/html/index.html
3. Browse to http://[floating-ip] and see your page live on the internet

### Part F: Evidence and teardown (5 min)
1. Screenshot the browser page and the instance detail view (your lab evidence)
2. Teardown in order: disassociate and release the Floating IP, terminate the instance, delete the security group and key pair
3. Confirm the instance list is empty: in customer engagements, orphaned lab resources become billing complaints

### What you practiced
Key-pair auth, least-privilege security groups, image + flavor selection, floating IP mechanics, the SSH troubleshooting ladder, and clean teardown: the exact sequence of a customer PoC day one.`
        },
        {
          id: 'tech-m8-l2',
          title: 'Lab 2: Attach & Mount FBS Volume',
          content: `## Lab 2: Block Storage Operations with FBS

> **Objective:** Create, attach, format, use, snapshot, and restore an FBS volume. Storage operations are the heart of migration and DR work; this lab makes them muscle memory. Target time: 45 minutes.

### Prerequisites
- A running Linux instance from Lab 1 (or launch a fresh si.2.4.30.l)
- SSH access to it

### Part A: Create and attach a volume (10 min)
1. Console: Project > Volumes > Volumes > Create Volume
2. Name: data-lab2 | Size: **10 GB** | leave defaults
3. Actions > Manage Attachments > attach to your instance
4. On the instance, find the new device: lsblk (you will see a 10G disk, typically vdb, with no partitions)
**Concept check:** the volume is network-attached storage with AES-256 encryption at rest; it exists independently of the instance and can outlive it.

### Part B: Format and mount (10 min)
On the instance:
1. sudo mkfs.ext4 /dev/vdb
2. sudo mkdir /data && sudo mount /dev/vdb /data
3. df -h /data (confirm the ~10G filesystem)
4. Write test data: echo "customer-critical-file v1" | sudo tee /data/critical.txt
For permanence across reboots, add it to /etc/fstab (in production, always by UUID from blkid, never by device name; device letters can change).

### Part C: Snapshot (10 min)
1. Best practice: quiesce writes first: sudo sync
2. Console: Volumes > data-lab2 > Create Snapshot: name snap-lab2-v1
3. While it completes, understand the economics: snapshots are **incremental** (only changed blocks after the first) and are stored in FOS at 120 per GB-month of actual consumed data, not provisioned size
4. Now simulate the disaster: sudo rm /data/critical.txt (gone)

### Part D: Restore (10 min)
1. Console: Volumes > Snapshots > snap-lab2-v1 > Create Volume: name data-lab2-restored
2. Attach the new volume to the instance (it appears as vdc)
3. sudo mkdir /restore && sudo mount /dev/vdc /restore
4. cat /restore/critical.txt: your file is back
**Say this to customers verbatim:** "A backup you have not restored is a hope, not a backup. We just proved the restore."

### Part E: Resize awareness (5 min)
Volumes extend without downtime (Volumes > Extend Volume), followed by an online filesystem grow (resize2fs for ext4). Note the platform guidance of allowing several hours between successive modifications to the same volume. You will not exercise this in the lab, but you must be able to explain it.

### Part F: Teardown (5 min)
Unmount (sudo umount /data /restore), detach both volumes, delete volumes and the snapshot, and verify the Volumes list is clean.

### What you practiced
The complete volume lifecycle: create, attach, format, mount, snapshot, destroy, restore, and the incremental-snapshot economics that make Nobus DR designs affordable. This is the demo that closes DR-first deals.`
        },
        {
          id: 'tech-m8-l3',
          title: 'Lab 3: Upload to FOS & Lab 4: VPN',
          content: `## Lab 3: Object Storage with FOS + Lab 4: Site-to-Site VPN

> **Objective:** Two labs in one session. First, master FOS container and object operations (20 minutes). Then build a working IPsec VPN with pfSense, the connectivity pattern in most enterprise deals (70 minutes).

## Lab 3: FOS Object Storage (20 min)

### Part A: Containers and objects
1. Console: Project > Object Store > Containers > Create Container: name lab3-backups, access **Not public**
2. Upload any small file (a text file will do); note its metadata in the detail panel
3. Create a second container lab3-public with public access; upload an image; open its URL in a private browser window: it serves directly
**Concept check:** FOS is flat (containers hold objects; no real directories), distributed across data zones, and effectively unlimited. Objects are file + metadata.

### Part B: The economics conversation
Know these cold: storage **60/GB-month** at every tier, transfer-in free, requests 2 per 1,000, DELETE free, and zero egress fees on the platform. Run the numbers aloud: 500 GB of backup archives = 30,000/month. This is why FOS is the default backup target in your designs.

### Part C: Teardown
Delete objects, then containers (containers must be empty to delete).

## Lab 4: Site-to-Site VPN with pfSense (70 min)

### The scenario
Customer head office must reach cloud workloads privately. You will build the cloud side of an IPsec tunnel and verify traffic flows.

### Part A: Launch the pfSense appliance (15 min)
1. Launch an instance from image **pfsense-64bit**: minimum 2048 MB RAM, 30 GB disk (si.2.4 fits)
2. Security group for VPN (create vpn-lab4): UDP 500 (IKE), UDP 4500 (NAT-T), ESP (protocol 50), AH (protocol 51), plus HTTPS 443 and SSH 22 from your admin IP only
3. Associate a Floating IP; browse to https://[floating-ip] and complete the pfSense setup wizard

### Part B: Configure IPsec (25 min)
1. VPN > IPsec > Add P1 (Phase 1): remote gateway = the peer's public IP (your instructor pairs teams), IKEv2, encryption **AES-256**, hash **SHA-256**, DH group 14, and a strong pre-shared key exchanged out of band
2. Add P2 (Phase 2): local subnet = your cloud subnet, remote subnet = the peer's, ESP, AES-256/SHA-256, with PFS
3. Status > IPsec > Connect, and watch Phase 1 then Phase 2 establish
**Troubleshooting ladder:** (1) security group ports, (2) PSK mismatch, (3) phase parameter mismatch, (4) subnet overlap. In the field, 80% of tunnel failures are (1) or (2).

### Part C: Verify like a professional (20 min)
1. From an instance behind your pfSense, ping a private IP behind the peer's
2. Measure: run a throughput test across the tunnel and note latency
3. Record the evidence: tunnel status screenshot, ping output, throughput figure: exactly what you will hand a customer as PoC evidence

### Part D: Teardown (10 min)
Disconnect the tunnel, release the Floating IP, terminate the instance, delete the security group.

### What you practiced
Object storage lifecycle and its pricing story, appliance deployment from the image catalogue, real IPsec configuration with production-grade parameters, and the verification discipline that turns "it connects" into customer-signable evidence.`
        },
      ],
      quiz: {
        id: 'quiz-tech-m8',
        title: 'Module 8 Quiz: Hands-On Labs',
        questions: [
          {
            q: 'What command formats a new FBS volume as ext4 on Linux?',
            options: ['sudo format /dev/vdb ext4', 'sudo mkfs -t ext4 /dev/vdb', 'fdisk /dev/vdb', 'sudo mount -t ext4 /dev/vdb'],
          },
          {
            q: 'Which file must be edited to persist a volume mount across reboots?',
            options: ['/etc/hosts', '/etc/fstab', '/etc/mount.conf', '/etc/volumes'],
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
          content: `## Migration: Framework and Checklist

> **Why this matters:** Migration is where partner revenue lives: assessment, execution and the managed services that follow. It is also where reputations are made or destroyed. This lesson gives you the framework that makes migrations boring, which is exactly what customers pay for.

### What you will learn
- The 6R decision framework applied to Nobus targets
- The four-phase migration method with go/no-go gates
- The cutover checklist that prevents 2 AM surprises

### The 6R framework (decide per workload, not per customer)
| Strategy | Meaning | Nobus target |
|---|---|---|
| Rehost | Lift-and-shift as-is | FCS via image import/export |
| Replatform | Small upgrades in transit | FCS + swap self-managed DB for managed PostgreSQL/MySQL/MSSQL/MongoDB |
| Repurchase | Move to SaaS | Out of scope; be honest when it is the right answer |
| Refactor | Re-architect | Kubernetes Engine, Kafka, load-balanced tiers with monitoring & alerting |
| Retire | Kill it | Every estate has 10-20% of these; finding them funds the project |
| Retain | Leave (for now) | Keep on-prem, connect via VPN/Fast Transit, protect with NCB |

Most first engagements are **rehost + replatform**, with refactor as phase two once trust is earned.

### The four phases and their gates

**Phase 1: Assess (1-2 weeks).** Full inventory (the presales workload sheet), dependency mapping (what talks to what: missed dependencies are the number one migration killer), 6R decision per workload, licensing review (per-core licenses point to Dedicated Hosts/BYOL). *Gate: signed-off inventory and wave plan.*

**Phase 2: Prepare (1-2 weeks).** Build the landing zone: virtual data center, subnets, security groups per tier, VPN up, NMIs prepared, backup policies defined. Migrate ONE non-critical workload end-to-end as the pathfinder. *Gate: pathfinder running in production for one week.*

**Phase 3: Migrate (in waves).** Wave size 3-8 workloads, ordered: dev/test first, internal apps second, customer-facing last. Per workload: image import (or fresh build + data restore), parallel run, validation against pre-agreed checks, DNS/traffic cutover in a maintenance window. *Gate per wave: validation checklist green before the next wave starts.*

**Phase 4: Optimize (weeks 2-6 after).** Right-size from observed utilization (most rehosted instances are oversized 30-50%: pass the savings to the customer and bank the goodwill), set monitoring thresholds and alerts so capacity decisions are made early, snapshot schedules verified, handover runbook delivered, managed-services cadence begun.

### The cutover checklist (laminate this)
1. Rollback plan written and TESTED before the window opens
2. DNS TTLs dropped to 300s at least 24 hours ahead
3. Data sync verified: row counts, checksums, timestamps
4. Old system kept warm (paused, not deleted) for two weeks
5. Every stakeholder knows the window, the go/no-go time, and who decides
6. The first Nobus snapshot taken immediately after cutover succeeds

### The honest conversation (say this early)
"There will be a maintenance window; zero-downtime is available for some workloads at additional cost. Something small will surprise us; the plan absorbs it. Old systems stay recoverable for two weeks. That is what a professional migration looks like."

### Key takeaways
- 6R per workload; rehost + replatform first, refactor once trusted
- Four phases, each with a hard gate; the pathfinder workload de-risks everything after it
- Right-sizing after migration is your credibility dividend: measurable savings you hand the customer`
        },
      ],
      quiz: {
        id: 'quiz-tech-m9',
        title: 'Module 9 Quiz: Migration',
        questions: [
          {
            q: 'Which migration strategy involves the LEAST application changes?',
            options: ['Refactor', 'Replatform', 'Rehost (Lift & Shift)', 'Retire'],
          },
          {
            q: 'How long should you monitor after production cutover?',
            options: ['4 hours', '24 hours', '48-72 hours', '1 week'],
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
          content: `## Monitoring, Troubleshooting and Support Operations

> **Why this matters:** Day-2 operations are where partners earn recurring revenue and where customer trust compounds or evaporates. A defined operating rhythm, a diagnostic method, and a clean escalation path turn support from firefighting into a product you sell.

### What you will learn
- What to monitor on a Nobus estate and the thresholds that matter
- The four-layer diagnostic ladder for any incident
- The escalation model between customer, partner and Nobus support

### The monitoring baseline (per customer estate)
| What | Signal | Act when |
|---|---|---|
| Instance state | Running/paused/error | Any unexpected state change |
| CPU | Sustained utilization | > 80% for 15 min: scale or investigate |
| Memory | Utilization | > 85% sustained: resize or fix the leak |
| Disk | FBS volume fill | > 80%: extend the volume (online) |
| Endpoint | HTTP checks from outside | Any failed check, immediately |
| Backups | Snapshot/NCB job success | Any failed job, same day |
| Billing | Wallet balance and cycle date | Balance below one cycle: top up (auto-billing helps but watch it) |
| Network | Topology view in console | Use the Network Topology Center to visualize device connectivity |

Set these up in week one of every engagement. A monitoring gap discovered during an outage is a resume-generating event.

### The four-layer diagnostic ladder (work it in order, always)
**Layer 1: Platform.** Is the instance Running? Volume attached? Floating IP associated? AZ healthy? (Console, 2 minutes.)
**Layer 2: Network.** Security group rules for the failing port? Cloud firewall policy order (first match wins)? VPN tunnel phase 1/2 up? Can you reach the private IP from inside?
**Layer 3: Operating system.** SSH/RDP in: disk full (df -h)? Service running (systemctl status)? OOM killer in logs? Recent patch?
**Layer 4: Application.** App logs, database connections, dependency timeouts.

The discipline: never jump to layer 4 because the developer is loudest. 70% of incidents live in layers 2 and 3, and the ladder finds them in minutes.

### Worked example
"The website is down" at 08:10. L1: instance Running (2 min). L2: security group intact, but the load balancer backend shows one member ejected (3 min). L3: SSH to that member: root disk 100% full from unrotated logs (3 min). Fix: clear logs, add rotation, extend FBS volume online, re-enter the backend. Total: 15 minutes, and the postmortem action (log rotation fleet-wide) prevents the repeat. That postmortem note, sent to the customer unprompted, is what world-class support looks like.

### The escalation model
- **First line: you, the partner.** OS, application, configuration, and everything in layers 2-4. This is the managed-services fee you charge, per the Partner Agreement.
- **Second line: Nobus support** via the support portal (dashboard.nobus.io): platform faults, AZ issues, billing disputes, anything in layer 1 you cannot resolve.
- When escalating, send the evidence package: instance IDs, timestamps, what the ladder eliminated, screenshots. Tickets with evidence resolve dramatically faster, and your professionalism is visible to the customer.

### The operating rhythm you sell
Daily: dashboard sweep of all customer estates. Weekly: backup verification and capacity review. Monthly: service report to the customer (uptime, incidents, changes, recommendations). Quarterly: restore drill and right-sizing review. Put this rhythm in your managed-services contract; it is the product.

### Key takeaways
- Monitor the baseline table from week one; thresholds decided before incidents, not during
- The four-layer ladder, in order, every time; most incidents are network or OS layer
- First-line support is your revenue; escalate to Nobus with evidence packages, not vibes`
        },
      ],
      quiz: {
        id: 'quiz-tech-m10',
        title: 'Module 10 Quiz: Monitoring & Support',
        questions: [
          {
            q: 'What is the recommended CPU utilization threshold for alerting?',
            options: ['50%', '70%', '85%', '95%'],
          },
          {
            q: 'If an instance has no internet access, what should you check first?',
            options: ['FBS volume status', 'Floating IP and Security Group egress rules', 'NMI version', 'Instance flavor'],
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
          content: `## Handling Technical Objections

> **Why this matters:** In technical evaluations, the customer's engineers will probe you: partly to assess the platform, partly to assess YOU. A precise, honest answer to a hard technical question wins more trust than any slide. These are the objections you will face, with answers that hold up.

### What you will learn
- Precise responses to the eight technical objections you will actually hear
- Where to concede honestly, and how to reframe
- The demonstration that answers each objection better than words

**1. "OpenStack is dead / niche."**
Answer: OpenStack runs CERN's compute, Walmart's infrastructure, and most large telco clouds; it is the standard for sovereign and private-public cloud worldwide. For you it means standard APIs, Terraform support, and no proprietary lock-in. Demo: terraform plan against the platform.

**2. "Your instance catalogue is smaller than AWS's 400 types."**
Answer: True, and deliberate. The si.1 to si.16 families plus compute-optimized, storage-optimized, GPU and burstable classes cover the workload spectrum; AWS's catalogue exists partly because of a decade of hardware generations you must decode. Right-sizing from measured utilization matters far more than menu length. Demo: map their current servers to flavors in ten minutes, live.

**3. "What about the services you don't have?"**
Answer: Honestly: if the architecture requires a niche managed service Nobus lacks, we will say so; and NCB even protects workloads that stay on AWS or Azure. For the core enterprise estate (compute, storage, Kubernetes, Kafka, four database engines, firewalls, DNS), the catalogue is complete. Never bluff a missing service; name the workaround or concede.

**4. "Can it really handle our scale?"**
Answer: Right-size from measured peaks, then run proactive monitoring with threshold alerts so capacity decisions are made early and deliberately - scale up (vertical resize) or scale out behind a load balancer, across multiple AZs. We do not auto-scale silently, so there are no surprise scaling events or bill shocks; you stay in control. Then make it concrete: "Your peak is X concurrent users; that is N si.4.8 instances behind a load balancer, with alerts at 70% so you add capacity before it hurts; let us prove it in a 14-day PoC with your load profile." Scale objections die in PoCs, not in meetings.

**5. "How is 99.982% credible for a local provider?"**
Answer: It is the Tier III design standard: concurrent maintainability, N+1 power and cooling, multi-AZ. Offer the honest comparison: "Measure your current environment's real availability first; most on-prem rooms cannot document 99.5%." Then put the SLA in the contract.

**6. "IPv6? Multi-region replication? [Feature X]?"**
Answer: The platform is IPv4-only for virtual data centers today; cross-zone DR is achieved with snapshot copies and NCB replication across the Lagos zones (Ikeja, Lekki) or to the East Africa zone in Nairobi. State roadmap items only when they are public and dated. Engineers forgive gaps; they never forgive discovered bluffs.

**7. "Migration will break things."**
Answer: Agree: unmanaged migrations do. Walk the four-phase framework: pathfinder workload, parallel runs, validation gates, tested rollback, two-week warm standby. Offer the migration lab demo as proof the tooling exists.

**8. "We'll be locked in."**
Answer: The exit path is real: image export service, standard OpenStack APIs, open-source Linux images, and your data in standard formats (ext4 volumes, S3-style objects, standard database engines). "We keep you by being better, not by holding your data hostage." That sentence, delivered calmly, ends the objection.

### The meta-skill
Concede small points quickly and completely ("correct, we do not have that today"); it buys the credibility that carries your strong answers. Engineers are allergic to salespeople; be an engineer with a quota instead.

### Key takeaways
- Every objection gets: direct answer, honest concession where due, then a demonstrable proof
- Scale and performance objections convert to PoC success criteria; never argue them verbally
- Fast, clean concessions on small gaps are what make your big claims believable`
        },
      ],
      quiz: {
        id: 'quiz-tech-m11',
        title: 'Module 11 Quiz: Technical Objections',
        questions: [
          {
            q: 'What percentage of enterprise workloads run on core compute, storage, and networking?',
            options: ['50%', '65%', '80%', '95%'],
          },
          {
            q: 'What uptime guarantee do Nobus Tier III data centres provide?',
            options: ['99.5%', '99.9%', '99.95%', '99.982%'],
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
          content: `## Certification: Competency Levels and Assessment

> **Why this matters:** Certification is not a ceremony; it is the quality bar that lets Nobus and customers trust the partner channel. This lesson explains exactly what each level requires, how assessment works, and how to prepare so your team passes the first time.

### What you will learn
- The three competency levels and what each qualifies you to do
- The assessment format and pass requirements
- A two-week preparation plan that works

### The three levels

**Level 1: NCS Associate (this bootcamp's target)**
- **Scope:** Deploy and operate core services: FCS instances, FBS/FOS storage, security groups, floating IPs, basic backup
- **Qualifies you to:** run standard deployments and PoCs under supervision, deliver Lab 1-4 workflows to customers
- **Assessment:** module quizzes across this course (75% pass mark each) plus the final knowledge check

**Level 2: NCS Professional**
- **Scope:** Architecture and migration: multi-tier designs, monitoring-driven scaling, VPN/Fast Transit connectivity, the 6R migration framework executed end-to-end, DR design with tested restores
- **Qualifies you to:** lead customer implementations and own technical delivery on registered deals
- **Assessment:** scenario-based exam plus a documented real or lab migration

**Level 3: NCS Expert**
- **Scope:** Complex estates: Kubernetes and Kafka architectures, regulated-industry designs (NDPA/PCI), performance engineering, multi-workload cutovers
- **Qualifies you to:** act as the customer-facing architect on enterprise accounts, and train/mentor Associates
- **Assessment:** panel review of a delivered project plus an advanced practical

Certifications map directly to partner-tier progression: certified staff counts are a factor in advancing from Registered toward Platinum, which unlocks deeper program benefits.

### How the quizzes work (Level 1 mechanics)
- Each module ends in a quiz; **75% is the pass mark**
- Retakes are permitted under the platform's retake policy (attempt limits and cooldowns apply), so treat the first attempt seriously
- Your progress and passes are visible to your org admin and count toward the organization's standing

### The two-week preparation plan
**Week 1: Content.** One module per sitting, in order; keep your own one-page summary per module (writing it is the revision). Flag anything you cannot explain aloud to a colleague.
**Week 2: Practice.** Re-run Labs 1-4 without the instructions; whiteboard the reference architectures from memory; drill the numbers that recur (instance naming, 99.982%, 120/GB FBS, 60/GB FOS, entry 9,309, pass mark 75%); then take the quizzes.

### Exam technique (yes, it matters)
- Read every option; distractors are built from common misconceptions you have now been warned about
- Absolute words ("always", "only") usually mark wrong answers; platform reality has conditions
- When two options seem right, re-read the question for the qualifier ("MOST cost-effective", "FIRST step")
- Answer from the course material, not from how AWS does it; translation errors are the top cause of wrong answers

### After you pass
Your certificate is downloadable from the platform and verifiable; add it to LinkedIn (it markets both you and the program), and book your Level 2 path with your org admin. Certification expires with major platform revisions, so expect periodic re-certification: staying current is the point.

### Key takeaways
- Associate = operate core services; Professional = architect and migrate; Expert = complex estates and mentorship
- 75% pass mark, limited retakes: prepare properly and take attempt one seriously
- Certified headcount advances your organization's partner tier; your exam is a team contribution`
        },
      ],
      quiz: {
        id: 'quiz-tech-m12',
        title: 'Module 12 Quiz: Certification',
        questions: [
          {
            q: 'What is the passing score for the NCS Associate Technical Assessment?',
            options: ['60%', '70%', '75%', '80%'],
          },
          {
            q: 'How many successful customer deployments are needed for Level 2 Professional certification?',
            options: ['1', '3', '5', '10'],
          },
        ],
      },
    },
  ],
};

export default technicalCourse;
