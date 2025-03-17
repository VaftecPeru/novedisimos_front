import React from 'react';
import { getEstadoColor } from './data';

function MiSelect({ opciones, value, onChange }) {
    const handleChange = (event) => {
        const selectedValue = event.target.value;
        const selectedOption = opciones.find(opcion => opcion.value === selectedValue);
        onChange(selectedOption);
    };

    return (
        <select value={value ? value.value : ''} onChange={handleChange}>
            <option value=""></option>
            {opciones.map((opcion) => (
                <option
                    key={opcion.value}
                    value={opcion.value}
                    style={{ color: getEstadoColor(opcion.value) }}
                >
                    {opcion.texto}
                </option>
            ))}
        </select>
    );
}

export default MiSelect;