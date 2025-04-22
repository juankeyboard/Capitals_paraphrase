// Agrega un menú personalizado a Google Docs al abrir el documento.
function onOpen() {
    DocumentApp.getUi()
      .createMenu("Capitals")
      .addItem("Abrir editor de paráfrasis", "showEditor")
      .addToUi();
  }
  
  // Muestra la barra lateral con las opciones de paráfrasis.
  function showEditor() {
    var html = HtmlService.createHtmlOutputFromFile('Capitals_addons')
        .setTitle("Capitals - Redacción");
    DocumentApp.getUi().showSidebar(html);
  }
  
  /**
   * Esta función maneja la paráfrasis del texto seleccionado.
   */
  function runParaphrase(type) {
    var doc = DocumentApp.getActiveDocument();
    var selection = doc.getSelection();
    if (!selection) {
      DocumentApp.getUi().alert("Por favor, seleccione el texto para paráfrasis.");
      return;
    }
  
    // Extrae el texto seleccionado y lo concatena en una sola cadena.
    var selectedText = extractSelectedText(selection);
    if (!selectedText) {
      DocumentApp.getUi().alert("La selección no contiene texto.");
      return;
    }
  
    // Envía a la API utilizando el prompt específico según el tipo, añadiendo el texto original.
    var paraphrasedText = getParaphrasedText(selectedText, type);
    if (!paraphrasedText) return; // Error manejado internamente.
  
    // Inserta el texto paráfraseado en el documento.
    insertParaphrasedText(doc, selection, paraphrasedText);
  }
  
  // Extrae el texto de la selección conservando los atributos del primer elemento con texto.
  function extractSelectedText(selection) {
    var elements = selection.getRangeElements();
    var selectedText = "";
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      if (element.getElement().editAsText) {
        var textElement = element.getElement().asText();
        var start = element.getStartOffset();
        var end = element.getEndOffsetInclusive();
        selectedText += textElement.getText().substring(start, end + 1) + "\n";
      }
    }
    return selectedText.trim();
  }
  
  /**
   * Envía a la API de Gemini el prompt de paráfrasis correspondiente según el tipo seleccionado,
   * añadiendo al final el texto original.
   *
   * @param {string} text - El texto seleccionado.
   * @param {string} type - El tipo de paráfrasis ("conocimientos", "habilidades" o "actitudes").
   * @returns {string|null} - El texto paráfraseado retornado por la API o null en caso de error.
   */
  function getParaphrasedText(text, type) {
    var API_KEY = "AIzaSyAvfrg8OUtcZbt-1TA7AKzhL73fNqtB7dk"; // Reemplaza con tu API Key válida.
    var geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;
    
    var promptText;
    if (type === "paraphrase") {
      promptText = "Parafrasea el siguiente enunciado corrigiendo la gramática y la sintaxis, resaltando un logro de aprendizaje adquirido por jóvenes aprendices de teatro. El resultado debe presentarse en un único párrafo que inicie directamente con máximo dos verbos formulados en presente y en plural, elegidos entre los siguientes: analizar, clasificar, comparar, comprender, comprobar, conocer, definir, demostrar, describir, diferenciar, distinguir, elegir, enumerar, evaluar, explicar, expresar, generalizar, identificar, inducir, inferir, localizar, memorizar, planear, razonar, reconocer, recordar, resolver, relacionar, sintetizar, señalar. Este logro debe introducir una oración clara que exprese lo que los participantes han alcanzado conceptualmente seguido de ejemplos vivenciales concretos que ilustren dicho logro, describiendo cómo los participantes reflexionan sobre uno de estos temas; autoestima, identidad cultural, comunicación. Identificando y analizando creativamente situaciones relevantes de su realidad para transformarlas en expresiones teatrales. Mantén el sentido original del texto, pero mejora su claridad, coherencia y precisión."
        + "\n\nTexto original:\n" + text;
    } else if (type === "translate") {
      promptText = "traduceme el siguiente texto: " + text
    }
    
    if (!promptText) return;
    
    var payload = {
      
      "contents": [{
        "parts": [{
          "text": promptText
        }]
      }]
    };
  
    var options = {
      "method": "post",
      "contentType": "application/json",
      "payload": JSON.stringify(payload)
    };
  
    try {
      var response = UrlFetchApp.fetch(geminiUrl, options);
      var data = JSON.parse(response.getContentText());

      if (data.candidates && data.candidates.length > 0 && data.candidates[0].content.parts.length > 0) {
        return data.candidates[0].content.parts[0].text;
      } else {
        throw new Error("Respuesta de la API no válida.");
      }
    } catch (error) {
      Logger.log("Error al llamar a la API de Gemini: " + error.message);
      DocumentApp.getUi().alert("Error al llamar a la API de Gemini: " + error.message);
      return null;
    }
  }
  
  /**
   * Inserta el texto paráfraseado en el documento justo después de la selección.
   * Se busca el párrafo adecuado en la jerarquía del documento para asegurar que sea un hijo directo del Body.
   */
  function insertParaphrasedText(doc, selection, text) {
    var body = doc.getBody();
    var elements = selection.getRangeElements();
    var lastParagraph = null;
    
    // Recorre los elementos de la selección en orden inverso para buscar el último párrafo.
    for (var i = elements.length - 1; i >= 0; i--) {
      var element = elements[i].getElement();
      if (element.getType() == DocumentApp.ElementType.PARAGRAPH) {
        lastParagraph = element;
        break;
      } else {
        // Busca el padre de tipo párrafo
        var parent = element.getParent();
        while (parent && parent.getType() != DocumentApp.ElementType.PARAGRAPH && parent !== body) {
          parent = parent.getParent();
        }
        if (parent && parent.getType() == DocumentApp.ElementType.PARAGRAPH) {
          lastParagraph = parent;
          break;
        }
      }
    }
    
    if (!lastParagraph) {
      // Si no se encontró ningún párrafo, se añade al final del documento.
      body.appendParagraph(text).editAsText().setForegroundColor("#0000FF");
    } else {
      var insertionIndex = body.getChildIndex(lastParagraph) + 1;
      body.insertParagraph(insertionIndex, text)
          .editAsText().setForegroundColor("#0000FF");
    }
  }
