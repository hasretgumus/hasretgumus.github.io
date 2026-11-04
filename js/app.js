/**
 * HASRET GÜMÜŞ — Portfolyo Kontrolcüsü
 * - Hero Küçük Görselleri İçin Yay Fiziği (Spring Physics)
 * - Tam Boy Görsel Portfolyo Akışı (Scroll Reveal)
 * - İletişim Footer Animasyonu & E-Posta Kopyalama
 */

document.addEventListener("DOMContentLoaded", () => {
  const heroStickers = document.getElementById("heroStickers");
  const heroSection = document.getElementById("heroRoot") || document.querySelector(".hero");
  const footerScreen = document.querySelector(".footer-screen");
  const footerHugeWord = document.getElementById("footerHugeWord");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const toastBox = document.getElementById("toastBox");

  // -------------------------------------------------------------------------
  // 01. Renk Teması Değiştirici (Varsayılan: Terakota)
  // -------------------------------------------------------------------------
  const themes = ["terracotta", "warm", "clean", "mint", "dark"];
  const themeNames = {
    terracotta: "TERAKOTA",
    warm: "BEYAZ STÜDYO",
    clean: "SICAK KREM",
    mint: "ADAÇAYI YEŞİLİ",
    dark: "KOYU STÜDYO"
  };
  let themeIndex = 0;

  themeToggleBtn?.addEventListener("click", () => {
    themeIndex = (themeIndex + 1) % themes.length;
    const t = themes[themeIndex];
    document.body.setAttribute("data-theme", t);
    showToast(`Tema: ${themeNames[t]}`);
  });

  // -------------------------------------------------------------------------
  // 02. Hero Görselleri İçin Spencer Gabor Yay Fiziği (Spring Physics)
  // -------------------------------------------------------------------------
  function createSpring(stiffness = 0.05, damping = 0.8) {
    const velocity = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };

    function update(dt = 1) {
      for (const axis of ["x", "y"]) {
        let force = target[axis] - current[axis];
        force *= stiffness;
        force *= dt;
        velocity[axis] *= damping;
        velocity[axis] += force;
        current[axis] += velocity[axis];
        current[axis] = Math.round(current[axis] * 100) / 100;
      }
    }

    return { current, target, velocity, update };
  }

  if (heroSection && heroStickers) {
    const cards = Array.from(heroStickers.querySelectorAll(".hero__image"));

    const items = cards.map(() => ({
      x: 0,
      y: 0,
      velocity: { x: 0, y: 0 },
      spring: createSpring(0.05, 0.8)
    }));

    function updateCardPositions() {
      items.forEach((r, idx) => {
        const el = cards[idx];
        const rect = el.getBoundingClientRect();
        r.x = rect.left + rect.width * 0.5;
        r.y = rect.top + window.scrollY + rect.height * 0.5;
      });
    }

    updateCardPositions();
    window.addEventListener("resize", updateCardPositions);

    let pointerX = 0;
    let pointerY = 0;
    let movementX = 0;
    let movementY = 0;
    let lastPointerX = null;
    let lastPointerY = null;

    window.addEventListener("pointermove", (e) => {
      pointerX = e.clientX;
      pointerY = e.clientY;
      if (lastPointerX !== null && lastPointerY !== null) {
        movementX += e.clientX - lastPointerX;
        movementY += e.clientY - lastPointerY;
      }
      lastPointerX = e.clientX;
      lastPointerY = e.clientY;
    });

    function tickHeroPhysics() {
      items.forEach((r, idx) => {
        r.velocity.x *= 0.9;
        r.velocity.y *= 0.9;
        r.spring.current.x += r.velocity.x;
        r.spring.current.y += r.velocity.y;
        r.spring.update(1);

        if (lastPointerX !== null) {
          const u = ((pointerX - r.x) / window.innerWidth) * 2;
          const o = ((pointerY + window.scrollY - r.y) / window.innerHeight) * 2;
          const b = Math.sqrt(u * u + o * o);
          const k = Math.pow(Math.max(0, 1 - b), 6) * 0.4;
          r.velocity.x += movementX * k;
          r.velocity.y += movementY * k;
        }

        const el = cards[idx];
        el.style.setProperty("--offsetX", r.spring.current.x);
        el.style.setProperty("--offsetY", r.spring.current.y);
        el.style.setProperty("--velocity", r.spring.velocity.x - r.spring.velocity.y);
      });

      movementX = 0;
      movementY = 0;
      requestAnimationFrame(tickHeroPhysics);
    }

    tickHeroPhysics();

    cards.forEach(card => {
      card.addEventListener("click", () => {
        const targetId = card.getAttribute("data-target");
        if (targetId) {
          const el = document.getElementById(targetId);
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      });
    });
  }

  // -------------------------------------------------------------------------
  // 03. Kaydırma ile Görünme Animasyonları (Scroll Reveal)
  // -------------------------------------------------------------------------
  const revealElements = document.querySelectorAll(".scroll-reveal");
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        }
      });
    }, {
      rootMargin: "0px 0px -40px 0px",
      threshold: 0.08
    });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add("is-revealed"));
  }

  // -------------------------------------------------------------------------
  // 04. Alt İletişim Başlığı Esneme Animasyonu
  // -------------------------------------------------------------------------
  if (footerScreen && footerHugeWord) {
    window.addEventListener("scroll", () => {
      const rect = footerScreen.getBoundingClientRect();
      const windowH = window.innerHeight;
      if (rect.top < windowH) {
        const visibleH = windowH - rect.top;
        const progress = Math.min(1.05, Math.max(0.4, visibleH / (windowH * 0.72)));
        footerHugeWord.style.transform = `scaleY(${progress})`;
      }
    }, { passive: true });
  }

  // -------------------------------------------------------------------------
  // 05. E-Posta Kopyalama
  // -------------------------------------------------------------------------
  document.querySelectorAll(".js-copy-email").forEach(el => {
    el.addEventListener("click", (e) => {
      e.preventDefault();
      const email = "hasretkayar0@gmail.com";
      navigator.clipboard.writeText(email).then(() => {
        showToast("E-posta kopyalandı: hasretkayar0@gmail.com");
      }).catch(() => {
        window.location.href = `mailto:${email}`;
      });
    });
  });

  function showToast(msg) {
    if (!toastBox) return;
    toastBox.textContent = msg;
    toastBox.classList.add("show");
    setTimeout(() => {
      toastBox.classList.remove("show");
    }, 2400);
  }
});
