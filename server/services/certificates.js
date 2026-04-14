import PDFDocument from 'pdfkit';

// Generate a professional PDF certificate
export function generateCertificate({ userName, courseName, completionDate, partnerId, badgeName, orgName }) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ layout: 'landscape', size: 'A4', margin: 0 });
    const buffers = [];
    doc.on('data', (chunk) => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', reject);

    const width = doc.page.width;
    const height = doc.page.height;

    // Background
    doc.rect(0, 0, width, height).fill('#f0fdfa');

    // Border
    doc.rect(30, 30, width - 60, height - 60).lineWidth(3).stroke('#0f766e');
    doc.rect(40, 40, width - 80, height - 80).lineWidth(1).stroke('#99f6e4');

    // Header accent bar
    doc.rect(40, 40, width - 80, 8).fill('#0f766e');

    // Logo/Title area
    doc.fontSize(14).fillColor('#0f766e').font('Helvetica-Bold')
      .text('NOBUS CLOUD', 0, 80, { align: 'center' });

    doc.fontSize(10).fillColor('#64748b').font('Helvetica')
      .text('Partner Learning Management System', 0, 100, { align: 'center' });

    // Main title
    doc.fontSize(36).fillColor('#0f766e').font('Helvetica-Bold')
      .text('Certificate of Completion', 0, 140, { align: 'center' });

    // Decorative line
    doc.moveTo(width / 2 - 120, 190).lineTo(width / 2 + 120, 190).lineWidth(2).stroke('#0d9488');

    // "This certifies that"
    doc.fontSize(14).fillColor('#64748b').font('Helvetica')
      .text('This is to certify that', 0, 210, { align: 'center' });

    // Recipient name
    doc.fontSize(30).fillColor('#1e293b').font('Helvetica-Bold')
      .text(userName, 0, 238, { align: 'center' });

    // Organization
    if (orgName) {
      doc.fontSize(12).fillColor('#64748b').font('Helvetica')
        .text(`of ${orgName}`, 0, 278, { align: 'center' });
    }

    // Course description
    doc.fontSize(14).fillColor('#475569').font('Helvetica')
      .text('has successfully completed the', 0, 308, { align: 'center' });

    doc.fontSize(22).fillColor('#0f766e').font('Helvetica-Bold')
      .text(courseName, 0, 332, { align: 'center' });

    // Badge/Certification
    if (badgeName) {
      doc.fontSize(14).fillColor('#0d9488').font('Helvetica-Bold')
        .text(`Certification: ${badgeName}`, 0, 368, { align: 'center' });
    }

    // Date and ID
    const formattedDate = new Date(completionDate).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });

    doc.fontSize(11).fillColor('#64748b').font('Helvetica')
      .text(`Completion Date: ${formattedDate}`, 0, 400, { align: 'center' });

    if (partnerId) {
      doc.fontSize(10).fillColor('#94a3b8').font('Helvetica')
        .text(`Partner ID: ${partnerId}`, 0, 420, { align: 'center' });
    }

    // Signature lines
    const sigY = 470;
    // Left signature
    doc.moveTo(140, sigY).lineTo(340, sigY).lineWidth(1).stroke('#cbd5e1');
    doc.fontSize(10).fillColor('#64748b').font('Helvetica')
      .text('Program Director', 140, sigY + 5, { width: 200, align: 'center' });
    doc.fontSize(11).fillColor('#1e293b').font('Helvetica-Bold')
      .text('Nobus Cloud', 140, sigY - 18, { width: 200, align: 'center' });

    // Right signature
    doc.moveTo(width - 340, sigY).lineTo(width - 140, sigY).lineWidth(1).stroke('#cbd5e1');
    doc.fontSize(10).fillColor('#64748b').font('Helvetica')
      .text('Learning & Enablement', width - 340, sigY + 5, { width: 200, align: 'center' });
    doc.fontSize(11).fillColor('#1e293b').font('Helvetica-Bold')
      .text('Partner Program', width - 340, sigY - 18, { width: 200, align: 'center' });

    // Certificate ID footer
    const certId = `CERT-${Date.now().toString(36).toUpperCase()}`;
    doc.fontSize(8).fillColor('#94a3b8').font('Helvetica')
      .text(`Certificate ID: ${certId} | Verify at nobus.cloud/verify`, 0, height - 60, { align: 'center' });

    doc.end();
  });
}
