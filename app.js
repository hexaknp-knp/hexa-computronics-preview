// ====== STATE ======
let products = [];
let cart = {};

// ====== UTILITY FUNCTIONS ======
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function formatPrice(p) {
  return '₹' + Number(p).toLocaleString('en-IN', { maximumFractionDigits: 2 });
}

function showToast(msg) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ====== SUPABASE INIT & LIVE FETCH (Admin Panel Connection) ======
const sb = window.supabase.createClient(window.HEXA_SUPABASE_URL, window.HEXA_SUPABASE_ANON_KEY);

async function loadProducts() {
  try {
    // Database se live products aur unki image/price fetch karega
    const { data, error } = await sb.from('products').select('*');
    if (error) throw error;
    if (data) {
      products = data;
      renderProducts();
    }
  } catch (err) {
    console.error("Error loading products:", err);
    showToast("Failed to load products from database");
  }
}

// ====== CART LOGIC ======
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
    const imgUrl = p.image_url || p.img || 'cctv-security.svg';
    html += `
      <div class="cart-item">
        <img src="${imgUrl}" alt="${p.name}">
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
  if($('#productModal')) $('#productModal').hidden = true;
});

// ====== RENDER PRODUCTS ======
function renderProducts(filter = 'All') {
  const grid = $('#productGrid');
  if(!grid) return;
  grid.innerHTML = '';
  
  let filtered = filter === 'All' ? products : products.filter(p => p.category === filter);
  
  const sortVal = $('#sortProducts') ? $('#sortProducts').value : 'featured';
  if (sortVal === 'low') filtered.sort((a,b) => a.price - b.price);
  if (sortVal === 'high') filtered.sort((a,b) => b.price - a.price);

  const searchBox = $('#productSearch');
  const search = searchBox ? searchBox.value.toLowerCase() : '';
  if (search) {
    filtered = filtered.filter(p => p.name.toLowerCase().includes(search) || (p.category && p.category.toLowerCase().includes(search)));
  }

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px; color:#64748b;">No products found.</p>';
    return;
  }

  filtered.forEach(p => {
    const card = document.createElement('article');
    card.className = 'product-card';
    const imgUrl = p.image_url || p.img || 'cctv-security.svg';
    card.innerHTML = `
      <div class="product-image" onclick="openModal(${p.id})">
        ${p.badge ? `<span class="badge">${p.badge}</span>` : ''}
        <img src="${imgUrl}" alt="${p.name}" loading="lazy">
      </div>
      <div class="product-info">
        <small>${p.category || 'Product'}</small>
        <h3 onclick="openModal(${p.id})">${p.name}</h3>
        <p class="product-spec">${p.spec || p.description || ''}</p>
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
  
  const imgUrl = p.image_url || p.img || 'cctv-security.svg';
  $('#modalMainImage').src = imgUrl;
  $('#modalThumbnails').innerHTML = `<img src="${imgUrl}" class="thumb-img active">`;
  if($('#modalVideoWrap')) $('#modalVideoWrap').hidden = true;
  $('#modalMainImage').style.display = 'block';
  
  $('#modalCat').textContent = p.category || '';
  $('#modalTitle').textContent = p.name;
  $('#modalPrice').innerHTML = formatPrice(p.price);
  $('#modalBadges').innerHTML = p.badge ? `<span class="badge" style="position:static; margin-bottom:10px; display:inline-block;">${p.badge}</span>` : '';
  $('#modalDesc').textContent = p.desc || p.description || '';
  
  const feats = p.features || (p.spec ? p.spec.split(',') : []);
  if(Array.isArray(feats)){
    $('#modalFeatures').innerHTML = feats.map(f => `<li>${f}</li>`).join('');
  } else {
    $('#modalFeatures').innerHTML = '';
  }
  
  $('#productModal').hidden = false;
  $('#productModal').style.opacity = '1';
}

if($('#closeModal')) $('#closeModal').addEventListener('click', () => { $('#productModal').hidden = true; });
if($('#modalAddToCart')) $('#modalAddToCart').addEventListener('click', () => {
  if (currentProductId) { addToCart(currentProductId); $('#productModal').hidden = true; }
});

// ====== EVENT LISTENERS ======
if($('#productSearch')) $('#productSearch').addEventListener('input', () => renderProducts($('.filter.active').dataset.filter));
if($('#sortProducts')) $('#sortProducts').addEventListener('change', () => renderProducts($('.filter.active').dataset.filter));

$$('.filter').forEach(btn => {
  btn.addEventListener('click', (e) => {
    $$('.filter').forEach(b => b.classList.remove('active'));
    e.target.classList.add('active');
    renderProducts(e.target.dataset.filter);
  });
});

$('#menuToggle').addEventListener('click', (e) => {
  const nav = $('#mainNav');
  const exp = nav.classList.toggle('active');
  e.target.setAttribute('aria-expanded', exp);
});

if($('#year')) $('#year').textContent = new Date().getFullYear();

// ====== RAZORPAY CHECKOUT LOGIC ======
if($('#demoCheckout')) {
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
      // Math.round ensures float values (like 498.99) become pure integers (499) to avoid Razorpay 400 error!
      const totalAmount = Math.round(rows.reduce((s, [id, q]) => s + products.find(p => String(p.id) === String(id)).price * q, 0));

      const key = window.HEXA_SUPABASE_ANON_KEY;
      const url = window.HEXA_SUPABASE_URL;

      const response = await fetch(`${url}/functions/v1/razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ amount: totalAmount })
      });
      
      const orderData = await response.json();
      if (!response.ok) throw new Error(orderData.error || 'Failed to create order');

      const cleanPhone = cPhone.replace(/\D/g, '');

      const options = {
        key: window.RAZORPAY_KEY_ID,
        name: 'Hexa Computronics',
        description: 'IT Hardware & Solutions',
        order_id: orderData.id, 
        prefill: { name: cName, email: cEmail, contact: cleanPhone },
        handler: async function (res) {
          showToast('Processing your order...');
          try {
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
              const imgUrl = p.img || p.image_url || 'cctv-security.svg';
              return `<img src="${imgUrl}" alt="${p.name}">`;
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
}

function closeSuccess() { $('#successOverlay').classList.remove('show'); }

// Init
loadProducts();
