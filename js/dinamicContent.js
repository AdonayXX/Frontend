function loadContent(page, containerId = 'mainContent') {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", page, true);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            var container = document.getElementById(containerId);
            if (container) {
                container.innerHTML = this.responseText;

                var scriptSrcs = container.querySelectorAll('[data-script]');
                scriptSrcs.forEach(function(scriptSrc) {
                    var script = document.createElement('script');
                    script.src = scriptSrc.getAttribute('data-script');
                    document.head.appendChild(script).parentNode.removeChild(script);
                });
            } else {
                console.error('Container with id ${containerId} not found');
            }
        }
    };
    xhr.send();
}