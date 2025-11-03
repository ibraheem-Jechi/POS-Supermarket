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
  const [invoiceNumber, setInvoiceNumber] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [showInvoice, setShowInvoice] = useState(false);
  const [lastCartData, setLastCartData] = useState(null);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(() => setErr("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

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

  // Cart functions
  const addToCart = (p) => {
    setCart((prev) => {
      const existing = prev[p._id];
      const qty = existing ? existing.qty + 1 : 1;
      return {
        ...prev,
        [p._id]: {
          productId: p._id,
          name: p.productName,
          price: p.productPrice,
          qty,
        },
      };
    });
  };

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
  const grandTotal = total;

  // Complete Sale → open invoice modal
  const completeSale = async () => {
    if (!lines.length) return alert("Cart is empty");

    try {
      const cartData = {
        lines,
        subtotal,
        tax,
        total,
        grandTotal,
        cashier: user?.username || "unknown",
        paymentMethod,
        saleDate: new Date(),
      };

      const res = await axios.post("http://localhost:5000/api/carts", cartData);

      if (res.data?.invoiceNumber) {
        setInvoiceNumber(res.data.invoiceNumber);
        setLastCartData({ ...cartData, invoiceNumber: res.data.invoiceNumber });
        setShowInvoice(true); // ✅ تظهر الفاتورة مباشرة بعد Complete Sale bilal mohammad al saleh 
      } else {
        alert("✅ Payment complete! (no invoice number returned)");
      }

      setCart({});
    } catch (err) {
      console.error("❌ Failed to save cart:", err.response?.data || err.message);
      alert("❌ Failed to save cart");
    }
  };

  // Print Invoice
  const printInvoice = () => {
    const content = document.getElementById("invoice-content").innerHTML;
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>Invoice</title></head><body>${content}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      <div className="row">
        {/* Products Section */}
        <div className="col-md-8 mb-4">
          <div className="card shadow-sm p-3 h-100">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products or categories…"
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
            <div className="mb-3">
              <input
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const p = products.find((p) => (p.barcode || "") === barcode.trim());
                    if (p) addToCart(p);
                    setBarcode("");
                  }
                }}
                placeholder="Scan/enter barcode and press Enter"
                className="form-control"
              />
            </div>
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
                      className="card p-2 w-100 h-100 border-0 shadow-sm hover-shadow"
                    >
                      <div className="fw-semibold mb-2">{p.productName}</div>
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="badge bg-secondary">{p.productCategory}</span>
                        <span className="fw-bold">${p.productPrice.toFixed(2)}</span>
                      </div>
                    </button>
                  </div>
                ))}
                {!filtered.length && <div className="text-muted mt-2">No products</div>}
              </div>
            )}
          </div>
        </div>

        {/* Cart Section */}
        <div className="col-md-4 mb-4">
          <div className="card shadow-sm p-3 sticky-top">
            <h5 className="mb-3">Cart</h5>
            {lines.length === 0 ? (
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
                      <span className="fw-bold ms-2">
                        ${(i.price * i.qty).toFixed(2)}
                      </span>
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
              <div className="mt-2">
                <label className="form-label">Payment Method:</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="form-select"
                >
                  <option value="cash">Cash</option>
                  <option value="card">Card</option>
                  <option value="mobile">Mobile Pay</option>
                </select>
              </div>
            </div>
            <button onClick={completeSale} className="btn btn-primary w-100">
              Complete Sale
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Modal (فقط Print Invoice و Close) */}
      {showInvoice && lastCartData && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-start"
          style={{ paddingTop: "40px", zIndex: 9999 }}
        >
          <div
            className="bg-white p-4 rounded shadow"
            style={{ width: "400px", maxHeight: "90%", overflowY: "auto" }}
          >
            <h5 className="mb-3">Invoice #{lastCartData.invoiceNumber}</h5>
            <div id="invoice-content">
              <div><strong>Cashier:</strong> {lastCartData.cashier}</div>
              <div><strong>Payment:</strong> {lastCartData.paymentMethod}</div>
              <div><strong>Date:</strong> {new Date(lastCartData.saleDate).toLocaleString()}</div>
              <hr />
              <ul className="list-group mb-2">
                {lastCartData.lines.map((i, idx) => (
                  <li key={idx} className="list-group-item d-flex justify-content-between">
                    <span>{i.name} x{i.qty}</span>
                    <span>${(i.price * i.qty).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
              <hr />
              <div className="d-flex justify-content-between">
                <span>Subtotal</span>
                <span>${lastCartData.subtotal.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Tax</span>
                <span>${lastCartData.tax.toFixed(2)}</span>
              </div>
              <div className="d-flex justify-content-between fw-bold">
                <span>Grand Total</span>
                <span>${lastCartData.grandTotal.toFixed(2)}</span>
              </div>

              <div className="mt-3 d-flex justify-content-between">
                <button className="btn btn-success" onClick={printInvoice}>Print Invoice</button>
                <button className="btn btn-secondary" onClick={() => setShowInvoice(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
