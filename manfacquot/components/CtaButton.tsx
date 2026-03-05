// CtaButton Component
import React, { useState } from 'react';
import { styles } from '../types/theme';

type CtaButtonProps = {
    text: string;
    href?: string;
    onClick?: (e?: React.MouseEvent) => void;
    primary?: boolean;
    type?: 'button' | 'submit' | 'reset';
    children?: React.ReactNode;
    disabled?: boolean;
    className?: string;
};

const CtaButton = ({ text, href = "#", onClick, primary = false, type = "button", children, disabled = false, className = '' }: CtaButtonProps) => {
    const [hover, setHover] = useState(false);
    const variantStyle = primary ? styles.buttonPrimary : styles.buttonSecondary;
    const hoverStyle = primary && !disabled ? styles.buttonPrimaryHover : !disabled ? styles.buttonSecondaryHover : {};
    const disabledStyle = disabled ? styles.buttonDisabled : {};

    // Special danger button style
    const dangerStyle = className.includes('button-small-danger') ? styles.buttonDanger : {};
    const dangerHoverStyle = className.includes('button-small-danger') && !disabled ? styles.buttonDangerHover : {};

    const style = { ...styles.button, ...variantStyle, ...(hover ? hoverStyle : {}), ...dangerStyle, ...(hover ? dangerHoverStyle : {}), ...disabledStyle };
    const commonProps = { style: style, onMouseEnter: () => setHover(true), onMouseLeave: () => setHover(false), disabled: disabled, className: className };

    if (type === 'submit' || type === 'reset' || onClick) {
        return (<button type={type} onClick={onClick} {...commonProps}>{children}{text}</button>);
    }
    return (<a href={href} {...commonProps}>{children}{text}</a>);
};

export default CtaButton;
