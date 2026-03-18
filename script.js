const navbar = document.getElementById('navbar')

function openSidebar() {
    navbar.classList.add('show')
}

function closeSidebar() {
    navbar.classList.remove('show')
}

// Fade-in bg-woman until Mission section
const bgWoman = document.getElementById("bg-woman-layer");
const missionSection = document.getElementById("mission");

function updateBgWomanOpacity() {
  if (!bgWoman || !missionSection) return;

  const scrollTop = window.scrollY;

  // This must match your #mission scroll-margin-top
  const missionOffset = 250;

  // Position in the document where mission is missionOffset px from top
  const missionTarget = missionSection.getBoundingClientRect().top + scrollTop - missionOffset;

  // Fade from 0 at page top to 1 by the moment mission reaches that target position
  const progress = Math.min(scrollTop / Math.max(missionTarget, 1), 1);

  bgWoman.style.opacity = progress;
}

window.addEventListener("scroll", updateBgWomanOpacity);
window.addEventListener("load", updateBgWomanOpacity);



// =========================
// Seamless infinite carousel
// =========================

const track = document.querySelector(".carousel-track");
const prevBtn = document.querySelector(".carousel-btn.left");
const nextBtn = document.querySelector(".carousel-btn.right");

const slides = Array.from(track.children);
let isMoving = false;
let ready = false;

// Clone first and last
const firstClone = slides[0].cloneNode(true);
const lastClone = slides[slides.length - 1].cloneNode(true);

firstClone.classList.add("clone");
lastClone.classList.add("clone");

track.appendChild(firstClone);
track.insertBefore(lastClone, slides[0]);

let index = 1;
let slideWidth = 0;

function preloadSlides() {
    const imgs = Array.from(track.querySelectorAll("img"));

    // Force eager loading to avoid blanks on first show
    imgs.forEach((img) => {
        img.loading = "eager";
        img.decoding = "async";
    });

    return Promise.all(
        imgs.map(
            (img) =>
                img.complete && img.naturalWidth
                    ? Promise.resolve()
                    : new Promise((resolve) => {
                          img.onload = resolve;
                          img.onerror = resolve;
                      })
        )
    );
}

function setSlideWidth() {
    const firstSlide = track.querySelector("img");
    if (!firstSlide) return;

    const style = getComputedStyle(track);
    const gap = parseFloat(style.columnGap || style.gap || "0") || 0;
    const width = firstSlide.getBoundingClientRect().width;
    if (!width) return; // wait until images have size

    slideWidth = width + gap;

    // Snap without animation when recalculating
    track.style.transition = "none";
    track.style.transform = `translateX(-${slideWidth * index}px)`;
    // Force reflow so next transition is smooth
    void track.offsetHeight;

    ready = true;
}

// Initial position (first real slide) after images are ready
preloadSlides().then(() => {
    setSlideWidth();
});
window.addEventListener("load", setSlideWidth);

// Move function
function moveToSlide() {
    if (!ready) return;
    if (isMoving) return;
    isMoving = true;
    track.style.transition = "transform 0.5s ease";
    track.style.transform = `translateX(-${slideWidth * index}px)`;
}

// Next
nextBtn.addEventListener("click", () => {
    index++;
    moveToSlide();
});

// Prev
prevBtn.addEventListener("click", () => {
    index--;
    moveToSlide();
});

// Snap instantly when reaching clones
track.addEventListener("transitionend", () => {
    const slidesAll = document.querySelectorAll(".carousel-track img");

    if (slidesAll[index].classList.contains("clone")) {
        track.style.transition = "none";

        if (index === slidesAll.length - 1) {
            index = 1;
        } else if (index === 0) {
            index = slidesAll.length - 2;
        }

        track.style.transform = `translateX(-${slideWidth * index}px)`;
    }

    // Allow next move after snap/transition
    requestAnimationFrame(() => { isMoving = false; });
});

// Recalculate sizes on resize (desktop -> mobile and vice versa)
window.addEventListener("resize", setSlideWidth);


/* ================================
   SECTION APPEAR WITH STAGGER
================================= */

(() => {
  const sections = document.querySelectorAll('section');

  if (!sections.length) return;

  sections.forEach((section, index) => {
    // stagger delay: 120ms per section
    section.style.setProperty(
      '--reveal-delay',
      `${index * 120}ms`
    );
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('section-visible');
          sectionObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: '0px 0px -10% 0px',
    }
  );

  sections.forEach((section) => sectionObserver.observe(section));
})();

/* ===== TEAM CAROUSEL ===== */
(function () {
  const carousel = document.querySelector('.team-carousel');
  if (!carousel) return;

  const track = carousel.querySelector('.team-track');
  const slides = Array.from(carousel.querySelectorAll('.team-slide'));
  const prevBtn = carousel.querySelector('.team-nav.prev');
  const nextBtn = carousel.querySelector('.team-nav.next');

  if (!track || !slides.length || !prevBtn || !nextBtn) return;

  let currentIndex = 0;
  let slidesPerView = getSlidesPerView();

  function getSlidesPerView() {
    if (window.innerWidth >= 1200) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  }

  function getMaxIndex() {
    return Math.max(0, slides.length - slidesPerView);
  }

  function updateCarousel() {
    slidesPerView = getSlidesPerView();

    const maxIndex = getMaxIndex();
    if (currentIndex > maxIndex) {
      currentIndex = maxIndex;
    }

    const slideWidth = slides[0].getBoundingClientRect().width;
    const offset = slideWidth * currentIndex;

    track.style.transform = `translateX(-${offset}px)`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex >= maxIndex;
  }

  prevBtn.addEventListener('click', () => {
    currentIndex = Math.max(0, currentIndex - 1);
    updateCarousel();
  });

  nextBtn.addEventListener('click', () => {
    currentIndex = Math.min(getMaxIndex(), currentIndex + 1);
    updateCarousel();
  });

  window.addEventListener('resize', updateCarousel);

  updateCarousel();
})();