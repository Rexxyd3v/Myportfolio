/* =========================================
   NAVBAR — curtain, section activation,
   page transitions, mobile menu toggle.

   Exposes initNavbar() and the helpers it
   needs. Consumed by main.js.
========================================= */

const curtain = document.querySelector('.transition-curtain');

let currentSection = 'home';

const CURTAIN_IN  = 500;
const CURTAIN_HOLD = 60;
const CURTAIN_OUT = 450;

function activateSection(targetId, hooks) {
    const hero = document.querySelector('.hero');
    const sections = document.querySelectorAll('.section-content');
    const navLinks = document.querySelectorAll('.nav-link');

    if (hero) {
        if (targetId === 'home') {
            hero.classList.remove('is-hidden');
        } else {
            hero.classList.add('is-hidden');
        }
    }

    sections.forEach(section => {
        section.classList.remove('active');
    });

    const targetSection = document.getElementById(targetId);
    if (targetSection && targetId !== 'home') {
        targetSection.classList.add('active');
    }

    navLinks.forEach(link => {
        link.classList.toggle('active', link.dataset.target === targetId);
    });

    if (hooks && typeof hooks.afterActivate === 'function') {
        hooks.afterActivate(targetId);
    }

    currentSection = targetId;
}

function transitionToSection(targetId, hooks) {
    if (!curtain) {
        activateSection(targetId, hooks);
        return Promise.resolve();
    }

    return new Promise(resolve => {
        curtain.classList.remove('wipe-out');
        curtain.classList.add('wipe-in');

        setTimeout(() => {
            activateSection(targetId, hooks);
            curtain.classList.remove('wipe-in');
            curtain.classList.add('wipe-out');

            setTimeout(() => resolve(), CURTAIN_OUT);
        }, CURTAIN_IN + CURTAIN_HOLD);
    });
}

function toggleMobileMenu(force) {
    const hamburger = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');

    if (!hamburger || !navigation) return;
    const isOpen = typeof force === 'boolean'
        ? force
        : !navigation.classList.contains('open');
    navigation.classList.toggle('open', isOpen);
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
}

export function initNavbar({ onNavigate } = {}) {
    const hamburger = document.querySelector('.menu-toggle');
    const navigation = document.querySelector('.navigation');
    const navLinks = document.querySelectorAll('.nav-link');
    const sectionLinks = document.querySelectorAll('[data-target]');

    if (hamburger) {
        hamburger.addEventListener('click', () => toggleMobileMenu());
    }

    sectionLinks.forEach(link => {
        link.addEventListener('click', async event => {
            event.preventDefault();
            const targetId = link.dataset.target;
            if (!targetId) return;

            toggleMobileMenu(false);

            if (targetId === currentSection && targetId !== 'home') {
                return;
            }

            const ctx = {
                from: currentSection,
                to: targetId,
                isSame: targetId === currentSection,
                isHomeReenter: targetId === 'home' && currentSection !== 'home',
            };

            if (typeof onNavigate === 'function') {
                await onNavigate(ctx);
            }

            await transitionToSection(targetId, {
                afterActivate: () => {}
            });
        });
    });
}

export { activateSection, transitionToSection, toggleMobileMenu, currentSection };
