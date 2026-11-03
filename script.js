"use strict";

/* DATA MENU */

const menuData = [
  {id:1,name:"Kopi Nako",price:18000,category:"Kopi",image:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600"},
  {id:2,name:"Es Kopi Aren",price:20000,category:"Kopi",image:"https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600"},
  {id:3,name:"Americano",price:15000,category:"Kopi",image:"https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"},
  {id:4,name:"Cappuccino",price:22000,category:"Kopi",image:"https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600"},
  {id:5,name:"Matcha Latte",price:23000,category:"Non Kopi",image:"https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600"},
  {id:6,name:"Chocolate",price:20000,category:"Non Kopi",image:"https://images.unsplash.com/photo-1542990253-0b8be4c7e4c5?w=600"},
  {id:7,name:"Lemon Tea",price:15000,category:"Non Kopi",image:"https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=600"},
  {id:8,name:"French Fries",price:18000,category:"Makanan",image:"https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600"},
  {id:9,name:"Croissant",price:22000,category:"Makanan",image:"https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600"},
  {id:10,name:"Waffle",price:25000,category:"Makanan",image:"https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600"}
];

const tableData = [
  {id:1,occupied:false},
  {id:2,occupied:false},
  {id:3,occupied:true},
  {id:4,occupied:false},
  {id:5,occupied:false},
  {id:6,occupied:true},
  {id:7,occupied:false},
  {id:8,occupied:false}
];

/* PENYIMPANAN DATA */

function loadData(key,fallback) {
  try {
    const saved=localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch(error) {
    console.error(error);
    return fallback;
  }
}

let cart=loadData("kopinako_cart",[]);
let orders=loadData("kopinako_orders",[]);
let selectedTable=loadData("kopinako_selected_table",null);
let currentRole="Kasir";
let currentCategory="Semua";
let currentTab="orders";
let menuQuantities = {};
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
  6: 0,
  7: 0,
  8: 0,
  9: 0,
  10: 0
};

function saveData() {
  localStorage.setItem("kopinako_cart",JSON.stringify(cart));
  localStorage.setItem("kopinako_orders",JSON.stringify(orders));
  localStorage.setItem("kopinako_selected_table",JSON.stringify(selectedTable));
}

function rupiah(number) {
  return new Intl.NumberFormat("id-ID",{
    style:"currency",
    currency:"IDR",
    maximumFractionDigits:0
  }).format(number);
}

function getTotal() {
  return cart.reduce((sum,item)=>sum+item.price*item.qty,0);
}

/* NAVIGASI */

function showPage(pageId) {
  const target=document.getElementById(pageId);
  if(!target) return;

  document.querySelectorAll(".page").forEach(page=>{
    page.classList.remove("active");
  });

  target.classList.add("active");
  document.getElementById("navMenu").classList.remove("open");
  window.scrollTo({top:0,behavior:"smooth"});

  if(pageId==="menu") renderMenu();
  if(pageId==="cart") renderCart();
  if(pageId==="tables") renderTables();
  if(pageId==="dashboard") renderDashboard();
}

/* MENU */

function createProductCard(product) {
  const qty = menuQuantities[product.id] ?? 0;

  return `
    <article class="product-card">
      <div class="product-visual">
        <img
          src="${product.image}"
          alt="${product.name}"
          loading="lazy"
          onerror="this.onerror=null;this.src='https://placehold.co/600x400/f1eee5/173d32?text=Foto+Menu'"
        >
      </div>

      <div class="product-info">
        <h3>${product.name}</h3>
        <p>${product.category}</p>

        <div class="product-bottom">
          <span class="price">${rupiah(product.price)}</span>
        </div>

        <div class="menu-quantity">
          <button
            class="quantity-btn"
            data-menu-qty="-1"
            data-id="${product.id}"
            aria-label="Kurangi jumlah ${product.name}"
          >−</button>

          <span class="quantity-number">${qty}</span>

          <button
            class="quantity-btn"
            data-menu-qty="1"
            data-id="${product.id}"
            aria-label="Tambah jumlah ${product.name}"
          >+</button>
        </div>

        <button class="add-btn menu-add-btn" data-add="${product.id}">
          Tambah ke Keranjang
        </button>
      </div>
    </article>
  `;
}

function renderFeaturedMenu() {
  document.getElementById("featuredMenu").innerHTML=
    menuData.slice(0,4).map(createProductCard).join("");
}

function renderMenu() {
  const keyword=document.getElementById("searchMenu").value.toLowerCase().trim();

  const filtered=menuData.filter(product=>{
    const categoryMatch=currentCategory==="Semua" ||
      product.category===currentCategory;
    const searchMatch=product.name.toLowerCase().includes(keyword);
    return categoryMatch && searchMatch;
  });

  const container=document.getElementById("menuList");

  container.innerHTML=filtered.length
    ? filtered.map(createProductCard).join("")
    : `<div class="empty-state">Menu tidak ditemukan.</div>`;

  document.querySelectorAll(".filter-btn").forEach(button=>{
    button.classList.toggle(
      "active",
      button.dataset.category===currentCategory
    );
  });
}

/* KERANJANG */

function updateCartCount() {
  document.getElementById("cartCount").textContent=
    cart.reduce((sum,item)=>sum+item.qty,0);
}

function addToCart(id) {
  const product = menuData.find(item => item.id === Number(id));
  if (!product) return;

  const quantity = menuQuantities[product.id] ?? 0;

  if (quantity === 0) {
    alert("Jumlah menu tidak boleh 0.");
    return;
  }

  const existing = cart.find(item => item.id === product.id);

  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({
      ...product,
      qty: quantity
    });
  }

  menuQuantities[product.id] = 1;

  saveData();
  updateCartCount();

  renderMenu();
  renderFeaturedMenu();

  alert(quantity + " " + product.name + " berhasil ditambahkan.");

  if (document.getElementById("cart").classList.contains("active")) {
    renderCart();
  }
}

/* FUNGSI TOMBOL + DAN - PADA KARTU MENU */

function changeMenuQuantity(id, change) {
  const productId = Number(id);
  const currentQty = menuQuantities[productId] || 1;

  menuQuantities[productId] = Math.max(
    0,
    currentQty + Number(change)
  );

  renderMenu();
  renderFeaturedMenu();
}

function renderCart() {
  const container=document.getElementById("cartItems");

  if(cart.length===0) {
    container.innerHTML=`
      <div class="empty-state">
        <h3>Keranjang masih kosong</h3>
        <p>Silakan pilih menu terlebih dahulu.</p>
        <br>
        <button class="btn btn-primary" data-page="menu">Pilih Menu</button>
      </div>
    `;
  } else {
    container.innerHTML=cart.map(item=>`
      <div class="cart-item">
        <div>
          <h3>${item.name}</h3>
          <p>${rupiah(item.price)} × ${item.qty}</p>
          <strong>${rupiah(item.price*item.qty)}</strong>
        </div>
        <div class="cart-controls">
          <button data-qty="-1" data-id="${item.id}">−</button>
          <strong>${item.qty}</strong>
          <button data-qty="1" data-id="${item.id}">+</button>
          <button class="remove-btn" data-remove="${item.id}">Hapus</button>
        </div>
      </div>
    `).join("");
  }

  document.getElementById("cartTotal").textContent=rupiah(getTotal());
  document.getElementById("cartTableInfo").textContent=selectedTable
    ? "Meja yang dipilih: Meja "+String(selectedTable).padStart(2,"0")
    : "Meja belum dipilih.";

  updateCartCount();
}

function changeQuantity(id,change) {
  const item=cart.find(product=>product.id===Number(id));
  if(!item) return;

  item.qty+=Number(change);
  if(item.qty<=0) cart=cart.filter(product=>product.id!==Number(id));

  saveData();
  renderCart();
}

function removeFromCart(id) {
  cart=cart.filter(item=>item.id!==Number(id));
  saveData();
  renderCart();
}

/* MEJA */

function renderTables() {
  document.getElementById("tableList").innerHTML=tableData.map(table=>{
    const selected=selectedTable===table.id;
    const status=table.occupied?"Terisi":selected?"Dipilih":"Tersedia";
    const css=table.occupied?"occupied":selected?"selected":"";

    return `
      <button class="table-card ${css}" data-table="${table.id}"
        ${table.occupied?"disabled":""}>
        Meja ${String(table.id).padStart(2,"0")}
        <small>${status}</small>
      </button>
    `;
  }).join("");

  document.getElementById("selectedTableText").textContent=selectedTable
    ? "Anda memilih Meja "+String(selectedTable).padStart(2,"0")
    : "Belum ada meja yang dipilih.";
}

function chooseTable(id) {
  const table=tableData.find(item=>item.id===Number(id));
  if(!table || table.occupied) return;

  selectedTable=table.id;
  saveData();
  renderTables();
}

/* CHECKOUT */

function checkout() {
  if(cart.length===0) {
    alert("Keranjang masih kosong.");
    showPage("menu");
    return;
  }

  if(!selectedTable) {
    alert("Silakan pilih meja terlebih dahulu.");
    showPage("tables");
    return;
  }

  const order={
    id:"KN-"+Date.now().toString().slice(-7),
    date:new Date().toLocaleString("id-ID"),
    table:selectedTable,
    items:cart.map(item=>({...item})),
    total:getTotal(),
    status:"Menunggu",
    payment:"Belum Dibayar"
  };

  orders.unshift(order);
  saveData();

  document.getElementById("successDetail").innerHTML=`
    <p><strong>Nomor Pesanan:</strong> ${order.id}</p>
    <p><strong>Meja:</strong> ${order.table}</p>
    <p><strong>Total:</strong> ${rupiah(order.total)}</p>
    <p><strong>Waktu:</strong> ${order.date}</p>
    <hr style="margin:12px 0">
    ${order.items.map(item=>`
      <p>${item.name} × ${item.qty} — ${rupiah(item.price*item.qty)}</p>
    `).join("")}
    <p><strong>Status:</strong> ${order.status}</p>
  `;

  cart=[];
  selectedTable=null;
  saveData();
  updateCartCount();
  showPage("success");
}

/* DASHBOARD */

function openDashboard(role) {
  currentRole=role;
  currentTab="orders";

  const descriptions={
    Kasir:"Kelola pesanan dan pembayaran pelanggan.",
    Barista:"Pantau pembuatan minuman.",
    Dapur:"Pantau pembuatan makanan.",
    Waiter:"Pantau pesanan dan meja pelanggan.",
    Owner:"Pantau laporan dan penjualan."
  };

  document.getElementById("dashboardTitle").textContent="Dashboard "+role;
  document.getElementById("dashboardDescription").textContent=descriptions[role];

  showPage("dashboard");
  renderDashboard();
}

function renderDashboard() {
  const waiting=orders.filter(o=>o.status==="Menunggu").length;
  const done=orders.filter(o=>o.status==="Selesai").length;
  const sales=orders.filter(o=>o.payment==="Dibayar")
    .reduce((sum,o)=>sum+o.total,0);

  document.getElementById("statOrders").textContent=orders.length;
  document.getElementById("statWaiting").textContent=waiting;
  document.getElementById("statDone").textContent=done;
  document.getElementById("statSales").textContent=rupiah(sales);

  document.querySelectorAll(".tab-btn").forEach(button=>{
    button.classList.toggle("active",button.dataset.tab===currentTab);
  });

  if(currentTab==="orders") renderDashboardOrders();
  if(currentTab==="tables") renderDashboardTables();
  if(currentTab==="report") renderDashboardReport();
}

function renderDashboardOrders() {
  const container=document.getElementById("dashboardContent");

  if(orders.length===0) {
    container.innerHTML=`
      <div class="empty-state">Belum ada pesanan masuk.</div>
    `;
    return;
  }

  container.innerHTML=orders.map(order=>`
    <article class="order-card">
      <div class="order-top">
        <div>
          <h3>${order.id}</h3>
          <p>${order.date}</p>
          <p>Meja ${String(order.table).padStart(2,"0")}</p>
        </div>
        <span class="status ${order.status.toLowerCase().replaceAll(" ","-")}">
          ${order.status}
        </span>
      </div>

      <p><strong>Pesanan:</strong>
        ${order.items.map(item=>item.name+" × "+item.qty).join(", ")}
      </p>
      <p><strong>Total:</strong> ${rupiah(order.total)}</p>
      <p><strong>Pembayaran:</strong> ${order.payment}</p>

      <div class="order-actions">
        <select data-status="${order.id}">
          ${["Menunggu","Diproses","Siap Disajikan","Selesai","Dibatalkan"].map(status=>`
            <option value="${status}" ${order.status===status?"selected":""}>
              ${status}
            </option>
          `).join("")}
        </select>

        <button class="btn btn-outline" data-payment="${order.id}">
          Tandai Dibayar
        </button>
      </div>
    </article>
  `).join("");
}

function renderDashboardTables() {
  document.getElementById("dashboardContent").innerHTML=`
    <h2>Informasi Meja</h2>
    <div class="table-grid">
      ${tableData.map(table=>`
        <div class="table-card ${table.occupied?"occupied":""}"
          style="display:grid;place-content:center;text-align:center">
          Meja ${String(table.id).padStart(2,"0")}
          <small>${table.occupied?"Terisi":"Tersedia"}</small>
        </div>
      `).join("")}
    </div>
  `;
}

function renderDashboardReport() {
  const paid=orders.filter(o=>o.payment==="Dibayar");
  const unpaid=orders.filter(o=>o.payment!=="Dibayar");
  const sales=paid.reduce((sum,o)=>sum+o.total,0);

  document.getElementById("dashboardContent").innerHTML=`
    <div class="report-card">
      <p>Total seluruh pesanan</p><strong>${orders.length}</strong>
    </div>
    <div class="report-card">
      <p>Pesanan sudah dibayar</p><strong>${paid.length}</strong>
    </div>
    <div class="report-card">
      <p>Pesanan belum dibayar</p><strong>${unpaid.length}</strong>
    </div>
    <div class="report-card">
      <p>Total penjualan</p><strong>${rupiah(sales)}</strong>
    </div>
  `;
}

/* SEMUA EVENT TOMBOL */

document.addEventListener("click",function(event) {
  const page=event.target.closest("[data-page]");
  if(page) {
    event.preventDefault();
    showPage(page.dataset.page);
    return;
  }

  const add=event.target.closest("[data-add]");
  if(add) {
    addToCart(add.dataset.add);
    return;
  }

  /* EVENT TOMBOL + DAN - KARTU MENU */
  const menuQty=event.target.closest("[data-menu-qty]");
  if(menuQty) {
    changeMenuQuantity(
      menuQty.dataset.id,
      menuQty.dataset.menuQty
    );
    return;
  }

  const qty=event.target.closest("[data-qty]");
  if(qty) {
    changeQuantity(qty.dataset.id,qty.dataset.qty);
    return;
  }

  const remove=event.target.closest("[data-remove]");
  if(remove) {
    removeFromCart(remove.dataset.remove);
    return;
  }

  const table=event.target.closest("[data-table]");
  if(table) {
    chooseTable(table.dataset.table);
    return;
  }

  const role=event.target.closest("[data-role]");
  if(role) {
    openDashboard(role.dataset.role);
    return;
  }

  const tab=event.target.closest("[data-tab]");
  if(tab) {
    currentTab=tab.dataset.tab;
    renderDashboard();
    return;
  }

  const payment=event.target.closest("[data-payment]");
  if(payment) {
    const order=orders.find(o=>o.id===payment.dataset.payment);
    if(order) {
      order.payment="Dibayar";
      saveData();
      renderDashboard();
      alert("Pembayaran berhasil diperbarui.");
    }
    return;
  }

  const category=event.target.closest("[data-category]");
  if(category) {
    currentCategory=category.dataset.category;
    renderMenu();
    return;
  }

  if(event.target.closest("#checkoutBtn")) {
    checkout();
    return;
  }

  if(event.target.closest("#menuToggle")) {
    document.getElementById("navMenu").classList.toggle("open");
  }
});

/* EVENT INPUT DAN STATUS */

document.addEventListener("input",function(event) {
  if(event.target.id==="searchMenu") renderMenu();
});

document.addEventListener("change",function(event) {
  if(event.target.matches("[data-status]")) {
    const order=orders.find(o=>o.id===event.target.dataset.status);
    if(order) {
      order.status=event.target.value;
      saveData();
      renderDashboard();
    }
  }
});

/* JALANKAN WEBSITE */

function initializeApp() {
  renderFeaturedMenu();
  renderMenu();
  renderTables();
  renderCart();
  updateCartCount();
  showPage("home");
}

initializeApp();
