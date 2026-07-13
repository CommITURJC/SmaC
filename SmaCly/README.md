# SmaCly

SmaCly es una aplicación web para diseñar contratos inteligentes mediante Blockly, generar código Solidity y Vyper, compilarlo, importar contratos Solidity o XML, gestionar workspaces y registrar la actividad de los usuarios.

## Tecnologías

- Java 17
- Spring Boot 4
- Maven Wrapper
- MongoDB
- Spring Security
- Apache POI
- Blockly
- Compiladores locales de Solidity y Vyper

## Requisitos

Para ejecutar el proyecto en Windows necesitas:

1. **Java JDK 17 o superior**
2. **MongoDB Community Server**
3. **Git**, solo si vas a clonar el repositorio
4. Un navegador web moderno
5. PowerShell o la terminal de Visual Studio Code

No es necesario instalar Maven globalmente porque el proyecto incluye Maven Wrapper.

Comprueba Java:

```powershell
java -version
```

Debe aparecer Java 17 o una versión compatible posterior.

## Clonar solamente la carpeta SmaCly

El proyecto se encuentra dentro del repositorio `CommITURJC/SmaC`. Para trabajar únicamente con la rama `main` y la carpeta `SmaCly`, utiliza un sparse checkout:

```powershell
git clone --filter=blob:none --sparse --single-branch --branch main https://github.com/CommITURJC/SmaC.git SmaC-SmaCly
cd SmaC-SmaCly
git sparse-checkout set SmaCly
cd SmaCly
```

Comprueba la configuración:

```powershell
git sparse-checkout list
git branch --show-current
```

El resultado esperado es:

```text
SmaCly
main
```

## Estructura principal

```text
SmaCly/
├── .mvn/
├── solc/
│   └── compilador-solc.exe
├── src/
│   ├── main/
│   │   ├── java/
│   │   └── resources/
│   └── test/
├── vyper/
│   └── vyper0-4-3compilador.exe
├── mvnw
├── mvnw.cmd
└── pom.xml
```

## Configurar MongoDB

Arranca MongoDB antes de ejecutar SmaCly.

La configuración predeterminada utiliza:

```text
mongodb://127.0.0.1:27017/smacly
```

Puedes comprobar la conexión con:

```powershell
mongosh "mongodb://127.0.0.1:27017"
```

Dentro de `mongosh`:

```javascript
use smacly
show collections
```

La base de datos y sus colecciones se crearán cuando la aplicación empiece a guardar datos.

## Configurar `application.properties`

Abre:

```text
src/main/resources/application.properties
```

Configura el archivo con valores adaptados a tu equipo:

```properties
spring.application.name=compilador
server.port=8080

spring.mongodb.uri=mongodb://127.0.0.1:27017/smacly
spring.data.mongodb.auto-index-creation=true

compilador.solc.ruta=C:\\RUTA\\AL\\PROYECTO\\SmaCly\\solc\\compilador-solc.exe
compilador.solc.timeout-segundos=20

compilador.vyper.ruta=C:\\RUTA\\AL\\PROYECTO\\SmaCly\\vyper\\vyper0-4-3compilador.exe
compilador.vyper.timeout-segundos=20

spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

En Windows debes escribir las barras de las rutas como `\\`.

Ejemplo:

```properties
compilador.solc.ruta=C:\\Users\\usuario\\Documents\\SmaC-SmaCly\\SmaCly\\solc\\compilador-solc.exe
compilador.vyper.ruta=C:\\Users\\usuario\\Documents\\SmaC-SmaCly\\SmaCly\\vyper\\vyper0-4-3compilador.exe
```

No subas a Git rutas personales, contraseñas ni credenciales privadas.

## Verificar los compiladores

Desde la raíz de `SmaCly`, comprueba que los ejecutables existen:

```powershell
Test-Path .\solc\compilador-solc.exe
Test-Path .\vyper\vyper0-4-3compilador.exe
```

Ambos comandos deben devolver:

```text
True
```

Si Windows bloquea un ejecutable descargado:

1. Pulsa con el botón derecho sobre el archivo.
2. Abre **Propiedades**.
3. Marca **Desbloquear**, si aparece.
4. Pulsa **Aplicar**.

## Compilar y ejecutar

Desde la raíz de `SmaCly`:

```powershell
.\mvnw.cmd clean test
```

Si las pruebas terminan correctamente, inicia Spring Boot:

```powershell
.\mvnw.cmd spring-boot:run
```

La aplicación estará disponible en:

```text
http://localhost:8080/
```

Para detenerla, pulsa:

```text
Ctrl + C
```

## Crear el primer administrador

El registro público crea usuarios con rol `USER`. Para preparar el primer administrador:

1. Inicia la aplicación.
2. Registra un usuario desde la pantalla de registro.
3. Abre `mongosh`:

```powershell
mongosh "mongodb://127.0.0.1:27017/smacly"
```

4. Selecciona la base de datos:

```javascript
use smacly
```

5. Localiza la cuenta:

```javascript
db.users.find({}, {user: 1, email: 1, rol: 1})
```

6. Cambia su rol:

```javascript
db.users.updateOne(
  {email: "administrador@ejemplo.com"},
  {$set: {rol: "ADMIN"}}
)
```

7. Cierra la sesión del navegador y vuelve a entrar.

No modifiques manualmente el campo de contraseña. La aplicación lo almacena cifrado con BCrypt.

## Roles

- `USER`: utiliza el editor, sus workspaces y sus logs visibles.
- `PROFESSOR`: gestiona usuarios creados por él y los registros asociados.
- `ADMIN`: dispone de las funciones administrativas permitidas por la aplicación.

## Funciones principales

- Diseño de contratos mediante bloques Blockly
- Generación de Solidity y Vyper
- Compilación local de Solidity y Vyper
- Importación de XML
- Importación y conversión de Solidity a bloques
- Guardado de workspaces y plantillas
- Registro y consulta de actividad
- Gestión de usuarios
- Borrado individual y masivo con permisos por rol
- Importación masiva de usuarios desde Excel

## Errores frecuentes

### No se puede conectar con MongoDB

Comprueba que MongoDB está iniciado y que la URI es correcta:

```properties
spring.mongodb.uri=mongodb://127.0.0.1:27017/smacly
```

### El puerto 8080 está ocupado

Cambia:

```properties
server.port=8081
```

Después abre:

```text
http://localhost:8081/
```

### No se encuentra `solc` o Vyper

Revisa las propiedades:

```properties
compilador.solc.ruta=...
compilador.vyper.ruta=...
```

Las rutas deben apuntar directamente a los archivos `.exe`.

### Error `JAVA_HOME`

Comprueba:

```powershell
java -version
$env:JAVA_HOME
```

`JAVA_HOME` debe apuntar al directorio del JDK, no al archivo `java.exe`.

### Maven Wrapper no arranca

Ejecuta desde la carpeta que contiene `mvnw.cmd`:

```powershell
.\mvnw.cmd --version
```

### Error 401 o 403

La sesión no está autenticada o el rol no tiene permisos para la operación solicitada.

### La aplicación no refleja cambios en HTML, CSS o JavaScript

Recarga el navegador con:

```text
Ctrl + F5
```

## Generar el paquete ejecutable

```powershell
.\mvnw.cmd clean package
```

El archivo generado aparecerá en:

```text
target/
```

Para ejecutarlo:

```powershell
java -jar .\target\compilador-0.0.1-SNAPSHOT.jar
```

MongoDB debe estar iniciado y las rutas de los compiladores deben ser válidas.

## Actualizar la copia local

Desde la raíz del repositorio sparse:

```powershell
git switch main
git pull origin main
```

Para desarrollar una funcionalidad nueva:

```powershell
git switch -c nombre-de-la-rama
```

## Seguridad

Antes de publicar cambios, revisa que no se incluyan:

```text
target/
.vscode/
.idea/
*.log
contraseñas
tokens
credenciales de MongoDB
rutas personales innecesarias
```

## Licencia

Consulta la licencia del repositorio principal `CommITURJC/SmaC` antes de reutilizar o redistribuir el proyecto y los ejecutabl