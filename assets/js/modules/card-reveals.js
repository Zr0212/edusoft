/**
 * Card Reveals Module - EduSoft
 * Scroll-triggered progressive reveals for Roadmap items, Mobile App V2,
 * FAQ section, Screenshots, CTA banners, LMS V2 and feature cards.
 */
(function initCardRevealsModule() {
    function initReveals() {
    // ===== ROADMAP V2 SCROLL-TRIGGERED PROGRESSIVE ITEM REVEAL =====
    const roadmapV2Section = document.querySelector('.roadmap-v2-section');
    if (roadmapV2Section) {
        const header = roadmapV2Section.querySelector('.roadmap-v2-header');
        const rows = roadmapV2Section.querySelectorAll('.roadmap-v2-row');

        if (!('IntersectionObserver' in window)) {
            if (header) header.classList.add('is-revealed');
            rows.forEach(r => r.classList.add('is-revealed'));
        } else {
            roadmapV2Section.classList.add('roadmap-v2-animated');

            // Header reveal
            if (header) {
                const headerObserver = new IntersectionObserver((entries, obs) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            entry.target.classList.add('is-revealed');
                            obs.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.12 });
                headerObserver.observe(header);
            }

            // Each row reveals progressively as user scrolls down to it
            const rowObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        obs.unobserve(entry.target);
                    }
                });
            }, { 
                threshold: 0.15,
                rootMargin: '0px 0px -40px 0px'
            });

            rows.forEach(row => rowObserver.observe(row));
        }
    }

    // ===== MOBILE APP V2 PROGRESSIVE SCROLL-TRIGGERED ITEM REVEAL =====
    const mobileAppV2Section = document.getElementById('mobile-app-section-v2');
    if (mobileAppV2Section) {
        const headerBlock = mobileAppV2Section.querySelector('.mobile-v2-header-block');
        const topDesc = mobileAppV2Section.querySelector('.mobile-v2-top-desc');
        const mockupWrapper = mobileAppV2Section.querySelector('.mobile-v2-mockup-wrapper');
        const featureItems = mobileAppV2Section.querySelectorAll('.mobile-v2-feature-item');

        const elementsToReveal = [headerBlock, topDesc, mockupWrapper, ...featureItems].filter(Boolean);

        if (!('IntersectionObserver' in window)) {
            elementsToReveal.forEach(el => el.classList.add('is-revealed'));
        } else {
            mobileAppV2Section.classList.add('mobile-app-v2-animated');

            const mobileItemObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        obs.unobserve(entry.target);
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -40px 0px'
            });

            elementsToReveal.forEach(el => mobileItemObserver.observe(el));
        }
    }

    // ===== FAQ SECTION SCROLL-TRIGGERED ENTRANCE & INTERACTION ANIMATION =====
    const faqSection = document.getElementById('faq-section');
    if (faqSection) {
        const faqItemsList = faqSection.querySelectorAll('.faq-item');
        if (!('IntersectionObserver' in window)) {
            faqSection.classList.add('is-revealed');
            faqItemsList.forEach(item => item.classList.add('is-revealed'));
        } else {
            faqSection.classList.add('faq-animated');
            const faqObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-revealed');
                        obs.unobserve(entry.target);

                        setTimeout(() => {
                            faqItemsList.forEach(item => {
                                item.style.transitionDelay = '0s';
                            });
                        }, 900);
                    }
                });
            }, {
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px'
            });
            faqObserver.observe(faqSection);
        }
    }
    
    // App Screenshots Slide-in Observer (one-time trigger per row)
    const screenshotRows = document.querySelectorAll('.screenshots-row');
    if (screenshotRows.length > 0) {
        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    obs.unobserve(entry.target); // trigger only once per row
                }
            });
        }, { threshold: 0.15 });
        screenshotRows.forEach(row => observer.observe(row));
    }
    
    // CTA Cards Slide-in Observer (one-time trigger)
    const ctaCards = document.querySelectorAll('.cta-main-card, .cta-side-card');
    if (ctaCards.length > 0) {
        const ctaObserver = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    obs.unobserve(entry.target); // trigger only once
                }
            });
        }, { threshold: 0.15 });
        ctaCards.forEach(card => ctaObserver.observe(card));
    }
    

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReveals);
    } else {
        initReveals();
    }

    /* ===== LMS V2 SCROLL-TRIGGERED ENTRANCE ANIMATION ===== */
    (function initLmsV2ScrollReveal() {
        const lmsSection = document.getElementById('lms-section-v2');
        if (!lmsSection) return;

        const header = lmsSection.querySelector('.lms-v2-header');
        const showcase = lmsSection.querySelector('.lms-v2-showcase-container');

        if (!('IntersectionObserver' in window) || (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches)) {
            if (header) header.classList.add('is-revealed');
            if (showcase) showcase.classList.add('is-revealed');
            return;
        }

        // Header progressive reveal on scroll
        if (header) {
            header.classList.add('lms-v2-header-animated');
            const headerObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        header.classList.add('is-revealed');
                        obs.unobserve(header);
                    }
                });
            }, {
                threshold: 0.15,
                rootMargin: '0px 0px -30px 0px'
            });
            headerObserver.observe(header);
        }

        // Slide Showcase progressive reveal (fires when user scrolls specifically to the slide)
        if (showcase) {
            showcase.classList.add('lms-v2-showcase-animated');
            const showcaseObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        showcase.classList.add('is-revealed');
                        obs.unobserve(showcase);

                        setTimeout(() => {
                            const animatedEls = showcase.querySelectorAll('.lms-v2-step-nav, .lms-v2-col-media, .lms-v2-col-content, .lms-v2-controls');
                            animatedEls.forEach(el => {
                                el.style.willChange = 'auto';
                            });
                        }, 1200);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -40px 0px'
            });
            showcaseObserver.observe(showcase);
        }
    })();


    /* ===== SCROLL REVEAL ENTRANCE FOR FEATURES & SOLUTIONS CARDS ===== */
    (function initCardScrollReveal() {
        const featureCards = document.querySelectorAll('.features-section .feature-card');
        const solutionCards = document.querySelectorAll('#solutions-section .solution-card');
        const allCards = [...featureCards, ...solutionCards];

        if (!allCards.length) return;

        // Fallback for browsers without IntersectionObserver
        if (!('IntersectionObserver' in window)) {
            allCards.forEach(c => c.classList.add('is-revealed'));
            return;
        }

        // Apply staggered delay to features grid
        featureCards.forEach((card, idx) => {
            const delay = (idx % 3) * 0.12 + Math.floor(idx / 3) * 0.06;
            card.style.transitionDelay = `${delay.toFixed(2)}s`;
        });

        // Apply staggered delay to solutions bento grid
        solutionCards.forEach((card, idx) => {
            card.style.transitionDelay = `${(idx * 0.1).toFixed(2)}s`;
        });

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    el.classList.add('is-revealed');
                    obs.unobserve(el);

                    // Once animation completes, reset transitionDelay so hover is immediate
                    const currentDelay = parseFloat(el.style.transitionDelay || '0') * 1000;
                    setTimeout(() => {
                        el.style.transitionDelay = '0s';
                        el.style.willChange = 'auto';
                    }, currentDelay + 800);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.12
        });

        allCards.forEach(card => observer.observe(card));
    })();

})();
