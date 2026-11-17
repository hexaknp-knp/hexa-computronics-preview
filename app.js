// ====== PRODUCT DATA ======
const products = [
  { id: 1, name: "HP ProBook 440 G8", price: 42500, category: "Laptops", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80", spec: "Core i5 11th Gen · 8GB RAM · 512GB SSD", badge: "Bestseller", desc: "A sleek and powerful laptop designed for business professionals, featuring advanced security and long battery life.", features: ["Intel Core i5-1135G7", "8GB DDR4 RAM", "512GB NVMe SSD", "14-inch FHD Display"] },
  { id: 2, name: "Dell OptiPlex 3080", price: 34999, category: "Desktops & Gaming", img: "https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=800&q=80", spec: "Core i3 10th Gen · 8GB RAM · 1TB HDD", desc: "Reliable and space-saving desktop computer ideal for everyday office tasks and basic home use.", features: ["Intel Core i3-10100", "8GB DDR4 RAM", "1TB 7200RPM HDD", "Windows 10 Pro"] },
  { id: 3, name: "LG 24-inch IPS Monitor", price: 11200, category: "Monitors", img: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80", spec: "FHD 1080p · 75Hz · HDMI/VGA", badge: "Value Pick", desc: "Crisp and vibrant display with wide viewing angles, perfect for work and entertainment.", features: ["24-inch IPS Panel", "1920x1080 Resolution", "75Hz Refresh Rate", "AMD FreeSync"] },
  { id: 4, name: "TP-Link Archer AX50", price: 4800, category: "Networking", img: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80", spec: "Wi-Fi 6 Router · AX3000 · Dual Band", desc: "Next-gen Wi-Fi 6 router providing faster speeds, greater capacity, and reduced network congestion.", features: ["Wi-Fi 6 (802.11ax)", "Up to 3000 Mbps Speed", "Intel Home Wi-Fi Chipset", "OFDMA & MU-MIMO"] },
  { id: 5, name: "CP Plus 2MP Dome Camera", price: 1450, category: "CCTV & Security", img: "cctv-security.svg", spec: "1080p Full HD · Night Vision · Indoor", badge: "Security Essential", desc: "High-definition indoor security camera with clear night vision for 24/7 monitoring.", features: ["2 Megapixel Sensor", "1080p Full HD Video", "20m IR Night Vision", "Wide Angle Lens"] },
  { id: 6, name: "Logitech MK295 Wireless Combo", price: 2100, category: "Accessories", img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80", spec: "SilentTouch Keyboard & Mouse", desc: "Stay focused with a quiet wireless keyboard and mouse combo featuring SilentTouch technology.", features: ["SilentTouch Technology", "Full-size Keyboard", "Compact Mouse", "2.4GHz Wireless"] },
  { id: 7, name: "Refurbished Lenovo ThinkPad T470", price: 18500, category: "Refurbished", img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80", spec: "Core i5 6th Gen · 8GB RAM · 256GB SSD", badge: "Great Value", desc: "Durable and reliable refurbished business laptop, fully tested and certified for smooth performance.", features: ["Intel Core i5-6300U", "8GB DDR4 RAM", "256GB SSD", "14-inch HD Display"] },
  { id: 8, name: "WD 1TB External Hard Drive", price: 4500, category: "Accessories", img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80", spec: "USB 3.0 · Portable Storage", desc: "Compact and reliable portable storage to backup your important files and media on the go.", features: ["1TB Capacity", "USB 3.0 Interface", "Compact Design", "Windows/Mac Compatible"] },
  { id: 9, name: "Wired Keyboard", price: 498.99, category: "Accessories", img: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80", spec: "Chiclet keyboard", badge: "New", desc: "Standard wired keyboard for everyday typing.", features: ["USB Connection", "Quiet Keys", "Spill-resistant"] }
];

// ====== UTILITY FUNCTIONS ======
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function formatPrice(p) {
  return '₹' + p.toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ====== CART LOGIC ======
let cart = {};

function updateCartCount() {
  const c = Object.values(cart).reduce((a, b) => a + b, 0);
  $('#cartCount').textContent = c;
  $('#drawerCount').textContent = `(${c})`;
}

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1;
  updateCartCount();
  showToast('Item added to cart');
  renderCart();
  $('#cartDrawer').classList.add('open');
  $('#overlay').classList.add('show');
}

function updateQty(id, delta) {
  if (!cart[id]) return;
  cart[id] += delta;
  if (cart[id] <= 0) delete cart[id];
  updateCartCount();
  renderCart();
}

function renderCart() {
  const cItems = $('#cartItems');
  if (Object.keys(cart).length === 0) {
    cItems.innerHTML = '<p class="empty-cart">Your cart is waiting for something great.</p>';
    $('#cartSubtotal').textContent = '₹0';
    $('#checkoutForm').style.display = 'none';
    $('#demoCheckout').style.display = 'none';
    return;
  }
  
  let html = '', total = 0;
  for (const [id, qty] of Object.entries(cart)) {
    const p = products.find(x => String(x.id) === String(id));
    if (!p) continue;
    total += p.price * qty;
    html += `
      <div class="cart-item">
        <img src="${p.img}" alt="${p.name}">
        <div class="cart-item-info">
          <h4>${p.name}</h4><p>${formatPrice(p.price)} each</p>
          <div class="qty-control">
            <button onclick="updateQty(${p.id}, -1)">−</button>
            <span>${qty}</span>
            <button onclick="updateQty(${p.id}, 1)">+</button>
          </div>
        </div>
      </div>
    `;
  }
  cItems.innerHTML = html;
  $('#cartSubtotal').textContent = formatPrice(total);
  $('#checkoutForm').style.display = 'flex';
  $('#demoCheckout').style.display = 'flex';
}

// ====== DRAWER & MODAL TOGGLES ======
function closeCart() {
  $('#cartDrawer').classList.remove('open');
  $('#overlay').classList.remove('show');
}

$('#cartOpen').addEventListener('click', () => {
  renderCart();
  $('#cartDrawer').classList.add('open');
  $('#overlay').classList.add('show');
});
$('#cartClose').addEventListener('click', closeCart);
$('#overlay').addEventListener('click', () => {
  closeCart();
  $('#productModal').hidden = true;
});

// ====== RENDER PRODUCTS ======
function renderProducts(filter = 'All') {
  const grid = $('#productGrid');
  grid.innerHTML = '';
  
  let filtered = filter === 'All' ? products : products.filter(p => p.category === filter);
  
  const sortVal = $('#sortProducts').value;
  if (sortVal === 'low') filtered.sort((a,b) => a.price - b.price);
  if (sortVal === 'high') filtered.sort((a,b) => b.price - a.price);

  const search = $('#productSearch').value.toLowerCase();
  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || p.category.toLowerCase().includes(search));
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:#64748b;">No products found matching your criteria.</p>';
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image" onclick="openModal(${p.id})">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        <img src="${p.img}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <small>${p.category}</small>
        <h3 onclick="openModal(${p.id})">${p.name}</h3>
        <p class="product-spec">${p.spec}</p>
        <div class="product-bottom">
          <span class="product-price">${formatPrice(p.price)}</span>
          <button class="add-button text-btn" onclick="addToCart(${p.id})">Add <span>+</span></button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// ====== PRODUCT MODAL ======
let currentProductId = null;
function openModal(id) {
  const p = products.find(x => String(x.id) === String(id));
  if (!p) return;
  currentProductId = p.id;
  
  $('#modalMainImage').src = p.img;
  $('#modalThumbnails').innerHTML = `<img src="${p.img}" class="thumb-img active">`;
  $('#modalVideoWrap').hidden = true;
  $('#modalMainImage').style.display = 'block';
  
  $('#modalCat').textContent = p.category;
  $('#modalTitle').textContent = p.name;
  $('#modalPrice').innerHTML = formatPrice(p.price);
  $('#modalBadges').innerHTML = p.badge ? `<span class="badge" style="position:static; margin-bottom:10px; display:inline-block;">${p.badge}</span>` : '';
  $('#modalDesc').textContent = p.desc;
  $('#modalFeatures').innerHTML = p.features.map(f => `<li>${f}</li>`).join('');
  
  $('#productModal').hidden = false;
  $('#productModal').style.opacity = '1';
}

$('#closeModal').addEventListener('click', () => { $('#productModal').hidden = true; });
$('#modalAddToCart').addEventListener('click', () => {
  if (currentProductId) { addToCart(currentProductId); $('#productModal').hidden = true; }
});

// ====== EVENT LISTENERS ======
$('#productSearch').addEventListener('input', () => renderProducts($('.filter.active').dataset.filter));
$('#sortProducts').addEventListener('change', () => renderProducts($('.filter.active').dataset.filter));

$$('.filter').forEach(btn => {
  btn.addEventListener('click', (e) => {
    $$('.filter').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderProducts(e.target.dataset.filter);
  });
});

$$('.category-card').forEach(card => {
  card.addEventListener('click', (e) => {
    const cat = e.currentTarget.dataset.category;
    $$('.filter').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === cat);
    });
    renderProducts(cat);
  });
});

$('#menuToggle').addEventListener('click', (e) => {
  const nav = $('#mainNav');
  const exp = nav.classList.toggle('active');
  e.target.setAttribute('aria-expanded', exp);
});

$('#year').textContent = new Date().getFullYear();

// ====== CONTACT FORM (WhatsApp & Web3Forms) ======
$('#enquiryForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = e.target;
  const text = `Hi Hexa Computronics,\n\nName: ${f.name.value}\nPhone: ${f.phone.value}\nLooking for: ${f.requirement.value}\nMessage: ${f.message.value}`;
  window.open(`https://wa.me/918400702268?text=${encodeURIComponent(text)}`, '_blank');
});

$('#emailEnquiry').addEventListener('click', async () => {
  const f = $('#enquiryForm');
  if (!f.checkValidity()) { f.reportValidity(); return; }
  const btn = $('#emailEnquiry');
  btn.textContent = 'Sending...'; btn.disabled = true;
  
  try {
    const res = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({
        access_key: '86a543d1-069e-4187-b2e1-f43488b49ca7',
        subject: `New Enquiry from ${f.name.value}`,
        from_name: 'Hexa Website',
        name: f.name.value, phone: f.phone.value, requirement: f.requirement.value, message: f.message.value
      })
    });
    if (res.ok) {
      $('#formMessage').textContent = 'Enquiry sent successfully! We will contact you soon.';
      $('#formMessage').style.color = 'green';
      f.reset();
    } else { throw new Error('Failed'); }
  } catch (e) {
    $('#formMessage').textContent = 'Error sending enquiry. Please try WhatsApp.';
    $('#formMessage').style.color = 'red';
  }
  btn.textContent = 'Send enquiry by Email ↗'; btn.disabled = false;
});

// ====== RAZORPAY CHECKOUT LOGIC (FIXED) ======
$('#demoCheckout').addEventListener('click', async () => {
  const btn = $('#demoCheckout');
  const cName = $('#cName').value.trim();
  const cPhone = $('#cPhone').value.trim();
  const cEmail = $('#cEmail').value.trim();
  const cAddress = $('#cAddress').value.trim();
  const cPin = $('#cPin').value.trim();

  if(!cName || !cPhone || !cEmail || !cAddress || !cPin) {
    return showToast('Please fill all delivery details');
  }

  const originalText = btn.innerHTML;
  btn.innerHTML = 'Connecting...'; btn.disabled = true;

  try {
    const rows = Object.entries(cart);
    const totalAmount = rows.reduce((s, [id, q]) => s + products.find(p => String(p.id) === String(id)).price * q, 0);

    const key = window.HEXA_SUPABASE_ANON_KEY;
    const url = window.HEXA_SUPABASE_URL;

    // Backend order creation
    const response = await fetch(`${url}/functions/v1/razorpay-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ amount: totalAmount })
    });
    
    const orderData = await response.json();
    if (!response.ok) throw new Error(orderData.error || 'Failed to create order');

    // Phone number fix (Clean any spaces/letters)
    const cleanPhone = cPhone.replace(/\D/g, '');

    const options = {
      key: window.RAZORPAY_KEY_ID,
      name: 'Hexa Computronics',
      description: 'IT Hardware & Solutions',
      order_id: orderData.id, 
      // AMOUNT aur CURRENCY explicitly nahi bhej rahe taaki float error na aaye
      prefill: { name: cName, email: cEmail, contact: cleanPhone },
      handler: async function (res) {
        showToast('Processing your order...');
        try {
          const sb = window.supabase.createClient(window.HEXA_SUPABASE_URL, window.HEXA_SUPABASE_ANON_KEY);
          
          await sb.from('orders').insert([{
            razorpay_order_id: res.razorpay_order_id,
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
              subject: `🎉 New Order from ${cName} (₹${totalAmount})`,
              from_name: 'Hexa Computronics Orders',
              email: cEmail,
              message: `New Order Received!\n\nCustomer Details:\nName: ${cName}\nPhone: ${cleanPhone}\nEmail: ${cEmail}\nAddress: ${cAddress} - ${cPin}\nPayment ID: ${res.razorpay_payment_id}\n\nItems Ordered:\n${itemsText}\n\nTotal Paid: ₹${totalAmount}`
            })
          });

          try {
            await fetch(`${window.HEXA_SUPABASE_URL}/functions/v1/send-receipt`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${window.HEXA_SUPABASE_ANON_KEY}` },
              body: JSON.stringify({
                email: cEmail,
                name: cName,
                amount: totalAmount,
                orderId: res.razorpay_payment_id,
                items: itemsText
              })
            });
          } catch (e) { console.error('Receipt error', e); }

          let successImages = Object.keys(cart).map(id => {
            let p = products.find(x => String(x.id) === String(id));
            return `<img src="${p.img}" alt="${p.name}">`;
          }).join('');
          $('#successItems').innerHTML = successImages;
          $('#successOverlay').classList.add('show');
          
        } catch (e) { console.error('DB save error:', e); }
        
        cart = {}; renderCart();
        $('#checkoutForm').style.display = 'none'; 
        $('#cName').value=''; $('#cPhone').value=''; $('#cEmail').value=''; $('#cAddress').value=''; $('#cPin').value='';
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

function closeSuccess() { $('#successOverlay').classList.remove('show'); }

renderProducts();
