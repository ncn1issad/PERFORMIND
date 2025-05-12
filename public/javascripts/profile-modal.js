document.addEventListener('DOMContentLoaded', function() {
    // Profile modal elements
    const profileModal = document.getElementById('profileModal');
    const profileLinks = document.querySelectorAll('.profileLink');
    const profileModalClose = profileModal?.querySelector('.modal-close');
    const profileModalOverlay = profileModal?.querySelector('.modal-overlay');

    // Open profile modal when clicking "Contul tău"
    profileLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (profileModal) profileModal.classList.remove('hidden');
        });
    });

    // Close profile modal
    if (profileModalClose) {
        profileModalClose.addEventListener('click', function() {
            profileModal.classList.add('hidden');
        });
    }

    if (profileModalOverlay) {
        profileModalOverlay.addEventListener('click', function() {
            profileModal.classList.add('hidden');
        });
    }
});