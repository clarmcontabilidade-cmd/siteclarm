# Site da Clarm Contabilidade

Esta pasta guarda o site **clarmcontabilidade.com.br**. O resto do repositório é o site da Dynos AI e não é afetado por ela.

## O que tem aqui

| Arquivo | Para que serve |
|---|---|
| `index.html` | Página inicial (todas as seções) |
| `politica-de-privacidade.html` | Política de privacidade (LGPD) |
| `404.html` | Página mostrada quando alguém digita um endereço que não existe |
| `assets/css/clarm.css` | Cores, fontes e layout |
| `assets/js/clarm.js` | Menu do celular, formulário → WhatsApp e animações |
| `assets/img/` | Logo (vermelha e branca), ícones e imagem de compartilhamento |
| `assets/fonts/` | Fontes do site (hospedadas aqui, sem Google Fonts) |
| `robots.txt`, `sitemap.xml` | Ajudam o Google a encontrar as páginas |

O **blog** (`/blog/`) e a **foto** (`/assets/contadora-CL96REF3.jpg`) continuam os que já estão no servidor. A publicação não apaga nada disso.

## Como publicar

No Console do Navegador do hPanel (como root), cole:

```
bash <(curl -fsSL https://raw.githubusercontent.com/clarmcontabilidade-cmd/siteclarm/claude/clarm-contabilidade-site-robust-hbo6zv/deploy/publicar-clarm.sh)
```

O script faz um backup do site atual antes de trocar qualquer coisa e mostra, no final, o comando para desfazer.

## Como mudar um texto

1. Abra `index.html`.
2. Procure o texto (Ctrl+F) e troque só o que está entre `>` e `<`.
3. Telefone e WhatsApp aparecem em vários lugares: procure por `99652-3773` e por `5588996523773`.

## Pendências recomendadas

- **Registros de acesso (Marco Civil, art. 15):** a política de privacidade diz que os registros são guardados pelo prazo legal de 6 meses. O Ubuntu, por padrão, guarda só 14 dias. Para ajustar, em `/etc/logrotate.d/nginx`, troque `rotate 14` por `rotate 183` (com `daily`).
- **Ajustes opcionais do nginx:** veja `deploy/nginx-clarm-extras.conf` (HTTPS obrigatório, compressão, cache e página 404).
