# XiraX AI — Web Platform

Plataforma web corporativa de XiraX AI. Producción: [xiraxai.com](https://xiraxai.com)

## Stack

- **Framework:** Next.js 15 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Deploy:** Vercel (auto-deploy desde `main`)
- **Dominio:** xiraxai.com (DNS en Cloudflare)

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Estructura

```
app/              # Páginas y layouts (App Router)
public/           # Assets estáticos
```

## Estándares

Este proyecto sigue los estándares de la [XiraX AI Factory](https://github.com/xiraxai/factory).

## Deploy

Cada push a `main` despliega automáticamente a producción vía Vercel.

---

**Propietario:** Raphael Higuera — CEO & Founder, XiraX AI
