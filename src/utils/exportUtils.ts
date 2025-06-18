import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { FinancialReport } from '../types';

export const exportToPDF = async (report: FinancialReport, elementId?: string) => {
  const pdf = new jsPDF();
  
  if (elementId) {
    const element = document.getElementById(elementId);
    if (element) {
      const canvas = await html2canvas(element);
      const imgData = canvas.toDataURL('image/png');
      
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
    }
  } else {
    // Generate PDF from report data
    pdf.setFontSize(20);
    pdf.text('Laporan Keuangan Rumah Sakit', 20, 30);
    
    pdf.setFontSize(12);
    pdf.text(`Periode: ${report.period}`, 20, 50);
    pdf.text(`Tahun: ${report.year}`, 20, 60);
    
    // Revenue section
    pdf.setFontSize(16);
    pdf.text('PENDAPATAN', 20, 80);
    pdf.setFontSize(12);
    let yPos = 90;
    
    Object.entries(report.revenue).forEach(([key, value]) => {
      const label = getRevenueLabel(key);
      pdf.text(`${label}: Rp ${value.toLocaleString('id-ID')}`, 25, yPos);
      yPos += 10;
    });
    
    // Expenses section
    yPos += 10;
    pdf.setFontSize(16);
    pdf.text('PENGELUARAN', 20, yPos);
    yPos += 10;
    pdf.setFontSize(12);
    
    Object.entries(report.expenses).forEach(([key, value]) => {
      const label = getExpenseLabel(key);
      pdf.text(`${label}: Rp ${value.toLocaleString('id-ID')}`, 25, yPos);
      yPos += 10;
    });
  }
  
  pdf.save(`laporan-keuangan-${report.period}.pdf`);
};

export const exportToExcel = (reports: FinancialReport[]) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = reports.map(report => ({
    'Periode': report.period,
    'Tahun': report.year,
    'Total Pendapatan': Object.values(report.revenue).reduce((a, b) => a + b, 0),
    'Total Pengeluaran': Object.values(report.expenses).reduce((a, b) => a + b, 0),
    'Laba Bersih': Object.values(report.revenue).reduce((a, b) => a + b, 0) - Object.values(report.expenses).reduce((a, b) => a + b, 0),
    'Total Aset': Object.values(report.assets.current).reduce((a, b) => a + b, 0) + Object.values(report.assets.fixed).reduce((a, b) => a + b, 0),
    'Total Kewajiban': Object.values(report.liabilities.current).reduce((a, b) => a + b, 0) + Object.values(report.liabilities.longTerm).reduce((a, b) => a + b, 0),
    'Pajak': report.tax.amount
  }));
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
  
  // Detailed sheets for each report
  reports.forEach((report, index) => {
    const detailData = [
      { Kategori: 'PENDAPATAN', Item: '', Jumlah: '' },
      ...Object.entries(report.revenue).map(([key, value]) => ({
        Kategori: '',
        Item: getRevenueLabel(key),
        Jumlah: value
      })),
      { Kategori: '', Item: '', Jumlah: '' },
      { Kategori: 'PENGELUARAN', Item: '', Jumlah: '' },
      ...Object.entries(report.expenses).map(([key, value]) => ({
        Kategori: '',
        Item: getExpenseLabel(key),
        Jumlah: value
      })),
      { Kategori: '', Item: '', Jumlah: '' },
      { Kategori: 'ASET LANCAR', Item: '', Jumlah: '' },
      ...Object.entries(report.assets.current).map(([key, value]) => ({
        Kategori: '',
        Item: getAssetLabel(key),
        Jumlah: value
      })),
      { Kategori: '', Item: '', Jumlah: '' },
      { Kategori: 'ASET TETAP', Item: '', Jumlah: '' },
      ...Object.entries(report.assets.fixed).map(([key, value]) => ({
        Kategori: '',
        Item: getAssetLabel(key),
        Jumlah: value
      }))
    ];
    
    const detailSheet = XLSX.utils.json_to_sheet(detailData);
    XLSX.utils.book_append_sheet(workbook, detailSheet, `Detail ${index + 1}`);
  });
  
  XLSX.writeFile(workbook, `laporan-keuangan-${new Date().toISOString().split('T')[0]}.xlsx`);
};

const getRevenueLabel = (key: string): string => {
  const labels: Record<string, string> = {
    patientCare: 'Perawatan Pasien',
    emergencyServices: 'Layanan Darurat',
    surgery: 'Operasi',
    laboratory: 'Laboratorium',
    pharmacy: 'Farmasi',
    other: 'Lainnya'
  };
  return labels[key] || key;
};

const getExpenseLabel = (key: string): string => {
  const labels: Record<string, string> = {
    salaries: 'Gaji dan Tunjangan',
    medicalSupplies: 'Persediaan Medis',
    equipment: 'Peralatan',
    utilities: 'Utilitas',
    maintenance: 'Pemeliharaan',
    insurance: 'Asuransi',
    other: 'Lainnya'
  };
  return labels[key] || key;
};

const getAssetLabel = (key: string): string => {
  const labels: Record<string, string> = {
    cash: 'Kas',
    accountsReceivable: 'Piutang',
    inventory: 'Persediaan',
    buildings: 'Bangunan',
    equipment: 'Peralatan',
    vehicles: 'Kendaraan',
    other: 'Lainnya'
  };
  return labels[key] || key;
};