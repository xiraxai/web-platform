// Preview: animación "Helix trabajando en el portátil" (ya en vivo en el feedback).
export const metadata = { title: "Mascota XiraX (preview)" };

const HTML = `
<style>
 .mwrap{max-width:760px;margin:0 auto;padding:2rem 1.1rem 4rem;font-family:ui-sans-serif,system-ui,sans-serif;text-align:center}
 .mk{font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#10b981}.mk::before{content:"> "}
 .mh{font-size:1.5rem;margin:.5rem 0 .3rem;color:#ededed}.ml{color:#9a9a9a;line-height:1.55;font-size:.92rem;max-width:560px;margin:0 auto}
 .stage{margin-top:1.6rem;display:grid;place-items:center;background:#0c0c0c;border:1px solid #2a2a2a;border-radius:18px;padding:2rem}
 .cap{color:#9a9a9a;font-size:.82rem;margin-top:.6rem}
 .flt{animation:mwflt 3.2s ease-in-out infinite}
 .h1{animation:mwtap .42s ease-in-out infinite;transform-origin:center}
 .h2{animation:mwtap .42s ease-in-out infinite .21s;transform-origin:center}
 .cur{animation:mwbl 1s step-end infinite}
 .ln{transform-origin:left center}
 .l1{animation:mwln 1.5s ease-in-out infinite}.l2{animation:mwln 1.5s ease-in-out infinite .25s}.l3{animation:mwln 1.5s ease-in-out infinite .5s}
 @keyframes mwflt{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}
 @keyframes mwtap{0%,100%{transform:translateY(0)}50%{transform:translateY(2.2px)}}
 @keyframes mwbl{0%,49%{opacity:1}50%,100%{opacity:0}}
 @keyframes mwln{0%{transform:scaleX(.2)}50%{transform:scaleX(1)}100%{transform:scaleX(.45)}}
 @media(prefers-reduced-motion:reduce){*{animation:none!important}}
</style>
<div class="mwrap">
 <div class="mk">XiraX AI · mascota · animación</div>
 <div class="mh">Helix trabajando 🟢</div>
 <div class="ml">Esta animación ya sale cuando un cliente envía su feedback. Teclea, la pantalla muestra código y el cursor parpadea.</div>
 <div class="stage">
  <svg viewBox="0 0 150 104" width="300" role="img" aria-label="Mascota trabajando">
   <ellipse cx="74" cy="96" rx="56" ry="5" fill="#10b981" opacity=".12"/>
   <g class="flt">
    <rect x="22" y="44" width="40" height="9" rx="4.5" fill="#10b981" transform="rotate(45 42 52)"/>
    <rect x="22" y="44" width="40" height="9" rx="4.5" fill="#10b981" transform="rotate(-45 42 52)"/>
    <circle cx="26" cy="36" r="5" fill="#10b981"/><circle cx="58" cy="36" r="5" fill="#10b981"/><circle cx="26" cy="68" r="5" fill="#10b981"/>
    <circle cx="42" cy="52" r="14" fill="#10b981"/>
    <circle cx="37" cy="50" r="2.6" fill="#04130d"/><circle cx="47" cy="50" r="2.6" fill="#04130d"/>
    <circle cx="36" cy="49" r=".9" fill="#eafff6"/><circle cx="46" cy="49" r=".9" fill="#eafff6"/>
    <path d="M37 57 q5 4 10 0" stroke="#04130d" stroke-width="2" fill="none" stroke-linecap="round"/>
   </g>
   <rect x="74" y="34" width="52" height="38" rx="4" fill="#0c0c0c" stroke="#10b981" stroke-width="2.5"/>
   <rect class="ln l1" x="80" y="42" width="34" height="3" rx="1.5" fill="#10b981"/>
   <rect class="ln l2" x="80" y="49" width="34" height="3" rx="1.5" fill="#34d399"/>
   <rect class="ln l3" x="80" y="56" width="26" height="3" rx="1.5" fill="#10b981"/>
   <rect class="cur" x="80" y="63" width="6" height="3" rx="1" fill="#34d399"/>
   <path d="M66 72 L134 72 L142 84 L58 84 Z" fill="#10b981"/>
   <path d="M66 72 L134 72 L132 76 L68 76 Z" fill="#0a8f63"/>
   <rect class="h1" x="78" y="74" width="8" height="6" rx="3" fill="#10b981"/>
   <rect class="h2" x="94" y="74" width="8" height="6" rx="3" fill="#10b981"/>
  </svg>
 </div>
 <div class="cap">↑ "trabajando en el portátil" (animada, en vivo en el feedback)</div>
 <div class="ml" style="margin-top:1.6rem"><strong>La idea:</strong> esta es la primera de muchas. Le sumamos estados (pensando, celebrando, enviando, durmiendo) para que interactúe en cada parte. ¿Te gusta esta animación? Seguimos por aquí.</div>
</div>
`;

export default function MascotaPreview() {
  return <main style={{ background: "#050505", minHeight: "100vh" }} dangerouslySetInnerHTML={{ __html: HTML }} />;
}
