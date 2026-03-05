// CheckboxGroup Component
import React from 'react';
import { styles } from '../types/theme';

interface CheckboxGroupProps {
    title?: string;
    options: string[];
    selected: string[];
    onChange: (value: string) => void;
    columns?: number;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ title, options, selected, onChange, columns = 3 }) => (
    <div style={styles.formGroup}>
        {title && <label style={styles.subLegend}>{title}</label>}
        <div style={{ ...styles.checkboxGrid, gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {options.map(option => (
                <label key={option} style={styles.checkboxLabel}>
                    <input
                        type="checkbox"
                        style={styles.checkboxInput}
                        checked={selected.includes(option)}
                        onChange={() => onChange(option)}
                    />
                    {option}
                </label>
            ))}
        </div>
    </div>
);

export default CheckboxGroup;
