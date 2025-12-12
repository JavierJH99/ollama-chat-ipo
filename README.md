# 🧠 Chat con IA usando Ollama  
### Proyecto educativo – Interacción Persona–Ordenador I

Este repositorio contiene una **webapp de ejemplo** que implementa un **chat con Inteligencia Artificial** utilizando **Ollama** como backend de IA local y **Next.js** para la interfaz web.

El proyecto ha sido desarrollado con fines **docentes**, como apoyo al aprendizaje en la asignatura **Interacción Persona–Ordenador I** del **Grado en Ingeniería Informática**.

---

## 🎯 Objetivos del proyecto

- Aprender a implementar una **interfaz conversacional**
- Comprender el flujo de comunicación **usuario ↔ IA**
- Integrar una IA en una aplicación web moderna
- Diseñar una interfaz usable y clara
- Aplicar principios de **diseño centrado en el usuario**
- Utilizar IA **local y gratuita**, sin APIs de pago

---

## 🧩 Tecnologías utilizadas

- **Next.js (App Router)**
- **React + TypeScript**
- **Tailwind CSS**
- **Ollama** (ejecución local de LLMs)
- **Modelo**: `llama3.1:8b`
- **Streaming HTTP** (respuestas en tiempo real)

---

## 🖥️ Arquitectura del sistema

```text
Usuario
  ↓
Interfaz web (Next.js + React)
  ↓
API interna (/api/chat)
  ↓
Ollama (IA local)
  ↓
Modelo LLM (llama3.1)
