'use client';
import { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ExpenseTracker() {
  type Transaction = {
    date: string;
    item: string;
    expense: number;
  };

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [date, setDate] = useState('');
  const [item, setItem] = useState('');
  const [expense, setExpense] = useState('');
  const [salesIncome, setSalesIncome] = useState<number>(0);

  useEffect(() => {
    const transactionsFromLocalStorage = localStorage.getItem('transactions');
    const savedTransactions: Transaction[] = transactionsFromLocalStorage
      ? JSON.parse(transactionsFromLocalStorage)
      : [];
    setTransactions(savedTransactions);
  }, []);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    const expenseValue = parseFloat(expense);
    const newTransaction: Transaction = {
      date: date,
      item: item,
      expense: expenseValue || 0,
    };

    setTransactions([...transactions, newTransaction]);
    setDate('');
    setItem('');
    setExpense('');
  };

  const deleteTransaction = (index: number) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  const generatePDF = () => {
    if (typeof window !== 'undefined') {
      const input = document.getElementById('pdf-content');
      if (input) {
        html2canvas(input, { scale: 2 }).then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('p', 'mm', 'a4');
          
          const pageWidth = pdf.internal.pageSize.width;
          const pageHeight = pdf.internal.pageSize.height;
  
          // เพิ่ม margin
          const margin = 10;
          const imgWidth = pageWidth - margin * 2; // ลดขอบจากซ้ายขวา
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
  
          // หากความสูงเกินขนาดของหน้า A4
          if (imgHeight > pageHeight - margin * 2) {
            const scaleFactor = (pageHeight - margin * 2) / imgHeight;
            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth * scaleFactor, (pageHeight - margin * 2) * scaleFactor);
          } else {
            pdf.addImage(imgData, 'PNG', margin, margin, imgWidth, imgHeight);
          }
  
          // ตรวจสอบการตัดหน้า (ถ้าขนาดของภาพมากเกินไป สามารถเพิ่มหน้าใหม่ได้)
          const currentPageHeight = pdf.internal.pageSize.height;
          const totalPages = Math.ceil(imgHeight / currentPageHeight);
          for (let i = 1; i < totalPages; i++) {
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', margin, -(currentPageHeight * i) + margin, imgWidth, imgHeight);
          }
  
          // สร้าง PDF และบันทึก
          pdf.save('รายรับรายจ่าย.pdf');
        });
      }
    }
  };
  const totalExpense = transactions.reduce((sum, t) => sum + t.expense, 0);

  const profit = salesIncome - totalExpense;

  return (
    <div className="p-6 max-w-full mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center sm:text-left">บันทึกรายรับ-รายจ่าย</h1>
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="text"
          placeholder="รายการ"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          className="border p-2 w-full"
        />
        <input
          type="number"
          placeholder="รายจ่าย"
          value={expense}
          onChange={(e) => setExpense(e.target.value)}
          className="border p-2 w-full"
        />
        <button onClick={addTransaction} className="bg-blue-500 text-white px-4 py-2 w-full sm:w-auto">
          เพิ่ม
        </button>
      </div>

      <div id="pdf-content">
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">วันที่</th>
              <th className="border p-2">รายการ</th>
              <th className="border p-2">รายจ่าย (บาท)</th>
              <th className="border p-2">ลบ</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((t, index) => (
              <tr key={index} className="text-center">
                <td className="border p-2">{t.date}</td>
                <td className="border p-2">{t.item}</td>
                <td className="border p-2">{t.expense}</td>
                <td className="border p-2">
                  <button
                    onClick={() => deleteTransaction(index)}
                    className="bg-red-500 text-white px-2 py-1"
                  >
                    ลบ
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 p-4 bg-gray-100 rounded">
          <p>ต้นทุนทั้งหมด: {totalExpense} บาท</p>
          <input
            type="number"
            placeholder="รายได้จากการขายของ"
            value={salesIncome}
            onChange={(e) => setSalesIncome(parseFloat(e.target.value))}
            className="border p-2 w-full mb-2"
          />
          <p className="font-bold">กำไรคงเหลือ: {profit} บาท</p>
        </div>
      </div>

      <button onClick={generatePDF} className="bg-green-500 text-white px-4 py-2 mt-4 w-full sm:w-auto">
        บันทึกเป็น PDF
      </button>
    </div>
  );
}
