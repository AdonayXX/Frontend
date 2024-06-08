var modal = document.getElementById("myModal");
var btn = document.getElementById("addSpecialtyBtn");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
    modal.style.display = "block";
}

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

document.getElementById("saveSpecialtyBtn").onclick = function() {
    var newSpecialty = document.getElementById("newSpecialty").value;
    if (newSpecialty) {
        var checkboxContainer = document.getElementById("checkbox-container");
        var checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.name = "especialidades";
        checkbox.value = newSpecialty;
        checkbox.checked = true;

        var label = document.createElement("label");
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + newSpecialty));
        
        checkboxContainer.appendChild(label);
        checkboxContainer.appendChild(document.createElement("br"));

        document.getElementById("newSpecialty").value = "";
        modal.style.display = "none";
    } else {
        alert("Por favor, ingrese una especialidad.");
    }
}
