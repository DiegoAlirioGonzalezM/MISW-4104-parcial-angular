## 1. Objetivo
Este documento resume la forma de ejecutar y entender las pruebas de carga del proyecto, enfocadas en el backend del sistema. La estrategia contempla la ejecucion de escenarios equivalentes en `Locust` y `JMeter`, con el fin de medir comportamiento, estabilidad, degradacion y reaccion ante picos de concurrencia.
## 2. Alcance
Las pruebas se ejecutan directamente contra el backend dentro de Docker, usando como objetivo principal:
- `http://api:8080`
No se usa el `frontend` como ruta principal de medicion de latencia.
## 3. Estructura actual de artefactos
Todos los artefactos de pruebas de carga quedaron agrupados en:
- `load-testing/`
Archivos principales:
- `load-testing/locustfile.py`
- `load-testing/test_plan.jmx`
- `load-testing/test_data.csv`
- `load-testing/docker-compose.perf.yml`
Scripts principales:
- `load-testing/scripts/run_locust_docker.sh`
- `load-testing/scripts/run_jmeter_docker.sh`
- `load-testing/scripts/build_jmeter_scenario_plan.py`
- `load-testing/scripts/open_jmeter_gui_docker.sh`
## 4. Funcion de los scripts
### `run_locust_docker.sh`
Ejecuta `Locust` en modo headless por escenario y genera:
- reporte HTML
- archivos CSV
- log de ejecucion
### `run_jmeter_docker.sh`
Ejecuta `JMeter` por escenario y genera:
- dashboard HTML
- archivo `.jtl`
- log de ejecucion
- plan temporal del escenario ejecutado
### `build_jmeter_scenario_plan.py`
Toma el plan base de `JMeter`, activa solo el escenario solicitado, desactiva los demas y pone el `delay` del escenario activo en `0`.
### `open_jmeter_gui_docker.sh`
Levanta `JMeter GUI` en Docker y lo expone por navegador mediante noVNC para revision visual del plan.
## 5. Preparacion previa
### 5.1 Ubicarse en la raiz del proyecto
```bash
cd /mnt/c/Users/gonza/OneDrive/Escritorio/202612-MISW4204-Grupo17
5.2 Levantar backend y herramientas
docker compose -f docker-compose.yml -f load-testing/docker-compose.perf.yml up -d --build
5.3 Verificar salud del sistema
curl http://localhost/api/v1/health
6. Estrategia de ejecucion
El orden recomendado es:
1. ejecutar primero todos los escenarios en Locust
2. ejecutar despues todos los escenarios en JMeter
Orden exacto:
1. Locust normal
2. Locust alta
3. Locust estres
4. Locust spike
5. JMeter normal
6. JMeter alta
7. JMeter estres
8. JMeter spike
7. Escenarios ejecutados
7.1 Escenario normal
Objetivo:
- validar operacion nominal del sistema
- establecer la linea base de comparacion
Interpretacion:
- representa uso esperado
- se espera estabilidad y bajo nivel de errores
Configuracion actual:
- Locust: 20 usuarios, spawn rate 0.33, 5m
- JMeter: 20 hilos, ramp-up 60s, 300s
7.2 Escenario alta
Objetivo:
- validar degradacion controlada ante incremento de concurrencia
Interpretacion:
- representa una carga elevada pero aun razonable
- permite ver si la latencia sube sin comprometer completamente la estabilidad
Configuracion actual:
- Locust: 60 usuarios, spawn rate 0.5, 20m
- JMeter: 60 hilos, ramp-up 120s, 480s
7.3 Escenario estres
Objetivo:
- identificar el limite funcional del backend
Interpretacion:
- busca evidenciar saturacion, aumento fuerte de tiempos de respuesta y errores
Configuracion actual:
- Locust: 120 usuarios, spawn rate 0.67, 15m
- JMeter: 120 hilos, ramp-up 180s, 420s
7.4 Escenario spike
Objetivo:
- medir la reaccion del sistema ante un pico brusco de carga
Interpretacion:
- no busca carga estable
- busca observar impacto inicial, degradacion repentina y recuperacion
Configuracion actual:
- Locust: 100 usuarios, spawn rate 10, 10m
- JMeter: 100 hilos, ramp-up 10s, 300s
8. Flujos funcionales bajo prueba
La mezcla funcional de usuarios simula dos perfiles:
- usuarios operativos
- profesores
Distribucion objetivo:
- 70% operativos
- 30% profesores
Endpoints relevantes:
Flujo operativo
- POST /api/v1/auth/login
- GET /api/v1/mis-vinculaciones
- GET /api/v1/tareas
- POST /api/v1/tareas
Flujo profesor
- GET /api/v1/profesor/personas
- GET /api/v1/profesor/seguimiento
- POST /api/v1/reportes/generar
- GET /api/v1/reportes
- GET /api/v1/reportes/{id}/download
9. Ejecucion paso a paso
9.1 Locust
Normal
bash load-testing/scripts/run_locust_docker.sh normal
Alta
bash load-testing/scripts/run_locust_docker.sh alta
Estres
bash load-testing/scripts/run_locust_docker.sh estres
Spike
bash load-testing/scripts/run_locust_docker.sh spike
Archivos esperados:
- reports/locust/<escenario>.html
- reports/locust/<escenario>_stats.csv
- reports/locust/<escenario>_failures.csv
- reports/locust/<escenario>_stats_history.csv
- reports/logs/locust_<escenario>_<timestamp>.log
9.2 JMeter
Normal
bash load-testing/scripts/run_jmeter_docker.sh normal
Alta
bash load-testing/scripts/run_jmeter_docker.sh alta
Estres
bash load-testing/scripts/run_jmeter_docker.sh estres
Spike
bash load-testing/scripts/run_jmeter_docker.sh spike
Archivos esperados:
- reports/jmeter/<escenario>/index.html
- reports/jmeter/<escenario>.jtl
- reports/jmeter/plans/test_plan_<escenario>.jmx
- reports/logs/jmeter_<escenario>_<timestamp>.log
10. Uso opcional de JMeter GUI
Si se requiere revisar visualmente el plan:
bash load-testing/scripts/open_jmeter_gui_docker.sh
Abrir en navegador:
http://localhost:6080/vnc.html
Pasos:
1. hacer clic en Connect
2. abrir File > Open
3. cargar /workspace/load-testing/test_plan.jmx
Importante:
- dejar activo 00 Setup Data
- dejar activo solo un escenario si se ejecuta manualmente desde GUI
11. Que revisar en los resultados
En cada escenario se recomienda revisar:
- tiempo de respuesta promedio
- percentil 95
- percentil 99
- throughput
- porcentaje de errores
- comportamiento de endpoints criticos
- impacto en autenticacion, tareas y reportes
Comparaciones clave:
- normal vs alta
- alta vs estres
- estres vs spike
12. Resultado esperado del ejercicio
Al finalizar la ejecucion completa se debe contar con:a
- reportes HTML de Locust
- dashboards HTML de JMeter
- logs por escenario
- evidencia funcional de generacion de reportes PDF si aplica
- base suficiente para comparar estabilidad, degradacion y saturacion del backend
13. Comandos consolidados
docker compose -f docker-compose.yml -f load-testing/docker-compose.perf.yml up -d --build
curl http://localhost/api/v1/health
bash load-testing/scripts/run_locust_docker.sh normal
bash load-testing/scripts/run_locust_docker.sh alta
bash load-testing/scripts/run_locust_docker.sh estres
bash load-testing/scripts/run_locust_docker.sh spike
bash load-testing/scripts/run_jmeter_docker.sh normal
bash load-testing/scripts/run_jmeter_docker.sh alta
bash load-testing/scripts/run_jmeter_docker.sh estres
bash load-testing/scripts/run_jmeter_docker.sh spike
14. Conclusion ejecutiva
La solucion de pruebas de carga del proyecto quedo estructurada para ejecutar escenarios comparables en Locust y JMeter, usando Docker y apuntando directamente al backend. La ejecucion secuencial de normal, alta, estres y spike permite construir una lectura clara sobre operacion nominal, degradacion controlada, punto de saturacion y reaccion ante picos bruscos de concurrencia.
