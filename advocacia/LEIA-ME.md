# Site Ana Débora Advocacia

Esta pasta guarda o site **anadeboraadvocacia.com**. As pastas `clarm/` (Clarm Contabilidade) e a raiz do repositório (Dynos AI) são sites separados.

## O que tem aqui

| Arquivo | Para que serve |
|---|---|
| `index.html` | Página inicial (todas as seções) |
| `politica-de-privacidade.html` | Política de privacidade (LGPD + sigilo profissional) |
| `404.html` | Página mostrada quando alguém digita um endereço que não existe |
| `assets/css/advocacia.css` | Cores, fontes, layout e animações |
| `assets/js/advocacia.js` | Menu do celular, formulário → WhatsApp e animações |
| `assets/img/` | Monograma "AD", ícones e imagem de compartilhamento |
| `assets/fonts/` | Fontes do site (hospedadas aqui, sem Google Fonts) |
| `robots.txt`, `sitemap.xml` | Ajudam o Google a encontrar as páginas |

As **fotos** (`/assets/ana-debora-2.jpg` e `/assets/ana-debora-3.jpg`) continuam as que já estão no servidor. A publicação não apaga nada.

## Como publicar

No Console do Navegador do hPanel (como root), cole:

```
bash <(curl -fsSL https://raw.githubusercontent.com/clarmcontabilidade-cmd/siteclarm/claude/clarm-contabilidade-site-robust-hbo6zv/deploy/publicar-advocacia.sh)
```

Se ele não achar a pasta sozinho, informe a pasta na frente, por exemplo:

```
DEST=/var/www/anadeboraadvocacia bash <(curl -fsSL https://raw.githubusercontent.com/clarmcontabilidade-cmd/siteclarm/claude/clarm-contabilidade-site-robust-hbo6zv/deploy/publicar-advocacia.sh)
```

O script faz um backup do site atual antes de trocar qualquer coisa e mostra, no final, como desfazer.

## Como mudar um texto

1. Abra `index.html`.
2. Procure o texto (Ctrl+F) e troque só o que está entre `>` e `<`.
3. Telefone e WhatsApp aparecem em vários lugares: procure por `99652-3773` e por `5588996523773`.

## Publicidade na advocacia

Os textos seguem o que já estava no site. Antes de publicar novas frases, vale conferir o Provimento nº 205/2021 do CFOAB: conteúdo informativo, sem promessa de resultado, sem menção a valores e sem captação de clientela.
