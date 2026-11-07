
(() => {
 const $=id=>document.getElementById(id);
 const url=window.HEXA_SUPABASE_URL, key=window.HEXA_SUPABASE_ANON_KEY;
 let sb=null, currentProducts=[], existingImages=[];
 const say=(id,msg)=>$(id).textContent=msg;
 function configOK(){return url&&key&&!key.includes('PASTE_');}
 function client(){if(!sb){if(!configOK())throw Error('Supabase publishable/anon key is not configured in supabase-config.js');sb=window.supabase.createClient(url,key);}return sb;}
 async function requireAdmin(){
  const {data:{user},error}=await client().auth.getUser();
  if(error||!user)throw Error('Please sign in again.');
  const {data,error:adminError}=await client().from('admin_users').select('user_id').eq('user_id',user.id).maybeSingle();
  if(adminError||!data)throw Error('This account is not authorized as an administrator.');
  return user;
 }
 $('loginForm').addEventListener('submit',async e=>{
  e.preventDefault();say('loginMessage','Signing in…');
  try{
   if(!configOK())throw Error('Add your Supabase publishable/anon key in supabase-config.js first.');
   const {error}=await client().auth.signInWithPassword({email:$('loginEmail').value.trim(),password:$('loginPassword').value});
   if(error)throw error; await showDashboard();
  }catch(err){say('loginMessage',err.message);}
 });
 async function showDashboard(){
  try{await requireAdmin();$('loginPanel').hidden=true;$('dashboard').hidden=false;await loadProducts();}
  catch(err){$('loginPanel').hidden=false;$('dashboard').hidden=true;say('loginMessage',err.message);}
 }
 $('logoutBtn').addEventListener('click',async()=>{await client().auth.signOut();location.reload();});
 async function loadProducts(){
  const {data,error}=await client().from('products').select('*').order('created_at',{ascending:false});
  if(error)throw error;currentProducts=data||[];
  $('totalProducts').textContent=currentProducts.length;
  $('publishedProducts').textContent=currentProducts.filter(x=>x.status==='published').length;
  $('draftProducts').textContent=currentProducts.filter(x=>x.status==='draft').length;
  $('productList').innerHTML=currentProducts.map(x=>`<article class="admin-product"><img src="${esc((x.images||[])[0]||'technology-placeholder.svg')}" alt=""><div><h3>${esc(x.name)}</h3><p>₹${Number(x.selling_price).toLocaleString('en-IN')} · ${esc(x.category||'Other')} · <span class="status-pill">${esc(x.status)}</span></p><div class="admin-product-actions"><button data-edit="${x.id}">Edit</button><button class="delete" data-delete="${x.id}">Delete</button></div></div></article>`).join('')||'<p>No products yet. Add your first product.</p>';
 }
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 $('productList').addEventListener('click',async e=>{
  const edit=e.target.closest('[data-edit]'),del=e.target.closest('[data-delete]');
  if(edit){const x=currentProducts.find(p=>p.id===edit.dataset.edit);if(x)fillForm(x);}
  if(del&&confirm('Delete this product permanently?')){try{const {error}=await client().from('products').delete().eq('id',del.dataset.delete);if(error)throw error;await loadProducts();resetForm();}catch(err){alert(err.message);}}
 });
 function fillForm(x){
  $('productId').value=x.id;$('name').value=x.name||'';$('category').value=x.category||'Other';$('brand').value=x.brand||'';$('model').value=x.model||'';
  $('stock').value=x.stock_quantity??0;$('features').value=(x.features||[]).join('\n');$('description').value=x.description||'';
  $('specifications').value=JSON.stringify(x.specifications||{},null,2);$('regularPrice').value=x.regular_price??0;$('sellingPrice').value=x.selling_price??'';
  $('videoUrl').value=x.video_url||'';$('status').value=x.status||'draft';existingImages=x.images||[];
  $('imagePreview').innerHTML=existingImages.map(src=>`<img src="${esc(src)}" alt="Existing product image">`).join('');
  $('editorTitle').textContent='Edit product';window.scrollTo({top:0,behavior:'smooth'});
 }
 function resetForm(){ $('productForm').reset();$('productId').value='';$('stock').value=1;$('regularPrice').value=0;$('status').value='draft';existingImages=[];$('imagePreview').innerHTML='';$('editorTitle').textContent='Add a product';say('productMessage','');}
 $('resetForm').addEventListener('click',resetForm);$('refreshProducts').addEventListener('click',()=>loadProducts().catch(e=>say('productMessage',e.message)));
 async function uploadFiles(files){
  const urls=[];
  for(const file of files){
   if(file.size>50*1024*1024)throw Error(file.name+' exceeds the 50 MB bucket limit.');
   const safe=file.name.replace(/[^a-zA-Z0-9._-]/g,'-');
   const path=`products/${crypto.randomUUID()}-${safe}`;
   const {error}=await client().storage.from('product-media').upload(path,file,{upsert:false,contentType:file.type});
   if(error)throw error;
   urls.push(client().storage.from('product-media').getPublicUrl(path).data.publicUrl);
  }
  return urls;
 }
 $('images').addEventListener('change',()=>{$('imagePreview').innerHTML=Array.from($('images').files||[]).map(f=>`<span>${esc(f.name)}</span>`).join(' ')+(existingImages.length?`<small>${existingImages.length} existing image(s) retained until save.</small>`:'');});
 $('productForm').addEventListener('submit',async e=>{
  e.preventDefault();const btn=$('saveProduct');btn.disabled=true;btn.textContent='Saving…';say('productMessage','Saving product…');
  try{
   await requireAdmin();
   let images=[...existingImages];const newImages=await uploadFiles(Array.from($('images').files||[]));images.push(...newImages);
   let videoUrl=$('videoUrl').value.trim();
   const video=$('videoFile').files[0];
   if(video){const [uploaded]=await uploadFiles([video]);videoUrl=uploaded;}
   let specs={};const raw=$('specifications').value.trim();if(raw){specs=JSON.parse(raw);if(!specs||Array.isArray(specs)||typeof specs!=='object')throw Error('Specifications must be a JSON object.');}
   const name=$('name').value.trim();
   const payload={name,slug:name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')+'-'+Math.random().toString(36).slice(2,7),
    category:$('category').value,brand:$('brand').value.trim(),model:$('model').value.trim(),description:$('description').value.trim(),
    features:$('features').value.split('\n').map(s=>s.trim()).filter(Boolean),specifications:specs,
    regular_price:Number($('regularPrice').value||0),selling_price:Number($('sellingPrice').value),
    images,video_url:videoUrl||null,stock_quantity:Number($('stock').value||0),status:$('status').value,updated_at:new Date().toISOString()};
   const id=$('productId').value;let result;
   if(id)result=await client().from('products').update(payload).eq('id',id);
   else result=await client().from('products').insert(payload);
   if(result.error)throw result.error;
   say('productMessage','Product saved successfully.');resetForm();await loadProducts();
  }catch(err){say('productMessage',err.message||'Unable to save product.');}
  finally{btn.disabled=false;btn.textContent='Save product ↗';}
 });
 if(configOK()){client().auth.getSession().then(({data})=>{if(data.session)showDashboard();});}
})();
