import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = "https://novamart-backend.vercel.app";
const STEP_CART = "cart";
const STEP_FORM = "form";
const STEP_SUCCESS = "success";

const PAYMENTS = [
  { bank:"TeleBirr", number:"+251 937 066 660", emoji:"📱", color:"#7c3aed", bg:"#f5f3ff", border:"#ddd6fe" },
  { bank:"CBE", number:"1000599391251", emoji:"🏦", color:"#1d4ed8", bg:"#eff6ff", border:"#bfdbfe" },
  { bank:"Abyssinia Bank", number:"261230437", emoji:"🏛️", color:"#b45309", bg:"#fffbeb", border:"#fcd34d" },
  { bank:"Dashen Bank", number:"5008886050021", emoji:"🏧", color:"#0f766e", bg:"#f0fdfa", border:"#99f6e4" },
];

function PayCard({ acc }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { navigator.clipboard.writeText(acc.number).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }); };
  return (
    <div className="pay-card" style={{ background:acc.bg, border:`1.5px solid ${acc.border}` }}>
      <div className="pay-card-icon" style={{ background:acc.color }}><span style={{fontSize:20}}>{acc.emoji}</span></div>
      <div className="pay-card-info">
        <div className="pay-card-bank" style={{color:acc.color}}>{acc.bank}</div>
        <div className="pay-card-num">{acc.number}</div>
        <div className="pay-card-name">Natnael Dereje</div>
      </div>
      <button onClick={copy} className="pay-copy-btn" style={{background:copied?"#6abf3a":"#fff",color:copied?"#fff":acc.color,borderColor:copied?"#6abf3a":acc.border}}>
        {copied?"✓ Copied":"📋 Copy"}
      </button>
    </div>
  );
}

function PaySection({ total }) {
  const [tgCopied, setTgCopied] = useState(false);
  const [phCopied, setPhCopied] = useState(false);
  const copy = (text, setter) => { navigator.clipboard.writeText(text).then(() => { setter(true); setTimeout(() => setter(false), 2000); }); };

  return (
    <div className="pay-section">
      <div className="pay-title">💳 Pay Now</div>
      <p className="pay-sub">Please transfer <strong>ETB {total.toLocaleString()}</strong> to one of the accounts below, then we'll call to confirm your order.</p>

      {PAYMENTS.map(a => <PayCard key={a.bank} acc={a} />)}

      {/* Telegram username below accounts */}
      <div style={{textAlign:"center",padding:"8px 0",borderTop:"1px solid #e8f5e0",borderBottom:"1px solid #e8f5e0",margin:"10px 0"}}>
        <p style={{fontSize:12,color:"#888",margin:"0 0 4px"}}>Telegram</p>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
          <span style={{fontSize:15,fontWeight:700,color:"#2AABEE",fontFamily:"monospace"}}>@Natinana111</span>
          <button onClick={()=>copy("@Natinana111",setTgCopied)} style={{background:tgCopied?"#6abf3a":"#f0f7ec",color:tgCopied?"#fff":"#1a5c2a",border:"1.5px solid #cde8ba",borderRadius:6,fontSize:10,fontWeight:700,padding:"3px 8px",cursor:"pointer"}}>
            {tgCopied?"✓":"📋"}
          </button>
        </div>
      </div>

      <div className="pay-note">
        <span style={{fontSize:18,flexShrink:0}}>⚠️</span>
        <p>After sending, <strong>take a screenshot</strong> of your transfer. We'll verify when we call to confirm delivery.</p>
      </div>

      {/* Contact side by side */}
      <div style={{marginTop:12}}>
        <p style={{fontSize:12,fontWeight:700,color:"#1a5c2a",marginBottom:8}}>💬 Need Help? Contact Us</p>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>

          {/* Telegram */}
          <div style={{background:"#fff",border:"1.5px solid #e0e7ff",borderRadius:10,padding:"10px 10px",textAlign:"center"}}>
            <div style={{width:34,height:34,borderRadius:8,background:"#2AABEE",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,margin:"0 auto 6px"}}>✈️</div>
            <div style={{fontSize:10,fontWeight:700,color:"#2AABEE",marginBottom:2}}>Telegram</div>
            <div style={{fontSize:12,fontWeight:700,color:"#1a1a1a",fontFamily:"monospace",marginBottom:6}}>@Natinana111</div>
            <button onClick={()=>copy("@Natinana111",setTgCopied)} style={{background:tgCopied?"#6abf3a":"#f0f7ec",color:tgCopied?"#fff":"#2AABEE",border:"1.5px solid #bfdbfe",borderRadius:6,fontSize:10,fontWeight:700,padding:"4px 10px",cursor:"pointer",width:"100%"}}>
              {tgCopied?"✓ Copied":"📋 Copy"}
            </button>
          </div>

          {/* Phone */}
          <div style={{background:"#fff",border:"1.5px solid #d4edba",borderRadius:10,padding:"10px 10px",textAlign:"center"}}>
            <div style={{width:34,height:34,borderRadius:8,background:"#1a5c2a",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,margin:"0 auto 6px"}}>📞</div>
            <div style={{fontSize:10,fontWeight:700,color:"#1a5c2a",marginBottom:2}}>Phone</div>
            <div style={{fontSize:12,fontWeight:700,color:"#1a1a1a",fontFamily:"monospace",marginBottom:6}}>+251 937 066 660</div>
            <button onClick={()=>copy("+251937066660",setPhCopied)} style={{background:phCopied?"#6abf3a":"#f0f7ec",color:phCopied?"#fff":"#1a5c2a",border:"1.5px solid #cde8ba",borderRadius:6,fontSize:10,fontWeight:700,padding:"4px 10px",cursor:"pointer",width:"100%"}}>
              {phCopied?"✓ Copied":"📋 Copy"}
            </button>
          </div>
        </div>
        <p style={{fontSize:10,color:"#888",marginTop:6,textAlign:"center"}}>We're available 7 days a week 🌿</p>
      </div>
    </div>
  );
}

export default function Cart() {
  const [items, setItems] = useState([]);
  const [step, setStep] = useState(STEP_CART);
  const [submitting, setSubmitting] = useState(false);
  const [summary, setSummary] = useState(null);
  const [form, setForm] = useState({ name:"", phone:"", block:"" });
  const [errors, setErrors] = useState({});

  const load = () => {
    try {
      const cart = JSON.parse(localStorage.getItem("cart")||"[]");
      setItems(cart.map(i => ({...i, qty:Number(i.qty)>0?Number(i.qty):1})));
    } catch { setItems([]); }
  };

  useEffect(() => {
    load();
    window.addEventListener("cartUpdated", load);
    document.addEventListener("visibilitychange", load);
    return () => { window.removeEventListener("cartUpdated", load); document.removeEventListener("visibilitychange", load); };
  }, []);

  const save = updated => { setItems(updated); localStorage.setItem("cart", JSON.stringify(updated)); window.dispatchEvent(new Event("cartUpdated")); };
  const changeQty = (id,d) => save(items.map(i=>i._id===id?{...i,qty:(i.qty||1)+d}:i).filter(i=>i.qty>0));
  const remove = id => save(items.filter(i=>i._id!==id));
  const clear = () => { setItems([]); localStorage.removeItem("cart"); window.dispatchEvent(new Event("cartUpdated")); };

  const totalItems = items.reduce((s,i)=>s+(i.qty||1),0);
  const totalPrice = items.reduce((s,i)=>s+Number(i.price)*(i.qty||1),0);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name="Full name is required";
    if (!form.phone.trim()) e.phone="Phone number is required";
    else if (!/^[0-9+\s\-]{7,15}$/.test(form.phone.trim())) e.phone="Enter a valid phone number";
    if (!form.block.trim()) e.block="Block is required";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length>0) { setErrors(e); return; }
    setSubmitting(true);
    try {
      await axios.post(`${API}/api/orders`, { customer:{name:form.name.trim(),phone:form.phone.trim(),block:form.block.trim()}, items, totalPrice });
      setSummary({...form,totalPrice,totalItems});
      clear();
      setStep(STEP_SUCCESS);
    } catch { alert("Failed to place order. Please try again."); }
    finally { setSubmitting(false); }
  };

  const field = (label,key,placeholder,type="text") => (
    <div className="admin-field">
      <label className="form-label">{label} <span style={{color:"#e53e3e"}}>*</span></label>
      <input type={type} placeholder={placeholder} value={form[key]} className={`form-input${errors[key]?" err":""}`}
        onChange={e=>{setForm(p=>({...p,[key]:e.target.value}));if(errors[key])setErrors(p=>({...p,[key]:null}));}} />
      {errors[key]&&<div className="form-error">⚠ {errors[key]}</div>}
    </div>
  );

  if (step===STEP_SUCCESS&&summary) return (
    <>
      <Navbar />
      <div style={{background:"#f0f7ec",minHeight:"80vh",padding:"20px 12px"}}>
        <div className="success-wrap">
          <div className="success-check">✓</div>
          <h1 className="success-title">Order Accepted! 🎉</h1>
          <p className="success-sub">Thank you, <strong>{summary.name}</strong>!<br/>We'll call <strong>{summary.phone}</strong> to confirm delivery.</p>
          <div className="success-info">
            <div className="success-info-title">📋 Delivery Info</div>
            {[["👤 Name",summary.name],["📞 Phone",summary.phone],["🏘️ Block",`Block ${summary.block}`]].map(([l,v])=>(
              <div key={l} className="success-info-row"><span className="success-info-label">{l}</span><span className="success-info-val">{v}</span></div>
            ))}
            <div className="success-total">
              <span className="success-total-label">💰 Total</span>
              <span className="success-total-val">ETB {summary.totalPrice.toLocaleString()}</span>
            </div>
          </div>
          <PaySection total={summary.totalPrice} />
          <Link to="/" onClick={()=>setStep(STEP_CART)} className="success-continue-btn" style={{display:"block",marginTop:20}}>🛒 Continue Shopping</Link>
        </div>
      </div>
      <div className="nm-footer">🌿 Nova MiniMarket &nbsp;·&nbsp; <a href="https://t.me/Natinana111" style={{color:"#a8e6cf"}}>@Natinana111</a></div>
    </>
  );

  if (step===STEP_FORM) return (
    <>
      <Navbar />
      <div style={{background:"#f0f7ec",minHeight:"80vh",padding:"16px 12px"}}>
        <div style={{maxWidth:560,margin:"0 auto"}}>
          <button className="form-back-btn" onClick={()=>setStep(STEP_CART)}>← Back to cart</button>
          <div className="form-card">
            <div className="form-icon-wrap">📦</div>
            <h1 className="form-title">Delivery Details</h1>
            <p className="form-sub">Fill in your info so we can call you and deliver</p>
            <div className="form-mini-summary">
              <div className="form-mini-left">
                <p>{totalItems} item{totalItems!==1?"s":""}</p>
                <p>{items.slice(0,2).map(i=>`${i.name} ×${i.qty}`).join(", ")}{items.length>2?` +${items.length-2} more`:""}</p>
              </div>
              <div className="form-mini-price">ETB {totalPrice.toLocaleString()}</div>
            </div>
            {field("👤 Full Name","name","e.g. Abebe Girma")}
            {field("📞 Phone Number","phone","e.g. 0911 234 567","tel")}
            <div className="form-2col">
              <div>{field("🏘️ Block","block","e.g. B2")}</div>
              </div>
            </div>
            <button className="form-submit-btn" onClick={handleSubmit} disabled={submitting}>
              {submitting?"⏳ Placing order...":"✅ Place Order"}
            </button>
            <p className="form-note">🔒 Your info is only used for delivery. Free delivery 🌿</p>
          </div>
          <PaySection total={totalPrice} />
        </div>
      </div>
      <div className="nm-footer">🌿 Nova MiniMarket &nbsp;·&nbsp; <a href="https://t.me/Natinana111" style={{color:"#a8e6cf"}}>@Natinana111</a></div>
    </>
  );

  return (
    <>
      <Navbar />
      <div style={{background:"#f0f7ec",minHeight:"80vh",padding:"14px 12px"}}>
        <div className="cart-page">
          <div className="cart-header">
            <h1 className="cart-title">🛒 Cart {items.length>0&&<span style={{fontSize:14,fontWeight:400,color:"#888"}}>({totalItems})</span>}</h1>
            {items.length>0&&<button className="cart-clear-btn" onClick={clear}>🗑 Clear all</button>}
          </div>
          {items.length===0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <div className="cart-empty-title">Your cart is empty</div>
              <p className="cart-empty-sub">Add some products from the home page!</p>
              <Link to="/" className="cart-browse-btn">Browse Products</Link>
            </div>
          ) : (
            <>
              {items.map(item=>(
                <div key={item._id} className="cart-item">
                  <img src={item.image||"https://placehold.co/60x60?text=Item"} alt={item.name} className="cart-item-img" onError={e=>{e.target.src="https://placehold.co/60x60?text=Item";}} />
                  <div className="cart-item-info">
                    {item.category&&<div className="cart-item-cat">{item.category}</div>}
                    <div className="cart-item-name">{item.name}</div>
                    <div className="cart-item-price">ETB {Number(item.price).toLocaleString()} each</div>
                  </div>
                  <div className="cart-item-right">
                    <div className="cart-item-total">ETB {(Number(item.price)*(item.qty||1)).toLocaleString()}</div>
                    <div className="cart-qty">
                      <button className="cart-qty-btn" onClick={()=>changeQty(item._id,-1)}>−</button>
                      <span className="cart-qty-val">{item.qty||1}</span>
                      <button className="cart-qty-btn" onClick={()=>changeQty(item._id,+1)}>+</button>
                    </div>
                    <button className="cart-remove-btn" onClick={()=>remove(item._id)}>✕ Remove</button>
                  </div>
                </div>
              ))}
              <div className="cart-summary">
                <div className="cart-summary-title">📋 Order Summary</div>
                <div className="cart-summary-row"><span>Items ({totalItems})</span><span>ETB {totalPrice.toLocaleString()}</span></div>
                <div className="cart-summary-row"><span>Delivery</span><span style={{color:"#6abf3a",fontWeight:700}}>🎁 Free</span></div>
                <hr className="cart-summary-divider" />
                <div className="cart-summary-total">
                  <span className="cart-summary-total-label">Total</span>
                  <span className="cart-summary-total-val">ETB {totalPrice.toLocaleString()}</span>
                </div>
                <button className="cart-checkout-btn" onClick={()=>setStep(STEP_FORM)}>Enter Delivery Details →</button>
                <Link to="/" className="cart-continue">← Continue Shopping</Link>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="nm-footer">🌿 Nova Minimarket · © 2026 All rights reserved.</div>
    </>
  );
}