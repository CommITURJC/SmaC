

function mostrarMensaje(texto, ok) {
  const mensaje = document.getElementById("mensaje");
  if (!mensaje) {
    return;
  }

  if (ok) {
    mensaje.style.color = "green";
  } else {
    mensaje.style.color = "red";
  }

  mensaje.textContent = texto;
}

function contrasenasCoinciden() {
  const p1 = document.getElementById("password").value;
  const p2 = document.getElementById("password2").value;
  return p1 === p2;
}

async function hacerRegistro(e) {
  e.preventDefault();

  if (!contrasenasCoinciden()) {
    mostrarMensaje("The passwords entered do not match", false);
    return;
  }

  const payload = {
    user: document.getElementById("user").value,
    nombre: document.getElementById("nombre").value,
    apellido: document.getElementById("apellido").value,
    institucion: document.getElementById("institucion").value,
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  try {
    const res = await fetch("/api/registrarUsuario", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (data.exito) {
      mostrarMensaje(data.mensaje, true);

      setTimeout(function() {
        window.location.href = "loginSmaCly.html";
      }, 1200);
    } else {
      mostrarMensaje(data.mensaje, false);
    }

  } catch (err) {
    mostrarMensaje("Error connecting to the server", false);
  }
}

document.addEventListener("DOMContentLoaded", function() {
  const registerForm = document.getElementById("registerForm");

  if (registerForm) {
    registerForm.addEventListener("submit", hacerRegistro);
  }
});