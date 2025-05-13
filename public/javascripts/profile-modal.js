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

    // Grade editing functionality
    const editGradeBtn = document.getElementById('editGradeBtn');
    const editGradeForm = document.getElementById('editGradeForm');
    const cancelEditGrade = document.getElementById('cancelEditGrade');
    const updateGradeForm = document.getElementById('updateGradeForm');
    const currentGradeElement = document.getElementById('currentGrade');
    const updateGradeError = document.getElementById('updateGradeError');

    if (editGradeBtn) {
        console.log("Edit grade button found");
        editGradeBtn.addEventListener('click', function() {
            editGradeForm.classList.remove('hidden');
            // Pre-select current grade
            const gradeSelect = updateGradeForm.querySelector('select[name="grade"]');
            if (gradeSelect && currentGradeElement) {
                gradeSelect.value = currentGradeElement.textContent.trim();
            }
        });
    } else {
    console.log("Edit grade button not found");
    }

    if (cancelEditGrade) {
        cancelEditGrade.addEventListener('click', function() {
            editGradeForm.classList.add('hidden');
            updateGradeError.style.display = 'none';
        });
    }

    if (updateGradeForm) {
        updateGradeForm.addEventListener('submit', function(e) {
            e.preventDefault();

            updateGradeError.style.display = 'none';
            const formData = new FormData(updateGradeForm);

            fetch('/users/update-grade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(Object.fromEntries(formData)),
            })
                .then(response => {
                    return response.json().then(data => {
                        return { data, ok: response.ok };
                    });
                })
                .then(result => {
                    if (!result.ok) {
                        updateGradeError.textContent = result.data.error || 'An unknown error occurred';
                        updateGradeError.style.display = 'block';
                    } else {
                        // Update displayed grade
                        currentGradeElement.textContent = formData.get('grade');
                        editGradeForm.classList.add('hidden');
                    }
                })
                .catch(error => {
                    updateGradeError.textContent = 'A apărut o eroare. Vă rugăm încercați din nou.';
                    updateGradeError.style.display = 'block';
                    console.error('Error:', error);
                });
        });
    }
});