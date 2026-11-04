(() => {
  "use strict";

  const WHATSAPP_URL = "https://wa.me/971508271036";
  const EMAIL = "alqudra.alain@gmail.com";
  const $ = (id) => document.getElementById(id);

  /* ---------- Toast ---------- */
  function toast(message) {
    const el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  /* ---------- Mobile menu ---------- */
  const menuBtn = $("menuBtn");
  const nav = $("mainNav");

  function setMenu(open) {
    nav.classList.toggle("is-open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }

  menuBtn.addEventListener("click", () => setMenu(!nav.classList.contains("is-open")));
  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      setMenu(false);
      menuBtn.focus();
    }
  });

  /* ---------- Highlight the current section in the nav ---------- */
  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const linkFor = new Map(navLinks.map((link) => [link.getAttribute("href").slice(1), link]));
  const spy = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach((link) => link.removeAttribute("aria-current"));
        linkFor.get(entry.target.id)?.setAttribute("aria-current", "true");
      }
    },
    { rootMargin: "-45% 0px -50% 0px" },
  );
  document.querySelectorAll("main section[id]").forEach((section) => spy.observe(section));

  /* ---------- Hide the floating button while the hero CTA is on screen ---------- */
  const waFloat = $("waFloat");
  new IntersectionObserver(([entry]) => {
    waFloat.classList.toggle("is-hidden", entry.isIntersecting);
  }).observe($("heroCta"));

  /* ---------- Print order form ---------- */
  // Sample rates for the demo: confirm with the customer before go-live.
  const RATE_PER_PAGE = { bw: 0.5, colour: 2 };
  const BINDING_PRICE = { none: 0, spiral: 10, soft: 15, hard: 60 };
  const A3_MULTIPLIER = 2;
  const DOUBLE_SIDED_MULTIPLIER = 0.9;

  const form = $("orderForm");
  const fileInput = $("file");
  const fileName = $("fileName");
  const waOrder = $("waOrder");
  const value = (id) => $(id).value;
  const positiveInt = (id) => Math.max(1, parseInt(value(id), 10) || 1);
  const formatAed = (amount) => (Number.isInteger(amount) ? String(amount) : amount.toFixed(2));

  function estimate() {
    let perPage = RATE_PER_PAGE[value("colour")];
    if (value("size") === "A3") perPage *= A3_MULTIPLIER;
    if (value("sides") === "double") perPage *= DOUBLE_SIDED_MULTIPLIER;
    const total =
      (perPage * positiveInt("pages") + BINDING_PRICE[value("binding")]) * positiveInt("copies");
    return Math.round(total * 2) / 2; // Nearest AED 0.50
  }

  function selectedText(id) {
    const select = $(id);
    return select.options[select.selectedIndex].text;
  }

  function updateOrder() {
    const total = formatAed(estimate());
    const file = fileInput.files[0];
    const notes = value("notes").trim();
    fileName.textContent = file ? file.name : "";
    $("estimate").textContent = `AED ${total}`;

    const lines = [
      "Hello Al Qudra, I want to order a print job:",
      `• File: ${file ? `${file.name} (attaching it in this chat)` : "(I will attach it in this chat)"}`,
      `• Size: ${value("size")} · ${selectedText("colour")} · ${selectedText("sides")}`,
      `• Pages: ${positiveInt("pages")} · Copies: ${positiveInt("copies")}`,
      `• Binding: ${selectedText("binding")}`,
    ];
    if (notes) lines.push(`• Notes: ${notes}`);
    lines.push(`Estimated AED ${total}. Please confirm.`);
    waOrder.href = `${WHATSAPP_URL}?text=${encodeURIComponent(lines.join("\n"))}`;
  }

  form.addEventListener("input", updateOrder);
  form.addEventListener("change", updateOrder);
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    waOrder.click();
  });
  waOrder.addEventListener("click", () => {
    toast(
      fileInput.files[0]
        ? "Opening WhatsApp. Attach your file in the chat."
        : "Opening WhatsApp with your order details",
    );
  });
  updateOrder();

  /* ---------- Copy email ---------- */
  $("copyMail").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      toast("Email copied");
    } catch {
      toast(`Select and copy: ${EMAIL}`);
    }
  });
})();
