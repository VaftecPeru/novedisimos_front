import React, { useState } from 'react';

function MiSelect({ opciones }) {
    const [opcionSeleccionada, setOpcionSeleccionada] = useState('');

    const handleChange = (event) => {
        setOpcionSeleccionada(event.target.value);
    };

    return (
        <select value={opcionSeleccionada} onChange={handleChange}>
            {opciones.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                    {opcion.texto}
                </option>
            ))}
        </select>
    );
}

export default MiSelect;