document.addEventListener('DOMContentLoaded', () => {
    const infoHeader = document.getElementById('fecha-actual');
    const diaSemanaSpan = document.getElementById('dia-semana');
    const fechaCompletaSpan = document.getElementById('fecha-completa');
    const tiempoActualDiv = document.getElementById('tiempo-actual');
    
    const cicloBtns = document.querySelectorAll('.ciclo-btn');
    const tiemposContainer = document.getElementById('tiempos-container');
    const semanasContainer = document.getElementById('semanas-container');

    const getCicloLiturgico = (year) => {
        const remainder = (year - 1) % 3;
        if (remainder === 0) return 'A';
        if (remainder === 1) return 'B';
        if (remainder === 2) return 'C';
    };
    
    let selectedCiclo = getCicloLiturgico(new Date().getFullYear());
    let urlBase = '/src/ainterleccional.html?canto=';

    // Parsear YYYY-MM-DD como fecha local (evita interpretación UTC)
    const parseLocalDate = (input) => {
        if (!input) return null;
        if (input instanceof Date) {
            return new Date(input.getFullYear(), input.getMonth(), input.getDate());
        }
        if (typeof input === 'string') {
            const m = input.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (m) {
                const y = Number(m[1]), mo = Number(m[2]) - 1, d = Number(m[3]);
                return new Date(y, mo, d); // medianoche local del día
            } else {
                // fallback: intentar construir Date (no recomendado para YYYY-MM-DD)
                const dObj = new Date(input);
                return new Date(dObj.getFullYear(), dObj.getMonth(), dObj.getDate());
            }
        }
        return null;
    };

    // Normalizar al inicio o fin del día (local)
    const normalizeDate = (dateStrOrObj, endOfDay = false) => {
        const base = parseLocalDate(dateStrOrObj);
        if (!base) return null;
        if (endOfDay) {
            return new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59, 999);
        } else {
            return new Date(base.getFullYear(), base.getMonth(), base.getDate(), 0, 0, 0, 0);
        }
    };

    const fmt = (d) => {
        if (!d) return '';
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${dd}`;
    };

    const getInfoLiturgicaActual = () => {
        const today = new Date();
        const todayNorm = new Date(today.getFullYear(), today.getMonth(), today.getDate()); // medianoche local

        const diaSemana = today.toLocaleString('es-ES', { weekday: 'long' });
        const fechaCompleta = today.toLocaleDateString('es-ES');
        
        let cicloActual = getCicloLiturgico(today.getFullYear());

        if (today.getMonth() >= 10) { 
            const firstSundayOfAdvent = new Date(today.getFullYear(), 11, 1);
            while (firstSundayOfAdvent.getDay() !== 0) {
                firstSundayOfAdvent.setDate(firstSundayOfAdvent.getDate() + 1);
            }
            if (today >= firstSundayOfAdvent) {
                cicloActual = getCicloLiturgico(today.getFullYear() + 1);
            }
        }
        
        let info = {
            dia: diaSemana,
            fecha: fechaCompleta,
            tiempo: 'Tiempo Ordinario',
            semana: ''
        };

        console.log("📅 Hoy (local):", fmt(todayNorm), "Ciclo:", cicloActual);

        const tiempos = tiemposLiturgicos[cicloActual];
        if (tiempos) {
            for (const tiempo of tiempos) {
                if (tiempo.tipo === 'semanas') {
                    const inicio = normalizeDate(tiempo.inicio);
                    const fin = normalizeDate(tiempo.fin, true);
                    console.log(`  Chequeando tiempo "${tiempo.tiempo}": ${fmt(inicio)} - ${fmt(fin)}`);
                    if (todayNorm >= inicio && todayNorm <= fin) {
                        info.tiempo = tiempo.tiempo;

                        if (tiempo.codigo === 'to') {
                            const weeks = ordinaryTimeWeeks[cicloActual] || [];
                            if (weeks.length === 0) console.log("  ⚠️ No hay semanas definidas para el ciclo", cicloActual);
                            for (const week of weeks) {
                                const weekStart = normalizeDate(week.inicio);
                                const weekEnd   = normalizeDate(week.fin, true);
                                console.log(`🔎 Semana ${week.semana}: ${fmt(weekStart)} - ${fmt(weekEnd)}`);
                                if (todayNorm >= weekStart && todayNorm <= weekEnd) {
                                    console.log("✅ Coincide con Semana", week.semana);
                                    info.semana = `, Semana ${week.semana}`;
                                    break;
                                }
                            }
                        } else {
                            const weeks = ordinaryTimeWeeks[tiempo.tiempo] || [];
                            for (const week of weeks) {
                                const weekStart = normalizeDate(week.inicio);
                                const weekEnd   = normalizeDate(week.fin, true);
                                console.log(`🔎 [${tiempo.tiempo}] Semana ${week.semana}: ${fmt(weekStart)} - ${fmt(weekEnd)}`);
                                if (todayNorm >= weekStart && todayNorm <= weekEnd) {
                                    console.log("✅ Coincide con", tiempo.tiempo, "Semana", week.semana);
                                    info.semana = `, Semana ${week.semana}`;
                                    break;
                                }
                            }
                        }
                        break;
                    }
                }
            }
        }

        const fiestas = tiemposLiturgicos[cicloActual].find(t => t.tipo === 'fiestas');
        if (fiestas) {
            const todayMonth = today.toLocaleString('es-ES', { month: 'long' });
            const todayDay = today.getDate();
            const fiestasMes = fiestas.fiestas[todayMonth];
            if (fiestasMes) {
                const fiestaHoy = fiestasMes.find(f => f.fecha.startsWith(todayDay.toString()));
                if (fiestaHoy) {
                    console.log("🎉 Hoy es fiesta:", fiestaHoy.nombre);
                    info.tiempo = fiestaHoy.nombre;
                    info.semana = '';
                }
            }
        }

        console.log("🔔 Info detectada:", info);
        return info;
    };

    const displayTiempos = (ciclo) => {
        const tiempos = tiemposLiturgicos[ciclo];
        if (!tiempos) return;
        
        tiemposContainer.innerHTML = '';
        semanasContainer.innerHTML = '';

        tiempos.forEach(tiempo => {
            const tiempoBtn = document.createElement('button');
            tiempoBtn.classList.add('tiempo-btn');
            tiempoBtn.textContent = tiempo.tiempo;
            tiempoBtn.addEventListener('click', () => {
                tiemposContainer.querySelectorAll('.tiempo-btn').forEach(btn => btn.classList.remove('selected'));
                tiempoBtn.classList.add('selected');
                displaySemanas(tiempo);
            });
            tiemposContainer.appendChild(tiempoBtn);
        });
    };

    const displaySemanas = (tiempo) => {
        semanasContainer.innerHTML = '';
        selectedSemana = null;

        if (tiempo.tipo === 'semanas') {
            let semanas = [];
            
            if (tiempo.codigo === 'to') {
                semanas = ordinaryTimeWeeks[selectedCiclo] || [];
            } else {
                semanas = ordinaryTimeWeeks[tiempo.tiempo] || [];
                if (semanas.length === 0) {
                    for (let i = 1; i <= tiempo.semanas; i++) {
                        semanas.push({ semana: i });
                    }
                }
            }

            semanas.forEach(semana => {
                const semanaBtn = document.createElement('button');
                semanaBtn.classList.add('semana-btn');
                semanaBtn.textContent = `${semana.semana}`;
                semanaBtn.addEventListener('click', () => {
                    const url = `${urlBase}ai${tiempo.codigo}s${semana.semana}${selectedCiclo.toLowerCase()}`;
                    console.log("➡️ Navegando a:", url);
                    window.location.href = url;
                });
                semanasContainer.appendChild(semanaBtn);
            });
        } else if (tiempo.tipo === 'fiestas') {
            const mesesContainer = document.createElement('div');
            mesesContainer.classList.add('meses-container');
            semanasContainer.appendChild(mesesContainer);
            
            const fiestasContainer = document.createElement('div');
            fiestasContainer.classList.add('fiestas-container');
            semanasContainer.appendChild(fiestasContainer);

            Object.keys(tiempo.fiestas).forEach(mes => {
                const mesBtn = document.createElement('button');
                mesBtn.classList.add('mes-btn');
                mesBtn.textContent = mes.charAt(0).toUpperCase() + mes.slice(1);
                mesBtn.dataset.mes = mes;
                mesBtn.addEventListener('click', () => {
                    mesesContainer.querySelectorAll('.mes-btn').forEach(btn => btn.classList.remove('selected'));
                    mesBtn.classList.add('selected');
                    fiestasContainer.innerHTML = '';
                    tiempo.fiestas[mes].forEach(fiesta => {
                        const btn = document.createElement('button');
                        btn.classList.add('fiesta-btn');
                        btn.textContent = `${fiesta.nombre} (${fiesta.fecha})`;
                        btn.dataset.url = fiesta.url;
                        btn.addEventListener('click', () => {
                            console.log("➡️ Navegando a fiesta:", fiesta.url);
                            window.location.href = urlBase + fiesta.url;
                        });
                        fiestasContainer.appendChild(btn);
                    });
                });
                mesesContainer.appendChild(mesBtn);
            });

            const primerMes = Object.keys(tiempo.fiestas)[0];
            if (primerMes) {
                const primerBoton = mesesContainer.querySelector(`[data-mes="${primerMes}"]`);
                if (primerBoton) {
                    primerBoton.click();
                }
            }
        }
    };
    
    const info = getInfoLiturgicaActual();
    diaSemanaSpan.textContent = info.dia;
    fechaCompletaSpan.textContent = info.fecha;
    tiempoActualDiv.textContent = `${info.tiempo}${info.semana}`;
    
    cicloBtns.forEach(btn => {
        const ciclo = btn.textContent.split(' ')[1];
        if (ciclo === selectedCiclo) {
            btn.classList.add('selected');
        }
    });

    cicloBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            cicloBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedCiclo = btn.textContent.split(' ')[1];
            displayTiempos(selectedCiclo);
        });
    });

    displayTiempos(selectedCiclo);
});


// =====================
// 🔍 Validador de tiempos.js
// =====================

const validarSemanas = () => {
    const ciclos = Object.keys(ordinaryTimeWeeks);

    ciclos.forEach(ciclo => {
        const semanas = ordinaryTimeWeeks[ciclo];
        if (!Array.isArray(semanas) || semanas.length === 0) return;

        console.log(`\n📖 Validando ciclo/tiempo: ${ciclo}`);

        // Ordenar por fecha de inicio
        const ordenadas = [...semanas].sort((a, b) => new Date(a.inicio) - new Date(b.inicio));

        for (let i = 0; i < ordenadas.length; i++) {
            const sem = ordenadas[i];
            const inicio = new Date(sem.inicio);
            const fin = new Date(sem.fin);

            // Validación básica
            if (inicio > fin) {
                console.error(`❌ Semana ${sem.semana} en ${ciclo} tiene inicio mayor que fin: ${sem.inicio} > ${sem.fin}`);
            }

            // Comparar con la siguiente
            if (i < ordenadas.length - 1) {
                const next = ordenadas[i + 1];
                const nextInicio = new Date(next.inicio);

                if (fin >= nextInicio) {
                    console.warn(`⚠️ Semana ${sem.semana} (${sem.inicio}-${sem.fin}) solapa con Semana ${next.semana} (${next.inicio}-${next.fin})`);
                }

                const gap = (nextInicio - fin) / (1000 * 60 * 60 * 24);
                if (gap > 1) {
                    console.warn(`⚠️ Hay un hueco de ${gap - 1} días entre Semana ${sem.semana} (${sem.fin}) y Semana ${next.semana} (${next.inicio})`);
                }
            }
        }
    });
};

// Ejecutar validación
validarSemanas();
