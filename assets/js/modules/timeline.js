/**
 * Timeline Module - EduSoft
 * Roadmap Scroll-Driven Timeline Controller.
 */
(function initTimelineModule() {
    function initScrollTimeline() {
    // Roadmap Scroll-Driven Timeline Controller
    const timelineRows = document.querySelectorAll('.timeline-row');
    function updateScrollTimeline() {
        const viewportHeight = window.innerHeight;
        const Y_trigger = viewportHeight * 0.65;
        const rows = Array.from(timelineRows);
        
        // Calculate center Y for each card relative to viewport
        const Ys = rows.map(row => {
            const card = row.querySelector('.timeline-number-card');
            if (!card) return null;
            const rect = card.getBoundingClientRect();
            return rect.top + rect.height / 2;
        });

        // 1. Calculate vertical connector line progress for each row
        const lineProgresses = [];
        for (let i = 0; i < rows.length; i++) {
            let lineP = 0;
            if (i < rows.length - 1 && Ys[i] !== null && Ys[i+1] !== null) {
                if (Ys[i] <= Y_trigger && Ys[i+1] > Y_trigger) {
                    lineP = (Y_trigger - Ys[i]) / (Ys[i+1] - Ys[i]);
                } else if (Ys[i+1] <= Y_trigger) {
                    lineP = 1;
                }
            }
            lineProgresses.push(lineP);
        }

        // 2. Calculate card progress for each row
        const cardProgresses = [];
        for (let i = 0; i < rows.length; i++) {
            let cardP = 0;
            if (i === 0) {
                // First card turns blue as it approaches the viewport trigger line
                const startY = viewportHeight * 0.85;
                const endY = Y_trigger;
                if (Ys[0] !== null) {
                    if (Ys[0] <= startY && Ys[0] >= endY) {
                        cardP = (startY - Ys[0]) / (startY - endY);
                    } else if (Ys[0] < endY) {
                        cardP = 1;
                    }
                }
            } else {
                // Subsequent cards turn blue ONLY when the line from the previous card has fully reached them
                if (lineProgresses[i - 1] === 1) {
                    cardP = 1;
                }
            }
            cardProgresses.push(cardP);
        }

        // 3. Apply styles & trigger active states
        rows.forEach((row, i) => {
            const maxCardP = Math.max(parseFloat(row.dataset.maxCardP || '0'), cardProgresses[i]);
            const maxLineP = Math.max(parseFloat(row.dataset.maxLineP || '0'), lineProgresses[i]);
            
            row.dataset.maxCardP = maxCardP;
            row.dataset.maxLineP = maxLineP;
            
            row.style.setProperty('--card-progress', maxCardP);
            row.style.setProperty('--line-progress', maxLineP);
            
            if (Ys[i] !== null && Ys[i] <= Y_trigger) {
                row.classList.add('active');
            }
            
            if (row.classList.contains('active')) {
                row.style.setProperty('--card-progress', '1');
                row.dataset.maxCardP = '1';
            }
        });
    }
    let timelineTicking = false;
    function onTimelineScroll() {
        if (!timelineTicking) {
            requestAnimationFrame(() => {
                updateScrollTimeline();
                timelineTicking = false;
            });
            timelineTicking = true;
        }
    }
    window.addEventListener('scroll', onTimelineScroll, { passive: true });
    window.addEventListener('resize', onTimelineScroll, { passive: true });
    updateScrollTimeline(); // run once on load
    

    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollTimeline);
    } else {
        initScrollTimeline();
    }
})();
