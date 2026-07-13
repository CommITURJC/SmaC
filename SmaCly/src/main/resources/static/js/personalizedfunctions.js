
  var dataStr = "data:text/json;charset=utf-8,"; // Codificación del documento a crear para guardar los logs
  var downloadAnchorNode = document.createElement('a'); //Creación de un elemento para la descarga del archivo de los logs
  var idFile; //Para asignar al resto de bloques el ID del bloque Fichero
  let mapBlocks = new Map();




function saveHtmlToDownload() {
  var code = HtmlGenerator.workspaceToCode(workspace);
  newWindow = window.open("data:application/octet-stream," + encodeURIComponent(code), 'webseite.html');
}


  function assignIdFileBlock(){
    if(e.type == "File"){
      return e.blockId;
    }
  }
  
