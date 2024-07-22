"use strict";
function loadContent(page, containerId = 'mainContent') {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", page, true);
    xhr.onreadystatechange = function () {
        if (this.readyState === 4) {
            if (this.status === 200) {
                var container = document.getElementById(containerId);
                if (container) {
                    container.innerHTML = this.responseText;

                    var scriptSrcs = container.querySelectorAll('[data-script]');
                    scriptSrcs.forEach(function(scriptSrc) {
                        var script = document.createElement('script');
                        script.src = scriptSrc.getAttribute('data-script');
                        script.async = true;  
                        script.defer = true;
                        document.head.appendChild(script);
                    });
                } else {
                    console.error(`Container with id ${containerId} not found`);
                }
            } else {
                console.error(`Failed to load content from ${page}: ${this.status} ${this.statusText}`);
            }
        }
    };
    xhr.onerror = function() {
        console.error(`Network error while attempting to load ${page}`);
    };
    xhr.send();
}
