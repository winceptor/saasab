function showSuggestions(str) {

    if (str.length == 0) {
        document.getElementById("suggestions").innerHTML = "";
        document.getElementById("suggestions").style.border = "0px";
        return;
    }
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        var xmlhttp = new XMLHttpRequest();
    }

    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {

            var suggestions = JSON.parse(this.responseText).result;
            var suggestionBox = document.getElementById("suggestions");
            suggestionBox.innerHTML = '';

            for (var i = 0; i < suggestions.length; i++) {
                var suggestionElement = document.createElement('option');
                suggestionElement.value = suggestions[i].valmistenumero2;
                suggestionBox.appendChild(suggestionElement);
            }

            suggestionBox.style.border = "1px solid #A5ACB2";
        }
    }
    xmlhttp.open("GET", "/ajoneuvodata_api/search?query=" + str, true);
    xmlhttp.send();
}
