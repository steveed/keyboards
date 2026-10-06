// Opens photo links (a[data-gallery]) in a modal instead of navigating away.
// Links sharing a data-gallery value page through together. Without
// JavaScript the links still work as plain links to the full-size image.

(function () {
  var dialog = document.createElement("dialog");
  dialog.className = "lightbox";
  dialog.innerHTML =
    '<button class="lb-close" aria-label="Close">&times;</button>' +
    '<button class="lb-prev" aria-label="Previous photo">&#8249;</button>' +
    '<img alt="">' +
    '<button class="lb-next" aria-label="Next photo">&#8250;</button>' +
    '<p class="lb-count"></p>';
  document.body.appendChild(dialog);

  var img = dialog.querySelector("img");
  var count = dialog.querySelector(".lb-count");
  var prev = dialog.querySelector(".lb-prev");
  var next = dialog.querySelector(".lb-next");
  var items = [], index = 0;

  function show(i) {
    index = (i + items.length) % items.length;
    var a = items[index];
    img.src = a.href;
    img.alt = a.dataset.caption || "";
    count.textContent = items.length > 1 ? (index + 1) + " / " + items.length : "";
    prev.hidden = next.hidden = items.length < 2;
    // Warm the cache for the neighbours so paging feels instant.
    [index - 1, index + 1].forEach(function (j) {
      new Image().src = items[(j + items.length) % items.length].href;
    });
  }

  function open(link) {
    items = Array.prototype.filter.call(
      document.querySelectorAll("a[data-gallery]"),
      function (a) { return a.dataset.gallery === link.dataset.gallery; });
    show(items.indexOf(link));
    dialog.showModal();
    // A history entry lets the phone's back button close the photo
    // rather than leave the page.
    history.pushState({ lightbox: true }, "");
  }

  function close() {
    if (history.state && history.state.lightbox) history.back();
    else dialog.close();
  }

  window.addEventListener("popstate", function () {
    if (dialog.open) dialog.close();
  });
  // Esc closes the dialog natively; keep history in step.
  dialog.addEventListener("cancel", function (e) { e.preventDefault(); close(); });

  document.addEventListener("click", function (e) {
    var link = e.target.closest("a[data-gallery]");
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    open(link);
  });

  dialog.querySelector(".lb-close").addEventListener("click", close);
  prev.addEventListener("click", function () { show(index - 1); });
  next.addEventListener("click", function () { show(index + 1); });
  // A click on the backdrop (the dialog itself, not its contents) closes it.
  dialog.addEventListener("click", function (e) { if (e.target === dialog) close(); });

  dialog.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") show(index - 1);
    if (e.key === "ArrowRight") show(index + 1);
  });

  var startX = null;
  dialog.addEventListener("pointerdown", function (e) { startX = e.clientX; });
  dialog.addEventListener("pointerup", function (e) {
    if (startX === null || items.length < 2) return;
    var dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1));
  });
})();
