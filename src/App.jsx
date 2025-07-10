import React, { useState } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable"; // ✅ proper ESM usage for Vite + React
import { Home, LogOut } from "lucide-react";
import backgroundImage from "./assets/background.jpg"; // make sure the image is placed in src/assets
import watermarkImage from "./assets/watermark.png"; // Add a transparent watermark image here
import Login from "./Login";

function Header({ onLogout }) {
  return (
    <div className="fixed top-0 left-0 w-full bg-white/30 backdrop-blur-sm shadow-md p-4 flex justify-between items-center z-50">
      <h1 className="text-lg font-bold text-gray-800">The Hahnemann</h1>
      <div className="flex gap-2 items-center">
        <Link to="/">
          <button className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex items-center">
            <Home className="w-5 h-5" />
          </button>
        </Link>
        <button
          className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2 flex items-center justify-center"
          onClick={onLogout}
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

function Dashboard({ onLogout }) {
  return (
    <div
      className="w-screen h-screen pt-20 flex flex-col items-center justify-center px-4"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Header onLogout={onLogout} />
      <div className="max-w-xl w-full bg-white/80 backdrop-blur-md p-6 rounded-xl shadow">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          The Hahnemann Dashboard
        </h1>
        <div className="grid grid-cols-1 gap-6">
          <Link to="/inventory">
            <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 hover:shadow-lg transition">
              <p className="text-lg font-semibold text-blue-600 text-center">📦 Manage Inventory</p>
            </div>
          </Link>
          <Link to="/billing">
            <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6 hover:shadow-lg transition">
              <p className="text-lg font-semibold text-green-600 text-center">🧾 Create Invoice</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

function Inventory({ onLogout }) {
  const [inventory, setInventory] = useState([]);
  const [item, setItem] = useState({ name: '', quantity: '', price: '' });

  const handleInputChange = (field, value) => {
    setItem({ ...item, [field]: value });
  };

  const handleAddItem = () => {
    if (!item.name || !item.quantity || !item.price) return;
    setInventory([...inventory, item]);
    setItem({ name: '', quantity: '', price: '' });
  };

  return (
    <div
      className="w-screen h-screen pt-20 flex flex-col items-center px-4 py-8"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Header onLogout={onLogout} />
      <div className="max-w-3xl w-full bg-white/80 backdrop-blur-md p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Manage Inventory</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <input
            value={item.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Medicine Name"
            className="border p-2 rounded"
          />
          <input
            type="number"
            value={item.quantity}
            onChange={(e) => handleInputChange("quantity", e.target.value)}
            placeholder="Quantity"
            className="border p-2 rounded"
          />
          <input
            type="number"
            value={item.price}
            onChange={(e) => handleInputChange("price", e.target.value)}
            placeholder="Price (₹)"
            className="border p-2 rounded"
          />
        </div>
        <button onClick={handleAddItem} className="w-full bg-blue-600 text-white py-2 rounded mb-4">
          ➕ Add to Inventory
        </button>

        <table className="w-full text-left border">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2">Medicine</th>
              <th className="p-2">Quantity</th>
              <th className="p-2">Price (₹)</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((inv, idx) => (
              <tr key={idx} className="border-t">
                <td className="p-2">{inv.name}</td>
                <td className="p-2">{inv.quantity}</td>
                <td className="p-2">₹{inv.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Billing({ onLogout }) {
  const [items, setItems] = useState([{ name: "", quantity: "", price: "", discount: "" }]);

  const handleChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    setItems(newItems);
  };

  const handleAddRow = () => {
    setItems([...items, { name: "", quantity: "", price: "", discount: "" }]);
  };

  const generatePDF = () => {
    const doc = new jsPDF();

    const img = new Image();
    img.src = watermarkImage;
    img.onload = () => {
      doc.addImage(img, 'PNG', 30, 50, 150, 150, '', 'FAST');

      doc.setFontSize(18);
      doc.text("The Hahnemann Invoice", 14, 22);
      doc.setFontSize(12);

      const tableBody = items.map((item) => {
        const discountAmount = (item.price * item.quantity * item.discount) / 100;
        const total = item.quantity * item.price - discountAmount;
        return [
          item.name,
          item.quantity,
          `INR ${item.price.toFixed(2)}`,
          `${item.discount}%`,
          `INR ${total.toFixed(2)}`
        ];
      });

      const totalAmount = items.reduce((acc, item) => {
        const discountAmount = (item.price * item.quantity * item.discount) / 100;
        return acc + (item.price * item.quantity - discountAmount);
      }, 0);

      autoTable(doc, {
        head: [["Medicine", "Quantity", "Price", "Discount", "Total"]],
        body: tableBody,
        startY: 30,
        didDrawPage: function (data) {
          doc.text(`Grand Total: INR ${totalAmount.toFixed(2)}`, 14, data.cursor.y + 10);
        },
      });

      doc.save("invoice.pdf");
    };
  };

  return (
    <div
      className="w-screen h-screen pt-20 flex flex-col items-center px-4 py-8"
      style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <Header onLogout={onLogout} />
      <div className="max-w-3xl w-full bg-white/80 backdrop-blur-md p-6 rounded-xl shadow">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Invoice</h2>

        {items.map((item, index) => (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4" key={index}>
            <input
              value={item.name}
              onChange={(e) => handleChange(index, "name", e.target.value)}
              placeholder="Medicine Name"
              className="border p-2 rounded"
            />
            <input
              type="number"
              value={item.quantity}
              onChange={(e) => handleChange(index, "quantity", parseInt(e.target.value))}
              placeholder="Quantity"
              className="border p-2 rounded"
            />
            <input
              type="number"
              value={item.price}
              onChange={(e) => handleChange(index, "price", parseFloat(e.target.value))}
              placeholder="Price (INR)"
              className="border p-2 rounded"
            />
            <input
              type="number"
              value={item.discount}
              onChange={(e) => handleChange(index, "discount", parseFloat(e.target.value))}
              placeholder="Discount (%)"
              className="border p-2 rounded"
            />
          </div>
        ))}
        <button onClick={handleAddRow} className="w-full bg-green-600 text-white py-2 rounded mb-4">
          ➕ Add Item
        </button>
        <button onClick={generatePDF} className="w-full bg-blue-600 text-white py-2 rounded">
          🧾 Download PDF Invoice
        </button>
      </div>
    </div>
  );
}

function AppRoutes({ isAuthenticated, handleLogin, handleLogout }) {
  return isAuthenticated ? (
    <Routes>
      <Route path="/" element={<Dashboard onLogout={handleLogout} />} />
      <Route path="/billing" element={<Billing onLogout={handleLogout} />} />
      <Route path="/inventory" element={<Inventory onLogout={handleLogout} />} />
    </Routes>
  ) : (
    <Routes>
      <Route path="*" element={<Login onLogin={handleLogin} />} />
    </Routes>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  const handleLogin = () => {
    setIsAuthenticated(true);
    navigate("/");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate("/login");
  };

  return (
    <AppRoutes isAuthenticated={isAuthenticated} handleLogin={handleLogin} handleLogout={handleLogout} />
  );
}

export default App;
