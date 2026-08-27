const LED_TIME = 1500;
const ALL_OFF_TIME = 800;
const ENTRANCE_DURATION = 600;
const EXIT_DURATION = 2200;
const MOBILE_BREAKPOINT = 700;

let leds = [];
let carLane = null;
let frontRobot = null;
let hero = null;
let carState = 'offscreen-left';
let isAnimating = false;
let ledLoopHandle = null;

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function setHeroDriveActive(enabled) {
    if (hero) hero.classList.toggle('drive-active', enabled);
}

function freezeWheels() {
    if (!frontRobot) return;

    frontRobot.querySelectorAll('.robot-wheel').forEach(wheel => {
        const currentTransform = getComputedStyle(wheel).transform;
        wheel.style.transform = currentTransform === 'none' ? '' : currentTransform;
    });
}

function resetWheelTransforms() {
    if (!frontRobot) return;
    frontRobot.querySelectorAll('.robot-wheel').forEach(wheel => {
        wheel.style.transform = '';
    });
}

/* ---------- LED cycle ---------- */

function allOff() {
    leds.forEach(led => led.classList.remove('on'));
}

function turnOn(index) {
    allOff();
    if (leds[index]) leds[index].classList.add('on');
}

async function ledCycle() {
    while (ledLoopHandle) {
        turnOn(0);
        await delay(LED_TIME);
        if (!ledLoopHandle) return;
        turnOn(1);
        await delay(LED_TIME);
        if (!ledLoopHandle) return;
        turnOn(2);
        await delay(LED_TIME);
        if (!ledLoopHandle) return;
        allOff();
        await delay(ALL_OFF_TIME);
        if (!ledLoopHandle) return;
    }
}

function startLEDSequence() {
    if (ledLoopHandle) return;
    ledLoopHandle = true;
    ledCycle();
}

function stopLEDSequence() {
    ledLoopHandle = null;
    allOff();
}

function dropLEDsSequentially() {
    return new Promise(resolve => {
        leds.forEach((led, i) => {
            setTimeout(() => {
                led.classList.add('drop');
                setTimeout(() => led.classList.add('hidden'), 480);
            }, i * 140);
        });
        setTimeout(resolve, (leds.length - 1) * 140 + 550);
    });
}

function restoreLEDsImmediate() {
    leds.forEach(led => led.classList.remove('drop', 'hidden'));
}

/* ---------- Car state machine ---------- */

async function carEnterFromLeft() {
    if (!frontRobot) return;
    if (carState === 'idle' || carState === 'entering') return;

    isAnimating = true;
    carState = 'entering';

    resetWheelTransforms();
    frontRobot.classList.remove('car-idle', 'car-exiting');
    frontRobot.classList.add('car-driving');
    if (carLane) carLane.classList.add('is-moving');
    frontRobot.style.transition = 'none';
    frontRobot.style.transform = 'translateX(-120%)';
    frontRobot.style.opacity = '1';

    void frontRobot.offsetWidth;

    frontRobot.style.transition = `transform ${ENTRANCE_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1),
                                   opacity 400ms ease`;
    frontRobot.style.transform = 'translateX(0)';

    await delay(ENTRANCE_DURATION);

    freezeWheels();
    frontRobot.classList.remove('car-driving');
    frontRobot.classList.add('car-idle');
    if (carLane) carLane.classList.remove('is-moving');
    frontRobot.style.transition = '';
    frontRobot.style.transform = '';

    carState = 'idle';
    isAnimating = false;
}

async function carExitToRight({ forNavigation = false } = {}) {
    if (!frontRobot) return;
    if (carState === 'exiting' || carState === 'offscreen-right') return;

    if (carState === 'entering') {
        await new Promise(resolve => {
            const check = setInterval(() => {
                if (carState !== 'entering') { clearInterval(check); resolve(); }
            }, 50);
        });
    }

    const wasOffscreenLeft = carState === 'offscreen-left';
    isAnimating = true;
    carState = 'exiting';

    if (forNavigation) {
        setHeroDriveActive(true);
    }

    resetWheelTransforms();
    frontRobot.classList.remove('car-idle');
    frontRobot.classList.add('car-driving', 'car-exiting');
    if (carLane) carLane.classList.add('is-moving');
    frontRobot.style.transition = 'none';
    const startingPosition = wasOffscreenLeft ? 'translateX(-120%)' : 'translateX(0)';
    frontRobot.style.transform = startingPosition;
    frontRobot.style.opacity = '1';

    void frontRobot.offsetWidth;

    if (forNavigation) {
        dropLEDsSequentially();
    }

    if (wasOffscreenLeft) {
        const centerDuration = EXIT_DURATION / 2;
        frontRobot.style.transition = `transform ${centerDuration}ms cubic-bezier(0.16, 1, 0.3, 1)`;
        frontRobot.style.transform = 'translateX(0)';
        await delay(centerDuration);
    }

    const exitDuration = wasOffscreenLeft ? EXIT_DURATION / 2 : EXIT_DURATION;
    frontRobot.style.transition = `transform ${exitDuration}ms cubic-bezier(0.55, 0, 1, 0.45),
                                   opacity 300ms ease ${exitDuration - 300}ms`;
    frontRobot.style.transform = 'translateX(calc(100vw + 120%))';

    await delay(exitDuration);

    frontRobot.classList.remove('car-driving', 'car-exiting');
    frontRobot.classList.add('is-offscreen');
    if (carLane) carLane.classList.remove('is-moving');
    frontRobot.style.opacity = '0';
    frontRobot.style.transition = '';
    frontRobot.style.transform = '';

    carState = 'offscreen-right';
    isAnimating = false;
}

function carResetToOffscreen() {
    if (!frontRobot) return;
    setHeroDriveActive(false);
    resetWheelTransforms();
    frontRobot.classList.remove('car-idle', 'car-driving', 'car-exiting', 'is-offscreen');
    if (carLane) carLane.classList.remove('is-moving');
    frontRobot.style.transition = 'none';
    frontRobot.style.transform = 'translateX(-120%)';
    frontRobot.style.opacity = '0';
    carState = 'offscreen-left';
}

function isMobileViewport() {
    return window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
}

/* ---------- Public API ---------- */

export function initHome() {
    leds = document.querySelectorAll('.led');
    carLane = document.querySelector('.car-lane');
    frontRobot = document.querySelector('.robot-car--lead');
    hero = document.querySelector('.hero');

    carResetToOffscreen();
    startLEDSequence();

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    mql.addEventListener('change', e => {
        if (e.matches) {
            carResetToOffscreen();
        } else {
            requestAnimationFrame(() => {
                setTimeout(() => carEnterFromLeft(), 300);
            });
        }
    });

    if (isMobileViewport()) {
        return;
    }

    requestAnimationFrame(() => {
        setTimeout(() => carEnterFromLeft(), 300);
    });
}

export async function exitHome() {
    await carExitToRight({ forNavigation: true });
    stopLEDSequence();
}

export async function reenterHome() {
    restoreLEDsImmediate();
    carResetToOffscreen();
    startLEDSequence();

    if (!isMobileViewport()) {
        setTimeout(() => carEnterFromLeft(), 650);
    }
}
