# 🎯 Reglas Personalizadas por Proyecto

## ¿Qué son las Reglas Personalizadas?

Las reglas personalizadas te permiten definir convenciones de commits específicas para cada proyecto que **tienen prioridad absoluta** sobre todas las configuraciones globales de la extensión.

## 📁 Archivo de Reglas

### Nombre del Archivo

```
.git-ai-commits.rules
```

### Ubicación

El archivo debe estar en la **raíz de tu proyecto** (mismo nivel que `package.json`, `.git`, etc.)

## 🚀 Cómo Usar

### 1. Crear el Archivo de Reglas

Crea un archivo llamado `.git-ai-commits.rules` en la raíz de tu proyecto:

```bash
touch .git-ai-commits.rules
```

### 2. Definir tus Reglas

Escribe en el archivo las reglas específicas que quieres para tu proyecto:

```markdown
# Reglas para mi proyecto React

## Convenciones de Commits

- Usar formato: [ÁREA]: Descripción
- Áreas válidas: [UI], [API], [DB], [CONFIG], [TEST]
- Siempre en español
- Máximo 70 caracteres

## Contexto del Proyecto

- Aplicación React con TypeScript
- Usar nombres de componentes cuando aplique
- Mencionar hooks si se modifican

## Ejemplos:

- [UI]: Agregar componente Button con variants
- [API]: Implementar endpoint de usuarios
- [CONFIG]: Actualizar configuración de Webpack
```

### 3. ¡Listo!

La extensión automáticamente detectará y aplicará tus reglas personalizadas con **máxima prioridad**.

## 📋 Ejemplo Completo

```markdown
# Reglas para Proyecto E-commerce

## Convenciones de Commits Obligatorias

- Formato: [MÓDULO]: Acción realizada
- Módulos: [AUTH], [CART], [PRODUCT], [PAYMENT], [ADMIN]
- Descripción en español, presente simple
- Sin emojis, solo texto claro

## Información del Proyecto

- E-commerce con Node.js y React
- Microservicios: auth-service, product-service, payment-service
- Base de datos: MongoDB
- Cache: Redis

## Reglas Específicas

1. Para cambios en APIs: mencionar endpoint afectado
2. Para cambios en UI: mencionar componente y página
3. Para cambios en DB: especificar colección o esquema
4. Para bugs: incluir número de issue si existe

## Ejemplos de Buenos Commits:

- [AUTH]: Implementar middleware de validación JWT
- [CART]: Agregar funcionalidad de descuentos en CartService
- [PRODUCT]: Optimizar query de búsqueda en ProductSchema
- [PAYMENT]: Corregir validación de tarjetas en checkout
```

## ⚡ Características

### ✅ Prioridad Absoluta

- Las reglas del archivo `.git-ai-commits.rules` **siempre tienen prioridad**
- Sobrescriben configuraciones globales de la extensión
- Sobrescriben reglas por defecto

### ✅ Detección Automática

- La extensión automáticamente detecta el archivo
- No necesitas configurar nada adicional
- Si el archivo no existe, usa las reglas por defecto

### ✅ Flexibilidad Total

- Define cualquier formato de commit que necesites
- Incluye contexto específico de tu proyecto
- Especifica convenciones de equipo

### ✅ Logs y Debugging

La extensión registra en los logs:

- Si encuentra el archivo de reglas
- Si el archivo está vacío
- Errores al leer el archivo
- Contenido de las reglas cargadas

## 🔍 Verificar que Funciona

1. **Crear el archivo**: `.git-ai-commits.rules` en la raíz
2. **Escribir reglas**: Define tus convenciones
3. **Usar la extensión**: Genera un commit
4. **Verificar logs**: En Output > Git AI Commits

## 📝 Plantilla Base

Copia esta plantilla en tu archivo `.git-ai-commits.rules`:

```markdown
# Reglas Personalizadas para [NOMBRE-PROYECTO]

## Formato de Commits

- Estructura: [TIPO]: Descripción
- Tipos válidos: [FEAT], [FIX], [DOCS], [REFACTOR], [TEST]
- Idioma: español
- Máximo: 72 caracteres

## Contexto del Proyecto

- [Describe tu proyecto aquí]
- [Tecnologías principales]
- [Estructura de carpetas importante]

## Ejemplos:

- [FEAT]: Agregar nueva funcionalidad X
- [FIX]: Corregir error en componente Y
- [DOCS]: Actualizar README con instrucciones

## Reglas Especiales

- [Añade reglas específicas de tu equipo/proyecto]
```

## 🚨 Importante

- **Un archivo por proyecto**: Cada proyecto puede tener sus propias reglas
- **Prioridad máxima**: Las reglas del archivo sobrescriben TODO lo demás
- **Sin validación**: Asegúrate de que tus reglas sean claras y completas
- **Responsabilidad del equipo**: Define reglas consensuadas con tu equipo

## 💡 Tips

1. **Sé específico**: Incluye ejemplos concretos en tus reglas
2. **Contexto del proyecto**: Menciona tecnologías, estructura, convenciones
3. **Reglas completas**: No asumas que la IA conoce tu proyecto
4. **Revisar periódicamente**: Actualiza las reglas según evolucione el proyecto
