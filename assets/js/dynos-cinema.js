/* =========================================================
   Dynos AI — efeitos cinematográficos e tecnológicos
   Carregado em todas as páginas. Tudo é "extra": se este arquivo
   falhar, o site continua funcionando normalmente.
   ========================================================= */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var touch = window.matchMedia("(hover: none)").matches;
  var body = document.body;
  var isHome = body.hasAttribute("data-dy-home");

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html) e.innerHTML = html;
    return e;
  }

  /* ---------- Camadas de fundo ---------- */
  var canvas = el("canvas");
  canvas.id = "dy-neural";
  canvas.setAttribute("aria-hidden", "true");
  body.insertBefore(canvas, body.firstChild);
  body.appendChild(el("div", "dy-vignette"));
  body.appendChild(el("div", "dy-grain"));
  var progress = el("div", "dy-progress");
  body.appendChild(progress);
  var spot = el("div", "dy-spotlight");
  body.appendChild(spot);
  [canvas, progress, spot].forEach(function (n) { n.setAttribute("aria-hidden", "true"); });

  /* ---------- Rede neural animada ---------- */
  var ctx = canvas.getContext("2d");
  var W, H, dpr, nodes = [], mouse = { x: -1e4, y: -1e4 };
  var colors = ["212,175,55", "245,217,126", "110,58,255", "57,217,170"];

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = canvas.width = innerWidth * dpr;
    H = canvas.height = innerHeight * dpr;
    var n = Math.round(Math.min(95, (innerWidth * innerHeight) / 15000));
    nodes = [];
    for (var i = 0; i < n; i++) {
      nodes.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.22 * dpr, vy: (Math.random() - 0.5) * 0.22 * dpr,
        r: (Math.random() * 1.3 + 0.5) * dpr,
        c: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    var max = 130 * dpr;
    var fade = Math.max(0.45, 1 - scrollY / (innerHeight * 2));
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > W) a.vx *= -1;
      if (a.y < 0 || a.y > H) a.vy *= -1;
      var mx = a.x - mouse.x, my = a.y - mouse.y, md = Math.sqrt(mx * mx + my * my) || 1;
      if (md < 150 * dpr) { a.x += (mx / md) * 0.7; a.y += (my / md) * 0.7; }
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < max) {
          ctx.strokeStyle = "rgba(" + a.c + "," + ((1 - d / max) * 0.22 * fade) + ")";
          ctx.lineWidth = 0.7 * dpr;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(" + a.c + "," + (0.75 * fade) + ")";
      ctx.beginPath(); ctx.arc(a.x, a.y, a.r, 0, 6.283); ctx.fill();
    }
    if (!reduce && !document.hidden) requestAnimationFrame(draw);
  }
  resize();
  addEventListener("resize", function () { resize(); if (reduce) draw(); });
  document.addEventListener("visibilitychange", function () { if (!document.hidden && !reduce) requestAnimationFrame(draw); });
  draw();

  /* ---------- Mouse: luz ambiente + pontos fogem ---------- */
  if (!touch) {
    addEventListener("mousemove", function (e) {
      mouse.x = e.clientX * dpr; mouse.y = e.clientY * dpr;
      spot.style.opacity = 1;
      spot.style.left = e.clientX + "px"; spot.style.top = e.clientY + "px";
    }, { passive: true });
  }

  /* ---------- Cartões com inclinação 3D e brilho ---------- */
  if (!touch && !reduce) {
    document.querySelectorAll(".vertical-card, .dy-card, .dy-produto-card, .as-confere .cartao, .plano-card").forEach(function (card) {
      if (getComputedStyle(card).position === "static") card.style.position = "relative";
      card.appendChild(el("span", "dy-glow-layer"));
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--mx", px * 100 + "%");
        card.style.setProperty("--my", py * 100 + "%");
        card.classList.add("dy-tilting");
        card.style.transform = "perspective(1000px) rotateX(" + (0.5 - py) * 6 + "deg) rotateY(" + (px - 0.5) * 8 + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.classList.remove("dy-tilting");
        card.style.transform = "";
      });
    });
  }

  /* ---------- Aparecer ao rolar ---------- */
  var revealSel = [
    ".dy-secao-titulo", ".dy-secao h2", ".dy-card", ".dy-produto-card",
    ".dy-feature-row > *", ".dy-grid > *", "section table", "section blockquote"
  ].join(",");
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }) : null;

  if (io && !reduce) {
    document.querySelectorAll(revealSel).forEach(function (n) {
      // não mexe no que já tem animação própria nem no que está no topo da tela
      if (n.closest(".dy-hero") || n.closest(".dy-fade-up") || n.classList.contains("dy-fade-up")) return;
      if (n.closest(".dy-reveal")) return;
      if (n.getBoundingClientRect().top < innerHeight * 0.9) return;
      n.classList.add("dy-reveal");
      io.observe(n);
    });
  }

  /* ---------- Rótulos "// Seção" digitados como terminal ---------- */
  if (io && !reduce) {
    var typeIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        typeIO.unobserve(en.target);
        var n = en.target, full = n.getAttribute("data-dy-text"), k = 0;
        n.classList.add("dy-typed");
        (function step() {
          n.textContent = full.slice(0, ++k);
          if (k < full.length) setTimeout(step, 28);
          else setTimeout(function () { n.classList.remove("dy-typed"); }, 1200);
        })();
      });
    }, { threshold: 0.6 });
    document.querySelectorAll(".label").forEach(function (n) {
      if (n.children.length || !n.textContent.trim()) return;
      if (n.getBoundingClientRect().top < innerHeight) return;
      var r = n.getBoundingClientRect();
      n.style.minWidth = r.width + "px"; // evita "pulo" do layout
      if (getComputedStyle(n).display === "inline") n.style.display = "inline-block";
      n.setAttribute("data-dy-text", n.textContent);
      n.textContent = " ";
      typeIO.observe(n);
    });
  }

  /* ---------- Rolagem: barra de progresso + cabeçalho ---------- */
  var header = document.querySelector(".dy-header");
  var manifestoWords = [];
  function onScroll() {
    var max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = "scaleX(" + (max > 0 ? scrollY / max : 0) + ")";
    if (header) header.classList.toggle("dy-scrolled", scrollY > 30);
    if (manifestoWords.length) {
      var box = manifestoWords.box.getBoundingClientRect();
      var p = (innerHeight * 0.85 - box.top) / (box.height + innerHeight * 0.3);
      var lit = reduce ? manifestoWords.length : Math.floor(Math.min(1, Math.max(0, p)) * manifestoWords.length);
      for (var i = 0; i < manifestoWords.length; i++) manifestoWords[i].classList.toggle("on", i < lit);
    }
  }
  addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Quebra um texto em palavras (preservando links, negrito, degradê) ---------- */
  function splitWords(root, cls) {
    var out = [];
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    var texts = [];
    while (walker.nextNode()) texts.push(walker.currentNode);
    texts.forEach(function (t) {
      if (!t.nodeValue.trim()) return;
      var inGrad = t.parentNode.closest && t.parentNode.closest(".gradient-text");
      var frag = document.createDocumentFragment();
      t.nodeValue.split(/(\s+)/).forEach(function (part) {
        if (!part) return;
        if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
        var s = el("span", cls + (inGrad ? " gradient-text" : ""));
        s.textContent = part;
        // texto com degradê (background-clip: text) precisa repetir o fundo em cada palavra
        var cs = getComputedStyle(t.parentNode);
        if (!inGrad && (cs.webkitBackgroundClip === "text" || cs.backgroundClip === "text")) {
          s.style.backgroundImage = cs.backgroundImage; s.style.webkitBackgroundClip = "text"; s.style.backgroundClip = "text";
          s.style.webkitTextFillColor = "transparent"; s.style.color = "transparent";
        }
        frag.appendChild(s);
        out.push(s);
      });
      t.parentNode.replaceChild(frag, t);
    });
    return out;
  }

  /* ---------- Somente na página inicial ---------- */
  function startHero() {
    var h1 = document.querySelector(".dy-hero h1, .nl-hero h1, .lex-hero h1, .as-hero h1");
    if (!h1 || reduce) return;
    var words = splitWords(h1, "dy-word");
    words.forEach(function (w, i) { w.style.transitionDelay = (0.08 * i) + "s"; });
    requestAnimationFrame(function () { requestAnimationFrame(function () { h1.classList.add("dy-words-in"); }); });
  }

  if (isHome) {
    var hero = document.querySelector(".dy-hero");
    if (hero) {
      var clock = el("span");
      var tl = el("div", "dy-hud tl", "DYNOS.AI // ONLINE<br>");
      tl.appendChild(clock);
      hero.appendChild(tl);
      hero.appendChild(el("div", "dy-hud tr", "QUIXADÁ · CE<br>BRASIL"));
      hero.appendChild(el("div", "dy-hud bl", "VERTICAIS · 04"));
      hero.appendChild(el("div", "dy-hud br", "REC <i class=\"rec\"></i>"));
      hero.appendChild(el("div", "dy-hud-frame", "<i></i><i></i><i></i><i></i>"));
      hero.querySelectorAll(".dy-hud, .dy-hud-frame").forEach(function (n) { n.setAttribute("aria-hidden", "true"); });
      var tick = function () { clock.textContent = new Date().toLocaleTimeString("pt-BR"); };
      tick(); setInterval(tick, 1000);
    }

    var quote = document.querySelector(".manifesto blockquote");
    if (quote) {
      manifestoWords = splitWords(quote, "dy-lit");
      manifestoWords.box = quote;
    }

    var intro = document.getElementById("dy-intro");
    var seen = false;
    try { seen = sessionStorage.getItem("dy-intro") === "1"; } catch (e) {}
    if (intro && !reduce && !seen) {
      body.classList.add("dy-locked");
      var bar = intro.querySelector(".dy-intro-track span");
      var code = intro.querySelector(".dy-intro-code");
      var lines = ["INICIALIZANDO NÚCLEO", "CARREGANDO VERTICAIS", "CONECTANDO SISTEMAS", "PRONTO"];
      var p = 0;
      var timer = setInterval(function () {
        p = Math.min(100, p + Math.random() * 16 + 6);
        bar.style.width = p + "%";
        code.textContent = lines[Math.min(lines.length - 1, Math.floor(p / 26))];
        if (p >= 100) {
          clearInterval(timer);
          setTimeout(function () {
            intro.classList.add("done");
            body.classList.remove("dy-locked");
            try { sessionStorage.setItem("dy-intro", "1"); } catch (e) {}
            setTimeout(startHero, 350);
          }, 250);
        }
      }, 80);
    } else {
      if (intro) intro.parentNode.removeChild(intro);
      startHero();
    }
  }
  else if (body.hasAttribute("data-dy-words")) { startHero(); }

  onScroll();
})();

/* =========================================================
   VÍDEOS: economia de dados, "reduzir movimento" e sala de máquinas
   ========================================================= */
(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var conn = navigator.connection || {};
  var economia = conn.saveData === true;

  // vídeos de fundo: só tocam quando aparecem na tela
  var bgs = document.querySelectorAll(".dy-bgvideo video, .dy-card-video");
  bgs.forEach(function (v) {
    if (reduce || economia) { v.removeAttribute("autoplay"); v.pause(); v.preload = "none"; return; }
  });
  if ("IntersectionObserver" in window && !reduce && !economia) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = en.target;
        if (en.isIntersecting) { var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }
        else v.pause();
      });
    }, { threshold: 0.05 });
    bgs.forEach(function (v) { vio.observe(v); });
  }

  // sala de máquinas: abas que trocam o vídeo
  document.querySelectorAll(".dy-reel").forEach(function (reel) {
    var vids = reel.querySelectorAll(".dy-reel-screen video");
    var abas = reel.querySelectorAll(".dy-reel-aba");
    var canal = reel.querySelector(".dy-reel-canal");
    var dur = (+reel.getAttribute("data-dur") || 10) * 1000;
    var atual = 0, timer = null, visivel = false;
    reel.style.setProperty("--dur", dur / 1000 + "s");

    var mp4 = document.createElement("video").canPlayType('video/mp4; codecs="avc1.640028"');
    function carregar(v) {
      if (v.src || !v.dataset.src) return;
      v.src = mp4 ? v.dataset.src : v.dataset.src.replace(".mp4", ".webm");
    }
    function tocar(v) { if (reduce || economia) return; carregar(v); var pr = v.play(); if (pr && pr.catch) pr.catch(function () {}); }

    function mostrar(i, manual) {
      atual = i;
      vids.forEach(function (v, k) {
        v.classList.toggle("ativo", k === i);
        if (k === i) { if (visivel) tocar(v); } else v.pause();
      });
      abas.forEach(function (a, k) {
        a.classList.toggle("ativo", k === i);
        a.setAttribute("aria-selected", k === i ? "true" : "false");
        var b = a.querySelector(".barra");
        if (b && k === i) { b.style.animation = "none"; void b.offsetWidth; b.style.animation = ""; }
      });
      if (canal) canal.textContent = abas[i].getAttribute("data-canal");
      clearTimeout(timer);
      // depois de um clique a troca automática para, para a pessoa assistir com calma
      if (!manual && !reduce && visivel) timer = setTimeout(function () { mostrar((atual + 1) % vids.length); }, dur);
      if (manual) abas.forEach(function (a) { var b = a.querySelector(".barra"); if (b) b.style.animation = "none"; });
    }

    abas.forEach(function (a, k) {
      a.addEventListener("click", function (e) {
        if (e.target.closest("a")) return; // o link "Conhecer" funciona normalmente
        mostrar(k, true);
      });
      a.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { if (e.target.closest("a")) return; e.preventDefault(); mostrar(k, true); }
      });
    });

    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        visivel = entries[0].isIntersecting;
        if (visivel) mostrar(atual);
        else { clearTimeout(timer); vids.forEach(function (v) { v.pause(); }); }
      }, { threshold: 0.25 }).observe(reel);
    } else { visivel = true; mostrar(0); }
  });
})();
