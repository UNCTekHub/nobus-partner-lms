// Generates the branded partner battle cards into public/marketing/:
//   - aws-azure-vs-nobus-battle-card.pdf
//   - security-stack-battle-card.pdf
// Content flows continuously across pages (no forced blank gaps). Re-run after
// editing:  cd server && node scripts/genBattleCards.mjs
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC = path.join(__dirname, '..', '..', 'public');
const LOGO = path.join(PUBLIC, 'nobus-logo.png');
const OUT_DIR = path.join(PUBLIC, 'marketing');
fs.mkdirSync(OUT_DIR, { recursive: true });

const NAVY = '#0a1229';
const BLUE = '#2e6bff';
const GREY = '#475569';
const LIGHT = '#eef4ff';

// Build one branded document. `body(h)` receives the flow helpers.
function build(outFile, title, subtitle, body) {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 44, bufferPages: true });
    const out = path.join(OUT_DIR, outFile);
    const stream = fs.createWriteStream(out);
    doc.pipe(stream);

    const left = doc.page.margins.left;
    const right = doc.page.width - doc.page.margins.right;
    const width = right - left;
    const bottom = doc.page.height - doc.page.margins.bottom;

    const h = {
      left, right, width, bottom,
      heading(text) {
        if (doc.y + 40 > bottom) doc.addPage();
        const y0 = doc.y;
        doc.rect(left, y0, 4, 15).fill(BLUE);
        doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(13).text(text, left + 12, y0);
        doc.moveDown(0.4);
      },
      para(text) {
        doc.font('Helvetica').fontSize(9.5).fillColor(GREY).text(text, left, doc.y, { width, lineGap: 2 });
        doc.moveDown(0.55);
      },
      bullets(items) {
        doc.font('Helvetica').fontSize(9.3).fillColor(GREY)
          .list(items, left + 4, doc.y, { bulletRadius: 1.6, textIndent: 12, bulletIndent: 2, lineGap: 2.2, paragraphGap: 4.5 });
        doc.moveDown(0.6);
      },
      // Variable-height table. widths must sum to `width`.
      table(headers, rows, widths) {
        const pad = 6;
        const xs = []; let cx = left;
        for (const w of widths) { xs.push(cx); cx += w; }
        const drawHeader = () => {
          const hh = 18;
          doc.rect(left, doc.y, width, hh).fill(BLUE);
          doc.fillColor('white').font('Helvetica-Bold').fontSize(8.5);
          headers.forEach((t, i) => doc.text(t, xs[i] + pad, doc.y + 5, { width: widths[i] - 2 * pad }));
          doc.y += hh;
        };
        drawHeader();
        rows.forEach((r, ri) => {
          let rowH = 0;
          r.forEach((cell, i) => {
            doc.font(i === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.7);
            const ch = doc.heightOfString(cell, { width: widths[i] - 2 * pad, lineGap: 1 });
            if (ch > rowH) rowH = ch;
          });
          rowH += 9;
          if (doc.y + rowH > bottom) { doc.addPage(); drawHeader(); }
          const y = doc.y;
          if (ri % 2) doc.rect(left, y, width, rowH).fill(LIGHT);
          r.forEach((cell, i) => {
            doc.font(i === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(8.7)
              .fillColor(i === 0 ? '#1e293b' : GREY)
              .text(cell, xs[i] + pad, y + 5, { width: widths[i] - 2 * pad, lineGap: 1 });
          });
          doc.x = left; doc.y = y + rowH;
        });
        doc.x = left; doc.moveDown(0.5);
      },
      cta(headline, sub) {
        if (doc.y + 50 > bottom) doc.addPage();
        const y = doc.y;
        doc.rect(left, y, width, 44).fill(LIGHT);
        doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(11).text(headline, left + 16, y + 9);
        doc.fillColor(GREY).font('Helvetica').fontSize(9).text(sub, left + 16, y + 24, { width: width - 32 });
        doc.x = left; doc.y = y + 52;
      },
    };

    // header (page 1 only)
    doc.rect(0, 0, doc.page.width, 92).fill(NAVY);
    if (fs.existsSync(LOGO)) doc.image(LOGO, left, 24, { height: 30 });
    doc.fillColor('white').font('Helvetica-Bold').fontSize(19).text(title, left, 58, { width: width * 0.7 });
    doc.fillColor('#9db7ff').font('Helvetica').fontSize(10).text(subtitle, left, 58, { width, align: 'right' });
    doc.x = left; doc.y = 108;

    body(h);

    // footers on every page
    const range = doc.bufferedPageRange();
    for (let i = 0; i < range.count; i++) {
      doc.switchToPage(range.start + i);
      const fy = bottom - 18;
      doc.moveTo(left, fy).lineTo(right, fy).strokeColor('#e2e8f0').lineWidth(0.7).stroke();
      doc.fillColor('#94a3b8').font('Helvetica').fontSize(7.5)
        .text('Nobus Cloud Services (Nkponani Limited) · nobus.io · Partner battle card - internal enablement; confirm specifics with your Nobus team.', left, fy + 6, { width, align: 'center', lineBreak: false });
    }
    doc.flushPages();
    doc.end();
    stream.on('finish', () => { console.log('Wrote', out); resolve(); });
  });
}

// ---------------------------------------------------------------------------
// Battle card 1: AWS / Azure vs Nobus
// ---------------------------------------------------------------------------
function awsAzure(h) {
  h.para('Use this when a prospect is on - or defaulting to - a foreign hyperscaler. Do not attack AWS or Azure on engineering; you win on the economics and the reality of running Nigerian workloads. You budget and pay in Naira, you never pay to get your own data out, your data stays in-country under the NDPA, and support is local. Lead with those four.');

  h.heading('Head to head');
  h.table(
    ['Dimension', 'AWS / Azure', 'Nobus'],
    [
      ['Billing currency', 'US dollars - your bill moves with the FX rate', 'Naira - the price you agree is the price you pay'],
      ['Egress / data-out', 'Charged per GB; grows as you serve more traffic', 'Zero egress fees - serving data costs nothing extra'],
      ['Data residency', 'Nearest region is often outside Nigeria (eu-west, South Africa)', 'In-country, Tier III Lagos & Nairobi - NDPA-aligned by design'],
      ['Support', 'Global tiers, premium paid, largely offshore hours', 'Local team on WAT, direct partner escalation, a human on the line'],
      ['Latency to NG users', '100 ms+ to Europe / US regions', 'Single-digit millisecond, in-region'],
      ['Pricing model', 'Complex, thousands of SKUs, hard to forecast', 'Transparent Naira unit pricing, pay-as-you-use'],
    ],
    [110, 198, 199]
  );

  h.heading('The four messages that win');
  h.bullets([
    'Budget in Naira, pay in Naira. A dollar bill can swing 20-30% on FX alone; Nobus removes that risk entirely - the quote is the invoice.',
    'Zero egress fees. Hyperscalers meter every GB leaving their cloud, so media, backups and APIs make the bill balloon. On Nobus, data-out is free.',
    'Your data stays in Nigeria. Tier III in-country hosting makes NDPA data-residency straightforward instead of a cross-border legal negotiation.',
    'Local support that answers. In-region engineers on your timezone, reachable through your Nobus partner - not a ticket queue eight hours away.',
  ]);

  h.heading('Objection handling');
  h.bullets([
    '"AWS has more services / is more mature." True - and most enterprises use a fraction of them. For the core estate (compute, storage, Kubernetes, Kafka, four database engines, firewalls, DNS) Nobus is complete; name the workaround for anything niche, never bluff.',
    '"Is a local cloud as reliable?" Nobus runs on OpenStack in Tier III certified facilities with a 99.982% uptime guarantee, redundant power, cooling and network - the standard banks and telcos already trust.',
    '"We are standardized on AWS tooling." Terraform, REST APIs and the OpenStack CLI work as your engineers expect - migration is a re-point, not a re-skill.',
  ]);

  h.heading('Be honest - and use it to build trust');
  h.bullets([
    'If an architecture truly needs a niche managed service Nobus lacks, say so. Candour wins the next deal.',
    'It is not either/or: Nobus Cloud Backup even protects workloads that stay on AWS or Azure, so hybrid is a first step, not a betrayal.',
  ]);

  h.cta('Turn positioning into a number', 'Build a side-by-side Naira quote in the PartnerCentral Quote Builder, or model the savings in the Nobus Pricing Calculator.');
}

// ---------------------------------------------------------------------------
// Battle card 2: Nobus Security Stack
// ---------------------------------------------------------------------------
function securityStack(h) {
  h.para('Security attaches to every infrastructure deal - and it protects your margin. Nobus instances ship with security groups and a cloud-native firewall as the baseline; this card is how you layer perimeter, visibility and recovery on top with Sophos, Fortinet and Acronis. Rule of thumb: no FCS deal should leave without a firewall and a backup, and every regulated customer needs SIEM.');

  h.heading('The stack at a glance');
  h.table(
    ['Product', 'What it is', 'Lead with it when'],
    [
      ['Sophos XG Firewall', 'Next-gen firewall - IPS, web & app control, VPN and sandboxing in one appliance', 'SMB to mid-market perimeter; teams that want strong protection that is simple to run'],
      ['FortiGate NGFW', 'Fortinet next-gen firewall - high throughput, deep inspection, SD-WAN', 'Larger or regulated estates, high-throughput sites, Fortinet-standardized shops'],
      ['FortiSIEM', 'Security information & event management - log correlation, threat detection, compliance reporting', 'Compliance mandates (PCI DSS, ISO 27001), central visibility, a customer building a SOC'],
      ['Acronis Cyber Protect\n(Nobus Cloud Backup)', 'Backup + anti-ransomware + vulnerability scanning from one console; multi-cloud, including M365 and Google Workspace', 'Data protection, ransomware defence and DR; backing up M365, OneDrive/SharePoint, Google Workspace or other clouds'],
    ],
    [120, 200, 187]
  );

  h.heading('How the layers fit together');
  h.para('Perimeter -> inspection -> visibility -> recovery. Sophos XG or FortiGate guards the edge and segments traffic; FortiSIEM correlates events across the whole estate so nothing hides; Acronis Cyber Protect (Nobus Cloud Backup) is the safety net that gets the customer back online after ransomware or failure. Each layer is a separate line on the quote and a separate reason the customer stays.');

  h.heading('Talk tracks');
  h.bullets([
    'Firewall (Sophos XG / FortiGate): "A security group filters ports; a next-generation firewall inspects what is inside the traffic - intrusions, malware, risky apps. On a regulated workload that is the difference between a checkbox and real protection."',
    'FortiSIEM: "Your auditors will ask who did what, and when. FortiSIEM is the single pane that answers it - correlated logs, real-time alerts and the compliance reports already formatted for PCI DSS and ISO 27001."',
    'Acronis / Nobus Cloud Backup: "Backup is not just the servers. We protect M365 - Exchange, OneDrive, SharePoint - Google Workspace, and workloads on AWS or Azure too, with anti-ransomware built in. One console, one throat to choke."',
  ]);

  h.heading('Compliance & cross-sell');
  h.bullets([
    'PCI DSS is a must for financial-services customers - firewall + SIEM + protected backup is the baseline they cannot pass an audit without.',
    'ISO 27001 and NDPA alignment: in-country hosting plus this stack is a complete, defensible story.',
    'Attach discipline: every FCS deal gets a firewall + backup; every regulated deal adds FortiSIEM. Bigger deal, stickier customer.',
  ]);

  h.heading('Discovery questions');
  h.bullets([
    'What is your current perimeter - and when was its firmware last updated?',
    'If ransomware hit tonight, what is your recovery time - and is M365 / Google Workspace in that plan?',
    'Which compliance regime are you audited against, and who assembles the evidence today?',
  ]);

  h.cta('Build the secured quote', 'Add Sophos XG, FortiGate, FortiSIEM and Nobus Cloud Backup as line items in the PartnerCentral Quote Builder.');
}

await build('aws-azure-vs-nobus-battle-card.pdf', 'AWS / Azure vs Nobus', 'Competitive Battle Card', awsAzure);
await build('security-stack-battle-card.pdf', 'Nobus Security Stack', 'Partner Battle Card', securityStack);
