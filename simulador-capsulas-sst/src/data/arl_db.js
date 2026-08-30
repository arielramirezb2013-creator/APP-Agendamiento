"use strict";
/* ===================== BASE DE DATOS SIMULADA DE LA ARL (demo) =====================
   Simula la consulta por API a la base de afiliados de la ARL: la empresa se identifica
   por el NIT o por la cédula del empleador, y trae sus trabajadores con los datos que el
   FURAT necesita en las secciones AF, I, II y V. Los valores usan los mismos tipos de
   FURAT_FIELDS (fechas {d,m,y}, duraciones {meses,dias}, códigos de catálogo). */
const ARL_DB = [
  {
    docs: ["7700729", "900703762"],
    empresa: {
      tipoVinculador: "1", actividadEconomica: "Panadería", razonSocial: "Panadería La Espiga",
      tipoIdEmpresa: "NI", numIdEmpresa: "900703762", direccionEmpresa: "Calle 12 No. 5-20",
      telefonoEmpresa: "6014055911", correo: "contacto@laespiga.com",
      departamentoEmpresa: "Cundinamarca", municipioEmpresa: "Soacha", zonaEmpresa: "U",
      centroNombre: "Sede principal", centroMismo: true
    },
    empleador: { nombres: "Ariel Javier", apellidos: "Ramírez", tipoId: "CC", numId: "7700729", cargo: "Empleador" },
    trabajadores: [
      { id: "empleador", icon: "🙋", nombres: "Ariel Javier", apellidos: "Ramírez", tipoIdTrabajador: "CC", numIdTrabajador: "7700729",
        fechaNacimiento: { d: 12, m: 5, y: 1979 }, sexo: "M", direccionTrabajador: "Carrera 7 No. 45-12", telefonoTrabajador: "3104567890",
        viveMismo: true, zonaTrabajador: "U", cargo: "Gerente y empleador", ocupacionHabitual: "Administrador de panadería",
        tiempoOcupacion: { meses: 96, dias: 0 }, fechaIngreso: { d: 1, m: 2, y: 2018 }, salario: 3200000, jornadaHabitual: "1",
        tipoVinculacion: "5", eps: "Sanitas", afp: "Porvenir" },
      { icon: "👷", nombres: "Juan Carlos", apellidos: "Rodríguez Pérez", tipoIdTrabajador: "CC", numIdTrabajador: "1023456789",
        fechaNacimiento: { d: 15, m: 3, y: 1990 }, sexo: "M", direccionTrabajador: "Carrera 8 No. 15-30", telefonoTrabajador: "3115557788",
        viveMismo: true, zonaTrabajador: "U", cargo: "Panadero de horno", ocupacionHabitual: "Panadero",
        tiempoOcupacion: { meses: 27, dias: 0 }, fechaIngreso: { d: 1, m: 2, y: 2024 }, salario: 1600000, jornadaHabitual: "1",
        tipoVinculacion: "1", eps: "Sanitas", afp: "Porvenir" },
      { icon: "👷‍♀️", nombres: "Ana María", apellidos: "Gómez Torres", tipoIdTrabajador: "CC", numIdTrabajador: "52123456",
        fechaNacimiento: { d: 22, m: 11, y: 1994 }, sexo: "F", direccionTrabajador: "Calle 3 No. 8-15", telefonoTrabajador: "3129876543",
        viveMismo: true, zonaTrabajador: "U", cargo: "Auxiliar de producción", ocupacionHabitual: "Auxiliar de panadería",
        tiempoOcupacion: { meses: 14, dias: 0 }, fechaIngreso: { d: 15, m: 6, y: 2025 }, salario: 1423500, jornadaHabitual: "1",
        tipoVinculacion: "1", eps: "Compensar", afp: "Colpensiones" }
    ]
  }
];
function arlBuscar(doc) { const d = String(doc).replace(/\D/g, ""); return ARL_DB.find(e => e.docs.includes(d)) || null; }
