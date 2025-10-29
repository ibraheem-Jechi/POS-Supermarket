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

  // ✅ shift state
  const [activeShift, setActiveShift] = useState(() => {
    const cached = localStorage.getItem("activeShift");
    return cached ? JSON.parse(cached) : null;
  });

  // Fetch products
  useEffect(() => {
    setLoading(true);
    api
      .get("/products")
      .then((res) => setProducts(res.data))
      .catch(() => setErr("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  // Load current active shift (if any) from backend on mount
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

  // Cart helpers
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

  // ✅ Start shift
  const startShift = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/shifts/start", {
        cashier: user?.username,
      });
      setActiveShift(res.data);
      localStorage.setItem("activeShift", JSON.stringify(res.data));
    } catch (e) {
      alert("❌ Could not start shift");
    }
  };

  // ✅ End shift
  const endShift = async () => {
    try {
      const res = await axios.post("http://localhost:5000/api/shifts/end", {
        cashier: user?.username,
      });
      setActiveShift(null);
      localStorage.removeItem("activeShift");
      alert(`Shift ended. Total sales: $${(res.data?.totalSales || 0).toFixed(2)}`);
    } catch (e) {
      alert("❌ Could not end shift");
    }
  };

  // 🟢 Checkout
  const completeSale = async () => {
    if (!lines.length) return alert("Cart is empty");

    // Optional guard: require an active shift
    if (!activeShift) {
      const proceed = window.confirm(
        "No active shift. Start a shift before selling?\n\nPress OK to start one now."
      );
      if (proceed) {
        await startShift();
      } else {
        return;
      }
    }

    try {
      const cartData = {
        lines: lines.map((i) => {
          const product = products.find((p) => p._id === i.productId);
          return {
            productId: i.productId,
            name: i.name,
            price: i.price,
            qty: i.qty,
            productCategory: product ? product.productCategory : "Uncategorized",
          };
        }),
        subtotal,
        tax,
        total,
        cashier: user?.username || "unknown",
        // ✅ link to shift
        shiftId: activeShift?._id || null,
      };

      // Save invoice
      const res = await axios.post("http://localhost:5000/api/carts", cartData);

      // Update stock
      const stockRes = await axios.post("http://localhost:5000/api/products/decrease-stock", {
        items: lines.map((i) => ({ productId: i.productId, qty: i.qty })),
      });

      if (stockRes.data.errors?.length) {
        alert(stockRes.data.errors.join("\n"));
        return;
      }
      if (stockRes.data.warnings?.length) {
        alert(stockRes.data.warnings.join("\n"));
      }

      if (res.data?.invoiceNumber) {
        setInvoiceNumber(res.data.invoiceNumber);
        alert(`✅ Payment complete! Invoice #${res.data.invoiceNumber}`);
      } else {
        alert("✅ Payment complete!");
      }

      setCart({});
    } catch (err) {
      console.error("❌ Failed to save cart:", err.response?.data || err.message);
      alert("❌ Failed to save cart");
    }
  };

  // --- Barcode quick add ---
  const onBarcodeEnter = (e) => {
    if (e.key !== "Enter") return;
    const p = products.find((p) => (p.barcode || "") === barcode.trim());
    if (p) addToCart(p);
    setBarcode("");
  };

  return (
    <div className="container-fluid bg-light min-vh-100 p-4">
      {/* ✅ Shift controls */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex gap-2">
          <button
            className="btn btn-success"
            onClick={startShift}
            disabled={!!activeShift}
            title={activeShift ? "Shift already active" : "Start your shift"}
          >
            ▶ Start Shift
          </button>
          <button
            className="btn btn-danger"
            onClick={endShift}
            disabled={!activeShift}
            title={!activeShift ? "No active shift" : "End your shift"}
          >
            ■ End Shift
          </button>
        </div>

        {activeShift ? (
          <div className="alert alert-primary py-1 px-2 mb-0">
            <strong>Active Shift</strong> — {user?.username} &middot; Started:{" "}
            {new Date(activeShift.startTime).toLocaleString()}
          </div>
        ) : (
          <div className="text-muted">No active shift</div>
        )}
      </div>

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
                onKeyDown={onBarcodeEnter}
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

            {invoiceNumber && (
              <div className="alert alert-info p-2 mb-3">
                <strong>Invoice #:</strong> {invoiceNumber}
              </div>
            )}

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
            </div>

            <button onClick={completeSale} className="btn btn-primary w-100">
              Complete Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
