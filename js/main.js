/* ==========================================================================
   هويّة — Landing page interactions & GSAP animations
   ========================================================================== */
(function () {
  "use strict";

  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const hasGSAP = typeof window.gsap !== "undefined";
  if (hasGSAP && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  // Mark body so [data-anim] elements start hidden (only when GSAP will run)
  if (hasGSAP && !prefersReduced) {
    document.body.classList.add("reveal-ready");
  }

  /* ----------------------------------------------------------------------
     Header scroll state
  ---------------------------------------------------------------------- */
  const header = document.getElementById("site-header");
  const onScroll = () => {
    if (window.scrollY > 24) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ----------------------------------------------------------------------
     Mobile menu
  ---------------------------------------------------------------------- */
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("open");
    });
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => mobileMenu.classList.remove("open"))
    );
  }

  /* ----------------------------------------------------------------------
     Smooth anchor scrolling with header offset
  ---------------------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top =
        target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
    });
  });

  /* ----------------------------------------------------------------------
     Number counting animation
  ---------------------------------------------------------------------- */
  function formatNumber(value, plain) {
    if (plain) return Math.round(value).toString();
    return Math.round(value).toLocaleString("en-US");
  }

  function animateCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = "1";
    const target = parseFloat(el.dataset.target || "0");
    const plain = el.hasAttribute("data-plain");

    if (prefersReduced || !hasGSAP) {
      el.textContent = formatNumber(target, plain);
      return;
    }

    const obj = { v: 0 };
    gsap.to(obj, {
      v: target,
      duration: 2,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = formatNumber(obj.v, plain);
      },
    });
  }

  const counters = document.querySelectorAll("[data-counter]");
  if (hasGSAP && window.ScrollTrigger && !prefersReduced) {
    counters.forEach((el) => {
      ScrollTrigger.create({
        trigger: el,
        start: "top 88%",
        once: true,
        onEnter: () => animateCounter(el),
      });
    });
  } else {
    counters.forEach(animateCounter);
  }

  /* ----------------------------------------------------------------------
     Hero health-score ring fill
  ---------------------------------------------------------------------- */
  const ring = document.getElementById("hero-ring");
  if (ring) {
    const fill = () => {
      ring.style.strokeDashoffset = ring.dataset.offset || "38";
    };
    if (hasGSAP && window.ScrollTrigger && !prefersReduced) {
      ScrollTrigger.create({
        trigger: ring,
        start: "top 90%",
        once: true,
        onEnter: () => setTimeout(fill, 250),
      });
    } else {
      fill();
    }
  }

  /* ----------------------------------------------------------------------
     Scroll reveal animations (fade-up / zoom / stagger)
  ---------------------------------------------------------------------- */
  // Containers whose children animate as a staggered group (handled below);
  // exclude them from the per-element passes to avoid double animation.
  const staggerSelector = "#faq-list, #stats .grid, #pricing .grid";

  if (hasGSAP && window.ScrollTrigger && !prefersReduced) {
    // Per-element fade-up, excluding items inside stagger groups
    const fadeEls = gsap.utils
      .toArray('[data-anim="fade-up"]')
      .filter((el) => !el.closest(staggerSelector));
    fadeEls.forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 42 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.9,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
        }
      );
    });

    const zoomEls = gsap.utils.toArray('[data-anim="zoom"]');
    zoomEls.forEach((el) => {
      gsap.fromTo(
        el,
        { autoAlpha: 0, scale: 0.94, y: 30 },
        {
          autoAlpha: 1,
          scale: 1,
          y: 0,
          duration: 1.1,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        }
      );
    });

    // Directional slide-in for the feature showcase blocks
    const slideEls = gsap.utils.toArray('[data-anim="slide"]');
    slideEls.forEach((el) => {
      const fromRight = el.dataset.from === "right";
      gsap.fromTo(
        el,
        { autoAlpha: 0, x: fromRight ? 90 : -90 },
        {
          autoAlpha: 1,
          x: 0,
          duration: 1.05,
          ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 84%", once: true },
        }
      );
    });

    // Crawl progress bar grow-in
    document.querySelectorAll(".crawl-bar").forEach((bar) => {
      const target = bar.style.width || "76%";
      gsap.fromTo(
        bar,
        { width: "0%" },
        {
          width: target,
          duration: 1.4,
          ease: "power2.out",
          scrollTrigger: { trigger: bar, start: "top 90%", once: true },
        }
      );
    });

    // Trend line draw-in
    document.querySelectorAll(".trend-line").forEach((path) => {
      const len = path.getTotalLength();
      gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
      gsap.to(path, {
        strokeDashoffset: 0,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: path, start: "top 88%", once: true },
      });
    });

    // Stagger the bento / pricing / faq cards within their grids
    document
      .querySelectorAll(staggerSelector)
      .forEach((grid) => {
        const items = grid.querySelectorAll('[data-anim]');
        gsap.fromTo(
          items,
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: grid, start: "top 82%", once: true },
            overwrite: "auto",
          }
        );
      });

    /* --------------------------------------------------------------------
       Floating UI cards (continuous, subtle)
    -------------------------------------------------------------------- */
    document.querySelectorAll("[data-float]").forEach((el, i) => {
      gsap.to(el, {
        y: i % 2 === 0 ? -14 : 14,
        duration: 3 + i * 0.4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
    });

    /* --------------------------------------------------------------------
       Showcase bar chart grow-in
    -------------------------------------------------------------------- */
    const bars = document.querySelectorAll("#showcase-bars > div");
    if (bars.length) {
      gsap.from(bars, {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: {
          trigger: "#showcase-bars",
          start: "top 85%",
          once: true,
        },
      });
    }
  }

  /* ----------------------------------------------------------------------
     Pricing: Monthly / Annual toggle
  ---------------------------------------------------------------------- */
  const toggle = document.getElementById("billing-toggle");
  const lblMonthly = document.getElementById("lbl-monthly");
  const lblAnnual = document.getElementById("lbl-annual");
  if (toggle) {
    const setBilling = (annual) => {
      toggle.classList.toggle("on", annual);
      toggle.setAttribute("aria-checked", annual ? "true" : "false");
      lblMonthly.classList.toggle("text-ink", !annual);
      lblMonthly.classList.toggle("text-[#9aa49a]", annual);
      lblAnnual.classList.toggle("text-ink", annual);
      lblAnnual.classList.toggle("text-[#9aa49a]", !annual);

      document.querySelectorAll(".price").forEach((p) => {
        const val = annual ? p.dataset.annual : p.dataset.monthly;
        if (hasGSAP && !prefersReduced) {
          const obj = { v: parseFloat(p.textContent.replace(/,/g, "")) || 0 };
          gsap.to(obj, {
            v: parseFloat(val),
            duration: 0.5,
            ease: "power2.out",
            onUpdate: () => (p.textContent = Math.round(obj.v).toString()),
          });
        } else {
          p.textContent = val;
        }
      });
      document
        .querySelectorAll(".period")
        .forEach((s) => (s.textContent = annual ? "سنوياً" : "شهرياً"));
    };
    toggle.addEventListener("click", () =>
      setBilling(!toggle.classList.contains("on"))
    );
  }

  /* ----------------------------------------------------------------------
     FAQ accordion
  ---------------------------------------------------------------------- */
  document.querySelectorAll(".faq-item").forEach((item) => {
    const head = item.querySelector(".faq-head");
    const body = item.querySelector(".faq-body");
    head.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");
      // close all
      document.querySelectorAll(".faq-item").forEach((other) => {
        other.classList.remove("open");
        other.querySelector(".faq-body").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        body.style.maxHeight = body.scrollHeight + "px";
      }
    });
  });

  /* ----------------------------------------------------------------------
     Testimonials slider
  ---------------------------------------------------------------------- */
  const slides = Array.from(document.querySelectorAll(".t-slide"));
  const dotsWrap = document.getElementById("t-dots");
  if (slides.length) {
    let idx = 0;
    let timer = null;

    // build dots
    slides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "w-2.5 h-2.5 rounded-full transition-all";
      dot.setAttribute("aria-label", "شريحة " + (i + 1));
      dot.addEventListener("click", () => go(i, true));
      dotsWrap.appendChild(dot);
    });
    const dots = Array.from(dotsWrap.children);

    function render() {
      slides.forEach((s, i) => s.classList.toggle("active", i === idx));
      dots.forEach((d, i) => {
        d.style.backgroundColor = i === idx ? "#a0cd39" : "#d8ddd1";
        d.style.width = i === idx ? "22px" : "10px";
      });
      if (hasGSAP && !prefersReduced) {
        gsap.fromTo(
          slides[idx],
          { autoAlpha: 0, y: 18 },
          { autoAlpha: 1, y: 0, duration: 0.6, ease: "power3.out" }
        );
      }
    }
    function go(i, manual) {
      idx = (i + slides.length) % slides.length;
      render();
      if (manual) restart();
    }
    function restart() {
      if (timer) clearInterval(timer);
      if (!prefersReduced) timer = setInterval(() => go(idx + 1), 6000);
    }

    document
      .getElementById("t-next")
      .addEventListener("click", () => go(idx + 1, true));
    document
      .getElementById("t-prev")
      .addEventListener("click", () => go(idx - 1, true));

    render();
    restart();
  }

  /* ----------------------------------------------------------------------
     Trusted-by logo marquee
  ---------------------------------------------------------------------- */
  (function buildMarquees() {
    const tracks = document.querySelectorAll("[data-marquee]");
    if (!tracks.length) return;

    const stroke =
      'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
    const LOGOS = [
      {
        name: "WordPress",
        svg:
          '<svg viewBox="0 0 32 32" ' + stroke + '><circle cx="16" cy="16" r="13"/><path d="M8 11 L10.5 22 L14 14 L17.5 22 L20 11"/></svg>',
      },
      {
        name: "Shopify",
        svg:
          '<svg viewBox="0 0 32 32" ' + stroke + '><path d="M9 11h14l-1.3 14a2 2 0 0 1-2 1.8H12.3a2 2 0 0 1-2-1.8z"/><path d="M12.5 11V9.5a3.5 3.5 0 0 1 7 0V11"/></svg>',
      },
      {
        name: "سلة",
        svg:
          '<svg viewBox="0 0 32 32" ' + stroke + '><path d="M7 13h18l-2 11.5a2 2 0 0 1-2 1.7H11a2 2 0 0 1-2-1.7z"/><path d="M11 13l3-6M21 13l-3-6"/><path d="M13.5 17.5v5M18.5 17.5v5"/></svg>',
      },
      {
        name: "زد",
        svg:
          '<svg viewBox="0 0 32 32" ' + stroke + '><path d="M6 13l1.8-5h16.4L26 13"/><path d="M7.5 13v11.5h17V13"/><path d="M13 24.5V18h6v6.5"/><path d="M6 13a3 3 0 0 0 6 0 3 3 0 0 0 6 0 3 3 0 0 0 6 0"/></svg>',
      },
    ];

    const appendSet = (parent) => {
      LOGOS.forEach((l) => {
        const item = document.createElement("div");
        item.className = "logo-item";
        item.innerHTML = l.svg + "<span>" + l.name + "</span>";
        parent.appendChild(item);
      });
    };

    const fill = (track) => {
      track.innerHTML = "";
      const group = document.createElement("div");
      group.className = "marquee-group";
      track.appendChild(group);
      // Repeat the logo set until the group is at least as wide as the screen
      let guard = 0;
      do {
        appendSet(group);
        guard++;
      } while (group.offsetWidth < window.innerWidth && guard < 30);
      // Clone for a seamless -50% loop
      const clone = group.cloneNode(true);
      clone.setAttribute("aria-hidden", "true");
      track.appendChild(clone);
    };

    tracks.forEach(fill);

    let mr;
    window.addEventListener("resize", () => {
      clearTimeout(mr);
      mr = setTimeout(() => tracks.forEach(fill), 300);
    });
  })();

  /* ----------------------------------------------------------------------
     Feature showcase — flowing connector (curved path + nodes + orb)
  ---------------------------------------------------------------------- */
  if (hasGSAP && window.ScrollTrigger) {
    const svg = document.getElementById("flow-svg");
    const wrap = document.getElementById("showcase-flow");
    const base = document.getElementById("flow-base");
    const prog = document.getElementById("flow-progress");
    const nodesG = document.getElementById("flow-nodes");
    const orb = document.getElementById("flow-orb");
    const SVGNS = "http://www.w3.org/2000/svg";

    if (svg && wrap && base && prog && nodesG && orb) {
      const state = { len: 0, nodes: [], active: false };

      const build = () => {
        if (window.innerWidth < 1024) {
          state.active = false;
          return;
        }
        const blocks = wrap.querySelectorAll(".feature-block");
        if (blocks.length < 2) return;

        const W = wrap.clientWidth;
        const H = wrap.clientHeight;
        const wrapTop = wrap.getBoundingClientRect().top;

        // Anchor points: synthetic start, one per block (bulging toward its
        // visual side), synthetic end — produces a gentle weaving S-curve.
        const pts = [{ x: W * 0.5, y: 0 }];
        blocks.forEach((b, i) => {
          const r = b.getBoundingClientRect();
          const cy = r.top - wrapTop + r.height / 2;
          const imageLeft = i % 2 === 0; // blocks 1 & 3 → image on the left
          pts.push({ x: imageLeft ? W * 0.3 : W * 0.7, y: cy });
        });
        pts.push({ x: W * 0.5, y: H });

        let d = "M " + pts[0].x.toFixed(1) + " " + pts[0].y.toFixed(1);
        for (let i = 0; i < pts.length - 1; i++) {
          const p = pts[i];
          const n = pts[i + 1];
          const my = ((p.y + n.y) / 2).toFixed(1);
          d +=
            " C " + p.x.toFixed(1) + " " + my + ", " +
            n.x.toFixed(1) + " " + my + ", " +
            n.x.toFixed(1) + " " + n.y.toFixed(1);
        }

        svg.setAttribute("viewBox", "0 0 " + W + " " + H);
        base.setAttribute("d", d);
        prog.setAttribute("d", d);

        // Build network nodes at each block anchor
        nodesG.innerHTML = "";
        state.nodes = [];
        for (let i = 1; i < pts.length - 1; i++) {
          const ring = document.createElementNS(SVGNS, "circle");
          ring.setAttribute("class", "flow-node-ring");
          ring.setAttribute("cx", pts[i].x);
          ring.setAttribute("cy", pts[i].y);
          ring.setAttribute("r", 9);
          const dot = document.createElementNS(SVGNS, "circle");
          dot.setAttribute("class", "flow-node");
          dot.setAttribute("cx", pts[i].x);
          dot.setAttribute("cy", pts[i].y);
          dot.setAttribute("r", 4.5);
          nodesG.appendChild(ring);
          nodesG.appendChild(dot);
          state.nodes.push({ dot: dot, ring: ring, y: pts[i].y });
        }

        state.len = prog.getTotalLength();
        prog.style.strokeDasharray = state.len;

        if (prefersReduced) {
          // Static: show the full trail, no orb
          prog.style.strokeDashoffset = 0;
          state.nodes.forEach((n) => {
            n.dot.classList.add("on");
            n.ring.classList.add("on");
          });
          orb.style.opacity = 0;
          state.active = false;
        } else {
          prog.style.strokeDashoffset = state.len;
          state.active = true;
        }
      };

      const update = (p) => {
        if (!state.active || !state.len) return;
        prog.style.strokeDashoffset = state.len * (1 - p);
        const pt = prog.getPointAtLength(state.len * p);
        orb.setAttribute("transform", "translate(" + pt.x + " " + pt.y + ")");
        orb.style.opacity = p > 0.001 && p < 0.999 ? 1 : 0;
        state.nodes.forEach((n) => {
          const on = pt.y >= n.y - 2;
          n.dot.classList.toggle("on", on);
          n.ring.classList.toggle("on", on);
        });
      };

      build();

      ScrollTrigger.create({
        trigger: wrap,
        start: "top 75%",
        end: "bottom 75%",
        scrub: 0.6,
        onUpdate: (self) => update(self.progress),
        onRefresh: build,
      });

      let rt;
      window.addEventListener("resize", () => {
        clearTimeout(rt);
        rt = setTimeout(() => {
          build();
          ScrollTrigger.refresh();
        }, 200);
      });
    }
  }

  /* ----------------------------------------------------------------------
     Refresh ScrollTrigger after fonts/images settle
  ---------------------------------------------------------------------- */
  if (hasGSAP && window.ScrollTrigger) {
    window.addEventListener("load", () => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  }
})();
