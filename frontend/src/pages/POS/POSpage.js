import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import api from "../../api/client";
import "bootstrap/dist/css/bootstrap.min.css";

export default function POSPage({ user }) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [category, setCategory] = useState("All");
  const [barcode, setBarcode] = useState("");
  const [invoiceData, setInvoiceData] = useState(null);
  const [loyaltyPointsEarned, setLoyaltyPointsEarned] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const [activeShift, setActiveShift] = useState(() => {
    const cached = localStorage.getItem("activeShift");
    return cached ? JSON.parse(cached) : null;
  });

  // ✅ Fetch products
  useEffect(() => {
    setLoading(true);
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch((e) => {
        setErr(e.response?.data?.message || "Failed to load products");
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Load shift
  useEffect(() => {
    const cashier = user?.username;
    if (!cashier) return;
    axios
      .get(
        `http://localhost:5000/api/shifts/active?cashier=${encodeURIComponent(
          cashier
        )}`
      )
      .then((res) => {
        if (res.data) {
          setActiveShift(res.data);
          localStorage.setItem("activeShift", JSON.stringify(res.data));
        } else {
          setActiveShift(null);
          localStorage.removeItem("activeShift");
        }
      })
      .catch(() => {});
  }, [user]);

  // ✅ Categories
  const categories = useMemo(
    () => ["All", ...new Set(products.map((p) => p.productCategory))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products.filter((p) => {
      const matchText =
        !q ||
        p.productName.toLowerCase().includes(q) ||
        (p.productCategory || "").toLowerCase().includes(q);
      const matchCat = category === "All" || p.productCategory === category;
      return matchText && matchCat;
    });
  }, [products, query, category]);

  // ✅ Cart helpers
  const addToCart = (p) =>
    setCart((prev) => {
      const existing = prev[p._id];
      const qty = existing ? existing.qty + 1 : 1;
      return {
        ...prev,
        [p._id]: {
          productId: p._id,
          name: p.productName,
          price: Number(p.productPrice) || 0,
          qty,
        },
      };
    });

  const decQty = (id) =>
    setCart((prev) => {
      const item = prev[id];
      if (!item) return prev;
      const next = { ...prev };
      if (item.qty <= 1) delete next[id];
      else next[id] = { ...item, qty: item.qty - 1 };
      return next;
    });

  const incQty = (id) =>
    setCart((prev) => ({
      ...prev,
      [id]: { ...prev[id], qty: prev[id].qty + 1 },
    }));

  const removeItem = (id) =>
    setCart((prev) => {
      const n = { ...prev };
      delete n[id];
      return n;
    });

  const lines = Object.values(cart);
  const subtotal = lines.reduce((s, i) => s + i.price * i.qty, 0);
  const taxRate = 0.11;
  const tax = +(subtotal * taxRate).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  // ✅ Shift control
  const startShift = async () => {
    if (activeShift) return alert("⚠️ Shift already active.");

    const confirmStart = window.confirm(`🟢 Start shift as ${user.username}?`);
    if (!confirmStart) return;

    try {
      const res = await axios.post("http://localhost:5000/api/shifts/start", {
        cashier: user.username,
      });
      setActiveShift(res.data);
      localStorage.setItem("activeShift", JSON.stringify(res.data));
      alert(`✅ Shift started at ${new Date(res.data.startTime).toLocaleTimeString()}`);
    } catch (err) {
      alert("❌ Could not start shift.");
    }
  };

  const endShift = async () => {
    if (!activeShift) return alert("⚠️ No active shift.");
    const confirmEnd = window.confirm(`🔴 End shift for ${user.username}?`);
    if (!confirmEnd) return;

    try {
      const res = await axios.post("http://localhost:5000/api/shifts/end", {
        cashier: user.username,
      });
      setActiveShift(null);
      localStorage.removeItem("activeShift");
      alert(`✅ Shift ended. Total sales: $${(res.data?.totalSales || 0).toFixed(2)}`);
    } catch {
      alert("❌ Could not end shift.");
    }
  };

  // ✅ Complete sale
  const completeSale = async () => {
    if (!lines.length) return alert("Cart is empty!");

    if (!activeShift) {
      const proceed = window.confirm("No active shift. Start one?");
      if (proceed) await startShift();
      else return;
    }

    try {
      const cartData = {
        lines,
        subtotal,
        tax,
        total,
        cashier: user.username,
        shiftId: activeShift?._id || null,
        paymentMethod,
      };

      const saleRes = await axios.post("http://localhost:5000/api/sales", cartData);

      setInvoiceData({
        invoiceNumber: saleRes.data.invoiceNumber,
        items: lines,
        subtotal,
        tax,
        total,
        cashier: user.username,
        date: new Date().toLocaleString(),
        paymentMethod,
      });

      setLoyaltyPointsEarned(saleRes.data.loyaltyPoints || 0);
      setCart({});
    } catch {
      alert("❌ Sale failed.");
    }
  };

  // ✅ Print receipt
  const handlePrint = () => {
    if (!invoiceData) return;

    const printWindow = window.open("", "", "width=400,height=600");

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { font-family: 'Courier New', monospace; font-size: 12px; margin: 0; padding: 10px; width: 80mm; }
            .center { text-align: center; }
            hr { border: 1px dashed #000; }
            table { width: 100%; }
            TD { padding: 2px 0; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center bold">🏪 Supermarket POS</div>
          <div class="center">Invoice #${invoiceData.invoiceNumber}</div>
          <div class="center">Cashier: ${invoiceData.cashier}</div>
          <div class="center">${invoiceData.date}</div>
          <div class="center">Payment: ${invoiceData.paymentMethod}</div>
          <hr />

          <table>
            ${invoiceData.items
              .map(
                (i) => `
                <tr>
                  <td>${i.name} × ${i.qty}</td>
                  <td style="text-align:right;">$${(i.price * i.qty).toFixed(2)}</td>
                </tr>`
              )
              .join("")}
          </table>

          <hr />

          <table>
            <tr><td>Subtotal:</td><td style="text-align:right;">$${invoiceData.subtotal.toFixed(2)}</td></tr>
            <tr><td>Tax:</td><td style="text-align:right;">$${invoiceData.tax.toFixed(2)}</td></tr>
            <tr><td class="bold">Total:</td><td style="text-align:right;" class="bold">$${invoiceData.total.toFixed(2)}</td></tr>
          </table>

          <hr />

          <div class="center">🎁 Loyalty Points: ${loyaltyPointsEarned}</div>

          <script>
            window.onload = function() {
              window.print();
              setTimeout(() => window.close(), 500);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  };

  // ✅ Scan barcode
  const onBarcodeEnter = (e) => {
    if (e.key === "Enter") {
      const p = products.find((p) => (p.barcode || "") === barcode.trim());
      if (p) addToCart(p);
      setBarcode("");
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">

      {/* === Shift Controls === */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <button
            className="btn btn-success"
            onClick={startShift}
            disabled={!!activeShift}
          >
            ▶ Start Shift
          </button>

          <button
            className="btn btn-danger"
            onClick={endShift}
            disabled={!activeShift}
          >
            ■ End Shift
          </button>
        </div>

        {activeShift ? (
          <div className="alert alert-primary py-1 px-2 mb-0">
            <strong>Active Shift:</strong> {user.username} ·{" "}
            {new Date(activeShift.startTime).toLocaleTimeString()}
          </div>
        ) : (
          <div className="text-muted">No active shift</div>
        )}
      </div>

      <div className="row">

        {/* === Products === */}
        <div className="col-md-8 mb-4">
          <div className="card shadow-sm p-3 h-100">

            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products..."
              className="form-control mb-3"
            />

            <div className="mb-3 d-flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  className={`btn btn-sm ${
                    category === c ? "btn-dark text-white" : "btn-outline-secondary"
                  }`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <input
              value={barcode}
              onChange={(e) => setBarcode(e.target.value)}
              onKeyDown={onBarcodeEnter}
              placeholder="Scan barcode and press Enter"
              className="form-control mb-3"
            />

            {loading ? (
              <p>Loading…</p>
            ) : err ? (
              <p className="text-danger">{err}</p>
            ) : (
              <div className="row row-cols-2 row-cols-md-3 g-3">
                {filtered.map((p) => (
                  <div key={p._id} className="col">
                    <button
                      onClick={() => addToCart(p)}
                      className="card p-2 w-100 h-100 border-0 shadow-sm"
                    >
                      <div className="fw-semibold mb-2">{p.productName}</div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-secondary">{p.productCategory}</span>
                        <span className="fw-bold">${p.productPrice.toFixed(2)}</span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* === Cart === */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm p-3 sticky-top">
            <h5 className="mb-3">Cart</h5>

            {!lines.length ? (
              <div className="text-muted">No items yet</div>
            ) : (
              <ul className="list-group mb-3">
                {lines.map((i) => (
                  <li
                    key={i.productId}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <div className="fw-semibold">{i.name}</div>
                      <div className="text-muted">${i.price.toFixed(2)} each</div>
                    </div>
                    <div className="d-flex align-items-center gap-1">
                      <button
                        onClick={() => decQty(i.productId)}
                        className="btn btn-outline-secondary btn-sm"
                      >
                        -
                      </button>
                      <span>{i.qty}</span>
                      <button
                        onClick={() => incQty(i.productId)}
                        className="btn btn-outline-secondary btn-sm"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(i.productId)}
                        className="btn btn-link text-danger p-0 ms-2"
                      >
                        remove
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            {/* === Payment Method === */}
            <div className="mb-3">
              <label className="form-label fw-bold">Payment Method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="Cash">Cash 💵</option>
                <option value="Credit">Credit 💳</option>
              </select>
            </div>

            {/* === Totals === */}
            <div className="mb-3">
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between">
                <span>Tax (11%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>

              <div className="d-flex justify-content-between fw-bold fs-5">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* === Complete Sale === */}
            <button
              onClick={completeSale}
              className="btn btn-dark w-100 mb-2 py-2 fw-bold"
              style={{ borderRadius: "10px" }}
            >
              ✅ Complete Sale
            </button>

            {/* === Invoice === */}
            {invoiceData && (
              <div id="invoice" className="card p-3 mt-3 shadow-sm">
                <h5 className="text-center mb-3">Supermarket Invoice</h5>

                <p>
                  <strong>Invoice #:</strong> {invoiceData.invoiceNumber}
                  <br />
                  <strong>Cashier:</strong> {invoiceData.cashier}
                  <br />
                  <strong>Date:</strong> {invoiceData.date}
                  <br />
                  <strong>Payment:</strong> {invoiceData.paymentMethod}
                </p>

                <hr />

                <ul className="list-group mb-3">
                  {invoiceData.items.map((i) => (
                    <li
                      key={i.productId}
                      className="list-group-item d-flex justify-content-between"
                    >
                      <span>{i.name} × {i.qty}</span>
                      <span>${(i.price * i.qty).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>

                <div className="d-flex justify-content-between">
                  <strong>Subtotal:</strong>
                  <span>${invoiceData.subtotal.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between">
                  <strong>Tax:</strong>
                  <span>${invoiceData.tax.toFixed(2)}</span>
                </div>

                <div className="d-flex justify-content-between fs-5 mt-2">
                  <strong>Total:</strong>
                  <strong>${invoiceData.total.toFixed(2)}</strong>
                </div>

                <hr />

                <p className="text-center text-success">
                  🎁 Loyalty Points: {loyaltyPointsEarned}
                </p>

                {/* === Print & Close === */}
                <button
                  className="btn btn-dark w-100 mb-2 fw-bold py-2"
                  style={{ borderRadius: "10px" }}
                  onClick={handlePrint}
                >
                  🖨️ Print Invoice
                </button>

                <button
                  className="btn btn-outline-secondary w-100 fw-bold py-2"
                  style={{ borderRadius: "10px" }}
                  onClick={() => setInvoiceData(null)}
                >
                  ❌ Close Invoice
                </button>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
