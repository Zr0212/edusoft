/**
 * Platform Slider Module - EduSoft
 * Integrated Platform V2 Wheel Slider (with scroll-lock index control)
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

        if (!slides.length || !mainTrack) return;

        let currentIndex = 0;
        const totalSlides = slides.length;

        // Step cooldown so 1 flick = 1 slide (prevents skipping slides)
        let lastStepTime = 0;
        const STEP_COOLDOWN = 320; // ms

        // Timestamp when the final card item (Slide 4) is 100% fully animated & visible in view
        let slide4FullyVisibleAt = 0;

        // Flag to allow programmatic smooth scrolling to anchors below this section (e.g. #newsletter-section)
        let isNavigatingToAnchor = false;
        let navigationTimer = null;

        /**
         * Calculates the ideal scroll position to center the visual content (header + card + dots)
         * vertically in the viewport across all screen sizes (laptops, smaller resolutions, large displays).
         */
        function getTargetY() {
            const currentY = window.pageYOffset || document.documentElement.scrollTop;
            const headerEl = section.querySelector('.integrated-v2-header');
            const paginationEl = section.querySelector('.integrated-v2-pagination') || section;

            const headerRect = headerEl ? headerEl.getBoundingClientRect() : section.getBoundingClientRect();
            const paginationRect = paginationEl.getBoundingClientRect();

            const contentTopInDoc = currentY + headerRect.top;
            const contentBottomInDoc = currentY + paginationRect.bottom;
            const contentHeight = Math.max(150, contentBottomInDoc - contentTopInDoc);
            const windowHeight = window.innerHeight;

            // Clearance for floating capsule header (~80px height)
            const minHeaderClearance = 85;

            // Calculate vertical center offset: (windowHeight - contentHeight) / 2
            let topOffset = (windowHeight - contentHeight) / 2;

            if (windowHeight >= contentHeight + minHeaderClearance * 1.5) {
                // Generous vertical room: center visual block cleanly, keeping header below floating nav
                topOffset = Math.max(minHeaderClearance, Math.round(topOffset));
            } else if (windowHeight > contentHeight) {
                // Moderate vertical room: position title just below floating header
                topOffset = Math.max(76, Math.min(topOffset, minHeaderClearance));
            } else {
                // Content is taller than viewport: align header right under floating header
                topOffset = 76;
            }

            return Math.max(0, Math.round(contentTopInDoc - topOffset));
        }

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

            // When arriving at the final card, record timestamp when it will be fully settled & in view
            if (currentIndex === totalSlides - 1) {
                slide4FullyVisibleAt = Date.now() + 550; // 480ms transition duration + 70ms settle buffer
            }

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

        function handleWheel(e) {
            // Only on desktop/laptop
            if (window.innerWidth < 768) return;

            // If user wheels manually, clear any programmatic navigation lock bypass
            if (isNavigatingToAnchor) {
                isNavigatingToAnchor = false;
                if (navigationTimer) clearTimeout(navigationTimer);
            }

            // Ignore horizontal trackpad gestures
            if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;

            // Ignore micro-scrolls
            if (Math.abs(e.deltaY) < 6) return;

            const isScrollingDown = e.deltaY > 0;
            const isScrollingUp = e.deltaY < 0;

            const sRect = section.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            const currentY = window.pageYOffset || document.documentElement.scrollTop;
            const targetY = getTargetY();

            // ==============================================================
            // 1. SCROLLING UP: "KO ĐƯỢC CHẶN SCROLL LÊN"
            // ==============================================================
            if (isScrollingUp) {
                // If on Slide 0, NEVER block! Free native scroll upward!
                if (currentIndex === 0) {
                    return; // DO NOT preventDefault!
                }

                // If on Slide 1, 2, 3, 4: step back to previous slide
                e.preventDefault();
                const now = Date.now();
                if (now - lastStepTime >= STEP_COOLDOWN) {
                    lastStepTime = now;
                    goToSlide(currentIndex - 1);
                }
                return;
            }

            // ==============================================================
            // 2. SCROLLING DOWN: "BẮT INDEX - CHỈ CHO SCROLL XUỐNG SAU KHI CARD ITEM CUỐI ĐÃ HIỆN ĐỦ"
            // ==============================================================
            if (isScrollingDown) {
                // Check if on the LAST card (Slide 4, index 4):
                if (currentIndex >= totalSlides - 1) {
                    // Has the final card finished sliding in and become fully visible in view?
                    if (Date.now() < slide4FullyVisibleAt) {
                        // Still in the process of appearing into view: hold position and absorb trailing flick!
                        e.preventDefault();
                        if (Math.abs(currentY - targetY) > 2) {
                            window.scrollTo(0, targetY);
                        }
                        return;
                    }

                    // Card item cuối đã hiện đủ trong view! Cho phép scroll xuống tự do!
                    return; // DO NOT preventDefault!
                }

                // CHƯA HẾT CARD ITEM (currentIndex < totalSlides - 1):
                // Check if scroll has reached this section:
                const hasReachedSection = (currentY + e.deltaY >= targetY - 20) && (sRect.top < windowHeight * 0.85);
                const isInsideSection = (sRect.top <= 120 && sRect.bottom >= windowHeight * 0.35);

                if (hasReachedSection || isInsideSection) {
                    // CATCH IT! BLOCK SCROLLING DOWN!
                    e.preventDefault();

                    // Lock scroll position to targetY (perfectly centered)
                    if (Math.abs(currentY - targetY) > 2) {
                        window.scrollTo(0, targetY);
                    }

                    // Advance index to next card
                    const now = Date.now();
                    if (now - lastStepTime >= STEP_COOLDOWN) {
                        lastStepTime = now;
                        goToSlide(currentIndex + 1);
                    }
                    return;
                }

                // If above section, allow native scroll to approach the section
                return;
            }
        }

        window.addEventListener('wheel', handleWheel, { passive: false });

        // Scroll listener: guarantees user CANNOT scroll past this section downward before index 4 has fully appeared!
        // NEVER blocks or clamps scrolling up!
        // DOES NOT BLOCK when navigating to an anchor link (e.g. Liên hệ / #newsletter-section)!
        window.addEventListener('scroll', () => {
            if (isNavigatingToAnchor) return;
            if (window.innerWidth < 768) return;
            // Only clamp if index < 4 OR if final card is still sliding into view:
            if (currentIndex < totalSlides - 1 || Date.now() < slide4FullyVisibleAt) {
                const currentY = window.pageYOffset || document.documentElement.scrollTop;
                const targetY = getTargetY();
                if (currentY > targetY + 25) {
                    window.scrollTo(0, targetY);
                }
            }
        }, { passive: true });

        // Handle anchor clicks (e.g. Header "Liên hệ" -> #newsletter-section):
        // Bypasses the slider scroll lock so user smoothly glides straight to the target section!
        function handleAnchorClick(e) {
            const anchor = e.target.closest('a[href*="#"]');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (!href || href === '#' || href.startsWith('javascript:')) return;

            const hashIndex = href.indexOf('#');
            if (hashIndex === -1) return;
            const hash = href.slice(hashIndex);
            if (!hash || hash === '#') return;

            const targetEl = document.querySelector(hash);
            if (!targetEl) return;

            const targetRect = targetEl.getBoundingClientRect();
            const sectionRect = section.getBoundingClientRect();
            const currentY = window.pageYOffset || document.documentElement.scrollTop;
            const targetTopInDoc = currentY + targetRect.top;
            const sectionBottomInDoc = currentY + sectionRect.bottom;

            // If the target element is below integrated-platform-section-v2:
            if (targetTopInDoc > sectionBottomInDoc - 100) {
                isNavigatingToAnchor = true;
                // Pre-advance to the last slide so it doesn't try to clamp afterwards
                goToSlide(totalSlides - 1, true);
                slide4FullyVisibleAt = 0; // immediately marked fully visible

                if (navigationTimer) clearTimeout(navigationTimer);
                navigationTimer = setTimeout(() => {
                    isNavigatingToAnchor = false;
                }, 1800);
            }
        }

        document.addEventListener('click', handleAnchorClick, { capture: true });

        // Also check on page load with hash or hashchange:
        function checkInitialHash() {
            if (!window.location.hash) return;
            const hashTarget = document.querySelector(window.location.hash);
            if (!hashTarget) return;
            const hTop = hashTarget.getBoundingClientRect().top + (window.pageYOffset || document.documentElement.scrollTop);
            const sBottom = section.getBoundingClientRect().bottom + (window.pageYOffset || document.documentElement.scrollTop);
            if (hTop > sBottom - 100) {
                isNavigatingToAnchor = true;
                goToSlide(totalSlides - 1, true);
                slide4FullyVisibleAt = 0;
                setTimeout(() => {
                    isNavigatingToAnchor = false;
                }, 1800);
            }
        }

        checkInitialHash();
        window.addEventListener('hashchange', checkInitialHash);

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
                    goToSlide(currentIndex + 1);
                } else {
                    goToSlide(currentIndex - 1);
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
