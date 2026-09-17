    /* ============================================================
       PEAKEAS | Lenis + GSAP + ScrollTrigger
       ============================================================ */

    gsap.registerPlugin(ScrollTrigger);

    /* ------------------------------------------------------------
       1. LENIS SMOOTH SCROLL
    ------------------------------------------------------------ */
    const lenis = new Lenis({
      smoothWheel: true,
      lerp: 0.05,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    /* ------------------------------------------------------------
       2. NAV LINK LETTER SPLIT (hover animation)
    ------------------------------------------------------------ */
    const navlinks = document.querySelectorAll('.nav-link');

    navlinks.forEach((navlink) => {
      const innerText = navlink.innerText;
      navlink.innerHTML = '';

      const textContainer = document.createElement('div');
      textContainer.classList.add('block');

      for (let letter of innerText) {
        const span = document.createElement('span');
        span.innerText = letter.trim() === '' ? '\xa0' : letter;
        span.classList.add('letter');
        textContainer.appendChild(span);
      }

      navlink.appendChild(textContainer);
      navlink.appendChild(textContainer.cloneNode(true));
    });

    /* ------------------------------------------------------------
       3. SOCIAL ICON ACTIVE STATE
    ------------------------------------------------------------ */
    const socialIcons = document.querySelectorAll('.social > div');

    socialIcons.forEach((icon) => {
      icon.addEventListener('click', function (e) {
        e.preventDefault();
        socialIcons.forEach((el) => el.classList.remove('active'));
        this.classList.add('active');
      });
    });

    /* ------------------------------------------------------------
       4. NAVBAR SCROLL EFFECT
    ------------------------------------------------------------ */
    const navbar = document.querySelector('nav');
    const mobileNavbar = document.querySelector('.mobile-nav');
    const scrollThreshold = 50;

    window.addEventListener('scroll', () => {
      if (window.scrollY > scrollThreshold) {
        if (navbar && !navbar.classList.contains('scrolled')) {
          navbar.classList.add('scrolled');
        }
        if (mobileNavbar && !mobileNavbar.classList.contains('scrolled')) {
          mobileNavbar.classList.add('scrolled');
        }
      } else {
        if (navbar && navbar.classList.contains('scrolled')) {
          navbar.classList.remove('scrolled');
        }
        if (mobileNavbar && mobileNavbar.classList.contains('scrolled')) {
          mobileNavbar.classList.remove('scrolled');
        }
      }
    }, { passive: true });

    /* ------------------------------------------------------------
       5. HERO PIN + DEPTH
    ------------------------------------------------------------ */
    const home = document.querySelector('.home');

    ScrollTrigger.create({
      trigger: home,
      start: 'top top',
      end: () => '+=' + window.innerHeight,
      pin: true,
      pinSpacing: false,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    });

    gsap.to(home, {
      ease: 'none',
      scrollTrigger: {
        trigger: '.about',
        start: 'top bottom',
        end: 'top top',
        scrub: 1,
      },
    });

    /* ------------------------------------------------------------
       6. DIALOGUE ICON ROTATE
    ------------------------------------------------------------ */
    gsap.to('.dl-simbol', {
      rotate: 40,
      repeat: -1,
      yoyo: true,
      duration: 2,
    });

    /* ------------------------------------------------------------
       7. GYM ROOM SLIDER
    ------------------------------------------------------------ */
    (() => {
      "use strict";

      const stage   = document.querySelector(".gym-room__stage");
      const wheel   = document.querySelector(".gym-room__wheel");
      const prevBtn = document.querySelector(".gym-room__btn--prev");
      const nextBtn = document.querySelector(".gym-room__btn--next");
      const cards   = gsap.utils.toArray(".gym-room__card");
      const inners  = cards.map((c) => c.querySelector(".gym-room__card-inner"));

      const COUNT = cards.length;
      if (!COUNT || !stage || !wheel) return;

      const STEP       = 360 / COUNT;
      const CARD_RATIO = 1.34;
      const FADE_ARC   = 92;

      const REDUCED = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const EASE    = REDUCED ? "none" : "power3.out";

      const mod   = (n, m) => ((n % m) + m) % m;
      const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

      let radius     = 600;
      let rotation   = 0;
      let current    = 0;
      let animating  = false;
      let baseAngles = [];

      function layout() {
        const w = stage.clientWidth;
        const h = stage.clientHeight;
        if (!w || !h) return;

        const isMobile = w < 720;

        let cardW, r;

        if (isMobile) {
          cardW = Math.min(w * 0.52, (h * 0.36) / CARD_RATIO);
          r     = w * 0.92;
        } else {
          cardW = Math.min(w * 0.20, (h * 0.38) / CARD_RATIO);
          r     = w * 0.48;
        }

        cardW = clamp(cardW, 110, w * 0.68);
        r     = clamp(r, 220, 2400);

        const cardH = cardW * CARD_RATIO;
        radius = r;

        stage.style.setProperty("--gym-card-w", cardW.toFixed(2) + "px");
        stage.style.setProperty("--gym-card-h", cardH.toFixed(2) + "px");

        wheel.style.top = ((isMobile ? h * 0.40 : h * 0.36) + r).toFixed(2) + "px";
      }

      function place() {
        baseAngles = cards.map((_, i) => i * STEP - 90);

        cards.forEach((card, i) => {
          const rad = (baseAngles[i] * Math.PI) / 180;

          gsap.set(card, {
            xPercent: -50,
            yPercent: -50,
            x: Math.cos(rad) * radius,
            y: Math.sin(rad) * radius,
            rotation: baseAngles[i] + 90,
            force3D: true
          });
        });
      }

      function paint() {
        const rot = Number(gsap.getProperty(wheel, "rotation")) || 0;

        let activeIdx = 0;
        let bestDist  = Infinity;

        for (let i = 0; i < COUNT; i++) {
          const d  = mod(baseAngles[i] + rot + 90 + 180, 360) - 180;
          const ad = Math.abs(d);

          if (ad < bestDist) {
            bestDist  = ad;
            activeIdx = i;
          }

          const t = 1 - Math.min(1, ad / FADE_ARC);

          inners[i].style.transform = "scale(" + (0.78 + 0.22 * t).toFixed(4) + ")";
          inners[i].style.opacity   = (0.12 + 0.88 * Math.pow(t, 1.5)).toFixed(3);
        }

        for (let i = 0; i < COUNT; i++) {
          cards[i].classList.toggle("is-active", i === activeIdx);
        }
      }

      function animateTo(target, duration) {
        animating = true;

        gsap.to(wheel, {
          rotation: target,
          duration: REDUCED ? 0.01 : duration,
          ease: EASE,
          overwrite: true,
          onUpdate: paint,
          onComplete: () => {
            animating = false;

            if (Math.abs(rotation) > 720) {
              const n = mod(rotation, 360);
              rotation = n > 180 ? n - 360 : n;
              gsap.set(wheel, { rotation: rotation });
            }
            paint();
          }
        });
      }

      function goTo(index) {
        if (animating) return;

        index = mod(index, COUNT);
        if (index === current) return;

        let diff = index - current;
        if (diff >  COUNT / 2) diff -= COUNT;
        if (diff < -COUNT / 2) diff += COUNT;

        current   = index;
        rotation -= diff * STEP;

        animateTo(rotation, 0.95);
      }

      const next = () => goTo(current + 1);
      const prev = () => goTo(current - 1);

      nextBtn.addEventListener("click", next);
      prevBtn.addEventListener("click", prev);

      let dragging     = false;
      let pointerId    = null;
      let startX       = 0;
      let startY       = 0;
      let startRot     = 0;
      let degPerPx     = 0.2;
      let movedEnough  = false;
      let downTarget   = null;

      function cancelDrag() {
        dragging = false;
        stage.classList.remove("is-dragging");
        if (pointerId !== null) {
          try { stage.releasePointerCapture(pointerId); } catch (_) {}
          pointerId = null;
        }
      }

      stage.addEventListener("pointerdown", (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        if (e.isPrimary === false) return;

        gsap.killTweensOf(wheel);
        animating = false;
        dragging  = true;
        pointerId = e.pointerId;
        downTarget = e.target;

        startX = e.clientX;
        startY = e.clientY;
        startRot = Number(gsap.getProperty(wheel, "rotation")) || 0;
        rotation = startRot;
        movedEnough = false;

        degPerPx = (180 / Math.PI) / Math.max(radius, 1) * 1.55;

        try { stage.setPointerCapture(e.pointerId); } catch (_) {}
        stage.classList.add("is-dragging");
      });

      stage.addEventListener("pointermove", (e) => {
        if (!dragging || e.pointerId !== pointerId) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (!movedEnough) {
          if (Math.abs(dx) < 5 && Math.abs(dy) < 5) return;

          if (Math.abs(dy) > Math.abs(dx) * 1.2) {
            cancelDrag();
            return;
          }
          movedEnough = true;
        }

        rotation = startRot - dx * degPerPx;
        gsap.set(wheel, { rotation: rotation });
        paint();
      });

      function endDrag(e) {
        if (!dragging) return;

        const wasMoved = movedEnough;
        const tapTarget = downTarget;

        cancelDrag();
        movedEnough = false;

        if (!wasMoved) {
          const card = tapTarget && tapTarget.closest
            ? tapTarget.closest(".gym-room__card")
            : null;

          if (card) {
            const idx = cards.indexOf(card);
            if (idx >= 0) goTo(idx);
          }
          return;
        }

        const live = Number(gsap.getProperty(wheel, "rotation")) || 0;
        const idx  = mod(Math.round(-live / STEP), COUNT);

        let target = -idx * STEP;
        let delta  = mod(target - live + 180, 360) - 180;
        target = live + delta;

        rotation = target;
        current  = idx;

        animateTo(rotation, 0.7);
      }

      stage.addEventListener("pointerup", endDrag);
      stage.addEventListener("pointercancel", endDrag);

      window.addEventListener("keydown", (e) => {
        if (e.key === "ArrowRight") { e.preventDefault(); next(); }
        if (e.key === "ArrowLeft")  { e.preventDefault(); prev(); }
      });

      let resizeRaf = 0;

      function rebuild() {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(() => {
          gsap.killTweensOf(wheel);
          animating = false;
          cancelDrag();

          layout();

          rotation = -current * STEP;
          gsap.set(wheel, { rotation: rotation });

          place();
          paint();
        });
      }

      window.addEventListener("resize", rebuild);
      window.addEventListener("orientationchange", () => setTimeout(rebuild, 250));
      window.addEventListener("load", rebuild);

      layout();

      rotation = -current * STEP;
      gsap.set(wheel, { rotation: rotation });

      place();
      requestAnimationFrame(paint);
    })();

    /* ------------------------------------------------------------
       8. SCROLL REVEAL ANIMATIONS
    ------------------------------------------------------------ */
    // gsap.utils.toArray('.about-right h1, .about-right p').forEach((el) => {
    //   gsap.from(el, {
    //     y: 40,
    //     opacity: 0,
    //     duration: 0.9,
    //     ease: 'power3.out',
    //     scrollTrigger: {
    //       trigger: el,
    //       start: 'top 85%',
    //     },
    //   });
    // });

    // gsap.from('.manager-image', {
    //   clipPath: 'inset(0 100% 0 0)',
    //   duration: 1.4,
    //   ease: 'power4.inOut',
    //   scrollTrigger: {
    //     trigger: '.about',
    //     start: 'top 70%',
    //   },
    // });

    // gsap.from('.manager', {
    //   scale: 1.25,
    //   duration: 1.6,
    //   ease: 'power3.out',
    //   scrollTrigger: {
    //     trigger: '.about',
    //     start: 'top 70%',
    //   },
    // });

    // gsap.from('.dialoge h1', {
    //   y: 60,
    //   opacity: 0,
    //   duration: 1,
    //   ease: 'power4.out',
    //   scrollTrigger: {
    //     trigger: '.dialoge',
    //     start: 'top 75%',
    //   },
    // });

    // gsap.from('.dialoge p, .dialoge .mn, .dialoge .dl-simbol', {
    //   y: 30,
    //   opacity: 0,
    //   duration: 0.8,
    //   ease: 'power3.out',
    //   stagger: 0.12,
    //   scrollTrigger: {
    //     trigger: '.dialoge',
    //     start: 'top 70%',
    //   },
    // });

    // gsap.from('.story-left h1, .story-left .sl-para p, .story-left .facility p', {
    //   y: 40,
    //   opacity: 0,
    //   duration: 0.9,
    //   ease: 'power3.out',
    //   stagger: 0.1,
    //   scrollTrigger: {
    //     trigger: '.story',
    //     start: 'top 70%',
    //   },
    // });

    // gsap.from('.lobby-image', {
    //   clipPath: 'inset(0 0 0 100%)',
    //   duration: 1.4,
    //   ease: 'power4.inOut',
    //   scrollTrigger: {
    //     trigger: '.story',
    //     start: 'top 70%',
    //   },
    // });

    // gsap.from('.gym-li', {
    //   scale: 1.25,
    //   duration: 1.6,
    //   ease: 'power3.out',
    //   scrollTrigger: {
    //     trigger: '.story',
    //     start: 'top 70%',
    //   },
    // });

    // gsap.from('.amenities-title', {
    //   y: 50,
    //   opacity: 0,
    //   duration: 1,
    //   ease: 'power4.out',
    //   scrollTrigger: {
    //     trigger: '.amenities-section',
    //     start: 'top 75%',
    //   },
    // });

    // gsap.from('.amenities-description', {
    //   y: 30,
    //   opacity: 0,
    //   duration: 0.8,
    //   ease: 'power3.out',
    //   scrollTrigger: {
    //     trigger: '.amenities-section',
    //     start: 'top 70%',
    //   },
    // });

    // gsap.from('.amenity-item, .amenity-separator', {
    //   y: 25,
    //   opacity: 0,
    //   duration: 0.6,
    //   ease: 'power3.out',
    //   stagger: 0.04,
    //   scrollTrigger: {
    //     trigger: '.amenities-list',
    //     start: 'top 85%',
    //   },
    // });

    // gsap.from('.site-footer .footer-text p, .site-footer .social-link', {
    //   y: 20,
    //   opacity: 0,
    //   duration: 0.7,
    //   ease: 'power3.out',
    //   stagger: 0.08,
    //   scrollTrigger: {
    //     trigger: '.site-footer',
    //     start: 'top 90%',
    //   },
    // });

    /* ------------------------------------------------------------
       9. REFRESH AFTER LOAD + FONT READY
    ------------------------------------------------------------ */
    // window.addEventListener('load', () => {
    //   ScrollTrigger.refresh();
    // });
    // if (document.fonts && document.fonts.ready) {
    //   document.fonts.ready.then(() => ScrollTrigger.refresh());
    // }
  



    /* ------------------------------------------------------------
       8. HERO SECTION ANIMATION (GSAP + SplitText)
    ------------------------------------------------------------ */
    gsap.registerPlugin(SplitText);

    const initHeroAnimation = () => {
      // Split text for hero headline and paragraph
      const heroTitle = SplitText.create(".hero-content .hero-left h1", {
        type: "words, chars",
        wordsClass: "split-word",
        charsClass: "split-char"
      });

      const heroSubtitle = SplitText.create(".hero-content .hero-left p", {
        type: "words",
        wordsClass: "split-word"
      });

      // Master Hero Timeline
      const heroTl = gsap.timeline({
        defaults: { ease: "power3.out" }
      });

      // 1. Background video smooth zoom & fade in
      heroTl.from(".home .hero-video", {
        scale: 1.15,
        opacity: 0,
        duration: 1.5,
        ease: "power2.out"
      }, 0);

      // 2. Navigation bar & items entrance
      heroTl.from("nav, .mobile-nav", {
        yPercent: -100,
        opacity: 0,
        duration: 1,
        ease: "power3.out"
      }, 0.1);

      heroTl.from(".logo, .section .nav-link > div, .ms-logo, .ms-menu", {
        y: -20,
        opacity: 0,
        stagger: 0.05,
        duration: 0.8,
        ease: "power2.out"
      }, 0.3);

      heroTl.from(" .social", {
        x: 200,
        opacity: 0,
        stagger: 0.05,
        ease: "power3.out"

      })

      // 3. Hero Headline Chars stagger animation
      heroTl.from(heroTitle.chars, {
        yPercent: 120,
        opacity: 0,
        rotateX: -40,
        stagger: 0.02,
        duration: 0.9,
        ease: "back.out(1.5)"
      }, 0.5);

      // 4. Hero Subtitle Words stagger animation
      heroTl.from(heroSubtitle.words, {
        y: 25,
        opacity: 0,
        stagger: 0.03,
        duration: 0.8,
        ease: "power3.out"
      }, 0.8);

      // 5. Hero CTA Button pop in
      heroTl.from(".hero-content .hero-right .hero-btn", {
        y: 40,
        scale: 0.85,
        opacity: 0,
        duration: 1,
        ease: "back.out(1.7)"
      }, 0.9);
    };

    // Initialize once custom fonts are loaded to avoid incorrect splits
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(initHeroAnimation);
    } else {
      window.addEventListener("load", initHeroAnimation);
    }

    /* ------------------------------------------------------------
       10. MOBILE MENU DRAWER TOGGLE
    ------------------------------------------------------------ */
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileDrawer = document.getElementById('mobileDrawer');

    if (mobileMenuBtn && mobileDrawer) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        mobileDrawer.classList.toggle('open');
      });
    }