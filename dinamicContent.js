function loadConten(page){
    var xhr = new XMLHttpRequest();
    xhr.open("GET", page, true);
    xhr.onreadystatechange = function(){
        if(this.readyState == 4 && this.status == 200){
            document.querySelector(".main-content").innerHTML = this.responseText;
        }
    }
    xhr.send();
}