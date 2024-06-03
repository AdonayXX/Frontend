document.addEventListener('DOMContentLoaded', (event) => {
    let today = new Date().toISOString().split('T')[0];
    let dateInputs = document.querySelectorAll('.date-input');
    dateInputs.forEach(input => {
        input.setAttribute('min', today);
    });
});