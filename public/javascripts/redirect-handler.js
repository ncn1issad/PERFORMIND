// Create a new script file: public/javascripts/redirect-handler.js
document.addEventListener('DOMContentLoaded', function() {
  // Get all signup links
  const signupLinks = document.querySelectorAll('.signupLink, .btn.signupLink');

  // Check if user is logged in by looking for user data in session
    const isLoggedIn = document.documentElement.dataset.userLoggedIn === 'true';

    // Add click event listener to each signup link
  signupLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      if (isLoggedIn) {
        e.preventDefault();
        // Redirect to coming-soon page instead of opening the signup modal
        window.location.href = '/coming-soon';
      }
      // If not logged in, let the default signup modal behavior happen
    });
  });
});