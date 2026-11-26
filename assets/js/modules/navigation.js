/**
 * Navigation Module - EduSoft
 * Mobile drawer toggle, backdrop overlay, and accordion submenus.
 * Shared across all pages: index, demo, quan-ly-dao-tao, quan-ly-hoc-tap.
 */
(function initNavigationModule() {
    function initNavigation() {
        const burgerBtn = document.querySelector('.mobile-burger-btn');
        const drawerCloseBtn = document.querySelector('.mobile-drawer-close');
        const drawer = document.querySelector('.mobile-menu-drawer');
        const drawerBackdrop = document.querySelector('.mobile-drawer-backdrop');

        function openDrawer() {
            if (drawer) drawer.classList.add('active');
            if (drawerBackdrop) drawerBackdrop.classList.add('active');
            document.body.style.overflow = 'hidden';
        }

        function closeDrawer() {
            if (drawer) drawer.classList.remove('active');
            if (drawerBackdrop) drawerBackdrop.classList.remove('active');
            document.body.style.overflow = '';
        }

        if (burgerBtn) burgerBtn.addEventListener('click', openDrawer);
        if (drawerCloseBtn) drawerCloseBtn.addEventListener('click', closeDrawer);
        if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

        // Mobile Drawer Accordion Submenu (index page style)
        const accordionTriggers = document.querySelectorAll('.mobile-nav-accordion-trigger');
        accordionTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const parentItem = trigger.closest('.mobile-nav-item');
                if (parentItem) {
                    parentItem.classList.toggle('active');
                }
            });
        });

        // Mobile Drawer Accordion Toggle (subpages style: dao tao, hoc tap)
        const accordionTitles = document.querySelectorAll('.mobile-nav-item.has-accordion .accordion-title');
        accordionTitles.forEach(title => {
            title.addEventListener('click', () => {
                const item = title.parentElement;
                if (item) item.classList.toggle('open');
            });
        });

        // Close drawer when clicking a mobile nav link
        const mobileNavLinks = document.querySelectorAll(
            '.mobile-nav-link:not(.mobile-nav-accordion-trigger), .mobile-nav-sublink, .mobile-accordion-content a, .mobile-nav-item:not(.has-accordion) .mobile-nav-link'
        );
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', closeDrawer);
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initNavigation);
    } else {
        initNavigation();
    }
})();
