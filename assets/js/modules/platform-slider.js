/**
 * Platform Slider Module - EduSoft
 * Integrated Platform V2 Cards Slider (Left/Right Nav, Dots, Click & Touch Swipe)
 * and Integrated Platform Flip Carousel.
 */
(function initPlatformSliderModule() {
    /* ================= INTEGRATED PLATFORM V2 CARDS SLIDER ================= */
    (function initIntegratedV2Slider() {
        const section = document.getElementById('integrated-platform-section-v2');
        if (!section) return;

        const mainTrack = document.getElementById('v2MainTrack');
        const slides = section.querySelectorAll('.integrated-v2-slide');
        const dots = section.querySelectorAll('.v2-dot');
        const prevBtn = document.getElementById('v2PrevBtn');
        const nextBtn = document.getElementById('v2NextBtn');

        if (!slides.length || !mainTrack) return;

        let currentIndex = 0;
        const totalSlides = slides.length;

        function updateTrackPosition() {
            if (!slides.length || !mainTrack) return;
            const currentSlide = slides[currentIndex];
            if (!currentSlide) return;

            const sliderViewport = section.querySelector('.integrated-v2-slider-viewport') || mainTrack.parentElement;
            const viewportWidth = sliderViewport ? sliderViewport.offsetWidth : window.innerWidth;
            const slideWidth = currentSlide.offsetWidth;
            const trackStyle = window.getComputedStyle(mainTrack);
            const gap = parseFloat(trackStyle.gap) || parseFloat(trackStyle.getPropertyValue('--slide-gap')) || 36;

            const centerOffset = (viewportWidth - slideWidth) / 2;
            const translateX = centerOffset - currentIndex * (slideWidth + gap);

            mainTrack.style.transform = `translateX(${translateX}px)`;
        }

        function goToSlide(index, force) {
            if (index < 0) index = 0;
            if (index >= totalSlides) index = totalSlides - 1;
            if (index === currentIndex && !force) return;

            currentIndex = index;

            slides.forEach((slide, i) => {
                if (i === currentIndex) {
                    slide.classList.add('active');
                } else {
                    slide.classList.remove('active');
                }
            });

            dots.forEach((dot, i) => {
                if (i === currentIndex) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });

            updateTrackPosition();
        }

        // Previous button click
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentIndex > 0 ? currentIndex - 1 : totalSlides - 1);
            });
        }

        // Next button click
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                goToSlide(currentIndex < totalSlides - 1 ? currentIndex + 1 : 0);
            });
        }

        // Keyboard arrow navigation
        section.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                goToSlide(currentIndex > 0 ? currentIndex - 1 : totalSlides - 1);
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                goToSlide(currentIndex < totalSlides - 1 ? currentIndex + 1 : 0);
            }
        });

        // Touch swipe support for mobile/tablets
        let touchStartX = 0;
        let touchStartY = 0;

        section.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                touchStartX = e.touches[0].clientX;
                touchStartY = e.touches[0].clientY;
            }
        }, { passive: true });

        section.addEventListener('touchend', (e) => {
            if (!touchStartX) return;
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const diffX = touchEndX - touchStartX;
            const diffY = touchEndY - touchStartY;

            if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 40) {
                if (diffX < 0) {
                    goToSlide(currentIndex < totalSlides - 1 ? currentIndex + 1 : 0);
                } else {
                    goToSlide(currentIndex > 0 ? currentIndex - 1 : totalSlides - 1);
                }
            }
            touchStartX = 0;
            touchStartY = 0;
        }, { passive: true });

        // Dots click navigation
        dots.forEach((dot, i) => {
            dot.addEventListener('click', () => {
                goToSlide(i);
            });
        });

        // Clicking inactive peeking slides
        slides.forEach((slide, i) => {
            slide.addEventListener('click', (e) => {
                if (i !== currentIndex) {
                    e.preventDefault();
                    goToSlide(i);
                }
            });
        });

        // Window resize
        window.addEventListener('resize', updateTrackPosition);

        // Initialize at slide 0
        goToSlide(0, true);
    })();

    /* ================= INTEGRATED PLATFORM FLIP CAROUSEL ================= */
    (function initIntegratedFlipCarousel() {
        const carousel = document.getElementById('integratedCarousel');
        const mainSlot = document.getElementById('integratedMainSlot');
        const thumbsRow = document.getElementById('integratedThumbsRow');

        if (!carousel || !mainSlot || !thumbsRow) return;

        let isAnimating = false;
        let autoPlayTimer = null;
        const AUTO_HOLD_DURATION = 5500; // 5.5s interval (gives users comfortable time to read content)

        function getCards() {
            const mainCard = mainSlot.querySelector('.integrated-card');
            const thumbCards = Array.from(thumbsRow.querySelectorAll('.integrated-card'));
            return { mainCard, thumbCards };
        }

        function switchCard(targetThumbCard) {
            if (isAnimating) return;
            const { mainCard, thumbCards } = getCards();
            if (!targetThumbCard || !thumbCards.includes(targetThumbCard)) return;

            isAnimating = true;

            const allCards = [mainCard, ...thumbCards];

            // 1. FIRST: Get bounding client rects of all cards
            const firstRects = new Map();
            allCards.forEach(card => {
                firstRects.set(card, card.getBoundingClientRect());
            });

            // 2. LAST: Move DOM nodes & update state classes
            // Move target thumbnail up to main slot
            mainSlot.appendChild(targetThumbCard);
            targetThumbCard.classList.add('is-main');
            targetThumbCard.classList.remove('is-thumb');

            // Move former main card down to thumbnail row at the END
            thumbsRow.appendChild(mainCard);
            mainCard.classList.remove('is-main');
            mainCard.classList.add('is-thumb');

            // Force layout recalculation & measure new bounding client rects
            const lastRects = new Map();
            allCards.forEach(card => {
                lastRects.set(card, card.getBoundingClientRect());
            });

            // 3. INVERT: Calculate delta & scale, apply transform instantly without transition
            allCards.forEach(card => {
                const first = firstRects.get(card);
                const last = lastRects.get(card);
                if (!first || !last) return;

                const deltaX = first.left - last.left;
                const deltaY = first.top - last.top;
                const scaleX = first.width / last.width;
                const scaleY = first.height / last.height;

                card.style.transition = 'none';
                card.style.transformOrigin = 'top left';
                card.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})`;
                card.style.zIndex = (card === targetThumbCard || card === mainCard) ? '10' : '2';
            });

            // 4. PLAY: Animate to transform: none using cubic-bezier(0.22, 1, 0.36, 1) over 850ms
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    allCards.forEach(card => {
                        card.style.transition = 'transform 850ms cubic-bezier(0.22, 1, 0.36, 1), box-shadow 850ms cubic-bezier(0.22, 1, 0.36, 1), background 850ms ease, border-color 850ms ease';
                        card.style.transform = 'translate(0px, 0px) scale(1, 1)';
                    });

                    setTimeout(() => {
                        allCards.forEach(card => {
                            card.style.transition = '';
                            card.style.transform = '';
                            card.style.transformOrigin = '';
                            card.style.zIndex = '';
                        });
                        isAnimating = false;
                    }, 860);
                });
            });
        }

        // Thumbnail click handler
        thumbsRow.addEventListener('click', (e) => {
            const clickedCard = e.target.closest('.integrated-card');
            if (clickedCard && thumbsRow.contains(clickedCard)) {
                switchCard(clickedCard);
                resetAutoPlay();
            }
        });

        // AutoPlay cycle
        function startAutoPlay() {
            stopAutoPlay();
            autoPlayTimer = setInterval(() => {
                const { thumbCards } = getCards();
                if (thumbCards.length > 0) {
                    switchCard(thumbCards[0]);
                }
            }, AUTO_HOLD_DURATION);
        }

        function stopAutoPlay() {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
                autoPlayTimer = null;
            }
        }

        function resetAutoPlay() {
            stopAutoPlay();
            startAutoPlay();
        }

        // Pause auto-play on hover & background tabs
        carousel.addEventListener('mouseenter', stopAutoPlay);
        carousel.addEventListener('mouseleave', startAutoPlay);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAutoPlay();
            else startAutoPlay();
        });

        // Start auto play
        startAutoPlay();
    })();


})();
