const qs = sel => document.querySelectorAll(sel);
const toggle = modalIdSelector => {
    const modalElement = document.querySelector(modalIdSelector);
    if (modalElement) {
        modalElement.classList.toggle('hidden');
    }
};

qs('.loginLink') .forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        toggle('#loginModal');
    });
});
qs('.signupLink').forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        toggle('#signupModal');
    });
});

// close buttons & overlay clicks
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target.classList.contains('modal__overlay') || e.target.classList.contains('modal__close')) {
            // Ensure the modal is hidden, not toggled, when clicking close/overlay
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        }
    });
});