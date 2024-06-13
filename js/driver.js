(function() {
    var acompananteCount = 0;

    document.getElementById('btnAddAcompanante').addEventListener('click', function() {
        if (acompananteCount < 2) {
            acompananteCount++;
            document.getElementById('acompanante' + acompananteCount).style.display = 'block';
        }
    });

    document.getElementById('btnRemoveAcompanante').addEventListener('click', function() {
        if (acompananteCount > 0) {
            document.getElementById('acompanante' + acompananteCount).style.display = 'none';
            acompananteCount--;
        }
    });
})();