'use client'
import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export default function ExpenseTracker() {
  const [transactions, setTransactions] = useState([]);
  const [date, setDate] = useState("");
  const [item, setItem] = useState("");
  const [expense, setExpense] = useState("");
  
  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    setTransactions(savedTransactions);
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = () => {
    const newTransaction = {
      date,
      item,
      expense: parseFloat(expense) || 0,
    };
    setTransactions([...transactions, newTransaction]);
    setDate("");
    setItem("");
    setExpense("");
  };

  const deleteTransaction = (index) => {
    const updatedTransactions = transactions.filter((_, i) => i !== index);
    setTransactions(updatedTransactions);
  };

  const generatePDF = () => {
    const input = document.getElementById("pdf-content");
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "PNG", 10, 10, 190, 0);
      pdf.save("รายรับรายจ่าย.pdf");
    });
  };

  const totalExpense = transactions.reduce((sum, t) => sum + t.expense, 0);
  const [salesIncome, setSalesIncome] = useState("");
  const profit = parseFloat(salesIncome) - totalExpense;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">บันทึกรายรับ-รายจ่าย</h1>
      <div className="grid grid-cols-4 gap-2 mb-4">
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="border p-2" />
        <input type="text" placeholder="รายการ" value={item} onChange={(e) => setItem(e.target.value)} className="border p-2" />
        <input type="number" placeholder="รายจ่าย" value={expense} onChange={(e) => setExpense(e.target.value)} className="border p-2" />
        <button onClick={addTransaction} className="bg-blue-500 text-white px-4 py-2">เพิ่ม</button>
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
                  <button onClick={() => deleteTransaction(index)} className="bg-red-500 text-white px-2 py-1">ลบ</button>
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
            onChange={(e) => setSalesIncome(e.target.value)} 
            className="border p-2 w-full mb-2"
          />
          <p className="font-bold">กำไรคงเหลือ: {profit} บาท</p>
        </div>
      </div>

      <button onClick={generatePDF} className="bg-green-500 text-white px-4 py-2 mt-4">บันทึกเป็น PDF</button>
    </div>
  );
}
