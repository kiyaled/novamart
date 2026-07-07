import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const API = "https://novamart-backend.vercel.app";
const STATUS = {
  pending:   { bg:"#fff7e0", color:"#b45309", label:"⏳ Pending" },
  confirmed: { bg:"#e0f0ff", color:"#1d4ed8", label:"📞 Confirmed" },
  delivered: { bg:"#e8f9ee", color:"#15803d", label:"✅ Delivered" },
  cancelled: { bg:"#fee2e2", color:"#991b1b", label:"❌ Cancelled" },
};
const EMPTY = { name:"", price:"", category:"", description:"", stock:"", image:"", discount:"" };

export default function Admin() {
  const [tab, setTab] = useState("products");

  // Products
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [pSearch, setPSearch] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  // Orders
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // Categories
  const [categories, setCategories] = useState([]);
  const [catsLoading, setCatsLoading] = useState(true);
  const [catForm, setCatForm] = useState({ name: "", subTags: "" });
  const [editCatId, setEditCatId] = useState(null);
  const [savingCat, setSavingCat] = useState(false);
  const [deletingCatId, setDeletingCatId] = useState(null);
  const [expandedCat, setExpandedCat] = useState(null);
  const [newSubTag, setNewSubTag] = useState("");

  useEffect(() => {
    if (tab === "orders") fetchOrders();
    if (tab === "products") fetchProducts();
    if (tab === "categories") fetchCategories();
  }, [tab]);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try { const r = await axios.get(`${API}/api/products`); setProducts(r.data); }
    catch(e) { console.error(e); }
    finally { setProductsLoading(false); }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    try { const r = await axios.get(`${API}/api/orders`); setOrders(r.data); }
    catch(e) { console.error(e); }
    finally { setOrdersLoading(false); }
  };

  const fetchCategories = async () => {
    setCatsLoading(true);
    try { const r = await axios.get(`${API}/api/categories`); setCategories(r.data); }
    catch(e) { console.error(e); }
    finally { setCatsLoading(false); }
  };

  // ── Image upload to Cloudinary ──
  const handleImagePick = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Show local preview immediately
    const localUrl = URL.createObjectURL(file);
    setImagePreview(localUrl);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("image", file);
      const res = await axios.post(`${API}/api/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm(p => ({ ...p, image: res.data.url }));
    } catch (err) {
      alert("Image upload failed. Please try again.");
      setImagePreview(null);
      setForm(p => ({ ...p, image: "" }));
    } finally {
      setUploading(false);
    }
  };

  // ── Product handlers ──
  const startEdit = p => {
    setEditId(p._id);
    setForm({ name:p.name||"", price:p.price||"", category:p.category||"", description:p.description||"", stock:p.stock??"", image:p.image||"", discount:p.discount||"" });
    setImagePreview(p.image || null);
    setTab("form");
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const handleSave = async () => {
    if (!form.name || !form.price) { alert("Name and price are required."); return; }
    if (uploading) { alert("Please wait for image to finish uploading."); return; }
    setSaving(true);
    try {
      const payload = { ...form, price:Number(form.price), stock:Number(form.stock)||0, discount:Number(form.discount)||0 };
      if (editId) {
        const r = await axios.put(`${API}/api/products/${editId}`, payload);
        setProducts(p => p.map(x => x._id===editId?r.data:x));
      } else {
        const r = await axios.post(`${API}/api/products`, payload);
        setProducts(p => [r.data,...p]);
      }
      setForm(EMPTY); setEditId(null); setImagePreview(null); setSaved(true);
      setTimeout(() => { setSaved(false); setTab("products"); }, 1500);
    } catch { alert("Failed to save product."); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    setDeletingId(id);
    try {
      await axios.delete(`${API}/api/products/${id}`);
      setProducts(p => p.filter(x => x._id!==id));
      if (editId===id) { setEditId(null); setForm(EMPTY); setImagePreview(null); }
    }
    catch { alert("Failed to delete."); }
    finally { setDeletingId(null); }
  };

  const updateStatus = async (id, status) => {
    try { await axios.patch(`${API}/api/orders/${id}/status`, { status }); setOrders(p => p.map(o => o._id===id?{...o,status}:o)); }
    catch { alert("Failed to update status"); }
  };

  // ── Category handlers ──
  const startEditCat = cat => {
    setEditCatId(cat._id);
    setCatForm({ name: cat.name, subTags: cat.subTags.join(", ") });
    setExpandedCat(null);
  };

  const cancelEditCat = () => { setEditCatId(null); setCatForm({ name: "", subTags: "" }); };

  const saveCat = async () => {
    if (!catForm.name.trim()) { alert("Category name is required."); return; }
    setSavingCat(true);
    try {
      const subTags = catForm.subTags.split(",").map(s => s.trim()).filter(Boolean);
      if (editCatId) {
        const r = await axios.put(`${API}/api/categories/${editCatId}`, { name: catForm.name.trim(), subTags });
        setCategories(p => p.map(c => c._id===editCatId ? r.data : c));
      } else {
        const r = await axios.post(`${API}/api/categories`, { name: catForm.name.trim(), subTags });
        setCategories(p => [...p, r.data]);
      }
      setCatForm({ name: "", subTags: "" }); setEditCatId(null);
    } catch { alert("Failed to save category."); }
    finally { setSavingCat(false); }
  };

  const deleteCat = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"?`)) return;
    setDeletingCatId(id);
    try { await axios.delete(`${API}/api/categories/${id}`); setCategories(p => p.filter(c => c._id!==id)); }
    catch { alert("Failed to delete category."); }
    finally { setDeletingCatId(null); }
  };

  const addSubTag = async (cat) => {
    if (!newSubTag.trim()) return;
    const subTags = [...cat.subTags, newSubTag.trim()];
    try {
      const r = await axios.put(`${API}/api/categories/${cat._id}`, { name: cat.name, subTags });
      setCategories(p => p.map(c => c._id===cat._id ? r.data : c));
      setNewSubTag("");
    } catch { alert("Failed to add sub-tag."); }
  };

  const removeSubTag = async (cat, tag) => {
    const subTags = cat.subTags.filter(t => t !== tag);
    try {
      const r = await axios.put(`${API}/api/categories/${cat._id}`, { name: cat.name, subTags });
      setCategories(p => p.map(c => c._id===cat._id ? r.data : c));
    } catch { alert("Failed to remove sub-tag."); }
  };

  const fp = products.filter(p =>
    (p.name||"").toLowerCase().includes(pSearch.toLowerCase()) ||
    (p.category||"").toLowerCase().includes(pSearch.toLowerCase())
  );

  const tabBtn = (key, label) => (
    <button className={`admin-tab${tab===key?" on":""}`} onClick={() => setTab(key)}>{label}</button>
  );

  return (
    <>
      <Navbar />
      <div className="admin-page">
        <h1 className="admin-h1">🌿 Admin Dashboard</h1>
        <p className="admin-sub">Manage products, categories and orders</p>

        <div className="admin-tabs">
          {tabBtn("products", `📦 Products${products.length>0?` (${products.length})`:""}`)}
          {tabBtn("form", editId ? "✏️ Edit" : "➕ Add Product")}
          {tabBtn("categories", `🏷️ Categories${categories.length>0?` (${categories.length})`:""}`)}
          {tabBtn("orders", `📋 Orders${orders.length>0?` (${orders.length})`:""}`)}
        </div>

        {/* ── PRODUCTS LIST ── */}
        {tab === "products" && (
          <div>
            <div className="admin-search">
              <span className="admin-search-icon">🔍</span>
              <input type="text" placeholder="Search products..." value={pSearch} onChange={e=>setPSearch(e.target.value)} className="admin-search-input" />
            </div>
            {productsLoading ? <p style={{color:"#888",textAlign:"center",padding:"2rem"}}>Loading...</p> :
             fp.length === 0 ? <p style={{color:"#aaa",textAlign:"center",padding:"2rem"}}>No products found.</p> :
             fp.map(p => (
              <div key={p._id} className="admin-product-row">
                <img src={p.image||"https://placehold.co/52x52?text=Item"} alt={p.name} className="admin-product-img" onError={e=>{e.target.src="https://placehold.co/52x52?text=Item";}} />
                <div className="admin-product-info">
                  <div className="admin-product-name">{p.name}</div>
                  <div className="admin-product-meta">{p.category} · ETB {Number(p.price).toLocaleString()} · Stock: {p.stock??0}</div>
                  <div className="admin-product-badges">
                    {p.discount>0 && <span className="admin-badge disc">-{p.discount}%</span>}
                    {p.stock===0 && <span className="admin-badge out">Out of stock</span>}
                  </div>
                </div>
                <div className="admin-product-actions">
                  <button className="admin-edit-btn" onClick={()=>startEdit(p)}>✏️</button>
                  <button className="admin-del-btn" onClick={()=>handleDelete(p._id,p.name)} disabled={deletingId===p._id}>
                    {deletingId===p._id?"...":"🗑"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── ADD/EDIT PRODUCT ── */}
        {tab === "form" && (
          <div>
            <div className="admin-form-header">
              <h2 className="admin-form-title">{editId?"✏️ Edit Product":"➕ Add Product"}</h2>
              {editId && <button className="admin-cancel-btn" onClick={()=>{setEditId(null);setForm(EMPTY);setImagePreview(null);setTab("products");}}>✕ Cancel</button>}
            </div>

            {/* Image upload */}
            <div className="admin-field">
              <label>Product Image</label>
              <div
                onClick={() => !uploading && fileRef.current.click()}
                style={{
                  border: "2px dashed #cde8ba",
                  borderRadius: 12,
                  padding: "16px",
                  textAlign: "center",
                  cursor: uploading ? "wait" : "pointer",
                  background: "#f9fef7",
                  marginBottom: 4,
                  transition: "border-color .2s",
                }}
              >
                {uploading ? (
                  <div>
                    <div style={{fontSize:32,marginBottom:8}}>⏳</div>
                    <p style={{fontSize:13,fontWeight:600,color:"#1a5c2a"}}>Uploading image...</p>
                    <p style={{fontSize:11,color:"#888"}}>Please wait</p>
                  </div>
                ) : imagePreview ? (
                  <div>
                    <img src={imagePreview} alt="Preview" style={{width:"100%",maxHeight:200,objectFit:"cover",borderRadius:8,marginBottom:8}} />
                    <p style={{fontSize:12,color:"#888"}}>Tap to change image</p>
                  </div>
                ) : (
                  <div>
                    <div style={{fontSize:40,marginBottom:8}}>📸</div>
                    <p style={{fontSize:13,fontWeight:600,color:"#1a5c2a"}}>Tap to upload image</p>
                    <p style={{fontSize:11,color:"#888"}}>From your phone or computer</p>
                  </div>
                )}
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={handleImagePick} />
              {imagePreview && !uploading && (
                <button
                  onClick={() => { setImagePreview(null); setForm(p=>({...p,image:""})); }}
                  style={{fontSize:11,color:"#cc3333",background:"none",border:"none",cursor:"pointer",padding:0,marginTop:4}}
                >
                  ✕ Remove image
                </button>
              )}
            </div>

            {[
              ["Product Name","name","e.g. Fresh Milk 1L","text"],
              ["Price (ETB)","price","e.g. 120","number"],
              ["Category","category","e.g. Dairy","text"],
              ["Description","description","Short description...","text"],
              ["Stock Quantity","stock","e.g. 50","number"],
            ].map(([l,k,ph,t])=>(
              <div key={k} className="admin-field">
                <label>{l}</label>
                <input type={t} placeholder={ph} value={form[k]} onChange={e=>setForm(p=>({...p,[k]:e.target.value}))} />
              </div>
            ))}

            <div className="admin-discount-field">
              <label className="admin-discount-label">🔥 Discount % (optional)</label>
              <input type="number" placeholder="e.g. 20 means 20% off" value={form.discount} min="0" max="90" onChange={e=>setForm(p=>({...p,discount:e.target.value}))} className="admin-discount-input" />
              {form.discount>0 && form.price && (
                <div className="admin-discount-preview">
                  Customers see: <s>ETB {Number(form.price).toLocaleString()}</s> → <strong>ETB {Math.round(form.price-form.price*form.discount/100).toLocaleString()}</strong>
                </div>
              )}
            </div>

            <button
              className={`admin-save-btn${saved?" saved":""}`}
              onClick={handleSave}
              disabled={saving || uploading}
            >
              {saved?"✓ Saved!":saving?"Saving...":uploading?"Uploading image...":editId?"Update Product":"Add Product"}
            </button>
          </div>
        )}

        {/* ── CATEGORIES ── */}
        {tab === "categories" && (
          <div>
            <div style={{background:"#fff",border:"1.5px solid #cde8ba",borderRadius:12,padding:"14px",marginBottom:16}}>
              <h3 style={{fontSize:14,fontWeight:700,color:"#1a5c2a",marginBottom:12}}>
                {editCatId ? "✏️ Edit Category" : "➕ Add New Category"}
              </h3>
              <div className="admin-field">
                <label>Category Name</label>
                <input type="text" placeholder="e.g. Dairy" value={catForm.name} onChange={e=>setCatForm(p=>({...p,name:e.target.value}))} />
              </div>
              <div className="admin-field">
                <label>Sub-tags (comma separated)</label>
                <input type="text" placeholder="e.g. Fresh Milk, Cheese, Yogurt" value={catForm.subTags} onChange={e=>setCatForm(p=>({...p,subTags:e.target.value}))} />
                <p style={{fontSize:11,color:"#888",marginTop:4}}>Separate each type with a comma</p>
              </div>
              <div style={{display:"flex",gap:8}}>
                <button className="admin-save-btn" style={{flex:1}} onClick={saveCat} disabled={savingCat}>
                  {savingCat?"Saving...":editCatId?"Update Category":"Add Category"}
                </button>
                {editCatId && <button className="admin-cancel-btn" onClick={cancelEditCat}>✕ Cancel</button>}
              </div>
            </div>

            {catsLoading ? (
              <p style={{color:"#888",textAlign:"center",padding:"2rem"}}>Loading categories...</p>
            ) : categories.length === 0 ? (
              <div style={{textAlign:"center",padding:"2rem",color:"#aaa"}}>
                <p style={{fontSize:32,marginBottom:8}}>🏷️</p>
                <p>No categories yet. Add one above!</p>
              </div>
            ) : categories.map(cat => (
              <div key={cat._id} style={{background:"#fff",border:"1px solid #d4edba",borderRadius:12,marginBottom:8,overflow:"hidden"}}>
                <div style={{padding:"12px 14px",display:"flex",alignItems:"center",gap:10}}>
                  <div style={{flex:1}}>
                    <p style={{fontSize:14,fontWeight:700,color:"#1a5c2a",margin:0}}>{cat.name}</p>
                    <p style={{fontSize:11,color:"#888",margin:"2px 0 0"}}>
                      {cat.subTags.length} sub-tag{cat.subTags.length!==1?"s":""}: {cat.subTags.slice(0,3).join(", ")}{cat.subTags.length>3?"...":""}
                    </p>
                  </div>
                  <button onClick={()=>setExpandedCat(expandedCat===cat._id?null:cat._id)} style={{background:"none",border:"1.5px solid #cde8ba",borderRadius:7,padding:"5px 10px",fontSize:11,color:"#1a5c2a",cursor:"pointer",fontWeight:600,flexShrink:0}}>
                    {expandedCat===cat._id?"▲":"▼ Types"}
                  </button>
                  <button className="admin-edit-btn" onClick={()=>startEditCat(cat)}>✏️</button>
                  <button className="admin-del-btn" onClick={()=>deleteCat(cat._id,cat.name)} disabled={deletingCatId===cat._id}>
                    {deletingCatId===cat._id?"...":"🗑"}
                  </button>
                </div>

                {expandedCat===cat._id && (
                  <div style={{borderTop:"1px solid #eef7e8",padding:"12px 14px",background:"#fafef7"}}>
                    <p style={{fontSize:11,fontWeight:700,color:"#1a5c2a",textTransform:"uppercase",letterSpacing:".05em",marginBottom:8}}>Sub-tags</p>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:10}}>
                      {cat.subTags.length === 0 ? (
                        <p style={{fontSize:12,color:"#aaa"}}>No sub-tags yet.</p>
                      ) : cat.subTags.map(tag => (
                        <span key={tag} style={{display:"inline-flex",alignItems:"center",gap:4,background:"#f0f7ec",border:"1px solid #cde8ba",borderRadius:999,padding:"3px 10px",fontSize:12,color:"#1a5c2a"}}>
                          {tag}
                          <button onClick={()=>removeSubTag(cat,tag)} style={{background:"none",border:"none",cursor:"pointer",color:"#cc3333",fontSize:14,lineHeight:1,padding:0,marginLeft:2,fontWeight:700}}>×</button>
                        </span>
                      ))}
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <input
                        type="text"
                        placeholder="Add new type e.g. Butter"
                        value={newSubTag}
                        onChange={e=>setNewSubTag(e.target.value)}
                        onKeyDown={e=>e.key==="Enter"&&addSubTag(cat)}
                        style={{flex:1,padding:"8px 10px",fontSize:13,border:"1.5px solid #cde8ba",borderRadius:8,outline:"none",fontFamily:"inherit"}}
                      />
                      <button onClick={()=>addSubTag(cat)} style={{padding:"8px 14px",background:"#1a5c2a",color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer"}}>
                        + Add
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── ORDERS ── */}
        {tab === "orders" && (
          <div>
            <div className="admin-orders-header">
              <span className="admin-orders-count">{orders.length} order{orders.length!==1?"s":""}</span>
              <button className="admin-refresh-btn" onClick={fetchOrders}>🔄 Refresh</button>
            </div>
            {ordersLoading ? <p style={{color:"#888",textAlign:"center",padding:"2rem"}}>Loading...</p> :
             orders.length===0 ? (
              <div style={{textAlign:"center",padding:"3rem 0",color:"#aaa"}}>
                <div style={{fontSize:40,marginBottom:10}}>📭</div>
                <p>No orders yet.</p>
              </div>
            ) : orders.map(order => {
              const st = STATUS[order.status]||STATUS.pending;
              const exp = expandedOrder===order._id;
              return (
                <div key={order._id} className="admin-order-card">
                  <div className="admin-order-header" onClick={()=>setExpandedOrder(exp?null:order._id)}>
                    <div className="admin-order-info">
                      <div className="admin-order-name">{order.customer.name}</div>
                      <div className="admin-order-contact">📞 {order.customer.phone} · 🏠 Block {order.customer.block}, House {order.customer.houseNumber}</div>
                      <div className="admin-order-date">{new Date(order.createdAt).toLocaleString()}</div>
                      <span className="admin-status-badge" style={{background:st.bg,color:st.color}}>{st.label}</span>
                    </div>
                    <div className="admin-order-right">
                      <div className="admin-order-total">ETB {Number(order.totalPrice).toLocaleString()}</div>
                      <div className="admin-order-items-count">{order.items.reduce((s,i)=>s+(i.qty||1),0)} items {exp?"▲":"▼"}</div>
                    </div>
                  </div>
                  {exp && (
                    <div className="admin-order-body">
                      <div className="admin-order-items-label">Items Ordered</div>
                      {order.items.map((item,i)=>(
                        <div key={i} className="admin-order-item">
                          <div className="admin-order-item-left">
                            <img src={item.image||"https://placehold.co/36x36?text=Item"} alt={item.name} className="admin-order-item-img" onError={e=>{e.target.src="https://placehold.co/36x36?text=Item";}} />
                            <span className="admin-order-item-name">{item.name} <span style={{color:"#aaa"}}>x{item.qty||1}</span></span>
                          </div>
                          <span className="admin-order-item-price">ETB {(Number(item.price)*(item.qty||1)).toLocaleString()}</span>
                        </div>
                      ))}
                      <div className="admin-status-label">Update Status</div>
                      <div className="admin-status-btns">
                        {Object.entries(STATUS).map(([k,v])=>(
                          <button key={k} className={`admin-status-btn${order.status===k?" on":""}`} onClick={()=>updateStatus(order._id,k)}>{v.label}</button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <div className="nm-footer">🌿 Nova Milk &amp; Mart — Fresh Milk. Quality Products. Better Life.</div>
    </>
  );
}