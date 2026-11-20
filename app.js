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

  const pinEl = $('#cPin');
  const pinRaw = (pinEl ? pinEl.value : '').replace(/\D/g, '');
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
    freeReason = 'FREE Delivery unlocked (Order ' + money(SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD) + '+)';
  }

  const totalShipping = isFree ? 0 : (baseShipping + zoneCharge);
  const grandTotal = Math.round(subtotal + totalShipping);
  const remainingForFree = SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD > 0
    ? Math.max(0, SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD - subtotal)
    : 0;

  return { rows, count, subtotal, baseShipping, zoneCharge, totalShipping, grandTotal, isFree, freeReason, zoneLabel, remainingForFree };
}

function renderProducts(){
 const query=$('#productSearch').value.trim().toLowerCase();
 let list=products.filter(p=>(activeCategory==='All'||p.cat===activeCategory)&&(`${p.name} ${p.cat} ${p.spec}`).toLowerCase().includes(query));
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
      <p class="product-spec">${p.spec}</p>
      ${shipBadge}
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
       <b style="color:${calc.isFree ? '#15803d' : '#0f172a'};">${calc.isFree ? 'FREE' : money(calc.totalShipping)}</b>
     </div>
     ${!calc.isFree ? `<div style="font-size:11.5px;color:#64748b;">${calc.zoneLabel}</div>` : ''}
   </div>`;

 $('#cartItems').innerHTML = itemsHtml + summaryHtml;
}
function openCart(){$('#cartDrawer').classList.add('open');$('#overlay').classList.add('show');document.body.style.overflow='hidden';}
function closeCart(){$('#cartDrawer').classList.remove('open');$('#overlay').classList.remove('show');document.body.style.overflow='';}
function showToast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(window.toastTimer);window.toastTimer=setTimeout(()=>t.classList.remove('show'),2300);}
$('#filterRow').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(b)setCategory(b.dataset.filter);});
document.querySelectorAll('.category-card').forEach(a=>a.addEventListener('click',()=>setCategory(a.dataset.category)));
$('#productSearch').addEventListener('input',renderProducts);$('#sortProducts').addEventListener('change',renderProducts);
$('#searchJump').addEventListener('click',()=>{$('#shop').scrollIntoView({behavior:'smooth'});setTimeout(()=>$('#productSearch').focus(),450);});
$('#cartOpen').addEventListener('click',openCart);$('#cartClose').addEventListener('click',closeCart);$('#overlay').addEventListener('click',closeCart);
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeCart();});
if($('#cPin'))$('#cPin').addEventListener('input', renderCart);

// RAZORPAY CHECKOUT
$('#demoCheckout').addEventListener('click', async () => {
  if (!Object.keys(cart).length) return showToast('Your bag is empty');

  const checkoutForm = $('#checkoutForm');
  if (checkoutForm.style.display === 'none') {
    checkoutForm.style.display = 'flex';
    $('#demoCheckout').innerHTML = 'Proceed to Pay <span>↗</span>';
    return; 
  }

  const cName = $('#cName').value.trim();
  const cPhone = $('#cPhone').value.trim();
  const cEmail = $('#cEmail').value.trim();
  const cAddress = $('#cAddress').value.trim();
  const cPin = $('#cPin').value.trim();

  if(!cName || !cPhone || !cEmail || !cAddress || !cPin) {
    return showToast('Please fill all delivery details');
  }

  const btn = $('#demoCheckout');
  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = 'Opening Razorpay...';

  try {
    const calc = calculateCartTotals();
    const totalAmount = calc.grandTotal;
    const cleanPhone = cPhone.replace(/\D/g, '');

    const options = {
      key: window.RAZORPAY_KEY_ID, 
      amount: totalAmount * 100, 
      currency: "INR",
      name: 'Hexa Computronics',
      description: 'IT Hardware & Solutions',
      prefill: { name: cName, email: cEmail, contact: cleanPhone },
      handler: async function (res) {
        showToast('Saving your order...');
        try {
          const sb = window.supabase.createClient(window.HEXA_SUPABASE_URL, window.HEXA_SUPABASE_ANON_KEY);
          await sb.from('orders').insert([{
            razorpay_payment_id: res.razorpay_payment_id,
            customer_name: cName,
            customer_phone: cleanPhone,
            customer_email: cEmail,
            delivery_address: cAddress,
            pincode: cPin,
            amount: totalAmount,
            status: 'paid',
            items: cart
          }]);

          let itemsText = Object.entries(cart).map(([id, q]) => {
            let p = products.find(x => String(x.id) === String(id));
            return `${p.name} (Qty: ${q}) = ₹${p.price * q}`;
          }).join('\n');

          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
            body: JSON.stringify({
              access_key: '86a543d1-069e-4187-b2e1-f43488b49ca7',
              subject: `🎉 New Online Order from ${cName} (₹${totalAmount})`,
              from_name: 'Hexa Computronics Orders',
              email: cEmail,
              message: `New Order Received!\n\nCustomer Details:\nName: ${cName}\nPhone: ${cleanPhone}\nEmail: ${cEmail}\nAddress: ${cAddress} - ${cPin}\nPayment ID: ${res.razorpay_payment_id}\n\nItems Ordered:\n${itemsText}\n\nSubtotal: ₹${calc.subtotal}\nShipping: ${calc.isFree ? 'FREE' : '₹' + calc.totalShipping + ' (' + calc.zoneLabel + ')'}\nTotal Paid: ₹${totalAmount}`
            })
          });

          try {
            await fetch(`${window.HEXA_SUPABASE_URL}/functions/v1/send-receipt`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.HEXA_SUPABASE_ANON_KEY}` },
              body: JSON.stringify({ email: cEmail, name: cName, amount: totalAmount, orderId: res.razorpay_payment_id, items: itemsText })
            });
          } catch (e) {}

          let successImages = Object.keys(cart).map(id => {
            let p = products.find(x => String(x.id) === String(id));
            const imgUrl = p.img || p.image_url || 'cctv-security.svg';
            return `<img src="${imgUrl}" alt="${p.name}">`;
          }).join('');
          $('#successItems').innerHTML = successImages;
          
          $('#successOverlay').querySelector('h2').innerText = "Thank you for your order!";
          $('#successOverlay').querySelector('p').innerText = "Your payment was successful and the receipt has been sent to your email. We will begin processing your order shortly.";
          $('#successOverlay').classList.add('show');
          
        } catch (e) { console.error('Order save error:', e); }
        
        cart = {}; renderCart();
        $('#checkoutForm').style.display = 'none'; 
        $('#cName').value=''; $('#cPhone').value=''; $('#cEmail').value=''; $('#cAddress').value=''; $('#cPin').value='';
        $('#demoCheckout').innerHTML = 'Pay Online';
        closeCart();
      },
      theme: { color: '#0f172a' }
    };

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (res) { showToast('Payment failed: ' + res.error.description); });
    rzp.open();
    
  } catch (err) {
    console.error(err); showToast('Checkout error: ' + err.message);
  } finally {
    btn.disabled = false; btn.innerHTML = originalText;
  }
});

// COD (CASH ON DELIVERY) CHECKOUT LOGIC
$('#codCheckout').addEventListener('click', async () => {
  if (!Object.keys(cart).length) return showToast('Your bag is empty');

  const checkoutForm = $('#checkoutForm');
  if (checkoutForm.style.display === 'none') {
    checkoutForm.style.display = 'flex';
    $('#codCheckout').innerHTML = 'Confirm COD Order <span>✓</span>';
    
    const codTerms = $('#codTermsText');
    if(codTerms) {
       codTerms.innerText = "All India COD Available! A fully adjustable advance of ₹500 is required to process the order. Details will be shared post-confirmation.";
       codTerms.style.display = 'block';
    }
    return; 
  }

  const cName = $('#cName').value.trim();
  const cPhone = $('#cPhone').value.trim();
  const cEmail = $('#cEmail').value.trim();
  const cAddress = $('#cAddress').value.trim();
  const cPin = $('#cPin').value.trim();

  if(!cName || !cPhone || !cEmail || !cAddress || !cPin) {
    return showToast('Please fill all delivery details');
  }

  const btn = $('#codCheckout');
  btn.disabled = true;
  btn.innerHTML = 'Processing...';
  $('#demoCheckout').disabled = true;

  try {
    const calc = calculateCartTotals();
    const totalAmount = calc.grandTotal;
    const cleanPhone = cPhone.replace(/\D/g, '');
    const codOrderId = 'COD_' + Date.now();

    showToast('Saving your COD request...');
    
    const sb = window.supabase.createClient(window.HEXA_SUPABASE_URL, window.HEXA_SUPABASE_ANON_KEY);
    await sb.from('orders').insert([{
      razorpay_payment_id: codOrderId,
      customer_name: cName,
      customer_phone: cleanPhone,
      customer_email: cEmail,
      delivery_address: cAddress,
      pincode: cPin,
      amount: totalAmount,
      status: 'cod_pending',
      items: cart
    }]);

    let itemsText = Object.entries(cart).map(([id, q]) => {
      let p = products.find(x => String(x.id) === String(id));
      return `${p.name} (Qty: ${q}) = ₹${p.price * q}`;
    }).join('\n');

    await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: '86a543d1-069e-4187-b2e1-f43488b49ca7',
        subject: `📦 Action Required: Collect ₹500 Advance for COD Order (${cName})`,
        from_name: 'Hexa Computronics Orders',
        email: cEmail,
        message: `New COD Request Received!\n\nCustomer Details:\nName: ${cName}\nPhone: ${cleanPhone}\nEmail: ${cEmail}\nAddress: ${cAddress} - ${cPin}\nOrder ID: ${codOrderId}\n\nItems Ordered:\n${itemsText}\n\nSubtotal: ₹${calc.subtotal}\nShipping: ${calc.isFree ? 'FREE' : '₹' + calc.totalShipping + ' (' + calc.zoneLabel + ')'}\nTotal Bill: ₹${totalAmount}\n\n📌 ACTION REQUIRED: Please contact the customer on WhatsApp to collect the ₹500 advance payment to confirm and process this order.`
      })
    });

    let successImages = Object.keys(cart).map(id => {
      let p = products.find(x => String(x.id) === String(id));
      const imgUrl = p.img || p.image_url || 'cctv-security.svg';
      return `<img src="${imgUrl}" alt="${p.name}">`;
    }).join('');
    
    $('#successItems').innerHTML = successImages;
    $('#successOverlay').querySelector('h2').innerText = "Order Request Received!";
    $('#successOverlay').querySelector('p').innerText = "Your COD order is pending confirmation. Our team will contact you on WhatsApp shortly for the ₹500 advance payment to dispatch your item.";
    $('#successOverlay').classList.add('show');
    
    cart = {}; renderCart();
    $('#checkoutForm').style.display = 'none'; 
    $('#cName').value=''; $('#cPhone').value=''; $('#cEmail').value=''; $('#cAddress').value=''; $('#cPin').value='';
    if($('#codTermsText')) $('#codTermsText').style.display = 'none';
    closeCart();
    
  } catch (err) {
    console.error(err); showToast('Order error: ' + err.message);
  } finally {
    btn.disabled = false; btn.innerHTML = 'COD (Cash)';
    $('#demoCheckout').disabled = false;
  }
});

window.closeSuccess = function() {
  $('#successOverlay').classList.remove('show');
};

$('#menuToggle').addEventListener('click',()=>{
 const open=$('#mainNav').classList.toggle('open');
 $('#menuToggle').setAttribute('aria-expanded',String(open));
 $('#menuToggle').setAttribute('aria-label',open?'Close menu':'Open menu');
});
function closeMobileMenu(){ $('#mainNav').classList.remove('open'); $('#menuToggle').setAttribute('aria-expanded','false'); $('#menuToggle').setAttribute('aria-label','Open menu'); }
document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',closeMobileMenu));
window.addEventListener('resize',()=>{if(window.innerWidth>760)closeMobileMenu();});
$('#enquiryForm').addEventListener('submit',e=>{
 e.preventDefault();
 const form=e.currentTarget;
 if(!form.reportValidity())return;
 const data=new FormData(form);
 const name=String(data.get('name')||'').trim();
 const phone=String(data.get('phone')||'').trim();
 const digits=phone.replace(/\D/g,'');
 if(digits.length<10||digits.length>13){$('#formMessage').textContent='Please enter a valid phone number (10–13 digits).';return;}
 const requirement=String(data.get('requirement')||'Product enquiry');
 const message=String(data.get('message')||'').trim();
 const text=`Hello Hexa Computronics, I would like to make an enquiry.\n\nName: ${name}\nPhone: ${phone}\nRequirement: ${requirement}\nDetails: ${message||'Not provided'}\n\nPlease contact me.`;
 const url='https://wa.me/918400702268?text='+encodeURIComponent(text);
 $('#formMessage').textContent='Opening WhatsApp with your enquiry. Review the message and press Send to submit it.';
 const opened=window.open(url,'_blank','noopener,noreferrer');
 if(!opened)window.location.href=url;
});
function showEnquiryStatus(message,type='info'){
 const status=document.getElementById('formMessage');
 if(!status)return;
 const palettes={
  success:{bg:'#e8f7ed',border:'#1f9d55',color:'#14532d'},
  error:{bg:'#fff0f0',border:'#dc2626',color:'#991b1b'},
  info:{bg:'#eef6ff',border:'#2563eb',color:'#1e40af'}
 };
 const p=palettes[type]||palettes.info;
 status.textContent=message;
 status.style.display='block';
 status.style.width='100%';
 status.style.boxSizing='border-box';
 status.style.margin='14px 0 0';
 status.style.padding='14px 16px';
 status.style.border='1px solid '+p.border;
 status.style.borderLeft='5px solid '+p.border;
 status.style.borderRadius='10px';
 status.style.background=p.bg;
 status.style.color=p.color;
 status.style.fontSize='16px';
 status.style.fontWeight='600';
 status.style.lineHeight='1.55';
 status.style.textAlign='left';
 status.style.whiteSpace='normal';
 status.style.boxShadow='0 3px 12px rgba(0,0,0,.06)';
 status.setAttribute('role','status');
 status.setAttribute('aria-live','polite');
}
async function sendEmailEnquiry(event){
 if(event){event.preventDefault();event.stopPropagation();}
 const form=document.getElementById('enquiryForm');
 const button=document.getElementById('emailEnquiry');
 const status=document.getElementById('formMessage');
 if(!form||!button||!status){alert('Enquiry form is unavailable. Please refresh the page.');return;}
 if(!form.reportValidity())return;
 const data=new FormData(form);
 const name=String(data.get('name')||'').trim();
 const phone=String(data.get('phone')||'').trim();
 const digits=phone.replace(/\D/g,'');
 if(digits.length<10||digits.length>13){status.textContent='Please enter a valid phone number (10–13 digits).';return;}
 const requirement=String(data.get('requirement')||'Product enquiry');
 const message=String(data.get('message')||'').trim()||'Not provided';
 const originalText=button.textContent;
 button.disabled=true;
 button.textContent='Sending...';
 showEnquiryStatus('Sending your enquiry securely...','info');
 try{
  const response=await fetch('https://api.web3forms.com/submit',{
   method:'POST',
   headers:{'Content-Type':'application/json','Accept':'application/json'},
   body:JSON.stringify({
    access_key:'86a543d1-069e-4187-b2e1-f43488b49ca7',
    subject:`Website enquiry: ${requirement}`,
    from_name:'Hexa Computronics Website',
    name,phone,requirement,message
   })
  });
  const result=await response.json();
  if(!response.ok||result.success!==true){
   throw new Error(result.message||'The email service could not accept this enquiry.');
  }
  showEnquiryStatus('✓ Enquiry sent successfully! Thank you for contacting Hexa Computronics. Our team will contact you soon.','success');
  form.reset();
 }catch(error){
  showEnquiryStatus('✕ Email could not be sent. Please try again or contact us on WhatsApp. '+(error.message||''),'error');
 }finally{
  button.disabled=false;
  button.textContent=originalText;
 }
}
window.sendEmailEnquiry=sendEmailEnquiry;
document.getElementById('emailEnquiry')?.addEventListener('click',sendEmailEnquiry);
$('#year').textContent=new Date().getFullYear();

// LIVE ADMIN PANEL DATABASE FETCH
async function loadSupabaseProducts(){
 try{
  const key=window.HEXA_SUPABASE_ANON_KEY;
  if(!window.supabase||!key||key.includes('PASTE_'))return;
  const sb=window.supabase.createClient(window.HEXA_SUPABASE_URL,key);
  const {data,error}=await sb.from('products').select('*').eq('status','published').order('created_at',{ascending:false});
  if(error)throw error;
  if(data&&data.length){
   products=data.map(p=>({
    id:p.id,
    name:p.name,
    cat:p.category||'Other',
    price:Number(p.selling_price||0),
    shipping:Number(p.shipping_charge||0),
    freeShipping:Boolean(p.free_shipping),
    spec:(p.features||[]).join(' · ')||p.model||p.brand||'',
    tag:p.brand||'Available',
    img:(p.images||[])[0]||'technology-placeholder.svg'
   }));
   renderProducts();renderCart();
  }else{
   products=[];renderProducts();renderCart();
  }
 }catch(err){console.warn('Live catalogue could not load; showing preview catalogue.',err);}
}
loadSupabaseProducts();
renderProducts();renderCart();

// CAROUSEL & MODAL SCRIPT
let currentProductFull = null;
let currentImageIndex = 0;
let productImages = [];

function getEmbedUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&\n?\#]+)/);
  if (ytMatch && ytMatch[1]) return `https://www.youtube.com/embed/${ytMatch[1]}`;
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?([0-9]+)/);
  if (vimeoMatch && vimeoMatch[1]) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return url; 
}

window.openProductModal = async function(id) {
  const basic = products.find(p => String(p.id) === String(id));
  if(!basic) return;
  
  currentImageIndex = 0;
  productImages = [basic.img]; 
  let videoUrl = null;
  let fullDesc = '';
  let features = [];
  let regPrice = null;
  let isFreeShip = Boolean(basic.freeShipping);
  let shipCharge = Number(basic.shipping || 0);
  
  try {
    const key = window.HEXA_SUPABASE_ANON_KEY;
    if(window.supabase && key && !key.includes('PASTE_')) {
      const sb = window.supabase.createClient(window.HEXA_SUPABASE_URL, key);
      const {data, error} = await sb.from('products').select('*').eq('id', id).maybeSingle();
      if(!error && data) {
         if(data.images && data.images.length > 0) productImages = data.images;
         videoUrl = data.video_url;
         fullDesc = data.description || '';
         features = data.features || [];
         regPrice = data.regular_price > data.selling_price ? data.regular_price : null;
         isFreeShip = Boolean(data.free_shipping);
         shipCharge = Number(data.shipping_charge || 0);
      }
    }
  } catch(e) {}

  $('#modalCat').textContent = basic.cat;
  $('#modalTitle').textContent = basic.name;
  
  let priceHtml = money(basic.price);
  if(regPrice) priceHtml += `<del>${money(regPrice)}</del>`;
  const shipNote = isFreeShip
    ? `<span style="display:inline-block;margin-left:10px;font-size:12px;font-weight:700;color:#15803d;background:#dcfce7;padding:3px 9px;border-radius:999px;vertical-align:middle;">Free Shipping</span>`
    : `<span style="display:inline-block;margin-left:10px;font-size:12px;font-weight:600;color:#475569;vertical-align:middle;">+ ${money(shipCharge > 0 ? shipCharge : SHIPPING_CONFIG.DEFAULT_PRODUCT_SHIPPING)} shipping</span>`;
  $('#modalPrice').innerHTML = priceHtml + shipNote;
  
  $('#modalDesc').textContent = fullDesc || basic.spec;
  $('#modalFeatures').innerHTML = features.length ? features.map(f => `<li>${f}</li>`).join('') : '';
  
  $('#modalAddToCart').onclick = () => {
    addToCart(basic.id);
    closeProductModal();
  };

  const thumbsContainer = $('#modalThumbnails');
  let thumbsHtml = '';
  productImages.forEach((img, idx) => {
    thumbsHtml += `<img src="${img}" class="thumb-img ${idx === 0 ? 'active' : ''}" onclick="setCarouselIndex(${idx})">`;
  });
  
  if(videoUrl) {
    const embedUrl = getEmbedUrl(videoUrl);
    $('#modalVideoPlayer').src = embedUrl; 
    thumbsHtml += `<div class="video-btn-thumb" onclick="showVideo()" title="Play Video">▶</div>`;
  } else {
    $('#modalVideoPlayer').src = ''; 
  }
  
  thumbsContainer.innerHTML = thumbsHtml;
  setCarouselIndex(0);
  
  $('#productModal').hidden = false;
  document.body.style.overflow = 'hidden';
};

window.closeProductModal = function() {
  $('#productModal').hidden = true;
  document.body.style.overflow = '';
  $('#modalVideoPlayer').src = ''; 
};

window.setCarouselIndex = function(index) {
  if(index < 0) index = productImages.length - 1;
  if(index >= productImages.length) index = 0;
  currentImageIndex = index;
  
  $('#modalVideoWrap').hidden = true;
  $('.carousel-main').style.display = 'flex';
  
  $('#modalMainImage').src = productImages[currentImageIndex];
  
  document.querySelectorAll('.thumb-img').forEach((el, idx) => {
    el.classList.toggle('active', idx === currentImageIndex);
  });
  const vidThumb = $('.video-btn-thumb');
  if(vidThumb) vidThumb.classList.remove('active');
};

window.showVideo = function() {
  $('.carousel-main').style.display = 'none';
  $('#modalVideoWrap').hidden = false;
  
  document.querySelectorAll('.thumb-img').forEach(el => el.classList.remove('active'));
  $('.video-btn-thumb').classList.add('active');
};

document.addEventListener('DOMContentLoaded', () => {
  if($('#closeModal')) $('#closeModal').addEventListener('click', closeProductModal);
  if($('#carouselPrev')) $('#carouselPrev').addEventListener('click', () => setCarouselIndex(currentImageIndex - 1));
  if($('#carouselNext')) $('#carouselNext').addEventListener('click', () => setCarouselIndex(currentImageIndex + 1));
  
  const modal = document.getElementById('productModal');
  if(modal) {
    modal.addEventListener('click', e => {
      if(e.target === modal) closeProductModal();
    });
  }
});
