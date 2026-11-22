/**
 * The mycelium sketch (p5 instance mode). Ported from sketches/mycelium.js of the Next.js site,
 * same growth rules: a random seed per visit, a branch every few iterations, and one "blob"
 * (an item) placed on a branch every `postsEveryNth` new paths.
 */
import seedrandom from "seedrandom";

function chromeOnWindowsNeedsWorkaround() {
  const ua = navigator.userAgent;
  const windows = /Windows/.test(ua);
  const chrome = ua.match(/(?:Chrome|Chromium)\/(\d+)/);
  return windows && chrome !== null && Number(chrome[1]) >= 83;
}

/**
 * @param {typeof import("p5")} P5
 * @param {HTMLElement} container
 * @param {{posts: {id: string}[], hasNextPage: boolean, strings: Record<string, string>,
 *   showPost: (id: string) => void, nextPage: () => void, goToFirstPage: () => void}} options
 */
export function startMycelium(P5, container, options) {
  return new P5((p5) => {
    const maxIterations = Math.min(Math.floor(window.innerWidth * window.innerHeight * 0.12), 160000);
    let currentIteration = 1;
    let iterationsSincePathCleanUp = 0;
    let paths = new Array(1);
    const collisionGrid = new Set();

    const posts = options.posts;
    let postsCount = 0;
    const blobs = [];
    let canvas;

    const myrng = seedrandom(String(Math.random()));
    let pathsCounter = 1;
    let finished = false;
    const postsEveryNth = Math.max(1, Math.floor(maxIterations / 400));
    const applyChromeAntialiasingWorkaround = chromeOnWindowsNeedsWorkaround();

    class Path {
      constructor(parent) {
        if (parent === undefined) {
          if (window.innerWidth < 1280) {
            this.location = p5.createVector((0.3 + 0.5 * myrng.quick()) * p5.width, (0.3 + 0.5 * myrng.quick()) * p5.height);
          } else {
            this.location = p5.createVector((0.6 + 0.2 * myrng.quick()) * p5.width, (0.3 + 0.5 * myrng.quick()) * p5.height);
          }
          this.velocity = p5.createVector(p5.width / 2 - this.location.x, p5.height / 2 - this.location.y).normalize();
          this.diameter = 4;
          this.level = 1;
          this.iterationCounter = 1;
        } else {
          this.location = parent.location.copy();
          this.velocity = parent.velocity.copy().rotate(-0.75 + 1.5 * myrng.quick());
          this.level = parent.level + 1;
          this.diameter = parent.diameter * 0.98;
          this.iterationCounter = parent.iterationCounter + 1;
        }
      }

      update() {
        this.location.add(this.velocity);
        const bump = p5.createVector(-1 + 2 * myrng.quick(), -1 + 2 * myrng.quick());
        bump.mult(0.012 * Math.log(this.iterationCounter));
        this.velocity.add(bump);
        this.velocity.normalize();

        if (
          myrng.quick() / Math.log(this.iterationCounter) < 0.015 ||
          (this.iterationCounter <= 36 && this.iterationCounter % 7 === 0)
        ) {
          const newPath = new Path(this);
          if (paths.length < 8) {
            newPath.velocity = this.velocity.copy().rotate((paths.length + myrng.quick() / 4) * p5.HALF_PI);
          }
          if (
            pathsCounter % postsEveryNth === 0 &&
            postsCount < posts.length &&
            this.location.x > 15 &&
            this.location.y > 15 &&
            this.location.x < p5.width - 15 &&
            this.location.y < p5.height - 15
          ) {
            const blob = blobs[postsCount];
            blob.position(this.location.x - 6, this.location.y - 6);
            blob.removeClass("invisible");
            postsCount++;
          }
          paths.push(newPath);
          pathsCounter++;
        }

        this.diameter = this.diameter > 2 ? this.diameter * 0.98 : this.diameter * 0.9986;
        this.iterationCounter = this.iterationCounter + 1;
      }
    }

    function addPostBlobs() {
      for (const post of posts) {
        const blob = p5.createSpan("");
        blob.addClass("mycelium_blob");
        blob.addClass("invisible");
        blob.addClass("unvisited");
        blob.attribute("data-post-id", post.id);
        blob.attribute("role", "button");
        blob.attribute("tabindex", "0");
        blob.position(0, 0);
        blob.mouseClicked(() => openPost(blob));
        blob.elt.addEventListener("keydown", (event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openPost(blob);
          }
        });
        blobs.push(blob);
      }
    }

    function drawFirstPath() {
      paths[0] = new Path();
      p5.fill("#fff");
      p5.ellipse(
        paths[0].location.x - paths[0].velocity.x * paths[0].diameter,
        paths[0].location.y - paths[0].velocity.y * paths[0].diameter,
        5,
        6,
      );
      p5.fill("#eee");
      p5.loop();
    }

    p5.setup = () => {
      p5.frameRate(50);
      p5.pixelDensity(1);
      canvas = p5.createCanvas(window.innerWidth, window.innerHeight);
      p5.background(p5.color(48, 38, 37));
      p5.ellipseMode(p5.CENTER);
      p5.noStroke();
      p5.smooth();
      p5.noLoop();
      addPostBlobs();
      setTimeout(drawFirstPath, 600);
    };

    p5.draw = () => {
      const pathsLength = paths.length;

      for (let i = pathsLength - 1; i >= 0 && currentIteration < maxIterations; i--) {
        if ((i > 10 && myrng.quick() < 0.3) || paths[i] == null) continue;

        const loc = paths[i].location;
        const diam = paths[i].diameter;
        const vel = paths[i].velocity;

        // Workaround for canvas flickering on Chrome for Windows (https://bugs.chromium.org/p/chromium/issues/detail?id=1092080).
        if (applyChromeAntialiasingWorkaround) {
          p5.get(loc.x + diam * vel.x, loc.y + diam * vel.y);
        }

        if (
          collisionGrid.has(Math.round(loc.x + diam * vel.x) + "_" + Math.round(loc.y + diam * vel.y)) ||
          diam <= 0.45 ||
          loc.x <= 0 ||
          loc.y <= 0 ||
          loc.x >= p5.width ||
          loc.y >= p5.height
        ) {
          paths[i] = null;
        } else {
          p5.ellipse(loc.x, loc.y, diam, diam);
          collisionGrid.add(Math.round(loc.x) + "_" + Math.round(loc.y));

          if (diam >= 1) {
            for (let x = Math.round(loc.x - diam / p5.PI); x <= Math.round(loc.x + diam / p5.PI); x++) {
              for (let y = Math.round(loc.y - diam / p5.PI); y <= Math.round(loc.y + diam / p5.PI); y++) {
                collisionGrid.add(x + "_" + y);
              }
            }
          } else {
            collisionGrid.add(Math.round(loc.x - (diam * vel.x) / p5.PI) + "_" + Math.round(loc.y - (diam * vel.y) / p5.PI));
          }
          paths[i].update();
        }
        currentIteration += 1;
      }

      iterationsSincePathCleanUp += 1;
      if (iterationsSincePathCleanUp > 20) {
        paths = paths.filter((path) => path != null);
        iterationsSincePathCleanUp = 0;
      }

      // Stop when the iteration budget is spent or no path is left, then make the blobs pulse.
      if (currentIteration === maxIterations || pathsLength === 0) {
        paths = [];
        p5.noLoop();
        blobs.forEach((blob, index) => setTimeout(() => blob.addClass("pulse"), 200 * index));
        currentIteration++;
        finished = true;
        maybeShowNext();
      }
    };

    function fadeOutAnd(button, extra, action) {
      setTimeout(action, 1000);
      button.addClass("hide-to-right");
      extra?.addClass("hide-to-right");
      blobs.forEach((blob) => blob.style("opacity", "0"));
      canvas.style("opacity", "0");
    }

    function openPost(blob) {
      options.showPost(blob.attribute("data-post-id"));
      blob.removeClass("pulse");
      blob.removeClass("unvisited");
      maybeShowNext();
    }

    /**
     * Once the mycelium stopped and every blob on screen was visited, offer the next page
     * (or the end message). Only blobs on screen count: when growth stops early, some never appear.
     */
    function maybeShowNext() {
      const allVisited = document.querySelectorAll(".mycelium_blob.unvisited:not(.invisible)").length === 0;
      const alreadyShown = document.querySelector(".mycelium_next_button, .mycelium_end_message");
      if (!finished || !allVisited || alreadyShown) return;
      if (options.hasNextPage) {
        const nextButton = p5.createButton(options.strings.next);
        nextButton.addClass("mycelium_next_button");
        nextButton.mousePressed(() => fadeOutAnd(nextButton, null, options.nextPage));
      } else {
        const endMessage = p5.createDiv(options.strings.end);
        endMessage.addClass("mycelium_end_message");
        const firstPageButton = p5.createButton(options.strings.restart);
        firstPageButton.addClass("mycelium_first_page_button");
        firstPageButton.mousePressed(() => fadeOutAnd(firstPageButton, endMessage, options.goToFirstPage));
      }
    }
  }, container);
}
