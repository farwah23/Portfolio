const header = document.querySelector('.site-header');
const menuButton = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');
const links = [...document.querySelectorAll('.nav-links a[href^="#"]')];
const sections = [...document.querySelectorAll('main section[id]')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const hoverCapable = window.matchMedia('(hover: hover) and (pointer: fine)');
const mobileViewport = window.matchMedia('(max-width: 720px)');
const tiltTargets = [...document.querySelectorAll('.hero-portrait, .project-card, .contact-form')];
const themeToggle = document.querySelector('.theme-toggle');
const themeToggleStatus = document.querySelector('.theme-toggle-status');
const themeColor = document.querySelector('#theme-color');
const scrollContainer = document.querySelector('[data-scroll-container]');
const anchorLinks = [...document.querySelectorAll('a[href^="#"]')];
let locomotiveScroll;

const updateThemeControl = (theme) => {
  const darkMode = theme === 'dark';
  const actionLabel = darkMode ? 'Switch to day mode' : 'Switch to night mode';
  themeToggle?.setAttribute('aria-pressed', String(darkMode));
  themeToggle?.setAttribute('aria-label', actionLabel);
  themeToggle?.setAttribute('title', actionLabel);
  if (themeToggleStatus) themeToggleStatus.textContent = darkMode ? 'Night mode active' : 'Day mode active';
  if (themeColor) themeColor.setAttribute('content', darkMode ? '#211a1b' : '#efece3');
};

const applyTheme = (theme, persist = false) => {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  updateThemeControl(theme);
  requestAnimationFrame(() => locomotiveScroll?.update());

  if (!persist) return;
  try {
    window.localStorage.setItem('umme-farwa-theme', theme);
  } catch {}
};

const initialTheme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
applyTheme(initialTheme);

themeToggle?.addEventListener('click', () => {
  const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(nextTheme, true);
});

const closeMenu = () => {
  menuButton.setAttribute('aria-expanded', 'false');
  navLinks.classList.remove('open');
  document.body.classList.remove('menu-open');
};

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  navLinks.classList.toggle('open', !isOpen);
  document.body.classList.toggle('menu-open', !isOpen);
});

anchorLinks.forEach((link) => {
  link.addEventListener('click', (event) => {
    const selector = link.getAttribute('href');
    const target = selector === '#top' ? document.body : document.querySelector(selector);
    if (!target) return;

    event.preventDefault();
    closeMenu();

    if (locomotiveScroll) {
      locomotiveScroll.scrollTo(selector === '#top' ? 0 : target, {
        duration: 900,
        offset: selector === '#top' ? 0 : -82,
      });
      return;
    }

    target.scrollIntoView({
      behavior: reducedMotion.matches ? 'auto' : 'smooth',
      block: 'start',
    });
  });
});

const updateHeader = (scrollPosition = window.scrollY) => header.classList.toggle('scrolled', scrollPosition > 24);
updateHeader();
window.addEventListener('scroll', () => updateHeader(), { passive: true });

const revealElements = [...document.querySelectorAll('.reveal')];
let revealObserver;
let portfolioGsapContext;
let tiltAbortController;

const setupSmoothScroll = () => {
  locomotiveScroll?.destroy();
  locomotiveScroll = undefined;
  document.documentElement.classList.remove('has-scroll-smooth');

  if (!scrollContainer || !window.LocomotiveScroll || reducedMotion.matches || mobileViewport.matches) return;

  locomotiveScroll = new window.LocomotiveScroll({
    el: scrollContainer,
    smooth: true,
    lerp: .075,
    multiplier: .9,
    tablet: { smooth: true },
    smartphone: { smooth: false },
  });

  locomotiveScroll.on('scroll', (instance) => {
    updateHeader(instance.scroll.y);
    window.ScrollTrigger?.update();
  });

  if (window.ScrollTrigger) {
    window.gsap?.registerPlugin(window.ScrollTrigger);
    window.ScrollTrigger.scrollerProxy(scrollContainer, {
      scrollTop(value) {
        if (arguments.length) {
          locomotiveScroll?.scrollTo(value, { duration: 0, disableLerp: true });
          return value;
        }
        return locomotiveScroll?.scroll.instance.scroll.y ?? 0;
      },
      getBoundingClientRect() {
        return { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight };
      },
      pinType: getComputedStyle(scrollContainer).transform === 'none' ? 'fixed' : 'transform',
    });
  }
};

const resetRevealElements = () => {
  revealElements.forEach((element) => {
    element.classList.remove('visible');
    element.style.removeProperty('opacity');
    element.style.removeProperty('visibility');
    element.style.removeProperty('transform');
    element.style.removeProperty('transition-delay');
  });
};

const setupFallbackReveals = () => {
  document.body.classList.remove('gsap-ready');

  if (reducedMotion.matches) {
    revealElements.forEach((element) => element.classList.add('visible'));
    return;
  }

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element, index) => {
    element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
    revealObserver.observe(element);
  });
};

const clearTiltEffects = () => {
  tiltAbortController?.abort();
  tiltAbortController = undefined;

  if (window.gsap && tiltTargets.length) {
    window.gsap.set(tiltTargets, { clearProps: 'transform,transformStyle,transformPerspective' });
  }
};

const setup3DTilt = () => {
  clearTiltEffects();
  if (!window.gsap || reducedMotion.matches || !hoverCapable.matches) return;

  tiltAbortController = new AbortController();
  const listenerOptions = { signal: tiltAbortController.signal };

  tiltTargets.forEach((element) => {
    window.gsap.set(element, {
      transformPerspective: 1000,
      transformStyle: 'preserve-3d',
      transformOrigin: 'center',
    });

    element.addEventListener('pointermove', (event) => {
      if (element.classList.contains('reveal') && !element.classList.contains('visible')) return;

      const bounds = element.getBoundingClientRect();
      const horizontal = (event.clientX - bounds.left) / bounds.width - .5;
      const vertical = (event.clientY - bounds.top) / bounds.height - .5;
      const lift = element.classList.contains('project-card') ? -6 : 0;

      window.gsap.to(element, {
        rotationX: vertical * -8,
        rotationY: horizontal * 10,
        y: lift,
        z: 18,
        duration: .35,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    }, listenerOptions);

    element.addEventListener('pointerleave', () => {
      window.gsap.to(element, {
        rotationX: 0,
        rotationY: 0,
        y: 0,
        z: 0,
        duration: .55,
        ease: 'power3.out',
        overwrite: 'auto',
      });
    }, listenerOptions);
  });
};

const setupPortfolioMotion = () => {
  revealObserver?.disconnect();
  clearTiltEffects();
  portfolioGsapContext?.revert();
  resetRevealElements();

  const gsapAvailable = Boolean(window.gsap && window.ScrollTrigger);
  if (!gsapAvailable || reducedMotion.matches) {
    setupFallbackReveals();
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);
  document.body.classList.add('gsap-ready');
  const motionScroller = locomotiveScroll ? scrollContainer : window;

  portfolioGsapContext = window.gsap.context(() => {
    const heroTimeline = window.gsap.timeline({
      defaults: { ease: 'power3.out' },
    });

    heroTimeline
      .from('.site-header', { autoAlpha: 0, y: -22, duration: .65 })
      .fromTo('.hero-copy', {
        autoAlpha: 0,
        y: 50,
        z: -120,
        rotationX: 10,
        rotationY: -7,
        transformPerspective: 1200,
      }, {
        autoAlpha: 1,
        y: 0,
        z: 0,
        rotationX: 0,
        rotationY: 0,
        duration: .95,
        onComplete: () => {
          document.querySelector('.hero-copy')?.classList.add('visible');
          window.gsap.set('.hero-copy', { clearProps: 'opacity,visibility,transform' });
        },
      }, '-=.35')
      .fromTo('.hero-portrait', {
        autoAlpha: 0,
        y: 42,
        z: -150,
        rotationX: -6,
        rotationY: 15,
        transformPerspective: 1200,
      }, {
        autoAlpha: 1,
        y: 0,
        z: 0,
        rotationX: 0,
        rotationY: 0,
        duration: 1,
        onComplete: () => {
          document.querySelector('.hero-portrait')?.classList.add('visible');
          window.gsap.set('.hero-portrait', { clearProps: 'opacity,visibility,transform' });
        },
      }, '-=.78');

    const scrollRevealElements = revealElements.filter((element) => !element.closest('.hero'));
    window.ScrollTrigger.batch(scrollRevealElements, {
      scroller: motionScroller,
      start: 'top 86%',
      once: true,
      onEnter: (batch) => {
        batch.forEach((element) => element.classList.add('visible'));
        window.gsap.fromTo(batch, {
          autoAlpha: 0,
          y: 48,
          z: -90,
          rotationX: 9,
          rotationY: (index) => index % 2 === 0 ? -5 : 5,
          transformPerspective: 1100,
        }, {
          autoAlpha: 1,
          y: 0,
          z: 0,
          rotationX: 0,
          rotationY: 0,
          duration: .82,
          stagger: .1,
          ease: 'power3.out',
          overwrite: true,
          onComplete: () => window.gsap.set(batch, { clearProps: 'opacity,visibility,transform' }),
        });
      },
    });

    const footerElements = document.querySelectorAll('.footer-kicker, .footer-main h2, .contact-link, .footer-bottom');
    window.gsap.fromTo(footerElements, {
      autoAlpha: 0,
      y: 34,
      z: -80,
      rotationX: 8,
      rotationY: (index) => index % 2 === 0 ? -4 : 4,
      transformPerspective: 1100,
    }, {
      autoAlpha: 1,
      y: 0,
      z: 0,
      rotationX: 0,
      rotationY: 0,
      duration: .78,
      stagger: .09,
      ease: 'power3.out',
      onComplete: () => window.gsap.set(footerElements, { clearProps: 'opacity,visibility,transform' }),
      scrollTrigger: {
        trigger: '.footer',
        scroller: motionScroller,
        start: 'top 78%',
        once: true,
      },
    });
  });

  setup3DTilt();
  window.ScrollTrigger.refresh();
  locomotiveScroll?.update();
};

setupSmoothScroll();
setupPortfolioMotion();

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    links.forEach((link) => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-35% 0px -55%', threshold: 0 });

sections.forEach((section) => sectionObserver.observe(section));

const skillTrack = document.querySelector('#skill-track');
const skillCards = [...skillTrack.querySelectorAll('.skill-card')];
let skillClones = [];
let skillLoopWidth = 0;
let skillAnimationPaused = false;
let skillResumeTimer;
let skillAnimationFrame;
let lastSkillFrameTime = performance.now();
let activeSkillPointer = null;
let skillPointerStartX = 0;
let skillPointerStartY = 0;
let skillPointerStartScroll = 0;
let skillDragStarted = false;
const skillHoverCapable = window.matchMedia('(hover: hover)');

const updateSkillLoopWidth = () => {
  skillLoopWidth = skillClones.length
    ? skillClones[0].offsetLeft - skillCards[0].offsetLeft
    : 0;
};

const setupSkillLoop = () => {
  skillClones.forEach((card) => card.remove());
  skillClones = [];
  skillLoopWidth = 0;
  skillTrack.scrollLeft = 0;

  if (reducedMotion.matches) return;

  skillClones = skillCards.map((card) => {
    const clone = card.cloneNode(true);
    clone.classList.remove('reveal', 'visible');
    clone.setAttribute('aria-hidden', 'true');
    skillTrack.append(clone);
    return clone;
  });

  requestAnimationFrame(updateSkillLoopWidth);
};

const scrollSkillsManually = (direction) => {
  const gap = Number.parseFloat(getComputedStyle(skillTrack).columnGap) || 0;
  const distance = skillCards[0].getBoundingClientRect().width + gap;
  skillTrack.scrollBy({
    left: direction * distance,
    behavior: reducedMotion.matches ? 'auto' : 'smooth',
  });
};

const animateSkills = (currentTime) => {
  const elapsed = Math.min(currentTime - lastSkillFrameTime, 50);
  lastSkillFrameTime = currentTime;

  if (!skillAnimationPaused && !reducedMotion.matches && skillLoopWidth > 0 && !document.hidden) {
    skillTrack.scrollLeft += elapsed * 0.025;
    if (skillTrack.scrollLeft >= skillLoopWidth) {
      skillTrack.scrollLeft -= skillLoopWidth;
    }
  }

  skillAnimationFrame = requestAnimationFrame(animateSkills);
};

const pauseSkillAnimation = () => {
  clearTimeout(skillResumeTimer);
  skillAnimationPaused = true;
};

const resumeSkillAnimation = (delay = 0) => {
  clearTimeout(skillResumeTimer);
  skillResumeTimer = setTimeout(() => {
    const pointerIsActive = activeSkillPointer !== null;
    const sliderHasFocus = skillTrack.matches(':focus-within');
    const pointerIsHovering = skillHoverCapable.matches && skillTrack.matches(':hover');
    if (!pointerIsActive && !sliderHasFocus && !pointerIsHovering) {
      skillAnimationPaused = false;
    }
  }, delay);
};

const normalizeSkillScroll = (position) => {
  if (skillLoopWidth <= 0) return Math.max(0, position);
  return ((position % skillLoopWidth) + skillLoopWidth) % skillLoopWidth;
};

const startSkillDrag = (event) => {
  if (event.pointerType === 'mouse' && event.button !== 0) return;

  pauseSkillAnimation();
  activeSkillPointer = event.pointerId;
  skillPointerStartX = event.clientX;
  skillPointerStartY = event.clientY;
  skillPointerStartScroll = skillTrack.scrollLeft;
  skillDragStarted = false;
  skillTrack.classList.add('is-dragging');
  skillTrack.setPointerCapture(event.pointerId);

  if (event.pointerType === 'mouse') event.preventDefault();
};

const moveSkillDrag = (event) => {
  if (event.pointerId !== activeSkillPointer) return;

  const distanceX = event.clientX - skillPointerStartX;
  const distanceY = event.clientY - skillPointerStartY;

  if (!skillDragStarted) {
    if (Math.abs(distanceX) < 5 && Math.abs(distanceY) < 5) return;
    if (Math.abs(distanceY) > Math.abs(distanceX)) return;
    skillDragStarted = true;
  }

  event.preventDefault();
  skillTrack.scrollLeft = normalizeSkillScroll(skillPointerStartScroll - distanceX);
};

const finishSkillDrag = (event) => {
  if (event.pointerId !== activeSkillPointer) return;

  if (skillTrack.hasPointerCapture(event.pointerId)) {
    skillTrack.releasePointerCapture(event.pointerId);
  }
  activeSkillPointer = null;
  skillDragStarted = false;
  skillTrack.classList.remove('is-dragging');
  resumeSkillAnimation(1200);
};

skillTrack.addEventListener('keydown', (event) => {
  if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
  event.preventDefault();
  scrollSkillsManually(event.key === 'ArrowRight' ? 1 : -1);
});
skillTrack.addEventListener('mouseenter', pauseSkillAnimation);
skillTrack.addEventListener('mouseleave', () => resumeSkillAnimation());
skillTrack.addEventListener('focusin', pauseSkillAnimation);
skillTrack.addEventListener('focusout', () => resumeSkillAnimation());
skillTrack.addEventListener('pointerdown', startSkillDrag);
skillTrack.addEventListener('pointermove', moveSkillDrag);
skillTrack.addEventListener('pointerup', finishSkillDrag);
skillTrack.addEventListener('pointercancel', finishSkillDrag);
skillTrack.addEventListener('wheel', () => {
  pauseSkillAnimation();
  resumeSkillAnimation(1800);
}, { passive: true });
window.addEventListener('resize', updateSkillLoopWidth);
window.addEventListener('resize', () => locomotiveScroll?.update());
window.addEventListener('load', () => locomotiveScroll?.update(), { once: true });
reducedMotion.addEventListener('change', () => {
  setupSmoothScroll();
  setupSkillLoop();
  setupPortfolioMotion();
});
mobileViewport.addEventListener('change', () => {
  setupSmoothScroll();
  setupPortfolioMotion();
});

setupSkillLoop();
requestAnimationFrame(() => locomotiveScroll?.update());
cancelAnimationFrame(skillAnimationFrame);
skillAnimationFrame = requestAnimationFrame(animateSkills);

const form = document.querySelector('#contact-form');
const formNote = document.querySelector('#form-note');

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const data = new FormData(form);
  const preparedMessage = `Portfolio enquiry from ${data.get('name')} (${data.get('email')}):\n\n${data.get('message')}`;
  formNote.hidden = false;
  try {
    await navigator.clipboard.writeText(preparedMessage);
    formNote.textContent = 'Message copied. Paste it into your email or preferred messaging app.';
  } catch {
    formNote.textContent = 'Your message is ready. Copy it from the message field and send it through your preferred contact channel.';
  }
  formNote.classList.add('success');
});

const yearElement = document.querySelector('#year');
if (yearElement) yearElement.textContent = new Date().getFullYear();

window.addEventListener('beforeunload', () => locomotiveScroll?.destroy());
