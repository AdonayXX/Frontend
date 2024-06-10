var acompananteCount = 0;

document.getElementById('addAcompananteBtn').addEventListener('click', function() {
    if (acompananteCount < 2) {
        acompananteCount++;
        document.getElementById('acompanante' + acompananteCount).style.display = 'block';
    }
});

document.getElementById('removeAcompananteBtn').addEventListener('click', function() {
    if (acompananteCount > 0) {
        document.getElementById('acompanante' + acompananteCount).style.display = 'none';
        acompananteCount--;
    }
});
