const products=[
{id:1,name:'Lenovo IdeaPad Slim 3',cat:'Laptops',price:42999,spec:'Core i5 · 16GB RAM · 512GB SSD',tag:'Popular',img:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=82'},
{id:2,name:'HP ProBook Business Laptop',cat:'Laptops',price:58999,spec:'Core i5 · 16GB RAM · 512GB SSD',tag:'Business pick',img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=82'},
{id:3,name:'Custom Gaming Desktop',cat:'Desktops & Gaming',price:74999,spec:'Ryzen 5 · 16GB RAM · Gaming build',tag:'Performance',img:'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=700&q=82'},
{id:4,name:'24-inch Full HD Monitor',cat:'Monitors',price:8999,spec:'IPS · 100Hz · HDMI',tag:'Everyday essential',img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=82'},
{id:5,name:'Dual Band Wi-Fi Router',cat:'Networking',price:2499,spec:'Dual band · Gigabit ports',tag:'Connectivity',img:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=700&q=82'},
{id:6,name:'4-Channel CCTV Kit',cat:'CCTV & Security',price:12499,spec:'4 cameras · DVR bundle',tag:'Security',img:'https://images.unsplash.com/photo-1557597774-9d2736050a9e?auto=format&fit=crop&w=700&q=82'},
{id:7,name:'Refurbished Business Laptop',cat:'Refurbished',price:18999,spec:'Core i5 · 8GB RAM · SSD',tag:'Value choice',img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=82'},
{id:8,name:'Wireless Keyboard & Mouse',cat:'Accessories',price:1299,spec:'Wireless combo · USB receiver',tag:'Essential',img:'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=700&q=82'},
{id:9,name:'Office Desktop Computer',cat:'Desktops & Gaming',price:28999,spec:'Core i3 · 8GB RAM · 512GB SSD',tag:'Office ready',img:'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?auto=format&fit=crop&w=700&q=82'},
{id:10,name:'Gigabit Network Switch',cat:'Networking',price:1899,spec:'8-port · Gigabit Ethernet',tag:'Network essential',img:'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=700&q=82'},
{id:11,name:'USB-C Multiport Hub',cat:'Accessories',price:1799,spec:'HDMI · USB 3.0 · PD',tag:'On the go',img:'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=700&q=82'},
{id:12,name:'Refurbished Desktop PC',cat:'Refurbished',price:13999,spec:'Core i5 · 8GB RAM · SSD',tag:'Value choice',img:'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=700&q=82'}
];
let activeCategory='All',cart={};
const $=s=>document.querySelector(s),money=n=>'₹'+n.toLocaleString('en-IN');
function renderProducts(){
 const query=$('#productSearch').value.trim().toLowerCase();
 let list=products.filter(p=>(activeCategory==='All'||p.cat===activeCategory)&&(`${p.name} ${p.cat} ${p.spec}`).toLowerCase().includes(query));
 const sort=$('#sortProducts').value;
 if(sort==='low')list.sort((a,b)=>a.price-b.price);
 if(sort==='high')list.sort((a,b)=>b.price-a.price);
 $('#productGrid').innerHTML=list.map(p=>`<article class="product-card"><div class="product-image"><img loading="lazy" src="${p.img}" alt="${p.name}"><span class="product-tag">${p.tag}</span></div><div class="product-info"><span class="product-category">${p.cat}</span><h3>${p.name}</h3><p class="product-spec">${p.spec}</p><div class="product-bottom"><b class="product-price">${money(p.price)}</b><button class="add-button" aria-label="Add ${p.name} to bag" onclick="addToCart(${p.id})">+</button></div></div></article>`).join('')||'<p class="no-results">No matching products. Try another search or category.</p>';
}
function setCategory(cat){activeCategory=cat;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b.dataset.filter===cat));renderProducts();}
function addToCart(id){cart[id]=(cart[id]||0)+1;renderCart();showToast('Added to your demo bag');}
function changeQty(id,delta){cart[id]=(cart[id]||0)+delta;if(cart[id]<=0)delete cart[id];renderCart();}
function renderCart(){
 const rows=Object.entries(cart),count=rows.reduce((s,[,q])=>s+q,0),total=rows.reduce((s,[id,q])=>s+products.find(p=>p.id===Number(id)).price*q,0);
 $('#cartCount').textContent=count;$('#drawerCount').textContent=`(${count})`;$('#cartSubtotal').textContent=money(total);
 $('#cartItems').innerHTML=rows.length?rows.map(([id,q])=>{const p=products.find(x=>x.id===Number(id));return `<div class="cart-line"><div><b>${p.name}</b><small>${money(p.price)} each</small><div class="qty-controls"><button onclick="changeQty(${id},-1)">−</button><span>${q}</span><button onclick="changeQty(${id},1)">+</button></div></div><b>${money(p.price*q)}</b></div>`}).join(''):'<p class="empty-cart">Your bag is waiting for something great.</p>';
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
$('#demoCheckout').addEventListener('click',()=>{if(!Object.keys(cart).length)return showToast('Your bag is empty');showToast('Demo preview only — checkout is not connected');});
$('#menuToggle').addEventListener('click',()=>$('#mainNav').classList.toggle('open'));
document.querySelectorAll('#mainNav a').forEach(a=>a.addEventListener('click',()=>$('#mainNav').classList.remove('open')));
$('#enquiryForm').addEventListener('submit',e=>{e.preventDefault();$('#formMessage').textContent='Thanks! This demo form is not connected yet. Contact us by phone or WhatsApp.';showToast('Demo enquiry validated — not sent');});
$('#year').textContent=new Date().getFullYear();
renderProducts();renderCart();
