const mobileToggle = document.querySelector('.mobile-toggle');
const mobileNavModal = document.querySelector('.mobile-nav-modal');
const mobileNavClose = document.querySelector('.mobile-nav-close');
const mobileNavOverlay = document.querySelector('.mobile-nav-overlay');

if (mobileToggle && mobileNavModal) { // Ensure both elements are found
    mobileToggle.addEventListener('click', () => {
        mobileNavModal.classList.remove('hidden');
        document.body.classList.add('modal-is-open');
    });
}

if (mobileNavClose) {
    mobileNavClose.addEventListener('click', () => {
        mobileNavModal.classList.add('hidden');
        document.body.classList.remove('modal-is-open');
    });
}

if (mobileNavOverlay) {
    mobileNavOverlay.addEventListener('click', () => {
        mobileNavModal.classList.add('hidden');
        document.body.classList.remove('modal-is-open');
    });
}

// Close mobile menu when clicking on a link
document.querySelectorAll('.mobile-nav-content a').forEach(link => {
    link.addEventListener('click', () => {
        mobileNavModal.classList.add('hidden');
        document.body.classList.remove('modal-is-open');
    });
});