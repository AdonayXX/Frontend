function toggleSidebar() {
    document.body.classList.toggle('open-sidebar');
}

function closeSidebar() {
    document.body.classList.remove('open-sidebar');
}

document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('click', function(event) {
        var sidebar = document.querySelector('.sidebar');
        var toggleButton = document.querySelector('.navbar-brand');

        var isClickInsideSidebar = sidebar.contains(event.target);
        var isClickOnToggle = toggleButton.contains(event.target);

        if (!isClickInsideSidebar && !isClickOnToggle) {
            closeSidebar();
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.sidebar a').forEach(function(link) {
        link.addEventListener('click', closeSidebar);
    });
});
