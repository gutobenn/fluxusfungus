import { test } from "node:test";
import assert from "node:assert/strict";
import { growMycelium, postPositions, MYCELIUM_STUDIES } from "../../src/scripts/mycelium-growth.js";

test("all five variants reproduce identical growth for the same seed", () => {
  const fingerprints = new Set();
  for (const preset of Object.keys(MYCELIUM_STUDIES)) {
    const options = {width:900,height:650,seed:"deterministic-study",preset};
    const first = growMycelium(options);
    assert.deepEqual(first, growMycelium(options));
    assert.ok(first.segments.length > 2000 && first.segments.length <= 120000);
    fingerprints.add(JSON.stringify(first.segments.slice(0,20)));
  }
  assert.equal(fingerprints.size,5);
});

test("every item gets a distinct visible position in desktop, portrait and landscape", () => {
  for (const [width,height] of [[1440,900],[390,844],[844,390],[400,180]]) {
    const growth = growMycelium({width,height,seed:"small-screen"});
    const positions = postPositions(growth,10);
    assert.equal(new Set(positions.map((point)=>`${point.x},${point.y}`)).size,10);
    positions.forEach((point)=>{
      assert.ok(point.x >= 0 && point.x < width);
      assert.ok(point.y >= 0 && point.y < height);
      assert.ok(point.at <= growth.segments.length);
    });
  }
});

test("geometry stays finite, tapered and inside the canvas", () => {
  const growth = growMycelium({width:1280,height:800,seed:"bounds"});
  for (const line of growth.segments) {
    Object.values(line).forEach((value)=>assert.ok(Number.isFinite(value)));
    assert.ok(line.width > 0 && line.alpha > 0 && line.alpha <= 1);
    assert.ok(line.nx >= 0 && line.nx < 1280 && line.ny >= 0 && line.ny < 800);
  }
  assert.ok(Math.min(...growth.segments.map((line)=>line.width)) < 0.3);
  assert.deepEqual(postPositions(growth,0),[]);
});
