# Simulador de Incentivos · Grupo Los Arcos

Aplicación web estática para simular los incentivos de:

- Gerente de sucursal
- Gerente regional

No requiere servidor ni base de datos. Puede publicarse directamente con GitHub Pages.

## Archivos

- `index.html`: estructura del sitio.
- `styles.css`: diseño visual y adaptación a celular.
- `app.js`: fórmulas, rangos, ponderadores y lógica del simulador.

## Uso local

1. Descarga o clona este repositorio.
2. Abre `index.html` en tu navegador.

## Publicación en GitHub Pages

1. Crea un repositorio nuevo en GitHub.
2. Sube `index.html`, `styles.css` y `app.js` a la raíz.
3. En GitHub entra a **Settings > Pages**.
4. En **Build and deployment**, selecciona:
   - Source: `Deploy from a branch`
   - Branch: `main`
   - Folder: `/root`
5. Guarda los cambios.

GitHub mostrará la dirección pública del simulador.

## Reglas configuradas

### Gerente de sucursal

Incentivo mensual:

- Ventas: 50%
- Auditoría de almacén: 14%
- Auditoría de cocina: 9%
- Auditoría de bar: 9%
- Evaluación de look: 9%
- Gestión de personal: 9%

Candado comercial:

- Si el ticket promedio crece más de 20%, o
- si el número de comensales disminuye más de 20%,

la calificación de ventas se multiplica por 80% antes de aplicar su ponderación.

Incentivo trimestral:

`Objetivo trimestral × factor por margen operativo × factor de auditoría`

### Gerente regional

Incentivo mensual:

- Promedio simple de las calificaciones de las sucursales a cargo.

Incentivo trimestral:

`Objetivo trimestral × factor por margen regional × multiplicador de sucursales rentables × factor de auditoría`

## Decisiones técnicas aplicadas

- Cuando no hay auditoría, el factor de auditoría es 100%.
- El porcentaje de sucursales con utilidad positiva se captura como porcentaje de observaciones sucursal-mes positivas en el trimestre.
- Los límites se programaron para evitar huecos entre rangos.
- Los valores capturados no se almacenan ni se envían a un servidor.

## Próxima etapa

La autenticación con usuario y contraseña puede incorporarse posteriormente con Firebase Authentication sin modificar la lógica principal del simulador.
