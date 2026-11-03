const menuData = [
  {id:1,name:"Kopi Nako",category:"Kopi",price:18000,image:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600"},
  {id:2,name:"Es Kopi Aren",category:"Kopi",price:20000,image:"https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600"},
  {id:3,name:"Americano",category:"Kopi",price:15000,image:"https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600"},
  {id:4,name:"Cappuccino",category:"Kopi",price:22000,image:"https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600"},
  {id:5,name:"Matcha Latte",category:"Non Kopi",price:23000,image:"https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600"},
  {id:6,name:"Chocolate",category:"Non Kopi",price:20000,image:"https://images.pexels.com/photos/12642348/pexels-photo-12642348.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {id:7,name:"Lemon Tea",category:"Non Kopi",price:15000,image:"https://images.pexels.com/photos/30254785/pexels-photo-30254785.jpeg?auto=compress&cs=tinysrgb&w=800"},
  {id:8,name:"French Fries",category:"Makanan",price:18000,image:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600"},
  {id:9,name:"Croissant",category:"Makanan",price:22000,image:"https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600"},
  {id:10,name:"Waffle",category:"Makanan",price:25000,image:"https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600"}
];

const areas = [
  {name:"Indoor",tables:[1,2,3,4,5,6]},
  {name:"Outdoor",tables:[7,8,9,10,11,12]},
  {name:"Lantai 2",tables:[13,14,15,16,17,18]}
];

const occupiedTables = [4,9,15,18];
const STATUS = ["Menunggu","Diproses","Siap Diambil","Selesai"];

let cart = JSON.parse(localStorage.getItem("kopiNakoCart") || "[]");
let selectedTable = null;
let activeCategory = "Semua";
let lastOrderId = null;

function rupiah(value){
  return new Intl.NumberFormat("id-ID",{style:"currency",currency:"IDR",maximumFractionDigits:0}).format(value);
}
function getOrders(){
  return JSON.parse(localStorage.getItem("kopiNakoOrders") || "[]");
}
function saveOrders(orders){
  localStorage.setItem("kopiNakoOrders",JSON.stringify(orders));
}
function saveCart(){
  localStorage.setItem("kopiNakoCart",JSON.stringify(cart));
  updateCartCount();
}
function updateCartCount(){
  const count = cart.reduce((sum,item)=>sum+item.qty,0);
  document.getElementById("cart-count").textContent = count;
}
function showToast(message){
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(()=>toast.classList.remove("show"),2500);
}
function showPage(pageId){
  document.querySelectorAll(".page").forEach(page=>page.classList.remove("active"));
  const page = document.getElementById(pageId);
  if(page) page.classList.add("active");
  document.getElementById("main-nav").classList.remove("open");

  if(pageId==="tables") renderTables();
  if(pageId==="cart") renderCart();
  if(pageId==="staff") renderStaff();
  window.scrollTo({top:0,behavior:"smooth"});
}

document.addEventListener("click",event=>{
  const nav = event.target.closest("[data-page]");
  if(nav){
    const target = nav.dataset.page;
    if(target==="cart") renderCart();
    showPage(target);
  }
});

document.getElementById("nav-toggle").addEventListener("click",()=>{
  document.getElementById("main-nav").classList.toggle("open");
});

function menuCard(item){
  const cartItem = cart.find(product => product.id === item.id);
  const qty = cartItem ? cartItem.qty : 0;

  return `
    <article class="menu-card">
      <div class="menu-picture">
        <img src="${item.image}" alt="${item.name}" loading="lazy"
          onerror="this.style.display='none';this.parentElement.classList.add('image-fallback');this.parentElement.textContent='☕';">
        <span class="category-tag">${item.category}</span>
      </div>
      <div class="menu-info">
        <h3>${item.name}</h3>
        <p>${rupiah(item.price)}</p>

        <div class="menu-quantity">
          <button class="quantity-btn menu-minus"
            data-id="${item.id}" ${qty === 0 ? "disabled" : ""}>−</button>

          <strong>${qty}</strong>

          <button class="quantity-btn menu-plus"
            data-id="${item.id}">+</button>
        </div>
      </div>
    </article>`;
}

function renderMenu(){
  const filtered = activeCategory==="Semua" ? menuData : menuData.filter(item=>item.category===activeCategory);
  document.getElementById("menu-list").innerHTML = filtered.map(menuCard).join("");
  document.getElementById("featured-menu").innerHTML = menuData.slice(0,4).map(menuCard).join("");
}

document.addEventListener("click", event => {
  const plus = event.target.closest(".menu-plus");
  const minus = event.target.closest(".menu-minus");

  if (!plus && !minus) return;

  const id = Number((plus || minus).dataset.id);
  const product = menuData.find(item => item.id === id);
  if (!product) return;

  const existing = cart.find(item => item.id === id);

  if (plus) {
    if (existing) {
      existing.qty++;
    } else {
      cart.push({...product, qty: 1});
    }
  }

  if (minus && existing) {
    existing.qty--;
    if (existing.qty <= 0) {
      cart = cart.filter(item => item.id !== id);
    }
  }

  saveCart();
  renderMenu();
});

document.getElementById("menu-filters").addEventListener("click",event=>{
  const button = event.target.closest("[data-category]");
  if(!button) return;
  activeCategory = button.dataset.category;
  document.querySelectorAll(".filter-btn").forEach(btn=>btn.classList.toggle("active",btn===button));
  renderMenu();
});

document.addEventListener("click",event=>{
  const add = event.target.closest(".add-menu");
  if(!add) return;
  const id = Number(add.dataset.id);
  const product = menuData.find(item=>item.id===id);
  const existing = cart.find(item=>item.id===id);
  if(existing) existing.qty++;
  else cart.push({...product,qty:1});
  saveCart();
  showToast(product.name+" ditambahkan ke keranjang");
});

function renderTables(){
  const container = document.getElementById("table-list");
  container.innerHTML = areas.map(area=>`
    <div class="area-card">
      <div class="area-heading"><h2>${area.name}</h2><span>${area.tables.length} Meja</span></div>
      <div class="floor-plan">
        <div class="floor-label">AREA ${area.name.toUpperCase()}</div>
        <div class="table-grid">
          ${area.tables.map(id=>{
            const occupied = occupiedTables.includes(id);
            const selected = selectedTable===id;
            return `<button class="table-card ${occupied?"occupied":""} ${selected?"selected":""}"
              data-table-id="${id}" ${occupied?"disabled":""}>
              <span class="chair">●</span><strong>Meja ${id}</strong><span class="chair">●</span>
            </button>`;
          }).join("")}
        </div>
        <div class="floor-footer">JALUR PELANGGAN</div>
      </div>
    </div>`).join("");
  updateTableLabel();
}

function updateTableLabel(){
  const label = selectedTable ? "Meja "+selectedTable+" dipilih" : "Belum memilih meja";
  document.getElementById("selected-table-label").textContent = label;
  document.getElementById("checkout-table").value = selectedTable ? "Meja "+selectedTable : "";
}

document.getElementById("table-list").addEventListener("click",event=>{
  const button = event.target.closest("[data-table-id]");
  if(!button || button.disabled) return;
  selectedTable = Number(button.dataset.tableId);
  renderTables();
  showToast("Meja "+selectedTable+" berhasil dipilih");
});

function renderCart(){
  const container = document.getElementById("cart-items");
  if(cart.length===0){
    container.innerHTML = `<div class="empty-state"><span>🛒</span><h3>Keranjang masih kosong</h3><p>Silakan pilih menu terlebih dahulu.</p><button class="btn btn-primary" data-page="menu">Pilih Menu</button></div>`;
  }else{
    container.innerHTML = cart.map(item=>`
      <div class="cart-item">
        <div><h3>${item.name}</h3><p>${rupiah(item.price)} / item</p></div>
        <div class="quantity-control">
          <button data-cart-action="minus" data-id="${item.id}">−</button>
          <strong>${item.qty}</strong>
          <button data-cart-action="plus" data-id="${item.id}">+</button>
        </div>
        <strong>${rupiah(item.price*item.qty)}</strong>
      </div>`).join("");
  }
  const count = cart.reduce((sum,item)=>sum+item.qty,0);
  const total = cart.reduce((sum,item)=>sum+item.price*item.qty,0);
  document.getElementById("summary-count").textContent = count+" item";
  document.getElementById("cart-total").textContent = rupiah(total);
  document.getElementById("checkout-form").classList.add("hidden");
}

document.getElementById("cart-items").addEventListener("click",event=>{
  const button = event.target.closest("[data-cart-action]");
  if(!button) return;
  const id = Number(button.dataset.id);
  const item = cart.find(product=>product.id===id);
  if(!item) return;
  if(button.dataset.cartAction==="plus") item.qty++;
  else item.qty--;
  cart = cart.filter(product=>product.qty>0);
  saveCart();
  renderCart();
});

document.getElementById("checkout-button").addEventListener("click",()=>{
  if(cart.length===0) return showToast("Keranjang masih kosong");
  document.getElementById("checkout-form").classList.remove("hidden");
  document.getElementById("checkout-form").scrollIntoView({behavior:"smooth"});
});

document.getElementById("order-type").addEventListener("change",event=>{
  const isDineIn = event.target.value==="Dine In";
  document.getElementById("checkout-table").closest("label").style.display=isDineIn?"grid":"none";
  if(!isDineIn) selectedTable=null;
});

document.getElementById("order-form").addEventListener("submit",event=>{
  event.preventDefault();
  if(cart.length===0) return showToast("Keranjang masih kosong");
  const type = document.getElementById("order-type").value;
  if(type==="Dine In" && !selectedTable){
    showToast("Silakan pilih meja terlebih dahulu");
    showPage("tables");
    return;
  }

  const orders = getOrders();
  const order = {
    id:"KN"+Date.now().toString().slice(-7),
    name:document.getElementById("customer-name").value.trim(),
    type,
    table:type==="Dine In" ? selectedTable : null,
    payment:document.getElementById("payment-method").value,
    note:document.getElementById("order-note").value.trim(),
    items:cart.map(item=>({...item})),
    total:cart.reduce((sum,item)=>sum+item.price*item.qty,0),
    status:"Menunggu",
    createdAt:new Date().toISOString()
  };
  orders.unshift(order);
  saveOrders(orders);
  lastOrderId=order.id;
  cart=[];
  selectedTable=null;
  saveCart();
  document.getElementById("order-form").reset();
  document.getElementById("success-detail").innerHTML=`
    <div class="receipt">
      <p>Nomor Pesanan <strong>${order.id}</strong></p>
      <p>Nama <strong>${order.name}</strong></p>
      <p>Tipe <strong>${order.type}</strong></p>
      <p>Meja <strong>${order.table||"—"}</strong></p>
      <p>Pembayaran <strong>${order.payment}</strong></p>
      <p>Total <strong>${rupiah(order.total)}</strong></p>
      <p>Status <strong>${order.status}</strong></p>
    </div>`;
  showPage("success");
});

function renderStaff(){
  const loggedIn=sessionStorage.getItem("kopiNakoStaff")==="true";
  document.getElementById("staff-login").classList.toggle("hidden",loggedIn);
  document.getElementById("staff-dashboard").classList.toggle("hidden",!loggedIn);
  if(loggedIn) renderDashboard();
}

document.getElementById("staff-login-form").addEventListener("submit",event=>{
  event.preventDefault();
  const username=document.getElementById("staff-username").value;
  const password=document.getElementById("staff-password").value;
  if(username==="staff" && password==="12345"){
    sessionStorage.setItem("kopiNakoStaff","true");
    renderStaff();
    showToast("Berhasil masuk");
  }else showToast("Username atau password salah");
});

document.getElementById("staff-logout").addEventListener("click",()=>{
  sessionStorage.removeItem("kopiNakoStaff");
  renderStaff();
  showToast("Berhasil keluar");
});

function renderDashboard(){
  const orders=getOrders();
  const active=orders.filter(order=>order.status!=="Selesai");
  const completed=orders.filter(order=>order.status==="Selesai");
  const revenue=completed.reduce((sum,order)=>sum+order.total,0);
  const itemCounts={};
  orders.forEach(order=>order.items.forEach(item=>{
    itemCounts[item.name]=(itemCounts[item.name]||0)+item.qty;
  }));
  const best=Object.entries(itemCounts).sort((a,b)=>b[1]-a[1])[0];

  document.getElementById("stat-orders").textContent=orders.length;
  document.getElementById("stat-active").textContent=active.length;
  document.getElementById("stat-revenue").textContent=rupiah(revenue);
  document.getElementById("stat-best").textContent=best?best[0]:"-";

  const container=document.getElementById("staff-orders");
  container.innerHTML=orders.length?orders.map(order=>`
    <article class="order-card">
      <div class="order-card-head">
        <div><strong>${order.id}</strong><p>${escapeHTML(order.name)} • ${order.type}${order.table?" • Meja "+order.table:""}</p></div>
        <span class="status status-${order.status.replaceAll(" ","-").toLowerCase()}">${order.status}</span>
      </div>
      <div class="order-products">
        ${order.items.map(item=>`<p>${escapeHTML(item.name)} × ${item.qty}</p>`).join("")}
      </div>
      ${order.note?`<p class="order-note">Catatan: ${escapeHTML(order.note)}</p>`:""}
      <div class="order-card-bottom">
        <strong>${rupiah(order.total)}</strong>
        <label class="status-control">Ubah status
          <select data-order-status="${order.id}">
            ${STATUS.map(status=>`<option value="${status}" ${order.status===status?"selected":""}>${status}</option>`).join("")}
          </select>
        </label>
      </div>
    </article>`).join(""):`<div class="empty-state"><h3>Belum ada pesanan</h3><p>Pesanan pelanggan akan tampil di sini.</p></div>`;

  const sales=document.getElementById("sales-menu-list");
  const sorted=Object.entries(itemCounts).sort((a,b)=>b[1]-a[1]);
  sales.innerHTML=sorted.length?sorted.map(([name,qty])=>`
    <div class="sales-row"><span>${escapeHTML(name)}</span><strong>${qty} terjual</strong></div>
  `).join(""):`<p>Belum ada data penjualan.</p>`;
}

function escapeHTML(value){
  return String(value).replace(/[&<>"']/g,char=>({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[char]));
}

document.getElementById("staff-orders").addEventListener("change",event=>{
  const select=event.target.closest("[data-order-status]");
  if(!select) return;
  const orders=getOrders();
  const order=orders.find(item=>item.id===select.dataset.orderStatus);
  if(!order) return;
  order.status=select.value;
  saveOrders(orders);
  renderDashboard();
  showToast("Status pesanan diperbarui");
});

document.getElementById("refresh-orders").addEventListener("click",renderDashboard);

document.querySelectorAll("[data-staff-tab]").forEach(button=>{
  button.addEventListener("click",()=>{
    document.querySelectorAll(".staff-tab").forEach(tab=>tab.classList.toggle("active",tab===button));
    const sales=button.dataset.staffTab==="sales";
    document.getElementById("staff-orders-panel").classList.toggle("hidden",sales);
    document.getElementById("staff-sales-panel").classList.toggle("hidden",!sales);
  });
});

function init(){
  renderMenu();
  updateCartCount();
  renderTables();
  renderCart();
}
init();
