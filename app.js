const products=[
{id:1,name:'Lenovo IdeaPad Slim 3',cat:'Laptops',price:42999,spec:'Core i5 · 16GB RAM · 512GB SSD',tag:'Popular',img:'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=700&q=82'},
{id:2,name:'HP ProBook Business Laptop',cat:'Laptops',price:58999,spec:'Core i5 · 16GB RAM · 512GB SSD',tag:'Business pick',img:'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=700&q=82'},
{id:3,name:'Custom Gaming Desktop',cat:'Desktops & Gaming',price:74999,spec:'Ryzen 5 · 16GB RAM · Gaming build',tag:'Performance',img:'https://images.unsplash.com/photo-1587831990711-23ca6441447b?auto=format&fit=crop&w=700&q=82'},
{id:4,name:'24-inch Full HD Monitor',cat:'Monitors',price:8999,spec:'IPS · 100Hz · HDMI',tag:'Everyday essential',img:'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=700&q=82'},
{id:5,name:'Dual Band Wi-Fi Router',cat:'Networking',price:2499,spec:'Dual band · Gigabit ports',tag:'Connectivity',img:'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=700&q=82'},
{id:6,name:'4-Channel CCTV Kit',cat:'CCTV & Security',price:12499,spec:'4 cameras · DVR bundle',tag:'Security',img:'cctv-security.svg'},
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
 $('#productGrid').innerHTML=list.map(p=>`<article class="product-card"><div class="product-image"><img loading="lazy" src="${p.img}" alt="${p.name}" onerror="this.onerror=null;this.src='technology-placeholder.svg';this.alt='Technology product placeholder'"><span class="product-tag">${p.tag}</span></div><div class="product-info"><span class="product-category">${p.cat}</span><h3>${p.name}</h3><p class="product-spec">${p.spec}</p><div class="product-bottom"><b class="product-price">${money(p.price)}</b><button class="add-button" aria-label="Add ${p.name} to bag" onclick="addToCart(${p.id})">+</button></div></div></article>`).join('')||'<p class="no-results">No matching products. Try another search or category.</p>';
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
renderProducts();renderCart();
