import React, { useEffect, useMemo, useState } from "react";
import api from "../../api/client";
import axios from "axios";
import "./pos.css";


export default function POSPage({ user }) {
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState(null); // 🟢 لتخزين رقم الفاتورة

  const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState(["All"]);

  useEffect(() => {
    setLoading(true);
    api.get("/products")
      .then(res => setProducts(res.data))
      .catch(() => setErr("Failed to load products"))
      .finally(() => setLoading(false));

    // NEW: Fetch categories from backend
    axios.get("http://localhost:5000/api/categories")
      .then(res => {
        const catList = ["All", ...res.data.map(c => c.categoryName)];
        setCategories(catList);
      })
      .catch(() => console.error("Failed to load categories"));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter(p => {
      const matchText =
        !q ||
        p.productName.toLowerCase().includes(q) ||
        (p.productCategory || "").toLowerCase().includes(q);
      const matchCat = category === "All" || p.productCategory === category;
      return matchText && matchCat;
    });
  }, [products, query, category]);

  const addToCart = (p) => {
    setCart(prev => {
      const existing = prev[p._id];
      const qty = existing ? existing.qty + 1 : 1;
      return { ...prev, [p._id]: { productId: p._id, name: p.productName, price: p.productPrice, qty } };
    });
  };

  const decQty = (id) => setCart(prev => {
    const item = prev[id]; if (!item) return prev;
    const next = { ...prev };
    if (item.qty <= 1) delete next[id]; else next[id] = { ...item, qty: item.qty - 1 };
    return next;
  });
  const incQty = (id) => setCart(prev => ({ ...prev, [id]: { ...prev[id], qty: prev[id].qty + 1 }}));
  const removeItem = (id) => setCart(prev => { const n = { ...prev }; delete n[id]; return n; });

  const lines = Object.values(cart);
  const subtotal = lines.reduce((s, i) => s + i.price * i.qty, 0);
  const taxRate = 0.11;
  const tax = +(subtotal * taxRate).toFixed(2);
  const total = +(subtotal + tax).toFixed(2);

  // 🟢 Checkout
const completeSale = async () => {
  if (!lines.length) return alert("Cart is empty");

  try {
    const cartData = {
      lines,
      subtotal,
      tax,
      total,
      cashier: user?.username || "unknown",
    };

    // 1) Save cart/invoice
    const res = await axios.post("http://localhost:5000/api/carts", cartData);

   // 2) Update stock quantities
const stockRes = await axios.post("http://localhost:5000/api/products/decrease-stock", {
  items: lines.map(i => ({
    productId: i.productId,
    qty: i.qty,
  }))
});

// ✅ Show errors (if stock not enough → cancel sale)
if (stockRes.data.errors && stockRes.data.errors.length > 0) {
  alert(stockRes.data.errors.join("\n"));
  return; // ⛔ Stop here → don’t complete sale
}

// ✅ Show warnings (low stock or out of stock)
if (stockRes.data.warnings && stockRes.data.warnings.length > 0) {
  alert(stockRes.data.warnings.join("\n"));
}

    // 3) Show success with invoice number

    if (res.data && res.data.invoiceNumber) {
      setInvoiceNumber(res.data.invoiceNumber);
      alert(`✅ Payment complete! Invoice #${res.data.invoiceNumber}`);
    } else {
      alert("✅ Payment complete! (no invoice number returned)");
    }

    setCart({});
  } catch (err) {
    console.error("❌ Failed to save cart:", err.response?.data || err.message);
    alert("❌ Failed to save cart");
  }
};


  // --- Barcode quick add ---
  const [barcode, setBarcode] = useState("");
  const onBarcodeEnter = (e) => {
    if (e.key !== "Enter") return;
    const p = products.find(p => (p.barcode || "") === barcode.trim());
    if (p) addToCart(p);
    setBarcode("");
  };

  return (
    <div className="pos">
      <section className="pos__products">
        <div className="pos__search">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products or categories…"
          />
        </div>

        {/* Category chips */}
        <div className="chip-row">
          {categories.map(c => (
            <button
              key={c}
              className={`chip ${category === c ? "chip--active" : ""}`}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Barcode input */}
        <div className="barcode-row">
          <input
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onKeyDown={onBarcodeEnter}
            placeholder="Scan/enter barcode and press Enter"
          />
        </div>

        {loading ? <p>Loading…</p> : err ? <p style={{color:"crimson"}}>{err}</p> : (
          <div className="pos__grid">
            {filtered.map((p) => (
              <button key={p._id} className="pos__card" onClick={() => addToCart(p)}>
                <div className="pos__card-name">{p.productName}</div>
                <div className="pos__card-meta">
                  <span className="pill">{p.productCategory}</span>
                  <span className="price">${p.productPrice.toFixed(2)}</span>
                </div>
              </button>
            ))}
            {!filtered.length && <div className="muted">No products</div>}
          </div>
        )}
      </section>

      <aside className="pos__cart">
        <h3>Cart</h3>
        {invoiceNumber && (
  <div className="invoice-info">
    <strong>Invoice:</strong> {invoiceNumber+1}
  </div>
)}

        {!lines.length ? (
          <div className="muted">No items yet</div>
        ) : (
          <ul className="cart-list">
            {lines.map((i) => (
              <li key={i.productId} className="cart-row">
                <div className="cart-info">
                  <div className="cart-name">{i.name}</div>
                  <div className="muted">${i.price.toFixed(2)} each</div>
                </div>
                <div className="cart-controls">
                  <button onClick={() => decQty(i.productId)}>-</button>
                  <span>{i.qty}</span>
                  <button onClick={() => incQty(i.productId)}>+</button>
                  <span className="row-total">${(i.price * i.qty).toFixed(2)}</span>
                  <button className="link danger" onClick={() => removeItem(i.productId)}>remove</button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="pos__totals">
          <div><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
          <div><span>Tax (11%)</span><span>${tax.toFixed(2)}</span></div>
          <div className="total"><span>Total</span><span>${total.toFixed(2)}</span></div>
        </div>

        <button className="checkout" onClick={completeSale}>Checkout</button>
      </aside>
    </div>
  );
}
