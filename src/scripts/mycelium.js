/** p5 hosts the animated drawing and accessible item controls. */
import { growMycelium, postPositions } from "./mycelium-growth.js";

/**
 * @param {typeof import("p5")} P5
 * @param {HTMLElement} container
 * @param {{posts: {id: string}[], hasNextPage: boolean, strings: Record<string, string>,
 *   showPost: (id: string) => void, nextPage: () => void, goToFirstPage: () => void,
 *   seed?: string, preset?: string}} options
 */
export function startMycelium(P5, container, options) {
  return new P5((p5) => {
    const seed = options.seed ?? String(Math.random());
    const preset = options.preset ?? "balanced";
    const blobs = [];
    const timers = new Set();
    let growth, positions, canvas, drawn = 0, finished = false, disposed = false;
    let nextButton = null, endMessage = null, transitioning = false;
    function later(action, delay) {
      const timer = setTimeout(() => { timers.delete(timer); if (!disposed) action(); }, delay);
      timers.add(timer);
    }
    // p5 removes DOM nodes, but application timers also need to stop on page changes.
    const remove = p5.remove.bind(p5);
    p5.remove = () => {
      disposed = true;
      timers.forEach(clearTimeout);
      timers.clear();
      remove();
    };
    function prepareGrowth() {
      timers.forEach(clearTimeout);
      timers.clear();
      canvas.style("opacity", "1");
      growth = growMycelium({ width: p5.width, height: p5.height, seed, preset });
      positions = postPositions(growth, options.posts.length);
      drawn = 0;
      finished = false;
      transitioning = false;
      nextButton?.remove(); nextButton = null;
      endMessage?.remove(); endMessage = null;
      p5.background(48, 38, 37);
      blobs.forEach((blob) => {
        blob.addClass("invisible");
        blob.removeClass("pulse");
        blob.attribute("tabindex", "-1");
        blob.style("opacity", "");
      });
      p5.loop();
    }
    p5.setup = () => {
      p5.frameRate(50);
      p5.pixelDensity(1);
      canvas = p5.createCanvas(window.innerWidth, window.innerHeight);
      p5.background(48, 38, 37);
      p5.noLoop();
      for (const post of options.posts) {
        const blob = p5.createSpan("");
        blob.addClass("mycelium_blob");
        blob.addClass("invisible");
        blob.addClass("unvisited");
        blob.attribute("data-post-id", post.id);
        blob.attribute("role", "button");
        blob.attribute("tabindex", "-1");
        blob.attribute("aria-label", `${document.documentElement.lang.startsWith("pt") ? "Abrir item" : "Open item"} ${post.id}`);
        blob.position(0, 0);
        blob.mouseClicked(() => openPost(blob));
        blob.elt.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openPost(blob); }
        });
        blobs.push(blob);
      }
      later(prepareGrowth, 600);
    };
    p5.draw = () => {
      if (!growth || disposed) return;
      const context = p5.drawingContext;
      context.lineCap = "round";
      const until = Math.min(growth.segments.length, drawn + Math.max(100, Math.ceil(growth.segments.length / 160)));
      // One continuous stroke per tip in this frame avoids dotted antialiasing at
      // every 1–2px segment and reduces canvas calls for dense colonies.
      const strokes = new Map();
      for (; drawn < until; drawn++) {
        const line = growth.segments[drawn];
        if (!strokes.has(line.owner)) strokes.set(line.owner, []);
        strokes.get(line.owner).push(line);
      }
      for (const lines of strokes.values()) {
        const first = lines[0];
        context.strokeStyle = `rgba(243,238,226,${first.alpha})`;
        context.lineWidth = first.width;
        context.beginPath();
        context.moveTo(first.x, first.y);
        for (const line of lines) context.lineTo(line.nx, line.ny);
        context.stroke();
      }
      positions.forEach((position, index) => {
        if (position.at <= drawn && blobs[index].hasClass("invisible")) {
          blobs[index].position(position.x - 6, position.y - 6);
          blobs[index].removeClass("invisible");
          blobs[index].attribute("tabindex", "0");
        }
      });
      if (drawn >= growth.segments.length) {
        finished = true;
        p5.noLoop();
        blobs.forEach((blob, index) => later(() => { if (blob.hasClass("unvisited")) blob.addClass("pulse"); }, 200 * index));
        maybeShowNext();
      }
    };
    p5.windowResized = () => {
      if (disposed || !growth) return;
      p5.resizeCanvas(window.innerWidth, window.innerHeight);
      prepareGrowth();
    };
    function fadeOutAnd(action) {
      if (transitioning || disposed) return;
      transitioning = true;
      nextButton?.attribute("disabled", "");
      nextButton?.addClass("hide-to-right");
      endMessage?.addClass("hide-to-right");
      blobs.forEach((blob) => blob.style("opacity", "0"));
      canvas.style("opacity", "0");
      later(action, 1000);
    }
    function openPost(blob) {
      options.showPost(blob.attribute("data-post-id"));
      blob.removeClass("pulse");
      blob.removeClass("unvisited");
      maybeShowNext();
    }
    function maybeShowNext() {
      if (!finished || nextButton || blobs.some((blob) => blob.hasClass("unvisited"))) return;
      if (options.hasNextPage) {
        nextButton = p5.createButton(options.strings.next);
        nextButton.addClass("mycelium_next_button");
        nextButton.mousePressed(() => fadeOutAnd(options.nextPage));
      } else {
        endMessage = p5.createDiv(options.strings.end);
        endMessage.addClass("mycelium_end_message");
        nextButton = p5.createButton(options.strings.restart);
        nextButton.addClass("mycelium_first_page_button");
        nextButton.mousePressed(() => fadeOutAnd(options.goToFirstPage));
      }
    }
  }, container);
}
