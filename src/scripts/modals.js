/**
 * Modals for items and pages: text (quotes, "sobre", "contaminações"), video and the gallery.
 * Each open* function returns a close() function. Esc, the X button and a click on the
 * background close the modal; onClosed runs after the fade-out.
 */

const FADE_MS = 400;
const CLOSE_ICON =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m23.25 24c-.19 0-.38-.07-.53-.22l-10.72-10.72-10.72 10.72c-.29.29-.77.29-1.06 0s-.29-.77 0-1.06l10.72-10.72-10.72-10.72c-.29-.29-.29-.77 0-1.06s.77-.29 1.06 0l10.72 10.72 10.72-10.72c.29-.29.77-.29 1.06 0s .29.77 0 1.06l-10.72 10.72 10.72 10.72c.29.29.29.77 0 1.06-.15.15-.34.22-.53.22"></path></svg>';
const ARROW_LEFT =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>';
const ARROW_RIGHT =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>';

const root = () => document.getElementById("modal-root");

function escapeHtml(text) {
  return String(text ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

/** Shared open/close plumbing. */
function mount(element, { closeLabel, onClosed, onKey }) {
  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "modal-close";
  closeButton.setAttribute("aria-label", closeLabel);
  closeButton.innerHTML = CLOSE_ICON;

  const previousFocus = document.activeElement;
  root().append(element, closeButton);
  requestAnimationFrame(() => requestAnimationFrame(() => element.classList.add("is-open")));
  element.focus({ preventScroll: true });

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    document.removeEventListener("keydown", keydown);
    element.classList.remove("is-open");
    closeButton.remove();
    setTimeout(() => {
      element.remove();
      if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
      onClosed?.();
    }, FADE_MS);
  };
  const keydown = (event) => {
    if (event.key === "Escape") close();
    else onKey?.(event);
  };
  document.addEventListener("keydown", keydown);
  closeButton.addEventListener("click", close);
  element.addEventListener("click", (event) => {
    if (event.target === element || event.target.classList.contains("gallery__stage")) close();
  });
  return close;
}

/** Quote or page: white box with Markdown text. */
export function openText({ title, html, author }, { closeLabel, onClosed }) {
  const modal = document.createElement("div");
  modal.className = "modal modal--text";
  modal.tabIndex = -1;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  modal.innerHTML = `<div class="modal__content">${title ? `<h1 class="page-title">${escapeHtml(title)}</h1>` : ""}<div class="markdown">${html}</div>${
    author ? `<div class="quote-author">[${escapeHtml(author)}]</div>` : ""
  }</div>`;
  return mount(modal, { closeLabel, onClosed });
}

/** Embed URL for Vimeo and YouTube links; null for anything else. */
function embedUrl(url) {
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&dnt=1`;
  const youtube = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]{6,})/);
  if (youtube) return `https://www.youtube-nocookie.com/embed/${youtube[1]}?autoplay=1`;
  return null;
}

/** Video or audio item, with its caption and credit below the player. */
export function openMedia({ type, url, caption, subcaption }, { closeLabel, onClosed }) {
  const modal = document.createElement("div");
  modal.className = `modal modal--video${type === "audio" ? " modal--audio" : ""}`;
  modal.tabIndex = -1;
  modal.setAttribute("role", "dialog");
  modal.setAttribute("aria-modal", "true");
  const embed = type === "video" ? embedUrl(url) : null;
  const player =
    type === "audio"
      ? `<audio controls autoplay src="${escapeHtml(url)}"></audio>`
      : embed
        ? `<iframe src="${escapeHtml(embed)}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="video"></iframe>`
        : `<iframe src="${escapeHtml(url)}" allow="autoplay" title="media"></iframe>`;
  const captions =
    caption || subcaption
      ? `<div class="media__caption"><div class="caption">${escapeHtml(caption)}</div><div class="subcaption">${escapeHtml(subcaption)}</div></div>`
      : "";
  modal.innerHTML = `<div class="modal__content">${player}${captions}</div>`;
  return mount(modal, { closeLabel, onClosed });
}

/** Gallery lightbox: one photo at a time, arrows on desktop, thumbnails on phones, swipe. */
export function openGallery(pictures, { strings, onClosed }) {
  let index = 0;
  const gallery = document.createElement("div");
  gallery.className = "gallery";
  gallery.tabIndex = -1;
  gallery.setAttribute("role", "dialog");
  gallery.setAttribute("aria-modal", "true");
  const many = pictures.length > 1;
  gallery.innerHTML = `
    <div class="gallery__stage">
      <button type="button" class="gallery__control gallery__control--prev ${many ? "is-enabled" : ""}" aria-label="${escapeHtml(strings.previous)}">${ARROW_LEFT}</button>
      <figure class="gallery__figure">
        <img class="gallery__image" alt="" />
        <figcaption class="gallery__caption"><div class="caption"></div><div class="subcaption"></div></figcaption>
      </figure>
      <button type="button" class="gallery__control gallery__control--next ${many ? "is-enabled" : ""}" aria-label="${escapeHtml(strings.following)}">${ARROW_RIGHT}</button>
    </div>
    ${
      many
        ? `<div class="gallery__thumbs">${pictures
            .map((picture, i) => `<button type="button" data-index="${i}" aria-label="${i + 1}"><img src="${escapeHtml(picture.thumb)}" alt="" loading="lazy" /></button>`)
            .join("")}</div>`
        : ""
    }`;

  const image = gallery.querySelector(".gallery__image");
  const caption = gallery.querySelector(".caption");
  const subcaption = gallery.querySelector(".subcaption");
  const thumbs = [...gallery.querySelectorAll(".gallery__thumbs button")];

  const show = (next) => {
    index = (next + pictures.length) % pictures.length;
    const picture = pictures[index];
    image.src = picture.src;
    if (picture.srcset) {
      image.srcset = picture.srcset;
      image.sizes = "(min-width: 768px) 66vw, 100vw";
    } else {
      image.removeAttribute("srcset");
    }
    image.width = picture.width;
    image.height = picture.height;
    image.alt = [picture.caption, picture.subcaption].filter(Boolean).join(" — ");
    caption.textContent = picture.caption;
    subcaption.textContent = picture.subcaption;
    thumbs.forEach((thumb, i) => thumb.classList.toggle("is-current", i === index));
    // Preload the next photo.
    const following = pictures[(index + 1) % pictures.length];
    if (many) new Image().src = following.src;
  };

  gallery.querySelector(".gallery__control--prev").addEventListener("click", () => show(index - 1));
  gallery.querySelector(".gallery__control--next").addEventListener("click", () => show(index + 1));
  thumbs.forEach((thumb) => thumb.addEventListener("click", () => show(Number(thumb.dataset.index))));

  let touchX = null;
  gallery.addEventListener("touchstart", (event) => (touchX = event.touches[0].clientX), { passive: true });
  gallery.addEventListener("touchend", (event) => {
    if (touchX === null || !many) return;
    const dx = event.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
    touchX = null;
  });

  show(0);
  return mount(gallery, {
    closeLabel: strings.close,
    onClosed,
    onKey: (event) => {
      if (!many) return;
      if (event.key === "ArrowRight") show(index + 1);
      if (event.key === "ArrowLeft") show(index - 1);
    },
  });
}
