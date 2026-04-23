# Guia paso a paso para ejecutar las pruebas y generar reportes

Esta guia esta escrita para una persona con poca experiencia tecnica.

Si sigues los pasos en orden, podras:

- levantar el sistema;
- ejecutar las pruebas de carga;
- generar reportes HTML y CSV;
- guardar evidencias listas para entregar.

## 1. Que vas a necesitar

Antes de empezar, asegurate de tener instalado lo siguiente:

### Obligatorio

1. Docker Desktop
2. Una terminal

No necesitas instalar JMeter ni Locust en tu computador.
En esta version ambos se ejecutan dentro de contenedores Docker.

### Opcional pero recomendado

1. Visual Studio Code
2. Un navegador como Chrome o Edge

## 2. Donde debes pararte

Abre una terminal en la carpeta del proyecto.

Ruta del proyecto:

```bash
/mnt/c/Users/gonza/OneDrive/Escritorio/202612-MISW4204-Grupo17
```

Comando:

```bash
cd /mnt/c/Users/gonza/OneDrive/Escritorio/202612-MISW4204-Grupo17
```

## 3. Archivos importantes

En esta carpeta ya estan listos estos archivos:

1. `analisis_proyecto.md`
2. `plan_pruebas_carga.md`
3. `test_data.csv`
4. `test_plan.jmx`
5. `locustfile.py`
6. `guia_ejecucion_pruebas.md`
7. `docker-compose.perf.yml`
8. `scripts/run_locust_docker.sh`
9. `scripts/run_jmeter_docker.sh`
10. `scripts/open_jmeter_gui_docker.sh`
11. `scripts/build_jmeter_scenario_plan.py`
12. `guion_explicacion_plan_pruebas.md`

## 4. Levantar el sistema

Este paso prende la base de datos, Redis, el backend y el proxy web.

Importante:

- las pruebas de carga van a ejecutarse contra el backend `api` directamente;
- el servicio `frontend` puede seguir levantado, pero no sera el objetivo principal de carga.

Ejecuta:

```bash
docker compose up --build -d postgres redis api frontend
```

### Que significa esto

- `docker compose up`: levanta los servicios.
- `--build`: recompila si hace falta.
- `-d`: lo deja corriendo en segundo plano.

### Como saber si salio bien

Ejecuta:

```bash
docker compose ps
```

Debes ver servicios con estado parecido a `running` o `up`.

## 5. Verificar que el sistema responde

Prueba este comando:

```bash
curl http://localhost/api/v1/health
```

Si todo esta bien, veras algo parecido a esto:

```json
{"status":"ok","service":"seguimiento-academico-api","time":"2026-04-22T12:00:00Z"}
```

Si no responde, no sigas todavia. Revisa primero:

1. que Docker este abierto;
2. que los contenedores sigan arriba;
3. que no haya otro programa usando el puerto 80.

## 5.1 Que servicio se prueba realmente

En este proyecto existen dos caminos posibles:

1. `http://localhost` o `frontend`: pasa por Nginx.
2. `http://api:8080`: pega directo al backend.

Para las pruebas de carga de este paquete se usa el segundo camino:

- `http://api:8080`

Eso permite medir el backend directamente, sin meter el proxy Nginx en la latencia principal.

## 6. Crear carpeta para guardar resultados

Ejecuta:

```bash
mkdir -p reports/jmeter reports/locust
```

Esto crea carpetas donde quedaran los reportes.

## 7. Levantar tambien las herramientas de pruebas en Docker

Este paso prepara los contenedores de Locust y JMeter.

Ejecuta:

```bash
docker compose -f docker-compose.yml -f docker-compose.perf.yml up -d
```

La primera vez puede tardar varios minutos porque Docker necesita descargar imagenes.

### Que hace este comando

- levanta el sistema normal;
- agrega un contenedor para Locust;
- deja lista la configuracion de JMeter para ejecutarlo cuando lo necesites;
- conecta todo a la misma red interna de Docker.

### Como verificar

Ejecuta:

```bash
docker compose -f docker-compose.yml -f docker-compose.perf.yml ps
```

Debes ver al menos estos servicios:

1. `postgres`
2. `redis`
3. `api`
4. `frontend`
5. `locust`

El contenedor `jmeter` no se levanta en este paso porque se ejecuta solo cuando corras un comando de prueba.

## 8. Ejecutar una prueba sencilla primero con Locust

Este paso sirve como prueba rapida para confirmar que todo esta funcionando.

### 8.1 Ejecutar prueba normal en modo automatico

La forma mas facil es usar el script preparado.

Ejecuta:

```bash
bash scripts/run_locust_docker.sh normal
```

### Que hace este comando

- ejecuta Locust dentro de Docker;
- usa `locustfile.py` desde la carpeta del proyecto;
- apunta al backend usando el nombre interno `api:8080`;
- simula 20 usuarios;
- ejecuta el escenario normal durante 5 minutos;
- crea un reporte HTML;
- crea archivos CSV con detalle.

### Archivos que se generan

Al terminar, revisa:

1. `reports/locust/normal.html`
2. `reports/locust/normal_stats.csv`
3. `reports/locust/normal_failures.csv`
4. `reports/locust/normal_stats_history.csv`
5. `reports/logs/locust_normal_<timestamp>.log`

### 8.2 Si quieres verlo en interfaz web

Tambien puedes abrir Locust en el navegador.

1. Abre `http://localhost:8089`
2. En `Host` escribe: `http://api:8080`
3. Lanza la prueba desde ahi

Importante:

- la interfaz web corre en tu navegador por el puerto `8089`;
- pero el trafico desde Locust hacia la aplicacion viaja dentro de Docker usando `http://api:8080`.

## 9. Ejecutar todos los escenarios con Locust

Si la prueba anterior sale bien, ejecuta las demas.

Cada escenario genera sus archivos con el mismo nombre del escenario.

Ejemplos:

- `normal` genera `reports/locust/normal.html`ac
- `alta` genera `reports/locust/alta.html`
- `estres` genera `reports/locust/estres.html`
- `spike` genera `reports/locust/spike.html`

### 9.1 Carga normal

```bash
bash scripts/run_locust_docker.sh normal
```

### 9.2 Carga alta

```bash
bash scripts/run_locust_docker.sh alta
```

### 9.3 Estres

```bash
bash scripts/run_locust_docker.sh estres
```

### 9.4 Spike

```bash
bash scripts/run_locust_docker.sh spike
```

## 10. Ejecutar las pruebas con JMeter dentro de Docker

JMeter genera dashboards HTML muy utiles para la entrega.

## 10.1 Como funciona ahora el script de JMeter

Ahora JMeter funciona por escenario, igual que Locust.

Tu solo indicas el nombre del escenario y el script hace esto automaticamente:

1. toma `test_plan.jmx`;
2. genera una copia temporal solo para ese escenario;
3. desactiva los otros grupos de carga;
4. pone en `0` el retraso inicial del escenario elegido para que no espere los tiempos del plan secuencial original;
5. ejecuta JMeter en Docker;
6. guarda el reporte HTML, el `.jtl` y el log con el nombre del escenario.

## 10.2 Ejecutar cada escenario de JMeter

### Normal

```bash
bash scripts/run_jmeter_docker.sh normal
```

### Alta

```bash
bash scripts/run_jmeter_docker.sh alta
```

### Estres

```bash
bash scripts/run_jmeter_docker.sh estres
```

### Spike

```bash
bash scripts/run_jmeter_docker.sh spike
```

## 10.3 Que genera JMeter por cada escenario

Ejemplo con `normal`:

1. `reports/jmeter/normal/index.html`
2. `reports/jmeter/normal.jtl`
3. `reports/jmeter/plans/test_plan_normal.jmx`
4. `reports/logs/jmeter_normal_<timestamp>.log`

Ejemplo con `alta`:

1. `reports/jmeter/alta/index.html`
2. `reports/jmeter/alta.jtl`
3. `reports/jmeter/plans/test_plan_alta.jmx`
4. `reports/logs/jmeter_alta_<timestamp>.log`

## 10.4 Ejecutar JMeter sin usar el script

La recomendacion es usar siempre el script.

Si aun asi quieres ejecutarlo manualmente, primero debes generar un plan para el escenario.

Ejemplo para `normal`:

```bash
python3 scripts/build_jmeter_scenario_plan.py normal test_plan.jmx reports/jmeter/plans/test_plan_normal.jmx
docker compose -f docker-compose.yml -f docker-compose.perf.yml run --rm jmeter jmeter -n -t /workspace/reports/jmeter/plans/test_plan_normal.jmx -l /workspace/reports/jmeter/normal.jtl -e -o /workspace/reports/jmeter/normal -JtargetHost=api -JtargetPort=8080 -JtargetProtocol=http -JadminEmail=admin@uniandes.edu.co -JadminPassword=Admin123*
```

## 11. Como generar reportes separados por escenario en JMeter

Esto ya queda automatizado por el script `run_jmeter_docker.sh`.

## 11.1 Abrir JMeter visualmente dentro de Docker

Ejecuta este comando:

```bash
bash scripts/open_jmeter_gui_docker.sh
```

Luego abre en tu navegador:

```text
http://localhost:6080/vnc.html
```

### Que vas a ver

1. Se abre una pagina de noVNC.
2. Veras un boton llamado `Connect`.
3. Haz clic en `Connect`.
4. Espera unos segundos.
5. Se abrira el escritorio remoto del contenedor.
6. Dentro de ese escritorio aparecera JMeter.

Si la ventana de JMeter no aparece de inmediato, espera un poco mas porque la primera carga puede tardar.

## 11.2 Como importar el archivo del plan en JMeter

Una vez veas JMeter en pantalla:

1. en el menu superior haz clic en `File`;
2. luego haz clic en `Open`;
3. se abrira un explorador de archivos;
4. entra a la carpeta `/workspace`;
5. selecciona el archivo `test_plan.jmx`;
6. haz clic en `Open`.

Importante:

- el archivo `test_plan.jmx` ya quedo apuntando por defecto al backend `api:8080` para que funcione dentro de Docker;
- si lo ejecutas desde la GUI de Docker no necesitas cambiar host ni puerto manualmente.

### Resultado esperado

En el panel izquierdo de JMeter deberias ver el arbol del plan, con grupos como:

1. `00 Setup Data`
2. `01 Carga Normal`
3. `02 Carga Alta`
4. `03 Estres`
5. `04 Spike`

## 11.2.1 Como ejecutar una prueba desde la GUI de JMeter

Si quieres correrla directamente desde la ventana visual de JMeter:

1. abre el plan `test_plan.jmx`;
2. deja activo solo el escenario que quieras;
3. en el menu superior haz clic en el boton verde `Start`;
4. espera a que termine;
5. si necesitas detenerlo, usa el boton rojo `Stop`.

Recomendacion:

- para entrega formal es mejor seguir usando los scripts `run_jmeter_docker.sh`, porque generan el dashboard HTML automaticamente;
- usa la GUI sobre todo para abrir, revisar, importar, activar o desactivar grupos y guardar copias.

## 11.3 Como dejar activo un solo escenario

Esto sigue siendo util si quieres inspeccionarlo visualmente en la GUI.

Importante:

- si ejecutas desde la GUI, JMeter respetara los `delay` del plan original;
- si ejecutas desde `bash scripts/run_jmeter_docker.sh <escenario>`, el script los pone en `0` automaticamente para ese escenario.

### Paso a paso

1. En el panel izquierdo busca `01 Carga Normal`, `02 Carga Alta`, `03 Estres` y `04 Spike`.
2. Haz clic derecho sobre el grupo que no quieres correr.
3. Busca la opcion `Disable`.
4. Repite esto hasta dejar solo un escenario activo.

Ejemplo:

- si quieres el reporte de carga normal, deja activo solo `01 Carga Normal`;
- desactiva `02 Carga Alta`, `03 Estres` y `04 Spike`.

## 11.4 Como guardar una copia del plan

No modifiques el archivo original si no hace falta.

Importante:

- para ejecutar por linea de comandos ya no necesitas crear estas copias manualmente;
- el script `run_jmeter_docker.sh` las genera solo.

Haz esto:

1. ve a `File`;
2. luego `Save Test Plan As...`;
3. guarda una copia en `/workspace`.

Nombres recomendados:

1. `test_plan_normal.jmx`
2. `test_plan_alta.jmx`
3. `test_plan_estres.jmx`
4. `test_plan_spike.jmx`

## 11.5 Ejecutar cada escenario por separado

### Normal

```bash
bash scripts/run_jmeter_docker.sh normal
```

### Alta

```bash
bash scripts/run_jmeter_docker.sh alta
```

### Estres

```bash
bash scripts/run_jmeter_docker.sh estres
```

### Spike

```bash
bash scripts/run_jmeter_docker.sh spike
```

## 11.6 Como cerrar JMeter GUI cuando termines

Cuando ya no lo necesites, puedes cerrarlo con este comando en otra terminal:

```bash
docker compose -f docker-compose.yml -f docker-compose.perf.yml --profile gui stop jmeter-gui
```

### Que debes entregar de JMeter

Las carpetas:

1. `reports/jmeter/normal`
2. `reports/jmeter/alta`
3. `reports/jmeter/estres`
4. `reports/jmeter/spike`

Cada una trae un `index.html`.

## 12. Reportes funcionales del propio sistema

Durante las pruebas, el sistema genera archivos PDF de reportes.

Los puedes encontrar en:

```bash
data/reportes
```

Estos PDFs sirven como evidencia de que el flujo funcional tambien fue probado.

## 13. Que debes revisar en los reportes

Aunque no sepas mucho de performance, revisa estas 4 cosas:

### 1. Tiempo de respuesta

Busca si el sistema responde rapido o lento.

### 2. Porcentaje de errores

Idealmente debe ser bajo.

### 3. Throughput o RPS

Esto indica cuantas solicitudes procesa el sistema.

### 4. Comportamiento bajo carga

Revisa si al aumentar usuarios el sistema sigue estable o empieza a fallar.

## 14. Que archivos debes entregar

Prepara una carpeta final con:

1. `analisis_proyecto.md`
2. `plan_pruebas_carga.md`
3. `test_data.csv`
4. `test_plan.jmx`
5. `locustfile.py`
6. `guia_ejecucion_pruebas.md`
7. `docker-compose.perf.yml`
8. `scripts/run_locust_docker.sh`
9. `scripts/run_jmeter_docker.sh`
10. `scripts/open_jmeter_gui_docker.sh`
11. `scripts/build_jmeter_scenario_plan.py`
12. `guion_explicacion_plan_pruebas.md`
13. `reports/jmeter/` completo
14. `reports/locust/` completo
15. `reports/logs/` completo
16. algunos PDFs de `data/reportes/`

## 15. Recomendacion para la entrega final

Ademas de los archivos tecnicos, crea un documento corto en Word o PDF con este formato:

### Portada

- nombre del proyecto;
- fecha;
- autor o equipo.

### 1. Objetivo

Explica que se evaluo rendimiento, estabilidad y comportamiento bajo carga.

### 2. Ambiente

Explica que se uso Docker, JMeter y Locust.

### 3. Escenarios ejecutados

- carga normal;
- carga alta;
- estres;
- spike.

### 4. Resultados principales

- tiempo promedio;
- p95;
- p99;
- tasa de error;
- throughput.

### 5. Hallazgos

Ejemplos:

- el login se mantiene estable;
- la generacion de reportes PDF aumenta la latencia;
- el sistema empieza a degradarse en estres.

### 6. Conclusiones

Ejemplo:

- el sistema soporta carga normal sin problemas;
- en carga alta mantiene estabilidad aceptable;
- en estres la latencia sube notablemente;
- conviene optimizar la generacion de reportes.

## 16. Como comprimir todo para entregar

Desde la raiz del proyecto ejecuta:

```bash
zip -r entrega_pruebas.zip analisis_proyecto.md plan_pruebas_carga.md test_data.csv test_plan.jmx locustfile.py guia_ejecucion_pruebas.md guion_explicacion_plan_pruebas.md docker-compose.perf.yml scripts reports data/reportes
```

Eso genera:

```bash
entrega_pruebas.zip
```

Ese archivo puede servir como paquete final de entrega.

## 17. Si algo falla

### Si Docker no levanta

Revisa:

1. que Docker Desktop este abierto;
2. que tengas permisos;
3. que no haya otro proceso usando el puerto 80.

### Si `curl http://localhost/api/v1/health` no responde

Ejecuta:

```bash
docker compose logs api
```

### Si Locust no corre

Revisa los logs del contenedor:

```bash
docker compose -f docker-compose.yml -f docker-compose.perf.yml logs locust
```

### Si JMeter falla

Prueba este comando para ver el error directo:

```bash
docker compose -f docker-compose.yml -f docker-compose.perf.yml run --rm jmeter jmeter -v
```

### Si JMeter GUI no abre en el navegador

Prueba esto:

1. espera 20 a 40 segundos;
2. vuelve a abrir `http://localhost:6080/vnc.html`;
3. revisa si el contenedor esta arriba.

Comando:

```bash
docker compose -f docker-compose.yml -f docker-compose.perf.yml --profile gui ps
```

### Si no descarga las imagenes de Docker

Puede ser un problema de internet o de permisos de Docker Desktop.

Prueba primero:

```bash
docker pull locustio/locust:2.37.10
docker pull justb4/jmeter:5.6.3
```

## 18. Orden recomendado para hacerlo sin enredarte

Sigue exactamente este orden:

1. abrir terminal;
2. entrar a la carpeta del proyecto;
3. levantar Docker;
4. probar `health`;
5. crear carpeta `reports`;
6. levantar tambien `docker-compose.perf.yml`;
7. correr Locust normal;
8. correr Locust alta;
9. correr Locust estres;
10. correr Locust spike;
11. correr JMeter normal;
12. correr JMeter alta;
13. correr JMeter estres;
14. correr JMeter spike;
15. revisar `reports/jmeter` y `reports/locust`;
16. sacar algunos PDFs de `data/reportes`;
17. comprimir todo en `entrega_pruebas.zip`.

## 19. Resultado final esperado

Al terminar correctamente, deberias tener:

1. dashboards HTML de JMeter;
2. reportes HTML y CSV de Locust;
3. PDFs generados por el sistema;
4. documentos Markdown del analisis y plan;
5. un ZIP final listo para entregar.

## 20. Comandos cortos para copiar y pegar

### Levantar todo

```bash
docker compose -f docker-compose.yml -f docker-compose.perf.yml up -d --build
```

### Probar salud del sistema

```bash
curl http://localhost/api/v1/health
```

### Locust normal

```bash
bash scripts/run_locust_docker.sh normal
```

### Locust alta

```bash
bash scripts/run_locust_docker.sh alta
```

### Locust estres

```bash
bash scripts/run_locust_docker.sh estres
```

### Locust spike

```bash
bash scripts/run_locust_docker.sh spike
```

### JMeter normal

```bash
bash scripts/run_jmeter_docker.sh normal
```

### JMeter alta

```bash
bash scripts/run_jmeter_docker.sh alta
```

### JMeter estres

```bash
bash scripts/run_jmeter_docker.sh estres
```

### JMeter spike

```bash
bash scripts/run_jmeter_docker.sh spike
```

### Abrir JMeter GUI en Docker

```bash
bash scripts/open_jmeter_gui_docker.sh
```

### Apagar todo al final

```bash
docker compose -f docker-compose.yml -f docker-compose.perf.yml down
```
