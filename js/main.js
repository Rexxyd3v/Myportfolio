/* =========================================
   MAIN — entry point.

   1. Loads each per-page HTML partial into
      the matching <section data-page="...">
      mount point in index.html.
   2. Imports per-section JS modules and
      calls their init() functions.
   3. Wires the navbar so navigation between
      sections runs the right exit/enter
      animations.
========================================= */

import { initNavbar, currentSection } from './navbar.js';
import { initHome, exitHome, reenterHome } from './home.js';
import { initAbout, onAboutEnter } from './about.js';
import { initProjects } from './projects.js';
import { initContact } from './contact.js';

const SECTIONS = [
    { name: 'home',     file: 'html/home.html' },
    { name: 'about',    file: 'html/about.html' },
    { name: 'projects', file: 'html/projects.html' },
    { name: 'contact',  file: 'html/contact.html' },
];

async function loadSection({ name, file }) {
    const mount = document.querySelector(`[data-page="${name}"]`);
    if (!mount) return;

    const response = await fetch(file);
    if (!response.ok) {
        console.error(`Failed to load ${file}: ${response.status}`);
        return;
    }
    mount.innerHTML = await response.text();
}

async function loadAllSections() {
    await Promise.all(SECTIONS.map(loadSection));
}

async function onNavigate(ctx) {
    const { from, to, isHomeReenter } = ctx;

    if (from === 'home' && to !== 'home') {
        await exitHome();
        return;
    }

    if (isHomeReenter) {
        reenterHome();
        return;
    }

    if (to === 'about') {
        onAboutEnter();
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadAllSections();

        initHome();
        initAbout();
        initProjects();
        initContact();

        initNavbar({ onNavigate });
    } catch (err) {
        console.error('Portfolio bootstrap failed:', err);
    }
});
