(async (cssText, artDataUrl, theme) => {
  const STATE_KEY = "__CODEDROBE_CODEX_SKIN_STATE__";
  const STYLE_ID = "codedrobe-codex-skin-style";
  const CHROME_ID = "codedrobe-codex-skin-chrome";
  window.__CODEDROBE_CODEX_SKIN_DISABLED__ = false;

  const previous = window[STATE_KEY];
  if (previous?.observer) previous.observer.disconnect();
  if (previous?.timer) clearInterval(previous.timer);
  if (previous?.scheduler?.timeout) clearTimeout(previous.scheduler.timeout);
  const sameArt = previous?.themeId === theme.id && previous?.themeVersion === theme.version;
  if (previous?.artUrl && !sameArt) URL.revokeObjectURL(previous.artUrl);
  const artUrl = (sameArt && previous?.artUrl) || (() => {
    const comma = artDataUrl.indexOf(",");
    const binary = atob(artDataUrl.slice(comma + 1));
    const bytes = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
    return URL.createObjectURL(new Blob([bytes], { type: "image/png" }));
  })();
  if (!sameArt) {
    const image = new Image();
    image.src = artUrl;
    try { await image.decode(); } catch { /* The CSS fallback remains usable. */ }
  }

  const cssString = (value) => JSON.stringify(String(value ?? ""));

  const updateChromeCopy = (chrome) => {
    chrome.querySelector(".dream-brand-title").textContent = theme.copy.brandTitle;
    chrome.querySelector(".dream-brand-subtitle").textContent = theme.copy.brandSubtitle;
    chrome.querySelector(".dream-signature").textContent = theme.copy.signature;
    chrome.querySelector(".dream-ribbon-emoji").textContent = theme.copy.ribbon;
  };

  const ensure = () => {
    if (window.__CODEDROBE_CODEX_SKIN_DISABLED__) return;
    const root = document.documentElement;
    if (!root) return;
    root.classList.add("codedrobe-codex-skin");
    root.dataset.codexSkinTheme = theme.id;
    // Swap the decoded art before the stylesheet so a theme change never paints
    // the new Hero layout with the previous theme's image.
    root.style.setProperty("--dream-art", `url("${artUrl}")`);
    root.style.setProperty("--dream-tagline", cssString(theme.copy.tagline));
    root.style.setProperty("--dream-project-prefix", cssString(theme.copy.projectPrefix));
    root.style.setProperty("--dream-project-label", cssString(theme.copy.projectLabel));

    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement("style");
      style.id = STYLE_ID;
      (document.head || root).appendChild(style);
    }
    if (style.dataset.dreamVersion !== `${theme.id}@${theme.version}`) {
      style.textContent = cssText;
      style.dataset.dreamVersion = `${theme.id}@${theme.version}`;
    }

    const shellMain = document.querySelector("main.main-surface") || document.querySelector("main");
    const home = document.querySelector('[role="main"]:has([data-testid="home-icon"])');
    for (const candidate of document.querySelectorAll('[role="main"].dream-home')) {
      if (candidate !== home) candidate.classList.remove("dream-home");
    }
    if (home) home.classList.add("dream-home");

    if (!shellMain || !document.body) return;
    shellMain.classList.toggle("dream-home-shell", Boolean(home));
    let chrome = document.getElementById(CHROME_ID);
    if (!chrome || chrome.parentElement !== document.body || !chrome.querySelector(".dream-brand-title")) {
      chrome?.remove();
      chrome = document.createElement("div");
      chrome.id = CHROME_ID;
      chrome.setAttribute("aria-hidden", "true");
      chrome.innerHTML = `
        <div class="dream-brand"><span class="dream-note">♫</span><span><b class="dream-brand-title"></b><small class="dream-brand-subtitle"></small></span></div>
        <div class="dream-signature"></div>
        <div class="dream-sparkles"><i></i><i></i><i></i><i></i><i></i><i></i></div>
        <div class="dream-ribbon"><span>♡</span><b class="dream-ribbon-emoji"></b><span>✦</span></div>
        <div class="dream-polaroid"></div>`;
      document.body.appendChild(chrome);
    }
    updateChromeCopy(chrome);
    const shellBox = shellMain.getBoundingClientRect();
    chrome.style.left = `${Math.round(shellBox.left)}px`;
    chrome.style.top = `${Math.round(shellBox.top)}px`;
    chrome.style.width = `${Math.round(shellBox.width)}px`;
    chrome.style.height = `${Math.round(shellBox.height)}px`;
    chrome.classList.toggle("dream-home-shell", Boolean(home));
  };

  const cleanup = () => {
    window.__CODEDROBE_CODEX_SKIN_DISABLED__ = true;
    document.documentElement?.classList.remove("codedrobe-codex-skin");
    if (document.documentElement) delete document.documentElement.dataset.codexSkinTheme;
    document.documentElement?.style.removeProperty("--dream-art");
    document.documentElement?.style.removeProperty("--dream-tagline");
    document.documentElement?.style.removeProperty("--dream-project-prefix");
    document.documentElement?.style.removeProperty("--dream-project-label");
    document.querySelectorAll(".dream-home").forEach((node) => node.classList.remove("dream-home"));
    document.querySelectorAll(".dream-home-shell").forEach((node) => node.classList.remove("dream-home-shell"));
    document.getElementById(STYLE_ID)?.remove();
    document.getElementById(CHROME_ID)?.remove();
    const state = window[STATE_KEY];
    state?.observer?.disconnect();
    if (state?.timer) clearInterval(state.timer);
    if (state?.scheduler?.timeout) clearTimeout(state.scheduler.timeout);
    if (state?.artUrl) URL.revokeObjectURL(state.artUrl);
    delete window[STATE_KEY];
    return true;
  };

  const scheduler = { timeout: null };
  const scheduleEnsure = () => {
    if (scheduler.timeout) clearTimeout(scheduler.timeout);
    scheduler.timeout = setTimeout(() => {
      scheduler.timeout = null;
      ensure();
    }, 180);
  };
  const observer = new MutationObserver(scheduleEnsure);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  const timer = setInterval(ensure, 5000);
  window[STATE_KEY] = {
    ensure,
    cleanup,
    observer,
    timer,
    scheduler,
    artUrl,
    version: theme.version,
    themeId: theme.id,
    themeVersion: theme.version,
  };
  ensure();
  return { installed: true, themeId: theme.id, version: theme.version };
})(__DREAM_CSS_JSON__, __DREAM_ART_JSON__, __DREAM_THEME_JSON__)
