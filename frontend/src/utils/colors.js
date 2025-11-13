// src/utils/colors.js
/*(export const fixTailwindColors = (element) => {

  const clone = element.cloneNode(true);
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.width = `${element.offsetWidth}px`;
  document.body.appendChild(clone);

  // Convert oklch colors to rgb
  const convertOklch = (value) => {
    const oklchRegex = /oklch\(([^)]+)\)/g;
    return value.replace(oklchRegex, (match) => {
      // For production, replace with actual oklch to rgb conversion logic
      // This is a placeholder - in a real app you'd use a color conversion library
      return match.replace('oklch', 'rgb');
    });
  };

  // Process all elements
  const allElements = clone.querySelectorAll('*');
  allElements.forEach(el => {
    const computed = window.getComputedStyle(el);

    // Handle background colors
    if (computed.backgroundColor.includes('oklch')) {
      el.style.backgroundColor = convertOklch(computed.backgroundColor);
    }

    // Handle text colors
    if (computed.color.includes('oklch')) {
      el.style.color = convertOklch(computed.color);
    }

    // Handle border colors
    if (computed.borderColor.includes('oklch')) {
      el.style.borderColor = convertOklch(computed.borderColor);
    }
  });

  return clone;
};*/
// src/utils/colors.js

// --- Color Conversion Utility ---
let converter = null;
const getConverter = () => {
  if (!converter) {
    converter = document.createElement('div');
    converter.style.position = 'absolute';
    converter.style.left = '-9999px';
    converter.style.opacity = '0';
    document.body.appendChild(converter);
  }
  return converter;
};

// This converts a SINGLE oklch value string into an rgb() string
const convertOklchValue = (oklchColor) => {
  try {
    const el = getConverter();
    el.style.color = oklchColor; // Set "oklch(...)"
    const computedStyle = window.getComputedStyle(el); // Read "rgb(...)"
    return computedStyle.color; // Return "rgb(...)"
  } catch (e) {
    console.warn("Failed to convert color", oklchColor, e);
    return "rgb(0, 0, 0)"; // Fallback to black
  }
};

const oklchRegex = /oklch\([^)]+\)/g;

// This finds and replaces ALL oklch values in a complex string (like boxShadow)
const convertOklchStrings = (cssString) => {
  if (!cssString || !cssString.includes('oklch')) {
    return cssString; // No oklch found, return original string
  }
  
  // Find all "oklch(...)" matches and replace them with "rgb(...)"
  return cssString.replace(oklchRegex, (match) => {
    return convertOklchValue(match);
  });
};

export const cleanupColorConverter = () => {
  if (converter && document.body.contains(converter)) {
    document.body.removeChild(converter);
    converter = null;
  }
};
// --- End of Utility ---

// --- Main Fix Function ---
let pseudoElementStyles = [];
const generateId = () => `h2c-clone-${Date.now()}`;

const processElement = (el, cloneId) => {
  // 1. Process the element itself
  const computed = window.getComputedStyle(el);

  // We now use convertOklchStrings for ALL color-related properties
  el.style.color = convertOklchStrings(computed.color);
  el.style.backgroundColor = convertOklchStrings(computed.backgroundColor);
  el.style.borderColor = convertOklchStrings(computed.borderColor);
  el.style.borderTopColor = convertOklchStrings(computed.borderTopColor);
  el.style.borderRightColor = convertOklchStrings(computed.borderRightColor);
  el.style.borderBottomColor = convertOklchStrings(computed.borderBottomColor);
  el.style.borderLeftColor = convertOklchStrings(computed.borderLeftColor);
  
  // --- ADDED PROPERTIES ---
  el.style.outlineColor = convertOklchStrings(computed.outlineColor);
  el.style.textDecorationColor = convertOklchStrings(computed.textDecorationColor);
  el.style.columnRuleColor = convertOklchStrings(computed.columnRuleColor);
  el.style.boxShadow = convertOklchStrings(computed.boxShadow);
  el.style.textShadow = convertOklchStrings(computed.textShadow);
  // Add any other properties you might be using (e.g., fill, stroke for SVGs)
  // el.style.fill = convertOklchStrings(computed.fill);
  // el.style.stroke = convertOklchStrings(computed.stroke);

  // 2. Process pseudo-elements
  const beforeComputed = window.getComputedStyle(el, '::before');
  const afterComputed = window.getComputedStyle(el, '::after');
  const uniqueSelector = `.${cloneId}[data-h2c-id="${el.dataset.h2cId}"]`;

  // Helper to build style rules for pseudos
  const buildPseudoRules = (styles) => {
    return [
      `color: ${convertOklchStrings(styles.color)} !important`,
      `background-color: ${convertOklchStrings(styles.backgroundColor)} !important`,
      `border-color: ${convertOklchStrings(styles.borderColor)} !important`,
      `outline-color: ${convertOklchStrings(styles.outlineColor)} !important`,
      `text-decoration-color: ${convertOklchStrings(styles.textDecorationColor)} !important`,
      `box-shadow: ${convertOklchStrings(styles.boxShadow)} !important`,
      `text-shadow: ${convertOklchStrings(styles.textShadow)} !important`,
    ].join('; ');
  };

  if (beforeComputed.content && beforeComputed.content !== 'none') {
    pseudoElementStyles.push(
      `${uniqueSelector}::before { ${buildPseudoRules(beforeComputed)} }`
    );
  }

  if (afterComputed.content && afterComputed.content !== 'none') {
    pseudoElementStyles.push(
      `${uniqueSelector}::after { ${buildPseudoRules(afterComputed)} }`
    );
  }
};

export const fixTailwindColors = (element) => {
  const clone = element.cloneNode(true);
  
  pseudoElementStyles = [];
  const cloneId = generateId();
  clone.classList.add(cloneId);

  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.width = `${element.offsetWidth}px`;
  document.body.appendChild(clone);

  const allElements = [clone, ...clone.querySelectorAll('*')];

  allElements.forEach((el, index) => {
    el.dataset.h2cId = index;
    processElement(el, cloneId);
  });

  let styleTag = null;
  if (pseudoElementStyles.length > 0) {
    styleTag = document.createElement('style');
    styleTag.id = `__h2c_pseudo_fix_${cloneId}__`;
    styleTag.innerHTML = pseudoElementStyles.join('\n');
    document.head.appendChild(styleTag);
  }

  return {
    fixedElement: clone,
    styleTagId: styleTag ? styleTag.id : null
  };
};
