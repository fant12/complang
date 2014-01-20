/**
 * @brief Pr&uuml;ft das TextArea-Element des Formulars auf fehlerhafte Eingaben, bevor die
 * Daten abgeschickt werden.
 * @description Es sind nur Wörter erlaubt (bestehend aus mindestens 2 Buchstaben), die 
 * immer mindestens einen Vokal (länderspezif. Sonderzeichen dazugenommen) enthalten.
 */ 
function checkForm(){

    var textArea = document.forms[0].elements[1].value;
    textArea = textArea.replace(/[\"\u201C\u201D\u201E\u0022]/g, ""); //Sonderzeichen für dt. Anfuehrungszeichen entfernen
    
    /*
     * Saetze bestehen aus Woertern
     *  case insensitive Suche toleriert Rechtschreibfehler
     *  Jedes Wort hat mindestens einen Vokal
     *  Jedes Wort besteht aus mindestens einem Buchstaben (z.B.: I, y, e)
     *  Wörter mit 2 Buchstaben beginnen nicht mit norwegischen Buchstaben oder dem dt. Umlaut ü|Ü
     *  norwegische Sonderzeichen sind nur innerhalb eines Wortes, nicht am Wortrand
     * Satzzeichen muessen erlaubt sein
     *  Nur ? ! . duerfen mehrmals hintereinander vorkommen, . nur dreimal 
     * 
        ^(\s*[a-zA-ZäåáàâæéèêíìîöóòôøüúùûÄÁÀÂÉÈÊÍÌÎÖÓÒÔÜÚÙÛ]+[\.\!\?\'\:,;]*\s*)+$
    */
    var regex = /^(\s*[a-zA-ZäåáàâæéèêíìîöóòôøüúùûÄÁÀÂÉÈÊÍÌÎÖÓÒÔÜÚÙÛ]+[\.\!\?\'\:,\-;]*\s*)+$/;
    var warning = "Bitte richtige Wörter eintragen! Nur folgende Sonderzeichen: ' : , - ; dürfen verwendet werden, jedoch nicht doppelt aufeinanderfolgend.";

    if(null !== textArea.match(regex)){
        
        switch(textArea.length){
            case 1: 
                if(1 === textArea.match(/[aáàâeéèêiíìîoóòôuúùûyAÁÀÂEÉÈÊIÍÌÎOÓÒÔUÚÙÛY]/g).length) //ohne dt. Umlaute und norweg. Buchstaben
                    document.forms[0].submit();
                else
                    alert(warning);
                break;
            case 2:
                //Satzzeichen erlaubt, da dann gleicher Fall wie bei case 1
                if(1 <= textArea.match(/[aäáàâæeéèêiíìîoöóòôøuüúùûyAÄÁÀÂEÉÈÊIÍÌÎOÖÓÒÔUÜÚÙÛY]/g).length)
                    document.forms[0].submit();
                else
                    alert(warning);
                break;
            default:
                
                /*
                    ^(
                        \s*
                        (
                            ([^\.\?\!æø;:,\-\'äöüÄÖÜ])|
                            (
                                ([aäáàâeéèêiíìîoöóòôuúùûyAÄÁÀÂEÉÈÊIÍÌÎOÖÓÒÔUÚÙÛY][^aåáàâeéèêiíìîoóòôuúùûyAÁÀÂEÉÈÊIÍÌÎOÓÒÔUÚÙÛY])|
                                ([^aáàâeéèêiíìîoóòôuúùûyAÁÀÂEÉÈÊIÍÌÎOÓÒÔUÚÙÛY][aåáàâeéèêiíìîoóòôuúùûyAÁÀÂEÉÈÊIÍÌÎOÓÒÔUÚÙÛYæø,])
                            )|
                            (
                                (([^\.\?\!æø;:,\-\'])+([^\.\?\!;:,\-\']{2,}))|
                                ([^\.\?\!æø;:,\-\']+\-?[^\.\?\!æø;:,\-\']{2,})|
                                ([^\.\?\!æø;:,\-\']+\'?[^\.\?\!æø;:,\-\']{1,2})
                            )
                        )(([\!\?]*)|(\.{0,3})|([\:,;]?))
                        \s*
                    )+$
                */
                var regex2 = /(\s*(([^\.\?\!æø;:,\-\'äöüÄÖÜ])|(([aäáàâeéèêiíìîoöóòôuúùûyAÄÁÀÂEÉÈÊIÍÌÎOÖÓÒÔUÚÙÛY][^aáàâeéèêiíìîoóòôuúùûyAÁÀÂEÉÈÊIÍÌÎOÓÒÔUÚÙÛY])|([^aáàâeéèêiíìîoóòôuúùûyAÁÀÂEÉÈÊIÍÌÎOÓÒÔUÚÙÛY][aäáàâeéèêiíìîoöóòôuúùûyAÄÁÀÂEÉÈÊIÍÌÎOÖÓÒÔUÚÙÛYæø,]))|((([^\.\?\!æø;:,\-\'])+([^\.\?\!;:,\-\']{2,}))|([^\.\?\!æø;:,\-\']+\-?[^\.\?\!æø;:,\-\']{2,})|([^\.\?\!æø;:,\-\']+\'?[^\.\?\!æø;:,\-\']{1,2})))(([\!\?]*)|(\.{1,2})|([\:,;]?))\s*)+$/;

                //regex + bestimmte Sonderzeichen duerfen nicht mehr als einmal auf einmal vorkommen
                if(-1 === textArea.search(/[\'\:,\-;]{2,}/) && regex2.test(textArea))
                    document.forms[0].submit();
                else
                    alert(warning);
        }
    }
    else alert(warning);
}
