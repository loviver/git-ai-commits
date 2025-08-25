# Changelog

Todas las notas importantes sobre las versiones de **[git-ai-commits]** se documentan aquí.

## [1.1.0] - 2025-01-17

### 🎉 Nueva Funcionalidad Principal

- **🔥 Reglas Personalizadas por Proyecto**: Cada proyecto puede definir sus propias reglas de commits con prioridad absoluta
  - Archivo `.git-ai-commits.rules` en la raíz del proyecto
  - Detección automática y aplicación con máxima prioridad
  - Sobrescribe todas las configuraciones globales
  - Documentación completa incluida

### 🚀 Actualizaciones Importantes

- **Compatibilidad VSCode 1.103.0+**: Actualizado para la última versión de VSCode
- **Soporte mejorado para Cursor 1.4.5**: Configuración específica añadida
- **Dependencias actualizadas**: Todas las dependencias a sus últimas versiones
  - TypeScript ^5.9.2
  - ESLint ^9.34.0
  - axios ^1.11.0
  - simple-git ^3.28.0

### 🔧 Mejoras Técnicas

- **Logs mejorados**: Mejor visibilidad cuando se aplican reglas personalizadas
- **Manejo robusto de errores**: Mejor gestión de casos edge
- **Rendimiento optimizado**: Lectura eficiente de archivos de configuración
- **Scripts unificados**: Migración completa de yarn a npm

### 📁 Archivos de Configuración

- **`.cursorrules`**: Reglas específicas para Cursor AI
- **`.cursorignore`**: Optimización para Cursor
- **Plantillas de ejemplo**: `.git-ai-commits.rules.example` con guías detalladas

## [1.0.6] - 2024-03-17

### 🚀 Mejoras y Nuevas Funcionalidades

- **Mejora en la ofuscación "Alta"**: Ahora mantiene información clave sin comprometer la privacidad.
- **Optimización de las sugerencias de commits**: Se ha mejorado drásticamente el enfoque para ofrecer propuestas más precisas y relevantes.
- **Opción de actualizaciones dinámicas de prompts**: Permite recibir mejoras en los prompts sin necesidad de esperar una nueva actualización de la extensión (opcional y configurable).
- **Nuevo comando para sugerencias enfocadas**: Los usuarios pueden proporcionar una idea base para que la IA genere sugerencias alineadas con su intención principal.

## [1.0.3] - 2024-03-13

- **Soporte para convenciones de commit**: Ahora puedes definir tu estilo preferido (`gitmoji`, `conventional`, `custom`).
- **Configuraciones avanzadas**:
  - Posibilidad de establecer tu propio formato de commits en `customConvention`.
- **Corrección de error**: Se solucionó un problema donde erróneamente se solicitaba una `apiKey` al utilizar Copilot.

## [1.0.2] - 2024-03-12

### 🆕 Mejoras y Nuevas Funcionalidades

- **Soporte para múltiples asistentes AI**: Compatible con **Copilot+GPT-4o**, **Copilot+GPT-4O-Mini**.

## [1.0.0] - 2024-03-11

### 🎉 Características Iniciales

- **Soporte para Gemini**
- **Acceso a commits sugeridos**: Genera hasta 5 commits basados en el stage actual.
- **Ofuscación de código configurable**: Niveles de ofuscación **Low**, **Medium**, y **High** para proteger la privacidad de tu código al interactuar con AI.
- **Configuración para ofuscar palabras específicas**
- **Soporte multilingüe**: Generación de commits en 10 idiomas (inglés, español, chino, etc.).
- **Auto-commit opcional**: Al seleccionar un commit sugerido, se autocommitará o se copiará al portapapeles.
- **Interfaz UI en inglés y español**: La extensión adapta su idioma según la configuración de VSCode.

## 📝 Notas

- Para ver instrucciones detalladas de instalación y uso, revisa el archivo `README.md`.
- Si encuentras un error, abre un **issue** en el repositorio.
