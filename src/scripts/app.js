/**
 * Client controller: the "quer som?" question, the mycelium pages (10 items each, shuffled),
 * modals and the URL (/p/26, /sobre, ...), with the browser back button working.
 */
import { openGallery, openMedia, openText } from "./modals.js";
import { startMycelium } from "./mycelium.js";

const POSTS_PER_PAGE = 10;
const data = JSON.parse(document.getElementById("fluxus-data").textContent);
const { routes, strings } = data;

const nav = document.getElementById("site-nav");
const question = document.getElementById("sound-question");
const sketchContainer = document.getElementById("sketch");
const soundToggle = document.getElementById("sound-toggle");
const music = document.getElementById("music");

let shuffled = shuffle([...data.posts]);
let currentPage = 0;
let sketch = null;
let started = false;
let closeModal = null;
let activeModal = null; // only the latest modal may change the URL when it closes

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function track(action, label) {
  window.gtag?.("event", action, { event_category: "Content", event_label: label });
}

/* Sound */

function setPlaying(playing) {
  soundToggle.classList.toggle("is-playing", playing);
  if (playing) {
    music.play().catch(() => soundToggle.classList.remove("is-playing"));
  } else {
    music.pause();
  }
}

soundToggle.addEventListener("click", () => setPlaying(music.paused));

/* Mycelium */

async function startSketch() {
  const { default: P5 } = await import("p5");
  sketch?.remove();
  sketch = startMycelium(P5, sketchContainer, {
    posts: shuffled.slice(currentPage * POSTS_PER_PAGE, (currentPage + 1) * POSTS_PER_PAGE),
    hasNextPage: shuffled.length > (currentPage + 1) * POSTS_PER_PAGE,
    strings,
    showPost: (id) => openItem(id),
    nextPage: () => {
      currentPage += 1;
      track("next_page", String(currentPage));
      startSketch();
    },
    goToFirstPage: () => {
      currentPage = 0;
      shuffled = shuffle([...data.posts]);
      track("back_to_first_page", "0");
      startSketch();
    },
  });
}

function askForSound() {
  if (started) return;
  started = true;
  question.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => question.classList.add("is-visible")));
  question.querySelectorAll("[data-sound]").forEach((button) =>
    button.addEventListener("click", () => {
      question.hidden = true;
      soundToggle.hidden = false;
      setPlaying(button.dataset.sound === "yes");
      startSketch();
    }),
  );
}

/* Modals and URLs */

function pathFor(target) {
  if (!target) return routes.home;
  if (target.kind === "item") return routes.itemPrefix + target.id;
  return routes[target.name];
}

function show(target, { push }) {
  closeModal?.();
  closeModal = null;
  if (push) {
    history.pushState(target, "", pathFor(target));
    window.gtag?.("config", data.analytics, { page_path: pathFor(target) });
    track(target.kind === "item" ? "open_post_modal" : "open_page_modal", pathFor(target));
  }

  const token = Symbol("modal");
  activeModal = token;
  const onClosed = () => {
    if (activeModal !== token) return;
    activeModal = null;
    closeModal = null;
    if (location.pathname !== routes.home && !history.state?.closing) {
      history.pushState(null, "", routes.home);
    }
    askForSound();
  };
  const options = { closeLabel: strings.close, strings, onClosed };

  if (target.kind === "page") {
    closeModal = openText(data.pages[target.name], options);
    return;
  }
  const post = data.posts.find((candidate) => candidate.id === target.id);
  if (!post) {
    history.replaceState(null, "", routes.home);
    askForSound();
    return;
  }
  if (post.type === "gallery") closeModal = openGallery(post.pictures, options);
  else if (post.type === "quote") closeModal = openText({ html: post.html, author: post.author }, options);
  else closeModal = openMedia(post.url, options);
}

function openItem(id) {
  show({ kind: "item", id }, { push: true });
}

function targetFromPath(pathname) {
  if (pathname.startsWith(routes.itemPrefix)) return { kind: "item", id: decodeURIComponent(pathname.slice(routes.itemPrefix.length)) };
  if (pathname === routes.about) return { kind: "page", name: "about" };
  if (pathname === routes.contaminations) return { kind: "page", name: "contaminations" };
  return null;
}

// Header links open their page as a modal, without reloading.
document.querySelectorAll("[data-route]").forEach((link) =>
  link.addEventListener("click", (event) => {
    const route = link.dataset.route;
    if (route === "home") {
      event.preventDefault();
      closeModal?.();
      return;
    }
    event.preventDefault();
    show({ kind: "page", name: route }, { push: true });
  }),
);

window.addEventListener("popstate", () => {
  const target = targetFromPath(location.pathname);
  if (target) {
    show(target, { push: false });
  } else if (closeModal) {
    history.replaceState({ closing: true }, "", location.pathname);
    closeModal();
    closeModal = null;
  }
});

/* Start */

requestAnimationFrame(() => nav.classList.add("is-visible"));
if (data.open) {
  show(data.open, { push: false });
} else {
  askForSound();
}
