🧠 Chat con IA usando Ollama (Proyecto Educativo)

Este repositorio contiene una webapp de ejemplo que implementa un chat con Inteligencia Artificial utilizando Ollama como backend de IA local y Next.js para la interfaz web.

El objetivo principal del proyecto es aprender a diseñar e implementar interfaces conversacionales y comprender cómo se integra una IA en una aplicación interactiva, dentro de la asignatura Interacción Persona–Ordenador I del Grado en Ingeniería Informática.

🎯 Objetivos del proyecto

Comprender el flujo de interacción entre usuario e IA

Implementar un chat con streaming de respuestas

Diseñar una interfaz usable y clara

Separar correctamente frontend y backend

Usar IA local y gratuita, sin depender de APIs de pago

Analizar el chat como sistema interactivo

🧩 Tecnologías utilizadas

Next.js (App Router) – frontend y backend

TypeScript

Tailwind CSS – diseño de la interfaz

Ollama – ejecución local de modelos de lenguaje (LLM)

Modelo: llama3.1:8b

Streaming HTTP (tokens en tiempo real)

🖥️ Arquitectura del sistema
Usuario
  ↓
Interfaz web (Next.js + React)
  ↓
API interna (/api/chat)
  ↓
Ollama (IA local)
  ↓
Modelo LLM (llama3.1)


La interfaz gestiona la interacción

El backend actúa como proxy hacia Ollama

La IA se ejecuta localmente (privacidad y coste cero)

📸 Funcionalidades de la interfaz

Chat tipo ChatGPT

Streaming de respuestas (texto aparece progresivamente)

Historial de conversaciones

Creación y borrado de chats

Renombrado automático del chat

Modo claro / oscuro

Indicador “escribiendo…”

Botón para detener la generación

Persistencia local (LocalStorage)

⚙️ Requisitos previos
1️⃣ Node.js

Versión recomendada:

node >= 18

2️⃣ Ollama

Instalación en macOS (Homebrew):

brew install ollama

🚀 Instalación y ejecución
1️⃣ Clonar el repositorio
git clone https://github.com/tu-usuario/ollama-chat-ipo.git
cd ollama-chat-ipo

2️⃣ Instalar dependencias
npm install

3️⃣ Descargar el modelo de IA
ollama pull llama3.1:8b


Comprueba que está instalado:

ollama list

4️⃣ Crear el archivo de entorno

En la raíz del proyecto:

touch .env.local


Contenido:

OLLAMA_HOST=http://127.0.0.1:11434
OLLAMA_MODEL=llama3.1:8b

5️⃣ Iniciar Ollama

En una terminal:

ollama serve

6️⃣ Ejecutar la aplicación

En otra terminal:

npm run dev


Abrir en el navegador:

http://localhost:3000


(o el puerto que indique la consola)

📂 Estructura del proyecto
app/
 ├─ api/
 │   └─ chat/
 │       └─ route.ts     # Backend (proxy a Ollama)
 ├─ page.tsx             # Interfaz del chat
 └─ layout.tsx
public/
.env.local
package.json
README.md

🧪 Uso básico

Escribe un mensaje en el campo inferior

Pulsa Enter para enviar

La respuesta de la IA aparece progresivamente

Usa Stop para detener la generación

Crea nuevos chats desde la barra lateral

🧠 Relación con Interacción Persona–Ordenador

Este proyecto permite trabajar conceptos clave de IPO:

Interfaces conversacionales

Feedback inmediato (streaming)

Control del usuario (detener respuesta)

Persistencia del contexto

Diseño centrado en el usuario

Carga cognitiva y claridad visual

Puede utilizarse como base para:

Evaluaciones heurísticas

Pruebas de usabilidad

Rediseño de la interfaz

Comparación con otros tipos de interacción

🔒 Privacidad y coste

No se envían datos a servicios externos

La IA se ejecuta 100% en local

No requiere claves de API

Uso completamente gratuito

🧩 Posibles ampliaciones (trabajo futuro)

Selector de modelo

Soporte completo de Markdown

Voz (Speech-to-Text / Text-to-Speech)

Evaluación de usabilidad

Métricas de interacción

Accesibilidad (WCAG)

📚 Créditos

Proyecto desarrollado como ejemplo educativo para la asignatura
Interacción Persona–Ordenador I
Grado en Ingeniería Informática

📝 Licencia

Este proyecto se distribuye con fines educativos.
Puedes modificarlo y reutilizarlo libremente para aprendizaje y docencia.