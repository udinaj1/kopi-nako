const menuData = [
  { id: 1, name: "Kopi Nako", category: "Kopi", price: 18000, desc: "Kopi susu khas dengan rasa yang seimbang.", image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=700" },
  { id: 2, name: "Es Kopi Aren", category: "Kopi", price: 20000, desc: "Espresso, susu, dan manis gula aren.", image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=700" },
  { id: 3, name: "Americano", category: "Kopi", price: 15000, desc: "Espresso dengan tambahan air.", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=700" },
  { id: 4, name: "Cappuccino", category: "Kopi", price: 22000, desc: "Espresso dengan susu dan foam lembut.", image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?w=700" },
  { id: 5, name: "Matcha Latte", category: "Non-Kopi", price: 23000, desc: "Minuman matcha dengan susu creamy.", image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=700" },
  { id: 6, name: "Chocolate", category: "Non-Kopi", price: 20000, desc: "Minuman cokelat yang nikmat.", image: "https://images.unsplash.com/photo-1542990253-0b8be9a7c4c9?w=700" },
  { id: 7, name: "Lemon Tea", category: "Non-Kopi", price: 15000, desc: "Teh segar dengan rasa lemon.", image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=700" },
  { id: 8, name: "French Fries", category: "Makanan", price: 18000, desc: "Kentang goreng renyah.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=700" },
  { id: 9, name: "Croissant", category: "Makanan", price: 22000, desc: "Pastry berlapis yang renyah.", image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=700" },
  { id: 10, name: "Waffle", category: "Makanan", price: 25000, desc: "Waffle dengan tekstur lembut.", image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?w=700" }
];

const tableData = [
  { id: "A1", area: "Indoor" }, { id: "A2", area: "Indoor" },
  { id: "A3", area: "Indoor" }, { id: "A4", area: "Indoor" },
  { id: "B1", area: "Outdoor" }, { id: "B2", area: "Outdoor" },
  { id: "B3", area: "Outdoor" }, { id: "B4", area: "Outdoor" },
  { id: "C1", area: "Outdoor" }, { id: "C2", area: "Outdoor" },
  { id: "C3", area: "Outdoor" }, { id: "C4", area: "Outdoor" }
];

const initialStock = [
  { name: "Biji kopi", qty: 25, unit: "kg" },
  { name: "Susu", qty: 40, unit: "liter" },
  { name: "Gula aren", qty: 15, unit: "kg" },
  { name: "Bubuk matcha", qty: 5, unit: "kg" },
  { name: "Cokelat", qty: 8, unit: "kg" },
  { name: "Kentang", qty: 20, unit: "kg" }
];

const STORAGE = {
  cart: "kopiNakoCart",
  orders: "kopiNakoOrders",
  selectedTable: "kopiNakoSelectedTable",
  occupied: "kopiNakoOccupiedTables",
  stock: "kopiNakoStock"
};

let activeCategory = "Semua";
let currentRole = "Kasir";
let currentTab = "orders";

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch (error) {
    console.error("Gagal membaca penyimpanan:", error);
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

let cart = readStorage(STORAGE.cart, []);
let orders = readStorage(STORAGE.orders, []);
let selectedTable = readStorage(STORAGE.selectedTable, "");
let occupiedTables = readStorage(STORAGE.occupied, []);
let stock = readStorage(STORAGE.stock, initialStock);

const rupiah = value =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2500);
}

function showPage(pageId) {
  const target = document.getElementById(pageId);
  if (!target) return;

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });

  target.classList.add("active");

  document.querySelectorAll(".nav-link").forEach(button => {
    button.classList.toggle("active", button.dataset.page === pageId);
  });

  document.getElementById("mainNav").classList.remove("open");

  if (pageId === "menu") renderMenu();
  if (pageId === "tables") renderTables();
  if (pageId === "cart") renderCart();
  if (pageId === "dashboard") renderDashboard();
  if (pageId === "staff") updateCartCount();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateCartCount() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById("cartCount").textContent = count;
}

function renderMenu() {
  const grid = document.getElementById("menuGrid");
  const keyword = document.getElementById("menuSearch").value.toLowerCase();

  const filtered = menuData.filter(item => {
    const categoryMatch =
      activeCategory === "Semua" || item.category === activeCategory;
    const searchMatch = item.name.toLowerCase().includes(keyword);
    return categoryMatch && searchMatch;
  });

  if (!filtered.length) {
    grid.innerHTML = `<div class="empty-state">Menu tidak ditemukan.</div>`;
    return;
  }

  grid.innerHTML = filtered.map(item => `
    <article class="menu-card">
      <div class="menu-photo">
        <img src="${item.image}" alt="${item.name}"
          onerror="this.src='https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=700'">
      </div>
      <div class="menu-info">
        <span class="eyebrow">${item.category}</span>
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <div class="menu-bottom">
          <span class="price">${rupiah(item.price)}</span>
          <button class="add-btn" data-add="${item.id}">+ Tambah</button>
        </div>
      </div>
    </article>
  `).join("");
}

function addToCart(id) {
  const item = menuData.find(menu => menu.id === Number(id));
  if (!item) return;

  const existing = cart.find(cartItem => cartItem.id === item.id);

  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  saveStorage(STORAGE.cart, cart);
  updateCartCount();
  showToast(item.name + " ditambahkan ke keranjang.");
}

function changeCartQty(id, change) {
  const item = cart.find(product => product.id === Number(id));
  if (!item) return;

  item.qty += change;
  if (item.qty <= 0) {
    cart = cart.filter(product => product.id !== Number(id));
  }

  saveStorage(STORAGE.cart, cart);
  renderCart();
  updateCartCount();
}

function removeCartItem(id) {
  cart = cart.filter(item => item.id !== Number(id));
  saveStorage(STORAGE.cart, cart);
  renderCart();
  updateCartCount();
  showToast("Menu dihapus dari keranjang.");
}

function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function renderCart() {
  const container = document.getElementById("cartItems");

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Keranjang masih kosong</h3>
        <p>Silakan pilih menu terlebih dahulu.</p>
        <button class="btn btn-primary" data-page="menu">Lihat Menu</button>
      </div>`;
  } else {
    container.innerHTML = cart.map(item => `
      <article class="cart-item">
        <div>
          <h3>${item.name}</h3>
          <p>${rupiah(item.price)} × ${item.qty}</p>
          <strong>${rupiah(item.price * item.qty)}</strong>
        </div>
        <div class="quantity-control">
          <button data-qty="${item.id}" data-change="-1">−</button>
          <strong>${item.qty}</strong>
          <button data-qty="${item.id}" data-change="1">+</button>
          <button class="remove-btn" data-remove="${item.id}">Hapus</button>
        </div>
      </article>
    `).join("");
  }

  const subtotal = getSubtotal();
  // Pajak dibuat 0 pada prototype ini.
  const tax = 0;

  document.getElementById("summaryTable").textContent =
    selectedTable || "Belum dipilih";
  document.getElementById("subtotal").textContent = rupiah(subtotal);
  document.getElementById("tax").textContent = rupiah(tax);
  document.getElementById("grandTotal").textContent = rupiah(subtotal + tax);
  updateCartCount();
}

function renderTables() {
  const grid = document.getElementById("tableGrid");

  grid.innerHTML = tableData.map(table => {
    const occupied = occupiedTables.includes(table.id);
    const selected = selectedTable === table.id;

    return `
      <button class="table-card ${occupied ? "occupied" : ""} ${selected ? "selected" : ""}"
        data-table="${table.id}" ${occupied ? "disabled" : ""}>
        <strong>Meja ${table.id}</strong>
        <small>${occupied ? "Terisi" : table.area}</small>
      </button>
    `;
  }).join("");

  document.getElementById("selectedTableText").textContent =
    selectedTable ? `Meja yang dipilih: ${selectedTable}` : "Belum ada meja dipilih.";
}

function chooseTable(id) {
  if (occupiedTables.includes(id)) {
    showToast("Meja tersebut sedang terisi.");
    return;
  }

  selectedTable = id;
  saveStorage(STORAGE.selectedTable, selectedTable);
  renderTables();
  showToast("Meja " + id + " dipilih.");
}

function checkout() {
  if (cart.length === 0) {
    showToast("Keranjang masih kosong.");
    return;
  }

  if (!selectedTable) {
    showToast("Silakan pilih meja terlebih dahulu.");
    showPage("tables");
    return;
  }

  const customerName = document.getElementById("customerName").value.trim();
  if (!customerName) {
    showToast("Masukkan nama pemesan terlebih dahulu.");
    document.getElementById("customerName").focus();
    return;
  }

  if (occupiedTables.includes(selectedTable)) {
    selectedTable = "";
    saveStorage(STORAGE.selectedTable, "");
    showToast("Meja sudah terisi. Silakan pilih meja lain.");
    showPage("tables");
    return;
  }

  const paymentMethod = document.getElementById("paymentMethod").value;
  const subtotal = getSubtotal();

  const order = {
    id: "KN-" + Date.now().toString().slice(-8),
    customer: customerName,
    table: selectedTable,
    items: cart.map(item => ({ ...item })),
    total: subtotal,
    paymentMethod,
    paymentStatus: "Belum dibayar",
    status: "Baru",
    date: new Date().toISOString()
  };

  orders.unshift(order);
  occupiedTables.push(selectedTable);

  saveStorage(STORAGE.orders, orders);
  saveStorage(STORAGE.occupied, occupiedTables);

  document.getElementById("successDetails").innerHTML = `
    <strong>Nomor Pesanan: ${order.id}</strong><br>
    Nama: ${order.customer}<br>
    Meja: ${order.table}<br>
    Pembayaran: ${order.paymentMethod}<br>
    Total: <strong>${rupiah(order.total)}</strong>
  `;

  cart = [];
  selectedTable = "";
  saveStorage(STORAGE.cart, cart);
  saveStorage(STORAGE.selectedTable, selectedTable);
  updateCartCount();

  document.getElementById("customerName").value = "";
  showPage("success");
}

function openDashboard(role) {
  currentRole = role;
  currentTab = "orders";

  document.getElementById("dashboardTitle").textContent =
    "Dashboard " + role;
  document.getElementById("dashboardSubtitle").textContent =
    "Kelola aktivitas bagian " + role + ".";

  document.querySelectorAll(".tab-btn").forEach(button => {
    button.classList.toggle("active", button.dataset.tab === "orders");
  });

  configureTabs();
  showPage("dashboard");
}

function configureTabs() {
  const tabs = document.getElementById("dashboardTabs");

  let allowed = ["orders"];

  if (currentRole === "Kasir") allowed = ["orders", "tables", "reports"];
  if (currentRole === "Barista") allowed = ["orders"];
  if (currentRole === "Dapur") allowed = ["orders"];
  if (currentRole === "Waiter") allowed = ["orders", "tables"];
  if (currentRole === "Owner") allowed = ["orders", "tables", "reports", "stock"];

  tabs.innerHTML = allowed.map(tab => {
    const names = {
      orders: "Pesanan",
      tables: "Meja",
      reports: "Laporan",
      stock: "Stok"
    };

    return `<button class="tab-btn ${tab === currentTab ? "active" : ""}" data-tab="${tab}">${names[tab]}</button>`;
  }).join("");

  renderDashboard();
}

function renderDashboard() {
  const totalSales = orders
    .filter(order => order.status !== "Dibatalkan")
    .reduce((sum, order) => sum + order.total, 0);

  const newOrders = orders.filter(order => order.status === "Baru").length;
  const doneOrders = orders.filter(order => order.status === "Selesai").length;

  document.getElementById("statOrders").textContent = orders.length;
  document.getElementById("statNew").textContent = newOrders;
  document.getElementById("statDone").textContent = doneOrders;
  document.getElementById("statSales").textContent = rupiah(totalSales);

  if (currentTab === "orders") renderStaffOrders();
  if (currentTab === "tables") renderStaffTables();
  if (currentTab === "reports") renderReports();
  if (currentTab === "stock") renderStock();
}

function getRoleStatuses() {
  if (currentRole === "Barista") {
    return ["Baru", "Diproses", "Siap"];
  }
  if (currentRole === "Dapur") {
    return ["Baru", "Diproses", "Siap"];
  }
  if (currentRole === "Waiter") {
    return ["Siap", "Diantar", "Selesai"];
  }
  return ["Baru", "Diproses", "Siap", "Diantar", "Selesai", "Dibatalkan"];
}

function renderStaffOrders() {
  const content = document.getElementById("dashboardContent");

  let filteredOrders = orders;

  if (currentRole === "Barista") {
    filteredOrders = orders.filter(order =>
      order.items.some(item => item.category === "Kopi" || item.category === "Non-Kopi")
    );
  }

  if (currentRole === "Dapur") {
    filteredOrders = orders.filter(order =>
      order.items.some(item => item.category === "Makanan")
    );
  }

  if (!filteredOrders.length) {
    content.innerHTML = `<div class="empty-state">Belum ada pesanan.</div>`;
    return;
  }

  const statuses = getRoleStatuses();

  content.innerHTML = filteredOrders.map(order => `
    <article class="order-card">
      <div class="order-head">
        <div>
          <h3>${order.id}</h3>
          <p>${order.customer} · Meja ${order.table}</p>
          <p>${new Date(order.date).toLocaleString("id-ID")}</p>
        </div>
        <span class="status ${order.status.toLowerCase()}">${order.status}</span>
      </div>
      <div class="order-items">
        ${order.items.map(item =>
          `${item.name} × ${item.qty} — ${rupiah(item.price * item.qty)}`
        ).join("<br>")}
      </div>
      <p><strong>Total: ${rupiah(order.total)}</strong></p>
      <p>Pembayaran: ${order.paymentMethod} · ${order.paymentStatus}</p>
      <div class="order-actions">
        <select data-status="${order.id}">
          ${statuses.map(status =>
            `<option value="${status}" ${order.status === status ? "selected" : ""}>${status}</option>`
          ).join("")}
        </select>
        ${currentRole === "Kasir" ? `
          <button data-payment="${order.id}">Tandai Dibayar</button>
        ` : ""}
        ${currentRole === "Owner" ? `
          <button data-payment="${order.id}">Ubah Pembayaran</button>
        ` : ""}
      </div>
    </article>
  `).join("");
}

function updateOrderStatus(orderId, status) {
  const order = orders.find(item => item.id === orderId);
  if (!order) return;

  order.status = status;

  if (status === "Selesai" || status === "Dibatalkan") {
    occupiedTables = occupiedTables.filter(table => table !== order.table);
    saveStorage(STORAGE.occupied, occupiedTables);
  }

  saveStorage(STORAGE.orders, orders);
  renderDashboard();
  showToast("Status pesanan diperbarui.");
}

function updatePayment(orderId) {
  const order = orders.find(item => item.id === orderId);
  if (!order) return;

  order.paymentStatus =
    order.paymentStatus === "Lunas" ? "Belum dibayar" : "Lunas";

  saveStorage(STORAGE.orders, orders);
  renderDashboard();
  showToast("Status pembayaran diperbarui.");
}

function renderStaffTables() {
  const content = document.getElementById("dashboardContent");

  content.innerHTML = `
    <div class="table-wrap">
      <table class="staff-table">
        <thead>
          <tr><th>Meja</th><th>Area</th><th>Status</th><th>Pesanan</th></tr>
        </thead>
        <tbody>
          ${tableData.map(table => {
            const order = orders.find(item =>
              item.table === table.id &&
              item.status !== "Selesai" &&
              item.status !== "Dibatalkan"
            );

            return `
              <tr>
                <td>${table.id}</td>
                <td>${table.area}</td>
                <td>${occupiedTables.includes(table.id) ? "Terisi" : "Tersedia"}</td>
                <td>${order ? order.id : "-"}</td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderReports() {
  const content = document.getElementById("dashboardContent");
  const validOrders = orders.filter(order => order.status !== "Dibatalkan");
  const total = validOrders.reduce((sum, order) => sum + order.total, 0);
  const paid = validOrders
    .filter(order => order.paymentStatus === "Lunas")
    .reduce((sum, order) => sum + order.total, 0);

  content.innerHTML = `
    <div class="report-card">
      <h3>Ringkasan Penjualan</h3>
      <div class="stock-row"><span>Jumlah pesanan</span><strong>${validOrders.length}</strong></div>
      <div class="stock-row"><span>Total nilai pesanan</span><strong>${rupiah(total)}</strong></div>
      <div class="stock-row"><span>Pembayaran lunas</span><strong>${rupiah(paid)}</strong></div>
      <div class="stock-row"><span>Belum dibayar</span><strong>${rupiah(total - paid)}</strong></div>
    </div>
    <div class="report-card">
      <h3>Riwayat Pesanan</h3>
      ${validOrders.length ? validOrders.map(order => `
        <div class="stock-row">
          <span>${order.id} · ${order.customer}</span>
          <strong>${rupiah(order.total)}</strong>
        </div>
      `).join("") : "<p>Belum ada data penjualan.</p>"}
      <button class="btn btn-outline" id="exportReport">Unduh Laporan CSV</button>
    </div>
  `;
}

function renderStock() {
  const content = document.getElementById("dashboardContent");

  content.innerHTML = `
    <div class="stock-card">
      <h3>Persediaan Bahan Baku (Data Contoh)</h3>
      ${stock.map((item, index) => `
        <div class="stock-row">
          <span>${item.name}</span>
          <strong>${item.qty} ${item.unit}</strong>
          <button class="report-filter" data-stock="${index}">Tambah Stok</button>
        </div>
      `).join("")}
    </div>
  `;
}

function exportReport() {
  const rows = [
    ["ID Pesanan", "Nama", "Meja", "Tanggal", "Total", "Status", "Pembayaran"],
    ...orders.map(order => [
      order.id,
      order.customer,
      order.table,
      new Date(order.date).toLocaleString("id-ID"),
      order.total,
      order.status,
      order.paymentStatus
    ])
  ];

  const csv = rows.map(row =>
    row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(",")
  ).join("\n");

  const blob = new Blob(["\uFEFF" + csv], {
    type: "text/csv;charset=utf-8;"
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "laporan-kopi-nako.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function initializeApp() {
  updateCartCount();
  renderMenu();
  renderTables();
  renderCart();
}

/* Semua tombol ditangani dari sini. */
document.addEventListener("click", event => {
  const pageButton = event.target.closest("[data-page]");
  if (pageButton) {
    event.preventDefault();
    showPage(pageButton.dataset.page);
    return;
  }

  const addButton = event.target.closest("[data-add]");
  if (addButton) {
    addToCart(addButton.dataset.add);
    return;
  }

  const qtyButton = event.target.closest("[data-qty]");
  if (qtyButton) {
    changeCartQty(qtyButton.dataset.qty, Number(qtyButton.dataset.change));
    return;
  }

  const removeButton = eve
