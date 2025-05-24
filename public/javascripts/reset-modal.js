// Immediately-Invoked Function Expression to create scope and prevent global pollution
(function() {
    // Flag to track if we've already initialized
    let initialized = false;

    // Main initialization function
    function initResetForms() {
        // Only run once
        if (initialized) return;
        initialized = true;

        console.log('[reset-modal] Initializing reset forms at', new Date().toISOString());

        // Handle the dedicated reset page with token
        initResetPageForm();

        // Handle the modal reset form
        initModalResetForm();
    }

    // Initialize the form on the password reset page
    function initResetPageForm() {
        const resetPageForm = document.querySelector('form[data-token]');
        if (!resetPageForm) return;

        const token = resetPageForm.dataset.token;
        console.log('[reset-modal] Found reset page form with token');

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

    // Initialize the form in the login modal
    function initModalResetForm() {
        const loginForm = document.getElementById('loginForm');
        const resetContainer = document.querySelector('.reset-password-container');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');

        // Exit if any required element is missing
        if (!loginForm || !resetContainer || !forgotPasswordLink) {
            console.log('[reset-modal] Missing required elements for modal reset form');
            return;
        }

        const resetPasswordForm = document.getElementById('resetPasswordForm');
        if (!resetPasswordForm) return;

        const modalTitle = document.querySelector('.modal__title');
        const modalFooter = document.querySelector('.modal__footer');

        console.log('[reset-modal] Setting up forgot password link');

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

        // Set up back button (only once)
        if (!document.querySelector('.reset-back-button')) {
            const backButton = document.createElement('button');
            backButton.textContent = 'Înapoi la autentificare';
            backButton.className = 'btn-link reset-back-button';
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
        }

        // If there's an existing form, replace it with a clone to remove event listeners
        const newForm = resetPasswordForm.cloneNode(true);
        resetPasswordForm.parentNode.replaceChild(newForm, resetPasswordForm);

        console.log('[reset-modal] Setting up reset password form submit');

        // Add fresh event listener to the new form
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('resetEmail').value;
            console.log('[reset-modal] Submit event handler at', new Date().toISOString(), 'email:', email);

            const messageEl = document.getElementById('resetMessage');

            try {
                const response = await fetch('/users/reset-request', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                console.log('[reset-modal] Fetch completed at', new Date().toISOString());

                const data = await response.json();
                messageEl.textContent = data.success
                    ? 'Email-ul pentru resetarea parolei a fost trimis.'
                    : (data.error || 'A apărut o eroare.');

                messageEl.className = data.success ? 'alert alert-success' : 'alert alert-danger';
                messageEl.style.display = 'block';
            } catch (error) {
                console.error('[reset-modal] Error:', error);
                messageEl.textContent = 'A apărut o eroare la trimiterea cererii.';
                messageEl.className = 'alert alert-danger';
                messageEl.style.display = 'block';
            }
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initResetForms);
    } else {
        // DOM already loaded, run immediately
        initResetForms();
    }
})();