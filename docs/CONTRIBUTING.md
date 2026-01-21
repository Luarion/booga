## 📋 Table of contents

- [Development environment](#development-environment)
  - [Requirements](#requirements)
    - [Windows](#windows)
  - [Opening the environment](#opening-the-environment)
  - [Rebuild the environment](#rebuild-the-environment)

---

# 🧪 Development environment

### Requirements

You'll only need [Docker](https://www.docker.com/get-started/) and the VSCode's [Dev Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) extension

> You should also install all the recommended extensions defined on [.vscode/extensions.json](../.vscode/extensions.json)

#### Windows

```powershell
winget install --silent Docker.DockerDesktop
```

## 🍃 Opening the environment

Open VSCode's command palette (<kbd>Ctrl</kbd>+<kbd>Shift</kbd>+<kbd>P</kbd>) and write Dev Containers: Reopen in Container.

It'll build the needed devcontainer and install all package dependencies.

## 🏗️ Rebuild the environment

You can rebuild with or without cache, it means if nothing changed in the Dockerfiles that previosly where built it'll rebuild faster.

But if you need a "hard reset" for the environment, just rebuild without cache and appreciate if you need to delete some containers volumes like the databases, etc, for it to rebuild a completely new clean environment

## ❓ Why this development environment?

I've chose this workflow because of the next reasons:

- More scure: it reduces highly the exposure of your host machine to any package vulnerability
- More accesible: anyone can test their features without knowing how to build a server, like a database, etc.