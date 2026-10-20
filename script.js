"use strict";
/* ==========================================================
   CONFIGURAÇÕES: tudo que você precisa editar fica aqui.
   Campo vazio ("") = o botão ou o item some do site.
   Nenhum dado foi inventado: preencha com os dados reais.
   ========================================================== */
const CONFIG = {
  instagram: "https://www.instagram.com/studio_das_patroassp/",
  // WhatsApp só com números: 55 + DDD + número. Ex.: "5512999999999"
  whatsapp: "5512992514545", // (12) 99251-4545. Confirme que este número usa WhatsApp; se não usar, deixe "".
  // Endereço completo. Ex.: "Rua Exemplo, 100, Centro, Cidade - SP"
  address: "Tv. Dr. Freitas, 60, Centro, Caçapava - SP, 12281-550",
  phone: "(12) 99251-4545",
  // Horários (dia: texto). Vazio ou "Fechado" aparece como está. Edite à vontade.
  hours: {
    "Segunda": "09:00 às 18:00", "Terça": "09:00 às 18:00", "Quarta": "09:00 às 18:00",
    "Quinta": "09:00 às 18:00", "Sexta": "09:00 às 18:00", "Sábado": "09:00 às 13:00", "Domingo": "Fechado"
  },
  // Link de agendamento próprio (ex.: SalonSoft). Se vazio, usa o WhatsApp; sem WhatsApp, usa o Instagram.
  bookingUrl: ""
};

/* ==========================================================
   SERVIÇOS
   Para cada serviço: nome, categoria (cat), duração (ex.: "1h30min"),
   preço (ex.: "a partir de R$ 60,00") e descrição (opcional).
   Duração e preço vazios não aparecem: o card mostra "Valores sob consulta".
   Para adicionar: copie uma linha, cole e edite. Para remover: apague a linha.
   Para um link próprio de um serviço, preencha link: "https://...".
   OS NOMES ABAIXO SÃO EXEMPLOS das 3 áreas do perfil: troque pelos reais.
   ========================================================== */
const CATEGORIES = ["Unhas", "Cílios", "Sobrancelhas"];
const SERVICES = [
  { nome: "Manicure",             cat: "Unhas",        duracao: "", preco: "", desc: "", link: "" },
  { nome: "Pedicure",             cat: "Unhas",        duracao: "", preco: "", desc: "", link: "" },
  { nome: "Alongamento de unhas", cat: "Unhas",        duracao: "", preco: "", desc: "", link: "" },
  { nome: "Esmaltação em gel",    cat: "Unhas",        duracao: "", preco: "", desc: "", link: "" },
  { nome: "Extensão de cílios",   cat: "Cílios",       duracao: "", preco: "", desc: "", link: "" },
  { nome: "Manutenção de cílios", cat: "Cílios",       duracao: "", preco: "", desc: "", link: "" },
  { nome: "Design de sobrancelhas", cat: "Sobrancelhas", duracao: "", preco: "", desc: "", link: "" },
  { nome: "Henna de sobrancelhas",  cat: "Sobrancelhas", duracao: "", preco: "", desc: "", link: "" }
];

/* ---------- Utilitários ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const isUrl = v => /^https?:/.test(v || "");
const norm = s => String(s).normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text) e.textContent = text; return e; }

/* Link do botão "Agendar horário": link do serviço > bookingUrl > WhatsApp > Instagram. */
function bookingLink(nome) {
  if (isUrl(CONFIG.bookingUrl)) return CONFIG.bookingUrl;
  if (CONFIG.whatsapp) {
    const msg = nome ? `Olá! Quero agendar: ${nome}.` : "Olá! Quero agendar um horário.";
    return `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`;
  }
  return CONFIG.instagram;
}
const mapsLink = () => CONFIG.address ? "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(CONFIG.address) : "";

/* ---------- Links gerais ---------- */
function initLinks() {
  $$("[data-book]").forEach(a => a.href = bookingLink());
  const map = { instagram: CONFIG.instagram, maps: mapsLink(), whatsapp: CONFIG.whatsapp ? `https://wa.me/${CONFIG.whatsapp}` : "" };
  $$("[data-link]").forEach(a => { const u = map[a.dataset.link]; if (isUrl(u)) a.href = u; else a.setAttribute("data-off", ""); });
}

/* ---------- Como chegar ---------- */
function initWhere() {
  const addr = $("#addr"), box = $("#map");
  if (!CONFIG.address) {
    addr.textContent = "Endereço em breve. Fale com a gente pelo Instagram ou WhatsApp.";
    box.textContent = "Mapa disponível quando o endereço for preenchido.";
    return;
  }
  addr.textContent = CONFIG.address;
  const ul = $("#hours");
  Object.entries(CONFIG.hours).forEach(([d, t]) => {
    const li = el("li"); li.append(el("span", "", d), el("b", "", t || "Fechado")); ul.append(li);
  });
  $("#fphone").textContent = CONFIG.phone;
  const f = el("iframe"); // mapa incorporado por busca de texto
  f.src = "https://www.google.com/maps?q=" + encodeURIComponent(CONFIG.address) + "&output=embed";
  f.title = "Mapa do Studio das Patroas SP"; f.loading = "lazy";
  box.replaceChildren(f);
}

/* ---------- Serviços: busca + categorias + cards ---------- */
const CLOCK = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>';
function initServices() {
  const root = $("#svc"), state = { cat: CATEGORIES[0], q: "" };
  $("#lead").textContent = `${SERVICES.length} serviços em ${CATEGORIES.length} categorias. Escolha a categoria ou busque pelo nome do serviço.`;
  const tools = el("div", "tools"), search = el("label", "search"), input = el("input");
  search.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>';
  input.type = "search"; input.placeholder = "Buscar serviço: unhas, cílios, sobrancelhas..."; input.setAttribute("aria-label", "Buscar serviço");
  search.append(input);
  const tabs = el("div", "tabs"); tabs.setAttribute("role", "group"); tabs.setAttribute("aria-label", "Categorias");
  const info = el("p", "info"); info.setAttribute("aria-live", "polite");
  const grid = el("div", "grid");
  tools.append(search, tabs); root.append(tools, info, grid);

  const pill = (c, on) => {
    const b = el("button", "pill" + (on ? " on" : ""), c + " "); b.type = "button"; b.setAttribute("aria-pressed", on);
    b.append(el("i", "", String(SERVICES.filter(s => s.cat === c).length)));
    b.addEventListener("click", () => { state.cat = c; state.q = ""; input.value = ""; draw(); });
    return b;
  };
  function card(s) {
    const c = el("article", "card"), top = el("div", "card__top");
    top.append(el("span", "cat", s.cat));
    if (s.duracao) { const t = el("span", "time"); t.innerHTML = CLOCK; t.append(s.duracao); top.append(t); }
    c.append(top, el("h3", "", s.nome));
    if (s.desc) c.append(el("p", "desc", s.desc));
    const price = el("div", "price");
    const m = String(s.preco || "").match(/^(a partir de)\s*(.*)$/i);
    if (!s.preco) price.append(el("span", "", "adicionar R$"));
    else { if (m) price.append(el("small", "", "a partir de")); price.append(el("strong", "", m ? m[2] : s.preco)); }
    const b = el("a", "btn", "Agendar horário");
    b.href = isUrl(s.link) ? s.link : bookingLink(s.nome); b.target = "_blank"; b.rel = "noopener noreferrer";
    b.setAttribute("aria-label", `Agendar ${s.nome}`);
    c.append(price, b); return c;
  }
  function draw() {
    tabs.replaceChildren(...CATEGORIES.map(c => pill(c, !state.q && c === state.cat)));
    const q = norm(state.q);
    const list = q ? SERVICES.filter(s => norm(s.nome + " " + s.cat + " " + (s.desc || "")).includes(q)) : SERVICES.filter(s => s.cat === state.cat);
    info.textContent = q && list.length ? `${list.length} ${list.length === 1 ? "serviço encontrado" : "serviços encontrados"} para "${state.q}"` : "";
    grid.replaceChildren(...list.map(card));
    if (!list.length) grid.append(el("p", "empty", "Nenhum serviço encontrado. Tente outra palavra ou chame a gente no WhatsApp."));
  }
  input.addEventListener("input", () => { state.q = input.value.trim(); draw(); });
  draw();
}

/* ---------- Menu mobile e seção ativa ---------- */
function initNav() {
  const btn = $("#burger"), nav = $("#menu"), links = $$("#menu a");
  const set = o => { nav.classList.toggle("open", o); btn.setAttribute("aria-expanded", o); btn.textContent = o ? "✕" : "☰"; btn.setAttribute("aria-label", o ? "Fechar menu" : "Abrir menu"); };
  btn.addEventListener("click", () => set(!nav.classList.contains("open")));
  links.forEach(a => a.addEventListener("click", () => set(false)));
  document.addEventListener("keydown", e => { if (e.key === "Escape") set(false); });
  const secs = links.map(a => $(a.getAttribute("href")));
  const on = () => {
    const y = scrollY + 120; let cur = secs[0];
    secs.forEach(s => { if (s.offsetTop <= y) cur = s; });
    links.forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + cur.id));
  };
  addEventListener("scroll", on, { passive: true }); on();
}

document.addEventListener("DOMContentLoaded", () => { initLinks(); initWhere(); initServices(); initNav(); });
