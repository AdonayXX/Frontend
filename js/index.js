"use strict";
document.addEventListener('DOMContentLoaded', function() {
loadFilterModules();
});
function loadFilterModules(){
    document.getElementById('searchmodules').addEventListener('input', function() {
        let filter = this.value.toLowerCase();
        let items = document.querySelectorAll('.items');

        items.forEach(function(item) {
            let text = item.textContent.toLowerCase();
            if (text.includes(filter)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });
    });
}
