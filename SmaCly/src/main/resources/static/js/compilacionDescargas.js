window.__smaclyRefactor =window.__smaclyRefactor || {};
window.__smaclyRefactor.compilacionDescargasCargado = true;

    function seeVyperToDownload() {
    var logEvento = new LogEventButtonBlockly("transformBlockToVyper", workspace);
    logsEventos.push(logEvento); 
    comprobarGuardadoAutomaticoPorCantidad();
    var code = VyperGenerator.workspaceToCode(workspace);
    if(typeof establecerContenidoEditorCodigo === "function") {
        establecerContenidoEditorCodigo(code);
    } 
    else{
        var output = document.getElementById('XmlArea');
        output.value = code;
    }

    var output = document.getElementById('XmlArea');
    output.focus();
    output.select();
    }
    function saveVyperToDownload() {
    var logEvento = new LogEventButtonBlockly("downloadVyperCode", workspace);
    logsEventos.push(logEvento); 
    comprobarGuardadoAutomaticoPorCantidad();
    var code = VyperGenerator.workspaceToCode(workspace);
    var logAnalisisCorrespondenciasVyper = obtenerLogElementosNoContempladosVyper();//Se obtienen los elementos que al pasar de Solidity a Vyper no se contemplaron
    newWindow = window.open("data:application/octet-stream," + encodeURIComponent(code), getVyperFilenameFromWorkspace());
    download("VyperConversionLog.txt",logAnalisisCorrespondenciasVyper);
    }

    function seeSolidityToDownload() {
    var logEvento = new LogEventButtonBlockly("transformBlockToSolidity", workspace);
    logsEventos.push(logEvento); 
    comprobarGuardadoAutomaticoPorCantidad();
    var code = SolidityGenerator.workspaceToCode(workspace);
    if(typeof establecerContenidoEditorCodigo === "function"){
        establecerContenidoEditorCodigo(code);
    } 
    else{
        var output = document.getElementById('XmlArea');
        output.value = code;
    }
    var output = document.getElementById('XmlArea');
    output.focus();
    output.select();
    }

    function saveSolidityToDownload() {
    var code = SolidityGenerator.workspaceToCode(workspace);
    newWindow = window.open("data:application/octet-stream," + encodeURIComponent(code), 'webseite.sol');
    }


    /*
    PARÁMETRO DE ENTRADA: Resultado devuelto por el backend y nombre del lenguaje compilado
    DESCRIPCIÓN: Construye el texto completo del resultado de compilación incluyendo errores, advertencias e información adicional
    PARÁMETRO DE SALIDA: Texto que se mostrará en el cuadro de diálogo
    */
    function construirMensajeCompilacion(resultado, lenguaje) {
      var lineas = [];
      var compilacionCorrecta = resultado && resultado.resultadoCompilacion === true;
      if (compilacionCorrecta) {
        lineas.push(lenguaje + " compiled successfully.");
      }
      else {
        lineas.push(lenguaje + " compilation failed.");
      }
      if (resultado && resultado.mensaje) {
        lineas.push(String(resultado.mensaje));
      }

      var informacion = [];

      if (resultado && Array.isArray(resultado.informacion)) {
        informacion = resultado.informacion;
      }

      for (var i = 0; i < informacion.length; i++) {
        var item = informacion[i];
        var clase = "Information";
        var detalle = "";

        if (typeof item === "string") {
          detalle = item;
        }
        else if (item) {
          clase = item.claseMensaje || item.tipo || "Information";
          detalle = item.mensajeFormateado || item.mensaje || "";

          if (!detalle) {
            detalle = JSON.stringify(item, null, 2);
          }
        }

        if (detalle) {
          lineas.push(clase + ":\n" + detalle);
        }
      }

      if (lineas.length === 1 && resultado) {
        lineas.push(JSON.stringify(resultado, null, 2));
      }

      return lineas.join("\n\n");
    }


    async function compileSolidity() {
      try {
          // 1. Obtener el código Solidity generado desde Blockly
          const code = SolidityGenerator.workspaceToCode(workspace);
          if(!code || !code.trim()) {
            await mostrarMensajeEditor("Solidity compilation","No Solidity code was generated",true);
            return;
          }
          if(typeof establecerContenidoEditorCodigo === "function"){
            establecerContenidoEditorCodigo(code);
          } 
          else{
            const output = document.getElementById("XmlArea");
            if (output){
              output.value = code;
            }
          }
          //CONSTRUCCIÓN DEL JSON PARA LA COMPILACIÓN DEL CÓDIGO DE SOLIDITY
          const payload = {
          codigoFuenteContrato: code,
          nombreArchivoContrato: "ContratoGenerado.sol",
          optimizadorActivo: true,
          ejecucionesOptimizador: 200 /*VALORES CORTOS -> - BYTECODE + CORTO MENOS COSTE EN GAS AL DESPLEGAR, PERO - EFICIENTE AL DESPLEGAR
          // -- VALORES ALTOS -> + COSTE EN GAS AL DESPLEGAR  + EFECTIVO EN EJECUCIÓN*/
          };
          // SE LLAMA A LA FUNCION COMPILAR SOLIDITY DEL BACKEND JAVA PARA HACER USO DE SOLC
          const response = await fetch("/api/compilarSolidity", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
          });

          if(!response.ok){
            throw new Error("HTTP " + response.status);
          }
          const resultado = await response.json();
          //SE MUESTRA EL RESULTADO DEL PROCESO DE COMPILACIÓN            
          console.log("Solidity code compilation result:", resultado);
          var mensaje = construirMensajeCompilacion(resultado,"Solidity");
          await mostrarMensajeEditor("Solidity compilation",mensaje,true);
          if (resultado.contratosCompilados || resultado.contratos) {
            console.log("Compiled Solidity contracts:",resultado.contratosCompilados || resultado.contratos);
          }
      }
      catch (error) {
          console.error("Compilation error:", error);
          await mostrarMensajeEditor("Solidity compilation","Error connecting to the Java compiler:\n\n" + error.message, true);
      }
    }


    async function compileVyper() {
    try {
        // 1. Obtener el código Vyper generado desde Blockly
        const code = VyperGenerator.workspaceToCode(workspace);
        if (!code || !code.trim()) {
          await mostrarMensajeEditor( "Vyper compilation","No Vyper code was generated",true);
          return;
        }
        if (typeof establecerContenidoEditorCodigo === "function") {
          establecerContenidoEditorCodigo(code);
        } 
        else {
          const output = document.getElementById("XmlArea");
          if (output) {
            output.value = code;
          }
        }
        //CONSTRUCCIÓN DEL JSON DE ENVÍO PARA EL COMPILADOR DE VYPER
        const payload = {
          codigoFuenteContrato: code,
          nombreArchivoContrato: getVyperFilenameFromWorkspace(),
          optimizadorActivo: true,
          ejecucionesOptimizador: 200
        };
        // SE LLAMA A LA FUNCION COMPILAR DEL BACKEND JAVA
        const response = await fetch("/api/compilarVyper", {
          method: "POST",
          headers: {
              "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          throw new Error("HTTP " + response.status);
        }

        const resultado = await response.json();

        console.log("Vyper code compilation result:", resultado);
        var mensaje = construirMensajeCompilacion(resultado,"Vyper");
        await mostrarMensajeEditor("Vyper compilation",mensaje,true);
        if(resultado.contratosCompilados || resultado.contratos){
            console.log("Compiled Vyper contracts:",resultado.contratosCompilados || resultado.contratos);
          }
        }
    catch (error) {
      console.error("Compilation error:", error);
      await mostrarMensajeEditor("Vyper compilation","Error connecting to the Python compiler:\n\n" + error.message,true);
    }
  }



  function download(filename, textInput) {
    var logEvento = new LogEventButtonBlockly("downloadSolidity",workspace);
    logsEventos.push(logEvento); 
    comprobarGuardadoAutomaticoPorCantidad();
    var element = document.createElement('a');
    element.setAttribute('href','data:text/plain;charset=utf-8, ' + encodeURIComponent(textInput));
    element.setAttribute('download', filename);
    document.body.appendChild(element);
    element.click();
    //document.body.removeChild(element);
  }

  function getSolidityFilenameFromWorkspace() {
    const DEFAULT_FILENAME = "output";
    const FILE_BLOCK_PLACEHOLDER = "Insert here file's name";
    try {
      if (!window.workspace) return DEFAULT_FILENAME + ".sol";
      // Buscar bloque "file"
      const fileBlock = window.workspace.getAllBlocks(false).find(b => b.type === "file");
      if (!fileBlock) return DEFAULT_FILENAME + ".sol";
      let rawName = fileBlock.getFieldValue("name");
      rawName = (rawName ?? "").trim();
      // Si está vacío o no se cambió el placeholder -> output
      if (!rawName || rawName === FILE_BLOCK_PLACEHOLDER) {
        return DEFAULT_FILENAME + ".sol";
      }
      // Evitar caracteres inválidos para el nombre del archivo
      let safeName = rawName
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_") 
        .replace(/\s+/g, "_")                   
        .replace(/\.+$/g, "")                  
        .trim();

      if(!safeName){
        return DEFAULT_FILENAME + ".sol";
      }
      // Para que el contrato no pueda duplicar extensión
      if (!safeName.toLowerCase().endsWith(".sol")) {
        safeName += ".sol";
      }

      return safeName;
    } 
    catch (error) {
      console.error("Error getting Solidity filename:", e);
      return DEFAULT_FILENAME + ".sol";
    }
}

 function getVyperFilenameFromWorkspace() {
    const DEFAULT_FILENAME = "output";
    const FILE_BLOCK_PLACEHOLDER = "Insert here file's name";
    try {
      if (!window.workspace) return DEFAULT_FILENAME + ".vy";
      // Se busca el bloque "file" que es el que contiene el nombre del archivo que queremos definir para el modelo construido con bloques
      const fileBlock = window.workspace.getAllBlocks(false).find(b => b.type === "file");
      if (!fileBlock) return DEFAULT_FILENAME + ".vy";
      let rawName = fileBlock.getFieldValue("name");
      rawName = (rawName ?? "").trim();
      // PARA CONTROLAR SI EL USUARIO NO CAMBIÓ EL VALOR POR DEFECTO DEL BLOQUE FILE
      if (!rawName || rawName === FILE_BLOCK_PLACEHOLDER) {
        return DEFAULT_FILENAME + ".vy";
      }
      // Evitar caracteres inválidos para el nombre del archivo
      let safeName = rawName
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, "_") 
        .replace(/\s+/g, "_")                   
        .replace(/\.+$/g, "")                  
        .trim();

      if(!safeName){
        return DEFAULT_FILENAME + ".vy";
      }
      // Para que el contrato no pueda duplicar extensión
      if (!safeName.toLowerCase().endsWith(".vy")) {
        safeName += ".vy";
      }

      return safeName;
    } 
    catch (error) {
      console.error("Error getting Vyper filename:", e);
      return DEFAULT_FILENAME + ".vy";
    }
}
