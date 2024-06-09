var acompananteCount = 0;

document.getElementById('addAcompananteBtn').addEventListener('click', function() {
    if (acompananteCount < 2) {
        acompananteCount++;
        document.getElementById('contactoEmergencia' + acompananteCount).style.display = 'block';
        document.getElementById('contactoEmergencia' + acompananteCount).querySelector('input').focus();
    }
});

document.getElementById('removeAcompananteBtn').addEventListener('click', function() {
    if (acompananteCount > 0) {
        document.getElementById('contactoEmergencia' + acompananteCount).style.display = 'none';
        acompananteCount--;
    }
});