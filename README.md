# Consulta de Postulantes – Transporte Escolar 2026
### Alcaldía Municipal de Timbío, Cauca
**Secretaría de Gobierno y Participación Comunitaria**  
**Portal Oficial de Referencia:** [https://www.timbio-cauca.gov.co/](https://www.timbio-cauca.gov.co/)

Aplicación web pública, institucional, moderna, estática y responsive diseñada como una **extensión natural del portal oficial de la Alcaldía de Timbío**. Permite que padres de familia y acudientes consulten de manera ágil y sencilla si un estudiante se encuentra en el **Listado Preliminar de Postulantes al Subsidio Económico de Transporte Escolar – Vigencia 2026**, sin necesidad de descargar o revisar manualmente extensos documentos PDF ni iniciar sesión.

---

## 🏛️ Identidad Visual y Arquitectura Institucional

La interfaz reproduce fielmente el estándar visual de las páginas internas del portal oficial de la Alcaldía de Timbío (plataforma **Mi Colombia Digital / MinTIC / GOV.CO**):

- **Barra Superior GOV.CO:** Franja azul oficial `#3366CC` con el logotipo de GOV.CO y enlace directo: **"Volver al portal de la Alcaldía"**.
- **Cabecera Institucional:** Logotipo y escudo oficial de la Alcaldía Municipal de Timbío con su NIT 891500742-5.
- **Navegación Institucional:** Menú sobrio (`Inicio`, `Transparencia`, `Atención al Ciudadano`, `Transporte Escolar 2026`) con botón de retorno.
- **Miga de Pan (Breadcrumb):** `Inicio > Convocatorias > Transporte Escolar 2026 > Consulta de postulantes`.
- **Ancho y Espaciados Oficiales:** Contenedor centralizado (`max-width: 1140px`) idéntico a las páginas internas de `timbio-cauca.gov.co`.
- **Paleta de Colores Institucional:**
  - Verde oficial de Timbío (MinTIC): `#478028` (hover: `#37631f`, fondos: `#eaf3e6`).
  - Azul Gov.co: `#3366CC` y `#004884`.
  - Amarillo de apoyo institucional: `#f59e0b` para alertas y llamados de atención.
  - Neutrales: `#1e293b` (texto), `#f8fafc` (fondo general) y `#ffffff` (bloques y tarjetas).
- **Tipografía:** *Work Sans* (tipografía del estándar GOV.CO).
- **Tarjetas y Separadores:** Bordes suaves de 4px, sombras sutiles, separadores discretos y sin gradientes invasivos ni glassmorphism.
- **Pie de Página Institucional:** Replica el bloque inferior del portal con las direcciones, horarios, dependencias (Secretaría de Tránsito, Comisaría de Familia, Casa de Cultura), canales de atención, redes oficiales, franja verde municipal y barra GOV.CO con el isotipo `CO`.

---

## 🔒 Privacidad, Verificación de Acudientes y Protección de Menores

En estricto cumplimiento del principio de privacidad desde el diseño y la normativa colombiana de protección de datos personales de menores de edad (Ley 1581 de 2012):

1. **Datos mostrados al ciudadano:**
   - Nombre completo del estudiante.
   - Institución educativa.
   - Grado escolar.
   - **Acudiente (parcialmente anonimizado)**: Primer nombre completo, inicial del segundo nombre y primera letra del primer apellido con asteriscos (ej. `Sandra M. G***`, `Jose R. A***`, `Yohana D***`), ocultando completamente el segundo apellido.
   - Estado: `Listado preliminar`.
2. **Anonimización previa en el archivo de datos:** El nombre completo del acudiente **no existe en el archivo JSON público** (`data/postulantes.json`). Se almacena directamente ya anonimizado, evitando que se pueda extraer examinando el archivo o las herramientas de desarrollador del navegador.
3. **Restricción total de búsqueda por acudiente:** El buscador consulta **únicamente** por el nombre y apellidos del estudiante. No es posible buscar, filtrar ni consultar por acudientes.
4. **Datos sensibles estrictamente omitidos:** No se exponen números de documento de identidad, nivel de Sisbén, pertenencia étnica (indígena) ni condición de víctima.
5. **Mecanismo de privacidad al ingresar:** **La página NO lista estudiantes al cargar**. Exige que el acudiente interactúe ingresando al menos **3 letras** en el buscador o seleccionando una institución educativa específica.
6. **Protección anti-indexación:** Incluye `<meta name="robots" content="noindex, nofollow">` para restringir la recolección masiva de nombres por buscadores web.

---

## 📁 Estructura del Proyecto

```text
/
├── index.html                               # Página web principal estructurada como página interna oficial
├── styles.css                               # Estilos visuales alineados con timbio-cauca.gov.co
├── script.js                                # Lógica de búsqueda, filtrado y renderizado dinámico
├── README.md                                # Documentación institucional y guía técnica
│
├── assets/
│   ├── logo-horizontal.png                  # Escudo y logo oficial horizontal con NIT de la Alcaldía
│   ├── logo-alcaldia.png                    # Escudo tradicional municipal
│   └── bandera-timbio.png                   # Bandera del Municipio de Timbío
│
├── data/
│   ├── postulantes.json                     # 768 registros con acudiente previamente anonimizado
│   └── postulantes_descartados.json         # 75 registros con error #REF! excluidos para revisión manual
│
└── docs/
    ├── Listado_preliminar_postulantes_Transporte_Escolar_2026_Timbio.pdf
    ├── Convocatoria_Subsidio_Transporte_Escolar_2026_Timbio.pdf
    └── Modificacion_Cronograma_Transporte_Escolar_2026.pdf
```

---

## ⚙️ Guía de Administración y Mantenimiento

### 1. Cómo actualizar el listado de estudiantes

El listado público se alimenta del archivo [`data/postulantes.json`](file:///d:/LIstado%20Estudiantes/data/postulantes.json).

Estructura requerida:
```json
[
  {
    "nombre": "DIANA MARCELA ACOSTA CAMPO",
    "institucion": "Institución Educativa Carlos Albán",
    "grado": "6",
    "acudiente": "Jose R. A***"
  }
]
```

Para actualizar:
1. Reemplaza o edita el archivo `data/postulantes.json`.
2. Conserva las claves `"nombre"`, `"institucion"`, `"grado"` y `"acudiente"`.
3. Aplica siempre la regla de anonimización al campo acudiente (`PrimerNombre InicialSegundo. LetraPrimerApellido***`).
4. Guarda el archivo con codificación **UTF-8**.
5. Si hay filas con `#REF!` o datos corruptos en el archivo fuente, no las incluyas en este archivo; consérvalas en `data/postulantes_descartados.json` para auditoría administrativa.

---

### 2. Cómo reemplazar el PDF oficial

Los documentos oficiales descargables se alojan en la carpeta [`docs/`](file:///d:/LIstado%20Estudiantes/docs/).

1. Para actualizar el listado (por ejemplo, tras el periodo de subsanación o el listado definitivo), coloca el nuevo PDF dentro de la carpeta `docs/`.
2. Puedes sobreescribir el archivo existente o darle un nuevo nombre.

---

### 3. Cómo cambiar enlaces o rutas de documentos

Los enlaces se centralizan en la cabecera de [`script.js`](file:///d:/LIstado%20Estudiantes/script.js):

```javascript
const CONFIG = {
  dataPath: 'data/postulantes.json',
  pdfListadoUrl: 'docs/Listado_preliminar_postulantes_Transporte_Escolar_2026_Timbio.pdf',
  pdfConvocatoriaUrl: 'docs/Convocatoria_Subsidio_Transporte_Escolar_2026_Timbio.pdf',
  pdfCronogramaUrl: 'docs/Modificacion_Cronograma_Transporte_Escolar_2026.pdf',
  minSearchLength: 3,
  maxRenderResults: 300
};
```

Si deseas que apunten a una URL externa en el portal oficial (ej. `https://www.timbio-cauca.gov.co/documentos/listado.pdf`), basta con cambiar el valor de la variable.

---

### 4. Cómo reemplazar logos y colores institucionales

- **Logo oficial:** Reemplaza [`assets/logo-horizontal.png`](file:///d:/LIstado%20Estudiantes/assets/logo-horizontal.png) manteniendo formato PNG transparente.
- **Colores institucionales:** En [`styles.css`](file:///d:/LIstado%20Estudiantes/styles.css), edita las variables en `:root`:
  ```css
  --timbio-green: #478028;       /* Verde institucional */
  --timbio-green-dark: #37631f;  /* Verde hover */
  --govco-blue: #3366CC;         /* Azul Gov.co */
  ```

---

### 5. Cómo desplegar la página web

Al ser una aplicación 100% estática (HTML/CSS/JS sin servidor), se despliega de forma inmediata:

- **GitHub Pages:** Sube los archivos al repositorio, activa Pages en `main / root`.
- **Cloudflare Pages:** Arrastra la carpeta completa o conecta tu repositorio; no requiere comando de build.
- **Netlify:** Arrastra la carpeta a la consola web de Netlify.
- **Vercel:** Despliega con `vercel` o vinculando el repositorio en el panel.

---

## 🏛️ Datos Oficiales de Contacto

- **Entidad:** Alcaldía Municipal de Timbío – Cauca
- **NIT:** 891500742-5
- **Dirección:** Calle 15 Carrera 17 Esquina, Timbío, Cauca
- **Horario:** Martes a viernes 7:30 a.m. a 1:00 p.m. y 2:00 p.m. a 6:00 p.m. | Sábados 7:30 a.m. a 1:30 p.m.
- **Portal Web Oficial:** [https://www.timbio-cauca.gov.co/](https://www.timbio-cauca.gov.co/)
- **Correo Institucional:** contactenos@timbio-cauca.gov.co
- **Correo Notificaciones Judiciales:** alcaldia@timbio-cauca.gov.co
