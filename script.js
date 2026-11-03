"use strict";

// ===================================
// DATA MENU
// ===================================

const menus = [
  {
    id: 1,
    name: "Kopi Nako",
    category: "Kopi",
    price: 18000,
    image: "https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=700&q=80",
    description: "Kopi susu dengan rasa seimbang."
  },
  {
    id: 2,
    name: "Es Kopi Sayang",
    category: "Kopi",
    price: 22000,
    image: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=700&q=80",
    description: "Kopi susu dingin yang menyegarkan."
  },
  {
    id: 3,
    name: "Americano",
    category: "Kopi",
    price: 16000,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=700&q=80",
    description: "Espresso dengan karakter rasa kuat."
  },
  {
    id: 4,
    name: "Cappuccino",
    category: "Kopi",
    price: 22000,
    image: "https://images.unsplash.com/photo-1570968915860-54d5c301fa9f?auto=format&fit=crop&w=700&q=80",
    description: "Espresso dengan susu dan foam."
  },
  {
    id: 5,
    name: "Matcha Latte",
    category: "Non Kopi",
    price: 23000,
    image: "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=700&q=80",
    description: "Matcha dan susu yang creamy."
  },
  {
    id: 6,
    name: "Chocolate",
    category: "Non Kopi",
    price: 21000,
    image: "https://images.unsplash.com/photo-1542990253-0b8be7ec7e8c?auto=format&fit=crop&w=700&q=80",
    description: "Minuman cokelat yang nikmat."
  },
  {
    id: 7,
    name: "French Fries",
    category: "Makanan",
    price: 18000,
    image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=700&q=80",
    description: "Kentang goreng renyah."
  },
  {
    id: 8,
    name: "Croissant",
    category: "Makanan",
    price: 20000,
    image: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=700&q=80",
    description: "Pastry renyah dan lembut."
  },
  {
    id: 9,
    name: "Waffle",
    category: "Makanan",
    price: 25000,
    image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?auto=format&fit=crop&w=700&q=80",
    description: "Waffle hangat dan lembut."
  }
];

// ===================================
// DATA MEJA
// ===================================

const tables = [];

["Indoor", "Tengah", "Nongkrong"].forEach((area, index) => {
  for (let i = 1; i <= 6; i++) {
    const number = index * 6 + i;

    tables.push({
      id: String(number).padStart(2, "0"),
      area: area,
      status: [4, 9, 15, 18].includes(number)
        ? "occupied"
        : "available"
    });
  }
});

// ===================================
// VARIABEL
// ===================================

let activeArea = "Indoor";
let activeCategory = "Semua";
let selectedTable = "";

let cart = JSON.parse(
  localStorage.getItem("kopiNakoCart") || "[]"
);

let orders = JSON.parse(
  localStorage.getItem("kopiNakoOrders") || "[]"
);

// ===================================
// FUNGSI BANTU
// ===================================

const el = id => document.getElementById(id);

function rupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function saveCart() {
  localStorage.setItem(
    "kopiNakoCart",
    JSON.stringify(cart)
  );

  updateCartCount();
}

function saveOrders() {
  localStorage.setItem(
    "kopiNakoOrders",
    JSON.stringify(orders)
  );
}

function updateCartCount() {
  const total = cart.reduce(
    (sum, item) => sum + item.qty,
    0
  );

  el("cartCount").textContent = total;
}

// ===================================
// NAVIGASI HALAMAN
// ===================================

function showPage(pageId) {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.toggle(
      "active",
      page.id === pageId
    );
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  if (pageId === "menu") renderMenu();
  if (pageId === "tables") renderTables();
  if (pageId === "cart") renderCart();
}

function setupNavigation() {
  document.querySelectorAll("[data-page]").forEach(button => {
    button.addEventListener("click", () => {
      showPage(button.dataset.page);
    });
  });
}

// ===================================
// TAMPILKAN MEJA
// ===================================

function renderTables() {
  const grid = el("tableGrid");

  grid.innerHTML = "";

  const filtered = tables.filter(
    table => table.area === activeArea
  );

  filtered.forEach(table => {
    const card = document.createElement("div");

    card.className = "table-card";

    if (table.status === "occupied") {
      card.classList.add("occupied");
    }

    if (selectedTable === table.id) {
      card.classList.add("chosen");
    }

    card.innerHTML = `
      <h3>Meja ${table.id}</h3>

      <span class="status">
        ${table.status === "available"
          ? "Tersedia"
          : "Terisi"}
      </span>
    `;

    const button = document.createElement("button");

    button.textContent =
      table.status === "occupied"
        ? "Tidak Tersedia"
        : selectedTable === table.id
          ? "Dipilih"
          : "Pilih Meja";

    button.disabled = table.status === "occupied";

    button.addEventListener("click", () => {
      selectedTable = table.id;

      el("selectedTableText").textContent =
        "Meja " + table.id + " area " +
        table.area + " berhasil dipilih.";

      renderTables();
    });

    card.appendChild(button);
    grid.appendChild(card);
  });

  if (selectedTable === "") {
    el("selectedTableText").textContent =
      "Belum ada meja dipilih.";
  }
}

// ===================================
// FILTER AREA MEJA
// ===================================

function setupAreaFilters() {
  document.querySelectorAll("[data-area]").forEach(button => {
    button.addEventListener("click", () => {
      activeArea = button.dataset.area;

      document.querySelectorAll("[data-area]").forEach(btn => {
        btn.classList.toggle(
          "selected",
          btn === button
        );
      });

      renderTables();
    });
  });
}

// ===================================
// TAMPILKAN MENU
// ===================================

function renderMenu() {
  const grid = el("menuGrid");

  grid.innerHTML = "";

  const filtered = menus.filter(menu => {
    return activeCategory === "Semua" ||
      menu.category === activeCategory;
  });

  filtered.forEach(menu => {
    const card = document.createElement("div");

    card.className = "card menu-card";

    card.innerHTML = `
      <img src="${menu.image}" alt="${menu.name}">

      <div class="menu-content">
        <h3>${menu.name}</h3>

        <small>${menu.category}</small>

        <p>${menu.description}</p>

        <div class="price">
          ${rupiah(menu.price)}
        </div>
      </div>
    `;

    const button = document.createElement("button");

    button.className = "primary";
    button.textContent = "Tambah ke Keranjang";

    button.style.width = "calc(100% - 32px)";
    button.style.margin = "0 16px 16px";

    button.addEventListener("click", () => {
      addToCart(menu.id);
    });

    card.appendChild(button);

    grid.appendChild(card);
  });
}

// ===================================
// FILTER MENU
// ===================================

function setupMenuFilters() {
  document.querySelectorAll("[data-category]").forEach(button => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;

      document.querySelectorAll("[data-category]").forEach(btn => {
        btn.classList.toggle(
          "selected",
          btn === button
        );
      });

      renderMenu();
    });
  });
}

// ===================================
// TAMBAH MENU
// ===================================

function addToCart(id) {
  const item = cart.find(item => item.id === id);

  if (item) {
    item.qty++;
  } else {
    cart.push({
      id: id,
      qty: 1
    });
  }

  saveCart();

  alert("Menu berhasil ditambahkan ke keranjang!");
}

// ===================================
// UBAH JUMLAH PESANAN
// ===================================

function changeQty(id, amount) {
  const item = cart.find(item => item.id === id);

  if (!item) return;

  item.qty += amount;

  if (item.qty <= 0) {
    cart = cart.filter(item => item.id !== id);
  }

  saveCart();
  renderCart();
}

// ===================================
// TAMPILKAN KERANJANG
// ===================================

function renderCart() {
  const container = el("cartItems");

  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML =
      "<p>Keranjang masih kosong.</p>";

    const button = document.createElement("button");

    button.textContent = "Lihat Menu";
    button.className = "primary";

    button.addEventListener("click", () => {
      showPage("menu");
    });

    container.appendChild(button);

    el("cartTotal").textContent = rupiah(0);

    return;
  }

  let total = 0;

  cart.forEach(item => {
    const menu = menus.find(
      menu => menu.id === item.id
    );

    if (!menu) return;

    const subtotal = menu.price * item.qty;

    total += subtotal;

    const line = document.createElement("div");

    line.className = "cart-line";

    line.innerHTML = `
      <div>
        <strong>${menu.name}</strong>
        <p>${rupiah(menu.price)}</p>
      </div>
    `;

    const controls = document.createElement("div");

    controls.className = "qty";

    const minus = document.createElement("button");
    minus.textContent = "-";

    minus.addEventListener("click", () => {
      changeQty(item.id, -1);
    });

    const number = document.createElement("strong");
    number.textContent = item.qty;

    const plus = document.createElement("button");
    plus.textContent = "+";

    plus.addEventListener("click", () => {
      changeQty(item.id, 1);
    });

    controls.append(minus, number, plus);

    const price = document.createElement("strong");
    price.textContent = rupiah(subtotal);

    line.append(controls, price);

    container.appendChild(line);
  });

  el("cartTotal").textContent = rupiah(total);
}

// ===================================
// KONFIRMASI PESANAN
// ===================================

function confirmOrder() {
  if (cart.length === 0) {
    alert("Keranjang masih kosong!");
    showPage("menu");
    return;
  }

  if (!selectedTable) {
    alert("Silakan pilih meja terlebih dahulu!");
    showPage("tables");
    return;
  }

  const name = el("customerName").value.trim();
  const phone = el("customerPhone").value.trim();

  if (!name) {
    alert("Masukkan nama pemesan!");
    el("customerName").focus();
    return;
  }

  if (!phone) {
    alert("Masukkan nomor WhatsApp!");
    el("customerPhone").focus();
    return;
  }

  const items = cart.map(item => {
    const menu = menus.find(
      menu => menu.id === item.id
    );

    return {
      name: menu.name,
      price: menu.price,
      qty: item.qty,
      subtotal: menu.price * item.qty
    };
  });

  const total = items.reduce(
    (sum, item) => sum + item.subtotal,
    0
  );

  const order = {
    code: "KN" + Date.now(),
    name: name,
    phone: phone,
    table: selectedTable,
    items: items,
    total: total,
    payment: el("paymentMethod").value,
    status: "Menunggu",
    date: new Date().toLocaleString("id-ID")
  };

  orders.unshift(order);

  saveOrders();

  // Tandai meja sebagai terisi selama sesi browser ini
  const table = tables.find(
    table => table.id === selectedTable
  );

  if (table) {
    table.status = "occupied";
  }

  showReceipt(order);

  cart = [];
  saveCart();

  selectedTable = "";

  el("customerName").value = "";
  el("customerPhone").value = "";

  showPage("success");
}

// ===================================
// BUKTI PESANAN
// ===================================

function showReceipt(order) {
  const container = el("receipt");

  container.innerHTML = `
    <h3>Terima kasih, ${escapeHTML(order.name)}!</h3>

    <p>Kode pesanan: <strong>${order.code}</strong></p>

    <p>Nomor meja: <strong>${order.table}</strong></p>

    <p>Waktu: ${escapeHTML(order.date)}</p>

    <hr>

    ${order.items.map(item => `
      <div class="cart-line">
        <span>${escapeHTML(item.name)} × ${item.qty}</span>
        <strong>${rupiah(item.subtotal)}</strong>
      </div>
    `).join("")}

    <h2 class="total">
      Total: ${rupiah(order.total)}
    </h2>

    <p>Metode pembayaran: ${escapeHTML(order.payment)}</p>

    <div class="notice">
      Status pesanan: Menunggu konfirmasi staff.
    </div>
  `;
}

// ===================================
// LOGIN STAFF
// ===================================

function staffLogin() {
  const username = el("staffUser").value.trim();
  const password = el("staffPass").value;

  if (username === "staff" && password === "12345") {
    el("staffLoginPanel").classList.add("hidden");
    el("staffDashboard").classList.remove("hidden");

    renderStaffOrders();
  } else {
    el("loginMessage").textContent =
      "Username atau password salah!";
  }
}

// ===================================
// DASHBOARD STAFF
// ===================================

function renderStaffOrders() {
  const container = el("staffOrders");

  container.innerHTML = "";

  if (orders.length === 0) {
    container.innerHTML =
      "<p>Belum ada pesanan.</p>";

    return;
  }

  orders.forEach(order => {
    const card = document.createElement("div");

    card.className = "staff-order";

    card.innerHTML = `
      <h3>${order.code}</h3>

      <p>
        Nama: ${escapeHTML(order.name)}<br>
        Nomor meja: ${escapeHTML(order.table)}<br>
        WhatsApp: ${escapeHTML(order.phone)}<br>
        Tanggal: ${escapeHTML(order.date)}
      </p>

      ${order.items.map(item => `
        <div class="cart-line">
          <span>${escapeHTML(item.name)} × ${item.qty}</span>
          <strong>${rupiah(item.subtotal)}</strong>
        </div>
      `).join("")}

      <h3 class="total">
        ${rupiah(order.total)}
      </h3>

      <p>Status: ${escapeHTML(order.status)}</p>
    `;

    const button = document.createElement("button");

    button.className = "primary";
    button.textContent = "Tandai Selesai";

    button.addEventListener("click", () => {
      order.status = "Selesai";

      saveOrders();

      renderStaffOrders();
    });

    card.appendChild(button);

    container.appendChild(card);
  });
}

// ===================================
// LOGOUT STAFF
// ===================================

function staffLogout() {
  el("staffDashboard").classList.add("hidden");
  el("staffLoginPanel").classList.remove("hidden");

  el("staffPass").value = "";

  showPage("home");
}

// ===================================
// HUBUNGKAN SEMUA TOMBOL
// ===================================

document.addEventListener("DOMContentLoaded", function() {

  setupNavigation();

  setupAreaFilters();

  setupMenuFilters();

  renderTables();

  renderMenu();

  renderCart();

  updateCartCount();

  // Tombol lanjut ke menu
  el("continueMenu").addEventListener("click", function() {
    if (!selectedTable) {
      alert("Pilih meja terlebih dahulu!");
      return;
    }

    showPage("menu");
  });

  // Tombol checkout
  el("checkoutBtn").addEventListener(
    "click",
    confirmOrder
  );

  // Tombol login
  el("staffLoginBtn").addEventListener(
    "click",
    staffLogin
  );

  // Tombol logout
  el("staffLogoutBtn").addEventListener(
    "click",
    staffLogout
  );

});
