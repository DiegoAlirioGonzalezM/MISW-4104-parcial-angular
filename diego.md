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

## 4. Levantar el sistema

Este paso prende la base de datos, Redis, el backend y el proxy web.

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
- apunta al sistema usando el nombre interno `frontend`;
- simula 20 usuarios;
- crea un reporte HTML;
- crea archivos CSV con detalle.

### Archivos que se generan

Al terminar, revisa:

1. `reports/locust/normal.html`
2. `reports/locust/normal_stats.csv`
3. `reports/locust/normal_failures.csv`
4. `reports/locust/normal_stats_history.csv`

### 8.2 Si quieres verlo en interfaz web

Tambien puedes abrir Locust en el navegador.

1. Abre `http://localhost:8089`
2. En `Host` escribe: `http://frontend`
3. Lanza la prueba desde ahi

Importante:

- la interfaz web corre en tu navegador por el puerto `8089`;
- pero el trafico desde Locust hacia la aplicacion viaja dentro de Docker usando `http://frontend`.

## 9. Ejecutar todos los escenarios con Locust

Si la prueba anterior sale bien, ejecuta las demas.

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

## 10.1 Ejecutar el plan completo

La forma mas facil es usar el script preparado.

Ejecuta:

```bash
bash scripts/run_jmeter_docker.sh test_plan.jmx dashboard-all
```

Este comando ejecuta JMeter dentro de Docker y genera los reportes en tu carpeta local.

### Que genera

1. `reports/jmeter/dashboard-all.jtl`
2. `reports/jmeter/dashboard-all/index.html`

El archivo `index.html` es uno de los reportes mas importantes para entregar.

## 10.2 Ejecutar JMeter sin usar el script

Si quieres lanzar el comando manualmente, usa este:

```bash
docker compose -f docker-compose.yml -f docker-compose.perf.yml run --rm jmeter jmeter -n -t /workspace/test_plan.jmx -l /workspace/reports/jmeter/dashboard-all.jtl -e -o /workspace/reports/jmeter/dashboard-all -JtargetHost=frontend -JtargetPort=80 -JtargetProtocol=http -JadminEmail=admin@uniandes.edu.co -JadminPassword=Admin123*
```

## 11. Como generar reportes separados por escenario en JMeter

Esto es recomendable si quieres una entrega mas ordenada.

## 11.1 Abrir JMeter en modo grafico

Como JMeter tambien esta en Docker, la manera mas facil para una persona sin experiencia es esta:

1. haz una copia de `test_plan.jmx`;
2. deja activo un solo escenario;
3. guarda el archivo con otro nombre;
4. ejecuta ese archivo con el script.

No es obligatorio abrir interfaz grafica para poder entregar resultados.

## 11.2 Dejar un solo escenario activo

En el archivo `test_plan.jmx` veras varios grupos, por ejemplo:

1. `01 Carga Normal`
2. `02 Carga Alta`
3. `03 Estres`
4. `04 Spike`

Para sacar un reporte limpio por escenario:

1. deja activo solo uno;
2. desactiva los otros tres;
3. guarda una copia con otro nombre.

Ejemplo:

1. `test_plan_normal.jmx`
2. `test_plan_alta.jmx`
3. `test_plan_estres.jmx`
4. `test_plan_spike.jmx`

## 11.3 Ejecutar cada escenario por separado

### Normal

```bash
bash scripts/run_jmeter_docker.sh test_plan_normal.jmx normal
```

### Alta

```bash
bash scripts/run_jmeter_docker.sh test_plan_alta.jmx alta
```

### Estres

```bash
bash scripts/run_jmeter_docker.sh test_plan_estres.jmx estres
```

### Spike

```bash
bash scripts/run_jmeter_docker.sh test_plan_spike.jmx spike
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
10. `reports/jmeter/` completo
11. `reports/locust/` completo
12. algunos PDFs de `data/reportes/`

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
zip -r entrega_pruebas.zip analisis_proyecto.md plan_pruebas_carga.md test_data.csv test_plan.jmx locustfile.py guia_ejecucion_pruebas.md docker-compose.perf.yml scripts reports data/reportes
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
11. correr JMeter;
12. revisar `reports/jmeter` y `reports/locust`;
13. sacar algunos PDFs de `data/reportes`;
14. comprimir todo en `entrega_pruebas.zip`.

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

### JMeter completo

```bash
bash scripts/run_jmeter_docker.sh test_plan.jmx dashboard-all
```

### Apagar todo al final

```bash
docker compose -f docker-compose.yml -f docker-compose.perf.yml down
```
