let voiceRecognitionEnabled = false;
const voiceLogs = [];
function enableVoiceRecognition() {
	if (annyang) {
		let commands = {
			"crear bloque file": () => {
				createBlock("file");
			},
			"generar bloque file": () => {
				createBlock("file");
			},
			"definir bloque file": () => {
				createBlock("file");
			},
			"crear version.": () => {
				createBlock("version");
			},
			"generar version.": () => {
				createBlock("version");
			},
			"definir version.": () => {
				createBlock("version");
			},
			"crear bloque version.": () => {
				createBlock("version");
			},
			"generar bloque version.": () => {
				createBlock("version");
			},
			"definir bloque version.": () => {
				createBlock("version");
			},
			"conecta version a file.": () => {
				connectToExistingBlock('version', 'file', "version_file");
			},
			"conecta bloque version a bloque file.": () => {
				connectToExistingBlock('version', 'file', "version_file");
			},
			"conectar bloque version a bloque file.": () => {
				connectToExistingBlock('version', 'file', "version_file");
			},
			"create import": () => {
				createBlock("import");
			},
			"generate import": () => {
				createBlock("import");
			},
			"define import": () => {
				createBlock("import");
			},
			"crear alias.": () => {
				createBlock("alias_import");
			},
			"generar alias.": () => {
				createBlock("alias_import");
			},
			"definir alias.": () => {
				createBlock("alias_import");
			},
			"crear bloque alias.": () => {
				createBlock("alias_import");
			},
			"generar bloque alias.": () => {
				createBlock("alias_import");
			},
			"definir bloque alias.": () => {
				createBlock("alias_import");
			},
			"connect alias to import": () => {
				connectToExistingBlock('alias_import', 'import', "alias");
			},
			"connect contract to contract": () => {
				connectToExistingBlock('contract', 'contract');
			},
			"crear library.": () => {
				createBlock("library");
			},
			"generar library.": () => {
				createBlock("library");
			},
			"definir library.": () => {
				createBlock("library");
			},
			"crear bloque library.": () => {
				createBlock("library");
			},
			"generar bloque library.": () => {
				createBlock("library");
			},
			"definir bloque library.": () => {
				createBlock("library");
			},
			"create interface": () => {
				createBlock("interface");
			},
			"generate interface": () => {
				createBlock("interface");
			},
			"define interface": () => {
				createBlock("interface");
			},
			"create interface function": () => {
				createBlock("interface_clausedeclaration");
			},
			"generate interface function": () => {
				createBlock("interface_clausedeclaration");
			},
			"define interface function": () => {
				createBlock("interface_clausedeclaration");
			},
			'connect interface function to interface': () => {
				connectToExistingBlock('interface_clausedeclaration', 'interface', 'interface_functions');
			},
			"connect interface to interface": () => {
				connectToExistingBlock('interface', 'interface');
			},
			"create abstract contract": () =>{
				createBlock("abstract_contract");
			},
			"generate abstract contract": () => {
				createBlock("abstract_contract");
			},
			"define abstract contract": () => {
				createBlock("abstract_contract");
			},
			"create abstract contract": () =>{
				createBlock("abstract_contract");
			},
			"generate abstract contract": () => {
				createBlock("abstract_contract");
			},
			"define abstract contract": () => {
				createBlock("abstract_contract");
			},
			"crear bloque contract.": () => {
				createBlock("contract");
			},
			"generar bloque contract.": () => {
				createBlock("contract");
			},
			"definir bloque contract.": () => {
				createBlock("contract");
			},
			"crear contract.": () => {
				createBlock("contract");
			},
			"generar contract.": () => {
				createBlock("contract");
			},
			"definir contract.": () => {
				createBlock("contract");
			},
			"crear contrato": () => {
				createBlock("contract");
			},
			"generar contrato": () => {
				createBlock("contract");
			},
			"definir contrato": () => {
				createBlock("contract");
			},
			"crear constructor.": () => {
				createBlock("constructor");
			},
			"generar constructor.": () => {
				createBlock("constructor");
			},
			"definir constructor.": () => {
				createBlock("constructor");
			},
			"crear bloque constructor.": () => {
				createBlock("constructor");
			},
			"generar bloque constructor.": () => {
				createBlock("constructor");
			},
			"definir bloque constructor.": () => {
				createBlock("constructor");
			},
			"crear modifier.": () => {
				createBlock("modifier");
			},
			"generar modifier.": () => {
				createBlock("modifier");
			},
			"definir modifier.": () => {
				createBlock("modifier");
			},
			"crear bloque modifier.": () => {
				createBlock("modifier");
			},
			"generar bloque modifier.": () => {
				createBlock("modifier");
			},
			"definir bloque modifier.": () => {
				createBlock("modifier");
			},
			"create restriction": () => {
				createBlock("restriction_clausecomment");
			},
			"define restriction": () => {
				createBlock("restriction_clausecomment");
			},
			"generate restriction": () => {
				createBlock("restriction_clausecomment");
			},
			"crear evento": () => {
				createBlock("event");
			},
			"generar evento": () => {
				createBlock("event");
			},
			"definir evento": () => {
				createBlock("event");
			},
			"crear bloque evento": () => {
				createBlock("event");
			},
			"generar bloque evento": () => {
				createBlock("event");
			},
			"definir bloque evento": () => {
				createBlock("event");
			},
			"crea rfunción": () => {
				createBlock("clause");
			},
			"generar función": () => {
				createBlock("clause");
			},
			"definir función": () => {
				createBlock("clause");
			},
			"crear bloque funcion": () => {
				createBlock("clause");
			},
			"generar bloque función": () => {
				createBlock("clause");
			},
			"definir bloque función": () => {
				createBlock("clause");
			},
			"crea usuario": () => {
				createBlock("block_user");
			},
			"genera usuario": () => {
				createBlock("block_user");
			},
			"definir usuario": () => {
				createBlock("block_user");
			},	
			"crear bloque usuario": () => {
				createBlock("block_user");
			},
			"generar bloque usuario": () => {
				createBlock("block_user");
			},
			"definir bloque usuario": () => {
				createBlock("block_user");
			},			
			"crear compañía": () => {
				createBlock("block_company");
			},
			"genera compañía": () => {
				createBlock("block_company");
			},
			"definir compañía": () => {
				createBlock("block_company");
			},
			"crear bloque compañía": () => {
				createBlock("block_company");
			},
			"generar bloque compañía": () => {
				createBlock("block_company");
			},
			"define bloque compañía": () => {
				createBlock("block_company");
			},
			"create using expression": () => {
				createBlock("block_usinglibrary");
			},
			"generate using expression": () => {
				createBlock("block_usinglibrary");
			},
			"define using expression": () =>{
				createBlock("block_usinglibrary");
			},
			"create shift expression": () => {
				createBlock("shift_expression");
			},
			"generate shift expression": () => {
				createBlock("shift_expression");
			},
			"define shift expression": () =>{
				createBlock("shift_expression");
			},
			"create emit expression": () => {
				createBlock("emit_event");
			},
			"generate emit expression": () => {
				createBlock("emit_event");
			},
			"define emit expression": () =>{
				createBlock("emit_event");
			},
			"crea expresión emit": () => {
				createBlock("emit_event");
			},
			"genera expresión emit": () => {
				createBlock("emit_event");
			},
			"define expresión emit": () =>{
				createBlock("emit_event");
			},
			"crear bloque expresión emit.": () => {
				createBlock("emit_event");
			},
			"generar bloque expresión emit.": () => {
				createBlock("emit_event");
			},
			"definir bloque expresión emit.": () =>{
				createBlock("emit_event");
			},
			"crear expresión tiempo.": () => {
				createBlock("time_expression");
			},
			"generar expresión tiempo.": () => {
				createBlock("time_expression");
			},
			"definir expresión tiempo.": () =>{
				createBlock("time_expression");
			},
			"crear bloque expresión tiempo.": () => {
				createBlock("time_expression");
			},
			"generar bloque expresión .": () => {
				createBlock("time_expression");
			},
			"definir bloque expresión tiempo.": () =>{
				createBlock("time_expression");
			},
			"create assign value expression": () => {
				createBlock("assign_value_expression");
			},
			"generate assign value expression": () => {
				createBlock("assign_value_expression");
			},
			"define assign value expression": () =>{
				createBlock("assign_value_expression");
			},
			"create var expression": () => {
				createBlock("var_expression");
			},
			"generate var expression": () => {
				createBlock("var_expression");
			},
			"define expresion var": () =>{
				createBlock("var_expression");
			},
			"define variable expresion": () =>{
				createBlock("var_expression");
			},
			"crear bloque variable.": () => {
				createBlock("blockvariables");
			},
			"generar bloque variable.": () => {
				createBlock("blockvariables");
			},
			"definir bloque variable.": () =>{
				createBlock("blockvariables");
			},
			"crear msg variable.": () => {
				createBlock("msgvariables");
			},
			"generar msg variable.": () => {
				createBlock("msgvariables");
			},
			"definir msg variable.": () =>{
				createBlock("msgvariables");
			},
			"crear bucle while.": () => {
				createBlock("block_whileloop");
			},
			"generar bucle while.": () => {
				createBlock("block_whileloop");
			},
			"definir bucle while.": () =>{
				createBlock("block_whileloop");
			},
			"crear bloque while.": () => {
				createBlock("block_whileloop");
			},
			"generar bloque while.": () => {
				createBlock("block_whileloop");
			},
			"definir bloque while.": () =>{
				createBlock("block_whileloop");
			},
			"crear bucle do while.": () => {
				createBlock("block_dowhile");
			},
			"generar bucle do .": () => {
				createBlock("block_dowhile");
			},		
			"definir bucle do while.": () =>{
				createBlock("block_dowhile");
			},
			"crear bloque do while.": () => {
				createBlock("block_dowhile");
			},
			"generar bloque do while.": () => {
				createBlock("block_dowhile");
			},		
			"definir bloque do while.": () =>{
				createBlock("block_dowhile");
			},
			"crear bucle for.": () => {
				createBlock("block_for");
			},
			"generar bucle for.": () => {
				createBlock("block_for");
			},
			"definir bucle for.": () =>{
				createBlock("block_for");
			},
			"show file": () =>{
				expandCategoryByName("File");
			},
			"show interface": () =>{
				expandCategoryByName("Interface");
			},
			"show import": () =>{
				expandCategoryByName("Import");
			},
			"show library": () =>{
				expandCategoryByName("Library");
			},
			"mostrar modifier": () =>{
				expandCategoryByName("Modifier");
			},
			"mostrar categoría event": () =>{
				expandCategoryByName("Event");
			},
			"mostrar evento": () =>{
				expandCategoryByName("Event");
			},
			"show abstract contract": () =>{
				expandCategoryByName("Abstract Contract");
			},
			"show contract": () =>{
				expandCategoryByName("Contract");
			},
			"show function": () =>{
				expandCategoryByName("Function");
			},
			"show types": () =>{
				expandCategoryByName("Types");
			},
			"ayuda herramienta": () => {
				const url = 'https://github.com/KybeleResearch/SmaC/tree/main/SmaCly'; // Ayuda sobre SmaC
				window.open(url, '_blank', 'noopener noreferrer');
			},
			"ayuda smacly": () => {
				const url = 'https://github.com/KybeleResearch/SmaC/tree/main/SmaCly'; // Ayuda sobre SmaC
				window.open(url, '_blank', 'noopener noreferrer');
			},
			"ayuda solidity": () => {
				const url = 'https://docs.soliditylang.org/en/v0.8.19/'; // Ayuda sobre Solidity
				window.open(url, '_blank', 'noopener noreferrer');
			},
			"ayuda sobre solidity": () => {
				const url = 'https://docs.soliditylang.org/en/v0.8.19/'; // Ayuda sobre Solidity
				window.open(url, '_blank', 'noopener noreferrer');
			},
			"documentación sobre solidity": () => {
				const url = 'https://docs.soliditylang.org/en/v0.8.19/'; // Ayuda sobre Solidity
				window.open(url, '_blank', 'noopener noreferrer');
			},
			"registra log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked == false) {
					logCheck.click(); // Simula un clic del ratón en el elemento checkbox
					logCheck.checked = true;
				}
			},
			"marca log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked == false) {
					logCheck.click(); // Simula un clic del ratón en el elemento checkbox
					logCheck.checked = true;
				}
			},			
			"transforma a código Solidity": () => {
				seeSolidityToDownload();
			},
			"convierte a código Solidity": () => {
				seeSolidityToDownload();
			},
			"muestra código Solidity": () => {
				seeSolidityToDownload();
			},
			"descarga código Solidity": () => {
				saveSolidityToDownload();
			},
			"guarda código Solidity": () => {
				saveSolidityToDownload();
			},
			"ver código Blockly": () => {
				toXml();
			},
			"ver código bloques": () => {
				toXml();
			},
			"generar código bloques": () => {
				toXml();
			},
			"generar código Blockly": () => {
				toXml();
			},
			"genera XML": () => {
				toXml();
			},
			"guarda XML": () => {
				saveXml();
			},
			"guarda bloques": () => {
				saveXml();
			},
			"guarda código blockly": () => {
				saveXml();
			},
			"guardar XML": () => {
				saveXml();
			},
			"guardar bloques": () => {
				saveXml();
			},
			"guardar código blockly": () => {
				saveXml();
			},
			"obtener código blockly": () => {
				saveXml();
			},
			"convierte a bloques": () => {
				fromXml();
			},
			"transforma a bloques": () => {
				fromXml();
			},
			"transforma a blockly": () => {
				fromXml();
			},
			"convertir a bloques": () => {
				fromXml();
			},
			"transformar a bloques": () => {
				fromXml();
			},
			"transformar a blockly": () => {
				fromXml();
			},
			"guardar log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					saveLog();
				}
			},
			"obtener log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					saveLog();
				}
			},
			"descargar log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					saveLog();
				}
			},
			"apagar log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					logCheck.click(); // Simula un clic del ratón en el elemento checkbox
					logCheck.checked = false;
				}
			},
			"desactivar log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					logCheck.click(); // Simula un clic del ratón en el elemento checkbox
					logCheck.checked = false;
				}
			},
			"desmarcar log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					logCheck.click(); // Simula un clic del ratón en el elemento checkbox
					logCheck.checked = false;
				}
			},
			"limpiar bloques.": () => {
				cleanWorkspace();
			},
			"remover bloques.": () => {
				cleanWorkspace();
			},
			"limpiar workspace.": () => {
				cleanWorkspace();
			},
			"limpiar área de trabajo.": () => {
				cleanWorkspace();
			},
			"abortar audio": () => {
				disableVoiceRecognition();
			},
			"desactivar audio": () => {
				disableVoiceRecognition();
			},
			"apagar audio": () => {
				disableVoiceRecognition();
			},
		};

		annyang.addCommands(commands);
		annyang.setLanguage('es');
		// Registra el evento 'resultMatch'
		annyang.addCallback('resultMatch', (userSaid, commandText, phrases) => {
			console.log('User said:', userSaid);
			console.log('Command matched:', commandText);
			console.log('Other possible phrases:', phrases);		
			// Almacena el log de voz en el array
			voiceLogs.push({
				id:  ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)),
				type: 'match',
				userSaid,
				commandText,
				phrases,
				timestamp: new Date(),
			});
		});

		// Registra el evento 'resultNoMatch'
		annyang.addCallback('resultNoMatch', (phrases) => {
			console.log('No command matched:', phrases);

			// Almacena el log de voz en el array
			voiceLogs.push({
				id: ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)),
				type: 'no_match',
				phrases,
				timestamp: new Date(),
			});
		});
		annyang.start({ autoRestart: true, continuous: true }); // Asegura que el reconocimiento de voz se reinicie automáticamente y sea continuo
	} else {
		$(document).ready(function () {
			$('#unsupported').fadeIn('fast');
		});
	}
}

// Función para descargar los logs de voz en un archivo JSON
function saveVoiceLogs() {
	if (voiceLogs.length === 0) {
		alert('No hay registros de voz para descargar.');
		return;
	}
	else{
		// Convierte el array de logs de voz en una cadena JSON
		const voiceLogsJSON = JSON.stringify(voiceLogs, null, 2);
		
		// Crea un Blob con los datos del archivo JSON
		const blob = new Blob([voiceLogsJSON], { type: 'application/json' });

		// Crea un enlace temporal y asigna el Blob como su contenido
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'voice_logs.json';

		// Agrega el enlace al DOM, activa un clic y luego lo elimina
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		// Libera el objeto URL
		URL.revokeObjectURL(url);
	}
}

function disableVoiceRecognition() {
	annyang.abort();
}

function toggleVoiceRecognition() {
	voiceRecognitionEnabled = !voiceRecognitionEnabled;
	let button = document.getElementById("toggleButton");
	if (voiceRecognitionEnabled) {
		button.value = "🔇Disable voice recognition";
		let buttonSaveLog =  document.getElementById("saveLogVoiceButton");
		buttonSaveLog.disabled = false;
		enableVoiceRecognition();
		document.getElementById("toggleButton").innerText = "Deshabilitar reconocimiento de voz";
	} else {
		button.value = "🎙️Enable voice recognition";
		disableVoiceRecognition();
		document.getElementById("toggleButton").innerText = "Habilitar reconocimiento de voz";
	}
}

function expandCategoryByName(categoryName) {
	const workspace = Blockly.getMainWorkspace();
	const toolbox = workspace.getToolbox();
	const categories = toolbox.getToolboxItems()[0];
  
	for (let category of categories) {
	  if (category.getHtml().innerHTML === categoryName) {
		toolbox.setSelectedItem(category);
		break;
	  }
	}
}

function createBlock(blockType) {
	const workspace = Blockly.getMainWorkspace();
	const newBlock = workspace.newBlock(blockType);

	newBlock.initSvg();
	newBlock.render();

	const topBlocks = workspace.getTopBlocks();
	let currentPositionX = 0;
	let currentPositionY = 0;

	if (topBlocks.length > 0) {
		const lastBlock = topBlocks[topBlocks.length - 1];
		const lastBlockMetrics = lastBlock.getHeightWidth();
		currentPositionX = lastBlock.getRelativeToSurfaceXY().x + lastBlockMetrics.width + 50;
		currentPositionY = lastBlock.getRelativeToSurfaceXY().y;
	}

	newBlock.moveBy(currentPositionX, currentPositionY);
}

function connectToExistingBlock(newBlockType, targetBlockType) {
	// Crear el nuevo bloque
	const newBlock = createBlock(newBlockType);

	// Encontrar el bloque objetivo en el área de trabajo
	const allBlocks = workspace.getAllBlocks();
	const targetBlock = allBlocks.find(block => block.type === targetBlockType);

	if (targetBlock) {
		// Conectar el nuevo bloque al bloque objetivo
		const targetConnection = targetBlock.nextConnection;
		const newBlockConnection = newBlock.previousConnection;

		if (targetConnection && newBlockConnection) {
			try {
				targetConnection.connect(newBlockConnection);
			} catch (e) {
				console.error('Error al conectar los bloques:', e);
			}
		} else {
			console.error('No se pudo encontrar la conexión adecuada para conectar los bloques');
		}
	} else {
		console.error('No se encontró el bloque objetivo');
	}
}


function connectToExistingBlock(sourceType, targetType, inputName) {
	const sourceBlocks = workspace.getTopBlocks().filter(block => block.type === sourceType);
	const targetBlocks = workspace.getTopBlocks().filter(block => block.type === targetType);

	if (sourceBlocks.length === 0 || targetBlocks.length === 0) {
		console.error('No se encontró el bloque fuente o el bloque objetivo');
		return;
	}

	const sourceBlock = sourceBlocks[sourceBlocks.length - 1];
	const targetBlock = targetBlocks[targetBlocks.length - 1];

	const sourceConnection = sourceBlock.outputConnection;
	const targetConnection = targetBlock.getInput(inputName).connection;

	if (sourceConnection && targetConnection) {
		sourceConnection.connect(targetConnection);
	} else {
		console.error('No se pudo conectar el bloque fuente al bloque objetivo');
	}
}


