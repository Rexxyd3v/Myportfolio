/* =========================================
   PROJECTS — showcase menu + project detail
   renderer. Data and markup live here so
   projects.html stays clean.
========================================= */

const projectData = {
    irrigation: {
        title: '1. VANTA',
        images: [
            'assets/images/project1/image1.png',
            'assets/images/project1/image2.png',
            'assets/images/project1/image3.png',
            'assets/images/project1/image4.png',
            'assets/images/project1/image5.png',
            'assets/images/project1/image6.png',
            'assets/images/project1/image7.png'
        ],
        desc: 'Vanta is a simple online multiplayer shooter game focused on fast-paced and competitive gameplay. It features different game modes such as Free-for-All, Team Deathmatch, and Deathmatch, allowing players to compete either individually or as a team. The game also supports Push-to-Talk voice communication for easy coordination and interaction between players.',
        stack: ['C/C++', 'Raylib game development library', 'Opus codec', 'Playit.gg tunnel', 'Tiled map']
    },
    telemetry: {
        title: '2. Xpose',
        images: ['assets/images/project2.png'],
        desc: 'Xpose is a lightweight secret scanner designed for educational purposes, helping users understand code security and the risks of exposing sensitive information. It scans local directories or cloned GitHub repositories for potential API keys, access tokens, database credentials, and other confidential data. Xpose generates a report.json containing the findings, allowing users to identify security risks and learn how to better protect sensitive information in their projects.',
        stack: ['Python 3.8+', 'Colorama', 'Git', 'JSON', 'Requests']
    },
    dashboard: {
        title: '3. Laundry Shop Inventory and POS System',
        images: ['assets/images/project3.png'],
        desc: 'LaundryShop Inventory and POS System is a management and point-of-sale system designed for laundry businesses. It supports multiple administrators with separate login credentials, along with inventory management, transaction processing, and receipt printing. The system also includes system configuration options, allowing administrators to customize settings such as the POS name, theme colors, and other system preferences.',
        stack: ['Java', 'JSON']
    }
};

function createGallery(proj) {
    const slides = proj.images.map((image, index) => `
        <div class="project-slide">
            <img src="${image}" alt="${proj.title} image ${index + 1}">
        </div>
    `).join('');
    const dots = proj.images.map((_, index) => `
        <button class="gallery-dot${index === 0 ? ' active' : ''}" type="button" data-gallery-index="${index}" aria-label="Show image ${index + 1}"></button>
    `).join('');

    return `
        <div class="project-gallery${proj.images.length > 1 ? ' has-multiple' : ''}" data-gallery>
            <div class="project-image-wrapper" data-gallery-viewport>
                <div class="project-gallery-track" data-gallery-track>${slides}</div>
                <button class="gallery-arrow gallery-arrow-prev" type="button" data-gallery-prev aria-label="Previous project image">&#8249;</button>
                <button class="gallery-arrow gallery-arrow-next" type="button" data-gallery-next aria-label="Next project image">&#8250;</button>
            </div>
            <div class="gallery-dots" aria-label="Project images">${dots}</div>
        </div>
    `;
}

function setupGallery(gallery) {
    const track = gallery.querySelector('[data-gallery-track]');
    const viewport = gallery.querySelector('[data-gallery-viewport]');
    const slides = gallery.querySelectorAll('.project-slide');
    const dots = gallery.querySelectorAll('.gallery-dot');
    const previous = gallery.querySelector('[data-gallery-prev]');
    const next = gallery.querySelector('[data-gallery-next]');
    let currentIndex = 0;
    let startX = 0;
    let isDragging = false;

    const updateGallery = index => {
        currentIndex = (index + slides.length) % slides.length;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;
        dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === currentIndex));
    };

    previous.addEventListener('click', () => updateGallery(currentIndex - 1));
    next.addEventListener('click', () => updateGallery(currentIndex + 1));
    dots.forEach((dot, index) => dot.addEventListener('click', () => updateGallery(index)));

    viewport.addEventListener('pointerdown', event => {
        if (event.target.closest('button')) return;
        startX = event.clientX;
        isDragging = true;
        viewport.classList.add('is-dragging');
        viewport.setPointerCapture(event.pointerId);
    });

    viewport.addEventListener('pointerup', event => {
        if (!isDragging) return;
        isDragging = false;
        viewport.classList.remove('is-dragging');
        const distance = event.clientX - startX;
        if (Math.abs(distance) > 45) updateGallery(currentIndex + (distance < 0 ? 1 : -1));
    });

    viewport.addEventListener('pointercancel', () => {
        isDragging = false;
        viewport.classList.remove('is-dragging');
    });
}

function renderProject(key) {
    const container = document.getElementById('project-details');
    if (!container) return;
    const proj = projectData[key];
    if (!proj) return;

    const stackHTML = proj.stack.map(s =>
        `<span style="display:inline-block;font-family:var(--font-mono);font-size:11px;color:var(--accent-green);background:rgba(0,255,188,0.08);border:1px solid rgba(0,255,188,0.2);padding:3px 8px;border-radius:4px;margin-right:6px;margin-bottom:6px;">${s}</span>`
    ).join('');

    container.innerHTML = `
        ${createGallery(proj)}
        <div class="project-info">
            <h3>${proj.title}</h3>
            <p>${proj.desc}</p>
            <div style="margin-top:8px;">${stackHTML}</div>
        </div>
    `;
    setupGallery(container.querySelector('[data-gallery]'));
}

export function initProjects() {
    const menuBtns = document.querySelectorAll('.menu-btn[data-project]');
    menuBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            menuBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderProject(btn.dataset.project);
        });
    });

    renderProject('irrigation');
}
