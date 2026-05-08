const i18n = {
  en: {
    nav_products:       "Products",
    nav_milestones:     "Milestones",
    nav_about:          "Studio",
    nav_support:        "Contact",
    hero_eyebrow:       "Human-directed · AI-powered · Always shipping",
    hero_line1:         "We don't build apps.",
    hero_line2:         "We deploy",
    hero_line3:         "experiences.",
    hero_text:          "Deer Rock Studios operates at the intersection of human vision and machine intelligence — deploying 60+ specialized AI agents to design, build, and ship products faster than any traditional team could imagine.",
    hero_cta_1:         "See Our Work",
    hero_cta_2:         "The Studio",
    intel_label:        "SYSTEM ACTIVE",
    intel_agents:       "Agents deployed",
    intel_products_label: "Live products",
    intel_sub:          "Pipeline running. Target: 50 products.",
    latest_eyebrow:     "LATEST DEPLOYMENT",
    latest_desc:        "2D top-down RPG sandbox — Web",
    products_title:     "Deployed Products",
    products_pill:      "Live",
    milestones_title:   "Milestones",
    milestones_pill:    "Since launch",
    ms1_stat:           "0 → Play Store",
    ms1_desc:           "Concept to Google Play approved in under 30 days.",
    ms2_stat:           "85+ users",
    ms2_desc:           "Organic users on launch week. Zero ad spend.",
    ms3_stat:           "3 platforms",
    ms3_desc:           "Web, Android, and itch.io from a single codebase.",
    ms4_stat:           "60+ AI agents",
    ms4_desc:           "Fully parallelized AI pipeline running in production.",
    ms5_stat:           "Day-1 revenue",
    ms5_desc:           "Monetization live on launch day via Stripe and AdMob.",
    ms6_stat:           "Sub-48h approval",
    ms6_desc:           "Play Store review completed in under 48 hours.",
    about_title:        "The Studio",
    about_lead:         '"The bottleneck in software was never ideas — it was execution speed. We removed it."',
    about_text:         "Deer Rock Studios is an AI-native product studio. We run a coordinated intelligence network of 60+ specialized agents — covering design, engineering, QA, deployment and growth — all directed by human creative vision.",
    about_text2:        "Our stack is battle-tested: Firebase, Stripe, AdMob, Capacitor. Our velocity is unprecedented. Every new product ships faster than the last.",
    stat_products:      "Products live",
    stat_agents:        "AI agents",
    stat_goal:          "Product target",
    stat_ambition:      "Ambition",
    support_title:      "Contact",
    support_text:       "Support, press, partnerships, investment — we read every message.",
    press_title:        "Press & Partners",
    press_text:         'Covering AI-native studios? We\'re available. Mention "Press" in your subject line.',
    footer_privacy:     "Privacy Policy",
    footer_delete:      "Delete Account",
    footer_tag:         "Built by intelligence. Shaped by vision.",
    product_visit:      "Visit →"
  },
  es: {
    nav_products:       "Productos",
    nav_milestones:     "Logros",
    nav_about:          "Estudio",
    nav_support:        "Contacto",
    hero_eyebrow:       "Dirección humana · Potencia IA · Siempre publicando",
    hero_line1:         "No construimos apps.",
    hero_line2:         "Desplegamos",
    hero_line3:         "experiencias.",
    hero_text:          "Deer Rock Studios opera en la intersección de la visión humana y la inteligencia artificial — desplegando 60+ agentes IA especializados para diseñar, construir y publicar productos más rápido que cualquier equipo tradicional.",
    hero_cta_1:         "Ver Nuestros Productos",
    hero_cta_2:         "El Estudio",
    intel_label:        "SISTEMA ACTIVO",
    intel_agents:       "Agentes desplegados",
    intel_products_label: "Productos activos",
    intel_sub:          "Pipeline en ejecución. Meta: 50 productos.",
    latest_eyebrow:     "ÚLTIMO DESPLIEGUE",
    latest_desc:        "RPG sandbox 2D — Web",
    products_title:     "Productos Desplegados",
    products_pill:      "Activo",
    milestones_title:   "Logros",
    milestones_pill:    "Desde el lanzamiento",
    ms1_stat:           "0 → Play Store",
    ms1_desc:           "De concepto a Google Play aprobado en menos de 30 días.",
    ms2_stat:           "85+ usuarios",
    ms2_desc:           "Usuarios orgánicos en semana de lanzamiento. Sin inversión en anuncios.",
    ms3_stat:           "3 plataformas",
    ms3_desc:           "Web, Android e itch.io desde un único código base.",
    ms4_stat:           "60+ agentes IA",
    ms4_desc:           "Pipeline IA totalmente paralelo en producción.",
    ms5_stat:           "Revenue desde día 1",
    ms5_desc:           "Monetización activa desde el día de lanzamiento con Stripe y AdMob.",
    ms6_stat:           "Aprobación sub-48h",
    ms6_desc:           "Revisión de Play Store completada en menos de 48 horas.",
    about_title:        "El Estudio",
    about_lead:         '"El cuello de botella del software nunca fueron las ideas — fue la velocidad de ejecución. Nosotros lo eliminamos."',
    about_text:         "Deer Rock Studios es un estudio de productos nativo de IA. Operamos una red de inteligencia coordinada de 60+ agentes especializados — cubriendo diseño, ingeniería, QA, despliegue y crecimiento — dirigidos por visión creativa humana.",
    about_text2:        "Nuestro stack está probado: Firebase, Stripe, AdMob, Capacitor. Nuestra velocidad, sin precedentes. Cada nuevo producto se publica más rápido que el anterior.",
    stat_products:      "Productos activos",
    stat_agents:        "Agentes IA",
    stat_goal:          "Meta de productos",
    stat_ambition:      "Ambición",
    support_title:      "Contacto",
    support_text:       "Soporte, prensa, alianzas, inversión — leemos cada mensaje.",
    press_title:        "Prensa y Alianzas",
    press_text:         'Cubriendo estudios nativos de IA? Estamos disponibles. Menciona "Prensa" en el asunto.',
    footer_privacy:     "Política de Privacidad",
    footer_delete:      "Eliminar Cuenta",
    footer_tag:         "Construido por inteligencia. Moldeado por visión.",
    product_visit:      "Visitar →"
  }
};

let currentLang = "en";
let products = [];

function setLanguage(lang) {
  currentLang = lang;
  document.documentElement.lang = lang;
  const t = i18n[lang];
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.getElementById("lang-btn").textContent = lang === "en" ? "ES" : "EN";
  renderProducts();
}

function getPlatformLabel(p) {
  return { web: "Web", android: "Android", ios: "iOS" }[p] || p;
}

function renderProducts() {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = "";
  const t = i18n[currentLang];

  products.forEach((p) => {
    const card = document.createElement("article");
    card.className = "product";
    const desc = currentLang === "es" ? p.description_es : p.description_en;
    const badgeClass = p.badge === "Live" ? "live" : p.badge === "In Dev" ? "indev" : "";
    const iconHtml = p.icon
      ? `<img src="${p.icon}" alt="${p.name}" class="product-icon" loading="lazy">`
      : `<div class="product-icon-placeholder">🚀</div>`;
    const platformsHtml = (p.platforms || [])
      .map(pl => `<span class="platform-dot">${getPlatformLabel(pl)}</span>`)
      .join("");
    const linkUrl = p.url && p.url !== "#" ? p.url : null;

    card.innerHTML = `
      <div class="product-head">
        ${iconHtml}
        <div class="product-meta">
          <div class="product-name">${p.name}</div>
          <span class="badge ${badgeClass}">${p.badge}</span>
        </div>
      </div>
      <p class="product-desc">${desc}</p>
      <div class="product-footer">
        <div class="product-platforms">${platformsHtml}</div>
        ${linkUrl ? `<a href="${linkUrl}" target="_blank" rel="noopener" class="product-link">${t.product_visit}</a>` : ''}
      </div>
    `;
    grid.appendChild(card);
  });

  const liveCount = products.filter(p => p.badge === "Live").length;
  const counter     = document.getElementById("shipped-count");
  const bar         = document.getElementById("mission-bar");
  const statProd    = document.getElementById("stat-products");
  if (counter)  counter.textContent = liveCount;
  if (bar)      setTimeout(() => { bar.style.width = (liveCount / 50 * 100) + "%"; }, 150);
  if (statProd) statProd.textContent = liveCount;
}

async function loadProducts() {
  try {
    const res = await fetch("./products.json", { cache: "no-store" });
    products = await res.json();
  } catch {
    products = [];
  }
  renderProducts();
}

document.getElementById("lang-btn").addEventListener("click", () => {
  setLanguage(currentLang === "en" ? "es" : "en");
});

document.getElementById("year").textContent = new Date().getFullYear();
loadProducts();
setLanguage("en");
