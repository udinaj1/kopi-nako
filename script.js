"use strict";

// =====================================
// DATA MENU
// =====================================

const menus = [
    { id: 1, name: "Kopi Nako", category: "Kopi", price: 18000, icon: "☕", description: "Kopi susu khas dengan rasa nikmat." },
    { id: 2, name: "Es Kopi Sayang", category: "Kopi", price: 20000, icon: "🧋", description: "Kopi dan susu yang lembut." },
    { id: 3, name: "Americano", category: "Kopi", price: 15000, icon: "☕", description: "Kopi hitam dengan cita rasa khas." },
    { id: 4, name: "Cappuccino", category: "Kopi", price: 22000, icon: "☕", description: "Espresso dengan susu dan foam." },
    { id: 5, name: "Matcha Latte", category: "Non Kopi", price: 23000, icon: "🍵", description: "Matcha dengan susu." },
    { id: 6, name: "Chocolate", category: "Non Kopi", price: 20000, icon: "🍫", description: "Minuman cokelat creamy." },
    { id: 7, name: "Lemon Tea", category: "Non Kopi", price: 15000, icon: "🍋", description: "Teh segar dengan lemon." },
    { id: 8, name: "French Fries", category: "Makanan", price: 18000, icon: "🍟", description: "Kentang goreng renyah." },
    { id: 9, name: "Croissant", category: "Makanan", price: 22000, icon: "🥐", description: "Roti pastry lembut." },
    { id: 10, name: "Waffle", category: "Makanan", price: 25000, icon: "🧇", description: "Waffle dengan topping pilihan." }
];

// =====================================
// DATA MEJA
// =====================================

const tables = [
    ...Array.from({ length: 6 }, (_, i) => ({
        id: i + 1,
        area: "Indoor"
    })),
    ...Array.from({ length: 6 }, (_, i) => ({
        id: i + 7,
        area: "Outdoor"
    })),
    ...Array.from({ length: 6 }, (_, i) => ({
        id: i + 13,
        area: "Lantai 2"
    }))
];

const occupiedTables = [4, 9, 15, 18];

// =====================================
// DATA PENYIMPANAN
// =====================================

function readStorage(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value ?? fallback;
    } catch {
        return fallback;
    }
}

let cart = readStorage("kopiNakoCart", []);
let orders = readStorage("kopiNakoOrders", []);

let activeCategory = "Semua";
let activeArea = "Semua";
let selectedTable = null;
let isStaffLoggedIn = false;

// =====================================
// FUNGSI UMUM
// =====================================

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

function updateCartCount() {
    const total = cart.reduce((sum, item) => sum + item.qty, 0);
    document.getElementById("cart-count").textContent = total;
}

// =====================================
// NAVIGASI
// =====================================

function showPage(pageId) {
    const target = document.getElementById(pageId);

    if (!target) {
        console.error("Halaman tidak ditemukan:", pageId);
        return;
    }

    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    target.classList.add("active");

    document.querySelectorAll(".nav-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageId
        );
    });

    if (pageId === "menu") renderMenu();
    if (pageId === "tables") renderTables();
    if (pageId === "cart") renderCart();
    if (pageId === "staff") renderStaff();

    window.scrollTo(0, 0);
}

function setupNavigation() {
    document.addEventListener("click", event => {
        const button = event.target.closest("[data-page]");

        if (!button) return;

        event.preventDefault();
        showPage(button.dataset.page);
    });
}

// =====================================
// MENU
// =====================================

function getCartQty(menuId) {
    const item = cart.find(item => item.id === menuId);
    return item ? item.qty : 0;
}

function renderMenu() {
    const container = document.getElementById("menu-list");

    const filteredMenus = activeCategory === "Semua"
        ? menus
        : menus.filter(menu => menu.category === activeCategory);

    container.innerHTML = filteredMenus.map(menu => {
        const qty = getCartQty(menu.id);

        return `
            <article class="menu-card">
                <div class="menu-picture">${menu.icon}</div>

                <div class="menu-info">
                    <p class="menu-category">${menu.category}</p>
                    <h3>${menu.name}</h3>
                    <p class="menu-description">${menu.description}</p>

                    <div class="menu-bottom">
                        <span class="menu-price">${rupiah(menu.price)}</span>

                        <div class="menu-quantity">
                            <button type="button"
                                class="qty-btn"
                                data-menu-action="minus"
                                data-id="${menu.id}">−</button>

                            <span class="qty-number">${qty}</span>

                            <button type="button"
                                class="qty-btn"
                                data-menu-action="plus"
                                data-id="${menu.id}">+</button>
                        </div>
                    </div>
                </div>
            </article>
        `;
    }).join("");
}

function addToCart(menuId) {
    const menu = menus.find(item => item.id === menuId);
    if (!menu) return;

    const existing = cart.find(item => item.id === menuId);

    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            id: menu.id,
            name: menu.name,
            price: menu.price,
            qty: 1
        });
    }

    saveCart();
}

function changeQty(menuId, amount) {
    const item = cart.find(item => item.id === menuId);

    if (!item && amount > 0) {
        addToCart(menuId);
    } else if (item) {
        item.qty += amount;

        if (item.qty <= 0) {
            cart = cart.filter(item => item.id !== menuId);
        }
    }

    saveCart();
    renderMenu();
    renderCart();
}

function setupMenu() {
    document.getElementById("menu-filters").addEventListener("click", event => {
        const button = event.target.closest("[data-category]");
        if (!button) return;

        activeCategory = button.dataset.category;

        document.querySelectorAll("[data-category]").forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });

        renderMenu();
    });

    document.getElementById("menu-list").addEventListener("click", event => {
        const button = event.target.closest("[data-menu-action]");
        if (!button) return;

        const id = Number(button.dataset.id);

        if (button.dataset.menuAction === "plus") {
            addToCart(id);
        } else {
            changeQty(id, -1);
        }

        renderMenu();
    });
}

// =====================================
// MEJA
// =====================================

function renderTables() {
    const container = document.getElementById("table-list");

    const filtered = activeArea === "Semua"
        ? tables
        : tables.filter(table => table.area === activeArea);

    container.innerHTML = filtered.map(table => {
        const occupied = occupiedTables.includes(table.id);
        const selected = selectedTable === table.id;

        return `
            <div class="table-card ${occupied ? "occupied" : "available"}">
                <h3>Meja ${String(table.id).padStart(2, "0")}</h3>
                <p>${table.area}</p>
                <p>${occupied ? "Sedang Terisi" : selected ? "Dipilih" : "Tersedia"}</p>

                <button type="button"
                    data-table-id="${table.id}"
                    ${occupied ? "disabled" : ""}>
                    ${occupied ? "Tidak Tersedia" : selected ? "Dipilih ✓" : "Pilih Meja"}
                </button>
            </div>
        `;
    }).join("");
}

function setupTables() {
    document.getElementById("table-filters").addEventListener("click", event => {
        const button = event.target.closest("[data-area]");
        if (!button) return;

        activeArea = button.dataset.area;

        document.querySelectorAll("[data-area]").forEach(btn => {
            btn.classList.toggle("active", btn === button);
        });

        renderTables();
    });

    document.getElementById("table-list").addEventListener("click", event => {
        const button = event.target.closest("[data-table-id]");
        if (!button || button.disabled) return;

        selectedTable = Number(button.dataset.tableId);
        renderTables();
    });
}

// =====================================
// KERANJANG
// =====================================

function calculateTotal() {
    return cart.reduce((sum, item) => {
        return sum + item.price * item.qty;
    }, 0);
}

function renderCart() {
    const container = document.getElementById("cart-items");

    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                <h3>Keranjang masih kosong</h3>
                <p>Silakan pilih menu terlebih dahulu.</p>
                <button type="button" class="primary-btn" data-page="menu">
                    Lihat Menu
                </button>
            </div>
        `;
    } else {
        container.innerHTML = cart.map(item => `
            <div class="cart-item">
                <div>
                    <h3>${item.name}</h3>
                    <p>${rupiah(item.price * item.qty)}</p>
                </div>

                <div class="menu-quantity">
                    <button type="button" class="qty-btn"
                        data-cart-action="minus" data-id="${item.id}">−</button>

                    <span class="qty-number">${item.qty}</span>

                    <button type="button" class="qty-btn"
                        data-cart-action="plus" data-id="${item.id}">+</button>
                </div>
            </div>
        `).join("");
    }

    document.getElementById("cart-total").textContent = rupiah(calculateTotal());
    updateCartCount();
}

function setupCart() {
    document.getElementById("cart-items").addEventListener("click", event => {
        const button = event.target.closest("[data-cart-action]");
        if (!button) return;

        const id = Number(button.dataset.id);

        if (button.dataset.cartAction === "plus") {
            addToCart(id);
        } else {
            changeQty(id, -1);
        }

        renderCart();
    });

    document.getElementById("checkout-btn").addEventListener("click", checkout);
}

// =====================================
// CHECKOUT
// =====================================

function checkout() {
    if (cart.length === 0) {
        alert("Keranjang masih kosong.");
        return;
    }

    const name = document.getElementById("customer-name").value.trim();

    if (!name) {
        alert("Masukkan nama pelanggan.");
        document.getElementById("customer-name").focus();
        return;
    }

    const type = document.getElementById("order-type").value;

    if (type === "Dine In" && !selectedTable) {
        alert("Silakan pilih meja terlebih dahulu.");
        showPage("tables");
        return;
    }

    const payment = document.getElementById("payment-method").value;

    const order = {
        id: "KN-" + Date.now(),
        customer: name,
        type,
        table: type === "Dine In" ? selectedTable : null,
        payment,
        items: cart.map(item => ({ ...item })),
        total: calculateTotal(),
        date: new Date().toLocaleString("id-ID"),
        status: "Menunggu"
    };

    orders.unshift(order);
    localStorage.setItem("kopiNakoOrders", JSON.stringify(orders));

    document.getElementById("receipt").innerHTML = `
        <strong>Nomor Pesanan:</strong> ${order.id}<br>
        <strong>Nama:</strong> ${order.customer}<br>
        <strong>Jenis:</strong> ${order.type}<br>
        ${order.table ? `<strong>Meja:</strong> ${order.table}<br>` : ""}
        <strong>Pembayaran:</strong> ${order.payment}<br>
        <strong>Waktu:</strong> ${order.date}
        <hr>
        ${order.items.map(item => `
            ${item.name} x ${item.qty}
            <span style="float:right">${rupiah(item.price * item.qty)}</span><br>
        `).join("")}
        <hr>
        <strong>Total: ${rupiah(order.total)}</strong>
    `;

    cart = [];
    selectedTable = null;
    saveCart();

    document.getElementById("customer-name").value = "";

    showPage("success");
}

// =====================================
// STAFF
// =====================================

function setupStaff() {
    document.getElementById("staff-login-btn").addEventListener("click", () => {
        const username = document.getElementById("staff-username").value.trim();
        const password = document.getElementById("staff-password").value;
        const message = document.getElementById("login-message");

        if (username === "staff" && password === "12345") {
            isStaffLoggedIn = true;
            message.textContent = "";
            renderStaff();
        } else {
            message.textContent = "Username atau password salah.";
            message.className = "message error";
        }
    });

    document.getElementById("staff-logout-btn").addEventListener("click", () => {
        isStaffLoggedIn = false;
        renderStaff();
    });
}

function renderStaff() {
    const login = document.getElementById("staff-login");
    const dashboard = document.getElementById("staff-dashboard");

    login.hidden = isStaffLoggedIn;
    dashboard.hidden = !isStaffLoggedIn;

    if (!isStaffLoggedIn) return;

    const container = document.getElementById("staff-orders");

    if (orders.length === 0) {
        container.innerHTML = `
            <p class="empty-message">Belum ada pesanan.</p>
        `;
        return;
    }

    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <h3>${order.id}</h3>
            <p>
                Pelanggan: ${order.customer}<br>
                Waktu: ${order.date}<br>
                Jenis: ${order.type}<br>
                ${order.table ? `Meja: ${order.table}<br>` : ""}
                Pembayaran: ${order.payment}<br>
                Status: <strong>${order.status}</strong>
            </p>

            <p>
                ${order.items.map(item =>
                    `${item.name} x ${item.qty}`
                ).join("<br>")}
            </p>

            <p><strong>Total: ${rupiah(order.total)}</strong></p>
        </div>
    `).join("");
}

// =====================================
// TOMBOL PESAN LAGI
// =====================================

document.getElementById("new-order-btn").addEventListener("click", () => {
    showPage("menu");
});

// =====================================
// MULAI APLIKASI
// =====================================

function init() {
    setupNavigation();
    setupMenu();
    setupTables();
    setupCart();
    setupStaff();

    renderMenu();
    renderTables();
    renderCart();
    updateCartCount();

    showPage("home");
}

init();
