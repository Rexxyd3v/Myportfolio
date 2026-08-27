async function handleFormSubmit(event) {
    event.preventDefault();

    const form = event.target;
    const btn = event.target.querySelector('.submit-btn');
    const status = form.querySelector('.form-status');
    if (!btn || !status || !form.checkValidity()) {
        form.reportValidity();
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Sending...';
    status.textContent = 'Sending your message...';

    try {
        const response = await fetch(form.action, {
            method: 'POST',
            body: new FormData(form),
            headers: { Accept: 'application/json' }
        });

        if (!response.ok) {
            throw new Error('Formspree request failed');
        }

        form.reset();
        status.textContent = 'Message sent successfully. Thank you.';
    } catch (error) {
        status.textContent = 'Message could not be sent. Please email rexjemar@gmail.com.';
    } finally {
        btn.disabled = false;
        btn.textContent = 'Send message';
    }
}

export function initContact() {
    const form = document.querySelector('.contact-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
}
