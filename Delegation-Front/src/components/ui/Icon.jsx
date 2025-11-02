/**
 * Icon component that wraps Lucide React icons
 * This component provides a consistent interface for using icons throughout the application
 */

import React from 'react';
import * as LucideIcons from 'lucide-react';

/**
 * Icon component that renders Lucide React icons
 * @param {string} name - The Lucide React icon name (e.g., 'User', 'Edit', 'Trash2')
 * @param {number} size - The icon size (default: 20)
 * @param {string} className - Additional CSS classes
 * @param {object} props - Additional props to pass to the icon
 */
const Icon = ({ name, size = 20, className = '', ...props }) => {
  // Get the actual icon component from Lucide React directly
  const IconComponent = LucideIcons[name];
  
  // If the icon doesn't exist, fallback to HelpCircle
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Lucide React`);
    const FallbackIcon = LucideIcons.HelpCircle;
    return <FallbackIcon size={size} className={className} {...props} />;
  }
  
  return <IconComponent size={size} className={className} {...props} />;
};

export default Icon;
