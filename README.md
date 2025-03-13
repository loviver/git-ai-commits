# VSCode Commit Assistant Extension (git-ai-commits)

La extensión **Commit Assistant** de VSCode permite una gestión eficiente de tus commits y un flujo de trabajo más ágil. Con soporte multilingüe, opciones de ofuscación de código y la integración con varios asistentes como Copilot y Gemini, esta extensión está diseñada para mejorar tu productividad y privacidad.

## Características

### 1. **Acceso a Commits Sugeridos**
- Accede fácilmente a una lista de **5 commits sugeridos** basados en el estado actual del **stage** de tu código.
- Los commits sugeridos se generan automáticamente, lo que te ayuda a evitar la necesidad de escribir mensajes manualmente.

### 2. **Cambio de Asistentes AI**
- **Switch entre modelos de AI**:
  - **Copilot+GPT-4O-Mini**
  - **Copilot+GPT-4O**
  - **Gemini**
- Personaliza el asistente con el que deseas interactuar para obtener sugerencias sobre tu código.

### 3. **Ofuscación de Código**
- Permite **definir el nivel de ofuscación** de código. Mientras más alto sea el nivel de ofuscación (Low, Medium, High), menos datos se comparten con el asistente para obtener una opinión.
- Los niveles de ofuscación más altos permiten que el asistente se enfoque solo en la funcionalidad del código, sin revelar detalles sensibles.

### 4. **Lista de Palabras a Ofuscar**
- Define una lista personalizada de palabras clave que deseas ofuscar para mayor privacidad y seguridad.

### 5. **Soporte Multilingüe para Commits**
- Genera automáticamente los mensajes de commit en los siguientes idiomas:
  - **Arabic**
  - **Chinese**
  - **English**
  - **French**
  - **German**
  - **Italian**
  - **Japanese**
  - **Korean**
  - **Portuguese**
  - **Russian**
  - **Spanish**

### 6. **Auto Commit**
- Opción para **auto-commit**: Al seleccionar el commit preferido, se realizará el commit automáticamente.
- Si no se activa la opción de auto-commit, al seleccionar el commit, se copiará al **portapapeles** para que lo uses manualmente.

### 7. **Interfaz de Usuario en Inglés y Español**
- La interfaz de la extensión se ajusta al idioma de tu **Visual Studio Code**. Se ofrece soporte tanto en **Inglés** como en **Español**.

## Instalación

1. Abre Visual Studio Code.
2. Dirígete a la sección de **Extensiones** (o usa el atajo `Ctrl+Shift+X`).
3. Busca **Commit Assistant**.
4. Haz clic en **Instalar**.

## Uso

Una vez instalada la extensión, sigue estos pasos para empezar:

1. Abre tu proyecto en VSCode.
2. Abre la paleta de comandos (`Ctrl+Shift+P`).
3. Escribe `Commit Suggestion` para acceder a las opciones disponibles.

Desde allí podrás:
- Ver los commits sugeridos.
- Cambiar entre los asistentes AI (copilot+gpt-4o, copilot+gpt-4o-mini, gemini).
- Configurar los niveles de ofuscación y lista de palabras.
- Definir el idioma para los commits.
- Activar o desactivar la opción de auto-commit.

| Asistente AI                | Velocidad  |
|-----------------------------|------------|
| **copilot + gpt-4o-mini**    | Más rápido |
| **gemini**                   | Rápido     |
| **copilot + gpt-4o**         | Lento      |

## Contribuciones

Si deseas contribuir a esta extensión, ¡serás bienvenido! Puedes abrir un **issue** o enviar un **pull request** con tus cambios.

## Licencia

Distribuido bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.




![image](https://github.com/user-attachments/assets/9bd8ee87-6858-46ab-aaa6-06ca117001d3)
