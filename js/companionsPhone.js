const PhoneBtn = document.getElementById('PhoneBtn1');
const phonebtn2 = document.getElementById('PhoneBtn2');
const acompananteTelefono2_1Div = document.getElementById('acompanantePhone');
const acompananteTelefono2_2Div = document.getElementById('acompanantePhone2');

function cambiarEstiloBoton(btn, div) {
    if (div.style.display === 'none' || div.style.display === '') {
        btn.style.backgroundColor = '#198754'; 
    } else {
        btn.style.backgroundColor = '#DC3545'; 
    }
}
PhoneBtn.addEventListener('click', function() {
    if (acompananteTelefono2_1Div.style.display === 'none' || acompananteTelefono2_1Div.style.display === '') {
        acompananteTelefono2_1Div.style.display = 'block';
        PhoneBtn.innerHTML = '<i class="bi bi-telephone-minus-fill"></i>';
    } else {
        acompananteTelefono2_1Div.style.display = 'none';
        PhoneBtn.innerHTML = '<i class="bi bi-telephone-plus-fill"></i>';
    }
    cambiarEstiloBoton(PhoneBtn, acompananteTelefono2_1Div);
});

phonebtn2.addEventListener('click', function() {
    if (acompananteTelefono2_2Div.style.display === 'none' || acompananteTelefono2_2Div.style.display === '') {
        acompananteTelefono2_2Div.style.display = 'block';
        phonebtn2.innerHTML = '<i class="bi bi-telephone-minus-fill"></i>';
    } else {
        acompananteTelefono2_2Div.style.display = 'none';
        phonebtn2.innerHTML = '<i class="bi bi-telephone-plus-fill"></i>';
    }
    
    cambiarEstiloBoton(phonebtn2, acompananteTelefono2_2Div);
});

cambiarEstiloBoton(PhoneBtn, acompananteTelefono2_1Div);
cambiarEstiloBoton(phonebtn2, acompananteTelefono2_2Div);
