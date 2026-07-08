/* KinStay site interactions: header, mobile nav, gallery + lightbox */
(function () {
  "use strict";

  /* ---- Gallery data (matches files in images/gallery/) ---- */
  var PHOTOS = [
    { slug: "exterior",      cap: "The house, tucked into the Massanutten woods" },
    { slug: "great-room",    cap: "Bright, vaulted great room" },
    { slug: "living-fire",   cap: "Cozy up by the gas fireplace" },
    { slug: "kitchen",       cap: "Open kitchen & dining" },
    { slug: "dining",        cap: "Live-edge dining table for the whole crew" },
    { slug: "kitchen-2",     cap: "Butcher-block counters & stainless appliances" },
    { slug: "open-plan",     cap: "Open-concept living, dining & kitchen" },
    { slug: "bedroom-king",  cap: "King primary bedroom" },
    { slug: "bedroom-queen", cap: "Queen bedroom with mountain-green accents" },
    { slug: "bedroom-3",     cap: "Comfortable guest bedroom" },
    { slug: "bathroom",      cap: "Updated full bathroom" },
    { slug: "game-shuffle",  cap: "Game room with shuffleboard" },
    { slug: "game-arcade",   cap: "Retro arcade & game table" },
    { slug: "playroom",      cap: "Kids' playroom stocked with toys" },
    { slug: "deck-porch",    cap: "Covered deck overlooking the forest" },
    { slug: "deck-grill",    cap: "Wraparound deck with a gas grill" },
    { slug: "lower-living",  cap: "Second living area on the lower level" }
  ];

  /* ---- Sticky header ---- */
  var header = document.getElementById("siteHeader");
  function onScroll() {
    if (window.scrollY > 40) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---- Mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("navMenu");
  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---- Build gallery grid ---- */
  var grid = document.getElementById("galleryGrid");
  if (grid) {
    PHOTOS.forEach(function (p, i) {
      var btn = document.createElement("button");
      btn.className = "gallery-item" + (p.size ? " " + p.size : "");
      btn.type = "button";
      btn.setAttribute("aria-label", "View photo: " + p.cap);
      btn.dataset.index = i;
      btn.innerHTML =
        '<img src="images/gallery/' + p.slug + '-thumb.jpg" alt="' + p.cap + '" loading="lazy" />' +
        '<figcaption>' + p.cap + '</figcaption>';
      grid.appendChild(btn);
    });
  }

  /* ---- Lightbox ---- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var current = 0;

  function show(i) {
    current = (i + PHOTOS.length) % PHOTOS.length;
    var p = PHOTOS[current];
    lbImg.src = "images/gallery/" + p.slug + ".jpg";
    lbImg.alt = p.cap;
    lbCap.textContent = p.cap;
  }
  function open(i) {
    show(i);
    lb.classList.add("open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function close() {
    lb.classList.remove("open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    lbImg.src = "";
  }

  if (grid) {
    grid.addEventListener("click", function (e) {
      var item = e.target.closest(".gallery-item");
      if (item) open(parseInt(item.dataset.index, 10));
    });
  }
  if (lb) {
    lb.querySelector(".lb-close").addEventListener("click", close);
    lb.querySelector(".lb-next").addEventListener("click", function () { show(current + 1); });
    lb.querySelector(".lb-prev").addEventListener("click", function () { show(current - 1); });
    lb.addEventListener("click", function (e) { if (e.target === lb) close(); });
    document.addEventListener("keydown", function (e) {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") show(current + 1);
      else if (e.key === "ArrowLeft") show(current - 1);
    });
  }

  /* ---- Direct-booking inquiry form (Web3Forms) ---- */
  var form = document.getElementById("inquiryForm");
  var status = document.getElementById("formStatus");

  // Sensible date constraints: no past dates; check-out after check-in.
  var checkIn = document.getElementById("checkIn");
  var checkOut = document.getElementById("checkOut");
  if (checkIn && checkOut) {
    var today = new Date().toISOString().split("T")[0];
    checkIn.min = today;
    checkOut.min = today;
    checkIn.addEventListener("change", function () {
      checkOut.min = checkIn.value || today;
      if (checkOut.value && checkOut.value < checkIn.value) checkOut.value = checkIn.value;
    });
  }

  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Native validation for required fields
      if (!form.checkValidity()) { form.reportValidity(); return; }

      // Require the captcha to be completed
      var captcha = form.querySelector('textarea[name="h-captcha-response"]');
      if (!captcha || !captcha.value) {
        status.className = "form-status error";
        status.textContent = "Please complete the “I'm human” check above.";
        return;
      }

      var btn = form.querySelector(".form-submit");
      var label = btn ? btn.textContent : "";
      if (btn) { btn.disabled = true; btn.textContent = "Sending…"; }
      status.className = "form-status";
      status.textContent = "";

      var data = {};
      form.querySelectorAll("input, textarea").forEach(function (el) {
        if (el.name && el.name !== "g-recaptcha-response") {
          if (el.type === "checkbox") {
            if (el.checked) data[el.name] = el.value || "on";
          } else if (el.type === "radio") {
            if (el.checked) data[el.name] = el.value;
          } else {
            data[el.name] = el.value;
          }
        }
      });
      data["h-captcha-response"] = captcha.value;
      fetch("https://kinstay-form.kinstay.workers.dev/", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (res.success) {
            form.innerHTML =
              '<div class="form-success">' +
              '<div class="form-success-ico">✓</div>' +
              "<h3>Request sent — thank you!</h3>" +
              "<p>We've got your dates and we'll be in touch by your preferred method, usually within 24 hours.</p>" +
              "</div>";
          } else {
            status.className = "form-status error";
            status.textContent = res.message || "Something went wrong. Please try again, or reach us through the Airbnb/VRBO listings.";
            if (btn) { btn.disabled = false; btn.textContent = label; }
            if (window.hcaptcha) { try { window.hcaptcha.reset(); } catch (err) {} }
          }
        })
        .catch(function () {
          status.className = "form-status error";
          status.textContent = "Network error — please try again, or message us through the Airbnb/VRBO listings.";
          if (btn) { btn.disabled = false; btn.textContent = label; }
          if (window.hcaptcha) { try { window.hcaptcha.reset(); } catch (err) {} }
        });
    });
  }

  /* ---- Footer year ---- */
  var yr = document.getElementById("year");
  if (yr) yr.textContent = new Date().getFullYear();
})();
