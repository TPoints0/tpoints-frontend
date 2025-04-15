const api = "https://tpoints-backend.timoernst.repl.co"; // DEIN BACKEND-LINK HIER einsetzen

// Lokale Benutzerdaten
let user = localStorage.getItem("user");
let lastSpin = localStorage.getItem("lastSpin");

if (user && location.pathname.endsWith("index.html")) {
  location.href = "main.html";
}

if (location.pathname.endsWith("main.html")) {
  user = JSON.parse(localStorage.getItem("user"));
  if (!user) location.href = "index.html";
  document.getElementById("userDisplay").innerText = user.username;

  getBalance();
  showShop();

  if (user.username === "admin") {
    document.getElementById("adminLink").style.display = "inline";
  }

  // Automatisch täglich +100 TPoints (einmal pro Tag)
  const today = new Date().toDateString();
  const lastDaily = localStorage.getItem("lastDaily");
  if (today !== lastDaily) {
    updateBalance(100);
    localStorage.setItem("lastDaily", today);
  }
}

function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch(`${api}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }).then(res => res.json()).then(data => {
    if (data.success) {
      localStorage.setItem("user", JSON.stringify(data.user));
      location.href = "main.html";
    } else {
      alert("Login fehlgeschlagen");
    }
  });
}

function register() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  fetch(`${api}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  }).then(res => res.json()).then(data => {
    if (data.success) {
      alert("Erfolgreich registriert. Jetzt einloggen!");
    } else {
      alert("Fehler bei Registrierung");
    }
  });
}

function getBalance() {
  fetch(`${api}/balance?username=${user.username}`).then(res => res.json()).then(data => {
    document.getElementById("balance").innerText = data.balance;
  });
}

function updateBalance(change) {
  fetch(`${api}/updateBalance`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user.username, change }),
  }).then(() => getBalance());
}

function requestDeposit() {
  document.getElementById("depositMsg").innerText = "Anfrage gesendet…";
  fetch(`${api}/requestDeposit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: user.username }),
  }).then(() => {
    document.getElementById("depositMsg").innerText = "Ich wurde benachrichtigt. Bald bekommst du TPoints!";
  });
}

function showShop() {
  const shopItems = [
    { name: "Spielzeugauto", price: 150 },
    { name: "10 Minuten Tabletzeit", price: 300 },
    { name: "Lego-Teil", price: 500 },
  ];

  const container = document.getElementById("shopItems");
  container.innerHTML = "";

  shopItems.forEach(item => {
    const div = document.createElement("div");
    div.innerHTML = `
      <strong>${item.name}</strong> – ${item.price} TP
      <button onclick="buy('${item.name}', ${item.price})">Kaufen</button>
    `;
    container.appendChild(div);
  });
}

function buy(name, price) {
  fetch(`${api}/balance?username=${user.username}`).then(res => res.json()).then(data => {
    if (data.balance < price) {
      alert("Du hast nicht genug TPoints!");
      return;
    }

    updateBalance(-price);

    fetch(`${api}/order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: user.username, item: name }),
    });

    alert("Deine Bestellung kommt demnächst!");
  });
}

function spin() {
  const today = new Date().toDateString();
  if (lastSpin === today) {
    document.getElementById("spinResult").innerText = "Du hast heute schon gedreht!";
    return;
  }

  const reward = Math.floor(Math.random() * 101);
  updateBalance(reward);
  localStorage.setItem("lastSpin", today);
  document.getElementById("spinResult").innerText = `Du hast ${reward} TPoints gewonnen! 🎉`;
}
