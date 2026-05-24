# Booga - Guía de Inicio

Este proyecto utiliza DevContainers y [Bun](https://bun.sh/) como gestor de paquetes y entorno de ejecución. Aquí tienes los pasos para levantar el entorno de desarrollo y ejecutar los proyectos.

## 📋 Requisitos Previos

1. [Docker](https://www.docker.com/products/docker-desktop) instalado y en ejecución.
2. [Visual Studio Code](https://code.visualstudio.com/) o [Cursor](https://cursor.sh/).
3. La extensión **Dev Containers** (`ms-vscode-remote.remote-containers`) instalada en tu editor.

## 🐳 Levantar el Entorno (DevContainer)

1. Configura tus variables de entorno iniciales generando los archivos `.env` a partir de sus plantillas. Desde la raíz de tu máquina local, puedes usar el comando Make:
   ```bash
   make env
   ```
2. Abre la carpeta raíz del proyecto (`booga`) en VS Code / Cursor.
3. Si aparece un mensaje en la esquina inferior derecha sugiriendo abrir en el contenedor, haz clic en **"Reopen in Container"**.
4. Si no aparece, abre la paleta de comandos (`Ctrl+Shift+P` en Windows/Linux o `Cmd+Shift+P` en Mac) y busca:
   `Dev Containers: Reopen in Container`
5. Espera a que Docker descargue la imagen y construya el entorno. Esto puede tardar unos minutos la primera vez.

## 📦 Instalación de Dependencias

Una vez dentro del contenedor (lo sabrás porque en la esquina inferior izquierda de tu editor indicará "Dev Container"), abre una nueva terminal integrada (`Ctrl+ñ` o `Cmd+J`) e instala las dependencias de todo el monorepo ejecutando en la raíz:

```bash
bun install
```

> **Nota**: Este comando resolverá las dependencias para todas las aplicaciones y paquetes gracias a la configuración de workspaces de Bun.

## 🚀 Ejecutar los Proyectos

El proyecto está dividido en dos aplicaciones principales: **api** (Backend) y **ui** (Frontend). Te recomendamos ejecutarlas en terminales separadas.

### 1. Iniciar la API (Backend)

Abre una terminal y ejecuta:

```bash
cd apps/api
bun dev
```

Esto iniciará el servidor de la API en modo desarrollo (usualmente disponible en el puerto 8080 o el configurado en tu entorno).

### 2. Iniciar la UI (Frontend)

Abre **otra pestaña de terminal** (dando clic al botón `+` en el panel de terminal del editor) y ejecuta:

```bash
cd apps/ui
bun dev
```

Esto iniciará la aplicación frontend de Next.js. Una vez compilado, podrás ver la interfaz abriendo `http://localhost:3000` en tu navegador.

## 🛠 Variables de Entorno Adicionales

El comando `make env` que ejecutaste antes de abrir el DevContainer se encarga de recorrer todas las aplicaciones del monorepo (como `.devcontainer`, `apps/api` y `apps/ui`) y generar automáticamente los archivos `.env` a partir de sus respectivas plantillas (`.env.template`). 

Si en algún momento necesitas regenerarlos o asegurarte de que estén todos presentes, simplemente ejecuta desde la raíz:

```bash
make env
```

*(Nota: Una vez generados, abre los archivos `.env` respectivos para ajustar los valores según tu configuración local si es necesario).*
