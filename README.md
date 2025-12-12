# 🧠 Chat con IA usando Ollama  
### Proyecto educativo – Interacción Persona–Ordenador I

Este repositorio contiene una **aplicación web de ejemplo** que implementa un **chat con Inteligencia Artificial** utilizando **Ollama** como backend de IA local y **Next.js** para la interfaz web.

El proyecto ha sido desarrollado con fines **docentes**, como material de apoyo para la asignatura **Interacción Persona–Ordenador I** del **Grado en Ingeniería Informática**, con el objetivo de analizar y diseñar **interfaces conversacionales**.

---

## 🎯 Objetivos del proyecto

- Implementar una **interfaz conversacional** basada en texto  
- Comprender el flujo de interacción **usuario ↔ sistema ↔ IA**  
- Integrar un modelo de lenguaje en una aplicación web moderna  
- Diseñar una interfaz usable, clara y controlable  
- Aplicar principios de **diseño centrado en el usuario**  
- Utilizar IA **local y gratuita**, sin dependencia de APIs externas  

---

## 🧩 Tecnologías utilizadas

- **Next.js (App Router)** – frontend y backend  
- **React** y **TypeScript**  
- **Tailwind CSS** – diseño de la interfaz  
- **Ollama** – ejecución local de modelos de lenguaje (LLM)  
- **Modelo utilizado**: `llama3.1:8b`  
- **Streaming HTTP** para respuestas en tiempo real  

---

## 🖥️ Arquitectura del sistema

```
Usuario
  ↓
Interfaz web (Next.js + React)
  ↓
API interna (/api/chat)
  ↓
Ollama (IA local)
  ↓
Modelo LLM (llama3.1)
```

---

## ⚙️ Requisitos del sistema

### Software
- Sistema operativo: macOS, Linux o Windows  
- Node.js: versión **18 o superior**  
- npm (incluido con Node.js)  
- Ollama instalado y en ejecución  

### Hardware (recomendado)
- CPU moderna (Apple Silicon, Intel o AMD)  
- Memoria RAM: mínimo 8 GB (recomendado 16 GB)  
- GPU: opcional (Metal / CUDA / ROCm)  
- Espacio en disco: ~6 GB  

---

## ⚙️ Instalación de Ollama

### macOS (Homebrew)
```bash
brew install ollama
```

### Linux
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows
Descargar desde: https://ollama.com

---

## 🚀 Instalación y ejecución del proyecto

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/TU_USUARIO/ollama-chat-ipo.git
cd ollama-chat-ipo
```

### 2️⃣ Instalar dependencias
```bash
npm install
```

### 3️⃣ Descargar el modelo
```bash
ollama pull llama3.1:8b
ollama list
```

### 4️⃣ Crear archivo de entorno `.env.local`
```env
OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b
```

⚠️ No subir este archivo a GitHub.

### 5️⃣ Iniciar Ollama
```bash
ollama serve
```

### 6️⃣ Ejecutar la aplicación
```bash
npm run dev
```

Abrir en el navegador:
```
http://localhost:3000
```

---

## ✨ Funcionalidades

- Chat conversacional con IA  
- Respuestas en streaming  
- Historial de conversaciones  
- Modo claro / oscuro  
- Control del usuario para detener respuestas  
- Persistencia local  

---

## 🧠 Relación con Interacción Persona–Ordenador

El proyecto permite analizar:
- Interfaces conversacionales  
- Feedback inmediato  
- Control del sistema  
- Persistencia del contexto  
- Diseño visual y usabilidad  

---

## 🔒 Privacidad y coste

- Ejecución 100% local  
- Sin envío de datos a terceros  
- Sin claves de API  
- Uso gratuito  

---

## 📚 Créditos

Proyecto desarrollado como **ejemplo educativo** para la asignatura:

**Interacción Persona–Ordenador I**  
**Grado en Ingeniería Informática**

---

## 📝 Licencia

Uso educativo y formativo.  
Reutilizable para aprendizaje y docencia.
