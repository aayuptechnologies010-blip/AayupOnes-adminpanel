import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

/**
 * Export data array to Excel (.xlsx) file
 * @param {Array<Object>} data 
 * @param {string} fileName 
 * @param {string} sheetName 
 */
export const exportToExcel = (data, fileName = 'export.xlsx', sheetName = 'Data') => {
  try {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`);
    return true;
  } catch (error) {
    console.error('Failed to export to Excel:', error);
    return false;
  }
};

/**
 * Generate and download a formatted Company Payslip PDF
 * @param {Object} payslipData 
 */
export const generatePayslipPDF = (payslipData) => {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const primaryColor = [37, 99, 235]; // Royal Blue
    const darkColor = [15, 23, 42]; // Slate 900
    const grayColor = [100, 116, 139]; // Slate 500

    // Header / Brand Banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 28, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('AAYUPONES TECHNOLOGIES PVT LTD', 14, 13);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Official Monthly Salary Disbursement Slip | Confirmed & Audited', 14, 20);

    const monthStr = payslipData.month || 'November 2026';
    doc.setFont('helvetica', 'bold');
    doc.text(`PAYSLIP - ${monthStr.toUpperCase()}`, 196, 16, { align: 'right' });

    // Employee & Company Details Box
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Employee Dossier & Employment Info', 14, 38);

    autoTable(doc, {
      startY: 42,
      theme: 'plain',
      styles: { fontSize: 9, cellPadding: 2 },
      columnStyles: {
        0: { fontStyle: 'bold', textColor: grayColor, cellWidth: 35 },
        1: { fontStyle: 'bold', textColor: darkColor, cellWidth: 60 },
        2: { fontStyle: 'bold', textColor: grayColor, cellWidth: 35 },
        3: { fontStyle: 'bold', textColor: darkColor, cellWidth: 60 },
      },
      body: [
        ['Employee Name:', payslipData.empName || payslipData.employeeName || '', 'Employee ID:', payslipData.employeeId || payslipData.empId || 'AAYUP-EMP-2026-37583'],
        ['Designation:', payslipData.designation || payslipData.role || 'Full Stack Engineer', 'Department:', payslipData.department || 'Engineering'],
        ['Bank Account:', payslipData.bankAccount || 'HDFC Bank - •••• 9821', 'PAN / UAN:', payslipData.pan || 'ABCDE1234F / 100987654321'],
        ['Pay Period:', monthStr, 'Days Payable / Paid:', `${payslipData.paidDays || 30} / 30 Days`],
      ],
    });

    // Earnings & Deductions Breakdown Table
    const earningsY = doc.lastAutoTable.finalY + 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Salary & Compensation Breakdown', 14, earningsY);

    const basic = Number(payslipData.basic || 35000);
    const hra = Number(payslipData.hra || 18000);
    const special = Number(payslipData.specialAllowance || 12000);
    const bonus = Number(payslipData.performanceBonus || 0);
    const gross = Number(payslipData.grossSalary || (basic + hra + special + bonus));

    const pf = Number(payslipData.providentFund || 2160);
    const tax = Number(payslipData.professionalTax || 200);
    const tds = Number(payslipData.tds || 2500);
    const otherDeduc = Number(payslipData.otherDeductions || 0);
    const totalDeductions = Number(payslipData.totalDeductions || (pf + tax + tds + otherDeduc));

    const netPay = Number(payslipData.netSalary || (gross - totalDeductions));

    autoTable(doc, {
      startY: earningsY + 4,
      head: [['Earnings', 'Amount (INR)', 'Deductions', 'Amount (INR)']],
      headStyles: {
        fillColor: [241, 245, 249],
        textColor: [15, 23, 42],
        fontStyle: 'bold',
        fontSize: 9,
      },
      styles: { fontSize: 9, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 55 },
        1: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
        2: { cellWidth: 55 },
        3: { cellWidth: 40, halign: 'right', fontStyle: 'bold' },
      },
      body: [
        ['Basic Salary', `INR ${basic.toLocaleString('en-IN')}`, 'Provident Fund (EPF)', `INR ${pf.toLocaleString('en-IN')}`],
        ['House Rent Allowance (HRA)', `INR ${hra.toLocaleString('en-IN')}`, 'Professional Tax (PT)', `INR ${tax.toLocaleString('en-IN')}`],
        ['Special Allowance', `INR ${special.toLocaleString('en-IN')}`, 'Income Tax (TDS)', `INR ${tds.toLocaleString('en-IN')}`],
        ['Performance Incentive', `INR ${bonus.toLocaleString('en-IN')}`, 'Other Recoveries', `INR ${otherDeduc.toLocaleString('en-IN')}`],
        [
          { content: 'Total Gross Earnings', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          { content: `INR ${gross.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          { content: 'Total Deductions', styles: { fontStyle: 'bold', fillColor: [248, 250, 252] } },
          { content: `INR ${totalDeductions.toLocaleString('en-IN')}`, styles: { fontStyle: 'bold', fillColor: [248, 250, 252], textColor: [225, 29, 72] } },
        ],
      ],
    });

    // Net Salary Card
    const netY = doc.lastAutoTable.finalY + 8;
    doc.setFillColor(239, 246, 255); // Blue 50
    doc.setDrawColor(191, 219, 254); // Blue 200
    doc.roundedRect(14, netY, 182, 22, 3, 3, 'FD');

    doc.setTextColor(30, 64, 175);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('NET SALARY TRANSFERRED TO BANK ACCOUNT', 20, netY + 8);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(15);
    doc.text(`INR ${netPay.toLocaleString('en-IN')}`, 20, netY + 17);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text('Direct Electronic NEFT / IMPS Clearance', 190, netY + 14, { align: 'right' });

    // Note / Signature section
    const footerY = netY + 34;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, footerY, 196, footerY);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('This is a computer-generated salary slip and does not require a physical signature.', 14, footerY + 6);
    doc.text('Confidential - For recipient eyes only | AayupOnes HR Payroll Core', 14, footerY + 11);

    // Save File
    const empIdClean = (payslipData.employeeId || 'EMP').replace(/[^a-zA-Z0-9]/g, '_');
    const safeMonth = monthStr.replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`Payslip_${empIdClean}_${safeMonth}.pdf`);
    return true;
  } catch (error) {
    console.error('Failed to generate Payslip PDF:', error);
    return false;
  }
};
