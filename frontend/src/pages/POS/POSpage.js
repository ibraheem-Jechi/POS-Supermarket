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
        console.error("Failed to load products:", e);
        setErr(e.response?.data?.message || e.message || "Failed to load products");
      })
      .finally(() => setLoading(false));
  }, []);

  // ✅ Load current active shift
  useEffect(() => {
    const cashier = user?.username;
    if (!cashier) return;
    axios
      .get(`http://localhost:5000/api/shifts/active?cashier=${encodeURIComponent(cashier)}`)
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

  // ✅ Category filtering
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(products.map((p) => p.productCategory)))],
    [products]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
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
    if (activeShift) {
      alert("⚠️ You already have an active shift.");
      return;
    }
    if (!user || !user.username) {
      alert("⚠️ You must be logged in to start a shift.");
      return;
    }

    const confirmStart = window.confirm(`🟢 Start your shift as ${user.username}?`);
    if (!confirmStart) return;

    try {
      const res = await axios.post("http://localhost:5000/api/shifts/start", {
        cashier: user?.username,
      });
      setActiveShift(res.data);
      localStorage.setItem("activeShift", JSON.stringify(res.data));
      alert(`✅ Shift started at ${new Date(res.data.startTime).toLocaleTimeString()}`);
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err?.message || "Could not start shift";
      console.error("Start shift error:", err);
      alert(`❌ Could not start shift: ${serverMsg}`);
    }
  };

  const endShift = async () => {
    if (!activeShift) return alert("⚠️ You have no active shift to end.");
    const confirmEnd = window.confirm(`🔴 End shift for ${user.username}?`);
    if (!confirmEnd) return;

    try {
      const res = await axios.post("http://localhost:5000/api/shifts/end", {
        cashier: user?.username,
      });
      setActiveShift(null);
      localStorage.removeItem("activeShift");
      alert(`✅ Shift ended. Total sales: $${(res.data?.totalSales || 0).toFixed(2)}`);
    } catch (err) {
      console.error("End shift error:", err);
      const serverMsg = err?.response?.data?.message || err?.message || "Could not end shift";
      alert(`❌ Could not end shift: ${serverMsg}`);
    }
  };

  // ✅ Complete sale
  const completeSale = async () => {
    if (!lines.length) return alert("Cart is empty");
    if (!activeShift) {
      const proceed = window.confirm("No active shift. Start one before selling?");
      if (proceed) await startShift();
      else return;
    }

    try {
      const cartData = {
        lines: lines.map((i) => ({
          productId: i.productId,
          name: i.name,
          price: i.price,
          qty: i.qty,
        })),
        subtotal,
        tax,
        total,
        cashier: user?.username || "unknown",
        shiftId: activeShift?._id || null,
      };

      const saleRes = await axios.post("http://localhost:5000/api/sales", cartData);

      setInvoiceData({
        invoiceNumber: saleRes.data.invoiceNumber,
        items: lines,
        subtotal,
        tax,
        total,
        cashier: user?.username,
        date: new Date().toLocaleString(),
      });

      setLoyaltyPointsEarned(saleRes.data.loyaltyPoints || 0);

      // Decrease stock for sold items
      try {
        const stockRes = await axios.post("http://localhost:5000/api/products/decrease-stock", {
          items: lines.map((i) => ({ productId: i.productId, qty: i.qty })),
        });

        if (stockRes.data.errors?.length) {
          alert(stockRes.data.errors.join("\n"));
        }
        if (stockRes.data.warnings?.length) {
          alert(stockRes.data.warnings.join("\n"));
        }

        // Refresh product list so quantities show updated values
        try {
          const prodRes = await api.get("/products");
          setProducts(prodRes.data);
        } catch (e) {
          console.warn("Could not refresh products after sale:", e);
        }

        // Also fetch alerts immediately and broadcast so Sidebar updates badge
        try {
          const alertsRes = await api.get("/alerts");
          const count = alertsRes.data?.count ?? (Array.isArray(alertsRes.data) ? alertsRes.data.length : 0);
          window.dispatchEvent(new CustomEvent("alertsUpdated", { detail: { count } }));
        } catch (e) {
          console.warn("Could not refresh alerts after sale:", e);
        }
      } catch (e) {
        console.warn("Failed to update stock:", e?.response?.data || e.message || e);
      }

      alert(`✅ Sale complete! Invoice #${saleRes.data.invoiceNumber}`);
      setCart({});
    } catch (err) {
      console.error("❌ Sale failed:", err);
      alert("❌ Sale failed");
    }
  };

  const onBarcodeEnter = (e) => {
    if (e.key === "Enter") {
      const p = products.find((p) => (p.barcode || "") === barcode.trim());
      if (p) addToCart(p);
      setBarcode("");
    }
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      {/* ✅ Shift Controls */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <button className="btn btn-success" onClick={startShift} disabled={!!activeShift}>
            ▶ Start Shift
          </button>
          <button className="btn btn-danger" onClick={endShift} disabled={!activeShift}>
            ■ End Shift
          </button>
        </div>
        {activeShift ? (
          <div className="alert alert-primary py-1 px-2 mb-0">
            <strong>Active Shift:</strong> {user?.username} ·{" "}
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
                    category === c ? "btn-primary text-white" : "btn-outline-secondary"
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

            <button onClick={completeSale} className="btn btn-primary w-100 mb-2">
              Complete Sale
            </button>

            {/* ✅ Invoice */}
            {invoiceData && (
              <div id="invoice" className="card p-3 mt-3 shadow-sm">
                <h5 className="text-center mb-3">Supermarket Invoice</h5>
                <p>
                  <strong>Invoice #:</strong> {invoiceData.invoiceNumber}
                  <br />
                  <strong>Cashier:</strong> {invoiceData.cashier}
                  <br />
                  <strong>Date:</strong> {invoiceData.date}
                </p>
                <hr />
                <ul className="list-group mb-3">
                  {invoiceData.items.map((i) => (
                    <li
                      key={i.productId}
                      className="list-group-item d-flex justify-content-between align-items-center"
                    >
                      <div>
                        {i.name} × {i.qty}
                      </div>
                      <div>${(i.price * i.qty).toFixed(2)}</div>
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
                <p className="text-center text-success mb-2">
                  🎁 Loyalty Points: {loyaltyPointsEarned}
                </p>

                {/* ✅ Print + Close Buttons */}
                <div className="d-flex flex-column gap-2">
                  <button
                    className="btn btn-success w-100"
                    onClick={() => {
                      const printContents = `
                        <div style="font-family:'Courier New',monospace;width:80mm;padding:8px;">
                          <h2 style="text-align:center;margin:0;">🏪 Supermarket</h2>
                          <hr style="border:none;border-top:1px dashed #000;margin:5px 0;">
                          ${document
                            .getElementById("invoice")
                            .innerHTML.replace("🖨️ Print Invoice", "")
                            .replace("❌ Close", "")}
                          <hr style="border:none;border-top:1px dashed #000;margin:5px 0;">
                          <div style="text-align:center;font-size:11px;">
                            Thank you for shopping!<br/>${new Date().toLocaleString()}
                          </div>
                        </div>
                      `;
                      const printWindow = window.open("", "_blank", "width=800,height=1000");
                      printWindow.document.write(`
                        <html>
                          <head>
                            <title>Invoice</title>
                            <style>
                              @page { size: 80mm auto; margin: 0; }
                              body { margin: 0; background: #fff; }
                            </style>
                          </head>
                          <body>${printContents}</body>
                        </html>
                      `);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                      }, 500);
                    }}
                  >
                    🖨️ Print Invoice
                  </button>

                  <button
                    className="btn btn-outline-danger w-100"
                    onClick={() => setInvoiceData(null)}
                  >
                    ❌ Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
