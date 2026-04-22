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
2. Python 3
3. Java 17 o superior
4. Apache JMeter 5.6 o superior

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

## 7. Ejecutar una prueba sencilla primero con Locust

Este paso sirve como prueba rapida para confirmar que todo esta funcionando.

### 7.1 Instalar Locust

Ejecuta:

```bash
python3 -m pip install locust
```

### 7.2 Ejecutar prueba normal en modo automatico

Ejecuta:

```bash
locust -f locustfile.py --host http://localhost --headless --users 20 --spawn-rate 0.33 --run-time 15m --html reports/locust/normal.html --csv reports/locust/normal --csv-full-history
```

### Que hace este comando

- usa `locustfile.py`;
- apunta al sistema en `http://localhost`;
- simula 20 usuarios;
- crea un reporte HTML;
- crea archivos CSV con detalle.

### Archivos que se generan

Al terminar, revisa:

1. `reports/locust/normal.html`
2. `reports/locust/normal_stats.csv`
3. `reports/locust/normal_failures.csv`
4. `reports/locust/normal_stats_history.csv`

## 8. Ejecutar todos los escenarios con Locust

Si la prueba anterior sale bien, ejecuta las demas.

### 8.1 Carga normal

```bash
locust -f locustfile.py --host http://localhost --headless --users 20 --spawn-rate 0.33 --run-time 15m --html reports/locust/normal.html --csv reports/locust/normal --csv-full-history
```

### 8.2 Carga alta

```bash
locust -f locustfile.py --host http://localhost --headless --users 60 --spawn-rate 0.5 --run-time 20m --html reports/locust/alta.html --csv reports/locust/alta --csv-full-history
```

### 8.3 Estres

```bash
locust -f locustfile.py --host http://localhost --headless --users 120 --spawn-rate 0.67 --run-time 15m --html reports/locust/estres.html --csv reports/locust/estres --csv-full-history
```

### 8.4 Spike

```bash
locust -f locustfile.py --host http://localhost --headless --users 100 --spawn-rate 10 --run-time 10m --html reports/locust/spike.html --csv reports/locust/spike --csv-full-history
```

## 9. Ejecutar las pruebas con JMeter

JMeter genera dashboards HTML muy utiles para la entrega.

## 9.1 Verifica que JMeter funcione

Prueba:

```bash
jmeter --version
```

Si te muestra la version, puedes continuar.

## 9.2 Ejecutar el plan completo

Ejecuta:

```bash
jmeter -n -t test_plan.jmx -l reports/jmeter/results-all.jtl -e -o reports/jmeter/dashboard-all -JtargetHost=localhost -JtargetPort=80 -JtargetProtocol=http -JadminEmail=admin@uniandes.edu.co -JadminPassword='Admin123*'
```

### Que genera

1. `reports/jmeter/results-all.jtl`
2. `reports/jmeter/dashboard-all/index.html`

El archivo `index.html` es uno de los reportes mas importantes para entregar.

## 10. Como generar reportes separados por escenario en JMeter

Esto es recomendable si quieres una entrega mas ordenada.

## 10.1 Abrir JMeter en modo grafico

Ejecuta:

```bash
jmeter
```

## 10.2 Abrir el archivo del plan

Dentro de JMeter:

1. ve a `File`;
2. luego `Open`;
3. abre `test_plan.jmx`.

## 10.3 Dejar un solo escenario activo

En el panel izquierdo veras varios grupos, por ejemplo:

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

## 10.4 Ejecutar cada escenario por separado

### Normal

```bash
jmeter -n -t test_plan_normal.jmx -l reports/jmeter/normal.jtl -e -o reports/jmeter/normal
```

### Alta

```bash
jmeter -n -t test_plan_alta.jmx -l reports/jmeter/alta.jtl -e -o reports/jmeter/alta
```

### Estres

```bash
jmeter -n -t test_plan_estres.jmx -l reports/jmeter/estres.jtl -e -o reports/jmeter/estres
```

### Spike

```bash
jmeter -n -t test_plan_spike.jmx -l reports/jmeter/spike.jtl -e -o reports/jmeter/spike
```

### Que debes entregar de JMeter

Las carpetas:

1. `reports/jmeter/normal`
2. `reports/jmeter/alta`
3. `reports/jmeter/estres`
4. `reports/jmeter/spike`

Cada una trae un `index.html`.

## 11. Reportes funcionales del propio sistema

Durante las pruebas, el sistema genera archivos PDF de reportes.

Los puedes encontrar en:

```bash
data/reportes
```

Estos PDFs sirven como evidencia de que el flujo funcional tambien fue probado.

## 12. Que debes revisar en los reportes

Aunque no sepas mucho de performance, revisa estas 4 cosas:

### 1. Tiempo de respuesta

Busca si el sistema responde rapido o lento.

### 2. Porcentaje de errores

Idealmente debe ser bajo.

### 3. Throughput o RPS

Esto indica cuantas solicitudes procesa el sistema.

### 4. Comportamiento bajo carga

Revisa si al aumentar usuarios el sistema sigue estable o empieza a fallar.

## 13. Que archivos debes entregar

Prepara una carpeta final con:

1. `analisis_proyecto.md`
2. `plan_pruebas_carga.md`
3. `test_data.csv`
4. `test_plan.jmx`
5. `locustfile.py`
6. `guia_ejecucion_pruebas.md`
7. `reports/jmeter/` completo
8. `reports/locust/` completo
9. algunos PDFs de `data/reportes/`

## 14. Recomendacion para la entrega final

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

## 15. Como comprimir todo para entregar

Desde la raiz del proyecto ejecuta:

```bash
zip -r entrega_pruebas.zip analisis_proyecto.md plan_pruebas_carga.md test_data.csv test_plan.jmx locustfile.py guia_ejecucion_pruebas.md reports data/reportes
```

Eso genera:

```bash
entrega_pruebas.zip
```

Ese archivo puede servir como paquete final de entrega.

## 16. Si algo falla

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

### Si JMeter no abre

Revisa que Java este instalado:

```bash
java -version
```

### Si Locust no corre

Reinstala:

```bash
python3 -m pip install --upgrade pip locust
```

## 17. Orden recomendado para hacerlo sin enredarte

Sigue exactamente este orden:

1. abrir terminal;
2. entrar a la carpeta del proyecto;
3. levantar Docker;
4. probar `health`;
5. crear carpeta `reports`;
6. correr Locust normal;
7. correr Locust alta;
8. correr Locust estres;
9. correr Locust spike;
10. correr JMeter;
11. revisar `reports/jmeter` y `reports/locust`;
12. sacar algunos PDFs de `data/reportes`;
13. comprimir todo en `entrega_pruebas.zip`.

## 18. Resultado final esperado

Al terminar correctamente, deberias tener:

1. dashboards HTML de JMeter;
2. reportes HTML y CSV de Locust;
3. PDFs generados por el sistema;
4. documentos Markdown del analisis y plan;
5. un ZIP final listo para entregar.
