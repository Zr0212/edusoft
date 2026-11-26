/**
 * Quản lý đào tạo - EduSoft (quan-ly-dao-tao.html)
 * Tab switching & Scroll Reveal entrance animations.
 */
(function initDaoTaoScript() {
    function initDaoTao() {
        // Interactive Tab switching for mockup images
        const tabBtns = document.querySelectorAll('.dt-tabs-container .dt-tab-btn');
        const tabPanes = document.querySelectorAll('.dt-tab-image-pane');
        if (tabBtns.length > 0) {
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const targetId = btn.getAttribute('data-tab');
                    tabBtns.forEach(b => b.classList.remove('active', 'tab-outline-active'));
                    btn.classList.add('active', 'tab-outline-active');

                    if (tabPanes.length > 0 && targetId) {
                        tabPanes.forEach(pane => {
                            if (pane.id === targetId) {
                                pane.classList.add('active');
                            } else {
                                pane.classList.remove('active');
                            }
                        });
                    }
                });
            });
        }

        // ===== SCROLL REVEAL (HIỆU ỨNG LƯỚT TỚI KHI CUỘN TRANG) =====
        (function initScrollReveal() {
            if (!('IntersectionObserver' in window)) return;
            if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

            document.body.classList.add('dt-animated');

            // Elements to animate
            const heroContent = document.querySelector('.dt-hero-content');
            const heroVisual = document.querySelector('.dt-hero-visual');
            const sectionHeaders = document.querySelectorAll('.dt-section-header');
            const benefitsGrid = document.querySelector('.dt-benefits-grid');
            const benefitCards = document.querySelectorAll('.dt-benefit-card');
            const tabsContainer = document.querySelector('.dt-tabs-container');
            const mainCard = document.querySelector('.dt-table-preview-card, .dt-tab-images-wrapper');
            const featureRows = document.querySelectorAll('.dt-feature-row');
            const ctaCard = document.querySelector('.cta-banner-card');

            // Stagger entrance delay for benefit cards
            benefitCards.forEach((card, idx) => {
                card.style.transitionDelay = `${(idx * 0.12).toFixed(2)}s`;
            });

            // Trigger Hero entrance immediately after load
            requestAnimationFrame(() => {
                setTimeout(() => {
                    if (heroContent) heroContent.classList.add('is-revealed');
                    if (heroVisual) heroVisual.classList.add('is-revealed');
                }, 80);
            });

            // IntersectionObserver for elements appearing upon scrolling
            const observerOptions = {
                threshold: 0.12,
                rootMargin: '0px 0px -40px 0px'
            };

            const revealObserver = new IntersectionObserver((entries, obs) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        el.classList.add('is-revealed');
                        obs.unobserve(el);

                        // Reset transition-delay after entrance finishes so hover is instant
                        setTimeout(() => {
                            el.style.willChange = 'auto';
                            if (el.classList.contains('dt-benefits-grid')) {
                                benefitCards.forEach(c => c.style.transitionDelay = '0s');
                            }
                        }, 1000);
                    }
                });
            }, observerOptions);

            sectionHeaders.forEach(el => revealObserver.observe(el));
            if (benefitsGrid) revealObserver.observe(benefitsGrid);
            if (tabsContainer) revealObserver.observe(tabsContainer);
            if (mainCard) revealObserver.observe(mainCard);
            featureRows.forEach(el => revealObserver.observe(el));
            if (ctaCard) revealObserver.observe(ctaCard);
        })();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initDaoTao);
    } else {
        initDaoTao();
    }
})();
