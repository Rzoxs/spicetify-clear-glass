// Clear Glass — fond ambiant et détection du plein écran.
(function clearGlass() {
  const root = document.querySelector(".Root__top-container");
  if (!window.Spicetify?.Player?.addEventListener || !root) {
    return setTimeout(clearGlass, 200);
  }

  /* ---------- Fond : la pochette floutée une seule fois dans un canvas ---------- */
  // Un canvas réduit, agrandi par le navigateur, donne le même flou qu'un
  // filter: blur() plein écran, sans aucun calcul à chaque image.
  const SIZE = 256;
  const makeLayer = () => {
    const el = document.createElement("canvas");
    el.className = "cg-bg-layer";
    el.width = el.height = SIZE;
    return el;
  };
  const host = document.createElement("div");
  host.id = "cg-bg";
  const layers = [makeLayer(), makeLayer()];
  host.append(...layers);
  document.body.prepend(host);

  let front = 0;
  let current = null;

  const coverUrl = () => {
    const meta = Spicetify.Player.data?.item?.metadata;
    const uri = meta?.image_large_url || meta?.image_url || meta?.image_xlarge_url;
    if (!uri) return null;
    return uri.startsWith("spotify:image:")
      ? "https://i.scdn.co/image/" + uri.split(":")[2]
      : uri;
  };

  const paint = (canvas, img) => {
    const ctx = canvas.getContext("2d");
    ctx.filter = "blur(6px) saturate(170%) brightness(0.68)"; // saturate/brightness : réglage du fond
    // Déborde du canvas pour éviter le bord transparent créé par le flou.
    ctx.drawImage(img, -24, -24, SIZE + 48, SIZE + 48);
    capBrightness(ctx);
  };

  // Comprime les zones claires sans toucher aux couleurs moyennes : le texte reste lisible sur
  // une pochette blanche, et la correction des boutons Windows (user.css) reste exacte.
  const CAP = 118, KNEE = 88;
  const capBrightness = (ctx) => {
    try {
      const data = ctx.getImageData(0, 0, SIZE, SIZE);
      const p = data.data;
      for (let i = 0; i < p.length; i += 4) {
        const max = Math.max(p[i], p[i + 1], p[i + 2]);
        if (max <= KNEE) continue;
        const k = (KNEE + ((max - KNEE) * (CAP - KNEE)) / (255 - KNEE)) / max;
        p[i] *= k;
        p[i + 1] *= k;
        p[i + 2] *= k;
      }
      ctx.putImageData(data, 0, 0);
    } catch (e) {
      // Image non lisible par le navigateur : on garde le fond tel quel.
    }
  };

  const update = () => {
    const url = coverUrl();
    if (!url || url === current) return;
    current = url;
    const img = new Image();
    img.crossOrigin = "anonymous"; // nécessaire pour lire les pixels dans capBrightness
    img.onload = () => {
      if (url !== current) return; // un morceau plus récent a pris la main
      const next = layers[1 - front];
      paint(next, img);
      next.classList.add("cg-on");
      layers[front].classList.remove("cg-on");
      front = 1 - front;
    };
    img.src = url;
  };

  Spicetify.Player.addEventListener("songchange", update);
  update();
  // Au démarrage, le morceau n'est connu que plusieurs secondes plus tard, sans
  // forcément déclencher songchange : on réessaie jusqu'à avoir une pochette.
  const retry = setInterval(() => {
    update();
    if (current) clearInterval(retry);
  }, 1000);

  /* ---------- Plein écran et vue développée ---------- */
  // Remplace des sélecteurs :has() très coûteux. On n'observe la vue que lorsqu'elle
  // est ouverte, et seule la liste des enfants directs de la racine en permanence.
  const CINEMA = '[style*="--cinema-mode-bg-color-from"]';
  let cinemaObserver = null;

  const tagCinema = (view) => {
    const el = view.querySelector(CINEMA);
    if (el && !el.classList.contains("cg-cinema-root")) el.classList.add("cg-cinema-root");
  };

  const syncCinema = () => {
    const panel = root.querySelector(":scope > #main-view + div");
    const view = panel?.nextElementSibling;
    const open = !!view && view.id !== "lyrics-cinema";
    root.classList.toggle("cg-cinema-on", open);
    cinemaObserver?.disconnect();
    cinemaObserver = null;
    if (!open) return;
    tagCinema(view);
    cinemaObserver = new MutationObserver(() => tagCinema(view));
    cinemaObserver.observe(view, { childList: true, subtree: true });
  };

  new MutationObserver(syncCinema).observe(root, { childList: true });
  syncCinema();

  const syncFullscreen = () =>
    document.documentElement.classList.toggle("cg-fullscreen", !!document.fullscreenElement);
  document.addEventListener("fullscreenchange", syncFullscreen);
  syncFullscreen();
})();
