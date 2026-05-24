// Página temporal de preview de la mascota XiraX (para revisar desde el cel).
// No está enlazada en el sitio. Se elimina tras elegir el concepto.
export const metadata = { title: "Mascota XiraX (preview)" };

const HTML = `
<style>
  .mwrap{max-width:760px;margin:0 auto;padding:2rem 1.1rem 4rem;font-family:ui-sans-serif,system-ui,sans-serif}
  .mk{font-family:ui-monospace,monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#10b981}
  .mk::before{content:"> "}
  .mh{font-size:1.6rem;margin:.5rem 0 .3rem;color:#ededed}
  .ml{color:#9a9a9a;line-height:1.55;font-size:.95rem}
  .mgrid{display:grid;grid-template-columns:repeat(2,1fr);gap:.9rem;margin-top:1.8rem}
  @media(max-width:520px){.mgrid{grid-template-columns:1fr}}
  .mcard{background:#0c0c0c;border:1px solid #2a2a2a;border-radius:16px;padding:1.2rem;text-align:center}
  .mstage{height:150px;display:grid;place-items:center}
  .mname{font-weight:700;margin-top:.6rem;color:#ededed}
  .mdesc{color:#9a9a9a;font-size:.82rem;margin-top:.25rem;line-height:1.4}
  .mtag{font-family:ui-monospace,monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#10b981;border:1px solid rgba(16,185,129,.4);border-radius:999px;padding:.18rem .5rem;display:inline-block;margin-top:.5rem}
  @keyframes mfloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-7px)}}
  .mfloat{animation:mfloat 4s ease-in-out infinite}
  .mnote{color:#9a9a9a;font-size:.85rem;margin-top:2rem;line-height:1.6}
</style>
<div class="mwrap">
  <div class="mk">XiraX AI · Identidad</div>
  <div class="mh">Mascota XiraX — 4 conceptos</div>
  <div class="ml">Verde XiraX, estilo pixel/bloque. Elige A, B, C o D y dime qué ajustar.</div>

  <div style="margin-top:1.6rem;background:#0c0c0c;border:1px solid rgba(16,185,129,.55);border-radius:16px;padding:1.4rem;text-align:center;box-shadow:0 0 50px rgba(16,185,129,.16)">
    <div class="mk">v2 · lo que pediste: la X (D) en pixel 8-bit (A)</div>
    <div style="display:flex;gap:1.8rem;justify-content:center;flex-wrap:wrap;margin-top:1rem">
      <div>
        <div class="mstage" style="height:150px">
          <svg class="mfloat" width="130" height="130" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-label="Pixo">
            <g fill="#10b981">
              <rect x="3" y="3" width="3" height="3"/><rect x="10" y="3" width="3" height="3"/>
              <rect x="6" y="6" width="4" height="4"/>
              <rect x="3" y="10" width="3" height="3"/><rect x="10" y="10" width="3" height="3"/>
            </g>
            <g fill="#6ee7b7">
              <rect x="3" y="3" width="3" height="1"/><rect x="10" y="3" width="3" height="1"/>
              <rect x="6" y="6" width="4" height="1"/><rect x="3" y="10" width="3" height="1"/><rect x="10" y="10" width="3" height="1"/>
            </g>
            <g fill="#047857">
              <rect x="5" y="5" width="1" height="1"/><rect x="12" y="5" width="1" height="1"/>
              <rect x="9" y="9" width="1" height="1"/><rect x="5" y="12" width="1" height="1"/><rect x="12" y="12" width="1" height="1"/>
            </g>
            <g fill="#04130d"><rect x="6" y="7" width="1" height="1"/><rect x="8" y="7" width="1" height="1"/><rect x="7" y="9" width="1" height="1"/></g>
          </svg>
        </div>
        <div class="mname">E · "Pixo"</div>
        <div class="mdesc">La X en sprite 8-bit, con carita. Limpio.</div>
      </div>
      <div>
        <div class="mstage" style="height:150px">
          <svg class="mfloat" width="130" height="130" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-label="Pixo+">
            <g fill="#10b981">
              <rect x="8" y="0" width="1" height="2"/>
              <rect x="3" y="3" width="3" height="3"/><rect x="10" y="3" width="3" height="3"/>
              <rect x="6" y="6" width="4" height="4"/>
              <rect x="3" y="10" width="3" height="3"/><rect x="10" y="10" width="3" height="3"/>
              <rect x="4" y="13" width="1" height="1"/><rect x="11" y="13" width="1" height="1"/>
            </g>
            <g fill="#6ee7b7">
              <rect x="3" y="3" width="3" height="1"/><rect x="10" y="3" width="3" height="1"/>
              <rect x="6" y="6" width="4" height="1"/><rect x="3" y="10" width="3" height="1"/><rect x="10" y="10" width="3" height="1"/>
            </g>
            <g fill="#047857">
              <rect x="5" y="5" width="1" height="1"/><rect x="12" y="5" width="1" height="1"/>
              <rect x="9" y="9" width="1" height="1"/><rect x="5" y="12" width="1" height="1"/><rect x="12" y="12" width="1" height="1"/>
            </g>
            <g fill="#04130d"><rect x="6" y="7" width="1" height="1"/><rect x="8" y="7" width="1" height="1"/><rect x="7" y="9" width="2" height="1"/></g>
            <rect x="6" y="7" width="1" height="1" fill="#9af5d2" opacity=".0"/>
          </svg>
        </div>
        <div class="mname">F · "Pixo+"</div>
        <div class="mdesc">Igual + antena y patitas (más personaje).</div>
      </div>
    </div>
    <div class="mdesc" style="margin-top:.8rem">Dime: E o F, color de los ojos, más alto/chato, y si quieres bracitos.</div>
  </div>

  <div class="mk" style="margin-top:2rem">Conceptos originales</div>
  <div class="mgrid">

    <div class="mcard">
      <div class="mstage">
        <svg class="mfloat" width="110" height="110" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-label="Bit">
          <g fill="#10b981">
            <rect x="4" y="1" width="8" height="1"/><rect x="3" y="2" width="10" height="1"/>
            <rect x="2" y="3" width="12" height="9"/><rect x="3" y="12" width="10" height="1"/>
            <rect x="4" y="13" width="3" height="2"/><rect x="9" y="13" width="3" height="2"/>
          </g>
          <g fill="#04130d"><rect x="5" y="6" width="2" height="2"/><rect x="9" y="6" width="2" height="2"/><rect x="6" y="10" width="4" height="1"/></g>
          <rect x="5" y="6" width="1" height="1" fill="#9af5d2"/><rect x="9" y="6" width="1" height="1" fill="#9af5d2"/>
        </svg>
      </div>
      <div class="mname">A · "Bit"</div>
      <div class="mdesc">Sprite 8-bit puro. Cuadrado, retro, pixelado de verdad.</div>
      <span class="mtag">pixel puro</span>
    </div>

    <div class="mcard">
      <div class="mstage">
        <svg class="mfloat" width="110" height="110" viewBox="0 0 64 64" aria-label="Nova">
          <defs><radialGradient id="gB" cx="35%" cy="30%"><stop offset="0" stop-color="#9af5d2"/><stop offset="1" stop-color="#10b981" stop-opacity="0"/></radialGradient></defs>
          <rect x="10" y="12" width="44" height="44" rx="16" fill="#10b981"/>
          <rect x="10" y="12" width="44" height="44" rx="16" fill="url(#gB)" opacity=".5"/>
          <circle cx="25" cy="33" r="4.5" fill="#04130d"/><circle cx="41" cy="33" r="4.5" fill="#04130d"/>
          <circle cx="26.5" cy="31.5" r="1.4" fill="#fff"/><circle cx="42.5" cy="31.5" r="1.4" fill="#fff"/>
          <path d="M26 44 q6 5 12 0" stroke="#04130d" stroke-width="2.5" fill="none" stroke-linecap="round"/>
        </svg>
      </div>
      <div class="mname">B · "Nova"</div>
      <div class="mdesc">Blob redondeado y amigable (espíritu del de Claude, en verde).</div>
      <span class="mtag">cálido / minimal</span>
    </div>

    <div class="mcard">
      <div class="mstage">
        <svg class="mfloat" width="110" height="110" viewBox="0 0 64 64" aria-label="Term">
          <line x1="32" y1="6" x2="32" y2="12" stroke="#10b981" stroke-width="2"/><circle cx="32" cy="5" r="2.5" fill="#10b981"/>
          <rect x="12" y="12" width="40" height="34" rx="8" fill="#0c0c0c" stroke="#10b981" stroke-width="2.5"/>
          <rect x="18" y="19" width="28" height="20" rx="3" fill="#04130d"/>
          <text x="22" y="34" font-family="ui-monospace,monospace" font-size="13" fill="#10b981">&gt;_</text>
          <rect x="20" y="46" width="24" height="8" rx="3" fill="#10b981"/>
          <rect x="22" y="54" width="5" height="5" fill="#10b981"/><rect x="37" y="54" width="5" height="5" fill="#10b981"/>
        </svg>
      </div>
      <div class="mname">C · "Term"</div>
      <div class="mdesc">Robot con cara de terminal y cursor &gt;_. El más on-brand.</div>
      <span class="mtag">terminal</span>
    </div>

    <div class="mcard">
      <div class="mstage">
        <svg class="mfloat" width="110" height="110" viewBox="0 0 64 64" aria-label="Xel">
          <g fill="#10b981">
            <rect x="8" y="10" width="12" height="12"/><rect x="44" y="10" width="12" height="12"/>
            <rect x="26" y="26" width="12" height="12"/><rect x="8" y="42" width="12" height="12"/><rect x="44" y="42" width="12" height="12"/>
          </g>
          <rect x="27" y="29" width="3.5" height="3.5" fill="#04130d"/><rect x="33.5" y="29" width="3.5" height="3.5" fill="#04130d"/>
        </svg>
      </div>
      <div class="mname">D · "Xel"</div>
      <div class="mdesc">La mascota ES la X de XiraX, con carita. Logo + personaje.</div>
      <span class="mtag">logo-mascota</span>
    </div>

  </div>
  <div class="mnote"><strong>Feedback:</strong> dime A / B / C / D + qué ajustar (más redondo o cuadrado, más serio o simpático, con antenas/brazos) y dónde lo verás primero (favicon, avatar de Helix, loader, stickers).</div>
</div>
`;

export default function MascotaPreview() {
  return (
    <main style={{ background: "#050505", minHeight: "100vh" }}>
      <div dangerouslySetInnerHTML={{ __html: HTML }} />
    </main>
  );
}
