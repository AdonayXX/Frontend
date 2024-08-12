"use strict";

async function loadContent(page, containerId = 'mainContent') {
    try {
        const response = await fetch(page);
        if (!response.ok) {
            throw new Error(`Failed to load content from ${page}: ${response.status} ${response.statusText}`);
        }

        const content = await response.text();

        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = content;

            const scriptSrcs = container.querySelectorAll('[data-script]');
            scriptSrcs.forEach(scriptSrc => {
                const script = document.createElement('script');
                script.src = scriptSrc.getAttribute('data-script');
                script.async = true; 
                script.defer = true; 
                script.onerror = function() {
                };
                document.head.appendChild(script);
            });
        } else {
        }
    } catch (error) {
    }
}
