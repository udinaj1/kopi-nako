"use strict";

/* =====================================
   1. DATA MENU
===================================== */

const menuData = [
  {id:1,name:"Kopi Nako",price:18000,category:"Kopi",image:"https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600"},
  {id:2,name:"Es Kopi Aren",price:20000,category:"Kopi",image:"https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600"},
  {id:3,name:"Americano",price:15000,category:"Kopi",image:"https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600"},
  {id:4,name:"Cappuccino",price:22000,category:"Kopi",image:"https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600"},
  {id:5,name:"Matcha Latte",price:23000,category:"Non Kopi",image:"https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600"},
  {id:6,name:"Chocolate",price:20000,category:"Non Kopi",image:"https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600"},
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

/* =====================================
   2. PENYIMPANAN DATA
===================================== */

function loadData(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.error("Gagal membaca data:", error);
    return fallback;
  }
}

let cart = loadData("kopinako_cart", []);
let orders = loadData("kopinako_orders", []);
let selectedTable = loadData("kopinako_selected_table", null);

let currentRole = "Kasir";
let currentCategory = "Semua";
let currentTab = "orders";

let menuQuantities = {
  1:0, 2:0, 3:0, 4:0, 5:0,
  6:0, 7:0, 8:0, 9:0, 10:0
};

function saveData() {
  try {
    localStorage.setItem("kopinako_cart", JSON.stringify(cart));
    localStorage.setItem("kopinako_orders", JSON.stringify(orders));
    localStorage.setItem("kopinako_selected_table", JSON.stringify(selectedTable));
  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    alert("Penyimpanan gagal. Periksa kapasitas penyimpanan browser.");
  }
}

/* =====================================
   3. FUNGSI BANTU
===================================== */

function rupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style:"currency",
    currency:"IDR",
    maximumFractionDigits:0
  }).format(number);
}

function getTotal() {
  return cart.reduce((sum,item) => sum + item.price * item.qty, 0);
}

function isDrink(item) {
  return item.category === "Kopi" ||
         item.category === "Non Kopi";
}

function isFood(item) {
  return item.category === "Makanan";
}

function getOrderStatus(order) {
  const hasDrink = order.items.some(isDrink);
  const hasFood = order.items.some(isFood);

  const drinkDone = !hasDrink || order.drinkStatus === "Selesai";
  const foodDone = !hasFood || order.foodStatus === "Selesai";

  if (drinkDone && foodDone) return "Selesai";

  if (
    order.drinkStatus === "Diproses" ||
    order.foodStatus === "Diproses" ||
    order.drinkStatus === "Selesai" ||
    order.foodStatus === "Selesai"
  ) {
    return "Diproses";
  }

  return "Menunggu";
}

/* Menyesuaikan pesanan lama agar tetap bisa digunakan */
function normalizeOrders() {
  orders.forEach(order => {
    const hasDrink = order.items.some(isDrink);
    const hasFood = order.items.some(isFood);

    if (hasDrink && !order.drinkStatus) {
      order.drinkStatus = order.status === "Selesai"
        ? "Selesai"
        : "Menunggu";
    }

    if (hasFood && !order.foodStatus) {
      order.foodStatus = order.status === "Selesai"
        ? "Selesai"
        : "Menunggu";
    }

    if (!order.payment) {
      order.payment = "Belum Dibayar";
    }

    order.status = getOrderStatus(order);
  });

  saveData();
}

/* =====================================
   4. NAVIGASI HALAMAN
===================================== */

function showPage(pageId) {
  const target = document.getElementById(pageId);
  if (!target) return;

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  target.classList.add("active");

  const navMenu = document.getElementById("navMenu");
  if (navMenu) navMenu.classList.remove("open");

  window.scrollTo({
    top:0,
    behavior:"smooth"
  });

  if (pageId === "menu") renderMenu();
  if (pageId === "cart") renderCart();
  if (pageId === "tables") renderTables();
  if (pageId === "dashboard") renderDashboard();
}

/* =====================================
   5. MENU PRODUK
===================================== */

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
            type="button"
            class="quantity-btn"
            data-menu-qty="-1"
            data-id="${product.id}"
          >−</button>

          <span class="quantity-number">${qty}</span>

          <button
            type="button"
            class="quantity-btn"
            data-menu-qty="1"
            data-id="${product.id}"
          >+</button>
        </div>

        <button
          type="button"
          class="add-btn menu-add-btn"
          data-add="${product.id}"
        >
          Tambah ke Keranjang
        </button>
      </div>
    </article>
  `;
}

function renderFeaturedMenu() {
  const container = document.getElementById("featuredMenu");
  if (!container) return;

  container.innerHTML = menuData
    .slice(0,4)
    .map(createProductCard)
    .join("");
}

function renderMenu() {
  const searchInput = document.getElementById("searchMenu");
  const container = document.getElementById("menuList");

  if (!searchInput || !container) return;

  const keyword = searchInput.value.toLowerCase().trim();

  const filtered = menuData.filter(product => {
    const categoryMatch =
      currentCategory === "Semua" ||
      product.category === currentCategory;

    const searchMatch =
      product.name.toLowerCase().includes(keyword);

    return categoryMatch && searchMatch;
  });

  container.innerHTML = filtered.length
    ? filtered.map(createProductCard).join("")
    : `<div class="empty-state">Menu tidak ditemukan.</div>`;

  document.querySelectorAll(".filter-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.category === currentCategory
    );
  });
}

/* =====================================
   6. KERANJANG
===================================== */

function updateCartCount() {
  const count = document.getElementById("cartCount");
  if (!count) return;

  count.textContent = cart.reduce(
    (sum,item) => sum + item.qty, 0
  );
}

function addToCart(id) {
  const product = menuData.find(
    item => item.id === Number(id)
  );

  if (!product) return;

  const quantity = menuQuantities[product.id] ?? 0;

  if (quantity <= 0) {
    alert("Silakan pilih jumlah menu terlebih dahulu.");
    return;
  }

  const existing = cart.find(
    item => item.id === product.id
  );

  if (existing) {
    existing.qty += quantity;
  } else {
    cart.push({
      ...product,
      qty:quantity
    });
  }

  menuQuantities[product.id] = 0;

  saveData();
  updateCartCount();
  renderMenu();
  renderFeaturedMenu();

  alert(quantity + " " + product.name + " berhasil ditambahkan.");
}

function changeMenuQuantity(id, change) {
  const productId = Number(id);

  menuQuantities[productId] = Math.max(
    0,
    (menuQuantities[productId] ?? 0) + Number(change)
  );

  renderMenu();
  renderFeaturedMenu();
}

function renderCart() {
  const container = document.getElementById("cartItems");
  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Keranjang masih kosong</h3>
        <p>Silakan pilih menu terlebih dahulu.</p>
        <br>
        <button type="button" class="btn btn-primary" data-page="menu">
          Pilih Menu
        </button>
      </div>
    `;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div>
          <h3>${item.name}</h3>
          <p>${rupiah(item.price)} × ${item.qty}</p>
          <strong>${rupiah(item.price * item.qty)}</strong>
        </div>

        <div class="cart-controls">
          <button type="button" data-qty="-1" data-id="${item.id}">−</button>
          <strong>${item.qty}</strong>
          <button type="button" data-qty="1" data-id="${item.id}">+</button>
          <button type="button" class="remove-btn" data-remove="${item.id}">
            Hapus
          </button>
        </div>
      </div>
    `).join("");
  }

  document.getElementById("cartTotal").textContent =
    rupiah(getTotal());

  document.getElementById("cartTableInfo").textContent =
    selectedTable
      ? "Meja yang dipilih: Meja " + String(selectedTable).padStart(2,"0")
      : "Meja belum dipilih.";

  updateCartCount();
}

function changeQuantity(id, change) {
  const item = cart.find(
    product => product.id === Number(id)
  );

  if (!item) return;

  item.qty += Number(change);

  if (item.qty <= 0) {
    cart = cart.filter(
      product => product.id !== Number(id)
    );
  }

  saveData();
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter(
    item => item.id !== Number(id)
  );

  saveData();
  renderCart();
}

/* =====================================
   7. PILIH MEJA
===================================== */

function renderTables() {
  const container = document.getElementById("tableList");
  const selectedText = document.getElementById("selectedTableText");

  if (!container || !selectedText) return;

  container.innerHTML = tableData.map(table => {
    const selected = selectedTable === table.id;

    const status = table.occupied
      ? "Terisi"
      : selected
        ? "Dipilih"
        : "Tersedia";

    const css = table.occupied
      ? "occupied"
      : selected
        ? "selected"
        : "";

    return `
      <button
        type="button"
        class="table-card ${css}"
        data-table="${table.id}"
        ${table.occupied ? "disabled" : ""}
      >
        Meja ${String(table.id).padStart(2,"0")}
        <small>${status}</small>
      </button>
    `;
  }).join("");

  selectedText.textContent = selectedTable
    ? "Anda memilih Meja " + String(selectedTable).padStart(2,"0")
    : "Belum ada meja yang dipilih.";
}

function chooseTable(id) {
  const table = tableData.find(
    item => item.id === Number(id)
  );

  if (!table || table.occupied) return;

  selectedTable = table.id;

  saveData();
  renderTables();
}

/* =====================================
   8. CHECKOUT
===================================== */

function checkout() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong.");
    showPage("menu");
    return;
  }

  if (!selectedTable) {
    alert("Silakan pilih meja terlebih dahulu.");
    showPage("tables");
    return;
  }

  const order = {
    id:"KN-" + Date.now().toString().slice(-7),
    date:new Date().toLocaleString("id-ID"),
    table:selectedTable,
    items:cart.map(item => ({...item})),
    total:getTotal(),

    status:"Menunggu",
    payment:"Belum Dibayar",

    drinkStatus: cart.some(isDrink) ? "Menunggu" : null,
    foodStatus: cart.some(isFood) ? "Menunggu" : null
  };

  orders.unshift(order);

  document.getElementById("successDetail").innerHTML = `
    <p><strong>Nomor Pesanan:</strong> ${order.id}</p>
    <p><strong>Meja:</strong> ${order.table}</p>
    <p><strong>Total:</strong> ${rupiah(order.total)}</p>
    <p><strong>Waktu:</strong> ${order.date}</p>

    <hr style="margin:12px 0">

    ${order.items.map(item => `
      <p>${item.name} × ${item.qty} — ${rupiah(item.price * item.qty)}</p>
    `).join("")}

    <p><strong>Status:</strong> ${order.status}</p>
  `;

  cart = [];
  selectedTable = null;

  saveData();
  updateCartCount();

  showPage("success");
}

/* =====================================
   9. DASHBOARD STAFF
===================================== */

const roleDescriptions = {
  Kasir:"Kelola pesanan dan pembayaran pelanggan.",
  Barista:"Pantau dan proses pembuatan minuman.",
  Dapur:"Pantau dan proses pembuatan makanan.",
  Waiter:"Pantau pesanan dan meja pelanggan.",
  Owner:"Pantau seluruh aktivitas dan laporan penjualan."
};

function openDashboard(role) {
  currentRole = role;
  currentTab = "orders";

  document.getElementById("dashboardTitle").textContent =
    "Dashboard " + role;

  document.getElementById("dashboardDescription").textContent =
    roleDescriptions[role] || "Dashboard karyawan.";

  showPage("dashboard");
}

/* =====================================
   10. HAK AKSES TAB
===================================== */

function updateDashboardTabs() {
  const allowedTabs = {
    Barista:["orders"],
    Dapur:["orders"],
    Kasir:["orders","report"],
    Waiter:["orders","tables"],
    Owner:["orders","tables","report"]
  };

  const allowed = allowedTabs[currentRole] || ["orders"];

  document.querySelectorAll(".dashboard-tabs .tab-btn").forEach(button => {
    const visible = allowed.includes(button.dataset.tab);

    button.hidden = !visible;

    if (!visible && button.dataset.tab === currentTab) {
      currentTab = "orders";
    }
  });
}

/* =====================================
   11. STATISTIK DASHBOARD
===================================== */

function renderDashboard() {
  updateDashboardTabs();

  const waiting = orders.filter(
    order => order.status === "Menunggu"
  ).length;

  const done = orders.filter(
    order => order.status === "Selesai"
  ).length;

  const sales = orders
    .filter(order => order.payment === "Dibayar")
    .reduce((sum,order) => sum + order.total,0);

  document.getElementById("statOrders").textContent =
    orders.length;

  document.getElementById("statWaiting").textContent =
    waiting;

  document.getElementById("statDone").textContent =
    done;

  document.getElementById("statSales").textContent =
    rupiah(sales);

  document.querySelectorAll(".tab-btn").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.tab === currentTab
    );
  });

  if (currentTab === "orders") renderDashboardOrders();
  if (currentTab === "tables") renderDashboardTables();
  if (currentTab === "report") renderDashboardReport();
}

/* =====================================
   12. FILTER PESANAN BERDASARKAN ROLE
===================================== */

function getVisibleOrders() {
  if (currentRole === "Barista") {
    return orders.filter(order =>
      order.items.some(isDrink)
    );
  }

  if (currentRole === "Dapur") {
    return orders.filter(order =>
      order.items.some(isFood)
    );
  }

  return orders;
}

function getVisibleItems(order) {
  if (currentRole === "Barista") {
    return order.items.filter(isDrink);
  }

  if (currentRole === "Dapur") {
    return order.items.filter(isFood);
  }

  return order.items;
}

/* =====================================
   13. STATUS SESUAI BAGIAN KERJA
===================================== */

function createStatusControl(order) {
  let statusKey = null;
  let label = "";

  if (currentRole === "Barista") {
    statusKey = "drinkStatus";
    label = "Status Minuman";
  }

  if (currentRole === "Dapur") {
    statusKey = "foodStatus";
    label = "Status Makanan";
  }

  if (!statusKey) return "";

  const currentStatus = order[statusKey] || "Menunggu";

  return `
    <div class="order-actions">
      <label>${label}</label>

      <select
        data-work-status="${order.id}"
        data-status-key="${statusKey}"
      >
        ${["Menunggu","Diproses","Selesai"].map(status => `
          <option
            value="${status}"
            ${currentStatus === status ? "selected" : ""}
          >
            ${status}
          </option>
        `).join("")}
      </select>
    </div>
  `;
}

/* =====================================
   14. TAMPILAN PESANAN DASHBOARD
===================================== */

function renderDashboardOrders() {
  const container = document.getElementById("dashboardContent");

  if (!container) return;

  const visibleOrders = getVisibleOrders();

  if (visibleOrders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Belum ada pesanan</h3>
        <p>Pesanan akan muncul di sini ketika pelanggan melakukan checkout.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = visibleOrders.map(order => {
    const visibleItems = getVisibleItems(order);

    const itemsHTML = visibleItems.map(item => `
      <p>${item.name} × ${item.qty}</p>
    `).join("");

    let extraStatus = "";

    if (currentRole === "Kasir") {
      extraStatus = `
        <p>
          <strong>Pembayaran:</strong>
          <span class="status">
            ${order.payment}
          </span>
        </p>
      `;
    }

    if (currentRole === "Barista") {
      extraStatus = `
        <p><strong>Status minuman:</strong> ${order.drinkStatus}</p>
      `;
    }

    if (currentRole === "Dapur") {
      extraStatus = `
        <p><strong>Status makanan:</strong> ${order.foodStatus}</p>
      `;
    }

    if (currentRole === "Waiter" || currentRole === "Owner") {
      extraStatus = `
        <p><strong>Status minuman:</strong> ${order.drinkStatus || "-"}</p>
        <p><strong>Status makanan:</strong> ${order.foodStatus || "-"}</p>
        <p><strong>Pembayaran:</strong> ${order.payment}</p>
      `;
    }

    let actionHTML = "";

    if (currentRole === "Kasir" && order.payment !== "Dibayar") {
      actionHTML = `
        <div class="order-actions">
          <button
            type="button"
            class="btn btn-primary"
            data-payment="${order.id}"
          >
            Tandai Dibayar
          </button>
        </div>
      `;
    }

    if (
      currentRole === "Barista" ||
      currentRole === "Dapur"
    ) {
      actionHTML = createStatusControl(order);
    }

    return `
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

        <div class="order-items">
          <strong>Pesanan:</strong>
          ${itemsHTML}
        </div>

        <p><strong>Total pesanan:</strong> ${rupiah(
          currentRole === "Barista" || currentRole === "Dapur"
            ? visibleItems.reduce((sum,item) => sum + item.price * item.qty,0)
            : order.total
        )}</p>

        ${extraStatus}

        ${actionHTML}

      </article>
    `;
  }).join("");
}

/* =====================================
   15. DASHBOARD MEJA
==========================
