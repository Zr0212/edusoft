/**
 * Hero Animations Module - EduSoft
 * Dynamic animations for Hero Mockup: Spline wave chart, donut chart,
 * live spline runner with tooltips, calendar runner, and stage fluid scaler.
 */
(function initHeroModule() {
    /* ===== HERO V3 MOCKUP DYNAMIC ANIMATIONS CONTROLLER ===== */
    (function initHeroV3Animations() {
        function triggerHeroAnimations() {
            const hero = document.getElementById('hero-section');
            if (!hero) return;
            hero.classList.add('is-animated');

            // 1. Spline Wave Line Chart Initial Draw
            const splinePath = hero.querySelector('.hero-chart-path');
            if (splinePath) {
                try {
                    const totalLength = splinePath.getTotalLength() || 400;
                    splinePath.style.strokeDasharray = `${totalLength} ${totalLength}`;
                    splinePath.style.strokeDashoffset = totalLength;
                    void splinePath.getBoundingClientRect();
                    
                    setTimeout(() => {
                        splinePath.style.transition = 'stroke-dashoffset 1.6s cubic-bezier(0.16, 1, 0.3, 1)';
                        splinePath.style.strokeDashoffset = '0';
                    }, 200);
                } catch (e) {
                    splinePath.style.strokeDashoffset = '0';
                }

                // Spline Area Gradient Fade-in
                const chartArea = hero.querySelector('.hero-chart-area');
                if (chartArea) {
                    setTimeout(() => {
                        chartArea.style.opacity = '1';
                    }, 900);
                }

                // Spline Data Dots Staggered Pop-in (Animate 'r' instead of scale to maintain exact coordinates)
                const dots = hero.querySelectorAll('.hero-chart-dot');
                dots.forEach((dot, idx) => {
                    dot.setAttribute('r', '0');
                    setTimeout(() => {
                        dot.style.transition = 'r 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), stroke-width 0.2s ease';
                        const isAct = dot.classList.contains('is-active');
                        dot.setAttribute('r', isAct ? '6.5' : '4.5');
                    }, 350 + idx * 120);
                });
            }

            // 2. Horizontal Bars Growth
            const bars = hero.querySelectorAll('.hero-bars-box .bar-fill');
            bars.forEach((bar, idx) => {
                const targetW = bar.getAttribute('data-width') || '0%';
                setTimeout(() => {
                    bar.style.width = targetW;
                }, 350 + idx * 130);
            });

            // 3. Donut Chart Segments Draw-in
            const segments = hero.querySelectorAll('.donut-segment');
            segments.forEach((seg, idx) => {
                const targetDash = seg.getAttribute('data-target-dash');
                if (targetDash) {
                    setTimeout(() => {
                        seg.style.strokeDasharray = targetDash;
                    }, 300 + idx * 140);
                }
            });

            // 4. Metric Numbers Count-Up (148, 8862, 12524, 96%)
            const counters = hero.querySelectorAll('.hero-counter');
            counters.forEach((counter) => {
                const target = parseInt(counter.getAttribute('data-target'), 10) || 0;
                const suffix = counter.getAttribute('data-suffix') || '';
                const duration = 1600;
                let startTime = null;

                function step(timestamp) {
                    if (!startTime) startTime = timestamp;
                    const elapsed = timestamp - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
                    const currentVal = Math.round(target * ease);
                    counter.textContent = currentVal.toLocaleString('vi-VN') + suffix;

                    if (progress < 1) {
                        requestAnimationFrame(step);
                    } else {
                        counter.textContent = target.toLocaleString('vi-VN') + suffix;
                    }
                }

                setTimeout(() => {
                    requestAnimationFrame(step);
                }, 250);
            });

            // 5. "CHẠY LỊCH" - LIVE CALENDAR RUNNER (Tự động chạy lịch qua các ngày làm việc)
            const calDayBtns = hero.querySelectorAll('.cal-day-btn');
            const calEventCard = hero.querySelector('#calEventCard');
            const calEventDate = hero.querySelector('#calEventDate');
            const calEventTarget = hero.querySelector('#calEventTarget');
            const calEventTime = hero.querySelector('#calEventTime');
            const calEventTitle = hero.querySelector('#calEventTitle');
            const calCard = hero.querySelector('#heroCardRight');

            const calEvents = [
                {
                    day: 2,
                    dateStr: '2 thg 11, 2026',
                    target: 'Ban giám hiệu',
                    time: '07:30 - 9:00',
                    title: 'Họp giao ban đầu tuần'
                },
                {
                    day: 3,
                    dateStr: '3 thg 11, 2026',
                    target: 'Phòng Đào tạo',
                    time: '09:00 - 11:30',
                    title: 'Xét duyệt đề cương môn học mới'
                },
                {
                    day: 4,
                    dateStr: '4 thg 11, 2026',
                    target: 'Hội đồng Khoa học',
                    time: '14:00 - 16:30',
                    title: 'Nghiệm thu đề tài NCKH cấp Trường'
                },
                {
                    day: 5,
                    dateStr: '5 thg 11, 2026',
                    target: 'Ban Khảo thí',
                    time: '08:30 - 10:00',
                    title: 'Kiểm tra công tác thi học kỳ I'
                },
                {
                    day: 6,
                    dateStr: '6 thg 11, 2026',
                    target: 'Toàn thể Cán bộ',
                    time: '15:00 - 17:00',
                    title: 'Tổng kết tuần & Kế hoạch tuần tới'
                }
            ];

            let currentCalIndex = 0;
            let calTimer = null;
            let isCalPaused = false;

            function setCalendarEvent(index) {
                if (index < 0 || index >= calEvents.length) return;
                currentCalIndex = index;
                const ev = calEvents[index];

                calDayBtns.forEach((btn, i) => {
                    btn.classList.toggle('is-active', i === index);
                });

                if (calEventCard) {
                    calEventCard.classList.add('switching');
                    setTimeout(() => {
                        if (calEventDate) calEventDate.textContent = ev.dateStr;
                        if (calEventTarget) calEventTarget.textContent = ev.target;
                        if (calEventTime) calEventTime.textContent = ev.time;
                        if (calEventTitle) calEventTitle.textContent = ev.title;
                        calEventCard.classList.remove('switching');
                    }, 180);
                }
            }

            function startCalendarRunner() {
                if (calTimer) clearInterval(calTimer);
                calTimer = setInterval(() => {
                    if (!isCalPaused) {
                        const nextIdx = (currentCalIndex + 1) % calEvents.length;
                        setCalendarEvent(nextIdx);
                    }
                }, 3200);
            }

            calDayBtns.forEach((btn, idx) => {
                btn.addEventListener('click', () => {
                    setCalendarEvent(idx);
                    isCalPaused = true;
                    setTimeout(() => { isCalPaused = false; }, 6000);
                });
            });

            if (calCard) {
                calCard.addEventListener('mouseenter', () => { isCalPaused = true; });
                calCard.addEventListener('mouseleave', () => { isCalPaused = false; });
            }

            startCalendarRunner();

            // 6. "CHẠY BIỂU ĐỒ" - LIVE SPLINE CHART RUNNER (Chạy điểm dữ liệu và tooltip động)
            const chartDots = hero.querySelectorAll('.hero-chart-dot');
            const chartTooltip = hero.querySelector('#chartTooltip');
            const chartTooltipVal = hero.querySelector('#chartTooltipVal');
            const chartCard = hero.querySelector('#heroCardLeft');
            const chartWrap = hero.querySelector('.hero-spline-chart-wrap');
            const svgElem = hero.querySelector('.hero-spline-svg');

            const chartData = [
                { month: 'Tháng 1', val: '60 giờ', x: 28, y: 76 },
                { month: 'Tháng 2', val: '31 giờ', x: 88, y: 116.6 },
                { month: 'Tháng 3', val: '50 giờ', x: 149, y: 90 },
                { month: 'Tháng 4', val: '28 giờ', x: 210, y: 120.8 },
                { month: 'Tháng 5', val: '55 giờ', x: 271, y: 83 },
                { month: 'Tháng 6', val: '100 giờ', x: 332, y: 20 }
            ];

            let currentChartIdx = 0;
            let chartTimer = null;
            let isChartPaused = false;

            function setChartMonth(index) {
                if (index < 0 || index >= chartData.length) return;
                currentChartIdx = index;
                const d = chartData[index];

                chartDots.forEach((dot, i) => {
                    const isAct = (i === index);
                    dot.classList.toggle('is-active', isAct);
                    dot.setAttribute('r', isAct ? '6.5' : '4.5');
                    dot.setAttribute('stroke-width', isAct ? '3.5' : '2.5');
                });

                const halo = hero.querySelector('#chartActiveHalo');
                if (halo) {
                    halo.setAttribute('cx', d.x);
                    halo.setAttribute('cy', d.y);
                }

                const activeDot = chartDots[index];

                if (chartTooltip && chartWrap) {
                    let xPos, yPos;

                    // 1. First priority: Exact SVG screen coordinate transformation
                    if (svgElem && svgElem.getScreenCTM && svgElem.createSVGPoint) {
                        try {
                            const ctm = svgElem.getScreenCTM();
                            if (ctm) {
                                const pt = svgElem.createSVGPoint();
                                pt.x = d.x;
                                pt.y = d.y;
                                const screenPt = pt.matrixTransform(ctm);
                                const wrapRect = chartWrap.getBoundingClientRect();
                                xPos = screenPt.x - wrapRect.left;
                                yPos = screenPt.y - wrapRect.top;
                            }
                        } catch (err) {
                            // ignore and fallback
                        }
                    }

                    // 2. Fallback: Center of the active dot circle element
                    if (xPos === undefined || isNaN(xPos)) {
                        if (activeDot) {
                            const dotRect = activeDot.getBoundingClientRect();
                            const wrapRect = chartWrap.getBoundingClientRect();
                            if (dotRect.width > 0 && wrapRect.width > 0) {
                                xPos = (dotRect.left + dotRect.width / 2) - wrapRect.left;
                                yPos = (dotRect.top + dotRect.height / 2) - wrapRect.top;
                            }
                        }
                    }

                    // 3. Mathematical proportional fallback
                    if (xPos === undefined || isNaN(xPos)) {
                        const wrapRect = chartWrap.getBoundingClientRect();
                        const w = wrapRect.width || 295;
                        const h = wrapRect.height || 165;
                        xPos = (d.x / 340) * w;
                        yPos = (d.y / 190) * h;
                    }

                    chartTooltip.style.left = `${Math.round(xPos)}px`;
                    chartTooltip.style.top = `${Math.round(yPos)}px`;

                    if (chartTooltipVal) {
                        chartTooltipVal.textContent = `${d.month}: ${d.val}`;
                    }
                }
            }

            function startChartRunner() {
                if (chartTimer) clearInterval(chartTimer);

                // Initial position calibration
                setTimeout(() => { setChartMonth(0); }, 450);
                setTimeout(() => { setChartMonth(0); }, 1100);

                // Start live cycle after initial entrance animation
                setTimeout(() => {
                    chartTimer = setInterval(() => {
                        if (!isChartPaused) {
                            const nextIdx = (currentChartIdx + 1) % chartData.length;
                            setChartMonth(nextIdx);
                        }
                    }, 2400);
                }, 1800);
            }

            chartDots.forEach((dot, idx) => {
                dot.addEventListener('click', () => {
                    setChartMonth(idx);
                    isChartPaused = true;
                    setTimeout(() => { isChartPaused = false; }, 5000);
                });
                dot.addEventListener('mouseenter', () => {
                    setChartMonth(idx);
                    isChartPaused = true;
                });
            });

            if (chartCard) {
                chartCard.addEventListener('mouseenter', () => { isChartPaused = true; });
                chartCard.addEventListener('mouseleave', () => { isChartPaused = false; });
            }

            window.addEventListener('resize', () => {
                setChartMonth(currentChartIdx);
            }, { passive: true });

            document.addEventListener('visibilitychange', () => {
                isCalPaused = document.hidden;
                isChartPaused = document.hidden;
            });

            startChartRunner();
        }

        // Run after short delay to ensure initial layout is calculated
        setTimeout(triggerHeroAnimations, 120);
    })();

    /* ===== HERO MOCKUP STAGE FLUID SCALER ===== */
    (function initHeroStageScaler() {
        const stage = document.querySelector('.hero-v3-stage');
        const inner = document.querySelector('.hero-v3-stage-inner');
        if (!stage || !inner) return;

        const baseWidth = 1140;
        const baseHeight = 540;

        function updateScale() {
            const container = stage.closest('.hero-v3-container') || stage.parentElement;
            const containerWidth = container ? container.clientWidth : window.innerWidth;
            const availableWidth = Math.max(280, containerWidth);
            const scale = Math.min(1, availableWidth / baseWidth);
            stage.style.setProperty('--hero-scale', scale.toFixed(4));
            stage.style.height = `${Math.round(baseHeight * scale)}px`;
        }

        let scaleTicking = false;
        function throttledUpdateScale() {
            if (!scaleTicking) {
                requestAnimationFrame(() => {
                    updateScale();
                    scaleTicking = false;
                });
                scaleTicking = true;
            }
        }

        window.addEventListener('resize', throttledUpdateScale, { passive: true });
        window.addEventListener('orientationchange', throttledUpdateScale, { passive: true });
        if (window.ResizeObserver) {
            new ResizeObserver(throttledUpdateScale).observe(stage.parentElement || document.body);
        }
        updateScale();
        setTimeout(updateScale, 60);
        setTimeout(updateScale, 300);
    })();

})();
