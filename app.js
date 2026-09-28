import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.3/package/xlsx.mjs";

const navToggle = document.querySelector(".mobile-nav-toggle");
const navMenu = document.querySelector("#main-nav-menu");
function closeMobileMenu() {
  navMenu?.classList.remove("is-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Abrir menú");
  if (navToggle) navToggle.textContent = "☰";
}
navToggle?.addEventListener("click", () => {
  const isOpen = navToggle.getAttribute("aria-expanded") === "true";
  if (isOpen) {
    closeMobileMenu();
  } else {
    navMenu?.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    navToggle.setAttribute("aria-label", "Cerrar menú");
    navToggle.textContent = "×";
  }
});
navMenu?.querySelectorAll("a").forEach(link => link.addEventListener("click", closeMobileMenu));
document.addEventListener("keydown", event => {
  if (event.key === "Escape") closeMobileMenu();
});

const workbookUrl = "./assets/database/Animales.xlsx";
const fallbackImage = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=700&q=80";
const maxAnimals = 4;
const grid = document.querySelector("#animales .animals-grid");
const status = document.querySelector("#animals-status");
const normalize = value => String(value ?? "").trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const safeImageUrl = value => {
  const raw = String(value ?? "").trim();
  if (!raw) return fallbackImage;
  try {
    const url = new URL(raw, document.baseURI);
    return ["https:", "http:"].includes(url.protocol) ? url.href : fallbackImage;
  } catch {
    return fallbackImage;
  }
};

function setStatus(message, visible = true) {
  if (!status) return;
  status.textContent = message;
  status.hidden = !visible;
}

function getColumn(headers, ...names) {
  const candidates = names.map(normalize);
  return headers.findIndex(header => candidates.includes(normalize(header)));
}

function renderAnimals(animals) {
  if (!grid) return;
  if (!animals.length) {
    grid.innerHTML = "";
    setStatus("Ahora mismo no hay perros publicados en Animales.xlsx.");
    return;
  }

  grid.innerHTML = animals.map(animal => {
    const name = escapeHtml(animal.name);
    const image = safeImageUrl(animal.folder ? `./media/animales/${encodeURIComponent(animal.folder)}/00.jpg` : fallbackImage);
    const subject = encodeURIComponent(`Adopción de ${animal.name}`);
    const meta = [animal.age, animal.gender].filter(Boolean).map(escapeHtml).join(" · ");
    return `<article class="animal-card"><div class="animal-image-wrapper"><img class="animal-image" src="${escapeHtml(image)}" alt="${name}" loading="lazy" data-fallback="${escapeHtml(fallbackImage)}"></div><div class="animal-content"><h3 class="animal-name">${name}</h3><p class="animal-meta">${meta}</p><p class="animal-description">${escapeHtml(animal.description)}</p><a class="btn btn-primary btn-small" href="mailto:hola@almasbellas.org?subject=${subject}">Conocer más</a></div></article>`;
  }).join("");
  grid.querySelectorAll("img[data-fallback]").forEach(image => {
    image.addEventListener("error", () => {
      image.src = image.dataset.fallback;
      image.removeAttribute("data-fallback");
    }, { once: true });
  });
  setStatus("", false);
}

async function loadAnimals() {
  if (!grid) return;
  setStatus("Cargando perros desde Animales.xlsx…");
  try {
    const response = await fetch(workbookUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`No se pudo descargar el Excel (${response.status}).`);
    const workbook = XLSX.read(await response.arrayBuffer());
    const sheet = workbook.Sheets.Sheet1;
    if (!sheet) throw new Error("El archivo no contiene la hoja Sheet1.");
    const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false });
    const headers = rows.shift() ?? [];
    const nameIndex = getColumn(headers, "nombre", "name");
    const ageIndex = getColumn(headers, "edad", "age");
    const genderIndex = getColumn(headers, "genero", "sexo", "gender");
    const folderIndex = getColumn(headers, "carpeta", "folder");
    const descriptionIndex = getColumn(headers, "descripcion", "description");
    const stateIndex = getColumn(headers, "estado web", "estado", "visibilidad");
    if (nameIndex < 0 || ageIndex < 0 || descriptionIndex < 0) {
      throw new Error("La primera fila necesita las columnas Nombre, Edad y Descripción.");
    }

    const hiddenStates = new Set(["editando", "borrador", "oculto", "inactivo", "archivado", "no publicar"]);
    const animals = rows.map(row => {
      const state = stateIndex < 0 ? "" : normalize(row[stateIndex]);
      const name = String(row[nameIndex] ?? "").trim();
      const age = String(row[ageIndex] ?? "").trim();
      const gender = genderIndex < 0 ? "" : String(row[genderIndex] ?? "").trim();
      const folder = folderIndex < 0 ? "" : String(row[folderIndex] ?? "").trim().replace(/[\\/]/g, "");
      const description = String(row[descriptionIndex] ?? "").trim();
      return { name, age, gender, folder, description, state };
    }).filter(animal => animal.name && animal.age && animal.description && !hiddenStates.has(animal.state)).slice(-maxAnimals);

    renderAnimals(animals);
  } catch (error) {
    console.error("No se pudo leer Animales.xlsx:", error);
    grid.innerHTML = "";
    setStatus("No se pudieron cargar los perros desde Animales.xlsx. Comprueba que el archivo esté publicado en assets/database y que tenga las columnas necesarias.");
  }
}

loadAnimals();
