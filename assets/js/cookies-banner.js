// Banner de cookies LGPD — Dynos AI
(function() {
  if (document.cookie.indexOf('cookie_consent=') !== -1) return;

  const css = `
    .dy-cookie-banner {
      position: fixed; bottom: 0; left: 0; right: 0; z-index: 9999;
      background: rgba(10, 6, 18, 0.97); backdrop-filter: blur(20px);
      border-top: 1px solid rgba(212, 175, 55, 0.3); color: #f0e7d8;
      padding: 20px 24px; box-shadow: 0 -10px 40px rgba(0,0,0,0.4);
      animation: cb-slide-up 0.4s ease;
    }
    @keyframes cb-slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
    .dy-cookie-banner .cb-inner { max-width: 1100px; margin: 0 auto; display: flex; gap: 20px; align-items: center; flex-wrap: wrap; }
    .dy-cookie-banner p { margin: 0; flex: 1; min-width: 280px; font-size: 14px; line-height: 1.5; }
    .dy-cookie-banner a { color: #f5d97e; text-decoration: underline; }
    .dy-cookie-banner .cb-btns { display: flex; gap: 10px; }
    .dy-cookie-banner button {
      padding: 10px 20px; border: none; border-radius: 999px; font-weight: 600;
      cursor: pointer; font-size: 14px; font-family: inherit; transition: all 0.2s;
    }
    .dy-cookie-banner .cb-aceitar { background: linear-gradient(135deg, #f5d97e, #d4af37); color: #1a0e02; }
    .dy-cookie-banner .cb-aceitar:hover { box-shadow: 0 4px 16px rgba(212,175,55,0.4); }
    .dy-cookie-banner .cb-saiba { background: rgba(255,255,255,0.06); color: #f0e7d8; border: 1px solid rgba(255,255,255,0.15); }
    .dy-cookie-banner .cb-saiba:hover { background: rgba(255,255,255,0.10); }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const banner = document.createElement('div');
  banner.className = 'dy-cookie-banner';
  banner.innerHTML = `
    <div class="cb-inner">
      <p>
        🍪 Usamos <strong>cookies estritamente necessários</strong> para manter sua sessão e o funcionamento do sistema.
        Não usamos cookies de rastreamento publicitário ou de terceiros.
        <a href="/cookies.html">Política de Cookies</a> · <a href="/politica-privacidade.html">Privacidade</a>
      </p>
      <div class="cb-btns">
        <a href="/cookies.html" class="cb-saiba" style="text-decoration: none; display: inline-block;"><button class="cb-saiba">Saiba mais</button></a>
        <button class="cb-aceitar" id="cb-aceitar">Entendi</button>
      </div>
    </div>
  `;
  document.body.appendChild(banner);

  document.getElementById('cb-aceitar').addEventListener('click', function() {
    const dataExpira = new Date();
    dataExpira.setFullYear(dataExpira.getFullYear() + 1);
    document.cookie = 'cookie_consent=1; expires=' + dataExpira.toUTCString() + '; path=/; SameSite=Lax; Secure';
    banner.style.animation = 'cb-slide-up 0.3s reverse';
    setTimeout(function() { banner.remove(); }, 300);
  });
})();
