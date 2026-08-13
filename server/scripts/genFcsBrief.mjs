// Generates the branded "FCS Compute Solution Brief" 2-page PDF into
// public/marketing/fcs-compute-solution-brief.pdf. Re-run after editing:
//   cd server && node scripts/genFcsBrief.mjs
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', '..', 'public');
const LOGO = path.join(PUBLIC, 'nobus-logo.png');
const OUT_DIR = path.join(PUBLIC, 'marketing');
const OUT = path.join(OUT_DIR, 'fcs-compute-solution-brief.pdf');
fs.mkdirSync(OUT_DIR, { recursive: true });

const NAVY = '#0a1229';
const BLUE = '#2e6bff';
const GREY = '#475569';
const LIGHT = '#eef4ff';

const doc = new PDFDocument({ size: 'A4', margin: 44 });
doc.pipe(fs.createWriteStream(OUT));

const left = doc.page.margins.left;
const right = doc.page.width - doc.page.margins.right;
const width = right - left;

function headerBand(title, sub) {
  doc.rect(0, 0, doc.page.width, 92).fill(NAVY);
  if (fs.existsSync(LOGO)) doc.image(LOGO, left, 24, { height: 30 });
  doc.fillColor('white').font('Helvetica-Bold').fontSize(19).text(title, left, 60);
  doc.fillColor('#9db7ff').font('Helvetica').fontSize(10).text(sub, left, 60, { width, align: 'right' });
}

function heading(y, text) {
  doc.rect(left, y, 4, 15).fill(BLUE);
  doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(13).text(text, left + 12, y);
  return doc.y + 6;
}

function bullets(y, items) {
  doc.font('Helvetica').fontSize(9.5).fillColor(GREY)
    .list(items, left + 4, y, { bulletRadius: 1.6, textIndent: 12, bulletIndent: 2, lineGap: 2.5, paragraphGap: 4 });
  return doc.y;
}

function para(y, text) {
  doc.font('Helvetica').fontSize(9.5).fillColor(GREY).text(text, left, y, { width, lineGap: 2 });
  return doc.y;
}

// Simple 2-column table (label | value)
function table(y, rows, c1Head, c2Head) {
  const rowH = 17; const c2 = left + 190;
  doc.rect(left, y, width, rowH).fill(BLUE);
  doc.fillColor('white').font('Helvetica-Bold').fontSize(8.5);
  doc.text(c1Head, left + 8, y + 5); doc.text(c2Head, c2 + 8, y + 5);
  y += rowH;
  doc.font('Helvetica').fontSize(9).fillColor('#1e293b');
  rows.forEach((r, i) => {
    if (i % 2) { doc.rect(left, y, width, rowH).fill(LIGHT); }
    doc.fillColor('#1e293b').font('Helvetica-Bold').text(r[0], left + 8, y + 5, { width: c2 - left - 12 });
    doc.font('Helvetica').fillColor(GREY).text(r[1], c2 + 8, y + 5, { width: right - c2 - 12 });
    y += rowH;
  });
  return y + 6;
}

function footer() {
  // Keep the footer inside the bottom margin - text drawn past it forces a new page.
  const fy = doc.page.height - doc.page.margins.bottom - 18;
  doc.moveTo(left, fy).lineTo(right, fy).strokeColor('#e2e8f0').lineWidth(0.7).stroke();
  doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5)
    .text('Nobus Cloud Services (Nkponani Limited) · nobus.io · Partner use - indicative; confirm final specs and pricing at order.', left, fy + 6, { width, align: 'center', lineBreak: false });
}

// ============================ PAGE 1 ============================
headerBand('FCS - Flexible Compute Service', 'Solution Brief');
let y = 108;

y = para(y, 'Flexible Compute Service (FCS) is Nobus Cloud\'s on-demand virtual server platform: launch production-grade Linux or Windows instances in minutes, resize as workloads change, and pay only for what you use - billed in local currency with zero egress fees, from Tier III-certified data centres in West and East Africa.') + 12;

y = heading(y, 'Instance types');
y = para(y, 'Choose the shape for your workload, then the size. FCS offers four instance types:') + 4;
y = table(y, [
  ['Standard', 'Balanced vCPU-to-memory - general web / app workloads'],
  ['Compute Optimized', 'More vCPU per GiB - batch, media transcoding, HPC'],
  ['Memory Optimized', 'More memory per vCPU - databases, analytics, caches'],
  ['GPU Optimized', 'GPU-accelerated - AI / ML, rendering, scientific compute'],
], 'Type', 'Best for');
y += 6;
y = para(y, 'Each type spans a wide range of sizes - 1 to 8+ vCPU and 2 to 64+ GiB, plus GPU. Example sizes include si.2.4 (2 vCPU / 4 GiB), si.4.8 (4 / 8), si.8.16 (8 / 16) and si.8.64 (8 / 64). These are examples only; larger CPU, memory and GPU configurations are available on request - confirm exact flavours in the Quote Builder.') + 6;
y = bullets(y, [
  'OS images: Ubuntu 24.04 / 22.04 LTS, Debian 12, Rocky Linux 9, AlmaLinux 9; Windows Server 2022 and 2025.',
  'AES-256 FBS block storage with snapshots and FOS object storage attach to any instance; resize vCPU / RAM / disk without rebuilding.',
]) + 14;

y = heading(y, 'Autoscaling & load balancing');
y = para(y, 'Handle traffic spikes without over-provisioning. Auto Scaling adds or removes FCS instances automatically against demand, while the managed Load Balancer spreads traffic across healthy instances for resilience and zero-downtime deploys - ideal for e-commerce peaks, campaigns and fintech transaction surges.');
footer();

// ============================ PAGE 2 ============================
doc.addPage();
headerBand('FCS - Flexible Compute Service', 'Solution Brief · 2');
y = 108;

y = heading(y, 'Dedicated Hosting');
y = para(y, 'When a workload needs single-tenant isolation - for strict compliance, licensing or performance - Dedicated Hosting reserves dedicated physical servers for one customer: the control of bare metal with the operational simplicity of the Nobus platform.') + 4;
y = bullets(y, [
  'Single-tenant physical servers - no noisy neighbours.',
  'Ideal for regulated workloads and predictable, license-bound estates, managed from one console.',
]) + 14;

y = heading(y, 'BYOL - Bring Your Own License');
y = para(y, 'Already own Microsoft or Oracle licences? Bring them to Nobus on Dedicated Hosts and avoid paying twice - re-use existing entitlements (Windows Server, SQL Server, Oracle Database) on dedicated capacity while you migrate to in-region cloud.') + 4;
y = bullets(y, [
  'Re-use existing Microsoft / Oracle licences on Dedicated Hosts, or choose Nobus managed Windows licensing per instance.',
  'Right-license each workload for the lowest total cost.',
]) + 14;

y = heading(y, 'Why FCS');
y = bullets(y, [
  'Fast - production instances in minutes, not weeks.',
  'In-region - Tier III zones in Lagos (Ikeja, Lekki) and Nairobi (ADC), 99.982% uptime guarantee.',
  'Predictable - pay-as-you-use, billed in local currency, zero egress fees.',
  'Secure & compliant - AES-256 encryption, security groups and next-generation cloud firewalls; ISO 27001 & PCI DSS certified, NDPA/ODPC aligned.',
  'Open - built on OpenStack; Terraform, OpenStack CLI and REST APIs work as your engineers expect.',
]) + 16;

// CTA strip
doc.rect(left, y, width, 44).fill(LIGHT);
doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11).text('Ready to size a workload?', left + 16, y + 9);
doc.fillColor(GREY).font('Helvetica').fontSize(9).text('Build a customer-ready quote in the PartnerCentral Quote Builder, or talk to your Nobus partner team.', left + 16, y + 24, { width: width - 32 });
footer();

doc.end();
console.log('Wrote', OUT);
