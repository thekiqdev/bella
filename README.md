# Bella · link na bio

Landing page de links (TikTok/Instagram) + página `/marcas`. TypeScript + Node, **sem dependências em produção** (só `typescript` e `@types/node` para compilar).

## Rodar local
```bash
npm install
npm run build
npm start        # http://localhost:3000
```

## Editar sem mexer em código
- **Links e textos dos botões:** `public/js/config.js` (troque os `"#"` pelo link da comunidade do TikTok e da página da Kiwify).
- **Data do embarque (relógio):** `departure` no mesmo arquivo.
- **Vídeo da página /marcas:** coloque em `public/media/apresentacao.mp4` ou troque a tag `<video>` em `public/marcas.html` por um embed do YouTube/Vimeo (melhor para arquivos grandes, o GitHub limita arquivos a 100 MB).
- **Foto:** `public/avatar.jpg`.

## Subir no GitHub
```bash
git init && git add . && git commit -m "primeira versão"
git branch -M main
git remote add origin https://github.com/thekiqdev/bella.git
git push -u origin main
```

## Deploy na VPS (Node 18+)
```bash
git clone https://github.com/thekiqdev/bella.git && cd bella
npm install && npm run build
PORT=3000 npx pm2 start dist/server.js --name bella
npx pm2 save && npx pm2 startup      # volta sozinho após reiniciar a VPS
```
Para atualizar: `git pull && npm install && npm run build && npx pm2 restart bella`.

### Domínio + HTTPS (Nginx)
```nginx
server {
  server_name seudominio.com.br;
  location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $remote_addr; }
  client_max_body_size 50m;
}
```
Depois: `sudo certbot --nginx -d seudominio.com.br`.
