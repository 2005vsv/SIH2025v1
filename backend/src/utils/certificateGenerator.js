const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class CertificateGenerator {
  constructor() {
    this.templates = {
      degree: this.generateDegreeCertificate.bind(this),
      diploma: this.generateDiplomaCertificate.bind(this),
      course_completion: this.generateCourseCompletionCertificate.bind(this),
      participation: this.generateParticipationCertificate.bind(this),
      achievement: this.generateAchievementCertificate.bind(this),
      transcript: this.generateTranscriptCertificate.bind(this),
    };
  }

  async generateCertificate(certificate, user) {
    const template = this.templates[certificate.type] || this.generateDefaultCertificate;
    return template(certificate, user);
  }

  generateDegreeCertificate(certificate, user) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Certificate border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(3)
         .stroke('#2E86AB');

      // Header
      doc.fontSize(36)
         .font('Helvetica-Bold')
         .fillColor('#2E86AB')
         .text('CERTIFICATE OF DEGREE', 0, 80, { align: 'center' });

      // Institution name
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(certificate.metadata.institution || 'Institution Name', 0, 140, { align: 'center' });

      // Certificate body
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#000000')
         .text('This is to certify that', 0, 200, { align: 'center' });

      // Student name
      doc.fontSize(28)
         .font('Helvetica-Bold')
         .fillColor('#2E86AB')
         .text(user.name, 0, 240, { align: 'center' });

      // Degree details
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`has successfully completed the requirements for the degree of`, 0, 290, { align: 'center' });

      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#2E86AB')
         .text(certificate.title, 0, 320, { align: 'center' });

      // Additional details
      if (certificate.metadata.department) {
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#000000')
           .text(`Department of ${certificate.metadata.department}`, 0, 360, { align: 'center' });
      }

      if (certificate.metadata.cgpa) {
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#000000')
           .text(`with CGPA: ${certificate.metadata.cgpa}`, 0, 380, { align: 'center' });
      }

      // Date
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`Awarded on ${certificate.issueDate.toLocaleDateString('en-IN', {
           year: 'numeric',
           month: 'long',
           day: 'numeric'
         })}`, 0, 420, { align: 'center' });

      // Certificate number
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`Certificate No: ${certificate.certificateNumber}`, 50, doc.page.height - 80);

      // QR Code placeholder (would need QR code library integration)
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text('Scan QR code to verify', doc.page.width - 200, doc.page.height - 80);

      doc.end();
    });
  }

  generateCourseCompletionCertificate(certificate, user) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Certificate border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(2)
         .stroke('#4CAF50');

      // Header
      doc.fontSize(32)
         .font('Helvetica-Bold')
         .fillColor('#4CAF50')
         .text('CERTIFICATE OF COMPLETION', 0, 80, { align: 'center' });

      // Certificate body
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#000000')
         .text('This certificate is awarded to', 0, 150, { align: 'center' });

      // Student name
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#4CAF50')
         .text(user.name, 0, 190, { align: 'center' });

      // Course details
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#000000')
         .text('for successfully completing the course', 0, 240, { align: 'center' });

      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#4CAF50')
         .text(certificate.title, 0, 270, { align: 'center' });

      if (certificate.metadata.duration) {
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#000000')
           .text(`Duration: ${certificate.metadata.duration}`, 0, 310, { align: 'center' });
      }

      if (certificate.metadata.grade) {
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#000000')
           .text(`Grade: ${certificate.metadata.grade}`, 0, 330, { align: 'center' });
      }

      // Date
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`Completed on ${certificate.issueDate.toLocaleDateString('en-IN')}`, 0, 370, { align: 'center' });

      // Certificate number
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`Certificate No: ${certificate.certificateNumber}`, 50, doc.page.height - 80);

      doc.end();
    });
  }

  generateParticipationCertificate(certificate, user) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Certificate border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(2)
         .stroke('#FF9800');

      // Header
      doc.fontSize(32)
         .font('Helvetica-Bold')
         .fillColor('#FF9800')
         .text('CERTIFICATE OF PARTICIPATION', 0, 80, { align: 'center' });

      // Certificate body
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#000000')
         .text('This certificate is awarded to', 0, 150, { align: 'center' });

      // Student name
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#FF9800')
         .text(user.name, 0, 190, { align: 'center' });

      // Event/Activity details
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#000000')
         .text('for participating in', 0, 240, { align: 'center' });

      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#FF9800')
         .text(certificate.title, 0, 270, { align: 'center' });

      if (certificate.description) {
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#000000')
           .text(certificate.description, 0, 310, { align: 'center', width: 600 });
      }

      // Date
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`Participated on ${certificate.issueDate.toLocaleDateString('en-IN')}`, 0, 370, { align: 'center' });

      // Certificate number
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`Certificate No: ${certificate.certificateNumber}`, 50, doc.page.height - 80);

      doc.end();
    });
  }

  generateDefaultCertificate(certificate, user) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        layout: 'landscape',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Certificate border
      doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40)
         .lineWidth(2)
         .stroke('#2196F3');

      // Header
      doc.fontSize(32)
         .font('Helvetica-Bold')
         .fillColor('#2196F3')
         .text('CERTIFICATE', 0, 80, { align: 'center' });

      // Certificate body
      doc.fontSize(16)
         .font('Helvetica')
         .fillColor('#000000')
         .text('This is to certify that', 0, 150, { align: 'center' });

      // Student name
      doc.fontSize(24)
         .font('Helvetica-Bold')
         .fillColor('#2196F3')
         .text(user.name, 0, 190, { align: 'center' });

      // Certificate title
      doc.fontSize(18)
         .font('Helvetica-Bold')
         .fillColor('#2196F3')
         .text(certificate.title, 0, 240, { align: 'center' });

      if (certificate.description) {
        doc.fontSize(14)
           .font('Helvetica')
           .fillColor('#000000')
           .text(certificate.description, 0, 280, { align: 'center', width: 600 });
      }

      // Date
      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`Issued on ${certificate.issueDate.toLocaleDateString('en-IN')}`, 0, 350, { align: 'center' });

      // Certificate number
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`Certificate No: ${certificate.certificateNumber}`, 50, doc.page.height - 80);

      doc.end();
    });
  }

  // Generate transcript (academic record)
  generateTranscriptCertificate(certificate, user) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Header
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('ACADEMIC TRANSCRIPT', 0, 50, { align: 'center' });

      doc.fontSize(16)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text(certificate.metadata.institution || 'Institution Name', 0, 80, { align: 'center' });

      // Student information
      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#000000')
         .text(`Student Name: ${user.name}`, 50, 120);

      doc.text(`Student ID: ${user.studentId || 'N/A'}`, 50, 140);
      doc.text(`Department: ${certificate.metadata.department || user.profile?.department || 'N/A'}`, 50, 160);
      doc.text(`Program: ${certificate.metadata.course || 'N/A'}`, 50, 180);
      doc.text(`CGPA: ${certificate.metadata.cgpa || 'N/A'}`, 50, 200);
      doc.text(`Issue Date: ${certificate.issueDate.toLocaleDateString('en-IN')}`, 50, 220);

      // Academic record table would go here
      // This is a simplified version - in a real implementation,
      // you'd fetch actual grade data and create a proper table

      doc.fontSize(14)
         .font('Helvetica-Bold')
         .fillColor('#000000')
         .text('Academic Performance Summary', 50, 260);

      if (certificate.metadata.cgpa) {
        doc.fontSize(12)
           .font('Helvetica')
           .fillColor('#000000')
           .text(`Overall CGPA: ${certificate.metadata.cgpa}`, 50, 290);
      }

      // Certificate number
      doc.fontSize(10)
         .font('Helvetica')
         .fillColor('#666666')
         .text(`Transcript No: ${certificate.certificateNumber}`, 50, doc.page.height - 80);

      doc.end();
    });
  }

  // Generate diploma certificate
  generateDiplomaCertificate(certificate, user) {
    return this.generateDegreeCertificate(certificate, user); // Similar layout
  }

  // Generate achievement certificate
  generateAchievementCertificate(certificate, user) {
    return this.generateParticipationCertificate(certificate, user); // Similar layout
  }
}

module.exports = new CertificateGenerator();