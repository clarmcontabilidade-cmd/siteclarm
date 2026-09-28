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
