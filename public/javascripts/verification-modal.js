document.addEventListener('DOMContentLoaded', () => {
        // Modal elements
        const verificationModal = document.getElementById('verification-modal');
        const resendBtn = document.getElementById('resend-verification');
        const changeEmailBtn = document.getElementById('change-email');
        const emailChangeForm = document.getElementById('email-change-form');
        const updateEmailForm = document.getElementById('update-email-form');
        const verificationMessage = document.getElementById('verification-message');
        const verificationErrorMessage = document.getElementById('verificationErrorMessage');

        // Only show verification modal if explicitly set to true
        if (verificationModal && verificationModal.dataset.showModal === 'true') {
            console.log('Showing verification modal - user email is not verified');
            showModal(verificationModal);
        } else if (verificationModal) {
            console.log('Not showing verification modal - data-show-modal is:', verificationModal.dataset.showModal);
            // Ensure modal stays hidden
            verificationModal.classList.add('hidden');
        }

        // Close modal when clicking on overlay or close button
        if (verificationModal) {
            verificationModal.querySelectorAll('[data-close]').forEach(element => {
                element.addEventListener('click', () => {
                    hideModal(verificationModal);
                });
            });
        }

        // Show email change form when clicking "Change email" button
        if (changeEmailBtn) {
            changeEmailBtn.addEventListener('click', () => {
                emailChangeForm.style.display = 'block';
                verificationMessage.style.display = 'none';
            });
        }

        // Handle email resend request
        if (resendBtn) {
            resendBtn.addEventListener('click', async () => {
                try {
                    const response = await fetch('/users/resend-verification', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    });

                    const data = await response.json();

                    verificationMessage.textContent = data.message;
                    verificationMessage.className = 'verification-modal__message';
                    verificationMessage.classList.add(data.success ? 'verification-modal__message--success' : 'verification-modal__message--error');
                    verificationMessage.style.display = 'block';

                    // Hide email change form if it's visible
                    emailChangeForm.style.display = 'none';
                } catch (error) {
                    console.error('Error resending verification email:', error);
                    verificationMessage.textContent = 'A apărut o eroare. Te rugăm să încerci din nou.';
                    verificationMessage.className = 'verification-modal__message verification-modal__message--error';
                    verificationMessage.style.display = 'block';
                }
            });
        }

        // Handle email update form submission
        if (updateEmailForm) {
            updateEmailForm.addEventListener('submit', async (e) => {
                e.preventDefault();

                const newEmail = document.getElementById('new-email').value;

                try {
                    const response = await fetch('/users/update-email', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ email: newEmail })
                    });

                    const data = await response.json();

                    verificationMessage.textContent = data.message;
                    verificationMessage.className = 'verification-modal__message';
                    verificationMessage.classList.add(data.success ? 'verification-modal__message--success' : 'verification-modal__message--error');
                    verificationMessage.style.display = 'block';

                    if (data.success) {
                        // Hide the form if successful
                        emailChangeForm.style.display = 'none';
                    }
                } catch (error) {
                    console.error('Error updating email:', error);
                    verificationMessage.textContent = 'A apărut o eroare. Te rugăm să încerci din nou.';
                    verificationMessage.className = 'verification-modal__message verification-modal__message--error';
                    verificationMessage.style.display = 'block';
                }
            });
        }

        // Helper functions for modals
        function showModal(modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }

        function hideModal(modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    });