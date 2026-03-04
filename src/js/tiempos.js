const oa1 = 7;  const oa2 = 27;
const ob1 = 6;  const ob2 = 28;
const oc1 = 8;  const oc2 = 27;

// Este objeto contiene las fiestas con fecha definida, organizadas por mes.
const fiestasDeFechaFija = {
    'enero': [
        { nombre: 'Santa María, Madre de Dios', fecha: '1 de enero', url: 'fsm1ene' },
        { nombre: 'Epifanía del Señor', fecha: '6 de enero (o el domingo siguiente)', url: 'fe6ene' }
    ],
    'febrero': [
        { nombre: 'Presentación del Señor', fecha: '2 de febrero', url: 'fsm2feb' },
    ],    
    'marzo': [
        { nombre: 'San José', fecha: '19 de marzo', url: 'fjs19mar' },
        { nombre: 'Anunciación del Señor', fecha: '25 de marzo', url: 'fas25mar' }
    ],
    'abril': [
        { nombre: 'Domingo de Resurección', fecha: '', url: 'fsmabr' },
    ],        
    'mayo': [
        { nombre: 'Visitación de María a Isabel', fecha: '31 de mayo', url: 'fvm31may' }
    ],
    'junio': [
        { nombre: 'Nacimiento de San Juan Bautista', fecha: '24 de junio', url: 'fnsjb24jun' },
        { nombre: 'San Pedro y San Pablo', fecha: '29 de junio', url: 'fspp29jun' }
    ],
    'agosto': [
        { nombre: 'Transfiguración del Señor', fecha: '6 de agosto', url: 'ftsd6ago' },
        { nombre: 'Asunción de la Virgen María', fecha: '15 de agosto', url: 'favm15ago' },
        { nombre: 'Santa Rosa de Lima', fecha: '23 de agosto', url: 'fsrl23ago' },
        { nombre: 'Reina y Madre de la Merced', fecha: '24 de agosto', url: 'frm24ago' }
    ],
    'septiembre': [
        { nombre: 'Natividad de la Virgen María', fecha: '8 de septiembre', url: 'fnvm8sep' },
        { nombre: 'Exaltación de la Santa Cruz', fecha: '14 de septiembre', url: 'fesc14sep' },
        { nombre: 'Nuestra Señora de los Dolores', fecha: '15 de septiembre', url: 'fnsd15sep' },
        { nombre: 'San Mateo, Apóstol y Evangelista', fecha: '21 de septiembre', url: 'fsm21sep' },
    ],
    'octubre': [
        { nombre: 'Nuestra Señora del Rosario', fecha: '7 de octubre', url: 'fnsr7oct' },
        { nombre: 'San Francisco de Asís', fecha: '4 de octubre', url: 'sfa4oct' },
    ],
    'noviembre': [
        { nombre: 'Todos los Santos', fecha: '1 de noviembre', url: 'fts1nov' },
        { nombre: 'Los Fieles Difuntos', fecha: '2 de noviembre', url: 'lfd2nov' },
        { nombre: 'Dedicación de la Basílica de Letrán', fecha: '9 de noviembre', url: 'dbl9nov' },
    ],
    'diciembre': [
        { nombre: 'Inmaculada Concepción', fecha: '8 de diciembre', url: 'fic8dic' },
        { nombre: 'Navidad del Señor', fecha: '25 de diciembre', url: 'fns25dic' }
    ],
};

const tiemposLiturgicos = {
    'A': [
        // Año Litúrgico 2022-2023
        { tiempo: 'Adviento',   codigo: 'ta', inicio: '2022-11-27', fin: '2022-12-24', semanas: 4, tipo: 'semanas' },
        { tiempo: 'Navidad',    codigo: 'tn', inicio: '2022-12-25', fin: '2023-01-08', semanas: 2, tipo: 'semanas' },
        { tiempo: 'Ordinario',  codigo: 'to', inicio: '2023-01-09', fin: '2023-12-02', semanas: 34, tipo: 'semanas' },
        { tiempo: 'Cuaresma',   codigo: 'tc', inicio: '2023-02-22', fin: '2023-04-08', semanas: 6, tipo: 'semanas' },
        { tiempo: 'Pascua',     codigo: 'tp', inicio: '2023-04-09', fin: '2023-05-27', semanas: 7, tipo: 'semanas' },
        { tiempo: 'Fiestas',    codigo: 'tf', tipo: 'fiestas', fiestas: fiestasDeFechaFija }
    ],
    'B': [
        // Año Litúrgico 2023-2024
        { tiempo: 'Adviento',   codigo: 'ta', inicio: '2023-12-03', fin: '2023-12-24', semanas: 4, tipo: 'semanas' },
        { tiempo: 'Navidad',    codigo: 'tn', inicio: '2023-12-25', fin: '2024-01-07', semanas: 2, tipo: 'semanas' },
        { tiempo: 'Ordinario',  codigo: 'to', inicio: '2024-01-08', fin: '2024-11-30', semanas: 34, tipo: 'semanas' },
        { tiempo: 'Cuaresma',   codigo: 'tc', inicio: '2024-02-14', fin: '2024-03-30', semanas: 6, tipo: 'semanas' },
        { tiempo: 'Pascua',     codigo: 'tp', inicio: '2024-03-31', fin: '2024-05-19', semanas: 7, tipo: 'semanas' },
        { tiempo: 'Fiestas',    codigo: 'tf', tipo: 'fiestas', fiestas: fiestasDeFechaFija }
    ],
    'C': [
        // Año Litúrgico 2024-2025
        { tiempo: 'Adviento',   codigo: 'ta', inicio: '2024-12-01', fin: '2024-12-24', semanas: 4, tipo: 'semanas' },
        { tiempo: 'Navidad',    codigo: 'tn', inicio: '2024-12-25', fin: '2025-01-12', semanas: 2, tipo: 'semanas' },
        { tiempo: 'Ordinario',  codigo: 'to', inicio: '2025-01-13', fin: '2025-11-29', semanas: 34, tipo: 'semanas' },
        { tiempo: 'Cuaresma',   codigo: 'tc', inicio: '2025-03-05', fin: '2025-04-19', semanas: 6, tipo: 'semanas' },
        { tiempo: 'Pascua',     codigo: 'tp', inicio: '2025-04-20', fin: '2025-06-08', semanas: 7, tipo: 'semanas' },
        { tiempo: 'Fiestas',    codigo: 'tf', tipo: 'fiestas', fiestas: fiestasDeFechaFija }
    ]
};

const ordinaryTimeWeeks = {
    // Ciclo A
    'A': [
        { semana: 1, inicio: '2023-01-09', fin: '2023-01-14' },
        { semana: 2, inicio: '2023-01-15', fin: '2023-01-21' },
        { semana: 3, inicio: '2023-01-22', fin: '2023-01-28' },
        { semana: 4, inicio: '2023-01-29', fin: '2023-02-04' },
        { semana: 5, inicio: '2023-02-05', fin: '2023-02-11' },
        { semana: 6, inicio: '2023-02-12', fin: '2023-02-18' },
        { semana: 7, inicio: '2023-02-19', fin: '2023-02-25' },
        { semana: 8, inicio: '2023-05-28', fin: '2023-06-03' },
        { semana: 9, inicio: '2023-06-04', fin: '2023-06-10' },
        { semana: 10, inicio: '2023-06-11', fin: '2023-06-17' },
        { semana: 11, inicio: '2023-06-18', fin: '2023-06-24' },
        { semana: 12, inicio: '2023-06-25', fin: '2023-07-01' },
        { semana: 13, inicio: '2023-07-02', fin: '2023-07-08' },
        { semana: 14, inicio: '2023-07-09', fin: '2023-07-15' },
        { semana: 15, inicio: '2023-07-16', fin: '2023-07-22' },
        { semana: 16, inicio: '2023-07-23', fin: '2023-07-29' },
        { semana: 17, inicio: '2023-07-30', fin: '2023-08-05' },
        { semana: 18, inicio: '2023-08-06', fin: '2023-08-12' },
        { semana: 19, inicio: '2023-08-13', fin: '2023-08-19' },
        { semana: 20, inicio: '2023-08-20', fin: '2023-08-26' },
        { semana: 21, inicio: '2023-08-27', fin: '2023-09-02' },
        { semana: 22, inicio: '2023-09-03', fin: '2023-09-09' },
        { semana: 23, inicio: '2023-09-10', fin: '2023-09-16' },
        { semana: 24, inicio: '2023-09-17', fin: '2023-09-23' },
        { semana: 25, inicio: '2023-09-24', fin: '2023-09-30' },
        { semana: 26, inicio: '2023-10-01', fin: '2023-10-07' },
        { semana: 27, inicio: '2023-10-08', fin: '2023-10-14' },
        { semana: 28, inicio: '2023-10-15', fin: '2023-10-21' },
        { semana: 29, inicio: '2023-10-22', fin: '2023-10-28' },
        { semana: 30, inicio: '2023-10-29', fin: '2023-11-04' },
        { semana: 31, inicio: '2023-11-05', fin: '2023-11-11' },
        { semana: 32, inicio: '2023-11-12', fin: '2023-11-18' },
        { semana: 33, inicio: '2023-11-19', fin: '2023-11-25' },
        { semana: 34, inicio: '2023-11-26', fin: '2023-12-02' }
    ],
    // Ciclo B
    'B': [
        { semana: 1, inicio: '2024-01-08', fin: '2024-01-13' },
        { semana: 2, inicio: '2024-01-14', fin: '2024-01-20' },
        { semana: 3, inicio: '2024-01-21', fin: '2024-01-27' },
        { semana: 4, inicio: '2024-01-28', fin: '2024-02-03' },
        { semana: 5, inicio: '2024-02-04', fin: '2024-02-10' },
        { semana: 6, inicio: '2024-02-11', fin: '2024-02-17' },
        { semana: 7, inicio: '2024-05-20', fin: '2024-05-25' },
        { semana: 8, inicio: '2024-05-26', fin: '2024-06-01' },
        { semana: 9, inicio: '2024-06-02', fin: '2024-06-08' },
        { semana: 10, inicio: '2024-06-09', fin: '2024-06-15' },
        { semana: 11, inicio: '2024-06-16', fin: '2024-06-22' },
        { semana: 12, inicio: '2024-06-23', fin: '2024-06-29' },
        { semana: 13, inicio: '2024-06-30', fin: '2024-07-06' },
        { semana: 14, inicio: '2024-07-07', fin: '2024-07-13' },
        { semana: 15, inicio: '2024-07-14', fin: '2024-07-20' },
        { semana: 16, inicio: '2024-07-21', fin: '2024-07-27' },
        { semana: 17, inicio: '2024-07-28', fin: '2024-08-03' },
        { semana: 18, inicio: '2024-08-04', fin: '2024-08-10' },
        { semana: 19, inicio: '2024-08-11', fin: '2024-08-17' },
        { semana: 20, inicio: '2024-08-18', fin: '2024-08-24' },
        { semana: 21, inicio: '2024-08-25', fin: '2024-08-31' },
        { semana: 22, inicio: '2024-09-01', fin: '2024-09-07' },
        { semana: 23, inicio: '2024-09-08', fin: '2024-09-14' },
        { semana: 24, inicio: '2024-09-15', fin: '2024-09-21' },
        { semana: 25, inicio: '2024-09-22', fin: '2024-09-28' },
        { semana: 26, inicio: '2024-09-29', fin: '2024-10-05' },
        { semana: 27, inicio: '2024-10-06', fin: '2024-10-12' },
        { semana: 28, inicio: '2024-10-13', fin: '2024-10-19' },
        { semana: 29, inicio: '2024-10-20', fin: '2024-10-26' },
        { semana: 30, inicio: '2024-10-27', fin: '2024-11-02' },
        { semana: 31, inicio: '2024-11-03', fin: '2024-11-09' },
        { semana: 32, inicio: '2024-11-10', fin: '2024-11-16' },
        { semana: 33, inicio: '2024-11-17', fin: '2024-11-23' },
        { semana: 34, inicio: '2024-11-24', fin: '2024-11-30' }
    ],
    // Ciclo C
    'C': [
        { semana: 1, inicio: '2025-01-13', fin: '2025-01-18' },
        { semana: 2, inicio: '2025-01-19', fin: '2025-01-25' },
        { semana: 3, inicio: '2025-01-26', fin: '2025-02-01' },
        { semana: 4, inicio: '2025-02-02', fin: '2025-02-08' },
        { semana: 5, inicio: '2025-02-09', fin: '2025-02-15' },
        { semana: 6, inicio: '2025-02-16', fin: '2025-02-22' },
        { semana: 7, inicio: '2025-02-23', fin: '2025-03-01' },
        { semana: 8, inicio: '2025-03-02', fin: '2025-03-08' },
        // corde de cuaresma
        // { semana: 10, inicio: '2025-06-09', fin: '2025-06-14' },
        // Semana 9 se pierde
        { semana: 10, inicio: '2025-06-09', fin: '2025-06-14' },
        { semana: 11, inicio: '2025-06-15', fin: '2025-06-21' },
        { semana: 12, inicio: '2025-06-22', fin: '2025-06-28' },
        { semana: 13, inicio: '2025-06-29', fin: '2025-07-05' },
        { semana: 14, inicio: '2025-07-06', fin: '2025-07-12' },
        { semana: 15, inicio: '2025-07-13', fin: '2025-07-19' },
        { semana: 16, inicio: '2025-07-20', fin: '2025-07-26' },
        { semana: 17, inicio: '2025-07-27', fin: '2025-08-02' },
        { semana: 18, inicio: '2025-08-03', fin: '2025-08-09' },
        { semana: 19, inicio: '2025-08-10', fin: '2025-08-16' },
        { semana: 20, inicio: '2025-08-17', fin: '2025-08-23' },
        { semana: 21, inicio: '2025-08-24', fin: '2025-08-30' },
        { semana: 22, inicio: '2025-08-31', fin: '2025-09-06' },
        { semana: 23, inicio: '2025-09-07', fin: '2025-09-13' },
        { semana: 24, inicio: '2025-09-14', fin: '2025-09-20' },
        { semana: 25, inicio: '2025-09-21', fin: '2025-09-27' },
        { semana: 26, inicio: '2025-09-28', fin: '2025-10-04' },
        { semana: 27, inicio: '2025-10-05', fin: '2025-10-11' },
        { semana: 28, inicio: '2025-10-12', fin: '2025-10-18' },
        { semana: 29, inicio: '2025-10-19', fin: '2025-10-25' },
        { semana: 30, inicio: '2025-10-26', fin: '2025-11-01' },
        { semana: 31, inicio: '2025-11-02', fin: '2025-11-08' },
        { semana: 32, inicio: '2025-11-09', fin: '2025-11-15' },
        { semana: 33, inicio: '2025-11-16', fin: '2025-11-22' },
        { semana: 34, inicio: '2025-11-23', fin: '2025-11-29' },
    ],
    // Agregar semanas para otros tiempos litúrgicos
    'Adviento': [
        { semana: 1, inicio: '2025-11-30', fin: '2025-12-06' },
        { semana: 2, inicio: '2024-12-07', fin: '2024-12-13' },
        { semana: 3, inicio: '2024-12-14', fin: '2024-12-20' },
        { semana: 4, inicio: '2024-12-21', fin: '2024-12-24' },
    ],
    'Navidad': [
        { semana: 1, inicio: '2024-12-25', fin: '2024-12-28' },
        { semana: 2, inicio: '2024-12-29', fin: '2025-01-04' },
        { semana: 3, inicio: '2025-01-05', fin: '2025-01-10' },
    ],
    'Cuaresma': [
        { semana: 1, inicio: '2025-03-05', fin: '2025-03-08' },
        { semana: 2, inicio: '2025-03-09', fin: '2025-03-15' },
        { semana: 3, inicio: '2025-03-16', fin: '2025-03-22' },
        { semana: 4, inicio: '2025-03-23', fin: '2025-03-29' },
        { semana: 5, inicio: '2025-03-30', fin: '2025-04-05' },
        { semana: 6, inicio: '2025-04-06', fin: '2025-04-12' },
        { semana: 7, inicio: '2025-04-13', fin: '2025-04-19' }
    ],
    'Pascua': [
        { semana: 1, inicio: '2025-04-20', fin: '2025-04-26' },
        { semana: 2, inicio: '2025-04-27', fin: '2025-05-03' },
        { semana: 3, inicio: '2025-05-04', fin: '2025-05-10' },
        { semana: 4, inicio: '2025-05-11', fin: '2025-05-17' },
        { semana: 5, inicio: '2025-05-18', fin: '2025-05-24' },
        { semana: 6, inicio: '2025-05-25', fin: '2025-05-31' },
        { semana: 7, inicio: '2025-06-01', fin: '2025-06-07' }
    ]
};