  
const params = new URLSearchParams(window.location.search);
const tipo = params.get("tipo");

const mensaje = document.getElementById("mensajeError");
const linkLogin = document.getElementById("linkLogin");

if (tipo === "noauth") {
    mensaje.textContent = "Access denied; you are not logged in to the system";
    linkLogin.style.display = "inline-block";
} 
else if (tipo === "noperm") {
    mensaje.textContent = "Access denied. You do not have permission to perform this action.";
    linkLogin.style.display = "none";
} 
else {
    mensaje.textContent = "Access denied";
    linkLogin.style.display = "inline-block";
}
