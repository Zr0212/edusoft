/**
 * LMS Slider Module - EduSoft
 * LMS Stream 3D Carousel and LMS Section V2 Slider with drag/touch swipe.
 */
(function initLmsSliderModule() {
    function initStreamCarousel() {
    const lmsViewport = document.getElementById('lmsStreamViewport');
    const lmsContainer = document.getElementById('lmsStreamContainer');
    const lmsPrevBtn = document.getElementById('lmsPrevBtn');
    const lmsNextBtn = document.getElementById('lmsNextBtn');

    if (lmsViewport && lmsContainer) {
        const lmsCards = Array.from(lmsContainer.querySelectorAll('.lms-card'));
        const totalCards = lmsCards.length;
        let activeIndex = 0;
        let autoPlayTimer = null;
        const AUTO_PLAY_INTERVAL = 3000; // 3.0s interval (0.9s ease slide + 2.1s hold pause)

        let xSpacing = 330;
        let ySpacing = 90;

        function updateSlotSpacing() {
            const w = lmsViewport.clientWidth;
            if (w < 768) {
                xSpacing = Math.min(w * 0.41, 295);
                ySpacing = Math.round(xSpacing * 0.16);
            } else if (w < 1100) {
                xSpacing = Math.min(w * 0.39, 400);
                ySpacing = Math.round(xSpacing * 0.16);
            } else {
                // Shifted outward by ~10% (~475px spacing span)
                xSpacing = Math.min(w * 0.40, 475);
                ySpacing = Math.round(xSpacing * 0.16);
            }
        }

        function getSlotConfig(slotOffset) {
            const w = lmsViewport.clientWidth;
            const isMobile = w < 768;

            // Relative diagonal slots along Top-Right (x>0, y<0) to Bottom-Left (x<0, y>0)
            switch(slotOffset) {
                case 2:  // farRight (Top-Right offscreen)
                    return { x: xSpacing * 2.0, y: -ySpacing * 2.0, scale: 0.45, opacity: 0, zIndex: 1 };
                case 1:  // right (Shifted 10% outward)
                    return { 
                        x: isMobile ? xSpacing * 1.3 : xSpacing * 1.05, 
                        y: isMobile ? -ySpacing * 0.55 : -ySpacing * 0.65, 
                        scale: isMobile ? 0.64 : 0.78, 
                        opacity: isMobile ? 0.4 : 0.95, 
                        zIndex: 10 
                    };
                case 0:  // center (Active focal slot)
                    return { x: 0, y: 0, scale: 1.0, opacity: 1, zIndex: 50 };
                case -1: // left (Shifted 10% outward)
                    return { 
                        x: isMobile ? -xSpacing * 1.3 : -xSpacing * 1.05, 
                        y: isMobile ? ySpacing * 0.55 : ySpacing * 0.65, 
                        scale: isMobile ? 0.64 : 0.78, 
                        opacity: isMobile ? 0.4 : 0.95, 
                        zIndex: 10 
                    };
                case -2: // farLeft (Bottom-Left offscreen)
                    return { x: -xSpacing * 2.0, y: ySpacing * 2.0, scale: 0.45, opacity: 0, zIndex: 1 };
                default:
                    return { x: 0, y: 0, scale: 0.45, opacity: 0, zIndex: 0 };
            }
        }

        function renderCarousel(isInitial = false) {
            updateSlotSpacing();

            lmsCards.forEach((card, i) => {
                let diff = (i - activeIndex) % totalCards;
                if (diff < -2) diff += totalCards;
                if (diff > 2) diff -= totalCards;

                const slotOffset = diff; // -2, -1, 0, 1, 2
                const config = getSlotConfig(slotOffset);

                const prevOffset = card.dataset.slotOffset !== undefined ? parseInt(card.dataset.slotOffset) : slotOffset;

                // Teleport silently if wrapping between farLeft (-2) and farRight (2)
                if (!isInitial && Math.abs(slotOffset - prevOffset) > 2) {
                    card.style.transition = 'none';
                    card.style.transform = `translate3d(${config.x.toFixed(1)}px, ${config.y.toFixed(1)}px, 0px) scale(${config.scale})`;
                    card.style.opacity = config.opacity;
                    card.style.zIndex = config.zIndex;
                    
                    // Force DOM reflow to apply instant teleport before re-enabling transition
                    void card.offsetHeight;
                    card.style.transition = '';
                } else {
                    card.style.transform = `translate3d(${config.x.toFixed(1)}px, ${config.y.toFixed(1)}px, 0px) scale(${config.scale})`;
                    card.style.opacity = config.opacity;
                    card.style.zIndex = config.zIndex;
                }

                card.dataset.slotOffset = slotOffset;

                if (slotOffset === 0) {
                    card.classList.add('is-featured');
                    card.classList.remove('is-left', 'is-right');
                } else if (slotOffset === -1) {
                    card.classList.add('is-left');
                    card.classList.remove('is-featured', 'is-right');
                } else if (slotOffset === 1) {
                    card.classList.add('is-right');
                    card.classList.remove('is-featured', 'is-left');
                } else {
                    card.classList.remove('is-featured', 'is-left', 'is-right');
                }
            });
        }

        function nextStep() {
            activeIndex = (activeIndex + 1) % totalCards;
            renderCarousel();
        }

        function prevStep() {
            activeIndex = (activeIndex - 1 + totalCards) % totalCards;
            renderCarousel();
        }

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayTimer = setInterval(nextStep, AUTO_PLAY_INTERVAL);
        }

        function stopAutoPlay() {
            if (autoPlayTimer) {
                clearInterval(autoPlayTimer);
                autoPlayTimer = null;
            }
        }

        // Event listeners
        if (lmsNextBtn) {
            lmsNextBtn.addEventListener('click', () => {
                nextStep();
                startAutoPlay();
            });
        }
        if (lmsPrevBtn) {
            lmsPrevBtn.addEventListener('click', () => {
                prevStep();
                startAutoPlay();
            });
        }

        // Allow clicking side cards to focus them
        lmsCards.forEach((card, i) => {
            card.addEventListener('click', (e) => {
                const offset = card.dataset.slotOffset ? parseInt(card.dataset.slotOffset) : 0;
                if (offset === 1) {
                    nextStep();
                    startAutoPlay();
                } else if (offset === -1) {
                    prevStep();
                    startAutoPlay();
                }
            });
        });

        // Pause on hover & background tabs
        lmsViewport.addEventListener('mouseenter', stopAutoPlay);
        lmsViewport.addEventListener('mouseleave', startAutoPlay);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAutoPlay();
            else startAutoPlay();
        });

        window.addEventListener('resize', () => renderCarousel(true), { passive: true });

        // Initial setup
        renderCarousel(true);
        startAutoPlay();
    }


    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initStreamCarousel);
    } else {
        initStreamCarousel();
    }
    /* ===== LMS SECTION V2 SLIDER ===== */
    (function initLmsV2Slider() {
        const section = document.getElementById('lms-section-v2');
        if (!section) return;

        const track = document.getElementById('lmsV2Track');
        const slides = section.querySelectorAll('.lms-v2-slide');
        const dots = section.querySelectorAll('.lms-v2-dot');
        const stepNav = document.getElementById('lmsV2StepNav');
        const stepBtns = stepNav ? stepNav.querySelectorAll('.lms-v2-step-btn') : [];
        const stepDividers = stepNav ? stepNav.querySelectorAll('.lms-v2-step-divider') : [];
        const prevBtn = document.getElementById('lmsV2PrevBtn');
        const nextBtn = document.getElementById('lmsV2NextBtn');
        const dotsContainer = document.getElementById('lmsV2Dots');

        if (!slides.length || !track) return;

        let currentIndex = 0;
        const totalSlides = slides.length;
        let autoPlayTimer = null;
        const AUTO_PLAY_INTERVAL = 6000;

        function updateStepNav(index) {
            stepBtns.forEach((btn, idx) => {
                btn.classList.toggle('active', idx === index);
            });
            stepDividers.forEach((div, idx) => {
                div.classList.toggle('active', index < (totalSlides - 1) && idx === index);
            });
        }

        function goToSlide(index) {
            const targetIndex = (index + totalSlides) % totalSlides;
            currentIndex = targetIndex;

            // Slide entire cluster track horizontally as ONE unit (just like integrated-platform-section-v2)
            track.style.transition = 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)';
            track.style.transform = `translateX(-${currentIndex * 100}%)`;

            // Switch Slides Active Class
            slides.forEach((slide, idx) => {
                slide.classList.toggle('active', idx === currentIndex);
            });

            // Dots update
            dots.forEach((dot, idx) => {
                dot.classList.toggle('active', idx === currentIndex);
            });

            // Step Nav update
            updateStepNav(currentIndex);
        }

        if (stepNav) {
            stepNav.addEventListener('click', (e) => {
                const btn = e.target.closest('.lms-v2-step-btn');
                if (btn) {
                    const idx = parseInt(btn.getAttribute('data-index'), 10);
                    if (!isNaN(idx)) {
                        goToSlide(idx);
                        resetAutoPlay();
                    }
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                goToSlide(currentIndex - 1);
                resetAutoPlay();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                goToSlide(currentIndex + 1);
                resetAutoPlay();
            });
        }

        if (dotsContainer) {
            dotsContainer.addEventListener('click', (e) => {
                const dot = e.target.closest('.lms-v2-dot');
                if (dot) {
                    const idx = parseInt(dot.getAttribute('data-index'), 10);
                    if (!isNaN(idx)) {
                        goToSlide(idx);
                        resetAutoPlay();
                    }
                }
            });
        }

        // ===== MOUSE DRAG & TOUCH SWIPE SUPPORT =====
        let isDragging = false;
        let isPointerDown = false;
        let startX = 0;
        let startY = 0;
        let currentTranslate = 0;
        let prevTranslate = 0;
        let dragDistance = 0;
        let hasMoved = false;

        const viewport = section.querySelector('.lms-v2-slider-viewport');
        if (viewport) {
            function getPositionX(e) {
                return e.type.includes('mouse') ? e.pageX : (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
            }

            function getPositionY(e) {
                return e.type.includes('mouse') ? e.pageY : (e.touches && e.touches[0] ? e.touches[0].clientY : 0);
            }

            function dragStart(e) {
                if (e.type === 'mousedown' && e.button !== 0) return;

                isPointerDown = true;
                hasMoved = false;
                dragDistance = 0;
                startX = getPositionX(e);
                startY = getPositionY(e);
                
                const width = viewport.offsetWidth || 1;
                prevTranslate = -currentIndex * width;
                currentTranslate = prevTranslate;

                stopAutoPlay();
            }

            function dragMove(e) {
                if (!isPointerDown) return;

                const currentX = getPositionX(e);
                const currentY = getPositionY(e);
                const diffX = currentX - startX;
                const diffY = currentY - startY;

                // For touch: if user is scrolling vertically more than horizontally, cancel horizontal drag
                if (!isDragging && e.type.includes('touch')) {
                    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 8) {
                        isPointerDown = false;
                        return;
                    }
                }

                dragDistance = diffX;

                // Activate dragging state once moved past threshold (6px)
                if (Math.abs(dragDistance) > 6) {
                    if (!isDragging) {
                        isDragging = true;
                        viewport.classList.add('is-dragging');
                        track.style.transition = 'none';
                    }
                    hasMoved = true;
                    if (e.cancelable && e.type.includes('touch')) {
                        e.preventDefault();
                    }

                    // Calculate live position with boundary resistance
                    let targetX = prevTranslate + dragDistance;
                    const maxTranslate = 0;
                    const minTranslate = -(totalSlides - 1) * viewport.offsetWidth;

                    // Rubber-band resistance at track ends
                    if (targetX > maxTranslate) {
                        targetX = maxTranslate + (targetX - maxTranslate) * 0.3;
                    } else if (targetX < minTranslate) {
                        targetX = minTranslate + (targetX - minTranslate) * 0.3;
                    }

                    currentTranslate = targetX;
                    track.style.transform = `translateX(${currentTranslate}px)`;
                }
            }

            function dragEnd() {
                if (!isPointerDown) return;
                isPointerDown = false;

                if (isDragging) {
                    isDragging = false;
                    viewport.classList.remove('is-dragging');
                    track.style.transition = 'transform 0.55s cubic-bezier(0.25, 1, 0.5, 1)';

                    const threshold = 55; // pixels to trigger slide change
                    if (dragDistance < -threshold) {
                        // Dragged left -> Next slide
                        if (currentIndex < totalSlides - 1) {
                            goToSlide(currentIndex + 1);
                        } else {
                            goToSlide(0);
                        }
                    } else if (dragDistance > threshold) {
                        // Dragged right -> Prev slide
                        if (currentIndex > 0) {
                            goToSlide(currentIndex - 1);
                        } else {
                            goToSlide(totalSlides - 1);
                        }
                    } else {
                        // Snap back to current slide
                        goToSlide(currentIndex);
                    }
                } else {
                    goToSlide(currentIndex);
                }

                resetAutoPlay();
            }

            // Prevent native browser image drag
            viewport.addEventListener('dragstart', (e) => e.preventDefault());

            // Suppress link click if dragging occurred
            viewport.addEventListener('click', (e) => {
                if (hasMoved && Math.abs(dragDistance) > 10) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);

            // Mouse event listeners
            viewport.addEventListener('mousedown', dragStart);
            window.addEventListener('mousemove', dragMove);
            window.addEventListener('mouseup', dragEnd);

            // Touch event listeners
            viewport.addEventListener('touchstart', dragStart, { passive: true });
            viewport.addEventListener('touchmove', dragMove, { passive: false });
            viewport.addEventListener('touchend', dragEnd, { passive: true });
            viewport.addEventListener('touchcancel', dragEnd, { passive: true });
        }

        function startAutoPlay() {
            stopAutoPlay();
            autoPlayTimer = setInterval(() => {
                goToSlide(currentIndex + 1);
            }, AUTO_PLAY_INTERVAL);
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

        section.addEventListener('mouseenter', stopAutoPlay);
        section.addEventListener('mouseleave', startAutoPlay);
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) stopAutoPlay();
            else startAutoPlay();
        });

        // Initial setup
        updateStepNav(0);
        startAutoPlay();
    })();


})();
