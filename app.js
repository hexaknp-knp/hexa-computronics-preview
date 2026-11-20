// ==========================================
// SHIPPING SETTINGS (Yahan se kabhi bhi change karein)
// ==========================================
const SHIPPING_CONFIG = {
  FREE_SHIPPING_THRESHOLD: 2500, // ₹2,500 ya usse upar ki shopping par FREE shipping (band karna ho toh 0 karein)
  DEFAULT_PRODUCT_SHIPPING: 80,  // Agar kisi product me admin se shipping 0 chhodi ho (aur Free tick na ho)
  ZONE_UP_EXTRA: 0,              // UP / Kanpur (PIN 20-28) extra distance charge
  ZONE_NATIONAL_EXTRA: 40,       // Rest of India extra distance charge
  ZONE_REMOTE_EXTRA: 80          // J&K, North-East, Islands (PIN 18,19,74,78,79) extra charge
};

let products=[
{id:1,name:'Lenovo IdeaPad Slim 3',cat:'Laptops',price:42999,shipping:0,freeShipping:true,spec:'Core i5 · 16GB RAM · 512GB SSD',tag:'Popular',img:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=82'},
{id:2,name:'HP ProBook Business Laptop',cat:'Laptops',price:58999,shipping:0,freeShipping:true,spec:'Core i5 · 16GB RAM · 512GB SSD',tag:'Business pick',img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=82'},
{id:3,name:'Custom Gaming Desktop',cat:'Desktops & Gaming',price:74999,shipping:250,freeShipping:false,spec:'Ryzen 5 · 16GB RAM · Gaming build',tag:'Performance',img:'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=700&q=82'},
{id:4,name:'24-inch Full HD Monitor',cat:'Monitors',price:8999,shipping:150,freeShipping:false,spec:'IPS · 100Hz · HDMI',tag:'Everyday essential',img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=82'},
{id:5,name:'Dual Band Wi-Fi Router',cat:'Networking',price:2499,shipping:80,freeShipping:false,spec:'Dual band · Gigabit ports',tag:'Connectivity',img:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=700&q=82'},
{id:6,name:'4-Channel CCTV Kit',cat:'CCTV & Security',price:12499,shipping:180,freeShipping:false,spec:'4 cameras · DVR bundle',tag:'Security',img:'cctv-security.svg'},
{id:7,name:'Refurbished Business Laptop',cat:'Refurbished',price:18999,shipping:0,freeShipping:true,spec:'Core i5 · 8GB RAM · SSD',tag:'Value choice',img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=82'},
{id:8,name:'Wireless Keyboard & Mouse',cat:'Accessories',price:1,shipping:60,freeShipping:false,spec:'Wireless combo · USB receiver',tag:'Essential',img:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=82'},
{id:9,name:'Office Desktop Computer',cat:'Desktops & Gaming',price:28999,shipping:200,freeShipping:false,spec:'Core i3 · 8GB RAM · 512GB SSD',tag:'Office ready',img:'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=700&q=82'},
{id:10,name:'Gigabit Network Switch',cat:'Networking',price:1899,shipping:80,freeShipping:false,spec:'8-port · Gigabit Ethernet',tag:'Network essential',img:'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=82'},
{id:11,name:'USB-C Multiport Hub',cat:'Accessories',price:1799,shipping:60,freeShipping:false,spec:'HDMI · USB 3.0 · PD',tag:'On the go',img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=700&q=82'},
{id:12,name:'Refurbished Desktop PC',cat:'Refurbished',price:13999,shipping:200,freeShipping:false,spec:'Core i5 · 8GB RAM · SSD',tag:'Value choice',img:'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=700&q=82'}
];
let activeCategory='All',cart={};
const $=s=>document.querySelector(s),money=n=>'₹'+Math.round(Number(n||0)).toLocaleString('en-IN');

// SMART SHIPPING CALCULATOR (Weight/Item + Distance PIN + Free Threshold)
function calculateCartTotals() {
  const rows = Object.entries(cart).filter(([id]) => products.some(p => String(p.id) === String(id)));
  if (!rows.length) {
    return { rows, count: 0, subtotal: 0, baseShipping: 0, zoneCharge: 0, totalShipping: 0, grandTotal: 0, isFree: false, freeReason: '', zoneLabel: '', remainingForFree: SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD };
  }

  let count = 0, subtotal = 0, baseShipping = 0, allFreeItems = true;
  rows.forEach(([id, q]) => {
    const p = products.find(x => String(x.id) === String(id));
    if (!p) return;
    count += q;
    subtotal += Number(p.price || 0) * q;
    if (p.freeShipping) {
      baseShipping += 0;
    } else {
      allFreeItems = false;
      const itemShip = Number(p.shipping) > 0 ? Number(p.shipping) : SHIPPING_CONFIG.DEFAULT_PRODUCT_SHIPPING;
      baseShipping += itemShip * q;
    }
  });

  const pinRaw = ($('#cPin')?.value || '').replace(/\D/g, '');
  let zoneCharge = 0;
  let zoneLabel = 'Standard rate (enter 6-digit PIN for distance rate)';
  if (pinRaw.length === 6) {
    const p2 = Number(pinRaw.slice(0, 2));
    if (p2 >= 20 && p2 <= 28) {
      zoneCharge = SHIPPING_CONFIG.ZONE_UP_EXTRA;
      zoneLabel = 'UP / Local Delivery Zone';
    } else if ([18, 19, 74, 78, 79].includes(p2)) {
      zoneCharge = SHIPPING_CONFIG.ZONE_REMOTE_EXTRA;
      zoneLabel = 'Remote / NE / J&K Zone (+₹' + SHIPPING_CONFIG.ZONE_REMOTE_EXTRA + ')';
    } else {
      zoneCharge = SHIPPING_CONFIG.ZONE_NATIONAL_EXTRA;
      zoneLabel = 'All-India Delivery Zone (+₹' + SHIPPING_CONFIG.ZONE_NATIONAL_EXTRA + ')';
    }
  }

  let isFree = false;
  let freeReason = '';
  if (allFreeItems) {
    isFree = true;
    freeReason = 'Free Shipping on selected item(s)';
  } else if (SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD > 0 && subtotal >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) {
    isFree = true;
    freeReason = `FREE Delivery unlocked (Order ≥ ${money(SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD)})`; }  const totalShipping = isFree ? 0 : (baseShipping + zoneCharge); const grandTotal = Math.round(subtotal + totalShipping); const remainingForFree = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD > 0 ? Math.max(0, SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal) : 0;  return { rows, count, subtotal, baseShipping, zoneCharge, totalShipping, grandTotal, isFree, freeReason, zoneLabel, remainingForFree }; }  function renderProducts(){ const query=$('#productSearch').value.trim().toLowerCase(); let list=products.filter(p=>(activeCategory==='All'\vert{}\vert{}p.cat===activeCategory)&&(`${p.name} ${p.cat}${p.spec}`).toLowerCase().includes(query));
 const sort=$('#sortProducts').value;
 if(sort==='low')list.sort((a,b)=>a.price-b.price);
 if(sort==='high')list.sort((a,b)=>b.price-a.price);
 
 $('#productGrid').innerHTML=list.map(p=>{
  const shipBadge=p.freeShipping?'<span style="display:inline-block;margin-top:4px;font-size:11px;font-weight:700;color:#15803d;background:#dcfce7;padding:2px 8px;border-radius:999px;">Free Shipping</span>':'';
  return `<article class="product-card" onclick="openProductModal('${p.id}')" style="cursor:pointer;">
    <div class="product-image">
      <img loading="lazy" src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.src='technology-placeholder.svg';this.alt='Technology product placeholder'">
      <span class="product-tag">${p.tag}</span>
    </div>
    <div class="product-info">
      <span class="product-category">${p.cat}</span>
      <h3>${p.name}</h3>
      <p class="product-spec">${p.spec}</p>${shipBadge}
      <div class="product-bottom">
        <b class="product-price">${money(p.price)}</b>
        <button class="add-button text-btn" aria-label="View details">View Details</button>
      </div>
    </div>
  </article>`;
 }).join('')||'<p class="no-results">No matching products. Try another search or category.</p>';
}
function setCategory(cat){activeCategory=cat;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter===cat));renderProducts();}
function addToCart(id){cart[id]=(cart[id]||0)+1;renderCart();showToast('Added to your bag');}
function changeQty(id,delta){cart[id]=(cart[id]||0)+delta;if(cart[id]<=0)delete cart[id];renderCart();}
function renderCart(){
 const calc = calculateCartTotals();
 $('#cartCount').textContent = calc.count;
 $('#drawerCount').textContent = `(${calc.count})`;
 $('#cartSubtotal').textContent = money(calc.grandTotal);

 if (!calc.rows.length) {
   $('#cartItems').innerHTML = '<p class="empty-cart">Your bag is waiting for something great.</p>';
   return;
 }

 const itemsHtml = calc.rows.map(([id,q])=>{
   const p = products.find(x => String(x.id) === String(id));
   const shipTag = p.freeShipping
     ? '<span style="color:#15803d;font-weight:600;"> · Free Ship</span>'
     : `<span style="color:#64748b;"> · Ship ${money(Number(p.shipping) > 0 ? p.shipping : SHIPPING_CONFIG.DEFAULT_PRODUCT_SHIPPING)}/unit</span>`;
   return `<div class="cart-line"><div><b>${p.name}</b><small>${money(p.price)} each${shipTag}</small><div class="qty-controls"><button onclick="changeQty('${id}',-1)">−</button><span>${q}</span><button onclick="changeQty('${id}',1)">+</button></div></div><b>${money(p.price*q)}</b></div>`;
 }).join('');

 const freeBanner = calc.isFree
   ? `<div style="margin-top:12px;padding:9px 12px;border-radius:8px;background:#ecfdf5;border:1px solid #86efac;color:#166534;font-size:12.5px;font-weight:600;">✓ ${calc.freeReason}</div>`
   : (calc.remainingForFree > 0
       ? `<div style="margin-top:12px;padding:9px 12px;border-radius:8px;background:#eff6ff;border:1px solid #bfdbfe;color:#1e40af;font-size:12.5px;font-weight:600;">Add <b>${money(calc.remainingForFree)}</b> more for FREE Shipping!</div>`
       : '');

 const summaryHtml = `
   ${freeBanner}
   <div style="margin-top:10px;padding:12px;border-radius:10px;background:#f8fafc;border:1px solid #e2e8f0;font-size:13px;line-height:1.7;">
     <div style="display:flex;justify-content:space-between;"><span>Items Subtotal</span><b>${money(calc.subtotal)}</b></div>
     <div style="display:flex;justify-content:space-between;">
       <span>Shipping</span>
       <b style="color:${calc.isFree ? '#15803d' : '#0f172a
