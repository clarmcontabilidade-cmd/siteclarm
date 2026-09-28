/* Clarm Contabilidade — comportamento do site
   Tudo aqui é "extra": sem JavaScript o site continua funcionando. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");

  var WHATSAPP = "5588996523773";

  document.addEventListener("DOMContentLoaded", function () {
    // Ano atual no rodapé
    var ano = document.querySelector("[data-ano]");
    if (ano) ano.textContent = new Date().getFullYear();

    // Foto da profissional: se não carregar, mostra a logo no lugar
    var foto = document.querySelector(".retrato-moldura .foto");
    if (foto) {
      var remover = function () { foto.remove(); };
      if (foto.complete && foto.naturalWidth === 0) remover();
      else foto.addEventListener("error", remover);
    }

    // Sombra no cabeçalho ao rolar
    var topo = document.getElementById("topo");
    var aoRolar = function () { if (topo) topo.classList.toggle("rolou", window.scrollY > 8); };
    window.addEventListener("scroll", aoRolar, { passive: true });
    aoRolar();

    // Menu do celular
    var botao = document.querySelector(".menu-botao");
    var menu = document.getElementById("menu");
    if (botao && menu) {
      var usar = botao.querySelector("use");
      var definir = function (aberto) {
        menu.classList.toggle("aberto", aberto);
        botao.setAttribute("aria-expanded", aberto ? "true" : "false");
        botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
        if (usar) usar.setAttribute("href", aberto ? "#i-fechar" : "#i-menu");
      };
      botao.addEventListener("click", function () { definir(!menu.classList.contains("aberto")); });
      menu.addEventListener("click", function (e) { if (e.target.closest("a")) definir(false); });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && menu.classList.contains("aberto")) { definir(false); botao.focus(); }
      });
    }

    // Destaca no menu a seção que está na tela
    var links = Array.prototype.slice.call(document.querySelectorAll('.menu a[href^="#"]:not(.btn)'));
    if ("IntersectionObserver" in window && links.length) {
      var porId = {};
      links.forEach(function (a) { porId[a.getAttribute("href").slice(1)] = a; });
      var obsMenu = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting && porId[en.target.id]) {
            links.forEach(function (a) { a.classList.remove("ativo"); });
            porId[en.target.id].classList.add("ativo");
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      Object.keys(porId).forEach(function (id) { var s = document.getElementById(id); if (s) obsMenu.observe(s); });
    }

    // Animação suave de entrada dos blocos
    var blocos = document.querySelectorAll(".revelar");
    if ("IntersectionObserver" in window) {
      var obs = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (en) {
          if (en.isIntersecting) { en.target.classList.add("visivel"); obs.unobserve(en.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px" });
      blocos.forEach(function (b) { obs.observe(b); });
    } else {
      blocos.forEach(function (b) { b.classList.add("visivel"); });
    }

    // Perguntas frequentes: abre uma por vez
    var perguntas = document.querySelectorAll(".faq details");
    perguntas.forEach(function (d) {
      d.addEventListener("toggle", function () {
        if (d.open) perguntas.forEach(function (o) { if (o !== d) o.open = false; });
      });
    });

    // ---------- Camada tecnológica ----------
    var calmo = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Barra de progresso de leitura
    var barra = document.querySelector(".progresso span");
    if (barra) {
      var progresso = function () {
        var total = document.documentElement.scrollHeight - window.innerHeight;
        barra.style.setProperty("--rolagem", total > 0 ? Math.min(1, window.scrollY / total) : 0);
      };
      window.addEventListener("scroll", progresso, { passive: true });
      progresso();
    }

    // Palavra que se digita sozinha no título
    var rot = document.querySelector(".rotativo");
    if (rot && !calmo) {
      var palavras = rot.getAttribute("data-palavras").split("|");
      var iPal = 0, iLetra = palavras[0].length, apagando = true;
      var passo = function () {
        var alvo = palavras[iPal];
        if (apagando) {
          iLetra--;
          if (iLetra <= 0) { apagando = false; iPal = (iPal + 1) % palavras.length; }
        } else {
          iLetra++;
          if (iLetra >= palavras[iPal].length) { apagando = true; rot.textContent = palavras[iPal]; return setTimeout(passo, 2600); }
        }
        rot.textContent = palavras[iPal].slice(0, Math.max(0, iLetra)) || "​";
        setTimeout(passo, apagando ? 38 : 70);
      };
      setTimeout(passo, 2600);
    }

    // Números que contam ao aparecer na tela
    var contar = function (el) {
      var fim = parseInt(el.getAttribute("data-contar"), 10), ini = null;
      if (calmo) { el.textContent = fim; return; }
      var tick = function (t) {
        if (!ini) ini = t;
        var k = Math.min(1, (t - ini) / 1400);
        el.textContent = Math.round(fim * (1 - Math.pow(1 - k, 3)));
        if (k < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    var contadores = document.querySelectorAll("[data-contar]");
    if ("IntersectionObserver" in window) {
      var obsNum = new IntersectionObserver(function (ents) {
        ents.forEach(function (en) { if (en.isIntersecting) { contar(en.target); obsNum.unobserve(en.target); } });
      }, { threshold: .6 });
      contadores.forEach(function (c) { c.textContent = "0"; obsNum.observe(c); });
    }

    // Notificações da rotina mensal (aparecem uma a uma e recomeçam)
    var notas = document.querySelectorAll(".notificacoes li");
    if (notas.length) {
      if (calmo) notas.forEach(function (n) { n.classList.add("on"); });
      else {
        var iNota = 0;
        var mostrar = function () {
          if (iNota < notas.length) { notas[iNota].classList.add("on"); iNota++; setTimeout(mostrar, 900); }
          else setTimeout(function () { notas.forEach(function (n) { n.classList.remove("on"); }); iNota = 0; setTimeout(mostrar, 700); }, 4200);
        };
        setTimeout(mostrar, 800);
      }
    }

    // Luz que segue o mouse nos cartões
    document.querySelectorAll(".luz").forEach(function (c) {
      c.addEventListener("pointermove", function (e) {
        var r = c.getBoundingClientRect();
        c.style.setProperty("--mx", (e.clientX - r.left) + "px");
        c.style.setProperty("--my", (e.clientY - r.top) + "px");
      });
    });

    // Linha do "Como funciona" que se preenche
    var linha = document.querySelector("[data-linha]");
    if (linha && "IntersectionObserver" in window && !calmo) {
      linha.style.setProperty("--linha", 0);
      var obsLinha = new IntersectionObserver(function (ents) {
        if (ents[0].isIntersecting) { linha.style.setProperty("--linha", 1); obsLinha.disconnect(); }
      }, { threshold: .4 });
      obsLinha.observe(linha);
    }

    // Rede de pontos conectados no fundo do topo
    var tela = document.querySelector(".hero-rede");
    if (tela && tela.getContext && !calmo) {
      var estilo = getComputedStyle(document.documentElement);
      var corRede = (estilo.getPropertyValue("--rede") || "255 90 98").trim().split(/\s+/).join(",");
      var corPonto = (estilo.getPropertyValue("--ponto") || "255 140 146").trim().split(/\s+/).join(",");
      var ctx = tela.getContext("2d"), pontos = [], larg = 0, alt = 0, dpr = 1, ativo = true, mouse = null;
      var montar = function () {
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        larg = tela.clientWidth; alt = tela.clientHeight;
        tela.width = larg * dpr; tela.height = alt * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var qtd = Math.min(80, Math.round(larg * alt / 16000));
        pontos = [];
        for (var i = 0; i < qtd; i++) {
          pontos.push({ x: Math.random() * larg, y: Math.random() * alt, vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35, r: Math.random() * 1.6 + .6 });
        }
      };
      var desenhar = function () {
        if (!ativo) return;
        ctx.clearRect(0, 0, larg, alt);
        var dist = 140;
        for (var i = 0; i < pontos.length; i++) {
          var p = pontos[i];
          p.x += p.vx; p.y += p.vy;
          if (p.x < 0 || p.x > larg) p.vx *= -1;
          if (p.y < 0 || p.y > alt) p.vy *= -1;
          for (var j = i + 1; j < pontos.length; j++) {
            var q = pontos[j], dx = p.x - q.x, dy = p.y - q.y, d = dx * dx + dy * dy;
            if (d < dist * dist) {
              ctx.strokeStyle = "rgba(" + corRede + "," + (0.28 * (1 - Math.sqrt(d) / dist)) + ")";
              ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
            }
          }
          if (mouse) {
            var mx = p.x - mouse.x, my = p.y - mouse.y, md = mx * mx + my * my;
            if (md < 180 * 180) {
              ctx.strokeStyle = "rgba(255,255,255," + (0.25 * (1 - Math.sqrt(md) / 180)) + ")";
              ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
            }
          }
          ctx.fillStyle = "rgba(" + corPonto + ",.8)";
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
        }
        requestAnimationFrame(desenhar);
      };
      var heroEl = tela.parentElement;
      heroEl.addEventListener("pointermove", function (e) { var r = tela.getBoundingClientRect(); mouse = { x: e.clientX - r.left, y: e.clientY - r.top }; });
      heroEl.addEventListener("pointerleave", function () { mouse = null; });
      var tempo;
      window.addEventListener("resize", function () { clearTimeout(tempo); tempo = setTimeout(montar, 200); });
      // Só anima quando o topo está visível (economiza bateria)
      if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (ents) {
          var antes = ativo; ativo = ents[0].isIntersecting && !document.hidden;
          if (ativo && !antes) requestAnimationFrame(desenhar);
        }).observe(heroEl);
      }
      document.addEventListener("visibilitychange", function () {
        var antes = ativo; ativo = !document.hidden;
        if (ativo && !antes) requestAnimationFrame(desenhar);
      });
      montar();
      requestAnimationFrame(desenhar);
    }

    // Cartões inclinam em 3D acompanhando o mouse
    if (!calmo && window.matchMedia("(hover: hover)").matches) {
      document.querySelectorAll(".grade > .cartao").forEach(function (c) {
        c.addEventListener("pointermove", function (e) {
          var r = c.getBoundingClientRect();
          var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
          c.classList.add("inclinado");
          c.style.setProperty("--ry", (x * 8).toFixed(2) + "deg");
          c.style.setProperty("--rx", (-y * 8).toFixed(2) + "deg");
        });
        c.addEventListener("pointerleave", function () { c.classList.remove("inclinado"); });
      });
    }

    // Paralaxe: textos e foto do topo se movem em velocidades diferentes
    var hero = document.querySelector(".hero");
    if (hero && !calmo) {
      var agendado = false;
      window.addEventListener("scroll", function () {
        if (agendado) return;
        agendado = true;
        requestAnimationFrame(function () {
          agendado = false;
          var y = window.scrollY;
          if (y < hero.offsetHeight + 200) hero.style.setProperty("--par", y);
        });
      }, { passive: true });
    }

    // Formulário -> mensagem pronta no WhatsApp
    var form = document.getElementById("form-contato");
    if (!form) return;
    var campo = function (id) { return document.getElementById(id); };
    var tel = campo("f-whats");

    tel.addEventListener("input", function () {
      var d = tel.value.replace(/\D/g, "").slice(0, 11);
      var r = d;
      if (d.length > 2) r = "(" + d.slice(0, 2) + ") " + d.slice(2);
      if (d.length > 7) r = "(" + d.slice(0, 2) + ") " + d.slice(2, d.length - 4) + "-" + d.slice(d.length - 4);
      tel.value = r;
    });

    var erro = function (el, idErro, msg) {
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      campo(idErro).textContent = msg || "";
      return !msg;
    };

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (campo("f-site").value) return; // robô de spam

      var nome = campo("f-nome").value.trim();
      var fone = tel.value.replace(/\D/g, "");
      var email = campo("f-email").value.trim();
      var cidade = campo("f-cidade").value.trim();
      var assunto = campo("f-assunto").value;
      var msg = campo("f-msg").value.trim();
      var lgpd = campo("f-lgpd");

      var ok = [
        erro(campo("f-nome"), "e-nome", nome.length < 3 ? "Informe seu nome completo." : ""),
        erro(tel, "e-whats", fone.length < 10 ? "Informe um WhatsApp com DDD." : ""),
        erro(campo("f-email"), "e-email", email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Confira o e-mail digitado." : ""),
        erro(campo("f-assunto"), "e-assunto", !assunto ? "Escolha um assunto." : ""),
        erro(campo("f-msg"), "e-msg", msg.length < 5 ? "Escreva sua mensagem." : ""),
        erro(lgpd, "e-lgpd", !lgpd.checked ? "É preciso concordar para enviarmos sua mensagem." : "")
      ].every(Boolean);

      if (!ok) {
        var primeiro = form.querySelector('[aria-invalid="true"]');
        if (primeiro) primeiro.focus();
        return;
      }

      var texto = "Olá, vim pelo site da Clarm Contabilidade.\n\n" +
        "*Nome:* " + nome + "\n" +
        "*WhatsApp:* " + tel.value + "\n" +
        (email ? "*E-mail:* " + email + "\n" : "") +
        (cidade ? "*Cidade:* " + cidade + "\n" : "") +
        "*Assunto:* " + assunto + "\n\n" + msg;

      var url = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(texto);
      // Abre em nova aba; se o navegador bloquear, abre na mesma aba
      var janela = window.open(url, "_blank");
      if (janela) janela.opener = null;
      else window.location.href = url;
    });
  });
})();
