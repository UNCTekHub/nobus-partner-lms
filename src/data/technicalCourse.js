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

Nobus Flexible Compute Service (FCS) is a web service that provides **resizable compute capacity in the cloud**. FCS allows creating Virtual Machines (VM) on-demand, configuring security and networking, and managing storage. You only pay for resources actually consumed, in instance-hours.

### Key Features
- Virtual computing environments (instances) with configurable CPU, memory, storage, and networking
- Preconfigured templates called **Nobus Machine Images (NMIs)**
- Secure login using **key pairs** (SSH)
- **FBS volumes** for persistent block storage (1 GB to 1 TB)
- **Instance Snapshots** to preserve disk state
- **Security Groups** to control inbound/outbound traffic
- **Floating IP** addresses for static public access
- Logically isolated virtual networks via **Data Center as a Service (DaaS)**

## Instance Naming Convention

Nobus uses a structured naming: **si.{vCPU}.{RAM_GB}.{Disk_GB}.{OS}**
- **.l** = Linux (no license cost)
- **.w** = Windows Server (license included)

## Instance Types & Flavors

### Entry-Level (1-2 vCPU) — Web Servers, Microservices, Dev/Test
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

### Mid-Range (4 vCPU) — Enterprise Apps, Databases, Backend Servers
| Flavor | vCPU | RAM | Disk | OS | Best For |
|--------|------|-----|------|----|----------|
| si.4.4.30.l | 4 | 4 GB | 30 GB | Linux | Application servers |
| si.4.6.30.l | 4 | 6 GB | 30 GB | Linux | Middleware, caching fleets |
| si.4.16.30.l | 4 | 16 GB | 30 GB | Linux | Small/medium databases |
| si.4.24.30.l | 4 | 24 GB | 30 GB | Linux | SAP, SharePoint, cluster computing |
| si.4.32.30.l | 4 | 32 GB | 30 GB | Linux | Enterprise applications |
| si.4.4.50.w – si.4.24.50.w | 4 | 4-24 GB | 50 GB | Windows | Windows enterprise apps |

### High-Performance (8 vCPU) — Direct Hardware Access, Bare-Metal-Like
| Flavor | vCPU | RAM | Disk | OS | Best For |
|--------|------|-----|------|----|----------|
| si.8.16.30.l | 8 | 16 GB | 30 GB | Linux | Non-virtualized licensing |
| si.8.24.30.l | 8 | 24 GB | 30 GB | Linux | Low-level hardware features |
| si.8.32.30.l | 8 | 32 GB | 30 GB | Linux | High-compute workloads |
| si.8.16.50.w – si.8.32.50.w | 8 | 16-32 GB | 50 GB | Windows | Windows high-performance |

### Burstable (8-16 vCPU, 64 GB) — Variable Workloads
| Flavor | vCPU | RAM | Disk | OS | Best For |
|--------|------|-----|------|----|----------|
| si.8.64.30.l | 8 | 64 GB | 30 GB | Linux | Websites, code repos, staging |
| si.16.64.30.l | 16 | 64 GB | 30 GB | Linux | Microservices, build/test |
| si.8.64.50.w | 8 | 64 GB | 50 GB | Windows | Windows web apps |
| si.16.64.50.w | 16 | 64 GB | 50 GB | Windows | Windows build environments |

> **Important:** FCS Instances are **pre-billed at launch** — costs accrue while the instance exists, even when stopped. Advise customers to **terminate** (not just stop) instances they no longer need.`
        },
        {
          id: 'tech-m2-l2',
          title: '2.3-2.4 Machine Images & Launching Instances',
          content: `## Nobus Machine Images (NMIs)

NMIs are pre-configured VM templates (equivalent to AMIs on AWS):

- **FBS-backed NMIs** (recommended) — data persists on stop/start
- **Instance Store-backed NMIs** — ephemeral, data lost on stop/termination
- **Custom NMIs** — created from existing instances for standardised deployments

### Available Public Images

| Image Name | Format | Size | Min Disk | Min RAM | Notes |
|-----------|--------|------|----------|---------|-------|
| **Ubuntu-22.04-64bit** | QCOW2 | ~600 MB | 30 GB | 2048 MB | Most popular Linux choice |
| **CentOS-7-64bit** | QCOW2 | 618 MB | 30 GB | 2048 MB | Legacy enterprise Linux |
| **CentOS-8-64bit** | QCOW2 | 774 MB | 30 GB | 2048 MB | Enterprise workloads |
| **debian-10-generic-64Bit** | QCOW2 | 217 MB | 20 GB | 1024 MB | Minimal Debian |
| **debian-11-genericcloud-64Bit** | QCOW2 | 247 MB | 30 GB | 2048 MB | Current Debian stable |
| **debian-12-generic-64Bit** | QCOW2 | 361 MB | 30 GB | 2048 MB | Latest Debian |
| **Rocky-Linux-8-64bit** | QCOW2 | ~600 MB | 30 GB | 2048 MB | CentOS replacement |
| **Rocky-Linux-9-64bit** | QCOW2 | ~600 MB | 30 GB | 2048 MB | Latest Rocky |
| **Oracle_Linux_9_64bit** | QCOW2 | 561 MB | 40 GB | — | Oracle database workloads |
| **Windows-Server-2019** | QCOW2 | ~12 GB | 50 GB | 4096 MB | Windows Server (licensed) |
| **Windows-Server-2022** | QCOW2 | ~12 GB | 50 GB | 4096 MB | Latest Windows Server |
| **pfsense-64bit** | QCOW2 | 2.94 GB | 30 GB | 2048 MB | Firewall/VPN appliance |
| **acronis-cyberprotect** | QCOW2 | 6.50 GB | **100 GB** | **8192 MB** | Backup & security |
| **Security-Fortigate-FortiOS** | QCOW2 | ~2 GB | 30 GB | 2048 MB | FortiGate NGFW |
| **Security-Sophos-XG-Firewall-DiskI** | QCOW2 | ~3 GB | 30 GB | 4096 MB | Sophos primary disk |
| **cirros-0.5.1-64bit** | QCOW2 | 15 MB | 10 GB | 1024 MB | Tiny test image |

> **Note:** Nobus also supports VM Import/Export — you can upload private images from your local environment and convert them into NMIs.

## Launching an FCS Instance — Step by Step

1. Log in to **cloud.nobus.io** → click **Cloud Config Panel**
2. Navigate to **Project → Compute → Instances** → click **Launch Instance**
3. **Details tab:**
   - **Instance Name** — becomes the initial hostname
   - **Availability Zone** — default is \`nova\` (must match bootable volume AZ if using boot-from-volume)
   - **Count** — number of identical instances (max 10 by default)
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

Nobus FBS provides **durable, block-level storage devices** that you can attach to FCS instances. FBS volumes behave like raw, unformatted block devices — you can create a file system on top or use them as raw block devices. Volumes range from **1 GB to 1 TB** and persist independently from the life of an instance.

### Key Characteristics
- **Persistence:** FBS volumes persist independently from the running life of an FCS instance
- **Availability Zone:** Created in a specific AZ and can only attach to instances in the same AZ
- **Multiple volumes:** Multiple volumes can be attached to one instance, but each volume attaches to one instance at a time
- **Encryption:** AES-256 encryption for data at rest, data in transit, and snapshots — all automatically encrypted
- **Extendable:** You can increase volume size, change type, and reset performance **without detaching or restarting** the instance

### Delete on Termination Behavior
- **Root volume:** Deleted by default when instance terminates (set DeleteOnTermination=false to persist)
- **Additional volumes:** Persist by default when instance terminates (set DeleteOnTermination=true to auto-delete)
- **Important:** FBS volumes are billed regardless of instance state — you pay for the volume even if the instance is terminated

### FBS Volume Types

| Type | Backing | Performance | Best For |
|------|---------|-------------|----------|
| **Standard SSD (GP2)** | SSD | 3 IOPS/GB, burst to 3,000 IOPS | Boot volumes, dev/test, general apps |
| **Provisioned IOPS (IO1)** | SSD | Up to 64,000 IOPS, single-digit ms latency | Mission-critical databases, OLTP |
| **Throughput Optimized (ST1)** | HDD | Throughput-focused | Log processing, data warehouses, big data |
| **Cold Storage (SC1)** | HDD | Lowest cost per GB | Cold archives, infrequently accessed data |

### Creating an FBS Volume — Step by Step
1. Log in to cloud.nobus.io → **Project → Volumes → Volumes**
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

Point-in-time backups of FBS volumes. **Incremental** — only changed blocks since the last snapshot are saved, but you only need the most recent snapshot to fully restore a volume.

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
- You can snapshot attached, in-use volumes — data is captured at the moment the command is issued
- **Concurrent limit:** Maximum 5 snapshots in progress per account
- **Database best practice:** Flush and quiesce before snapshot:
  - MySQL: \`FLUSH TABLES WITH READ LOCK\`
  - PostgreSQL: \`pg_start_backup() / pg_stop_backup()\`
- Deleting a snapshot only removes data **uniquely referenced** by that snapshot — data referenced by other snapshots is preserved

### Group Snapshots
Capture **crash-consistent snapshots across multiple FBS volumes** simultaneously — critical for applications that span multiple volumes (e.g., database data + logs on separate volumes).

---

## Flexible Object Storage (FOS)

Nobus FOS is an extensive distributed storage platform for **any type or amount of file** — backups, archives, media files, static websites, and data lakes.

### Core Concepts
- **Containers:** Top-level storage namespaces (similar to S3 buckets). Containers are **not nested** — you cannot create a container inside another container, but you can have multiple containers.
- **Objects:** Files + associated metadata stored within containers
- **Access Control:** Per-container permissions — who can create, delete, and list objects
- **Console URL:** Manage FOS at **https://fos-az1.nobus.io/**

### FOS Operations — Step by Step

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
          content: `## Nobus Data Center as a Service (DaaS) — Networking Overview

Nobus DaaS allows connection to public or private network infrastructure with encrypted VPN or dedicated Fast Transit connections. You have **complete control** over your virtual networking environment: IP address ranges, subnets, route tables, and network gateways.

### Available Network Services
- Security Groups, Firewall as a Service (FaaS), Network ACLs
- Load Balancer, Auto-Scaling
- Software-defined network infrastructure (switches, routers)

> **Important:** Nobus currently supports **IPv4 only**. IPv6 is not supported. You must specify an IPv4 CIDR block when creating a network.

### IP Addressing
- **Private IPv4:** Allocated via DHCP from your subnet's CIDR range (RFC 1918). Used for inter-instance communication within the same DaaS network.
- **Public IPv4:** Auto-assigned from Nobus's pool. Mapped to private IP via NAT. **Released when instance is stopped or terminated** — you get a new one on restart.
- **Floating IPs:** Static public IPv4 addresses that persist across stop/start. See Floating IPs section below.

| Component | Description |
|-----------|-------------|
| **VPC / DaaS** | Logically isolated network environment with custom IP addressing and routing |
| **Subnets** | IP address ranges within a VPC with DHCP, DNS, and gateway configuration |
| **Cloud Router** | Routing between subnets and external networks. Supports BGP and static routes. |
| **Floating IPs** | Reserved static public IPv4 addresses — persist across instance lifecycle |
| **Security Groups** | Stateful virtual firewalls at instance level |
| **Cloud Firewall (FaaS)** | Tenant-level logical firewall with ordered policy rules |
| **Cloud Trunks** | Multi-network via single vNIC using VLAN segmentation |
| **Nobus Fast Transit (NFT)** | Dedicated private connection from premises to Nobus (50Mbps – 10Gbps) |
| **Site-to-Site VPN** | Encrypted IPSec tunnels via pfSense for hybrid connectivity |
| **Nobus DNS** | Managed DNS service (free for Nobus resources) |

### Creating a Network — Step by Step
1. Navigate to **Project → Network → Networks** → click **Create Network**
2. **Network tab:** Name, Shared (admin only), Admin State, check "Create Subnet"
3. **Subnet tab:** Subnet Name, Network Address (CIDR), IP Version (IPv4), Gateway IP
4. **Subnet Details:** Enable DHCP, Allocation Pools, DNS Name Servers, Host Routes
5. Click **Create** — the network appears on the Networks dashboard`
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
| **MySQL Database** | TCP | 3306 | App Server SG only | Backend only — no Floating IP |
| **PostgreSQL** | TCP | 5432 | App Server SG only | Backend only |
| **MongoDB** | TCP | 27017 | App Server SG only | Backend only |
| **MS SQL Server** | TCP | 1433 | App Server SG only | Backend only |
| **Ping/ICMP** | ICMP | All | Specific CIDR | For diagnostics |
| **DNS** | UDP/TCP | 53 | 0.0.0.0/0 | DNS server |
| **Load Balancer** | TCP | 80, 443 | 0.0.0.0/0 | Backends reference LB SG |

## Cloud Firewalls (FaaS)

Tenant-level logical firewalls with **ordered policy-based rules**:

- **Firewall Rules:** IP source/dest, protocol, port, action (Allow/Deny/Reject)
- **Firewall Policies:** Ordered collection of rules — traffic matching the first rule stops further evaluation
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
- Floating IPs **do NOT replace** the instance's original public IP — they are additional
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
3. Receive **Letter of Authorization — Connecting Facility Assignment (LOA-CFA)** via email
4. Provide LOA-CFA to your NPN Partner or network carrier for cross-connect
5. If you don't have equipment at the NFT point, an NPN Partner can arrange it
6. Once connection is up, create virtual interfaces in the Nobus Management Console
7. **Respond to info requests within 7 days** or the connection is deleted

> **Partner Revenue Opportunity:** NPN-certified partners can resell dedicated connectivity as recurring revenue. NFT-authorized partners provision hosted connections for their customers.

---

## Site-to-Site VPN with pfSense

For customers needing hybrid connectivity without NFT cost. Nobus uses **pfSense** — an open-source firewall/VPN appliance.

### VPN Instance Setup
- **Image:** pfsense-64bit (2.94 GB, min 30GB disk, 2048MB RAM)
- **Required Security Group Ports:**

| Protocol | Port | Purpose |
|----------|------|---------|
| UDP | 500 | IKE — encryption key management |
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
- Nobus does NOT provide domain registration — register with a registrar and point NS records to Nobus

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

### Sophos XG Deployment on Nobus — Step by Step

**Minimum Requirements:**
- 2 vCPU, 4 GB vRAM, 2 vNIC
- **Warning:** Nobus network MTU is **1458** — configure accordingly
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

## Acronis Cyber Protect (Nobus Cloud Backup)

Protect mission-critical systems from servers to desktops/laptops:

- **Advanced Backup & Recovery** for various workloads (Nobus cloud, on-prem, AWS, Azure, GCP, VMware)
- **Ransomware Protection** for all systems
- **Forensic Backup** — capture and preserve evidence
- **Vulnerability Scan** across your infrastructure
- **Antivirus Protection** integrated with backup
- **Single management view** for all protected workloads
- **Cost reduction** up to 50% vs. standalone tools
- Available in **consumption-based** or **per-workload** licensing models

**Deployment:** Select **acronis-cyberprotect** from image list. Min Disk: **100 GB**, Min RAM: **8192 MB**. Download User Guide and Admin Guide from the Acronis portal after deployment.

> **Key Selling Point:** On-premise customers and customers with AWS/Azure/GCP can backup their applications to Nobus — making Nobus a backup-as-a-service destination for multi-cloud environments.

## Nigerian Compliance Frameworks

| Framework | Relevance | How Nobus Helps |
|-----------|-----------|-----------------|
| **NDPR** | Data about Nigerian citizens must comply with NDPR | Data residency in Nigeria, encryption, access controls |
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

Cloud containers are lightweight, portable units that package an application and its dependencies together, ensuring consistent operation across different environments.

### Benefits
- **Portability:** Run on any system with the container runtime
- **Isolation:** Each container runs in its own environment, preventing conflicts
- **Scalability:** Easily scale up/down based on demand

### Use Cases on Nobus
1. **Microservices Architecture** — Deploy loosely coupled services independently
2. **CI/CD Pipelines** — Automate build, test, and deployment for faster release cycles
3. **Hybrid Cloud Deployments** — Run identical containers across public and private clouds
4. **Development & Testing** — Create isolated, consistent environments
5. **Application Modernization** — Refactor legacy apps into containerized microservices
6. **Serverless Functions** — Event-driven containers for efficient resource usage
7. **Data Processing (ETL)** — Scalable extract-transform-load workflows
8. **Security & Compliance** — Isolate applications to reduce attack surface

> Contact Nobus cloud support to get started with cloud containers.

## Cloud Kubernetes Engine (CKE)

Nobus provides managed Kubernetes services — Kubernetes without the overhead of managing control plane infrastructure.

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
| **Pod** | Smallest deployable unit — one or more containers |
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
- **Language:** Transact-SQL (T-SQL) — stored procedures, triggers, user-defined functions
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
| **Consumer Group** | Consumers sharing load — each message goes to one consumer in the group |
| **Offset** | Unique ID per message within a partition for position tracking |

### Use Cases
- **Real-time analytics:** Process and analyze data streams in real time
- **Data integration:** Connect databases, data warehouses, and analytics tools
- **Log aggregation:** Centralize logs from multiple FCS instances and services
- **Event sourcing:** Store state changes as event sequences for replay
- **IoT data ingestion:** Handle high-throughput telemetry from devices

### Benefits of Managed Kafka on Nobus
- **Dynamic scaling:** Auto-scale Kafka cluster based on demand
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

Protect mission-critical systems from servers to desktops/laptops. Powered by **Acronis Cyber Protect**:

### NCB Features
1. **Advanced Backup & Recovery** for various workloads — cloud, on-premise, or third-party cloud (AWS, Azure, GCP, VMware)
2. **Ransomware Protection** for all systems
3. **Forensic Backup** — preserve evidence for investigation
4. **Vulnerability Scan** across your entire infrastructure
5. **Antivirus Protection** integrated with backup workflows
6. **Single management view** for all protected workloads
7. **Cost reduction** up to 50% vs. standalone backup + security tools

### Licensing Options
- **Consumption-based:** Pay per GB stored
- **Per-workload:** Fixed price per protected system

### Cross-Cloud Backup
NCB supports backing up workloads from **any source** to Nobus:
- On-premise servers and desktops
- AWS, Azure, GCP hosted applications
- VMware-based hypervisor environments
- Other third-party cloud providers

> **Key Sales Point:** Nobus offers **free backup of your entire infrastructure** — subject to terms and conditions of the customer agreement. This is a unique differentiator.

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
