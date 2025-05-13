document.addEventListener('DOMContentLoaded', () => {
    // Check if showLogin parameter exists in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('showLogin')) {
        // Show login modal
        const loginModal = document.querySelector('#loginModal');
        if (loginModal && loginModal.classList.contains('hidden')) {
            loginModal.classList.remove('hidden');
        }

        // Remove the showLogin parameter from URL without reloading the page
        urlParams.delete('showLogin');
        const newUrl = window.location.pathname +
            (urlParams.toString() ? '?' + urlParams.toString() : '');
        history.replaceState({}, document.title, newUrl);
    }

    // Add modal switching functionality
    const switchToSignup = document.getElementById('switchToSignup');
    if (switchToSignup) {
        switchToSignup.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('#loginModal').classList.add('hidden');
            document.querySelector('#signupModal').classList.remove('hidden');
        });
    }

    const switchToLogin = document.getElementById('switchToLogin');
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            document.querySelector('#signupModal').classList.add('hidden');
            document.querySelector('#loginModal').classList.remove('hidden');
        });
    }
});
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

document.addEventListener('DOMContentLoaded', function() {
    // Handle signup form submission
    const signupForm = document.getElementById('signupForm');

    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const errorContainer = document.getElementById('signupErrorMessage');
            errorContainer.style.display = 'none';
            errorContainer.classList.remove('show');

            const formData = new FormData(signupForm);

            fetch('/users/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData)),
            })
            .then(response => {
                console.log('Signup response status:', response.status);
                // Always parse the JSON response regardless of status code
                return response.json().then(data => {
                    return { data, ok: response.ok };
                });
            })
            .then(result => {
                console.log('Signup response data:', result.data);
                if (!result.ok) {
                    // Display the server's error message
                    errorContainer.textContent = result.data.error || 'An unknown error occurred';
                    errorContainer.style.display = 'block';
                    errorContainer.classList.add('show');
                } else if (result.data.success) {
                    // Successful signup - redirect
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 100);
                }
            })
            .catch(error => {
                errorContainer.textContent = 'A apărut o eroare. Vă rugăm încercați din nou.';
                errorContainer.style.display = 'block';
                errorContainer.classList.add('show');
                console.error('Error:', error);
            });
        });
    }

    // Update the login form handler to use the new animation classes
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const errorContainer = document.getElementById('loginErrorMessage');
            errorContainer.style.display = 'none';
            errorContainer.classList.remove('show');

            const formData = new FormData(loginForm);
            const formDataObj = Object.fromEntries(formData);


            fetch('/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData)),
            })
            .then(response => {
                console.log('Response status:', response.status);
                // First check if the response is ok
                return response.json().then(data => {
                    return { data, ok: response.ok };
                });
            })
            .then(result => {
                console.log('Login response data:', result.data);
                if (!result.ok) {
                    // Display the server's error message
                    errorContainer.textContent = result.data.error || 'An unknown error occurred';
                    errorContainer.style.display = 'block';
                    errorContainer.classList.add('show');
                } else if (result.data.success) {
                    // Successful login - redirect
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 100);
                }
            })
            .catch(error => {
                errorContainer.textContent = 'A apărut o eroare. Vă rugăm încercați din nou.';
                errorContainer.style.display = 'block';
                errorContainer.classList.add('show');
                console.error('Error:', error);
            });
        });
    }
});