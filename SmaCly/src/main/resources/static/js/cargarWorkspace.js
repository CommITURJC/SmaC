var nombreWorkspaceActual = '';//Variable para recoger el nombre del workspace
var rolUsuarioActual = 'USER';//Identificador del rol

async function esperarWorkspaceBlockly() {
    var intentos = 0;

    while (!window.workspace && intentos < 100) {
        await new Promise(function (resolve) {
            setTimeout(resolve, 100);
        });
        intentos = intentos + 1;
    }
}


document.addEventListener('DOMContentLoaded', async function () {
  const btnNuevo = document.getElementById('nuevoWorkspace');
  const btnUltimo = document.getElementById('ultimoWorkspace');
  await esperarWorkspaceBlockly();
  const seCargoWorkspace = await cargarWorkspaceSeleccionadoTabla();
  if(!seCargoWorkspace){
    mostrarModalInicioWorkspace();
  }
  if(btnNuevo) {
    btnNuevo.addEventListener('click', function () {
      cerrarModalInicioWorkspace();
    });
  }

  if (btnUltimo) {
    btnUltimo.addEventListener('click', async function () {
      cerrarModalInicioWorkspace();
      await cargarUltimoWorkspace();
    });
  }
});

function mostrarModalInicioWorkspace() {
    const modal = document.getElementById('modalInicioWorkspace');
    if(modal){
        modal.style.display = 'flex';
    }
}

function cerrarModalInicioWorkspace() {
    const modal = document.getElementById('modalInicioWorkspace');
    if(modal){
        modal.style.display = 'none';
    }
}
async function cargarWorkspacePorId(workspaceId) {
    if(!workspaceId){
        return false;
    }
    try {
        const res = await fetch('/api/cargarWorkspace', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(workspaceId)
        });
        //para poderver el mensaje que devuelve Spring cuando hay un 500
        const textoRespuesta = await res.text();

        if (!res.ok) {
            console.error( 'Error returned by backend:',textoRespuesta);
            throw new Error('The workspace could not be loaded. HTTP '+ res.status);
        }
        if(!textoRespuesta || textoRespuesta.trim() === ''){
            throw new Error( 'The server returned an empty response');
        }

        const data = JSON.parse(textoRespuesta);

        if (!data) {
            alert('The workspace could not be loaded');
            return false;
        }
        if(!data.xml) {
            alert('The workspace does not contain any XML content');
            return false;
        }
        if(data.nombreWorkspace){
            nombreWorkspaceActual = data.nombreWorkspace;
        } 
        else{
            nombreWorkspaceActual = '';
        }

        var xmlDom = Blockly.Xml.textToDom(data.xml);
        window.workspace.clear();
        Blockly.Xml.appendDomToWorkspace(xmlDom, window.workspace);

        if(data.codigoSolidity){
            const textareaCodigo = document.getElementById('textareaCodigo');
            if(textareaCodigo){
                textareaCodigo.value = data.codigoSolidity;
            }
        }
        if(data.templateCopy === true){
        //La plantilla se trata como un workspace nuevo
        localStorage.removeItem('workspaceIdActual');
        if(typeof workspaceIdActual !== 'undefined'){
            workspaceIdActual = '';
        }
        } 
        else if (data.id){
            localStorage.setItem('workspaceIdActual', data.id);
            if(typeof workspaceIdActual !== 'undefined'){
                workspaceIdActual = data.id;
            }
        } 
        else{
            localStorage.removeItem('workspaceIdActual');
            if(typeof workspaceIdActual !== 'undefined'){
                workspaceIdActual = '';
            }
        }
        return true;
    } 
    catch(error){
        console.error(error);
        alert('Error loading the workspace');
        return false;
    }
}

async function cargarWorkspaceSeleccionadoTabla() {
    const workspaceIdSeleccionado = localStorage.getItem('workspaceIdSeleccionado');
    if (!workspaceIdSeleccionado) {
        return false;
    }
    const cargado = await cargarWorkspacePorId(workspaceIdSeleccionado);
    if (cargado) {
        localStorage.removeItem('workspaceIdSeleccionado');
        return true;
    }
    return false;
}


async function cargarUltimoWorkspace() {
    try {
        const res = await fetch('/api/ultimoWorkspace');
        if(!res.ok){
            throw new Error('The latest workspace could not be retrieved');
        }
        const data = await res.json();
        if(!data || !data.id){
            alert('There is no recent workspace for this user');
            return;
        }
        await cargarWorkspacePorId(data.id);
    } 
    catch(error){
        console.error(error);
        alert('Error loading the last workspace');
    }
}

function actualizarBotonesModalWorkspace() {
    var inputNombre = document.getElementById('nombreWorkspaceModal');
    var btnGuardar = document.getElementById('guardarWorkspaceModalBtn');
    var btnSobreescribir = document.getElementById('sobreescribirWorkspaceModalBtn');
    var workspaceIdActual = localStorage.getItem('workspaceIdActual');
    if(!inputNombre || !btnGuardar || !btnSobreescribir){
        return;
    }
    var nombreEscrito = inputNombre.value.trim();
    if(!workspaceIdActual){
        btnGuardar.style.display = 'inline-block';
        btnSobreescribir.style.display = 'none';
        return;
    }
    if (nombreWorkspaceActual && nombreEscrito === nombreWorkspaceActual){
        btnGuardar.style.display = 'none';
        btnSobreescribir.style.display = 'inline-block';
    }
    else{
        btnGuardar.style.display = 'inline-block';
        btnSobreescribir.style.display = 'inline-block';
    }
}

/*
PARÁMETRO DE ENTRADA: Ninguno
DESCRIPCIÓN: Abre un cuadro de dialogo para poder establecer un nombre e indicar si se quiere guardar el codigo Solidity o Vyper (EL XML LO GUARDA POR DEFECTO)
*/
function abrirModalGuardarWorkspace() {
    var modal = document.getElementById('modalGuardarWorkspace');
    var inputNombre = document.getElementById('nombreWorkspaceModal');
    var textareaXml = document.getElementById('xmlWorkspaceModal');
    if(!window.workspace){
        alert('El editor todavía no está listo.');
        return;
    }
    var xmlDom = Blockly.Xml.workspaceToDom(window.workspace);
    var xmlTexto = Blockly.Xml.domToText(xmlDom);
    textareaXml.value = xmlTexto;
    if(nombreWorkspaceActual && nombreWorkspaceActual !== ''){
        inputNombre.value = nombreWorkspaceActual;
    } 
    else{
        inputNombre.value = '';
    }
    actualizarBotonesModalWorkspace();
    modal.style.display = 'flex';
}

function cerrarModalGuardarWorkspace() {
    var modal = document.getElementById('modalGuardarWorkspace');
    if (modal){
        modal.style.display = 'none';
    }
}

function obtenerCodigoSoliditySiHaceFalta() {
    var checkSolidity = document.getElementById('guardarSolidityCheck');
    if(!checkSolidity || !checkSolidity.checked){
        return '';
    }
    if(typeof SolidityGenerator !== 'undefined' && window.workspace){
        return SolidityGenerator.workspaceToCode(window.workspace);
    }
    return '';
}

function obtenerCodigoVyperSiHaceFalta() {
    var checkVyper = document.getElementById('guardarVyperCheck');
    if(!checkVyper || !checkVyper.checked){
        return '';
    }
    if(typeof VyperGenerator !== 'undefined' && window.workspace){
        return VyperGenerator.workspaceToCode(window.workspace);
    }
    return '';
}

async function guardarWorkspaceNuevo() {
    localStorage.removeItem('workspaceIdActual');

    var nombre = document.getElementById('nombreWorkspaceModal').value;
    var xml = document.getElementById('xmlWorkspaceModal').value;
    var codigoSolidity = obtenerCodigoSoliditySiHaceFalta();
    var codigoVyper = obtenerCodigoVyperSiHaceFalta();
    var checkTemplate = document.getElementById('guardarTemplateCheck');
    var isTemplate =  checkTemplate && checkTemplate.checked;
    if(!nombre || nombre.trim() === ''){
        alert('You must enter a name for the workspace');
        return;
    }
    var payload = { nombreWorkspace: nombre.trim(), xml: xml,codigoSolidity: codigoSolidity,codigoVyper: codigoVyper,isTemplate: isTemplate};
    try {
        var res = await fetch('/api/registrarWorkspace', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error('The workspace could not be saved');
        }

        var data = await res.json();

        if(data && data.id){
            nombreWorkspaceActual = data.nombreWorkspace;
            localStorage.setItem('workspaceIdActual', data.id);
            actualizarBotonesModalWorkspace();
            cerrarModalGuardarWorkspace();
            alert('Workspace saved successfully');
        }
        else{
            alert('NThe workspace could not be saved');
        }
    } 
    catch(error) {
        console.error(error);
        alert('Error saving the workspace');
    }
}

async function sobreescribirWorkspaceActual() {
    var workspaceIdActual = localStorage.getItem('workspaceIdActual');
    var nombre = document.getElementById('nombreWorkspaceModal').value;
    var xml = document.getElementById('xmlWorkspaceModal').value;
    var codigoSolidity = obtenerCodigoSoliditySiHaceFalta();
    var codigoVyper = obtenerCodigoVyperSiHaceFalta();
    var checkTemplate = document.getElementById('guardarTemplateCheck');
    var isTemplate =Boolean(checkTemplate&& checkTemplate.checked);
    if (!workspaceIdActual) {
        alert('There is no current workspace to overwrite');
        return;
    }

    if (!nombre || nombre.trim() === '') {
        alert('You must enter a name for the workspace');
        return;
    }

    var payload = {workspaceId: workspaceIdActual,nombreWorkspace: nombre.trim(),xml: xml,codigoSolidity: codigoSolidity,codigoVyper: codigoVyper,isTemplate: isTemplate};

    try {
        var res = await fetch('/api/registrarWorkspace', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error('The workspace could not be overwritten');
        }

        var data = await res.json();

        if(data && data.id){
            nombreWorkspaceActual = data.nombreWorkspace;
            localStorage.setItem('workspaceIdActual', data.id);
            actualizarBotonesModalWorkspace();
            cerrarModalGuardarWorkspace();
            alert('Workspace overwritten successfully');
        } 
        else{
            alert('The workspace could not be overwritten');
        }
    }
    catch(e){
        console.error(e);
        alert('Error overwriting the workspace');
    }
}

async function cargarRolUsuarioWorkspace() {
    try {
        var respuesta =await fetch('/api/miPerfil');
        if(!respuesta.ok) {
            return;
        }
        var usuario = await respuesta.json();
        if (usuario && usuario.rol) {
            rolUsuarioActual = usuario.rol;
        }

        var contenedor = document.getElementById('contenedorGuardarTemplate');
        if(!contenedor){
            return;
        }
        if(rolUsuarioActual === 'ADMIN'|| rolUsuarioActual === 'PROFESSOR') {
            contenedor.style.display ='flex';
        } 
        else{//En caso de que no sea no se muestra el check para indicar que es un aplantilla
            contenedor.style.display = 'none';
        }

    } 
    catch (error) {
        console.error('Error loading user role',error);
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    var btnGuardarEditor = document.getElementById('guardarWorkspaceEditorBtn');
    var btnGuardarModal = document.getElementById('guardarWorkspaceModalBtn');
    var btnSobreescribirModal = document.getElementById('sobreescribirWorkspaceModalBtn');
    var btnCancelarModal = document.getElementById('cancelarGuardarWorkspaceModalBtn');
    await cargarRolUsuarioWorkspace();
    if (btnGuardarEditor) {
        btnGuardarEditor.addEventListener('click', abrirModalGuardarWorkspace);
    }

    if (btnGuardarModal) {
        btnGuardarModal.addEventListener('click', guardarWorkspaceNuevo);
    }

    if (btnSobreescribirModal) {
        btnSobreescribirModal.addEventListener('click', sobreescribirWorkspaceActual);
    }

    if (btnCancelarModal) {
        btnCancelarModal.addEventListener('click', cerrarModalGuardarWorkspace);
    }

    var inputNombreModal = document.getElementById('nombreWorkspaceModal');

    if (inputNombreModal) {
        inputNombreModal.addEventListener('input', actualizarBotonesModalWorkspace);
    }
});

