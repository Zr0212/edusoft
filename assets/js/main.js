/**
 * Main Script - EduSoft (index.html)
 * Classic platform tabs switcher, slider controller, and FAQ accordion.
 */
(function initMainScript() {
    function initHomepage() {
    const tabs = document.querySelectorAll('.platform-tab');
    const panes = document.querySelectorAll('.preview-pane');
    
    let activeIndex = 0;
    let progress = 0;
    let timer = null;
    const duration = 6000; // 6 seconds
    const intervalTime = 30; // update progress every 30ms
    const step = (intervalTime / duration) * 100;
    
    function switchTab(index) {
        tabs.forEach(t => t.classList.remove('active'));
        panes.forEach(p => p.classList.remove('active'));
        
        tabs[index].classList.add('active');
        const tabId = tabs[index].getAttribute('data-tab');
        const targetPane = document.getElementById(`preview-${tabId}`);
        if (targetPane) {
            targetPane.classList.add('active');
        }
        
        // Reset all progress values
        document.querySelectorAll('.tab-progress-value').forEach(bar => {
            bar.style.width = '0%';
        });
        
        progress = 0;
        activeIndex = index;
    }
    
    function startTimer() {
        if (timer) clearInterval(timer);
        timer = setInterval(() => {
            progress += step;
            const activeProgressBar = tabs[activeIndex].querySelector('.tab-progress-value');
            if (activeProgressBar) {
                activeProgressBar.style.width = `${progress}%`;
            }
            
            if (progress >= 100) {
                progress = 0;
                let nextIndex = (activeIndex + 1) % tabs.length;
                switchTab(nextIndex);
            }
        }, intervalTime);
    }
    
    tabs.forEach((tab, index) => {
        tab.addEventListener('click', (e) => {
            const isLucideX = e.target.closest('iconify-icon[icon="lucide:x"]') || 
                              (tab.classList.contains('active') && e.target.closest('.tab-toggle-icon'));
            
            clearInterval(timer);
            if (isLucideX) {
                let nextIndex = (index + 1) % tabs.length;
                switchTab(nextIndex);
            } else {
                switchTab(index);
            }
            startTimer();
        });
    });
    
    // Start autoplay cycle
    switchTab(0);
    startTimer();
    
    // Integrated Platform Slider Controller (if slider present)
    const track = document.querySelector('.slider-track');
    const slides = document.querySelectorAll('.slider-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.arrow-prev');
    const nextBtn = document.querySelector('.arrow-next');
    
    if (track && slides.length > 0 && prevBtn && nextBtn) {
        let currentSlide = 0;
        const totalSlides = slides.length;
        let sliderAutoplay = null;
        
        function updateSlider(index) {
            currentSlide = index;
            track.style.transform = `translateX(-${currentSlide * 20}%)`;
            
            dots.forEach(d => d.classList.remove('active'));
            if (dots[currentSlide]) dots[currentSlide].classList.add('active');
        }
        
        function startSliderAutoplay() {
            if (sliderAutoplay) clearInterval(sliderAutoplay);
            sliderAutoplay = setInterval(() => {
                let nextIndex = (currentSlide + 1) % totalSlides;
                updateSlider(nextIndex);
            }, 8000);
        }
        
        prevBtn.addEventListener('click', () => {
            clearInterval(sliderAutoplay);
            let index = (currentSlide - 1 + totalSlides) % totalSlides;
            updateSlider(index);
            startSliderAutoplay();
        });
        
        nextBtn.addEventListener('click', () => {
            clearInterval(sliderAutoplay);
            let index = (currentSlide + 1) % totalSlides;
            updateSlider(index);
            startSliderAutoplay();
        });
        
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                clearInterval(sliderAutoplay);
                updateSlider(index);
                startSliderAutoplay();
            });
        });
        
        startSliderAutoplay();
    }
    


    /* ===== FAQ ACCORDION TOGGLE (FLAWLESS & EXACT HEIGHT) ===== */
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const questionBtn = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        if (!questionBtn || !answer) return;

        if (item.classList.contains('active')) {
            answer.style.height = 'auto';
            questionBtn.setAttribute('aria-expanded', 'true');
        } else {
            answer.style.height = '0px';
            questionBtn.setAttribute('aria-expanded', 'false');
        }

        questionBtn.addEventListener('click', () => {
            const isActive = item.classList.contains('active');

            // Close all other active items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    const otherBtn = otherItem.querySelector('.faq-question');
                    otherItem.classList.remove('active');
                    if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
                    if (otherAnswer) {
                        const curH = otherAnswer.getBoundingClientRect().height;
                        otherAnswer.style.height = curH + 'px';
                        otherAnswer.offsetHeight; // reflow
                        otherAnswer.style.height = '0px';
                    }
                }
            });

            if (isActive) {
                // Collapse current item
                const curH = answer.getBoundingClientRect().height;
                answer.style.height = curH + 'px';
                answer.offsetHeight; // reflow
                answer.style.height = '0px';
                item.classList.remove('active');
                questionBtn.setAttribute('aria-expanded', 'false');
            } else {
                // Expand current item
                item.classList.add('active');
                questionBtn.setAttribute('aria-expanded', 'true');
                const curH = answer.getBoundingClientRect().height;
                answer.style.height = curH + 'px';
                answer.offsetHeight; // reflow
                answer.style.height = answer.scrollHeight + 'px';

                const onEnd = (e) => {
                    if (e.target !== answer) return;
                    if (item.classList.contains('active')) {
                        answer.style.height = 'auto';
                    }
                    answer.removeEventListener('transitionend', onEnd);
                };
                answer.addEventListener('transitionend', onEnd);
            }
        });
    });


    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initHomepage);
    } else {
        initHomepage();
    }
})();
