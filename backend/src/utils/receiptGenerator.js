const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class ReceiptGenerator {
  constructor() {
    this.fonts = {
      regular: 'Helvetica',
      bold: 'Helvetica-Bold',
    };
  }

  // Generate payment receipt PDF
  async generatePaymentReceipt(receiptData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Payment Receipt - ${receiptData.receiptNumber}`,
            Author: 'Student Portal',
            Subject: 'Payment Receipt',
          }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        this.drawReceiptHeader(doc, receiptData);
        this.drawReceiptBody(doc, receiptData);
        this.drawReceiptFooter(doc, receiptData);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Draw receipt header
  drawReceiptHeader(doc, data) {
    // Institution header
    doc.fontSize(20).font(this.fonts.bold)
       .text('STUDENT PORTAL', 0, 50, { align: 'center' });

    doc.fontSize(14).font(this.fonts.regular)
       .text('Payment Receipt', 0, 80, { align: 'center' });

    doc.moveDown(2);

    // Receipt details
    doc.fontSize(12).font(this.fonts.regular);
    doc.text(`Receipt Number: ${data.receiptNumber}`, 50, 120);
    doc.text(`Date: ${new Date(data.payment.paymentDate).toLocaleDateString()}`, 350, 120);
    doc.text(`Time: ${new Date(data.payment.paymentDate).toLocaleTimeString()}`, 350, 135);

    // Draw line
    doc.moveTo(50, 160).lineTo(550, 160).stroke();
  }

  // Draw receipt body
  drawReceiptBody(doc, data) {
    let yPosition = 180;

    // Student information
    doc.fontSize(14).font(this.fonts.bold).text('Student Information', 50, yPosition);
    yPosition += 25;

    doc.fontSize(11).font(this.fonts.regular);
    doc.text(`Name: ${data.student.name}`, 50, yPosition);
    doc.text(`Student ID: ${data.student.studentId}`, 350, yPosition);
    yPosition += 20;

    if (data.student.email) {
      doc.text(`Email: ${data.student.email}`, 50, yPosition);
      yPosition += 20;
    }

    if (data.student.department) {
      doc.text(`Department: ${data.student.department}`, 50, yPosition);
      yPosition += 20;
    }

    yPosition += 10;

    // Fee information
    doc.fontSize(14).font(this.fonts.bold).text('Fee Details', 50, yPosition);
    yPosition += 25;

    doc.fontSize(11).font(this.fonts.regular);
    doc.text(`Fee Type: ${data.fee.type}`, 50, yPosition);
    doc.text(`Description: ${data.fee.description}`, 350, yPosition);
    yPosition += 20;

    doc.text(`Due Date: ${new Date(data.fee.dueDate).toLocaleDateString()}`, 50, yPosition);
    yPosition += 20;

    // Payment information
    yPosition += 10;
    doc.fontSize(14).font(this.fonts.bold).text('Payment Information', 50, yPosition);
    yPosition += 25;

    doc.fontSize(11).font(this.fonts.regular);
    doc.text(`Payment Method: ${data.payment.method}`, 50, yPosition);
    doc.text(`Transaction ID: ${data.payment.transactionId}`, 350, yPosition);
    yPosition += 20;

    if (data.payment.gatewayTransactionId) {
      doc.text(`Gateway Transaction ID: ${data.payment.gatewayTransactionId}`, 50, yPosition);
      yPosition += 20;
    }

    doc.text(`Payment Date: ${new Date(data.payment.paidAt).toLocaleDateString()}`, 50, yPosition);
    doc.text(`Currency: ${data.payment.currency}`, 350, yPosition);
    yPosition += 20;

    doc.text(`Status: ${data.payment.status}`, 50, yPosition);
    yPosition += 30;

    // Amount section
    doc.fontSize(16).font(this.fonts.bold);
    doc.text(`Amount Paid: ${data.payment.currency} ${data.payment.amount.toLocaleString()}`, 50, yPosition, { align: 'center' });

    // Draw amount box
    doc.rect(200, yPosition - 10, 200, 30).stroke();
  }

  // Draw receipt footer
  drawReceiptFooter(doc, data) {
    const pageHeight = doc.page.height;
    let yPosition = pageHeight - 150;

    // Draw line
    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 20;

    // Footer text
    doc.fontSize(10).font(this.fonts.regular);
    doc.text('This is a computer-generated receipt and does not require a signature.', 50, yPosition, { align: 'center' });
    yPosition += 15;

    doc.text('For any queries, please contact the administration office.', 50, yPosition, { align: 'center' });
    yPosition += 15;

    doc.text(`Generated on: ${new Date().toLocaleString()}`, 50, yPosition, { align: 'center' });

    // Institution stamp area
    yPosition += 30;
    doc.fontSize(8).font(this.fonts.regular);
    doc.text('Authorized Signature', 450, yPosition);
    doc.moveTo(430, yPosition + 15).lineTo(520, yPosition + 15).stroke();
  }

  // Generate fee statement PDF
  async generateFeeStatement(studentData, feesData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margin: 50,
          info: {
            Title: `Fee Statement - ${studentData.name}`,
            Author: 'Student Portal',
            Subject: 'Fee Statement',
          }
        });

        const buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
          const pdfData = Buffer.concat(buffers);
          resolve(pdfData);
        });

        this.drawStatementHeader(doc, studentData);
        this.drawStatementBody(doc, feesData);
        this.drawStatementSummary(doc, feesData);

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  // Draw statement header
  drawStatementHeader(doc, studentData) {
    doc.fontSize(20).font(this.fonts.bold)
       .text('STUDENT PORTAL', 0, 50, { align: 'center' });

    doc.fontSize(14).font(this.fonts.regular)
       .text('Fee Statement', 0, 80, { align: 'center' });

    doc.moveDown(2);

    doc.fontSize(12).font(this.fonts.regular);
    doc.text(`Generated Date: ${new Date().toLocaleDateString()}`, 50, 120);

    doc.moveDown();

    // Student info
    doc.fontSize(14).font(this.fonts.bold).text('Student Information', 50, 150);
    doc.moveDown();

    doc.fontSize(11).font(this.fonts.regular);
    doc.text(`Name: ${studentData.name}`, 50);
    doc.text(`Student ID: ${studentData.studentId}`, 350);
    doc.moveDown(0.5);
    doc.text(`Email: ${studentData.email}`, 50);
    if (studentData.department) {
      doc.text(`Department: ${studentData.department}`, 350);
    }

    doc.moveTo(50, 220).lineTo(550, 220).stroke();
  }

  // Draw statement body
  drawStatementBody(doc, feesData) {
    let yPosition = 240;

    doc.fontSize(14).font(this.fonts.bold).text('Fee Details', 50, yPosition);
    yPosition += 25;

    // Table headers
    doc.fontSize(10).font(this.fonts.bold);
    doc.text('Fee Type', 50, yPosition);
    doc.text('Description', 150, yPosition);
    doc.text('Amount', 350, yPosition);
    doc.text('Paid', 420, yPosition);
    doc.text('Balance', 480, yPosition);
    doc.text('Status', 50, yPosition + 15);

    yPosition += 25;

    // Draw table lines
    doc.moveTo(50, yPosition - 5).lineTo(550, yPosition - 5).stroke();

    doc.fontSize(9).font(this.fonts.regular);

    feesData.fees.forEach(fee => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }

      doc.text(fee.feeType || 'N/A', 50, yPosition);
      doc.text((fee.description || '').substring(0, 25), 150, yPosition);
      doc.text(`₹${(fee.amount || 0).toLocaleString()}`, 350, yPosition);
      doc.text(`₹${(fee.paidAmount || 0).toLocaleString()}`, 420, yPosition);
      doc.text(`₹${((fee.amount || 0) - (fee.paidAmount || 0)).toLocaleString()}`, 480, yPosition);

      // Status with color
      const status = fee.status || 'pending';
      doc.text(status.charAt(0).toUpperCase() + status.slice(1), 50, yPosition + 12);

      yPosition += 25;
    });
  }

  // Draw statement summary
  drawStatementSummary(doc, feesData) {
    const pageHeight = doc.page.height;
    let yPosition = pageHeight - 120;

    doc.moveTo(50, yPosition).lineTo(550, yPosition).stroke();
    yPosition += 20;

    doc.fontSize(12).font(this.fonts.bold);
    doc.text('Summary', 50, yPosition);
    yPosition += 20;

    doc.fontSize(10).font(this.fonts.regular);
    doc.text(`Total Fees: ₹${feesData.totalAmount.toLocaleString()}`, 50, yPosition);
    doc.text(`Total Paid: ₹${feesData.totalPaid.toLocaleString()}`, 250, yPosition);
    doc.text(`Outstanding: ₹${feesData.outstandingAmount.toLocaleString()}`, 400, yPosition);

    yPosition += 20;
    doc.fontSize(8).font(this.fonts.regular);
    doc.text('This statement is generated for your records. Please keep it safe.', 50, yPosition, { align: 'center' });
  }

  // Save PDF to file (for debugging)
  async saveToFile(pdfBuffer, filename) {
    const filePath = path.join(__dirname, '../../receipts', filename);
    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, pdfBuffer);
    return filePath;
  }
}

module.exports = new ReceiptGenerator();