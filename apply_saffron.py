#!/usr/bin/env python3
import re

# Read the file
with open('src/app/globals.css', 'r') as f:
    content = f.read()

# Define the saffron color replacements
replacements = {
    # Brand colors
    '--color-brand-25: #f6fef9;': '--color-brand-25: #fffaf0;',
    '--color-brand-50: #ecfdf3;': '--color-brand-50: #fff5e1;',
    '--color-brand-100: #d1fadf;': '--color-brand-100: #ffebb9;',
    '--color-brand-200: #a6f4c5;': '--color-brand-200: #ffe08d;',
    '--color-brand-300: #6ce9a6;': '--color-brand-300: #ffd460;',
    '--color-brand-400: #32d583;': '--color-brand-400: #ffc933;',
    '--color-brand-500: #12b76a;': '--color-brand-500: #f4c430;',
    '--color-brand-600: #039855;': '--color-brand-600: #d4a31a;',
    '--color-brand-700: #027a48;': '--color-brand-700: #a67c0d;',
    '--color-brand-800: #05603a;': '--color-brand-800: #7d5b06;',
    '--color-brand-900: #054f31;': '--color-brand-900: #553e04;',
    '--color-brand-950: #053321;': '--color-brand-950: #332402;',
    
    # Success colors
    '--color-success-25: #f6fef9;': '--color-success-25: #fffaf0;',
    '--color-success-50: #ecfdf3;': '--color-success-50: #fff5e1;',
    '--color-success-100: #d1fadf;': '--color-success-100: #ffebb9;',
    '--color-success-200: #a6f4c5;': '--color-success-200: #ffe08d;',
    '--color-success-300: #6ce9a6;': '--color-success-300: #ffd460;',
    '--color-success-400: #32d583;': '--color-success-400: #ffc933;',
    '--color-success-500: #12b76a;': '--color-success-500: #f4c430;',
    '--color-success-600: #039855;': '--color-success-600: #d4a31a;',
    '--color-success-700: #027a48;': '--color-success-700: #a67c0d;',
    '--color-success-800: #05603a;': '--color-success-800: #7d5b06;',
    '--color-success-900: #054f31;': '--color-success-900: #553e04;',
    '--color-success-950: #053321;': '--color-success-950: #332402;',
    
    # Focus ring shadow
    '--shadow-focus-ring: 0px 0px 0px 4px rgba(18, 183, 106, 0.12);': '--shadow-focus-ring: 0px 0px 0px 4px rgba(244, 196, 48, 0.12);',
    
    # Flatpickr background
    'background: #12b76a;': 'background: #f4c430;',
    
    # Box shadow
    'box-shadow: -10px 0 0 #12b76a;': 'box-shadow: -10px 0 0 #f4c430;',
}

# Apply all replacements
for old, new in replacements.items():
    content = content.replace(old, new)

# Write back
with open('src/app/globals.css', 'w') as f:
    f.write(content)

print("✅ Successfully applied saffron color theme!")
print("Changed brand and success colors from green to saffron")
