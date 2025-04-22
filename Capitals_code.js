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
  var API_KEY = "YOUR_API_KEY_HERE"; // Reemplaza con tu API Key válida.
  var geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY;
  
  var promptText;
  if (type === "paraphrase") {
    promptText = "Parafrasea el siguiente texto como si fueras diseñador/a de juegos de mesa, redactor/a técnico/a y editor/a de contenido lúdico. Corrige la gramática y la sintaxis, y mejora su claridad, coherencia y precisión, manteniendo el sentido original. El texto de salida debe ser un prárrafo, sin comentarios adicionales y directamente la mejor paráfrasis. Este es el texto: " + text;
  } else if (type === "translate") {
    promptText = "Translate the following text into English as if you were a board game designer, technical writer, and game content editor. Correct grammar and syntax during the translation, improve its clarity, coherence, and accuracy, while preserving the original meaning and tailoring it to good and formal English usage. The output must be a single paragraph with no comments—just the best possible translation. Here is the text: " + text
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
  var coloredText = text; // Removed the span tag here
  var elements = selection.getRangeElements();
  var lastParagraph = null;

  for (var i = elements.length - 1; i >= 0; i--) {
    var element = elements[i].getElement();
    if (element.getType() == DocumentApp.ElementType.PARAGRAPH) {
      lastParagraph = element;
      break;
    } else {
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
    var newParagraph = body.appendParagraph(coloredText);
    newParagraph.setForegroundColor("#38761d");
  } else {
    var insertionIndex = body.getChildIndex(lastParagraph) + 1;
    var newParagraph = body.insertParagraph(insertionIndex, coloredText);
    newParagraph.setForegroundColor("#38761d");
  }
}