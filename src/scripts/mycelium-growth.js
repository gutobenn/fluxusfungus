/** Deterministic hyphal growth shared by the live sketch and the visual studies. */
import seedrandom from "seedrandom";

export const MYCELIUM_STUDIES = {
  balanced: { title: "01 · Hifas orgânicas", description: "Ramificação lateral, pontas afiladas e densidade irregular.", roots: 9, branchEvery: 33, angle: 0.72, bend: 0.025, thickness: 2.1, taper: 0.9992, child: 0.79, budget: 0.075, spread: 1 },
  cotton: { title: "02 · Micélio algodonoso", description: "Uma colônia macia de filamentos finos e ramificações próximas.", roots: 28, branchEvery: 18, angle: 0.8, bend: 0.045, thickness: 1.3, taper: 0.9993, child: 0.9, budget: 0.15, spread: 0.88, colonies: 4 },
  cords: { title: "03 · Cordões e capilares", description: "Cordões dominantes com uma trama delicada de hifas laterais.", roots: 7, branchEvery: 39, angle: 0.62, bend: 0.019, thickness: 3.0, taper: 0.9991, child: 0.66, budget: 0.07, spread: 1.15 },
  fan: { title: "04 · Leques de crescimento", description: "Frentes de expansão alongadas e ramificações em ângulos estreitos.", roots: 8, branchEvery: 28, angle: 0.39, bend: 0.015, thickness: 1.8, taper: 0.999, child: 0.81, budget: 0.08, spread: 1.05 },
  web: { title: "05 · Rede anastomosada", description: "Crescimento sinuoso e encontros entre filamentos formando uma rede.", roots: 18, branchEvery: 24, angle: 1.03, bend: 0.065, thickness: 1.65, taper: 0.9994, child: 0.87, budget: 0.12, spread: 0.94, colonies: 3 },
};

/**
 * Growth happens only at tips. Branches inherit direction and taper; occupied tips join
 * existing hyphae and stop instead of crossing endlessly. This is an artistic growth
 * model, rather than a biological simulation. All dimensions are CSS pixels.
 */
export function growMycelium({ width, height, seed = String(Math.random()), preset = "balanced" }) {
  const config = MYCELIUM_STUDIES[preset] ?? MYCELIUM_STUDIES.balanced;
  const random = seedrandom(seed);
  const segments = [];
  const points = [];
  const occupied = new Map();
  const scale = Math.max(0.6, Math.min(width / 1440, height / 900));
  const origin = { x: width * (width < 800 ? 0.52 : 0.61), y: height * 0.54 };
  const margin = Math.min(40, width * 0.05);
  const top = Math.min(150, height * 0.2);
  const budget = Math.min(120000, Math.max(11000, Math.floor(width * height * config.budget)));
  const cellSize = 4;
  let nextId = 0;
  let tips = [];
  const fieldPhase = random() * 100;
  function tip(x, y, heading, diameter, generation = 0) {
    return { id: nextId++, x, y, heading, diameter, generation, age: 0, bend: 0, branchAt: 12 + random() * config.branchEvery * 1.5, life: (120 + random() * 480) * scale };
  }
  const colonies = Array.from({ length: config.colonies ?? 1 }, (_, index) => index === 0 ? origin : {
    x: width * (0.2 + random() * 0.57), y: Math.max(top + 15, height * (0.3 + random() * 0.44)),
  });
  for (let index = 0; index < config.roots; index++) {
    const angle = config.colonies ? random() * Math.PI * 2 : index / config.roots * Math.PI * 2 + (random() - 0.5) * 0.65;
    const center = colonies[index % colonies.length];
    tips.push(tip(center.x + Math.cos(angle) * 2, center.y + Math.sin(angle) * 2, angle, config.thickness * (0.55 + random() * 0.6) * scale));
  }
  function nearby(x, y, owner) {
    const cx = Math.floor(x / cellSize), cy = Math.floor(y / cellSize);
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
      for (const point of occupied.get(`${cx + dx},${cy + dy}`) ?? []) {
        if (point.owner !== owner && Math.hypot(point.x - x, point.y - y) < 1.5 * scale) return point;
      }
    }
    return null;
  }
  let rounds = 0;
  while (tips.length && segments.length < budget && rounds++ < 1800) {
    const following = [];
    for (const current of tips) {
      if (segments.length >= budget) break;
      const { x, y } = current;
      current.bend = current.bend * 0.86 + (random() - 0.5) * config.bend;
      const field = Math.sin(x * 0.008 + fieldPhase) * Math.cos(y * 0.009 - fieldPhase);
      current.heading += current.bend + field * config.bend * 0.18;
      const step = 1.8 * scale * config.spread;
      let nx = x + Math.cos(current.heading) * step;
      let ny = y + Math.sin(current.heading) * step;
      if (nx < margin || nx > width - margin || ny < top || ny > height - margin || current.diameter < 0.22 * scale || current.age > current.life) continue;
      const join = current.age > 14 ? nearby(nx, ny, current.id) : null;
      if (join) { nx = join.x; ny = join.y; }
      const alpha = Math.min(0.88, 0.38 + current.diameter / scale * 0.21) * (0.83 + random() * 0.17);
      segments.push({ x, y, nx, ny, width: current.diameter, alpha, owner: current.id });
      current.x = nx; current.y = ny; current.age++;
      if (current.age % 3 === 0) {
        const point = { x: nx, y: ny, owner: current.id, at: segments.length };
        const key = `${Math.floor(nx / cellSize)},${Math.floor(ny / cellSize)}`;
        if (!occupied.has(key)) occupied.set(key, []);
        occupied.get(key).push(point);
        points.push(point);
      }
      if (join) continue;
      current.diameter *= current.age > current.life * 0.75 ? 0.975 : config.taper;
      if (current.age > current.branchAt && current.diameter > 0.34 * scale && following.length < 1800) {
        const direction = random() < 0.5 ? -1 : 1;
        const child = tip(nx, ny, current.heading + direction * config.angle * (0.65 + random() * 0.65), current.diameter * config.child, current.generation + 1);
        following.push(child);
        current.heading -= direction * config.angle * 0.09;
        current.branchAt += config.branchEvery * (0.65 + random() * 0.9);
      }
      following.push(current);
    }
    tips = following;
  }
  return { segments, points, origin, width, height, seed, preset };
}

/** Disperse every item along the visible hyphae, including on small screens. */
export function postPositions(growth, count) {
  if (!count) return [];
  const top = Math.min(165, growth.height * 0.25);
  const edge = Math.min(25, growth.width * 0.05, growth.height * 0.08);
  const candidates = growth.points.filter((point) => point.y > top && point.x > edge && point.x < growth.width - edge && point.y < growth.height - edge);
  if (!candidates.length) candidates.push({ ...growth.origin, at: 1 });
  const chosen = [];
  for (let index = 0; index < count; index++) {
    let best = candidates[0], bestDistance = -1;
    for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex += Math.max(1, Math.floor(candidates.length / 1500))) {
      const point = candidates[candidateIndex];
      const distance = chosen.length ? Math.min(...chosen.map((other) => Math.hypot(point.x - other.x, point.y - other.y))) : Math.hypot(point.x - growth.origin.x, point.y - growth.origin.y);
      if (distance > bestDistance) { bestDistance = distance; best = point; }
    }
    chosen.push(best);
  }
  return chosen;
}
