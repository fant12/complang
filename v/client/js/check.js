/**
 * @brief Pr&uuml;ft das TextArea-Element des Formulars auf fehlerhafte Eingaben, bevor die
 * Daten abgeschickt werden.
 * @description Es sind nur Wörter erlaubt (bestehend aus mindestens 2 Buchstaben), die 
 * immer mindestens einen Vokal (länderspezif. Sonderzeichen dazugenommen) enthalten.
 */ 
function checkForm(){

    var textArea = document.forms[0].elements[1].value.replace(/\s/g, "");
    var words = textArea.search(/(\s*[a-zA-ZäåáàâæéèêíìîöóòôøüúùûÄÁÀÂÉÈÊÍÌÎÖÓÒÔÜÚÙÛ]+\s*)+/);
    
    // Jedes Wort darf nur aus Buchstaben und Whitespaces bestehen
    if(-1 !== words && 1 < textArea.length){
        // Jedes Wort muss mindestens ein Vokal beinhalten, sonst ist es kein Wort
        var vocals = textArea.match(/[aäåáàâæeéèêiíìîoöóòôøuüúùûAÄÁÀÂEÉÈÊIÍÌÎOÖÓÒÔUÜÚÙÛ]/g);
        if((3 > textArea.length && null !== vocals && 1 === vocals.length) || (null !== vocals))
            document.forms[0].submit();
        else 
            alert("Bitte richtige Wörter (bestehend aus mindestens 2 Buchstaben) eintragen.");
    }
    else
        alert("Bitte richtige Wörter (bestehend aus mindestens 2 Buchstaben) eintragen.");
}