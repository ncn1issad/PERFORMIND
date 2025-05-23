document.addEventListener('DOMContentLoaded', () => {
        // First, handle the reset form on the dedicated reset page (with token)
        const resetPageForm = document.querySelector('form[data-token]');
        if (resetPageForm) {
            const token = resetPageForm.dataset.token;
            resetPageForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const password = document.getElementById('password').value;
                const confirm = document.getElementById('confirm').value;
                const messageEl = document.getElementById('resetMessage');

                try {
                    const response = await fetch(`/users/reset-password/${token}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ password, confirm })
                    });

                    const data = await response.json();
                    messageEl.textContent = data.success
                        ? 'Parola a fost resetată cu succes. Vei fi redirecționat...'
                        : (data.error || 'A apărut o eroare.');

                    messageEl.className = data.success ? 'alert alert-success' : 'alert alert-danger';
                    messageEl.style.display = 'block';

                    if (data.success) {
                        setTimeout(() => {
                            window.location.href = '/';
                        }, 3000);
                    }
                } catch (error) {
                    messageEl.textContent = 'A apărut o eroare la trimiterea cererii.';
                    messageEl.className = 'alert alert-danger';
                    messageEl.style.display = 'block';
                }
            });
        }

        // Then handle the login modal with reset password request
        const loginForm = document.getElementById('loginForm');
        const resetContainer = document.querySelector('.reset-password-container');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');

        // Only proceed with modal logic if the necessary elements exist
        if (loginForm && resetContainer && forgotPasswordLink) {
            const resetPasswordForm = document.getElementById('resetPasswordForm');
            const modalTitle = document.querySelector('.modal__title');
            const modalFooter = document.querySelector('.modal__footer');

            // Show reset password form when forgot password link is clicked
            forgotPasswordLink.addEventListener('click', function(e) {
                e.preventDefault();
                loginForm.style.display = 'none';
                resetContainer.style.display = 'block';

                if (modalTitle) modalTitle.textContent = 'Resetare parolă';
                if (modalFooter) modalFooter.style.display = 'none';

                const loginErrorMessage = document.getElementById('loginErrorMessage');
                if (loginErrorMessage) loginErrorMessage.style.display = 'none';
            });

            // Add a back button to the reset form
            const backButton = document.createElement('button');
            backButton.textContent = 'Înapoi la autentificare';
            backButton.className = 'btn-link';
            backButton.style.marginTop = '1rem';
            backButton.style.background = 'none';
            backButton.style.border = 'none';
            backButton.style.color = 'var(--accent)';
            backButton.style.cursor = 'pointer';
            backButton.style.padding = '0';

            backButton.addEventListener('click', function(e) {
                e.preventDefault();
                resetContainer.style.display = 'none';
                loginForm.style.display = 'block';

                if (modalTitle) modalTitle.textContent = 'Intră în cont';
                if (modalFooter) modalFooter.style.display = 'block';

                const resetMessage = document.getElementById('resetMessage');
                if (resetMessage) resetMessage.style.display = 'none';
            });

            resetContainer.appendChild(backButton);

            // Handle password reset request form
            if (!resetPasswordForm.hasAttribute('data-listener-attached')) {
                resetPasswordForm.setAttribute('data-listener-attached', 'true');
                resetPasswordForm.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const email = document.getElementById('resetEmail').value;
                    const messageEl = document.getElementById('resetMessage');

                    try {
                        const response = await fetch('/users/reset-request', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ email })
                        });

                        const data = await response.json();
                        messageEl.textContent = data.success
                            ? 'Email-ul pentru resetarea parolei a fost trimis.'
                            : (data.error || 'A apărut o eroare.');

                        messageEl.className = data.success ? 'alert alert-success' : 'alert alert-danger';
                        messageEl.style.display = 'block';
                    } catch (error) {
                        console.error('Error:', error);
                        messageEl.textContent = 'A apărut o eroare la trimiterea cererii.';
                        messageEl.className = 'alert alert-danger';
                        messageEl.style.display = 'block';
                    }
                });
            }
        }
    });