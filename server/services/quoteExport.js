import PDFDocument from 'pdfkit';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.join(__dirname, '..', '..', 'public', 'nobus-logo.png');

const VAT_RATE = 0.075;
const BLUE = '#2e6bff';
const NAVY = '#0a1229';

// Formal order-form terms printed on every quotation/invoice.
const SERVICE_TERMS = [
  'Operating System Licenses were not included.',
  'All pricing shown in local currency, and is exclusive of any other required levies/taxes such as WHT.',
  'Services are billed 100% in advance for the contract period.',
  'The "Grand Total" represents the value that should be paid and would be loaded on the customer\'s wallet for resource usage; VAT is automatically deducted by the system.',
  'The pricing herein is subject to the Nobus standard terms of use (https://nobus.io/service-terms/) and the Nobus Cloud customer agreement (https://nobus.io/agreement/).',
  'We provide standard security controls for our services. Details can be found at https://nobus.io/documentation/cloud-security.',
  'Minimum contract period for Cloud Services in this Order Form shall be twelve (12) months.',
  'The Service shall be for an initial term of twelve (12) months and may be renewed for successive terms unless the Customer sends written notice of termination at least thirty (30) days prior to the end of the then-current term.',
  'Partner discounts only apply to a minimum of a twelve (12) month contract.',
  'POC ONLY includes compute and storage resources directly under the control of the Nobus platform; and excludes services such as external connectivity (e.g. NFT, Internet), licensed software (e.g. Microsoft, Sophos licenses), and any other services not directly provided by Nobus.',
  'Customer data on Nobus Cloud Services (NCS) is protected by the NCS data protection agreement (https://nobus.io/agreement/dpa/).',
  'Services billing will commence immediately a resource is activated, in accordance with our standard terms and conditions.',
];
const ACCEPTANCE_FIELDS = ['Name', 'Position', 'Signature', 'Date'];

const fmt = (n) => Number(Math.round(n) || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });

// Shared financial math from stored quote fields
export function quoteFinancials(quote) {
  const lines = JSON.parse(quote.lines || '[]');
  const subtotalMonthly = lines.reduce((s, l) => s + (l.monthly || 0), 0);
  const discountableMonthly = lines.reduce((s, l) => s + (l.discountable || 0), 0);
  const discountMonthly = Math.round(discountableMonthly * ((quote.discount_pct || 0) / 100));
  const netMonthly = subtotalMonthly - discountMonthly;
  const netAnnual = netMonthly * 12;
  const vatAnnual = Math.round(netAnnual * VAT_RATE);
  return { lines, subtotalMonthly, discountMonthly, netMonthly, netAnnual, vatAnnual, totalAnnual: netAnnual + vatAnnual };
}

function groupLines(lines) {
  const groups = [];
  for (const line of lines) {
    let g = groups.find((x) => x.name === line.group);
    if (!g) { g = { name: line.group, lines: [] }; groups.push(g); }
    g.lines.push(line);
  }
  return groups;
}

// ============================ PDF ============================

export function streamQuotePdf(quote, res) {
  const fin = quoteFinancials(quote);
  const ref = `NCS-Q-${String(quote.id).padStart(5, '0')}`;
  const doc = new PDFDocument({ size: 'A4', margin: 46 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${ref}.pdf"`);
  doc.pipe(res);

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const width = right - left;

  // Header band with logo
  doc.rect(0, 0, doc.page.width, 86).fill(NAVY);
  if (fs.existsSync(LOGO_PATH)) doc.image(LOGO_PATH, left, 26, { height: 34 });
  doc.fillColor('white').fontSize(16).font('Helvetica-Bold')
    .text('Cloud Services Quotation', left, 32, { width, align: 'right' });
  doc.fontSize(9).font('Helvetica').fillColor('#b9d1ff')
    .text(`Ref: ${ref}  ·  ${new Date((quote.updated_at || '') + 'Z').toLocaleDateString('en-NG') || ''}`, left, 56, { width, align: 'right' });

  let y = 108;
  doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold').text('PREPARED FOR', left, y);
  doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text(quote.customer_name || '-', left, y + 11);
  doc.fillColor('#6b7280').fontSize(8).font('Helvetica-Bold').text('QUOTE', left + width / 2, y);
  doc.fillColor('#111827').fontSize(11).font('Helvetica-Bold').text(quote.title, left + width / 2, y + 11, { width: width / 2 });
  doc.fillColor('#6b7280').fontSize(8).font('Helvetica')
    .text(`Prepared by ${quote.org_name || 'Nobus Cloud Partner'} - Nobus Cloud Services Partner`, left, y + 30);
  y += 52;

  // Table header
  const cols = { item: left, qty: right - 200, unit: right - 145, monthly: right - 72 };
  const rowH = 20;

  const tableHeader = () => {
    doc.rect(left, y, width, rowH).fill(BLUE);
    doc.fillColor('white').fontSize(8.5).font('Helvetica-Bold');
    doc.text('Line Items', cols.item + 6, y + 6);
    doc.text('Qty', cols.qty, y + 6, { width: 40, align: 'right' });
    doc.text('Unit Cost (N)', cols.unit, y + 6, { width: 66, align: 'right' });
    doc.text('Monthly (N)', cols.monthly, y + 6, { width: 66, align: 'right' });
    y += rowH;
  };

  const ensureSpace = (needed) => {
    if (y + needed > doc.page.height - 120) {
      doc.addPage();
      y = doc.page.margins.top;
      tableHeader();
    }
  };

  tableHeader();
  doc.font('Helvetica').fontSize(8.5);

  for (const group of groupLines(fin.lines)) {
    ensureSpace(rowH * 2);
    doc.rect(left, y, width, 16).fill('#eef4ff');
    doc.fillColor(NAVY).font('Helvetica-Bold').fontSize(8.5).text(group.name, cols.item + 6, y + 4);
    y += 16;
    for (const line of group.lines) {
      ensureSpace(rowH + 6);
      doc.fillColor('#111827').font('Helvetica-Bold').fontSize(8.5)
        .text(line.label + (line.config ? ': ' : ''), cols.item + 6, y + 4, { width: cols.qty - cols.item - 16, continued: !!line.config });
      if (line.config) doc.font('Helvetica').fillColor('#4b5563').text(line.config);
      const rowEnd = Math.max(doc.y, y + rowH - 4);
      doc.fillColor('#111827').font('Helvetica');
      doc.text(String(line.qty), cols.qty, y + 4, { width: 40, align: 'right' });
      doc.text(fmt(line.unitCost), cols.unit, y + 4, { width: 66, align: 'right' });
      doc.text(fmt(line.monthly), cols.monthly, y + 4, { width: 66, align: 'right' });
      y = rowEnd + 6;
      doc.moveTo(left, y).lineTo(right, y).strokeColor('#e5e7eb').lineWidth(0.5).stroke();
      y += 2;
    }
  }

  // Totals block
  ensureSpace(120);
  y += 6;
  const totalRow = (label, value, opts = {}) => {
    const h = 18;
    doc.rect(left, y, width, h).fill(opts.strong ? BLUE : '#eef4ff');
    doc.fillColor(opts.strong ? 'white' : NAVY).font('Helvetica-Bold').fontSize(9);
    doc.text(label, cols.item + 6, y + 5, { width: cols.monthly - cols.item - 20, align: 'right' });
    doc.text(value, cols.monthly, y + 5, { width: 66, align: 'right' });
    y += h + 2;
  };

  totalRow('Sub Total Monthly', fmt(fin.subtotalMonthly));
  if (fin.discountMonthly > 0) {
    totalRow('Exclusive Partner Pricing (compute & storage)', `-${fmt(fin.discountMonthly)}`);
    totalRow('Net Monthly', fmt(fin.netMonthly));
  }
  totalRow('Sub Total Annual Cost', fmt(fin.netAnnual));
  totalRow('VAT (7.5%)', fmt(fin.vatAnnual));
  totalRow('Grand Total', fmt(fin.totalAnnual), { strong: true });

  // Notes + terms
  y += 12;
  if (quote.notes) {
    doc.fillColor('#374151').fontSize(8.5).font('Helvetica-Bold').text('Notes', left, y);
    doc.font('Helvetica').text(quote.notes, left, y + 11, { width });
    y = doc.y + 10;
  }
  doc.fillColor('#9ca3af').fontSize(7.5).font('Helvetica').text(
    'All prices in local currency. Local billing with no foreign-exchange exposure. This is an indicative ' +
    'estimate based on published Nobus rates; final pricing is confirmed at order via the Nobus Pricing Calculator ' +
    '(nobus.io/nobus-pricing-calculator). Exclusive partner pricing applies to compute and storage resources only, per ' +
    'the NCS Partner Agreement. Items marked "priced on request" require a Nobus sales quotation. Valid for 30 days.',
    left, y, { width }
  );

  // Formal service terms + commercial acceptance. These flow directly under the
  // totals and paginate naturally; only the heading (so it isn't orphaned) and
  // the signature block (so it never splits) are protected from bad breaks.
  let ty = doc.y + 18;
  if (ty > doc.page.height - 130) { doc.addPage(); ty = doc.page.margins.top; }
  doc.fillColor(NAVY).fontSize(13).font('Helvetica-Bold').text('Service Terms & Conditions', left, ty);
  doc.fillColor('#374151').fontSize(8.5).font('Helvetica')
    .list(SERVICE_TERMS, left, doc.y + 8, { width, bulletRadius: 1.4, textIndent: 12, bulletIndent: 2, lineGap: 2.5, paragraphGap: 5 });

  // Commercial Acceptance - compact two-column signature block, kept together.
  const rowGap = 26;
  const rows = [[ACCEPTANCE_FIELDS[0], ACCEPTANCE_FIELDS[2]], [ACCEPTANCE_FIELDS[1], ACCEPTANCE_FIELDS[3]]]; // Name|Signature, Position|Date
  ty = doc.y + 22;
  const acceptanceHeight = 16 + rows.length * rowGap;
  if (ty + acceptanceHeight > doc.page.height - doc.page.margins.bottom) { doc.addPage(); ty = doc.page.margins.top; }
  doc.fillColor(NAVY).fontSize(13).font('Helvetica-Bold').text('Commercial Acceptance', left, ty);
  ty = doc.y + 12;

  const colGap = 26;
  const colW = (width - colGap) / 2;
  const labelW = 62;
  doc.fontSize(9.5).font('Helvetica').fillColor('#111827');
  for (const [l1, l2] of rows) {
    doc.text(`${l1}:`, left, ty);
    doc.moveTo(left + labelW, ty + 10).lineTo(left + colW, ty + 10).strokeColor('#9ca3af').lineWidth(0.7).stroke();
    const rx = left + colW + colGap;
    doc.text(`${l2}:`, rx, ty);
    doc.moveTo(rx + labelW, ty + 10).lineTo(right, ty + 10).strokeColor('#9ca3af').lineWidth(0.7).stroke();
    ty += rowGap;
  }

  doc.end();
}

// ============================ XLSX ============================

export async function streamQuoteXlsx(quote, res) {
  const fin = quoteFinancials(quote);
  const ref = `NCS-Q-${String(quote.id).padStart(5, '0')}`;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Quotation');
  ws.columns = [
    { width: 4 }, { width: 52 }, { width: 8 }, { width: 16 }, { width: 20 },
  ];

  const blueFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2E6BFF' } };
  const lightFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFEEF4FF' } };
  const white = { color: { argb: 'FFFFFFFF' }, bold: true };
  const border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } };

  // Title rows
  ws.mergeCells('A1:E1');
  ws.getCell('A1').value = `Nobus Cloud Services Quotation - ${quote.title}`;
  ws.getCell('A1').font = { bold: true, size: 14 };
  ws.mergeCells('A2:E2');
  ws.getCell('A2').value = `Ref ${ref} · Prepared for ${quote.customer_name || '-'} · by ${quote.org_name || 'Nobus Partner'} · ${new Date().toLocaleDateString('en-NG')}`;
  ws.getCell('A2').font = { size: 10, color: { argb: 'FF6B7280' } };
  ws.addRow([]);

  // Header row
  const header = ws.addRow(['', 'Line Items', 'Qty', 'Unit Cost (N)', 'Monthly Subscription (N)']);
  header.eachCell((cell, col) => {
    if (col >= 2) { cell.fill = blueFill; cell.font = white; cell.border = border; cell.alignment = { horizontal: col === 2 ? 'left' : 'right' }; }
  });

  let idx = 0;
  for (const group of groupLines(fin.lines)) {
    const gRow = ws.addRow(['', group.name, '', '', '']);
    gRow.getCell(2).font = { bold: true };
    gRow.eachCell({ includeEmpty: false }, (cell) => { cell.fill = lightFill; });
    idx = 0;
    for (const line of group.lines) {
      idx += 1;
      const row = ws.addRow([
        idx,
        `${line.label}${line.config ? ': ' + line.config : ''}`,
        line.qty,
        line.unitCost,
        line.monthly,
      ]);
      row.getCell(4).numFmt = '#,##0.00';
      row.getCell(5).numFmt = '#,##0.00';
      [2, 3, 4, 5].forEach((c) => { row.getCell(c).border = border; });
      row.getCell(3).alignment = { horizontal: 'right' };
    }
    ws.addRow([]);
  }

  const totalRow = (label, value, strong = false) => {
    const row = ws.addRow(['', label, '', '', value]);
    row.getCell(2).alignment = { horizontal: 'right' };
    row.getCell(2).font = strong ? white : { bold: true, color: { argb: 'FF0A1229' } };
    row.getCell(5).font = strong ? white : { bold: true };
    row.getCell(5).numFmt = '#,##0.00';
    [2, 3, 4, 5].forEach((c) => {
      row.getCell(c).fill = strong ? blueFill : lightFill;
      row.getCell(c).border = border;
    });
  };

  totalRow('Sub Total Monthly', fin.subtotalMonthly);
  if (fin.discountMonthly > 0) {
    totalRow('Exclusive Partner Pricing (compute & storage)', -fin.discountMonthly);
    totalRow('Net Monthly', fin.netMonthly);
  }
  totalRow('Sub Total Annual Cost', fin.netAnnual);
  totalRow('VAT (7.5%)', fin.vatAnnual);
  totalRow('Grand Total', fin.totalAnnual, true);

  ws.addRow([]);
  const note = ws.addRow(['', 'All prices in local currency. Indicative estimate per published Nobus rates; exclusive partner pricing applies to compute & storage only per the NCS Partner Agreement. Valid 30 days.']);
  note.getCell(2).font = { size: 8, color: { argb: 'FF9CA3AF' } };

  // Service terms & conditions
  ws.addRow([]);
  const termsHead = ws.addRow(['', 'Service Terms & Conditions']);
  termsHead.getCell(2).font = { bold: true, size: 11, color: { argb: 'FF0A1229' } };
  for (const t of SERVICE_TERMS) {
    const r = ws.addRow(['', '•  ' + t]);
    r.getCell(2).font = { size: 8, color: { argb: 'FF374151' } };
    r.getCell(2).alignment = { wrapText: true, vertical: 'top' };
  }

  // Commercial acceptance
  ws.addRow([]);
  const accHead = ws.addRow(['', 'Commercial Acceptance']);
  accHead.getCell(2).font = { bold: true, size: 11, color: { argb: 'FF0A1229' } };
  for (const f of ACCEPTANCE_FIELDS) {
    const r = ws.addRow(['', `${f}: ______________________________`]);
    r.getCell(2).font = { size: 10 };
  }

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${ref}.xlsx"`);
  await wb.xlsx.write(res);
  res.end();
}
