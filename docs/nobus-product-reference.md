# Nobus Cloud Services - Product & Pricing Reference

Extracted from nobus.io documentation and pricing pages (July 2026). Source material for the
Sales, Presales Engineering, and Technical Engineering training tracks.

---

## Compute

### Nobus Flexible Compute Service (FCS)
- Web service providing **resizable compute capacity in the cloud** - on-demand VM instances.
- Core concepts: instances, instance types (CPU/memory/storage/network combos), Nobus Machine
  Images (NMIs - preconfigured templates), key-pair SSH login, FBS volumes (1 GB-1 TB),
  snapshots, Availability Zones, security groups, static IPv4 (Flexible IP), isolated virtual networks.
- **Instance families**: Standard (si.1.x → si.16.x), Compute Optimized, Storage Optimized, GPU,
  Burstable (si.8.64 / si.16.64). Naming: `si.<vCPU>.<RAM>.<disk>.<l|w>` - `.30.l` = Linux 30 GB disk,
  `.50.w` = Windows 50 GB disk.
- Standard instance examples: si.2.2.30.l (2 vCPU/2 GiB), si.2.4.30.l, si.2.8.30.l, si.4.4.30.l,
  si.4.8.30.l, si.4.16.30.l, si.8.16.30.l; Windows: si.2.4.50.w … si.8.64.50.w.
- Use cases: web servers, microservices, databases, caching, enterprise apps.
- PCI DSS compliant (card data processing). Application Load Balancer available.
- Access: SSH keys (OpenSSH; PuTTY with .pem→.ppk on Windows).

### FCS Autoscaling
- Automatically adds/removes FCS instances per user-defined conditions.
- Monitors health, replaces impaired instances, balances across Availability Zones.
- **Dynamic** (demand metrics), **Predictive** (ML traffic forecasting), **Scheduled** scaling.
- No additional fees beyond standard FCS charges.

### Dedicated Hosting (BYOL)
- Dedicated physical servers; highest resource allocation, privacy, control.
- Bring Your Own License: Microsoft/Oracle per-socket, per-core, per-VM licenses
  (Windows Server, SQL Server, SUSE, RHEL). Integrated with Nobus License Manager.
- Compliance-driven workloads; automatic host maintenance with scheduling control.

### Image Listing
- **Windows distributions** - managed licensing or BYOL.
- **Open-source Linux** - Ubuntu (e.g. Ubuntu-22.04-64bit), CentOS, etc.
- **Nobus Machine Images (NMI)** - preconfigured templates; custom uploads, instance snapshots,
  volume snapshots. Image Import/Export service for VM migration.

### CloudOrchestration Templates
- Infrastructure-as-code: native **Heat** template format + **AWS CloudFormation compatibility**.
- Native ReST API + CloudFormation-compatible Query API (existing IaC scripts run with minimal changes).
- Deploys **Stacks** - logical resource groups (instances, floating IPs, volumes, security groups)
  with unified lifecycle. Parameters: stack name, creation timeout, rollback-on-failure, KeyName,
  InstanceType. Templates via URL, file upload, or direct entry.

---

## Storage & Backup

### Nobus Flexible Block Storage (FBS)
- Durable **block-level volumes (1 GB-1 TB)** attachable to a single FCS instance.
- Persists independently of instance lifecycle; reattach to new instances; same-AZ requirement.
- Multiple volumes per instance; striping supported; dynamic resize without downtime
  (5-hour wait recommended between modifications).
- **AES-256 encryption** at rest, encrypted in transit, encrypted snapshots.
- **Snapshots are incremental** (only changed blocks stored); copy across AZs for DR; shareable
  (specific zones or public); deleting a snapshot preserves data referenced by others.
- Volume transfer between projects via Transfer ID + Authorization Key (7-day window).
- Use cases: databases, file systems, boot volumes, dev/test, DR/migration.

### Flexible Object Storage (FOS)
- Extensive, effectively unlimited object storage; distributed across data zones.
- **Containers** (bucket-like, flat structure) hold objects = file + metadata; any type/size -
  backups, archives, media.
- Per-container access control (create/delete/list permissions), access logs, zone selection.
- Pay-as-you-go for storage + transfer. Managed via dashboard.nobus.io.

### Nobus Cloud Backup (NCB)
- Powered by **Acronis**: protects servers → desktops/laptops, cloud and on-prem, third-party
  clouds (AWS, Azure, GCP), VMware hypervisors.
- Features: advanced backup/recovery, **ransomware protection**, forensic backup, vulnerability
  scanning, antivirus, single-pane management. Claims up to **50% cyber-protection cost savings**.
- Licensing: consumption-based or per-workload. Pricing via sales.

### FOS Backup Solution
- Backup targeting FOS unlimited object storage; FBS snapshots are also stored in FOS.

---

## Networking

### Datacenter as a Service (DaaS)
- Logically isolated virtual data centers; user-defined IP ranges, subnets, route tables, gateways.
- Encrypted VPN tunnels (MPLS or Internet); multi-cloud/physical infrastructure support.
- Includes Security Groups, FWaaS, Network ACLs, Load Balancers, Auto-Scaling. **IPv4 only** (CIDR
  required at creation). No charge for the DaaS itself - pay for resources inside it.

### Nobus Fast Transit (NFT)
- **Dedicated private connection** from customer premises to a Nobus FastTransit point - bypasses ISP.
- Dedicated (1/10 Gbps fixed fiber: 1000BASE-LX / 10GBASE-LR) or Hosted via partner (50 Mbps-10 Gbps).
- 802.1Q VLAN encapsulation, BGP + MD5 auth, BFD, IPv4 & IPv6.
- Setup: choose location/port → support creates request → LOA-CFA issued → partner cross-connect →
  configure virtual interfaces (public = FOS etc., private = data centers). 7-day response window.

### Floating IPs
- Public IPv4 allocated to the account; associate/disassociate on demand → HA and fault tolerance.
- Default limit 3 per account; ₦1,500/month when reserved but unassigned; one Floating IP can map
  to multiple FCS instances; no PTR/rDNS; not for Kubernetes worker nodes.

### VPN (Site-to-Site)
- NAT-Traversal support; customizable tunnels (inside IPs, pre-shared keys, BGP ASN); multiple
  tunnels + ECMP for bandwidth/resiliency.
- Encryption AES128/AES256, DH groups with PFS, SHA1/SHA2.
- pfSense guidance (IKEv1/v2, policy- and route-based). pfSense image: QCOW2, 2.94 GB, min 30 GB
  disk / 2048 MB RAM. Required ports: UDP 500, UDP 4500, ESP(50), AH(51), SSH 22, HTTP/HTTPS.
- Priced as standard FCS instance hours + storage.

### Cloud Router
- **BGP dynamic route exchange** between the virtual cloud and peer networks (on-prem, multicloud,
  other VPCs); auto subnet discovery/announcement; static routes (next hop must be on a connected subnet).

### Cloud Trunks
- Multiple networks on a **single vNIC** via parent port + subports (VLAN segmentation IDs);
  attach networks without disruption. Instances can't launch directly on subports; reuse parent
  MAC on subports (OVS ARP-spoofing guard).

### Cloud Firewalls
- Tenant-managed firewalls built from **policies = ordered rule collections** (first match wins).
- Rules: source/dest IP, IPv4/IPv6, protocol (TCP/UDP/ICMP/Any), action (Allow/Deny/Reject).
- Shared policies for audit workflows; `audited` flag resets on rule changes.

### Security Groups
- IP filter rule sets applied to instance network interfaces (in/out).
- Rules: protocol (TCP/UDP/ICMP), port or range, source CIDR or another security group.
- Changes propagate automatically to all attached instances. E.g. web server: TCP 80 + 443 from 0.0.0.0/0.

### Load Balancing
- HAProxy on pfSense: front ends → ACLs map hostnames → back-end target groups; stats dashboard
  (port 2200). Multi-domain routing use case.

### DNS & Domains
- Free DNS management for Nobus and non-Nobus resources (no domain registration - point registrar
  NS to ns1.nobus.com / ns2.nobus.com).
- Records: A, AAAA, CNAME, MX, TXT, PTR, NS. Console: Project > DNS.

---

## Security Services

### Sophos XG Firewall
- Synchronized Security (endpoint-aware auto response), ML/AI advanced threat protection, central
  management, user awareness, dual AV, web/app control, email protection, cloud sandboxing.
- Min: 2 vCPU, 4 GB vRAM, 2 vNIC; Disk I 30 GB + Disk II 80 GB; MTU 1458.
- Deploy: create two root volumes from Nobus images → provision instance → attach aux volume →
  hard reboot → GUI activation. Size vCPU/vRAM to the purchased license.

### FortiGate NGFW
- NGFW: IPS, application control, deep packet inspection; UTM (AV, web filtering, VPN);
  Secure SD-WAN; FortiGuard threat intelligence; central multi-device management.
- Use cases: enterprise protection, remote-worker VPN, compliance (GDPR, PCI-DSS, ISO 27001),
  branch security. Deploy image `Security-Fortigate-FortiOS`.

### Acronis Cyber Protect
- Integrated backup + cyber protection (see NCB). Min 100 GB disk, 8192 MB RAM.
  Deploy image `acronis-cyberprotect`.

### Platform security (shared responsibility)
- Nobus side: physical DC security, encryption, MFA, RBAC, IDS/IPS, SIEM, incident response,
  GDPR / ISO 27001 / PCI DSS.
- Customer side: data encryption, password policy, MFA enforcement, activity monitoring.

---

## Containers & Orchestration

### Cloud Containers
- Portable, isolated, scalable app+dependency units. Use cases: microservices, CI/CD, hybrid
  cloud, dev/test, app modernization, serverless functions, data processing, security isolation.

### Nobus Kubernetes Service
- Managed K8s: cluster provisioning, network/storage/security config, monitoring & logging,
  autoscaling, self-healing, declarative config. Manual "hard way" setup assistance available.

### Nobus Kafka Service
- Managed distributed event streaming: high throughput, horizontal scaling (brokers), disk
  persistence, replication/fault tolerance, real-time processing.
- Concepts: producers/consumers, topics/partitions, brokers, consumer groups, offsets.
- Use cases: real-time analytics, data integration, log aggregation, event sourcing.

---

## Database Services
- Managed engines with autoscaling, HA (automatic failover + replication), pay-as-you-use,
  encryption/access control/auditing. VCPU unit price ₦85.00 (FCS-based).
- **MSSQL** - T-SQL, BI tools, Express→Enterprise editions, .NET/Windows ecosystem. Mission-critical enterprise.
- **MySQL** - open-source relational, multiple storage engines, replication/sharding/clustering. Web apps (PHP/Python/Ruby).
- **PostgreSQL** - object-relational, ACID, rich extensions (geospatial, full-text, ML). BI, scientific, geospatial.
- **MongoDB** - document NoSQL, dynamic schemas, sharding/replication, rich indexing. CMS, mobile, real-time analytics, IoT.

---

## Billing & Pricing (Naira)

### Billing model
- **Pre-Billing System**: Cycle Billing (pay for resources in use at cycle start; charges start at
  `running`, stop at shutdown/termination) + **Auto-Billing** (saved card charged 3 days before
  cycle if wallet insufficient). No upfront commitments.
- Billable instance states: `running`, `paused`. Not billed: build, powering-off, shutting-down, deleted.

### Key price points
| Item | Price (₦ NGN) |
|---|---|
| FCS entry instance | from 9,309.00 /month |
| FCS vCPU unit | 93.50 /unit |
| FCS memory unit | 96.80 /unit |
| Database service vCPU unit | 85.00 /unit |
| FBS provisioned storage | 120 /GB-month |
| FBS provisioned IOPS | 120 /IOPS-month |
| FBS snapshots (in FOS) | 120 /GB-month |
| FOS Standard storage (all tiers to 500 TB+) | 60.00 /GB |
| FOS transfer in | 0.00 /GB |
| FOS transfer out (≤1 GB/mo) | 2.00 /GB |
| FOS requests (PUT/COPY/POST/LIST or GET/SELECT) | 2.00 /1,000 requests (DELETE free) |
| Internet bandwidth | 6,000.00 /GB-month |
| Floating IP (reserved, unassigned) | 1,500 /month |
| Cloud Backup | contact sales |

- Snapshots billed on actual consumed data (occupied blocks), not full volume size.
- **Nobus Pricing Calculator**: https://nobus.io/nobus-pricing-calculator
- Customer console: https://dashboard.nobus.io/

### Sales angles
- **Naira-native billing** - no FX exposure vs AWS/Azure/GCP dollar billing.
- Pay-as-you-use, no upfront commitment; free DaaS, free DNS, no autoscaling surcharge.
- Local support, local data residency, PCI DSS / ISO 27001 / GDPR posture.
