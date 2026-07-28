"use strict";

/**
 * Engineer Portfolio Template
 * - モバイルメニュー
 * - スクロール位置に応じたナビゲーション表示
 * - 要素のフェードイン
 * - スキルバーのアニメーション
 * - 画像・動画が未配置の場合のプレースホルダー表示
 */

document.documentElement.classList.remove("no-js");

document.addEventListener("DOMContentLoaded", () => {
  setupMobileMenu();
  setupScrollNavigation();
  setupRevealAnimation();
  setupSkillLevels();
  setupImageFallbacks();
  setupVideoFrames();
  updateCopyrightYear();
});

/** モバイル用ナビゲーション */
function setupMobileMenu() {
  const toggle = document.querySelector(".global-nav__toggle");
  const menu = document.querySelector(".global-nav__list");

  if (!toggle || !menu) return;

  const setMenuState = (isOpen) => {
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "メニューを閉じる" : "メニューを開く");
    menu.classList.toggle("is-open", isOpen);
    document.body.classList.toggle("menu-open", isOpen);
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setMenuState(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 760) setMenuState(false);
  });
}

/** ヘッダー背景と現在位置のナビゲーション表示 */
function setupScrollNavigation() {
  const nav = document.querySelector(".global-nav");
  const navLinks = [...document.querySelectorAll('.global-nav__list a[href^="#"]')];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!nav) return;

  const updateNavBackground = () => {
    nav.classList.toggle("is-scrolled", window.scrollY > 40);
  };

  updateNavBackground();
  window.addEventListener("scroll", updateNavBackground, { passive: true });

  if (!("IntersectionObserver" in window) || sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (!visibleEntry) return;

      const currentId = `#${visibleEntry.target.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === currentId);
      });
    },
    {
      rootMargin: "-25% 0px -60% 0px",
      threshold: [0, 0.1, 0.25, 0.5],
    }
  );

  sections.forEach((section) => observer.observe(section));
}

/** スクロール時のフェードイン */
function setupRevealAnimation() {
  const targets = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    targets.forEach((target) => target.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.1,
    }
  );

  targets.forEach((target) => observer.observe(target));
}

/** data-level="0〜100" の値をスキルバーへ反映 */
function setupSkillLevels() {
  const skillLevels = document.querySelectorAll(".skill-level");

  skillLevels.forEach((skillLevel) => {
    const rawLevel = Number(skillLevel.dataset.level);
    const safeLevel = Number.isFinite(rawLevel)
      ? Math.min(100, Math.max(0, rawLevel))
      : 0;

    skillLevel.style.setProperty("--skill-level", `${safeLevel}%`);
  });

  if (!("IntersectionObserver" in window)) {
    skillLevels.forEach((skillLevel) => skillLevel.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        currentObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.35 }
  );

  skillLevels.forEach((skillLevel) => observer.observe(skillLevel));
}

/**
 * 画像が存在しない場合、説明入りSVGを生成して代わりに表示します。
 * 実画像を配置すると自動で実画像へ切り替わります。
 */
function setupImageFallbacks() {
  const images = document.querySelectorAll(".js-fallback-image");

  images.forEach((image) => {
    const applyFallback = () => {
      if (image.dataset.fallbackApplied === "true") return;

      const title = image.dataset.placeholderTitle || "IMAGE";
      const subtitle = image.dataset.placeholderSubtitle || "画像を配置してください";
      const isHeroImage = image.classList.contains("hero__photo");
      const width = isHeroImage ? 1600 : 1200;
      const height = isHeroImage ? 1000 : 760;

      image.src = createPlaceholderSvg(title, subtitle, width, height, isHeroImage);
      image.classList.add("is-placeholder");
      image.dataset.fallbackApplied = "true";
    };

    image.addEventListener("error", applyFallback, { once: true });

    // キャッシュ等でerrorイベント取得前に読み込みが失敗している場合への対応
    if (image.complete && image.naturalWidth === 0) {
      applyFallback();
    }
  });
}

function createPlaceholderSvg(title, subtitle, width, height, isHero) {
  const background = isHero ? "#18212d" : "#dfe4e8";
  const foreground = isHero ? "#ffffff" : "#414c59";
  const subColor = isHero ? "#9eabb9" : "#6e7987";
  const accent = "#25c2d8";
  const safeTitle = escapeXml(title);
  const safeSubtitle = escapeXml(subtitle);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="100%" height="100%" fill="${background}"/>
      <circle cx="${width * 0.78}" cy="${height * 0.3}" r="${height * 0.28}" fill="none" stroke="${accent}" stroke-opacity="0.16" stroke-width="2"/>
      <circle cx="${width * 0.78}" cy="${height * 0.3}" r="${height * 0.18}" fill="none" stroke="${accent}" stroke-opacity="0.22" stroke-width="2"/>
      <path d="M0 ${height * 0.82} L${width} ${height * 0.62} L${width} ${height} L0 ${height}Z" fill="${accent}" fill-opacity="0.08"/>
      <rect x="${width * 0.08}" y="${height * 0.43}" width="70" height="5" fill="${accent}"/>
      <text x="${width * 0.08}" y="${height * 0.54}" fill="${foreground}" font-size="${Math.max(34, width * 0.052)}" font-family="Arial, sans-serif" font-weight="700">${safeTitle}</text>
      <text x="${width * 0.08}" y="${height * 0.62}" fill="${subColor}" font-size="${Math.max(18, width * 0.018)}" font-family="Arial, sans-serif">${safeSubtitle}</text>
    </svg>
  `;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/** 動画を読み込めた場合だけプレースホルダーを非表示にします */
function setupVideoFrames() {
  const frames = document.querySelectorAll(".js-video-frame");

  frames.forEach((frame) => {
    const video = frame.querySelector("video");
    const source = video?.querySelector("source");

    if (!video || !source || !source.getAttribute("src")) return;

    const showVideo = () => frame.classList.add("is-loaded");
    video.addEventListener("loadeddata", showVideo, { once: true });
    video.addEventListener("canplay", showVideo, { once: true });

    if (video.readyState >= 2) showVideo();
  });
}

function updateCopyrightYear() {
  const target = document.querySelector("#current-year");
  if (target) target.textContent = String(new Date().getFullYear());
}
