Guías de Diagnóstico para Motores Diésel Volvo
1. GUÍA VD-001: MOTOR NO ARRANCA - VOLVO D13
markdown
# GUÍA DE DIAGNÓSTICO: MOTOR NO ARRANCA - VOLVO D13 (2014-2020)




## INFORMACIÓN BÁSICA
- **Motor:** Volvo D13
- **Años:** 2014-2020
- WORK ORDER : WO-TA- 
## SÍNTOMAS REPORTADOS (+)
- **Síntoma Principal:** Motor no arranca, no gira
- **Síntoma 1:** Motor no gira
- **sintoma 2: codigos de error ** P0335, P0336, P0087, P0191

….

## HERRAMIENTAS REQUERIDAS (+)
- **Diagnóstico:** Volvo VCADS o scanner compatible
- **Eléctricas:** Multímetro digital, pinza amperimétrica
- **Mecánicas:** Llaves 8-19mm, juegos torx
- **Seguridad:** Guantes dieléctricos, gafas protección

## PROCEDIMIENTO DIAGNÓSTICO (+ crea posos) 

### PASO 1: DIAGNÓSTICO RÁPIDO (5 min) (+ crear sub pasos)
1. Verificar voltaje batería (debe ser >12.6V)
2. Comprobar fusibles principales en caja central
3. Inspección visual cableado batería y tierra
4. Verificar que palanca cambios esté en neutral

### PASO 2: SISTEMA BATERÍA Y ARRANQUE (+ crear sub pasos)
1. **Test Batería:** (+ crear sub pasos de sub pasos)
   - Voltaje en reposo: >12.6V
   - Voltaje durante arranque: >10.5V
   - Caída voltaje cables: <0.3V

2. **Test Motor Arranque:** (+ crear sub pasos de sub pasos)
   - Consumo máximo: 350-450A
   - Voltaje en solenoide: >10V durante arranque
   - Verificar relé arranque (ubicado en caja fusibles lateral)

### PASO 3: SENSORES CRÍTICOS VOLVO
1. **Sensor RPM (CKP):** (+)
   - Resistencia: 800-1200Ω
   - Señal AC: >1.5V RMS durante arranque
   - Verificar entrehierro: 0.5-1.5mm

2. **Sensor Posición Árbol Levas (CMP):** )(+)
   - Voltaje referencia: 5V
   - Señal cuadrada 0-5V durante arranque

### PASO 4: SISTEMA COMBUSTIBLE
1. **Presión Rail:**
   - Mínima para arranque: >300 bar
   - Verificar con scanner en datos en vivo

2. **Válvula de Control de Presión (PCV):**
   - Resistencia: 2-4Ω
   - Comando desde ECU: 20-80% duty cycle

2. GUÍA VD-015: FALTA POTENCIA - VOLVO D11/D13
markdown
# GUÍA VD-015: FALTA POTENCIA - VOLVO D11/D13 (2015-2023)

## SÍNTOMAS REPORTADOS
- [X] Respuesta lenta al acelerador
- [X] No alcanza RPM máximas
- [X] Humo negro bajo carga
- [X] Consumo excesivo de combustible
- [ ] Pérdidas de potencia intermitentes

## CÓDIGOS DTC COMUNES VOLVO
- P0299: Presión turbo baja
- P0101: Rendimiento sensor MAF
- P2263: Turbo bajo rendimiento
- P0087: Presión rail muy baja
- P0401: Flujo EGR insuficiente

## PROCEDIMIENTO DIAGNÓSTICO

### PASO 1: LECTURA PARÁMETROS EN VIVO
1. **Presión Turbo (Boost):**
   - Ralentí: 0-2 psi
   - 1500 RPM: 15-25 psi
   - Máxima: 35-45 psi (depende de calibración)

2. **Sensor MAF:**
   - Ralentí: 400-600 mg/inyección
   - Aceleración completa: 1800-2200 mg/inyección

3. **Presión Rail:**
   - Ralentí: 350-500 bar
   - Bajo carga: 1600-2200 bar

### PASO 2: SISTEMA TURBO VGT
1. **Verificar Álabes VGT:**
   - Comando desde ECU: 30-80%
   - Posición real vs comando: ±5%
   - Limpiar con limpiador de carbón específico

2. **Test Actuador VGT:**
   - Resistencia bobina: 10-20Ω
   - Movimiento libre sin atascos
   - Verificar manguera de vacío

### PASO 3: SISTEMA EGR VOLVO
1. **Flujo EGR:**
   - Válvula EGR comando: 0-100%
   - Posición real: seguir comando dentro de ±8%
   - Limpiar válvula con limpiador EGR específico

2. **Enfriador EGR:**
   - Verificar obstrucciones
   - Test fugas de presión
   - Limpiar con equipo ultrasonido

### PASO 4: INYECTORES Y PRESIÓN
1. **Balance de Inyectores:**
   - Variación entre inyectores: < ±3 mg/inyección
   - Corrección adaptativa: < ±4 mg

2. **Bomba Alta Presión:**
   - Caudal de entrega: 600-800 L/h
   - Presión de control: 5-7 bar

3. GUÍA VD-008: HUMO AZUL/EXCESIVO - VOLVO D13
markdown
# GUÍA VD-008: HUMO AZUL EXCESIVO - VOLVO D13

## DIAGNÓSTICO POR COLOR DE HUMO

### HUMO AZUL (Aceite quemado)
**CAUSAS PROBABLES:**
1. **Anillos desgastados:**
   - Test compresión: 25-35 bar
   - Diferencia entre cilindros: < 5 bar
   - Test fugas: < 10% pérdida en 2 minutos

2. **Válvulas desgastadas:**
   - Test vacío: 15-22 inHg estable
   - Test fugas con compresor

3. **Turbo:**
   - Juego axial: < 0.1mm
   - Juego radial: < 0.5mm
   - Verificar sellos de aceite

### HUMO NEGRO (Combustible sin quemar)
**CAUSAS PROBABLES:**
1. **Inyectores defectuosos:**
   - Test patrón pulverización
   - Caudal de retorno: < 100 ml/min por inyector
   - Balance de corrección

2. **Filtros obstruidos:**
   - Caída presión aire: < 25 inH2O
   - Caída presión combustible: < 5 psi

### HUMO BLANCO (Combustible sin quemar/anticon gel)
**CAUSAS PROBABLES:**
1. **Inyectores goteo:**
   - Test estanqueidad
   - Verificar tiempos inyección
   - Calibración ECU

4. GUÍA VD-023: SOBRECALENTAMIENTO - VOLVO D11/D13
markdown
# GUÍA VD-023: SOBRECALENTAMIENTO - VOLVO D11/D13

## SÍNTOMAS
- Temperatura > 105°C en condiciones normales
- Pérdida de refrigerante
- Aire acondicionado deja de funcionar
- Potencia reducida (protección motor)

## PROCEDIMIENTO DIAGNÓSTICO

### PASO 1: SISTEMA REFRIGERACIÓN
1. **Termostato:**
   - Apertura: 82-88°C
   - Apertura completa: 95°C
   - Test en agua caliente con termómetro

2. **Bomba Agua:**
   - Verificar juego del eje
   - Paletas en buen estado
   - Sello sin fugas

3. **Ventilador:**
   - Comando desde ECU: 0-100%
   - Verificar embrague viscoso
   - Test actuador eléctrico

### PASO 2: SISTEMA DE ENFRIAMIENTO INTERCOOLER
1. **Eficiencia Intercooler:**
   - Diferencia temperatura entrada/salida: 30-50°C
   - Verificar obstrucciones
   - Limpiar con desengrasante específico

2. **Mangueras y Conexiones:**
   - Test presión: 25 psi por 10 minutos
   - Verificar abrazaderas
   - Inspeccionar por grietas

### PASO 3: SENSORES TEMPERATURA
1. **ECT (Engine Coolant Temp):**
   - Resistencia a 20°C: 2200-2700Ω
   - Resistencia a 80°C: 300-360Ω
   - Señal a ECU: 0.5-4.5V

2. **Sensor Temp Aceite:**
   - Rango operación: -40°C a 150°C
