/* =========================================
   ABOUT — bento grid interactions.

   Currently the section is static. Place any
   per-section behaviour (counter animations,
   etc.) here.
========================================= */

let statsAnimated = false;

function animateMetrics() {
    const metricElements = document.querySelectorAll('.stat-number');
    metricElements.forEach(el => {
        const target = parseInt(el.dataset.target, 10);
        if (isNaN(target)) return;

        let count = 0;
        const duration = 1000;
        const stepTime = Math.max(Math.floor(duration / target), 30);
        el.textContent = '0';

        const timer = setInterval(() => {
            count++;
            el.textContent = count;
            if (count >= target) {
                clearInterval(timer);
                el.textContent = target;
            }
        }, stepTime);
    });
}

export function initAbout() {
}

export function onAboutEnter() {
    if (!statsAnimated) {
        animateMetrics();
        statsAnimated = true;
    }
}
