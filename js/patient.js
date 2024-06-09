console.log ("Entro en patient.js");
document.getElementById('searchPatient').addEventListener('keyup', function() {
    let input = document.getElementById('searchPatient').value.toLowerCase();
    let table = document.getElementById('tablePatient');
    let rows = table.getElementsByTagName('tr');

    for (let i = 1; i < rows.length; i++) {
        let cells = rows[i].getElementsByTagName('td');
        let match = false;
        for (let j = 0; j < cells.length; j++) {
            if (cells[j].innerText.toLowerCase().includes(input)) {
                match = true;
                break;
            }
        }
        rows[i].style.display = match ? '' : 'none';
    }
});