// Draws Keyboard Layout Editor JSON as an inline SVG.
// Handles what these layouts use: key size and position (x, y, w, h and the
// second rectangle of ISO Enter: x2, y2, w2, h2), colours (c, t), legend
// alignment (a) and font size (f, f2, fa). Rotation is ignored.

(function () {
  // KLE stores up to 12 legends per key in an order that depends on the
  // alignment flags; this table maps them back to grid slots 0-11
  // (0-8 top/middle/bottom × left/centre/right, 9-11 the front face).
  var LABEL_MAP = [
    [0, 6, 2, 8, 9, 11, 3, 5, 1, 4, 7, 10],
    [1, 7, -1, -1, 9, 11, 4, -1, -1, -1, -1, 10],
    [3, -1, 5, -1, 9, 11, -1, -1, 4, -1, -1, 10],
    [4, -1, -1, -1, 9, 11, -1, -1, -1, -1, -1, 10],
    [0, 6, 2, 8, 10, -1, 3, 5, 1, 4, 7, -1],
    [1, 7, -1, -1, 10, -1, 4, -1, -1, -1, -1, -1],
    [3, -1, 5, -1, 10, -1, -1, -1, 4, -1, -1, -1],
    [4, -1, -1, -1, 10, -1, -1, -1, -1, -1, -1, -1]
  ];
  var NS = "http://www.w3.org/2000/svg";
  var GAP = 0.05;   // space between caps, in key units
  var PAD = 0.12;   // legend inset from the cap edge

  function parse(data) {
    var keys = [], y = 0;
    var s = { c: "#cccccc", t: "#000000", a: 4, f: 3, f2: null, fa: null };
    data.forEach(function (row) {
      if (!Array.isArray(row)) return;   // metadata object
      var x = 0;
      var k = fresh();
      row.forEach(function (item) {
        if (typeof item === "string") {
          k.x += x; k.y += y;
          if (!k.w2) { k.w2 = k.w; k.h2 = k.h; }
          k.c = s.c; k.t = s.t; k.a = s.a; k.f = s.f; k.f2 = s.f2; k.fa = s.fa;
          k.labels = item.split("\n");
          keys.push(k);
          x = k.x + k.w;
          k = fresh();
          k.x = 0;
          return;
        }
        if (item.x != null) x += item.x;
        if (item.y != null) y += item.y;
        ["w", "h", "x2", "y2", "w2", "h2"].forEach(function (p) { if (item[p] != null) k[p] = item[p]; });
        if (item.c != null) s.c = item.c;
        if (item.t != null) s.t = item.t;
        if (item.a != null) s.a = item.a;
        if (item.f != null) { s.f = item.f; s.f2 = null; s.fa = null; }
        if (item.f2 != null) s.f2 = item.f2;
        if (item.fa != null) s.fa = item.fa;
      });
      y += 1;
    });
    return keys;
  }

  function fresh() { return { x: 0, y: 0, w: 1, h: 1, x2: 0, y2: 0, w2: 0, h2: 0 }; }

  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name);
    for (var a in attrs) e.setAttribute(a, attrs[a]);
    if (parent) parent.appendChild(e);
    return e;
  }

  function shade(hex, amt) {
    var n = parseInt(hex.replace("#", "").replace(/^(.)(.)(.)$/, "$1$1$2$2$3$3"), 16);
    var r = Math.max(0, Math.min(255, (n >> 16) + amt));
    var g = Math.max(0, Math.min(255, ((n >> 8) & 255) + amt));
    var b = Math.max(0, Math.min(255, (n & 255) + amt));
    return "rgb(" + r + "," + g + "," + b + ")";
  }

  function draw(container, keys) {
    var maxX = 0, maxY = 0;
    keys.forEach(function (k) {
      maxX = Math.max(maxX, k.x + k.w, k.x + k.x2 + k.w2);
      maxY = Math.max(maxY, k.y + k.h, k.y + k.y2 + k.h2);
    });
    var svg = el("svg", { viewBox: "0 0 " + maxX + " " + maxY, xmlns: NS });
    // Keep caps near real size so a handful of add-on keys isn't drawn huge.
    svg.style.maxWidth = (maxX * 48) + "px";

    keys.forEach(function (k) {
      var g = el("g", {}, svg);
      var rects = [[k.x, k.y, k.w, k.h]];
      if (k.w2 !== k.w || k.h2 !== k.h || k.x2 || k.y2) rects.push([k.x + k.x2, k.y + k.y2, k.w2, k.h2]);
      // Outer (side) colour first, then the lighter top, so a two-part key
      // like ISO Enter reads as one cap.
      rects.forEach(function (r) {
        el("rect", { x: r[0] + GAP, y: r[1] + GAP, width: r[2] - 2 * GAP, height: r[3] - 2 * GAP, rx: 0.08, fill: shade(k.c, -40) }, g);
      });
      rects.forEach(function (r) {
        el("rect", { x: r[0] + GAP + 0.07, y: r[1] + GAP + 0.04, width: r[2] - 2 * GAP - 0.14, height: r[3] - 2 * GAP - 0.18, rx: 0.06, fill: k.c }, g);
      });

      var map = LABEL_MAP[k.a] || LABEL_MAP[4];
      var colours = k.t.split("\n");
      k.labels.forEach(function (text, i) {
        if (!text || map[i] == null || map[i] < 0) return;
        var slot = map[i];
        var size = (k.fa && k.fa[i]) || (i > 0 && k.f2) || k.f;
        var fs = (6 + 2 * size) / 54;
        var front = slot >= 9;
        var col = front ? slot - 9 : slot % 3;
        var row = front ? 3 : Math.floor(slot / 3);
        var left = k.x + GAP + PAD, right = k.x + k.w - GAP - PAD;
        var tx = [left, (left + right) / 2, right][col];
        var anchor = ["start", "middle", "end"][col];
        var top = k.y + GAP + PAD, bottom = k.y + k.h - GAP - 0.26;
        var ty = [top + fs * 0.8, (top + bottom) / 2 + fs * 0.35, bottom, k.y + k.h - GAP - 0.04][row];
        if (front) fs *= 0.75;
        var t = el("text", {
          x: tx, y: ty, "font-size": fs, "text-anchor": anchor,
          fill: colours[i] || colours[0] || "#000"
        }, g);
        // Legends can carry KLE's HTML (<br>, entities); show them as text.
        var tmp = document.createElement("div");
        tmp.innerHTML = text.replace(/<br\s*\/?>/gi, " ");
        t.textContent = tmp.textContent;
      });
    });

    container.innerHTML = "";
    container.appendChild(svg);
  }

  function load(container) {
    fetch(container.dataset.src)
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (data) { draw(container, parse(data)); })
      .catch(function () { container.textContent = "Layout preview unavailable."; });
  }

  var nodes = document.querySelectorAll(".kle[data-src]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { io.unobserve(e.target); load(e.target); }
      });
    }, { rootMargin: "200px" });
    nodes.forEach(function (n) { io.observe(n); });
  } else {
    nodes.forEach(load);
  }
})();
