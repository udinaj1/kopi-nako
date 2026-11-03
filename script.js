// ==========================================
// KOPI NAKO SOLO - JAVASCRIPT
// ==========================================

const menuData = [
  { id: 1, name: "Kopi Nako", category: "Kopi", price: 18000, image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=600" },
  { id: 2, name: "Es Kopi Aren", category: "Kopi", price: 20000, image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=600" },
  { id: 3, name: "Americano", category: "Kopi", price: 15000, image: "https://images.unsplash.com/photo-1510707577719-ae7c14805e3a?w=600" },
  { id: 4, name: "Cappuccino", category: "Kopi", price: 22000, image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=600" },
  { id: 5, name: "Matcha Latte", category: "Non Kopi", price: 23000, image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=600" },
  { id: 6, name: "Chocolate", category: "Non Kopi", price: 20000, image: "https://images.pexels.com/photos/12642348/pexels-photo-12642348.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: 7, name: "Lemon Tea", category: "Non Kopi", price: 15000, image: "https://images.pexels.com/photos/30254785/pexels-photo-30254785.jpeg?auto=compress&cs=tinysrgb&w=800" },
  { id: 8, name: "French Fries", category: "Makanan", price: 18000, image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=600" },
  { id: 9, name: "Croissant", category: "Makanan", price: 22000, image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600" },
  { id: 10, name: "Waffle", category: "Makanan", price: 25000, image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=600" }
];

const areas = [
  { name: "Indoor", prefix: "IN", count: 6 },
  { name: "Outdoor", prefix: "OUT", count: 6 },
  { name: "Lantai 2", prefix: "L2", count: 6 }
];

const occupiedTables = ["IN-04", "OUT-03", "L2-05"];
const statuses = ["Menunggu", "Diproses", "Siap Diambil", "Selesai"];

let cart = JSON.parse(localStorage.getItem("kopiNakoCart") || "[]");
let orders = JSON.parse(localStorage.getItem("kopiNakoOrders") || "[]");
let selectedTable = "";
let orderType = "Dine In";
let activeCategory = "Semua";
let currentStaff = "Kasir";
let currentStaffTab = "dashboard";

// ==========================================
// UTILITAS
// ==========================================

function rupiah(number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(number);
}

function saveCart() {
  localStorage.setItem("kopiNakoCart", JSON.stringify(cart));
  updateCartCount();
}

function saveOrders() {
  localStorage.setItem("kopiNakoOrders", JSON.stringify(orders));
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function today() {
  const date = new Date();
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function formatDate(value) {
  return new Date(value).toLocaleString("id-ID", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  const target = document.getElementById(pageId);
  if (target) target.classList.add("active");

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (pageId === "menu") renderMenu();
  if (pageId === "tables") renderTables();
  if (pageId === "cart") renderCart();
  if (pageId === "staff-dashboard") renderStaff();
  if (pageId === "staff-login") currentStaffTab = "dashboard";
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cart-count").textContent = count;
}

// ==========================================
// MENU PELANGGAN
// ==========================================

function menuCard(item) {
  const cartItem = cart.find(product => product.id === item.id);
  const qty = cartItem ? cartItem.qty : 0;

  return `
    <article class="menu-card">
      <div class="menu-picture">
        <img src="${item.image}" alt="${escapeHTML(item.name)}" loading="lazy"
          onerror="this.style.display='none';this.parentElement.style.background='#e9e9df';this.parentElement.insertAdjacentHTML('beforeend','<span style=&quot;display:grid;place-items:center;height:100%;font-size:45px&quot;>☕</span>')">
        <span class="category-tag">${escapeHTML(item.category)}</span>
      </div>
      <div class="menu-info">
        <h3>${escapeHTML(item.name)}</h3>
        <p>${rupiah(item.price)}</p>
        <div class="menu-quantity">
          <button class="quantity-btn menu-minus" data-id="${item.id}" ${qty === 0 ? "disabled" : ""}>−</button>
          <strong>${qty}</strong>
          <button class="quantity-btn menu-plus" data-id="${item.id}">+</button>
        </div>
      </div>
    </article>
  `;
}

function renderMenu() {
  const filtered = activeCategory === "Semua"
    ? menuData
    : menuData.filter(item => item.category === activeCategory);

  document.getElementById("menu-list").innerHTML =
    filtered.map(menuCard).join("");

  document.getElementById("featured-menu").innerHTML =
    menuData.slice(0, 4).map(menuCard).join("");
}

document.addEventListener("click", function(event) {
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
      cart.push({ ...product, qty: 1 });
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
  renderCart();
});

// Filter kategori
document.querySelectorAll(".category-btn").forEach(button => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;

    document.querySelectorAll(".category-btn").forEach(btn => {
      btn.classList.remove("active");
    });

    button.classList.add("active");
    renderMenu();
  });
});

// ==========================================
// MEJA
// ==========================================

function renderTables() {
  const container = document.getElementById("table-areas");

  container.innerHTML = areas.map(area => {
    let tableHTML = "";

    for (let i = 1; i <= area.count; i++) {
      const number = String(i).padStart(2, "0");
      const tableId = `${area.prefix}-${number}`;
      const occupied = occupiedTables.includes(tableId);
      const selected = selectedTable === tableId;

      tableHTML += `
        <button class="table-card ${occupied ? "occupied" : ""} ${selected ? "selected" : ""}"
          ${occupied ? "disabled" : ""}
          onclick="selectTable('${tableId}')">
          <strong>${tableId}</strong>
          <small>${occupied ? "Terisi" : selected ? "Dipilih" : "Kosong"}</small>
        </button>
      `;
    }

    return `
      <div class="table-area">
        <h3>${area.name}</h3>
        <div class="table-grid">${tableHTML}</div>
      </div>
    `;
  }).join("");

  document.getElementById("selected-table").textContent =
    orderType === "Take Away"
      ? "Pesanan Take Away - tidak menggunakan meja."
      : selectedTable
        ? `Meja yang dipilih: ${selectedTable}`
        : "Belum memilih meja.";
}

function selectTable(tableId) {
  if (occupiedTables.includes(tableId)) return;
  selectedTable = tableId;
  renderTables();
}

document.getElementById("order-type").addEventListener("change", event => {
  orderType = event.target.value;
  if (orderType === "Take Away") selectedTable = "";
  renderTables();
});

// ==========================================
// KERANJANG DAN CHECKOUT
// ==========================================

function cartSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  const container = document.getElementById("cart-items");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Keranjang masih kosong</h3>
        <p>Silakan pilih menu terlebih dahulu.</p>
        <button class="btn btn-primary" onclick="showPage('menu')">Pilih Menu</button>
      </div>
    `;
  } else {
    container.innerHTML = cart.map(item => `
      <div class="cart-row">
        <div>
          <h3>${escapeHTML(item.name)}</h3>
          <p>${rupiah(item.price)} × ${item.qty}</p>
        </div>
        <div class="cart-controls">
          <button onclick="changeCartQty(${item.id},-1)">−</button>
          <strong>${item.qty}</strong>
          <button onclick="changeCartQty(${item.id},1)">+</button>
        </div>
        <strong>${rupiah(item.price * item.qty)}</strong>
      </div>
    `).join("");
  }

  const subtotal = cartSubtotal();
  const tax = Math.round(subtotal * 0.10);

  document.getElementById("cart-subtotal").textContent = rupiah(subtotal);
  document.getElementById("cart-tax").textContent = rupiah(tax);
  document.getElementById("cart-total").textContent = rupiah(subtotal + tax);
}

function changeCartQty(id, change) {
  const item = cart.find(product => product.id === id);
  if (!item) return;

  item.qty += change;

  if (item.qty <= 0) {
    cart = cart.filter(product => product.id !== id);
  }

  saveCart();
  renderCart();
  renderMenu();
}

function checkout() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong.");
    return;
  }

  if (orderType === "Dine In" && !selectedTable) {
    alert("Silakan pilih meja terlebih dahulu.");
    showPage("tables");
    return;
  }

  const subtotal = cartSubtotal();
  const tax = Math.round(subtotal * 0.10);
  const total = subtotal + tax;

  const order = {
    id: "KN-" + Date.now().toString().slice(-7),
    date: new Date().toISOString(),
    customer: "Pelanggan",
    items: cart.map(item => ({ ...item })),
    orderType,
    table: orderType === "Dine In" ? selectedTable : "-",
    subtotal,
    tax,
    total,
    status: "Menunggu",
    paymentStatus: "Belum Dibayar",
    paymentMethod: "-",
    paidAt: null
  };

  orders.unshift(order);
  saveOrders();

  document.getElementById("success-detail").innerHTML = `
    <strong>Nomor Pesanan:</strong> ${order.id}<br>
    <strong>Jenis:</strong> ${order.orderType}<br>
    <strong>Meja:</strong> ${order.table}<br>
    <strong>Total:</strong> ${rupiah(order.total)}<br>
    <strong>Status:</strong> Menunggu pembayaran<br><br>
    ${order.items.map(item =>
      `${escapeHTML(item.name)} × ${item.qty}`
    ).join("<br>")}
  `;

  cart = [];
  selectedTable = "";
  saveCart();
  renderMenu();
  showPage("success");
}

// ==========================================
// STAFF AREA
// ==========================================

const staffMenus = {
  Kasir: [
    ["dashboard", "⌂ Dashboard"],
    ["orders", "▤ Pesanan Masuk"],
    ["reports", "▥ Laporan Penjualan"],
    ["tables", "▦ Meja & Area"]
  ],
  Barista: [
    ["dashboard", "⌂ Dashboard"],
    ["orders", "☕ Antrean Minuman"]
  ],
  Kitchen: [
    ["dashboard", "⌂ Dashboard"],
    ["orders", "♨ Pesanan Makanan"],
    ["stock", "▦ Stok Bahan"]
  ],
  Waiter: [
    ["dashboard", "⌂ Dashboard"],
    ["orders", "▤ Pengantaran"],
    ["tables", "▦ Meja & Area"]
  ],
  Owner: [
    ["dashboard", "⌂ Dashboard"],
    ["orders", "▤ Semua Pesanan"],
    ["reports", "▥ Laporan Penjualan"],
    ["tables", "▦ Meja & Area"],
    ["stock", "▦ Stok Bahan"]
  ]
};

function openStaff(role) {
  currentStaff = role;
  currentStaffTab = "dashboard";
  showPage("staff-dashboard");
}

function staffNavigate(tab) {
  currentStaffTab = tab;
  renderStaff();
}

function getActiveOrders() {
  return orders.filter(order => order.status !== "Selesai");
}

function getPaidOrders() {
  return orders.filter(order => order.paymentStatus === "Lunas");
}

function getSales() {
  return getPaidOrders().reduce((sum, order) => sum + order.total, 0);
}

function renderStaff() {
  document.getElementById("staff-role-name").textContent = currentStaff;
  document.getElementById("staff-welcome").textContent =
    `Selamat Datang, ${currentStaff}!`;

  const nav = staffMenus[currentStaff] || staffMenus.Kasir;

  document.getElementById("staff-nav").innerHTML = nav.map(item => `
    <button class="${currentStaffTab === item[0] ? "active" : ""}"
      onclick="staffNavigate('${item[0]}')">${item[1]}</button>
  `).join("");

  const titles = {
    dashboard: "Dashboard",
    orders: "Pesanan Masuk",
    reports: "Laporan Penjualan",
    tables: "Meja & Area",
    stock: "Stok Bahan"
  };

  document.getElementById("staff-page-title").textContent =
    titles[currentStaffTab] || "Dashboard";

  const content = document.getElementById("staff-content");

  if (currentStaffTab === "dashboard") {
    content.innerHTML = renderStaffDashboard();
  } else if (currentStaffTab === "orders") {
    content.innerHTML = renderStaffOrders();
  } else if (currentStaffTab === "reports") {
    content.innerHTML = renderReports();
  } else if (currentStaffTab === "tables") {
    content.innerHTML = renderStaffTables();
  } else if (currentStaffTab === "stock") {
    content.innerHTML = renderStock();
  }
}

function renderStaffDashboard() {
  const pending = orders.filter(order => order.paymentStatus !== "Lunas").length;
  const paid = getPaidOrders().length;
  const sales = getSales();
  const active = getActiveOrders().length;

  return `
    <div class="stat-grid">
      <div class="stat-card"><span>Pesanan Aktif</span><strong>${active}</strong></div>
      <div class="stat-card"><span>Transaksi Lunas</span><strong>${paid}</strong></div>
      <div class="stat-card"><span>Penjualan</span><strong>${rupiah(sales)}</strong></div>
      <div class="stat-card"><span>Belum Dibayar</span><strong>${pending}</strong></div>
    </div>

    <div class="dashboard-section">
      <h2>Pesanan Terbaru</h2>
      ${orders.length ? orders.slice(0, 5).map(orderCard).join("") : `
        <div class="staff-panel">
          <h3>Belum ada pesanan</h3>
          <p>Pesanan pelanggan akan tampil di sini setelah pelanggan melakukan checkout.</p>
        </div>
      `}
    </div>

    <div class="dashboard-section">
      <h2>Ringkasan Shift</h2>
      <div class="staff-panel">
        <p>Shift aktif: <strong>Shift 1 · Pagi (08.00–16.00)</strong></p>
        <p>Jumlah transaksi lunas: <strong>${paid}</strong></p>
        <p>Total penjualan: <strong>${rupiah(sales)}</strong></p>
      </div>
    </div>
  `;
}

function orderCard(order) {
  const items = order.items.map(item =>
    `${escapeHTML(item.name)} × ${item.qty}`
  ).join("<br>");

  return `
    <div class="order-card">
      <div class="order-head">
        <strong>${escapeHTML(order.id)}</strong>
        <span class="status ${order.status === "Selesai" ? "selesai" : order.status === "Diproses" ? "diproses" : ""}">
          ${escapeHTML(order.status)}
        </span>
      </div>
      <p>
        ${items}<br>
        ${escapeHTML(order.orderType)} · ${escapeHTML(order.table)}<br>
        ${formatDate(order.date)}<br>
        Total: <strong>${rupiah(order.total)}</strong><br>
        Pembayaran: <strong>${escapeHTML(order.paymentStatus)}</strong>
      </p>
      ${staffOrderActions(order)}
    </div>
  `;
}

function staffOrderActions(order) {
  let html = "";

  if (currentStaff === "Kasir" || currentStaff === "Owner") {
    html += `
      <label style="font-size:11px;color:#778078">Pembayaran</label>
      <select onchange="updatePayment('${order.id}',this.value)">
        <option value="Belum Dibayar" ${order.paymentStatus === "Belum Dibayar" ? "selected" : ""}>Belum Dibayar</option>
        <option value="Lunas" ${order.paymentStatus === "Lunas" ? "selected" : ""}>Lunas</option>
      </select>
      <select onchange="updatePaymentMethod('${order.id}',this.value)">
        <option value="-" ${order.paymentMethod === "-" ? "selected" : ""}>Metode pembayaran</option>
        <option value="Tunai" ${order.paymentMethod === "Tunai" ? "selected" : ""}>Tunai</option>
        <option value="QRIS" ${order.paymentMethod === "QRIS" ? "selected" : ""}>QRIS</option>
        <option value="Transfer" ${order.paymentMethod === "Transfer" ? "selected" : ""}>Transfer</option>
      </select>
    `;
  }

  if (["Kasir", "Barista", "Kitchen", "Waiter", "Owner"].includes(currentStaff)) {
    html += `
      <label style="font-size:11px;color:#778078">Status pesanan</label>
      <select onchange="updateOrderStatus('${order.id}',this.value)">
        ${statuses.map(status => `
          <option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>
        `).join("")}
      </select>
    `;
  }

  return html;
}

function updateOrderStatus(id, status) {
  const order = orders.find(item => item.id === id);
  if (!order) return;

  order.status = status;
  saveOrders();
  renderStaff();
}

function updatePayment(id, status) {
  const order = orders.find(item => item.id === id);
  if (!order) return;

  if (status === "Lunas" && order.paymentMethod === "-") {
    alert("Pilih metode pembayaran terlebih dahulu.");
    renderStaff();
    return;
  }

  order.paymentStatus = status;
  order.paidAt = status === "Lunas" ? new Date().toISOString() : null;
  saveOrders();
  renderStaff();
}

function updatePaymentMethod(id, method) {
  const order = orders.find(item => item.id === id);
  if (!order) return;

  order.paymentMethod = method;
  saveOrders();
  renderStaff();
}

// ==========================================
// LAPORAN
// ==========================================

function renderReports() {
  const paid = getPaidOrders();

  return `
    <div class="dashboard-section">
      <h2>Laporan Penjualan</h2>
      <div class="report-filter">
        <label>Mulai
          <input type="date" id="report-start" value="${today()}" onchange="filterReports()">
        </label>
        <label>Sampai
          <input type="date" id="report-end" value="${today()}" onchange="filterReports()">
        </label>
        <label>Metode
          <select id="report-method" onchange="filterReports()">
            <option value="Semua">Semua</option>
            <option value="Tunai">Tunai</option>
            <option value="QRIS">QRIS</option>
            <option value="Transfer">Transfer</option>
          </select>
        </label>
      </div>
      <div id="report-results">${reportResults(paid)}</div>
    </div>
  `;
}

function filterReports() {
  const start = document.getElementById("report-start").value;
  const end = document.getElementById("report-end").value;
  const method = document.getElementById("report-method").value;

  let filtered = getPaidOrders();

  if (start) filtered = filtered.filter(order => order.paidAt && order.paidAt.slice(0, 10) >= start);
  if (end) filtered = filtered.filter(order => order.paidAt && order.paidAt.slice(0, 10) <= end);
  if (method !== "Semua") filtered = filtered.filter(order => order.paymentMethod === method);

  document.getElementById("report-results").innerHTML = reportResults(filtered);
}

function reportResults(data) {
  const total = data.reduce((sum, order) => sum + order.total, 0);
  const subtotal = data.reduce((sum, order) => sum + order.subtotal, 0);
  const tax = data.reduce((sum, order) => sum + order.tax, 0);

  return `
    <div class="stat-grid">
      <div class="stat-card"><span>Total Penjualan</span><strong>${rupiah(total)}</strong></div>
      <div class="stat-card"><span>Subtotal</span><strong>${rupiah(subtotal)}</strong></div>
      <div class="stat-card"><span>Pajak</span><strong>${rupiah(tax)}</strong></div>
      <div class="stat-card"><span>Transaksi Lunas</span><strong>${data.length}</stro
