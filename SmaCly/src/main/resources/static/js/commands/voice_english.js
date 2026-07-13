let voiceRecognitionEnabled = false;
const voiceLogs = [];
function enableVoiceRecognition() {
	if (annyang) {
		let commands = {
			"create file": () => {
				createBlock("file");
			},
			"generate file": () => {
				createBlock("file");
			},
			"define file": () => {
				createBlock("file");
			},
			"create version": () => {
				createBlock("version");
			},
			"generate version": () => {
				createBlock("version");
			},
			"define version": () => {
				createBlock("version");
			},
			"connect version to file": () => {
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
			"create alias": () => {
				createBlock("alias_import");
			},
			"generate alias": () => {
				createBlock("alias_import");
			},
			"define alias": () => {
				createBlock("alias_import");
			},
			"connect alias to import": () => {
				connectToExistingBlock('alias_import', 'import', "alias");
			},
			"connect contract to contract": () => {
				connectToExistingBlock('contract', 'contract');
			},
			"create library": () => {
				createBlock("library");
			},
			"generate library": () => {
				createBlock("library");
			},
			"define library": () => {
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
			"create contract": () => {
				createBlock("contract");
			},
			"generate contract": () => {
				createBlock("contract");
			},
			"define contract": () => {
				createBlock("contract");
			},
			"create constructor": () => {
				createBlock("constructor");
			},
			"generate constructor": () => {
				createBlock("constructor");
			},
			"define constructor": () => {
				createBlock("constructor");
			},
			"create modifier": () => {
				createBlock("modifier");
			},
			"generate modifier": () => {
				createBlock("modifier");
			},
			"define modifier": () => {
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
			"create event": () => {
				createBlock("event");
			},
			"generate event": () => {
				createBlock("event");
			},
			"define event": () => {
				createBlock("event");
			},
			"create function": () => {
				createBlock("clause");
			},
			"generate function": () => {
				createBlock("clause");
			},
			"define function": () => {
				createBlock("clause");
			},
			"create user": () => {
				createBlock("block_user");
			},
			"generate user": () => {
				createBlock("block_user");
			},
			"define user": () => {
				createBlock("block_user");
			},			
			"create company": () => {
				createBlock("block_company");
			},
			"generate company": () => {
				createBlock("block_company");
			},
			"define company": () => {
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
			"create time expression": () => {
				createBlock("time_expression");
			},
			"generate time expression": () => {
				createBlock("time_expression");
			},
			"define time expression": () =>{
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
			"define var expression": () =>{
				createBlock("var_expression");
			},
			"create block variable": () => {
				createBlock("blockvariables");
			},
			"generate block variable": () => {
				createBlock("blockvariables");
			},
			"define block variable": () =>{
				createBlock("blockvariables");
			},
			"create msg variable": () => {
				createBlock("msgvariables");
			},
			"generate msg variable": () => {
				createBlock("msgvariables");
			},
			"define msg variable": () =>{
				createBlock("msgvariables");
			},
			"create while loop": () => {
				createBlock("block_whileloop");
			},
			"generate while loop": () => {
				createBlock("block_whileloop");
			},
			"define while loop": () =>{
				createBlock("block_whileloop");
			},
			"create while loop": () => {
				createBlock("block_dowhile");
			},
			"generate while loop": () => {
				createBlock("block_dowhile");
			},		
			"define do while loop": () =>{
				createBlock("block_dowhile");
			},
			"create for loop": () => {
				createBlock("block_for");
			},
			"generate for loop": () => {
				createBlock("block_for");
			},
			"define do for loop": () =>{
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
			"show modifier": () =>{
				expandCategoryByName("Modifier");
			},
			"show event": () =>{
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
			"help tool": () => {
				const url = 'https://github.com/KybeleResearch/SmaC/tree/main/SmaCly'; // Ayuda sobre SmaC
				window.open(url, '_blank', 'noopener noreferrer');
			},
			"help solidity": () => {
				const url = 'https://docs.soliditylang.org/en/v0.8.19/'; // Ayuda sobre Solidity
				window.open(url, '_blank', 'noopener noreferrer');
			},
			"register log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked == false) {
					logCheck.click(); // Simula un clic del ratón en el elemento checkbox
					logCheck.checked = true;
				}
			},
			"check log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked == false) {
					logCheck.click(); // Simula un clic del ratón en el elemento checkbox
					logCheck.checked = true;
				}
			},			
			"transform to solidity code": () => {
				seeSolidityToDownload();
			},
			"convert to solidity code": () => {
				seeSolidityToDownload();
			},
			"show solidity code": () => {
				seeSolidityToDownload();
			},
			"download solidity code": () => {
				saveSolidityToDownload();
			},
			"save solidity code": () => {
				saveSolidityToDownload();
			},
			"see blockly code": () => {
				toXml();
			},
			"generate blockly code": () => {
				toXml();
			},
			"generate XML": () => {
				toXml();
			},
			"save XML": () => {
				saveXml();
			},
			"save blocks": () => {
				saveXml();
			},
			"save blockly code": () => {
				saveXml();
			},
			"get blockly code": () => {
				saveXml();
			},
			"convert to blocks": () => {
				fromXml();
			},
			"transform to blocks": () => {
				fromXml();
			},
			"transform to blockly": () => {
				fromXml();
			},
			"save log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					saveLog();
				}
			},
			"get log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					saveLog();
				}
			},
			"download log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					saveLog();
				}
			},
			"off log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					logCheck.click(); // Simula un clic del ratón en el elemento checkbox
					logCheck.checked = false;
				}
			},
			"disable log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					logCheck.click(); // Simula un clic del ratón en el elemento checkbox
					logCheck.checked = false;
				}
			},
			"unchecked log": () => {
				let logCheck = document.getElementById("logCheck");
				if (logCheck.checked) {
					logCheck.click(); // Simula un clic del ratón en el elemento checkbox
					logCheck.checked = false;
				}
			},
			"clean blocks": () => {
				cleanWorkspace();
			},
			"remove blocks": () => {
				cleanWorkspace();
			},
			"clean workspace": () => {
				cleanWorkspace();
			},
			"abort audio": () => {
				disableVoiceRecognition();
			},
			"disable audio": () => {
				disableVoiceRecognition();
			},
			"off audio": () => {
				disableVoiceRecognition();
			},
		};

		annyang.addCommands(commands);
		annyang.setLanguage('en');
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


