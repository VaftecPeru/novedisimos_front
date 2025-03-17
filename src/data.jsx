export const distritos = [
    { value: 'distrito1', texto: 'Ancón' },
    { value: 'distrito2', texto: 'Ate' },
    { value: 'distrito3', texto: 'Barranco' },
    { value: 'distrito4', texto: 'Breña' },
    { value: 'distrito5', texto: 'Carabayllo' },
    { value: 'distrito6', texto: 'Cercado de Lima' },
    { value: 'distrito7', texto: 'Chaclacayo' },
    { value: 'distrito8', texto: 'Chorrillos' },
    { value: 'distrito9', texto: 'Cieneguilla' },
    { value: 'distrito10', texto: 'Comas' },
    { value: 'distrito11', texto: 'El Agustino' },
    { value: 'distrito12', texto: 'Independencia' },
    { value: 'distrito13', texto: 'Jesús María' },
    { value: 'distrito14', texto: 'La Molina' },
    { value: 'distrito15', texto: 'La Victoria' },
    { value: 'distrito16', texto: 'Lince' },
    { value: 'distrito17', texto: 'Los Olivos' },
    { value: 'distrito18', texto: 'Lurigancho-Chosica' },
    { value: 'distrito19', texto: 'Lurín' },
    { value: 'distrito20', texto: 'Magdalena del Mar' },
    { value: 'distrito21', texto: 'Miraflores' },
    { value: 'distrito22', texto: 'Pachacámac' },
    { value: 'distrito23', texto: 'Pucusana' },
    { value: 'distrito24', texto: 'Pueblo Libre' },
    { value: 'distrito25', texto: 'Puente Piedra' },
    { value: 'distrito26', texto: 'Punta Hermosa' },
    { value: 'distrito27', texto: 'Punta Negra' },
    { value: 'distrito28', texto: 'Rímac' },
    { value: 'distrito29', texto: 'San Bartolo' },
    { value: 'distrito30', texto: 'San Borja' },
    { value: 'distrito31', texto: 'San Isidro' },
    { value: 'distrito32', texto: 'San Juan de Lurigancho' },
    { value: 'distrito33', texto: 'San Juan de Miraflores' },
    { value: 'distrito34', texto: 'San Luis' },
    { value: 'distrito35', texto: 'San Martín de Porres' },
    { value: 'distrito36', texto: 'San Miguel' },
    { value: 'distrito37', texto: 'Santa Anita' },
    { value: 'distrito38', texto: 'Santa María del Mar' },
    { value: 'distrito39', texto: 'Santa Rosa' },
    { value: 'distrito40', texto: 'Santiago de Surco' },
    { value: 'distrito41', texto: 'Surquillo' },
    { value: 'distrito42', texto: 'Villa El Salvador' },
    { value: 'distrito43', texto: 'Villa María del Triunfo' },
  ];
  
  export const asesor = [
    { value: 'asesor1', texto: 'Rocio' },
    { value: 'asesor2', texto: 'Pepe' },
  ];

  export const estados = [
    { value: 'enCamino', texto: 'En Camino' },
    { value: 'completado', texto: 'Completado' },
    { value: 'cancelado', texto: 'Cancelado' },
];

export const getEstadoColor = (estadoValue) => {
    switch (estadoValue) {
        case 'enCamino':
            return 'orange';
        case 'completado':
            return 'green';
        case 'cancelado':
            return 'red';
        default:
            return 'black';
    }
};