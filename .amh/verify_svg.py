from __future__ import annotations

import json
from pathlib import Path

from playwright.sync_api import sync_playwright


PROJECT = Path(__file__).resolve().parent.parent
SVG = PROJECT / "assets" / "webex-mcp-business-outcomes.svg"
OUT = PROJECT / ".amh"


LAYOUT_CHECK = """
() => {
  const svg = document.querySelector('svg');
  const svgRect = svg.getBoundingClientRect();
  const ids = [...document.querySelectorAll('[id]')].map((node) => node.id);
  const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
  const textOutside = [...document.querySelectorAll('text')]
    .map((node) => {
      const rect = node.getBoundingClientRect();
      return {
        text: node.textContent.trim(),
        left: rect.left - svgRect.left,
        top: rect.top - svgRect.top,
        right: rect.right - svgRect.left,
        bottom: rect.bottom - svgRect.top,
      };
    })
    .filter((box) => box.left < -0.5 || box.top < -0.5 || box.right > svgRect.width + 0.5 || box.bottom > svgRect.height + 0.5);

  const groups = [...document.querySelectorAll('.outcome')].map((node) => {
    const rect = node.getBoundingClientRect();
    return {
      id: node.id,
      left: rect.left,
      top: rect.top,
      right: rect.right,
      bottom: rect.bottom,
    };
  });
  const overlaps = [];
  for (let i = 0; i < groups.length; i += 1) {
    for (let j = i + 1; j < groups.length; j += 1) {
      const a = groups[i];
      const b = groups[j];
      const width = Math.min(a.right, b.right) - Math.max(a.left, b.left);
      const height = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (width > 0.5 && height > 0.5) overlaps.push({a: a.id, b: b.id, width, height});
    }
  }

  const externalReferences = [...document.querySelectorAll('[href]')]
    .map((node) => node.getAttribute('href'))
    .filter((href) => href && /^(https?:)?\\/\\//.test(href));

  return {
    viewBox: svg.getAttribute('viewBox'),
    title: document.querySelector('title')?.textContent.trim() || null,
    description: document.querySelector('desc')?.textContent.trim() || null,
    duplicateIds,
    textOutside,
    outcomeOverlaps: overlaps,
    scriptCount: document.querySelectorAll('script').length,
    externalReferences,
    outcomeCount: groups.length,
  };
}
"""


ANIMATION_CHECK = """
() => Object.fromEntries(
  ['.agent-card', '.hub-core', '.hub-ring', '.inbound-flow', '.connector-flow', '.outcome', '.outcome .check']
    .map((selector) => {
      const node = document.querySelector(selector);
      const style = getComputedStyle(node);
      return [selector, {name: style.animationName, duration: style.animationDuration}];
    })
)
"""


with sync_playwright() as playwright:
    browser = playwright.chromium.launch(headless=True)

    normal = browser.new_context(viewport={"width": 1600, "height": 900})
    page = normal.new_page()
    page.goto(SVG.as_uri())
    page.wait_for_timeout(500)
    page.screenshot(path=str(OUT / "webex-mcp-animation-00-5s.png"))
    page.wait_for_timeout(2500)
    page.screenshot(path=str(OUT / "webex-mcp-animation-03s.png"))
    page.wait_for_timeout(2200)
    page.screenshot(path=str(OUT / "webex-mcp-animation-05-2s.png"))
    page.wait_for_timeout(2800)
    page.screenshot(path=str(OUT / "webex-mcp-animation-08s.png"))
    normal_animations = page.evaluate(ANIMATION_CHECK)
    normal.close()

    reduced = browser.new_context(
        viewport={"width": 1600, "height": 900},
        reduced_motion="reduce",
    )
    page = reduced.new_page()
    page.goto(SVG.as_uri())
    page.wait_for_timeout(250)
    reduced_layout = page.evaluate(LAYOUT_CHECK)
    reduced_animations = page.evaluate(ANIMATION_CHECK)
    page.screenshot(path=str(OUT / "webex-mcp-reduced-motion.png"))
    reduced.close()
    browser.close()

result = {
    "svg": str(SVG.relative_to(PROJECT)),
    "normalAnimations": normal_animations,
    "reducedMotionAnimations": reduced_animations,
    "layout": reduced_layout,
}
print(json.dumps(result, indent=2))
