export interface KeyboardSupportItem {
  key: string;
  apgAction: string;
  semanticAction: string;
}

export interface WcagCriterionRef {
  num: string;
  name: string;
  level: 'A' | 'AA' | 'AAA';
}

export interface Pattern {
  id: string;
  name: string;
  category: 'Inputs & Controls' | 'Dialogs & Overlays' | 'Navigation' | 'Structure & Layout' | 'Application Widgets';
  apgSlug: string;
  apgUrl: string;
  firstRuleVerdict: 'native-preferred' | 'hybrid-enhancement' | 'aria-required';
  verdictLabel: string;
  semanticElement: string;
  summary: string;
  firstRuleExplanation: string;
  wcagCriteria: WcagCriterionRef[];
  wcag3Outcomes: string[];
  keyboardMatrix: KeyboardSupportItem[];
  apgCode: {
    html: string;
    js?: string;
    notes?: string;
  };
  semanticCode: {
    html: string;
    js?: string;
    notes?: string;
  };

  // Detailed Requirements & Functionality Breakdown
  ariaRequirements: string[];
  ariaKeyboardAndAt: {
    keyboard: string[];
    screenReader: string;
  };
  ariaEffort: {
    rating: 'High' | 'Medium' | 'Extreme';
    linesOfCode: string;
    summary: string;
  };

  semanticRequirements: string[];
  semanticKeyboardAndAt: {
    keyboard: string[];
    screenReader: string;
  };
  semanticEffort: {
    rating: string;
    linesOfCode: string;
    summary: string;
  };

  // Real-world limitations of native semantic HTML
  semanticLimitations: string[];

  // Visual CSS Customization comparison
  cssCustomization: {
    semanticRecipe: string;
    ariaRecipe: string;
    tips: string[];
  };
}

export const APG_PATTERNS: Pattern[] = [
  {
    id: 'accordion',
    name: 'Accordion',
    category: 'Structure & Layout',
    apgSlug: 'accordion',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/accordion/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Element Preferred',
    semanticElement: '<details name="group"> + <summary>',
    summary: 'A vertically stacked set of interactive headings that each reveal a section of content. Modern HTML natively supports exclusive accordions with name="group" without JavaScript.',
    firstRuleExplanation: 'Under the First Rule of ARIA ("No ARIA is better than bad ARIA"), native <details> with <summary> is vastly superior for standard document and content disclosure. Modern browsers support exclusive accordions natively using the name attribute on multiple <details> tags (opening one closes the others). The APG ARIA pattern requires custom buttons, aria-expanded, aria-controls, role="region", and custom JavaScript keyboard event handlers.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '2.1.1', name: 'Keyboard', level: 'A' },
      { num: '1.3.1', name: 'Info and Relationships', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information', 'keyboard-navigation-and-shortcuts'],
    keyboardMatrix: [
      { key: 'Enter / Space', apgAction: 'Expands or collapses the focused accordion panel via JS handler.', semanticAction: 'Natively opens or closes the <details> disclosure without JS.' },
      { key: 'Tab', apgAction: 'Moves focus to next accordion header button.', semanticAction: 'Moves focus to next <summary> or interactive child.' },
      { key: 'Arrow Down / Up', apgAction: 'Moves focus between accordion trigger buttons (optional APG enhancement).', semanticAction: 'Standard tab navigation; arrow keys navigate within text.' }
    ],
    ariaRequirements: [
      'Heading tag (e.g. <h3>) wrapping each trigger <button type="button">',
      'aria-expanded="true/false" maintained via JavaScript on every click/keydown',
      'aria-controls="panel-id" pointing to the unique ID of the expandable panel',
      'Panel marked with role="region" and aria-labelledby="button-id"',
      'Panel hidden attribute or CSS display:none synchronized with expanded state',
      'Custom JavaScript event listeners for click and keyboard triggers'
    ],
    ariaKeyboardAndAt: {
      keyboard: [
        'Enter / Space: Toggles expanded/collapsed state via JavaScript listener',
        'Tab / Shift+Tab: Moves focus sequentially between trigger buttons and open panel focusables',
        'Arrow Down / Up: Moves focus across triggers (optional APG enhancement)'
      ],
      screenReader: 'Announces "button, Billing Information, expanded [or collapsed], region Billing Information".'
    },
    ariaEffort: {
      rating: 'High',
      linesOfCode: '~40 lines (HTML + JS)',
      summary: 'Requires manual state synchronization, event listeners, and attribute management on every toggle.'
    },
    semanticRequirements: [
      'Native <details> parent tag and <summary> heading element',
      'name="group-name" attribute on each details element to enforce exclusive single-panel opening',
      '0 lines of JavaScript needed for toggling, state management, or exclusive accordion behavior'
    ],
    semanticKeyboardAndAt: {
      keyboard: [
        'Enter / Space: Natively toggles summary open/closed state',
        'Tab / Shift+Tab: Natively navigates to next summary or active panel content'
      ],
      screenReader: 'Natively announces "details, collapsed [or expanded], Billing Information, summary" via browser accessibility tree.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '~6 lines of declarative HTML',
      summary: 'Built directly into the browser engine in C++. Completely functional with JavaScript disabled.'
    },
    semanticLimitations: [
      'Default browser disclosure triangle marker requires ::marker or ::-webkit-details-marker CSS reset.',
      'Historically difficult to animate height smoothly (now supported in modern browsers via interpolate-size: allow-keywords and @starting-style).',
      'Heading hierarchy inside <summary> requires placing heading tags within summary (<summary><h3>Title</h3></summary>).'
    ],
    cssCustomization: {
      semanticRecipe: `/* Customizing Native <details> without default marker */
details {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  overflow: hidden;
}
summary {
  list-style: none;
  padding: 12px 16px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
}
/* Remove WebKit legacy triangle */
summary::-webkit-details-marker { display: none; }
/* Custom animated chevron */
summary::after {
  content: "▼";
  transition: transform 0.2s ease;
}
details[open] summary::after {
  transform: rotate(180deg);
}`,
      ariaRecipe: `/* Styling ARIA Accordion via state attributes */
.accordion-trigger[aria-expanded="true"] .acc-icon {
  transform: rotate(180deg);
}
.accordion-panel[hidden] {
  display: none;
}`,
      tips: [
        'Use summary::-webkit-details-marker { display: none; } and list-style: none on summary to remove default arrows across all engines.',
        'Target details[open] summary to change background or rotate custom indicator icons.'
      ]
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Accordion -->
<div class="accordion-group">
  <h3>
    <button type="button" class="accordion-trigger"
      aria-expanded="false"
      aria-controls="panel-billing"
      id="acc-btn-billing">
      Billing Information
    </button>
  </h3>
  <div id="panel-billing"
    role="region"
    aria-labelledby="acc-btn-billing"
    class="accordion-panel"
    hidden>
    <p>Billing address and payment details go here.</p>
  </div>
</div>`,
      js: `// APG ARIA requires event listeners for click and keydown
const trigger = document.getElementById('acc-btn-billing');
const panel = document.getElementById('panel-billing');
trigger.addEventListener('click', () => {
  const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
  trigger.setAttribute('aria-expanded', String(!isExpanded));
  panel.hidden = isExpanded;
});`
    },
    semanticCode: {
      html: `<!-- Modern Semantic HTML5 Exclusive Accordion (0 JS needed!) -->
<details name="faq-group">
  <summary>Billing Information</summary>
  <div class="panel-content">
    <p>Billing address and payment details go here.</p>
  </div>
</details>

<details name="faq-group">
  <summary>Shipping Information</summary>
  <div class="panel-content">
    <p>Shipping addresses and carrier options.</p>
  </div>
</details>`,
      notes: 'Using name="faq-group" makes details elements exclusive: expanding one automatically collapses all others in the same group natively!'
    }
  },
  {
    id: 'dialog-modal',
    name: 'Dialog (Modal)',
    category: 'Dialogs & Overlays',
    apgSlug: 'dialog-modal',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Element Preferred',
    semanticElement: '<dialog> + showModal()',
    summary: 'A modal dialog overlays the main view and requires user interaction before returning. The native HTML <dialog> provides top-layer rendering, native focus trapping, Esc closing, and automatic backdrop styling.',
    firstRuleExplanation: 'Implementing an accessible modal dialog with ARIA from scratch is notoriously error-prone: you must manage a backdrop div, trap keyboard focus within the dialog, handle the Esc key, mark all background DOM nodes as inert or aria-hidden="true", and restore focus to the trigger on close. Native <dialog>.showModal() does ALL of this in the browser engine natively.',
    wcagCriteria: [
      { num: '2.1.2', name: 'No Keyboard Trap', level: 'A' },
      { num: '2.4.3', name: 'Focus Order', level: 'A' },
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information', 'focus-order-and-management'],
    keyboardMatrix: [
      { key: 'Tab / Shift+Tab', apgAction: 'Must be manually trapped inside dialog via JS keydown listener.', semanticAction: 'Browser automatically traps focus inside <dialog> natively.' },
      { key: 'Escape', apgAction: 'Must be caught manually via JS to close dialog and return focus.', semanticAction: 'Natively fires cancel/close event and closes modal.' }
    ],
    ariaRequirements: [
      'Container element with role="dialog", aria-modal="true", and aria-labelledby="title-id"',
      'Fixed viewport backdrop <div> element',
      'JavaScript focus trap: intercepting Tab/Shift+Tab to keep focus within dialog focusable nodes',
      'Marking all page siblings with inert or aria-hidden="true" while modal is open',
      'JavaScript keydown listener for Escape key to close modal',
      'Tracking opener button in document.activeElement and restoring focus upon close'
    ],
    ariaKeyboardAndAt: {
      keyboard: [
        'Tab / Shift+Tab: Trapped within dialog, cycling between first and last focusable element',
        'Escape: Closes dialog and returns focus to opener button'
      ],
      screenReader: 'Announces "dialog modal, Confirm Deletion". Assistive tech virtual reading cursor must be confined to dialog content.'
    },
    ariaEffort: {
      rating: 'Extreme',
      linesOfCode: '~70-110 lines of complex JS + HTML',
      summary: 'Focus trap leaks and missing background inerting are among the most common web accessibility failures.'
    },
    semanticRequirements: [
      'Native <dialog> element in HTML',
      'Invoked via dialog.showModal()',
      'Native ::backdrop pseudo-element for background dimming',
      'Optional <form method="dialog"> to close modal natively on button click without JS'
    ],
    semanticKeyboardAndAt: {
      keyboard: [
        'Tab / Shift+Tab: Automatically trapped inside modal by browser engine',
        'Escape: Natively fires cancel event, closes dialog, and restores focus to invoking element'
      ],
      screenReader: 'Announces native dialog role, title, and isolates reading order to the dialog natively.'
    },
    semanticEffort: {
      rating: 'Low (1-2 lines JS)',
      linesOfCode: '~5 lines of HTML + 1 line JS (dialog.showModal())',
      summary: 'Browser Top Layer handles z-index, backdrop, focus containment, and inertness natively.'
    },
    semanticLimitations: [
      'Calling dialog.show() creates a non-modal dialog without focus trap or backdrop; dialog.showModal() must be used for modals.',
      'Animating entry and exit transitions requires modern CSS (@starting-style and transition-behavior: allow-discrete).',
      'Positioning relative to triggering element as a flyout requires CSS Anchor Positioning or manual offset calculation.'
    ],
    cssCustomization: {
      semanticRecipe: `/* Styling Native <dialog> and Backdrop */
dialog {
  border: none;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  max-width: 460px;
}
dialog::backdrop {
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(6px);
}
/* Modern smooth opening animation */
@starting-style {
  dialog[open] {
    opacity: 0;
    transform: scale(0.95);
  }
}`,
      ariaRecipe: `/* ARIA Dialog requires custom fixed overlay */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.6);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}`,
      tips: [
        'Always style dialog::backdrop directly rather than injecting custom backdrop divs.',
        'Use method="dialog" on nested forms for zero-JS button dismissals.'
      ]
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Modal Dialog -->
<div id="modal-backdrop" class="backdrop" hidden></div>
<div id="aria-dialog" role="dialog" aria-modal="true" aria-labelledby="dlg-title" hidden>
  <h2 id="dlg-title">Confirm Deletion</h2>
  <p>Are you sure you want to remove this item?</p>
  <button type="button" id="dlg-confirm">Delete</button>
  <button type="button" id="dlg-cancel">Cancel</button>
</div>`,
      js: `// Manual focus trap, inert toggling, and Esc handler required
function openAriaDialog(trigger) {
  dialog.hidden = false;
  backdrop.hidden = false;
  const focusables = dialog.querySelectorAll('button, [href], input');
  focusables[0].focus();
  document.addEventListener('keydown', trapKey);
}`
    },
    semanticCode: {
      html: `<!-- Modern Semantic HTML <dialog> Element -->
<dialog id="native-dialog">
  <form method="dialog">
    <h2>Confirm Deletion</h2>
    <p>Are you sure you want to remove this item?</p>
    <button value="delete" class="btn-danger">Delete</button>
    <button value="cancel">Cancel</button>
  </form>
</dialog>`,
      js: `// Simple native invocation
const dialog = document.getElementById('native-dialog');
dialog.showModal(); // Automatically handles top-layer, backdrop, inert, and focus trap!
dialog.addEventListener('close', () => console.log(dialog.returnValue));`
    }
  },
  {
    id: 'switch',
    name: 'Switch',
    category: 'Inputs & Controls',
    apgSlug: 'switch',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/switch/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Element Preferred',
    semanticElement: '<input type="checkbox" role="switch">',
    summary: 'A toggle control representing a binary on/off state. Standard HTML checkbox supports role="switch" for exact AT announcement while preserving native form submission and keyboard interaction.',
    firstRuleExplanation: 'Developers often create custom <div> or <button> switches with ARIA, requiring manual click, spacebar, and enter handlers, plus custom state tracking. Using a native <input type="checkbox" role="switch"> leverages native checkbox form submission, native keyboard behavior, and native assistive technology support while announcing itself as a switch.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '2.1.1', name: 'Keyboard', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Space', apgAction: 'Toggles aria-checked between "true" and "false" via JS listener.', semanticAction: 'Natively toggles checked state without any JS.' },
      { key: 'Enter', apgAction: 'Often handled manually in custom button switches.', semanticAction: 'Natively submits enclosing form if in form context.' }
    ],
    ariaRequirements: [
      '<button type="button" role="switch" aria-checked="false"> or <div role="switch" tabindex="0">',
      'JavaScript click and keydown (Space/Enter) handlers',
      'Updating aria-checked="true/false" attribute dynamically',
      'Does NOT submit in standard HTML <form> without hidden input'
    ],
    ariaKeyboardAndAt: {
      keyboard: [
        'Space: Toggles switch state between true and false',
        'Enter: Toggles switch in button context',
        'Tab: Moves focus to the switch'
      ],
      screenReader: 'Announces "switch, Notifications, on [or off]".'
    },
    ariaEffort: {
      rating: 'Medium',
      linesOfCode: '~25 lines of HTML, CSS & JS',
      summary: 'Requires custom state tracking and hidden form inputs for form integration.'
    },
    semanticRequirements: [
      '<input type="checkbox" role="switch"> inside a <label>',
      '0 lines of JavaScript needed',
      'Submits natively in HTML forms (submits name=on when checked)'
    ],
    semanticKeyboardAndAt: {
      keyboard: [
        'Space: Natively toggles checked state',
        'Tab: Focuses native checkbox'
      ],
      screenReader: 'Natively announces "switch, Notifications, checked [or not checked]".'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '~4 lines of HTML + CSS',
      summary: 'Native checkbox behavior with switch role announcement.'
    },
    semanticLimitations: [
      'Browsers render <input type="checkbox" role="switch"> as a standard square checkbox unless styled with CSS appearance: none.',
      'Form submission sends the value only when checked (standard checkbox behavior).'
    ],
    cssCustomization: {
      semanticRecipe: `/* Styling Native Checkbox into a Sliding Switch */
input[type="checkbox"][role="switch"] {
  appearance: none;
  width: 44px;
  height: 24px;
  background: #334155;
  border-radius: 999px;
  position: relative;
  cursor: pointer;
  transition: background-color 0.2s;
}
input[type="checkbox"][role="switch"]::before {
  content: "";
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  top: 3px; left: 3px;
  background: #ffffff;
  transition: transform 0.2s;
}
input[type="checkbox"][role="switch"]:checked {
  background: #059669;
}
input[type="checkbox"][role="switch"]:checked::before {
  transform: translateX(20px);
}`,
      ariaRecipe: `button[role="switch"][aria-checked="true"] .switch-track {
  background: #a855f7;
}
button[role="switch"][aria-checked="true"] .switch-thumb {
  transform: translateX(20px);
}`,
      tips: [
        'Use appearance: none directly on the input[type="checkbox"][role="switch"] to avoid extra span wrapper markup while keeping full focus visibility intact.'
      ]
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Button Switch -->
<button type="button" role="switch" aria-checked="false" id="apg-switch" class="switch-btn">
  <span class="switch-label">Email Notifications</span>
  <span class="switch-track" aria-hidden="true">
    <span class="switch-thumb"></span>
  </span>
</button>`,
      js: `const sw = document.getElementById('apg-switch');
sw.addEventListener('click', () => {
  const checked = sw.getAttribute('aria-checked') === 'true';
  sw.setAttribute('aria-checked', String(!checked));
});`
    },
    semanticCode: {
      html: `<!-- Semantic HTML Checkbox with switch role -->
<label class="semantic-switch">
  <input type="checkbox" role="switch" name="notifications">
  <span class="switch-slider" aria-hidden="true"></span>
  <span>Email Notifications</span>
</label>`,
      notes: 'Fully keyboard accessible, participates in HTML form validation and submission, and works with JavaScript disabled.'
    }
  },
  {
    id: 'slider',
    name: 'Slider',
    category: 'Inputs & Controls',
    apgSlug: 'slider',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/slider/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Element Preferred',
    semanticElement: '<input type="range">',
    summary: 'A user input where the user sets a value from a given range. Native <input type="range"> provides full keyboard, mouse, touch, and screen reader support without JavaScript.',
    firstRuleExplanation: 'The APG ARIA slider requires building custom track and thumb markup, managing aria-valuenow, aria-valuemin, aria-valuemax, tracking mouse dragging, touch movements, and listening for ArrowLeft, ArrowRight, ArrowUp, ArrowDown, PageUp, PageDown, Home, and End keys. Native <input type="range"> provides all of this out of the box with zero JavaScript.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '2.1.1', name: 'Keyboard', level: 'A' },
      { num: '2.5.1', name: 'Pointer Gestures', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information', 'keyboard-navigation-and-shortcuts'],
    keyboardMatrix: [
      { key: 'Arrow Left / Down', apgAction: 'Decreases aria-valuenow by step size via custom script.', semanticAction: 'Natively decreases slider value.' },
      { key: 'Arrow Right / Up', apgAction: 'Increases aria-valuenow by step size via custom script.', semanticAction: 'Natively increases slider value.' },
      { key: 'Home / End', apgAction: 'Sets aria-valuenow to minimum / maximum via custom script.', semanticAction: 'Natively sets slider to min / max.' }
    ],
    ariaRequirements: [
      '<div role="slider" tabindex="0" aria-valuemin="0" aria-valuemax="100" aria-valuenow="50">',
      'Custom track element and draggable handle element',
      'Mouse drag listener, Touch move listener, pointer capture',
      'Keydown listener for ArrowLeft, ArrowRight, ArrowUp, ArrowDown, PageUp, PageDown, Home, End',
      'Does not participate in HTML form submit without hidden input'
    ],
    ariaKeyboardAndAt: {
      keyboard: [
        'Arrow Left / Down: Decrements value by step',
        'Arrow Right / Up: Increments value by step',
        'Page Up / Down: Increments / decrements by large step (e.g. 10)',
        'Home / End: Jumps to minimum / maximum values'
      ],
      screenReader: 'Announces "slider, Volume, 50%, min 0, max 100". Updates on every step.'
    },
    ariaEffort: {
      rating: 'High',
      linesOfCode: '~80-120 lines of JS + math + CSS',
      summary: 'Requires touch, mouse, pointer, and keyboard coordinate math and bounding box calculations.'
    },
    semanticRequirements: [
      '<input type="range" min="0" max="100" value="50">',
      'Built-in <output> element for live visual value display',
      '0 lines of JavaScript needed for slider operation'
    ],
    semanticKeyboardAndAt: {
      keyboard: [
        'Natively supports all arrow keys, PageUp, PageDown, Home, and End without a single line of JS.'
      ],
      screenReader: 'Natively announces range slider, current value, min, max, and orientation.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '~2 lines of HTML + CSS',
      summary: 'Complete accessibility, keyboard, touch swipe, and mouse drag built into the browser engine.'
    },
    semanticLimitations: [
      'Cross-browser thumb and track styling requires two separate vendor prefixes (::-webkit-slider-thumb and ::-moz-range-thumb).',
      'Dual-fill track styling (highlighting the completed portion of the track) is not natively standardized and requires CSS linear-gradient or accent-color.'
    ],
    cssCustomization: {
      semanticRecipe: `/* Styling Native Range Input */
input[type="range"] {
  accent-color: #059669; /* Easiest modern styling */
  width: 100%;
}
/* Advanced Cross-Browser Custom Thumb */
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 22px; height: 22px;
  border-radius: 50%;
  background: #059669;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0,0,0,0.3);
}
input[type="range"]::-moz-range-thumb {
  width: 22px; height: 22px;
  border-radius: 50%;
  background: #059669;
  border: none;
}`,
      ariaRecipe: `.slider-handle {
  position: absolute;
  left: var(--percent);
  transform: translate(-50%, -50%);
}`,
      tips: [
        'accent-color: #color is supported in all modern browsers and styles the native slider thumb and filled track with 1 line of CSS!'
      ]
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Slider -->
<div class="slider-group">
  <span id="slider-lbl">Volume:</span>
  <div class="slider-rail" id="slider-rail">
    <div role="slider" tabindex="0"
      aria-labelledby="slider-lbl"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow="50"
      id="apg-slider-thumb"
      class="slider-thumb"></div>
  </div>
</div>`,
      js: `// Requires 60+ lines of drag math, touch support, and key handlers:
thumb.addEventListener('keydown', (e) => {
  let val = parseInt(thumb.getAttribute('aria-valuenow'), 10);
  if (e.key === 'ArrowRight' || e.key === 'ArrowUp') val = Math.min(100, val + 5);
  else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') val = Math.max(0, val - 5);
  thumb.setAttribute('aria-valuenow', val);
  thumb.style.left = val + '%';
});`
    },
    semanticCode: {
      html: `<!-- Semantic HTML5 Range Input -->
<label for="sem-vol">Volume:</label>
<input type="range" id="sem-vol" name="volume" min="0" max="100" value="50">
<output for="sem-vol">50</output>`,
      notes: 'Native range inputs automatically support touch dragging, scroll wheel increments, mouse clicks, and all keyboard navigation.'
    }
  },
  {
    id: 'meter',
    name: 'Meter',
    category: 'Inputs & Controls',
    apgSlug: 'meter',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/meter/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Element Preferred',
    semanticElement: '<meter>',
    summary: 'A graphical display of a numeric value within a known range, such as disk usage or battery level. The native HTML <meter> element includes semantic understanding of optimum, low, and high thresholds.',
    firstRuleExplanation: 'The native <meter> element communicates scalar measurement and gauge semantics directly to assistive technologies. It also provides built-in attributes for min, max, low, high, and optimum, allowing browsers and user agents to convey whether a gauge is in a favorable or alert status. The ARIA role="meter" requires custom styling, manual aria-valuenow updates, and cannot natively represent the optimum range concept.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '1.3.1', name: 'Info and Relationships', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Tab', apgAction: 'Meters are read-only; not focusable unless embedded in interactive context.', semanticAction: 'Non-focusable read-only semantic element.' }
    ],
    ariaRequirements: [
      '<div role="meter" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100" aria-label="...">',
      'Custom track container + custom fill <div> with inline style="width: 70%"',
      'Manual color updating logic in JS to change colors if value enters warning/critical zones'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Not focusable (read-only scalar display)'],
      screenReader: 'Announces "meter, Disk Usage, 70 percent".'
    },
    ariaEffort: {
      rating: 'Medium',
      linesOfCode: '~20 lines of HTML, CSS & JS',
      summary: 'Must manually compute percentages, fill widths, and color thresholds.'
    },
    semanticRequirements: [
      '<meter min="0" max="100" low="33" high="66" optimum="80" value="70">70%</meter>',
      '0 lines of JavaScript needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Read-only native element; skipped by Tab sequence'],
      screenReader: 'Natively announces meter value and whether reading is optimum, suboptimal, or alert.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '1 line of HTML',
      summary: 'Native browser scalar gauge with built-in optimum heuristics.'
    },
    semanticLimitations: [
      'Browser default styling renders native OS appearance, which looks drastically different between Windows, macOS, and Linux.',
      'Custom styling requires resetting -webkit-appearance and targeting vendor pseudo-elements (::-webkit-meter-bar, ::-webkit-meter-optimum-value).'
    ],
    cssCustomization: {
      semanticRecipe: `/* Customizing Native <meter> */
meter {
  width: 100%;
  height: 16px;
  border-radius: 999px;
  overflow: hidden;
}
meter::-webkit-meter-bar {
  background: #1e293b;
  border: 1px solid rgba(255,255,255,0.1);
}
meter::-webkit-meter-optimum-value {
  background: linear-gradient(90deg, #38bdf8, #34d399);
}`,
      ariaRecipe: `.meter-bar { width: calc(var(--val) * 1%); background: #a855f7; }`,
      tips: [
        'Include fallback text inside the <meter> tag (<meter value="70">70%</meter>) for older user agents.'
      ]
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Meter -->
<div class="meter-group">
  <span id="disk-lbl">Disk Usage:</span>
  <div role="meter"
    aria-labelledby="disk-lbl"
    aria-valuenow="78"
    aria-valuemin="0"
    aria-valuemax="100"
    class="meter-track">
    <div class="meter-fill" style="width: 78%;"></div>
  </div>
</div>`
    },
    semanticCode: {
      html: `<!-- Semantic HTML5 Meter -->
<label for="disk-meter">Disk Usage:</label>
<meter id="disk-meter" min="0" max="100" low="30" high="80" optimum="20" value="78">
  78%
</meter>`,
      notes: 'Browser renders native threshold color changes (green/yellow/red) based on low, high, and optimum attributes.'
    }
  },
  {
    id: 'button',
    name: 'Button',
    category: 'Inputs & Controls',
    apgSlug: 'button',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/button/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Element Preferred',
    semanticElement: '<button type="button">',
    summary: 'The primary interactive control for triggering actions. The classic demonstration of the First Rule of ARIA: a <div> with role="button" requires extensive custom JavaScript to replicate native <button>.',
    firstRuleExplanation: 'A native <button> element comes with automatic keyboard activation (both Space and Enter fire click), native focusability, native disabled state (which prevents click and keyboard events), form integration (type="submit", type="reset"), and standard accessibility API mapping. An ARIA fake button (<div role="button" tabindex="0">) requires manual keydown listeners for Space and Enter, custom disabled management, and often fails in screen reader virtual cursor modes.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '2.1.1', name: 'Keyboard', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information', 'keyboard-navigation-and-shortcuts'],
    keyboardMatrix: [
      { key: 'Enter', apgAction: 'Must be caught in JS keydown to invoke the button action.', semanticAction: 'Natively fires the click event on <button>.' },
      { key: 'Space', apgAction: 'Must be caught in JS keydown, e.preventDefault() called to prevent page scroll, and action invoked on keyup.', semanticAction: 'Natively triggers button on keyup; page does not scroll.' }
    ],
    ariaRequirements: [
      '<div role="button" tabindex="0">',
      'Keydown listener for Enter to invoke action',
      'Keydown listener for Space to call e.preventDefault() (prevent page scroll) and invoke action on keyup',
      'Manual :focus-visible styling',
      'Manual disabled state management (aria-disabled="true" and tabindex="-1")',
      'Does NOT submit forms without manual form submission JS'
    ],
    ariaKeyboardAndAt: {
      keyboard: [
        'Enter: Triggers button action',
        'Space: Triggers button action (must prevent window scroll)'
      ],
      screenReader: 'Announces "button, Save Changes".'
    },
    ariaEffort: {
      rating: 'High',
      linesOfCode: '~30 lines of JS + CSS to duplicate native button',
      summary: 'Common source of bugs where Space key causes page scroll or disabled buttons still trigger.'
    },
    semanticRequirements: [
      '<button type="button">Save Changes</button>',
      '0 lines of helper code'
    ],
    semanticKeyboardAndAt: {
      keyboard: [
        'Enter and Space natively trigger click event without scrolling',
        'Disabled attribute prevents all focus and click events automatically'
      ],
      screenReader: 'Natively announces button role and accessible name.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '1 line of HTML',
      summary: 'The epitome of the First Rule of ARIA.'
    },
    semanticLimitations: [
      'Default browser button styling has legacy borders and backgrounds; requires standard CSS reset (border: none; background: transparent; font: inherit).',
      'Buttons default to type="submit" inside a <form> if type attribute is omitted.'
    ],
    cssCustomization: {
      semanticRecipe: `/* Modern Reset & Styled Button */
button {
  all: unset;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 20px;
  background: #0284c7;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}
button:focus-visible {
  outline: 3px solid #38bdf8;
  outline-offset: 3px;
}`,
      ariaRecipe: `div[role="button"]:focus-visible { outline: 3px solid #a855f7; }`,
      tips: [
        'Always specify type="button" on non-submitting buttons to prevent accidental form submissions!'
      ]
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Div Button -->
<div role="button" tabindex="0" id="apg-btn" class="custom-btn">
  Save Changes
</div>`,
      js: `// Re-inventing what <button> does natively:
const btn = document.getElementById('apg-btn');
btn.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') doAction();
  else if (e.key === ' ') {
    e.preventDefault(); // Stop spacebar from scrolling page!
    doAction();
  }
});`
    },
    semanticCode: {
      html: `<!-- Semantic HTML Button -->
<button type="button" class="btn-primary" onclick="doAction()">
  Save Changes
</button>`,
      notes: 'Requires 0 lines of helper code. Fully accessible, keyboard responsive, and form-aware out of the box.'
    }
  },
  {
    id: 'link',
    name: 'Link',
    category: 'Navigation',
    apgSlug: 'link',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/link/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Element Preferred',
    semanticElement: '<a href="...">',
    summary: 'An interactive hyperlink that navigates to a new resource or location. Native <a> elements provide essential browser features that fake ARIA links cannot replicate.',
    firstRuleExplanation: 'Using <span role="link" tabindex="0"> breaks standard web browser functionality: users cannot middle-click or right-click to "Open link in new tab", "Copy link address", or bookmark the URL. Search engine spiders cannot crawl fake links. Native <a href="..."> provides full browser navigation, context menus, and accessibility natively.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '2.1.1', name: 'Keyboard', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Enter', apgAction: 'Must catch keydown in JS and manually set window.location.', semanticAction: 'Natively follows the hyperlink.' },
      { key: 'Context Menu / Right-click', apgAction: 'Does NOT show "Open in new tab" or "Copy Link Address".', semanticAction: 'Shows full native browser hyperlink context menu.' }
    ],
    ariaRequirements: [
      '<span role="link" tabindex="0">',
      'JavaScript click listener to set window.location.href',
      'JavaScript keydown listener for Enter key to trigger navigation',
      'Fails to provide browser context menus (Open in new tab, Copy link)'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Enter: Navigates via JS handler'],
      screenReader: 'Announces "link, Privacy Policy".'
    },
    ariaEffort: {
      rating: 'Medium',
      linesOfCode: '~15 lines of JS + HTML',
      summary: 'Breaks browser fundamental behaviors (middle-click, right-click, bookmarking, SEO).'
    },
    semanticRequirements: [
      '<a href="...">',
      '0 lines of JavaScript needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Enter: Natively follows hyperlink; Shift+Enter opens in new window; Cmd/Ctrl+Click opens in new tab'],
      screenReader: 'Natively announces link, URL target, and visited status.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '1 line of HTML',
      summary: 'Native HTML hyperlink.'
    },
    semanticLimitations: [
      'Missing href attribute turns <a> into a non-interactive placeholder link without keyboard focus or link role.'
    ],
    cssCustomization: {
      semanticRecipe: `a.text-link {
  color: #38bdf8;
  text-decoration: underline;
  text-underline-offset: 4px;
}
a.text-link:hover {
  color: #7dd3fc;
}`,
      ariaRecipe: `span[role="link"] { cursor: pointer; text-decoration: underline; }`,
      tips: ['Never omit href on <a> tags if keyboard interactivity is expected.']
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Span Link -->
<span role="link" tabindex="0" class="custom-link" id="apg-link">
  View Privacy Policy
</span>`,
      js: `const link = document.getElementById('apg-link');
link.addEventListener('click', () => window.location.href = '/privacy');
link.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') window.location.href = '/privacy';
});`
    },
    semanticCode: {
      html: `<!-- Semantic HTML Anchor Element -->
<a href="/privacy" class="text-link">
  View Privacy Policy
</a>`,
      notes: 'Supports right-click, middle-click, command-click, bookmarking, hover status URL preview in browser bar, and screen reader links lists.'
    }
  },
  {
    id: 'radio',
    name: 'Radio Group',
    category: 'Inputs & Controls',
    apgSlug: 'radio',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/radio/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Element Preferred',
    semanticElement: '<fieldset> + <legend> + <input type="radio">',
    summary: 'A set of checkable buttons where no more than one button can be checked simultaneously. Native radio buttons provide single tab-stop roving focus and arrow navigation natively.',
    firstRuleExplanation: 'The APG ARIA radio group pattern requires manually implementing roving tabindex (managing tabindex="0" on the selected radio and tabindex="-1" on all others), listening for ArrowUp, ArrowDown, ArrowLeft, ArrowRight, and updating aria-checked. Native <input type="radio" name="..."> grouped by a <fieldset> with <legend> provides this entire behavior natively with zero JavaScript.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { num: '2.1.1', name: 'Keyboard', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information', 'keyboard-navigation-and-shortcuts'],
    keyboardMatrix: [
      { key: 'Tab', apgAction: 'Focuses the checked radio button (tabindex="0").', semanticAction: 'Focuses the checked radio button in the group.' },
      { key: 'Arrow Left / Up', apgAction: 'JS updates tabindex="-1", sets next radio to tabindex="0", and updates aria-checked="true".', semanticAction: 'Natively checks and focuses previous radio in the group.' },
      { key: 'Arrow Right / Down', apgAction: 'JS updates tabindex="-1", sets next radio to tabindex="0", and updates aria-checked="true".', semanticAction: 'Natively checks and focuses next radio in the group.' }
    ],
    ariaRequirements: [
      '<div role="radiogroup" aria-labelledby="title-id">',
      '<div role="radio" tabindex="0/-1" aria-checked="true/false">',
      'Roving tabindex algorithm across all 4 arrow keys',
      'Manual state sync and focus setting in JS'
    ],
    ariaKeyboardAndAt: {
      keyboard: [
        'Arrow Up / Down / Left / Right: Moves focus and checks selected radio',
        'Tab: Moves focus to the checked radio button (single tab stop)'
      ],
      screenReader: 'Announces "radio button, checked 1 of 3, Shipping Speed".'
    },
    ariaEffort: {
      rating: 'High',
      linesOfCode: '~50 lines of JS + CSS',
      summary: 'Must manually implement roving focus and keyboard traversal that HTML does natively.'
    },
    semanticRequirements: [
      '<fieldset><legend>Title</legend><label><input type="radio" name="grp" value="..."> ...</label></fieldset>',
      '0 lines of JavaScript needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: [
        'Natively provides single tab stop for group and arrow key selection across all browsers.'
      ],
      screenReader: 'Announces legend as group context, then radio button label, state, and position (1 of 3).'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '~6 lines of HTML',
      summary: 'Native browser implementation.'
    },
    semanticLimitations: [
      'Default browser radio circles have rigid OS styling unless overridden with accent-color or appearance: none.'
    ],
    cssCustomization: {
      semanticRecipe: `/* Modern Native Radio Styling */
input[type="radio"] {
  accent-color: #059669;
  width: 18px;
  height: 18px;
  cursor: pointer;
}`,
      ariaRecipe: `[role="radio"][aria-checked="true"] .radio-dot { background: #a855f7; }`,
      tips: [
        'Always wrap native radio groups in <fieldset> with <legend> so screen reader users hear the group prompt before the option.'
      ]
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Radio Group -->
<div role="radiogroup" aria-labelledby="rg-title" class="apg-radiogroup">
  <span id="rg-title">Subscription Tier:</span>
  <div role="radio" tabindex="0" aria-checked="true" class="apg-radio">Monthly ($9)</div>
  <div role="radio" tabindex="-1" aria-checked="false" class="apg-radio">Annual ($89)</div>
</div>`,
      js: `// Requires roving tabindex management and keyboard listeners for all 4 arrow keys`
    },
    semanticCode: {
      html: `<!-- Semantic HTML Radio Group -->
<fieldset class="semantic-radiogroup">
  <legend>Subscription Tier:</legend>
  <label>
    <input type="radio" name="tier" value="monthly" checked>
    Monthly ($9)
  </label>
  <label>
    <input type="radio" name="tier" value="annual">
    Annual ($89)
  </label>
</fieldset>`,
      notes: 'Grouped under a semantic legend for assistive tech context; arrow key navigation works across all browsers natively.'
    }
  },
  {
    id: 'checkbox',
    name: 'Checkbox (Tri-State / Mixed)',
    category: 'Inputs & Controls',
    apgSlug: 'checkbox',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/',
    firstRuleVerdict: 'hybrid-enhancement',
    verdictLabel: 'Hybrid Enhancement',
    semanticElement: '<input type="checkbox"> + indeterminate property',
    summary: 'A control that allows the user to toggle between checked, unchecked, or partially checked (mixed/indeterminate) states. Native checkbox handles the mixed state via the DOM indeterminate property.',
    firstRuleExplanation: 'While creating a custom checkbox (<div role="checkbox">) requires writing custom Space key listeners and focus styling, the native <input type="checkbox"> handles focus, toggling, and form submission natively. For parent "select all" checkboxes that need a mixed state, setting the DOM property checkbox.indeterminate = true provides native screen reader mixed state announcements without abandoning native checkbox semantics.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '2.1.1', name: 'Keyboard', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Space', apgAction: 'Cycles aria-checked between "false", "true", and "mixed" via JS.', semanticAction: 'Natively toggles checked state.' }
    ],
    ariaRequirements: [
      '<div role="checkbox" tabindex="0" aria-checked="mixed">',
      'Custom SVG or font icon for checkmark and minus icon',
      'JavaScript Space key listener to cycle between false -> true -> mixed'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Space: Cycles between checked, unchecked, and mixed'],
      screenReader: 'Announces "checkbox, partially checked [mixed], All Permissions".'
    },
    ariaEffort: {
      rating: 'Medium',
      linesOfCode: '~30 lines of JS + CSS',
      summary: 'Manual rendering of tri-state icons and keyboard space listeners.'
    },
    semanticRequirements: [
      'Native <input type="checkbox">',
      'JavaScript setting checkbox.indeterminate = true for parent status'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Space: Natively checks or unchecks checkbox'],
      screenReader: 'Natively announces "checkbox, partially checked / mixed".'
    },
    semanticEffort: {
      rating: 'Low (1-2 lines JS)',
      linesOfCode: '1 line JS: el.indeterminate = true',
      summary: 'Leverages native OS tri-state rendering and accessibility tree states.'
    },
    semanticLimitations: [
      'The indeterminate state CANNOT be set via HTML markup alone (e.g. there is no indeterminate HTML attribute); it MUST be set via JavaScript property: input.indeterminate = true.'
    ],
    cssCustomization: {
      semanticRecipe: `/* Styling Native Checkbox & Indeterminate State */
input[type="checkbox"]:indeterminate {
  accent-color: #7c3aed;
}`,
      ariaRecipe: `[role="checkbox"][aria-checked="mixed"] .custom-box { background: #7c3aed; }`,
      tips: [
        'Use the :indeterminate CSS pseudo-class to style parent checkboxes when in the mixed state.'
      ]
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Mixed Checkbox -->
<div role="checkbox" tabindex="0"
  aria-checked="mixed"
  id="apg-mixed-box"
  class="apg-checkbox">
  <span class="custom-box"></span>
  All Permissions
</div>`
    },
    semanticCode: {
      html: `<!-- Semantic HTML Checkbox with Indeterminate Property -->
<label>
  <input type="checkbox" id="sem-parent-box">
  All Permissions
</label>`,
      js: `// Simply set the native indeterminate property:
const parentBox = document.getElementById('sem-parent-box');
parentBox.indeterminate = true; // Browser natively renders mixed dash & announces to AT!`
    }
  },
  {
    id: 'disclosure',
    name: 'Disclosure (Show/Hide)',
    category: 'Structure & Layout',
    apgSlug: 'disclosure',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Element Preferred',
    semanticElement: '<details> + <summary>',
    summary: 'A simple button that controls the visibility of an associated section of content. Modern HTML <details> and <summary> provide this natively with zero JavaScript.',
    firstRuleExplanation: 'The disclosure pattern is one of the most common web interactions. Before HTML5 <details>, developers used <button aria-expanded="false" aria-controls="content">. Native <details> provides complete keyboard accessibility, automatic aria-expanded state handling, built-in search-on-page text matching (browsers automatically expand details when searching with Ctrl+F), and zero JavaScript overhead.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '1.3.1', name: 'Info and Relationships', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Enter / Space', apgAction: 'Toggles aria-expanded and panel visibility via JS.', semanticAction: 'Natively toggles details open state.' }
    ],
    ariaRequirements: [
      '<button type="button" aria-expanded="false" aria-controls="content-id">',
      '<div id="content-id" hidden>',
      'Click event listener to flip aria-expanded and hidden'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Enter / Space: Toggles expanded/collapsed state via JS'],
      screenReader: 'Announces "button, collapsed [or expanded], What is WCAG 3.0?".'
    },
    ariaEffort: {
      rating: 'Medium',
      linesOfCode: '~20 lines of HTML + JS',
      summary: 'Requires synchronizing aria-expanded attribute with panel hidden state.'
    },
    semanticRequirements: [
      '<details><summary>Title</summary><p>Content</p></details>',
      '0 lines of JavaScript needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Enter / Space: Natively toggles details open state'],
      screenReader: 'Natively announces "details, collapsed [or expanded]".'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '3 lines of HTML',
      summary: 'Standard HTML5 disclosure.'
    },
    semanticLimitations: [
      'Browsers render default black triangle arrow that requires removal via CSS.'
    ],
    cssCustomization: {
      semanticRecipe: `details summary {
  list-style: none;
  cursor: pointer;
  padding: 8px 12px;
}
details summary::-webkit-details-marker {
  display: none;
}`,
      ariaRecipe: `button[aria-expanded="true"] + div { display: block; }`,
      tips: ['Details contents automatically expand when users search with browser Find (Ctrl+F)!']
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Disclosure Button -->
<button type="button" aria-expanded="false" aria-controls="faq-answer" id="faq-btn">
  What is WCAG 3.0?
</button>
<div id="faq-answer" hidden>
  <p>WCAG 3.0 is the upcoming draft standard for web content accessibility guidelines.</p>
</div>`,
      js: `const btn = document.getElementById('faq-btn');
const ans = document.getElementById('faq-answer');
btn.addEventListener('click', () => {
  const exp = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!exp));
  ans.hidden = exp;
});`
    },
    semanticCode: {
      html: `<!-- Semantic HTML Details Element -->
<details>
  <summary>What is WCAG 3.0?</summary>
  <p>WCAG 3.0 is the upcoming draft standard for web content accessibility guidelines.</p>
</details>`,
      notes: 'Natively accessible, expands automatically when users use browser Find (Ctrl+F), and requires 0 lines of JavaScript.'
    }
  },
  {
    id: 'combobox',
    name: 'Combobox / Autocomplete',
    category: 'Inputs & Controls',
    apgSlug: 'combobox',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/combobox/',
    firstRuleVerdict: 'hybrid-enhancement',
    verdictLabel: 'Native Preferred for Basic; ARIA for Rich Popups',
    semanticElement: '<input list="..."> + <datalist>',
    summary: 'A composite widget combining a single-line textbox with an associated popup listbox. Native <datalist> provides zero-JS autocomplete, while APG Combobox is needed for rich custom dropdowns.',
    firstRuleExplanation: 'For standard text suggestion and search autocomplete, the native HTML <datalist> element paired with an <input list="..."> provides built-in keyboard navigation, native OS suggestions, and screen reader announcements with zero JavaScript. The APG Combobox pattern is only warranted when dropdown options require rich HTML markup (avatars, subheadings, badges) or multi-select chip tags.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '2.1.1', name: 'Keyboard', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information', 'keyboard-navigation-and-shortcuts'],
    keyboardMatrix: [
      { key: 'Arrow Down', apgAction: 'Opens popup listbox and moves focus or aria-activedescendant.', semanticAction: 'Opens native datalist suggestion menu.' },
      { key: 'Enter', apgAction: 'Selects active option and closes listbox via JS.', semanticAction: 'Fills selected suggestion into input.' },
      { key: 'Escape', apgAction: 'Closes listbox and resets focus to input.', semanticAction: 'Dismisses suggestion dropdown.' }
    ],
    ariaRequirements: [
      '<input role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="list-id">',
      '<ul role="listbox" id="list-id"> with <li role="option">',
      'Managing aria-activedescendant or roving tabindex',
      'Listening for ArrowDown, ArrowUp, Enter, Escape, Home, End',
      'Filtering list items dynamically on text input'
    ],
    ariaKeyboardAndAt: {
      keyboard: [
        'Arrow Down: Opens popup list and moves active descendant',
        'Enter: Selects active option and closes list',
        'Escape: Closes popup listbox and keeps input focus'
      ],
      screenReader: 'Announces "combobox, expanded / collapsed, option 1 of 5".'
    },
    ariaEffort: {
      rating: 'Extreme',
      linesOfCode: '~120-180 lines of JS + HTML',
      summary: 'Requires intricate keyboard focus management, virtual cursor tracking, and ARIA syncing.'
    },
    semanticRequirements: [
      '<input list="items-id"> + <datalist id="items-id"><option value="...">...</datalist>',
      '0 lines of JavaScript needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: [
        'Arrow Down: Natively opens suggestion dropdown',
        'Enter: Selects highlighted suggestion'
      ],
      screenReader: 'Natively announces available suggestions and input auto-complete.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '~6 lines of HTML',
      summary: 'Zero-JS native autocomplete provided by browser.'
    },
    semanticLimitations: [
      'Option items in <datalist> CANNOT be styled with custom CSS or contain rich HTML (avatars, icons, secondary descriptions, badges).',
      'Dropdown presentation is controlled entirely by the operating system / browser UI.'
    ],
    cssCustomization: {
      semanticRecipe: `/* Styling the Input with Datalist */
input[list] {
  padding: 10px 14px;
  border: 1px solid var(--border-default);
  border-radius: 8px;
  background: var(--surface-card);
  color: var(--text-primary);
}`,
      ariaRecipe: `.cb-listbox { position: absolute; background: #1c1b1f; border: 1px solid #a855f7; }`,
      tips: [
        'When simple string autocomplete is needed, use <datalist>. Switch to the APG Combobox pattern ONLY when options require rich media or multi-column layouts.'
      ]
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Combobox -->
<div class="combobox-wrapper">
  <input type="text" role="combobox"
    aria-expanded="false"
    aria-autocomplete="list"
    aria-controls="cb-listbox"
    id="cb-input"
    placeholder="Search standards...">
  <ul role="listbox" id="cb-listbox" class="cb-listbox" hidden>
    <li role="option" id="opt-1">WCAG 2.2</li>
    <li role="option" id="opt-2">WCAG 3.0</li>
  </ul>
</div>`
    },
    semanticCode: {
      html: `<!-- Semantic HTML Autocomplete with datalist -->
<label for="std-search">Search standards:</label>
<input type="text" id="std-search" list="standards-list" placeholder="Search standards...">
<datalist id="standards-list">
  <option value="WCAG 2.2">
  <option value="WCAG 3.0">
  <option value="Section 508">
  <option value="EN 301 549">
</datalist>`,
      notes: 'Supported in all modern browsers without any script. Provides native fuzzy matching and assistive technology integration.'
    }
  },
  {
    id: 'menu-button',
    name: 'Menu Button / Popover',
    category: 'Dialogs & Overlays',
    apgSlug: 'menu-button',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/',
    firstRuleVerdict: 'hybrid-enhancement',
    verdictLabel: 'Native Popover API Preferred for Navigation',
    semanticElement: '<button popovertarget="..."> + Popover API',
    summary: 'A button that opens a flyout menu. The APG Menu pattern is designed for desktop-style application command actions; for site navigation, the modern HTML Popover API is preferred.',
    firstRuleExplanation: 'One of the most widespread accessibility anti-patterns on the web is using ARIA role="menu" and role="menuitem" for site navigation links. In ARIA, a menu is an application menu (like File/Edit in a desktop app) where Tab exits the menu and Arrow keys navigate items. When applied to website dropdowns, screen reader users expect arrow navigation and cannot tab through links. Modern HTML provides the Popover API (popover, popovertarget) which gives native top-layer flyout and light-dismiss without ruining link semantics.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '2.4.3', name: 'Focus Order', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Enter / Space', apgAction: 'Opens application menu and focuses first menuitem.', semanticAction: 'Natively opens popover panel.' },
      { key: 'Tab', apgAction: 'In APG Menu, Tab immediately closes menu and moves to next page element!', semanticAction: 'Tabs sequentially through all interactive items inside popover.' },
      { key: 'Escape', apgAction: 'Closes menu and returns focus to menu button via JS.', semanticAction: 'Natively closes popover (light dismiss).' }
    ],
    ariaRequirements: [
      '<button aria-haspopup="menu" aria-expanded="false"> + <ul role="menu"> + <li role="menuitem">',
      'Arrow Up/Down navigation within menu',
      'Esc to close and return focus',
      'Tab immediately closes menu and moves to next page element'
    ],
    ariaKeyboardAndAt: {
      keyboard: [
        'Enter / Space: Opens menu and focuses first item',
        'Arrow Down / Up: Navigates menuitems',
        'Escape: Closes menu and focuses button',
        'Tab: Closes menu immediately'
      ],
      screenReader: 'Announces "menu button, has popup menu, expanded / collapsed".'
    },
    ariaEffort: {
      rating: 'High',
      linesOfCode: '~50-70 lines of JS + CSS',
      summary: 'Frequently misimplemented on web navigation links where Tab navigation is broken.'
    },
    semanticRequirements: [
      '<button popovertarget="my-popover"> + <div id="my-popover" popover>',
      '0 lines of JavaScript needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: [
        'Enter / Space: Opens popover',
        'Escape: Natively closes popover (light dismiss)',
        'Tab: Traverses all interactive elements inside popover normally'
      ],
      screenReader: 'Announces button trigger and top-layer popover panel.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '~5 lines of HTML',
      summary: 'Browser Top Layer with light-dismiss built in.'
    },
    semanticLimitations: [
      'Popover API is supported in modern browsers (Chrome 114+, Firefox 125+, Safari 17+); older legacy browsers require polyfill.'
    ],
    cssCustomization: {
      semanticRecipe: `/* Styling Native Popover API */
[popover] {
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: 12px;
  background: var(--surface-card);
  box-shadow: 0 10px 25px rgba(0,0,0,0.3);
}
[popover]:popover-open {
  opacity: 1;
}`,
      ariaRecipe: `[role="menu"] { position: absolute; background: #1c1b1f; }`,
      tips: [
        'Use the Popover API for flyouts and dropdowns that contain navigation links, and reserve ARIA role="menu" only for desktop-like application action palettes.'
      ]
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Application Menu Button -->
<button type="button" aria-haspopup="menu" aria-expanded="false" id="menu-btn">
  Actions ▼
</button>
<ul role="menu" id="action-menu" aria-labelledby="menu-btn" hidden>
  <li role="menuitem" tabindex="-1">Export PDF</li>
  <li role="menuitem" tabindex="-1">Duplicate</li>
  <li role="menuitem" tabindex="-1">Delete</li>
</ul>`
    },
    semanticCode: {
      html: `<!-- Modern Semantic HTML Popover API -->
<button type="button" popovertarget="nav-menu">
  Actions ▼
</button>

<div id="nav-menu" popover class="popover-card">
  <nav aria-label="Action options">
    <a href="/export">Export PDF</a>
    <a href="/duplicate">Duplicate</a>
    <button type="button" class="btn-danger">Delete</button>
  </nav>
</div>`,
      notes: 'Native Popover API renders in the browser Top Layer, features light-dismiss (clicking outside or pressing Esc closes it), and preserves standard Tab order.'
    }
  },
  {
    id: 'tabs',
    name: 'Tabs',
    category: 'Application Widgets',
    apgSlug: 'tabs',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/tabs/',
    firstRuleVerdict: 'aria-required',
    verdictLabel: 'ARIA Required (No Native HTML Element)',
    semanticElement: 'No native <tabs> element exists in HTML',
    summary: 'A set of layered panels where only one panel is displayed at a time. Because HTML currently lacks a native <tabs> element, the APG Tabs pattern remains the required accessible pattern.',
    firstRuleExplanation: 'Unlike dialogs, accordions, and sliders, HTML does not have a native <tabs> or <tabpanel> element (although WHATWG and OpenUI have active proposals). Therefore, implementing tabbed interfaces requires following the W3C APG Tabs pattern: role="tablist", role="tab", role="tabpanel", aria-selected="true/false", and roving tabindex with ArrowLeft/ArrowRight navigation. Some developers attempt hacks using radio buttons or details, but only the APG ARIA pattern communicates true tabbed semantics to screen readers.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '2.1.1', name: 'Keyboard', level: 'A' },
      { num: '2.4.3', name: 'Focus Order', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information', 'keyboard-navigation-and-shortcuts'],
    keyboardMatrix: [
      { key: 'Tab', apgAction: 'Moves focus from active tab directly into the tabpanel content (single tab stop for tablist).', semanticAction: 'Without ARIA tabs, every tab is an independent tab stop.' },
      { key: 'Arrow Left / Right', apgAction: 'Moves focus between sibling tabs and (in automatic mode) activates the panel.', semanticAction: 'Not supported without custom ARIA script.' },
      { key: 'Home / End', apgAction: 'Moves focus to the first or last tab in the tablist.', semanticAction: 'Not supported without custom ARIA script.' }
    ],
    ariaRequirements: [
      '<div role="tablist" aria-label="..."> container',
      '<button role="tab" aria-selected="true/false" aria-controls="panel-id" id="tab-id">',
      '<div role="tabpanel" id="panel-id" aria-labelledby="tab-id" tabindex="0">',
      'Roving tabindex algorithm (active tab has tabindex="0", inactive have tabindex="-1")',
      'ArrowLeft / ArrowRight keyboard listeners to switch tabs',
      'Tab key jumps from active tab directly into tabpanel content'
    ],
    ariaKeyboardAndAt: {
      keyboard: [
        'Arrow Left / Right: Navigates between tabs (roving focus)',
        'Tab: Jumps directly into active tabpanel content (single tab stop for tablist)',
        'Home / End: Focuses first / last tab'
      ],
      screenReader: 'Announces "tab, selected [or unselected], tab 1 of 3". Tabpanel announces associated tab label.'
    },
    ariaEffort: {
      rating: 'High',
      linesOfCode: '~50-70 lines of JS + HTML',
      summary: 'Normative standard required because HTML does not have a native <tabs> element.'
    },
    semanticRequirements: [
      'NO native <tabs> element exists in HTML specification yet!',
      'Can be approximated using <details name="tab-group"> or CSS-only radio buttons, but neither communicates true tab semantics to assistive technologies.'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Without ARIA, each tab button is a separate tab stop (violating expected tablist keyboard efficiency).'],
      screenReader: 'Announced as individual buttons or details, lacking tab / tabpanel relationship.'
    },
    semanticEffort: {
      rating: 'N/A (ARIA Required)',
      linesOfCode: 'N/A',
      summary: 'Use the W3C APG ARIA Tabs pattern.'
    },
    semanticLimitations: [
      'HTML has no native tab widget. WHATWG and OpenUI are developing proposals, but none are standardized.',
      'Radio-button tab hacks pollute form data and fail to represent tabpanel relationships to screen readers.'
    ],
    cssCustomization: {
      semanticRecipe: `/* What developers do when avoiding JS (CSS Radio Tab Hack) */
input[type="radio"].tab-radio {
  position: absolute;
  opacity: 0;
}
.tab-radio:checked + label {
  border-bottom: 2px solid #059669;
  color: #059669;
}`,
      ariaRecipe: `[role="tab"][aria-selected="true"] {
  border-bottom: 2px solid #a855f7;
  color: #a855f7;
}
[role="tabpanel"][hidden] {
  display: none;
}`,
      tips: [
        'Always keep tabpanel focusable (tabindex="0") if it contains no focusable interactive children, so keyboard-only users can scroll long content.'
      ]
    },
    apgCode: {
      html: `<!-- W3C APG Standard ARIA Tabs Pattern -->
<div class="tabs-container">
  <div role="tablist" aria-label="Audit Reports">
    <button role="tab" aria-selected="true" aria-controls="panel-1" id="tab-1" tabindex="0">
      Automated Audit
    </button>
    <button role="tab" aria-selected="false" aria-controls="panel-2" id="tab-2" tabindex="-1">
      Manual Audit
    </button>
  </div>
  <div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">
    <p>Automated axe-core and Lighthouse findings.</p>
  </div>
  <div role="tabpanel" id="panel-2" aria-labelledby="tab-2" tabindex="0" hidden>
    <p>Screen reader and keyboard navigation notes.</p>
  </div>
</div>`,
      js: `// Roving tabindex and Arrow key navigation:
const tabs = document.querySelectorAll('[role="tab"]');
tabs.forEach((tab, index) => {
  tab.addEventListener('keydown', (e) => {
    let newIndex = index;
    if (e.key === 'ArrowRight') newIndex = (index + 1) % tabs.length;
    else if (e.key === 'ArrowLeft') newIndex = (index - 1 + tabs.length) % tabs.length;
    if (newIndex !== index) {
      tabs[newIndex].focus();
      activateTab(tabs[newIndex]);
    }
  });
});`
    },
    semanticCode: {
      html: `<!-- What HTML Offers Today: Multi-page navigation or Details group -->
<!-- Notice: HTML does NOT have a native <tabs> element! -->
<div class="callout-note">
  <strong>Spec Status:</strong> WHATWG & OpenUI have active proposals for &lt;tabs&gt;.
  Until standardized, the W3C APG ARIA Tabs pattern above is the normative industry standard.
</div>`,
      notes: 'Always ensure your tablist is treated as a single tab stop, with arrow keys switching tabs, and Tab jumping directly into the tabpanel.'
    }
  },
  {
    id: 'table',
    name: 'Table vs Data Grid',
    category: 'Structure & Layout',
    apgSlug: 'table',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/table/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Table Preferred; ARIA Grid for Apps',
    semanticElement: '<table>, <thead>, <tbody>, <tr>, <th>, <td>',
    summary: 'A tabular presentation of data. Native HTML <table> provides built-in screen reader navigation commands; ARIA role="grid" is reserved for interactive spreadsheet applications.',
    firstRuleExplanation: 'Native HTML <table> with <th> scope="col/row" and <caption> gives screen reader users built-in matrix reading shortcuts (e.g. Ctrl+Alt+Arrows in JAWS/NVDA, VO+Arrows in VoiceOver). Replacing tables with <div role="table"> is unnecessary work. Furthermore, developers often misuse role="grid" when they simply have a data table: role="grid" tells assistive technologies to disable standard table navigation in favor of arrow-key cell traversal, which should only be used for interactive widgets like spreadsheets or calendars.',
    wcagCriteria: [
      { num: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Screen Reader Table Keys (Ctrl+Alt+Arrows)', apgAction: 'Works if role="table", role="row", role="cell" are all configured.', semanticAction: 'Natively supported across all screen readers.' },
      { key: 'Arrow Keys (role="grid")', apgAction: 'Moves active cell focus in 2 dimensions across rows/columns.', semanticAction: 'In standard <table>, arrow keys scroll or navigate text.' }
    ],
    ariaRequirements: [
      '<div role="table">, <div role="rowgroup">, <div role="row">, <div role="columnheader">, <div role="cell">',
      'For role="grid", 2D arrow key cell traversal must be programmed manually with roving tabindex'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Arrow keys navigate cells in role="grid"'],
      screenReader: 'Screen readers must emulate table commands on custom divs.'
    },
    ariaEffort: {
      rating: 'Medium',
      linesOfCode: '~40 lines of HTML + CSS',
      summary: 'Complete reinvention of standard HTML table elements with zero usability benefit for static data.'
    },
    semanticRequirements: [
      '<table>, <caption>, <thead>, <tbody>, <tr>, <th scope="col/row">, <td>',
      '0 lines of JavaScript needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Screen reader users navigate rows and columns with native shortcuts (Ctrl+Alt+Arrows)'],
      screenReader: 'Natively announces table dimensions (e.g. "table with 4 columns and 10 rows") and reads column headers automatically.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '~10 lines of HTML',
      summary: 'Native browser HTML table.'
    },
    semanticLimitations: [
      'Responsive tables on narrow mobile screens require horizontal overflow wrappers (overflow-x: auto) to avoid breaking layout.'
    ],
    cssCustomization: {
      semanticRecipe: `table {
  width: 100%;
  border-collapse: collapse;
}
th, td {
  padding: 10px 14px;
  border-bottom: 1px solid var(--border-subtle);
  text-align: left;
}
th {
  background: var(--surface-elevated);
}`,
      ariaRecipe: `.apg-aria-table { display: flex; flex-direction: column; }`,
      tips: ['Always use <th scope="col"> and <th scope="row"> to ensure header cell associations are unambiguous.']
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Table (Unnecessary when HTML <table> exists) -->
<div role="table" aria-label="WCAG 3 Tiers" class="apg-table">
  <div role="rowgroup">
    <div role="row">
      <div role="columnheader">Tier</div>
      <div role="columnheader">Target</div>
    </div>
  </div>
  <div role="rowgroup">
    <div role="row">
      <div role="cell">Bronze</div>
      <div role="cell">Base Conformance</div>
    </div>
  </div>
</div>`
    },
    semanticCode: {
      html: `<!-- Semantic HTML Table -->
<table class="semantic-data-table">
  <caption>WCAG 3 Reporting Tiers</caption>
  <thead>
    <tr>
      <th scope="col">Tier</th>
      <th scope="col">Target</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">Bronze</th>
      <td>Base Conformance</td>
    </tr>
  </tbody>
</table>`,
      notes: 'Provides native column and row header association with scope attributes without any ARIA attributes.'
    }
  },
  {
    id: 'spinbutton',
    name: 'Spinbutton',
    category: 'Inputs & Controls',
    apgSlug: 'spinbutton',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Element Preferred',
    semanticElement: '<input type="number">',
    summary: 'A stepper input for selecting a numeric value from a defined range. Native <input type="number"> provides native stepper controls, mobile numeric keyboards, and keyboard navigation.',
    firstRuleExplanation: 'The APG ARIA spinbutton requires a <div> with role="spinbutton", aria-valuenow, aria-valuemin, aria-valuemax, plus increment and decrement buttons and custom keydown listeners for ArrowUp, ArrowDown, PageUp, PageDown, Home, and End. Native <input type="number"> does all of this natively and automatically triggers numeric keypads on mobile smartphones.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '3.3.2', name: 'Labels or Instructions', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Arrow Up / Down', apgAction: 'Increments / decrements aria-valuenow via JS.', semanticAction: 'Natively increments / decrements input value by step size.' }
    ],
    ariaRequirements: [
      '<div role="spinbutton" tabindex="0" aria-valuenow="1" aria-valuemin="1" aria-valuemax="10">',
      'Increment & decrement trigger buttons',
      'Keydown listeners for ArrowUp and ArrowDown',
      'Manual state sync and display text updating'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Arrow Up / Down: Increments / decrements number value'],
      screenReader: 'Announces "spinbutton, Quantity, 3".'
    },
    ariaEffort: {
      rating: 'Medium',
      linesOfCode: '~35 lines of JS + HTML',
      summary: 'Manual implementation of number stepping and constraint checking.'
    },
    semanticRequirements: [
      '<input type="number" min="1" max="10" step="1" value="3">',
      '0 lines of JavaScript needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Arrow Up / Down: Natively increments / decrements number by step'],
      screenReader: 'Natively announces spinbutton with min, max, and current value.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '1 line of HTML',
      summary: 'Native browser number input.'
    },
    semanticLimitations: [
      'Different browsers render different native stepper spinner arrows; hiding them requires vendor CSS rules.'
    ],
    cssCustomization: {
      semanticRecipe: `/* Removing native spin buttons if custom UI is required */
input[type="number"]::-webkit-inner-spin-button,
input[type="number"]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}`,
      ariaRecipe: `.spinbutton-wrapper button { padding: 4px 8px; }`,
      tips: ['Native <input type="number"> triggers numeric keypads on iOS and Android automatically.']
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Spinbutton -->
<div class="spinbutton-wrapper">
  <label id="qty-lbl">Quantity:</label>
  <div role="spinbutton" tabindex="0"
    aria-labelledby="qty-lbl"
    aria-valuenow="1"
    aria-valuemin="1"
    aria-valuemax="10"
    id="apg-spinner">1</div>
  <button type="button" id="spin-inc">+</button>
  <button type="button" id="spin-dec">-</button>
</div>`
    },
    semanticCode: {
      html: `<!-- Semantic HTML Number Input -->
<label for="sem-qty">Quantity:</label>
<input type="number" id="sem-qty" name="quantity" min="1" max="10" step="1" value="1">`,
      notes: 'Automatically provides native stepper buttons, handles min/max constraints, and opens numeric keypad on iOS/Android.'
    }
  },
  {
    id: 'landmarks',
    name: 'Landmarks',
    category: 'Structure & Layout',
    apgSlug: 'landmarks',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/',
    firstRuleVerdict: 'native-preferred',
    verdictLabel: 'Native Element Preferred',
    semanticElement: '<header>, <nav>, <main>, <aside>, <footer>, <search>',
    summary: 'Structural landmarks define major regions of a webpage, allowing screen reader users to jump directly between sections. HTML5 landmark elements map natively to ARIA landmark roles.',
    firstRuleExplanation: 'Never use <div role="banner"> or <div role="main"> when you can use <header> and <main>. Modern HTML provides explicit elements for every major ARIA landmark: <header> (banner), <nav> (navigation), <main> (main), <aside> (complementary), <footer> (contentinfo), and the modern <search> element (search).',
    wcagCriteria: [
      { num: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { num: '2.4.1', name: 'Bypass Blocks', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information', 'focus-order-and-management'],
    keyboardMatrix: [
      { key: 'Screen Reader Landmark Shortcut (D key in JAWS/NVDA)', apgAction: 'Navigates to role="banner", role="main", etc.', semanticAction: 'Natively jumps to <header>, <main>, <nav>, <aside>, <footer>.' }
    ],
    ariaRequirements: [
      '<div role="banner">, <div role="navigation">, <div role="main">, <div role="contentinfo">',
      'Manual role assignment on generic div containers'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Screen reader shortcut keys (D or R) jump between landmarks'],
      screenReader: 'Announces "banner", "main", "navigation".'
    },
    ariaEffort: {
      rating: 'Medium',
      linesOfCode: 'Multiple explicit role attributes',
      summary: 'Redundant when HTML5 landmark tags are available.'
    },
    semanticRequirements: [
      '<header>, <nav>, <main>, <aside>, <footer>, <search>',
      '0 ARIA roles needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Screen reader shortcut keys (D or R) jump between HTML5 sections natively'],
      screenReader: 'Natively maps to accessibility landmark roles in all screen readers.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: 'Native HTML tags',
      summary: 'Zero effort landmark architecture.'
    },
    semanticLimitations: [
      '<header> and <footer> only map to banner and contentinfo when they are direct children of <body> (not scoped within <article> or <section>).'
    ],
    cssCustomization: {
      semanticRecipe: `main {
  max-width: 1200px;
  margin: 0 auto;
}
header, footer {
  padding: 24px;
}`,
      ariaRecipe: `[role="main"] { max-width: 1200px; }`,
      tips: ['Use aria-label on <nav> elements (e.g. <nav aria-label="Main Navigation">) to distinguish multiple navigation landmarks on the same page.']
    },
    apgCode: {
      html: `<!-- Obsolete ARIA Landmark Divs -->
<div role="banner">...</div>
<div role="navigation" aria-label="Main">...</div>
<div role="main">...</div>
<div role="contentinfo">...</div>`
    },
    semanticCode: {
      html: `<!-- Modern Semantic HTML5 Landmarks -->
<header>...</header>
<nav aria-label="Main">...</nav>
<main>...</main>
<aside>...</aside>
<search>...</search>
<footer>...</footer>`,
      notes: 'HTML5 sectioning elements map directly to accessibility API landmark roles in all modern browsers without any ARIA markup.'
    }
  },
  {
    id: 'breadcrumb',
    name: 'Breadcrumb',
    category: 'Navigation',
    apgSlug: 'breadcrumb',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/',
    firstRuleVerdict: 'hybrid-enhancement',
    verdictLabel: 'Hybrid Enhancement',
    semanticElement: '<nav aria-label="Breadcrumb"> + <ol> + aria-current="page"',
    summary: 'A navigation trail showing the user’s location within a hierarchical site structure. The standard pattern combines semantic HTML <nav> and <ol> with aria-current="page".',
    firstRuleExplanation: 'The breadcrumb pattern represents the ideal synergy between semantic HTML and ARIA. Semantic HTML provides the container (<nav>), the ordered sequence of steps (<ol> and <li>), and the hyperlinks (<a>). ARIA provides the critical attribute aria-current="page" on the active link or element, informing assistive tech users that they are currently on that step.',
    wcagCriteria: [
      { num: '1.3.1', name: 'Info and Relationships', level: 'A' },
      { num: '2.4.8', name: 'Location', level: 'AAA' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Tab', apgAction: 'Tabs sequentially through each breadcrumb link.', semanticAction: 'Tabs sequentially through each breadcrumb link.' }
    ],
    ariaRequirements: [
      '<nav aria-label="Breadcrumb">',
      '<ol> ordered list containing <li> items',
      'aria-current="page" on the final link or span'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Tab: Moves sequentially through breadcrumb items'],
      screenReader: 'Announces "Breadcrumbs navigation, list 3 items", and on current item announces "current page".'
    },
    ariaEffort: {
      rating: 'Medium',
      linesOfCode: '~10 lines of HTML',
      summary: 'Clean hybrid pattern requiring only aria-current="page".'
    },
    semanticRequirements: [
      '<nav aria-label="Breadcrumb"><ol><li><a href="...">...</a></li><li><span aria-current="page">...</span></li></ol></nav>',
      '0 lines of JavaScript needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Tab: Moves through links in sequence'],
      screenReader: 'Announces ordered navigation trail and current page step.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '~8 lines of HTML',
      summary: 'Pure HTML list with one ARIA attribute.'
    },
    semanticLimitations: [
      'HTML has no native breadcrumb element or current-page attribute; aria-current="page" is universally required.'
    ],
    cssCustomization: {
      semanticRecipe: `nav[aria-label="Breadcrumb"] ol {
  display: flex;
  gap: 8px;
  list-style: none;
}
nav[aria-label="Breadcrumb"] li + li::before {
  content: "/";
  color: var(--text-muted);
  margin-right: 8px;
}`,
      ariaRecipe: `[aria-current="page"] { font-weight: bold; }`,
      tips: ['Use a <span> with aria-current="page" for the last item rather than an <a> tag to avoid confusing unclickable self-links.']
    },
    apgCode: {
      html: `<!-- Accessible Breadcrumb Structure -->
<nav aria-label="Breadcrumb" class="breadcrumb-trail">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/plain-english/">WCAG 3 Explorer</a></li>
    <li><a href="/plain-english/patterns/" aria-current="page">Pattern Lab</a></li>
  </ol>
</nav>`
    },
    semanticCode: {
      html: `<!-- Same Semantic Implementation -->
<nav aria-label="Breadcrumb" class="breadcrumb-trail">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/plain-english/">WCAG 3 Explorer</a></li>
    <li><span aria-current="page">Pattern Lab</span></li>
  </ol>
</nav>`,
      notes: 'Using a <span> for the current page avoids placing an unclickable or misleading link on the active page.'
    }
  },
  {
    id: 'treeview',
    name: 'Tree View',
    category: 'Application Widgets',
    apgSlug: 'treeview',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/treeview/',
    firstRuleVerdict: 'aria-required',
    verdictLabel: 'ARIA Required for App Trees; Nested Details for Docs',
    semanticElement: 'Nested <details> or ARIA role="tree"',
    summary: 'A hierarchical list with parent and child items that can be expanded and collapsed, typical in IDE file trees and file managers.',
    firstRuleExplanation: 'For true application file explorer widgets, the APG Tree View pattern (role="tree", role="treeitem", aria-expanded) is required to deliver the expected single-tab-stop roving focus and hierarchical arrow navigation (ArrowRight expands/enters child, ArrowLeft collapses/jumps to parent). For simple hierarchical reading documents or site maps, nested <details> and <summary> elements provide an accessible zero-JS alternative.',
    wcagCriteria: [
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' },
      { num: '2.1.1', name: 'Keyboard', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information', 'keyboard-navigation-and-shortcuts'],
    keyboardMatrix: [
      { key: 'Arrow Right', apgAction: 'Expands closed tree item, or moves focus to first child if already open.', semanticAction: 'In <details>, Space/Enter toggles.' },
      { key: 'Arrow Left', apgAction: 'Collapses open tree item, or moves focus to parent item if closed.', semanticAction: 'In <details>, standard cursor navigation.' }
    ],
    ariaRequirements: [
      '<ul role="tree">, <li role="treeitem" aria-expanded="false">, <ul role="group">',
      'Roving tabindex across entire tree hierarchy',
      'ArrowRight: expands or descends into children',
      'ArrowLeft: collapses or ascends to parent',
      'ArrowDown / ArrowUp: moves sequentially through visible items'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Arrow keys navigate tree levels with roving tabindex', 'Enter / Space activates item'],
      screenReader: 'Announces "treeitem, level 1, expanded 1 of 4".'
    },
    ariaEffort: {
      rating: 'Extreme',
      linesOfCode: '~100 lines of recursive JS',
      summary: 'Hierarchical roving tabindex and recursive expand/collapse tracking.'
    },
    semanticRequirements: [
      'Nested <details> and <summary> tags for document trees',
      '0 lines of JavaScript needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Enter / Space: toggles open/closed', 'Tab: moves to next focusable element'],
      screenReader: 'Announces disclosure levels natively.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '~10 lines of HTML',
      summary: 'Zero JS nested document tree.'
    },
    semanticLimitations: [
      'Nested <details> lacks the single-tab-stop roving focus expected in desktop application file managers.'
    ],
    cssCustomization: {
      semanticRecipe: `.nested-details-tree details {
  padding-left: 14px;
}`,
      ariaRecipe: `[role="treeitem"]:focus { outline: 2px solid #a855f7; }`,
      tips: ['For reading content and sitemaps, nested details is vastly simpler and requires zero maintenance.']
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Tree View -->
<ul role="tree" aria-label="Project Files" class="apg-tree">
  <li role="treeitem" aria-expanded="true" tabindex="0">
    <span>📁 src</span>
    <ul role="group">
      <li role="treeitem" tabindex="-1">📄 index.astro</li>
      <li role="treeitem" tabindex="-1">📄 layout.astro</li>
    </ul>
  </li>
</ul>`
    },
    semanticCode: {
      html: `<!-- Semantic Nested Details Tree for Documents -->
<div class="nested-details-tree">
  <details open>
    <summary>📁 src</summary>
    <div class="tree-children">
      <p>📄 index.astro</p>
      <p>📄 layout.astro</p>
    </div>
  </details>
</div>`,
      notes: 'Nested details works without JavaScript, but lacks the single-tab-stop arrow key navigation expected in file trees.'
    }
  },
  {
    id: 'carousel',
    name: 'Carousel',
    category: 'Application Widgets',
    apgSlug: 'carousel',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/carousel/',
    firstRuleVerdict: 'hybrid-enhancement',
    verdictLabel: 'Hybrid: CSS Scroll Snap + Semantic Buttons',
    semanticElement: 'CSS scroll-snap-type + <ol> + <button>',
    summary: 'A rotating or scrollable showcase of cards, images, or slides. Modern CSS Scroll Snap combined with semantic HTML buttons provides a high-performance, touch-friendly alternative to complex ARIA carousels.',
    firstRuleExplanation: 'The APG Carousel pattern involves complex ARIA live regions, role="roledescription", pause/play controls, and tablists. In modern web development, CSS Scroll Snap (scroll-snap-type: x mandatory) allows developers to build native momentum scrolling with GPU acceleration. Semantic <button> elements provide previous/next navigation and announced status without fragile custom DOM math.',
    wcagCriteria: [
      { num: '2.2.2', name: 'Pause, Stop, Hide', level: 'A' },
      { num: '2.1.1', name: 'Keyboard', level: 'A' },
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Tab', apgAction: 'Tabs through slides or controls depending on tablist mode.', semanticAction: 'Tabs sequentially through prev/next buttons and slide items.' }
    ],
    ariaRequirements: [
      '<section role="region" aria-roledescription="carousel" aria-label="...">',
      'Slides marked with role="group" and aria-roledescription="slide"',
      'aria-live="polite" / "off" region container',
      'Pause / resume rotation button (WCAG 2.2.2 requirement)'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Tab moves through slides; pause button stops rotation'],
      screenReader: 'Announces "carousel, slide 1 of 3".'
    },
    ariaEffort: {
      rating: 'High',
      linesOfCode: '~80 lines of JS + CSS',
      summary: 'Complex live region timing and rotation management.'
    },
    semanticRequirements: [
      'Scroll container with CSS scroll-snap-type: x mandatory',
      'Semantic previous / next <button type="button"> elements',
      '0 lines of JavaScript needed for touch swipe and momentum scrolling'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Arrow keys scroll slides natively when scroll container is focused; Tab moves to next button'],
      screenReader: 'Announces native button controls and slide list items.'
    },
    semanticEffort: {
      rating: 'Low (1-2 lines JS)',
      linesOfCode: '~15 lines of HTML + CSS',
      summary: 'CSS Scroll Snap gives GPU-accelerated touch swipe natively.'
    },
    semanticLimitations: [
      'Automatic rotation requires JavaScript (and pause controls to meet WCAG 2.2.2).'
    ],
    cssCustomization: {
      semanticRecipe: `.snap-carousel {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
}
.snap-slide {
  flex: 0 0 100%;
  scroll-snap-align: center;
}`,
      ariaRecipe: `.carousel-slide[aria-hidden="true"] { display: none; }`,
      tips: ['CSS Scroll Snap works on mobile touch devices with zero JS drag math.']
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Carousel -->
<section role="region" aria-roledescription="carousel" aria-label="Featured Highlights">
  <button type="button" class="btn-pause">Pause</button>
  <div class="carousel-items" aria-live="off">
    <div role="group" aria-roledescription="slide" aria-label="1 of 3">Slide 1</div>
  </div>
</section>`
    },
    semanticCode: {
      html: `<!-- Modern CSS Scroll Snap Carousel -->
<div class="snap-carousel-wrapper">
  <div class="snap-scroller" tabindex="0" aria-label="Featured items gallery">
    <div class="snap-slide">Slide 1</div>
    <div class="snap-slide">Slide 2</div>
    <div class="snap-slide">Slide 3</div>
  </div>
  <div class="carousel-nav">
    <button type="button" class="btn-prev" aria-label="Previous slide">‹</button>
    <button type="button" class="btn-next" aria-label="Next slide">›</button>
  </div>
</div>`,
      notes: 'Native CSS scroll snap provides hardware-accelerated swipe on mobile and keyboard arrow scrolling when focused.'
    }
  },
  {
    id: 'alert',
    name: 'Alert',
    category: 'Dialogs & Overlays',
    apgSlug: 'alert',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/alert/',
    firstRuleVerdict: 'hybrid-enhancement',
    verdictLabel: 'Hybrid Enhancement',
    semanticElement: '<output> or role="alert"',
    summary: 'A time-sensitive message that communicates important information to the user without receiving focus. HTML <output> natively maps to a polite live region, while role="alert" provides assertive interruption.',
    firstRuleExplanation: 'For general form feedback and calculated results, the native HTML <output> element provides an automatic live region with role="status" and aria-live="polite". When an urgent error or critical notification requires immediate screen reader interruption, the ARIA role="alert" (equivalent to aria-live="assertive") is specifically required.',
    wcagCriteria: [
      { num: '4.1.3', name: 'Status Messages', level: 'AA' },
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Focus / Tab', apgAction: 'Alerts are NOT focused; screen readers announce automatically.', semanticAction: 'Output elements are not focused; announced via live region.' }
    ],
    ariaRequirements: [
      '<div role="alert"> (or aria-live="assertive" + aria-atomic="true")',
      'Container must exist in DOM before content is dynamically injected'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Not in Tab sequence; does not receive focus'],
      screenReader: 'Immediately interrupts speech to announce alert content.'
    },
    ariaEffort: {
      rating: 'Medium',
      linesOfCode: '~5 lines of JS + HTML',
      summary: 'Requires dynamic DOM node injection into existing live container.'
    },
    semanticRequirements: [
      '<output for="inputs">Feedback text</output>',
      'Natively has role="status" and aria-live="polite"'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Not focusable; passive status container'],
      screenReader: 'Politely announced when output value changes.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '1 line of HTML',
      summary: 'Native HTML output tag.'
    },
    semanticLimitations: [
      '<output> announces politely; it cannot assertively interrupt a screen reader during urgent critical errors (where role="alert" is needed).'
    ],
    cssCustomization: {
      semanticRecipe: `output {
  display: block;
  padding: 10px 14px;
  background: var(--surface-card);
  border-radius: 6px;
}`,
      ariaRecipe: `[role="alert"] { background: rgba(220, 38, 38, 0.2); border: 1px solid #dc2626; }`,
      tips: ['Never place role="alert" on elements with keyboard focus; alerts are designed for passive non-focused announcement.']
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Assertive Alert -->
<div role="alert" class="alert-box" id="apg-alert">
  ⚠️ Critical: Your session will expire in 2 minutes.
</div>`
    },
    semanticCode: {
      html: `<!-- Semantic HTML Output Element -->
<output class="status-box" for="input-field" id="sem-output">
  Changes saved successfully.
</output>`,
      notes: '<output> natively maps to an accessible live region that notifies screen readers when content changes.'
    }
  },
  {
    id: 'tooltip',
    name: 'Tooltip',
    category: 'Dialogs & Overlays',
    apgSlug: 'tooltip',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/',
    firstRuleVerdict: 'hybrid-enhancement',
    verdictLabel: 'Hybrid: ARIA Tooltip + Anchor Positioning',
    semanticElement: 'aria-describedby + Popover API / title',
    summary: 'A contextual popup that displays information describing an element when focused or hovered. Modern CSS Anchor Positioning and Popover API dramatically simplify accessible tooltips.',
    firstRuleExplanation: 'The native HTML title attribute has significant accessibility defects: it does not work on touchscreens, cannot be resized, does not support custom contrast or keyboard delays, and violates WCAG 1.4.13 (Content on Hover or Focus). The APG pattern using aria-describedby and role="tooltip" remains essential, but modern CSS Anchor Positioning (anchor()) and the Popover API (popover="hint") now make the visual anchoring robust and pure CSS.',
    wcagCriteria: [
      { num: '1.4.13', name: 'Content on Hover or Focus', level: 'AA' },
      { num: '4.1.2', name: 'Name, Role, Value', level: 'A' }
    ],
    wcag3Outcomes: ['user-interface-component-information'],
    keyboardMatrix: [
      { key: 'Escape', apgAction: 'Dismisses the tooltip without moving keyboard focus (WCAG 1.4.13).', semanticAction: 'Popover API natively dismisses hint on Esc.' }
    ],
    ariaRequirements: [
      '<button aria-describedby="tip-id">',
      '<div role="tooltip" id="tip-id" hidden>',
      'Event listeners for mouseenter, mouseleave, focus, blur, and Escape key dismissal'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Focus reveals tooltip', 'Escape dismisses tooltip without losing focus (WCAG 1.4.13)'],
      screenReader: 'Reads tooltip text as accessible description after the button label.'
    },
    ariaEffort: {
      rating: 'High',
      linesOfCode: '~40 lines of JS + CSS positioning',
      summary: 'Requires coordinate math to avoid edge clipping and timer management.'
    },
    semanticRequirements: [
      '<button title="Tooltip text"> or popover="hint"',
      '0 lines of JavaScript needed with title'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Hover or focus shows native tooltip in some browsers (unreliable in title)'],
      screenReader: 'Reads title attribute if no other description exists.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS for title)',
      linesOfCode: '1 attribute',
      summary: 'Native title attribute.'
    },
    semanticLimitations: [
      'The HTML title attribute CANNOT be styled with CSS, does not work on mobile touchscreens, cannot be zoomed without page zoom, and cannot be dismissed with Escape in many browsers (violating WCAG 1.4.13).'
    ],
    cssCustomization: {
      semanticRecipe: `/* Modern Anchor Positioning for Tooltips */
.anchor-btn {
  anchor-name: --tip-btn;
}
.modern-tip {
  position: absolute;
  position-anchor: --tip-btn;
  top: anchor(bottom);
  left: anchor(center);
  transform: translateX(-50%);
}`,
      ariaRecipe: `[role="tooltip"] { position: absolute; background: #000; color: #fff; padding: 4px 8px; border-radius: 4px; }`,
      tips: ['Never put essential information only in a tooltip; always ensure primary instructions are visible on screen.']
    },
    apgCode: {
      html: `<!-- W3C APG Accessible Tooltip -->
<button type="button" aria-describedby="tip-delete" class="icon-btn">
  🗑️ Delete
</button>
<div role="tooltip" id="tip-delete" class="apg-tooltip" hidden>
  Permanently remove this entry
</div>`
    },
    semanticCode: {
      html: `<!-- Modern Popover Hint + ARIA Describedby -->
<button type="button" aria-describedby="modern-tip" popovertarget="modern-tip" class="icon-btn">
  🗑️ Delete
</button>
<div id="modern-tip" popover="hint" class="modern-tooltip">
  Permanently remove this entry
</div>`,
      notes: 'Meets WCAG 1.4.13: dismissible via Esc, hoverable (mouse can enter tooltip), and persistent until focus/hover leaves.'
    }
  },
  {
    id: 'toolbar',
    name: 'Toolbar',
    category: 'Application Widgets',
    apgSlug: 'toolbar',
    apgUrl: 'https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/',
    firstRuleVerdict: 'aria-required',
    verdictLabel: 'ARIA Required for Application Toolbars',
    semanticElement: '<fieldset> or <div role="toolbar">',
    summary: 'A collection of commonly used controls arranged in a single tab stop where users navigate with arrow keys.',
    firstRuleExplanation: 'In complex applications (e.g. rich text editors), having 20 formatting buttons create 20 separate Tab stops severely degrades keyboard navigation efficiency. The APG Toolbar pattern groups related controls into a single tab stop: Tab enters the toolbar, Arrow keys navigate between controls, and Tab exits to the next document element.',
    wcagCriteria: [
      { num: '2.1.1', name: 'Keyboard', level: 'A' },
      { num: '2.4.3', name: 'Focus Order', level: 'A' }
    ],
    wcag3Outcomes: ['keyboard-navigation-and-shortcuts', 'focus-order-and-management'],
    keyboardMatrix: [
      { key: 'Tab', apgAction: 'Enters or exits the entire toolbar as a single unified tab stop.', semanticAction: 'Without toolbar, each button is a separate tab stop.' },
      { key: 'Arrow Left / Right', apgAction: 'Moves roving focus between buttons in the toolbar.', semanticAction: 'Does nothing between standard buttons.' }
    ],
    ariaRequirements: [
      '<div role="toolbar" aria-label="Formatting">',
      'Roving tabindex across buttons (first button has tabindex="0", others have tabindex="-1")',
      'ArrowLeft / ArrowRight listeners to cycle focus',
      'Home / End to jump to first / last button'
    ],
    ariaKeyboardAndAt: {
      keyboard: ['Arrow keys navigate toolbar buttons; Tab exits entire toolbar'],
      screenReader: 'Announces "toolbar, Formatting".'
    },
    ariaEffort: {
      rating: 'High',
      linesOfCode: '~40 lines of JS + HTML',
      summary: 'Required for complex applications to prevent Tab key fatigue.'
    },
    semanticRequirements: [
      '<fieldset><legend class="sr-only">Formatting</legend><button>...</button></fieldset>',
      '0 lines of JavaScript needed'
    ],
    semanticKeyboardAndAt: {
      keyboard: ['Each button is an individual Tab stop in standard HTML'],
      screenReader: 'Announces fieldset legend and individual buttons.'
    },
    semanticEffort: {
      rating: 'Minimal (0 JS)',
      linesOfCode: '~5 lines of HTML',
      summary: 'Standard HTML button group.'
    },
    semanticLimitations: [
      'HTML button groups have no built-in roving tabindex; every button requires a Tab press, creating keyboard navigation clutter in tool-dense apps.'
    ],
    cssCustomization: {
      semanticRecipe: `.toolbar-group {
  display: inline-flex;
  gap: 4px;
  background: var(--surface-card);
  padding: 4px;
  border-radius: 6px;
}`,
      ariaRecipe: `[role="toolbar"] button:focus { outline: 2px solid #a855f7; }`,
      tips: ['Use role="toolbar" in rich applications (like text editors or drawing canvases) to keep the tab order clean.']
    },
    apgCode: {
      html: `<!-- W3C APG ARIA Toolbar Pattern -->
<div role="toolbar" aria-label="Text Formatting" class="apg-toolbar">
  <button type="button" tabindex="0" aria-label="Bold"><strong>B</strong></button>
  <button type="button" tabindex="-1" aria-label="Italic"><em>I</em></button>
  <button type="button" tabindex="-1" aria-label="Underline"><u>U</u></button>
</div>`
    },
    semanticCode: {
      html: `<!-- Standard HTML Fieldset (Separate Tab Stops) -->
<fieldset class="toolbar-fieldset">
  <legend class="sr-only">Text Formatting</legend>
  <button type="button"><strong>B</strong></button>
  <button type="button"><em>I</em></button>
  <button type="button"><u>U</u></button>
</fieldset>`,
      notes: 'For simple forms, separate tab stops are acceptable; for rich apps, the APG roving toolbar is essential.'
    }
  },

  {
  "id": "grid",
  "name": "Grid (Data Grid & Editable Tables)",
  "category": "Application Widgets",
  "apgSlug": "grid",
  "apgUrl": "https://www.w3.org/WAI/ARIA/apg/patterns/grid/",
  "firstRuleVerdict": "aria-required",
  "verdictLabel": "ARIA Required for 2D Spreadsheet & Data Grid Navigation",
  "semanticElement": "<table> with interactive cell controls",
  "summary": "A composite interactive widget containing tabular rows and cells navigable in two dimensions using arrow keys. Unlike static HTML tables, a grid treats cells as active focus targets.",
  "firstRuleExplanation": "Under the First Rule of ARIA, HTML <table> is specifically intended for presenting static structured tabular data, where screen readers operate in virtual reading mode. When building an editable spreadsheet or interactive data grid where users need 2D directional arrow-key navigation (Up/Down/Left/Right), cell editing (Enter/F2), and selection models without tabbing through every cell, HTML provides no native equivalent. The APG role=\"grid\", role=\"row\", and role=\"gridcell\" with roving tabindex or aria-activedescendant are required.",
  "wcagCriteria": [
    {
      "num": "4.1.2",
      "name": "Name, Role, Value",
      "level": "A"
    },
    {
      "num": "2.1.1",
      "name": "Keyboard",
      "level": "A"
    },
    {
      "num": "2.1.2",
      "name": "No Keyboard Trap",
      "level": "A"
    },
    {
      "num": "1.3.1",
      "name": "Info and Relationships",
      "level": "A"
    }
  ],
  "wcag3Outcomes": [
    "user-interface-component-information",
    "keyboard-navigation-and-shortcuts",
    "content-structure-and-relationships"
  ],
  "keyboardMatrix": [
    {
      "key": "Right Arrow",
      "apgAction": "Moves focus to next cell in row",
      "semanticAction": "Standard text navigation inside input or reading mode"
    },
    {
      "key": "Left Arrow",
      "apgAction": "Moves focus to previous cell in row",
      "semanticAction": "Standard text navigation inside input or reading mode"
    },
    {
      "key": "Down Arrow",
      "apgAction": "Moves focus to cell in same column of next row",
      "semanticAction": "Standard reading cursor or scroll down"
    },
    {
      "key": "Up Arrow",
      "apgAction": "Moves focus to cell in same column of previous row",
      "semanticAction": "Standard reading cursor or scroll up"
    },
    {
      "key": "Home / End",
      "apgAction": "Moves focus to first / last cell in row",
      "semanticAction": "Moves cursor to start / end of input"
    },
    {
      "key": "Ctrl+Home / Ctrl+End",
      "apgAction": "Moves focus to first / last cell in grid",
      "semanticAction": "Scrolls to top / bottom of page"
    },
    {
      "key": "Enter / F2",
      "apgAction": "Enters edit mode for focused gridcell",
      "semanticAction": "Activates button or submits form"
    },
    {
      "key": "Tab",
      "apgAction": "Moves focus completely out of the grid widget",
      "semanticAction": "Moves focus sequentially to next focusable element"
    }
  ],
  "ariaRequirements": [
    "Container element has role=\"grid\" and aria-label or aria-labelledby.",
    "Row elements have role=\"row\".",
    "Header cells have role=\"columnheader\" or role=\"rowheader\".",
    "Data cells have role=\"gridcell\".",
    "Roving tabindex (tabindex=\"0\" on active cell, tabindex=\"-1\" on all others) or aria-activedescendant on the grid.",
    "Arrow key handlers for 2D cell-by-cell directional navigation.",
    "Enter/F2 toggles edit mode inside editable cells; Escape exits edit mode.",
    "Single Tab stop: Tab moves focus into and out of the composite grid widget."
  ],
  "ariaKeyboardAndAt": {
    "keyboard": [
      "Single Tab stop for entire grid container",
      "Arrow keys (← ↑ → ↓) navigate cells in 2D space",
      "Home / End moves to first / last cell in current row",
      "Enter or F2 activates cell editing mode; Escape cancels"
    ],
    "screenReader": "Announces \"Grid, N rows by M columns, row X, column Y: [content]\". Changes to edit mode announced dynamically."
  },
  "ariaEffort": {
    "rating": "Extreme",
    "linesOfCode": "~150-250 lines of JS + ARIA logic",
    "summary": "2D coordinates tracking, roving tabindex matrix, edit mode state management, and assistive tech coordinate synchronization."
  },
  "semanticRequirements": [
    "Standard <table> element with <thead>, <tbody>, <tr>, <th>, <td>.",
    "Native <input> or <button> inside cells for interactivity.",
    "Scope attributes (scope=\"col\", scope=\"row\") on headers."
  ],
  "semanticKeyboardAndAt": {
    "keyboard": [
      "Tab moves sequentially across every single interactive element in the table",
      "Arrow keys navigate inside individual form inputs rather than across table cells"
    ],
    "screenReader": "Screen reader virtual table navigation (Ctrl+Alt+Arrows in NVDA/JAWS; VO+Arrows in VoiceOver)."
  },
  "semanticEffort": {
    "rating": "Minimal (0 JS)",
    "linesOfCode": "~20 lines of HTML",
    "summary": "Standard native semantic table with embedded form controls."
  },
  "semanticLimitations": [
    "Native tables have no single-tab roving keyboard navigation; every input in every cell is an individual Tab stop, making 50-row tables exhausting to tab through.",
    "No built-in 2D arrow-key cell navigation without custom JavaScript."
  ],
  "cssCustomization": {
    "semanticRecipe": ".data-table-wrap {\n  overflow-x: auto;\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-sm);\n}\n.data-table-wrap table {\n  width: 100%;\n  border-collapse: collapse;\n}\n.data-table-wrap th, .data-table-wrap td {\n  padding: 8px 12px;\n  border-bottom: 1px solid var(--border-subtle);\n}",
    "ariaRecipe": "[role=\"grid\"] [role=\"gridcell\"]:focus-visible {\n  outline: 2px solid var(--accent-blue);\n  outline-offset: -2px;\n  background: rgba(182, 196, 255, 0.15);\n}",
    "tips": [
      "Only use role=\"grid\" when cells are truly interactive or editable (like Airtable or Excel). For read-only data, native <table> is always superior."
    ]
  },
  "apgCode": {
    "html": "<!-- W3C APG ARIA Grid Pattern (Editable / Interactive Table) -->\n<div role=\"grid\" aria-label=\"Project Milestones\" aria-rowcount=\"3\" aria-colcount=\"3\" class=\"apg-grid\">\n  <div role=\"row\" aria-rowindex=\"1\" class=\"grid-row header-row\">\n    <span role=\"columnheader\" aria-colindex=\"1\">Milestone</span>\n    <span role=\"columnheader\" aria-colindex=\"2\">Owner</span>\n    <span role=\"columnheader\" aria-colindex=\"3\">Status</span>\n  </div>\n  <div role=\"row\" aria-rowindex=\"2\" class=\"grid-row\">\n    <span role=\"gridcell\" aria-colindex=\"1\" tabindex=\"0\">WCAG 3 Mapping</span>\n    <span role=\"gridcell\" aria-colindex=\"2\" tabindex=\"-1\">Alex R.</span>\n    <span role=\"gridcell\" aria-colindex=\"3\" tabindex=\"-1\">Complete</span>\n  </div>\n  <div role=\"row\" aria-rowindex=\"3\" class=\"grid-row\">\n    <span role=\"gridcell\" aria-colindex=\"1\" tabindex=\"-1\">Contrast Lab</span>\n    <span role=\"gridcell\" aria-colindex=\"2\" tabindex=\"-1\">Daniel W.</span>\n    <span role=\"gridcell\" aria-colindex=\"3\" tabindex=\"-1\">In Review</span>\n  </div>\n</div>"
  },
  "semanticCode": {
    "html": "<!-- Native HTML Table with Interactive Inputs -->\n<table class=\"semantic-data-table\">\n  <caption class=\"sr-only\">Project Milestones</caption>\n  <thead>\n    <tr>\n      <th scope=\"col\">Milestone</th>\n      <th scope=\"col\">Owner</th>\n      <th scope=\"col\">Status</th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td><input type=\"text\" value=\"WCAG 3 Mapping\" aria-label=\"Milestone 1\"></td>\n      <td><input type=\"text\" value=\"Alex R.\" aria-label=\"Owner 1\"></td>\n      <td>\n        <select aria-label=\"Status 1\">\n          <option selected>Complete</option>\n          <option>In Review</option>\n        </select>\n      </td>\n    </tr>\n  </tbody>\n</table>",
    "notes": "Native HTML table inputs require separate Tab stops for each cell, but require 0 lines of JavaScript."
  }
},

  {
  "id": "listbox",
  "name": "Listbox",
  "category": "Inputs & Controls",
  "apgSlug": "listbox",
  "apgUrl": "https://www.w3.org/WAI/ARIA/apg/patterns/listbox/",
  "firstRuleVerdict": "native-preferred",
  "verdictLabel": "Native Element Preferred",
  "semanticElement": "<select size=\"N\"> or <select multiple>",
  "summary": "A widget that presents a visible, scrollable list of options where users can select one or more items. Native HTML <select size=\"N\"> provides this behavior with zero JavaScript.",
  "firstRuleExplanation": "Under the First Rule of ARIA, HTML provides a native, perfectly accessible listbox using <select size=\"N\"> for single-selection and <select multiple size=\"N\"> for multi-selection. The native element automatically handles keyboard navigation (Arrow keys, Home, End, Shift+Arrows for multi-select, type-ahead character search) and form submission. The APG ARIA pattern requires custom role=\"listbox\", role=\"option\", aria-selected, roving tabindex or aria-activedescendant, and extensive JavaScript.",
  "wcagCriteria": [
    {
      "num": "4.1.2",
      "name": "Name, Role, Value",
      "level": "A"
    },
    {
      "num": "2.1.1",
      "name": "Keyboard",
      "level": "A"
    },
    {
      "num": "1.3.1",
      "name": "Info and Relationships",
      "level": "A"
    }
  ],
  "wcag3Outcomes": [
    "user-interface-component-information",
    "keyboard-navigation-and-shortcuts"
  ],
  "keyboardMatrix": [
    {
      "key": "Down / Up Arrow",
      "apgAction": "Moves focus and selection to next / previous option",
      "semanticAction": "Moves focus and selection natively to next / previous option"
    },
    {
      "key": "Home / End",
      "apgAction": "Moves focus to first / last option",
      "semanticAction": "Moves focus to first / last option"
    },
    {
      "key": "Space",
      "apgAction": "In multi-select, toggles selection of focused option",
      "semanticAction": "In multi-select, toggles option selection"
    },
    {
      "key": "Shift+Down / Up",
      "apgAction": "Extends contiguous selection range in multi-select",
      "semanticAction": "Extends contiguous selection natively"
    },
    {
      "key": "Type-ahead characters",
      "apgAction": "Jumps focus to first option starting with typed key",
      "semanticAction": "Built-in browser type-ahead jump"
    }
  ],
  "ariaRequirements": [
    "Container element has role=\"listbox\", tabindex=\"0\", and aria-label or aria-labelledby.",
    "Child item elements have role=\"option\".",
    "Selected option has aria-selected=\"true\" (unselected have aria-selected=\"false\").",
    "For multi-selection, container has aria-multiselectable=\"true\".",
    "Roving tabindex or aria-activedescendant management in JavaScript."
  ],
  "ariaKeyboardAndAt": {
    "keyboard": [
      "Single Tab stop on listbox container",
      "Arrow keys (↑ / ↓) navigate and select options",
      "Home / End moves to boundaries",
      "Space toggles selection in multi-select mode"
    ],
    "screenReader": "Announces \"Listbox, N items, [Option Name], X of N, selected\"."
  },
  "ariaEffort": {
    "rating": "High",
    "linesOfCode": "~50-80 lines of JS + ARIA",
    "summary": "Selection state management, roving tabindex or aria-activedescendant sync, scrollIntoView positioning, and type-ahead logic."
  },
  "semanticRequirements": [
    "<select size=\"4\"> for single-select scrollable listbox.",
    "<select multiple size=\"4\"> for multi-select listbox.",
    "<option value=\"...\">Option Label</option> tags.",
    "Associated <label for=\"...\">."
  ],
  "semanticKeyboardAndAt": {
    "keyboard": [
      "Arrow keys navigate options natively",
      "Shift+Arrow keys select contiguous ranges in multi-select",
      "Ctrl+Click / Cmd+Click selects non-contiguous items"
    ],
    "screenReader": "Native OS/browser listbox announcements with item count, position, and selected state."
  },
  "semanticEffort": {
    "rating": "Minimal (0 JS)",
    "linesOfCode": "~5 lines of HTML",
    "summary": "Native declarative HTML with built-in form serialization."
  },
  "semanticLimitations": [
    "Custom styling of native <option> elements (such as embedded avatars or custom badge markup) is historically restricted, though modern browser Customizable Select standards are closing this gap."
  ],
  "cssCustomization": {
    "semanticRecipe": ".semantic-listbox {\n  width: 100%;\n  padding: 6px;\n  background: var(--surface-card);\n  border: 1px solid var(--border-default);\n  border-radius: var(--radius-sm);\n  color: var(--text-primary);\n  font-family: inherit;\n}\n.semantic-listbox option {\n  padding: 8px 12px;\n  border-radius: 4px;\n}",
    "ariaRecipe": "[role=\"listbox\"] {\n  border: 1px solid var(--border-default);\n  background: var(--surface-card);\n  border-radius: var(--radius-sm);\n}\n[role=\"option\"][aria-selected=\"true\"] {\n  background: rgba(182, 196, 255, 0.2);\n  color: var(--text-primary);\n}",
    "tips": [
      "Always set size=\"4\" or greater on <select> to render as a listbox rather than a dropdown."
    ]
  },
  "apgCode": {
    "html": "<!-- W3C APG ARIA Listbox Pattern -->\n<div role=\"listbox\" aria-label=\"Conformance Target\" tabindex=\"0\" class=\"apg-listbox-widget\" id=\"apg-lb\">\n  <div role=\"option\" id=\"lb-opt-1\" aria-selected=\"true\" class=\"apg-lb-opt selected\">WCAG 2.2 Level AA</div>\n  <div role=\"option\" id=\"lb-opt-2\" aria-selected=\"false\" class=\"apg-lb-opt\">WCAG 2.2 Level AAA</div>\n  <div role=\"option\" id=\"lb-opt-3\" aria-selected=\"false\" class=\"apg-lb-opt\">WCAG 3.0 Bronze</div>\n  <div role=\"option\" id=\"lb-opt-4\" aria-selected=\"false\" class=\"apg-lb-opt\">WCAG 3.0 Silver</div>\n</div>"
  },
  "semanticCode": {
    "html": "<!-- Native Semantic HTML Listbox -->\n<label for=\"sem-lb\">Conformance Target:</label>\n<select id=\"sem-lb\" size=\"4\" class=\"semantic-listbox\">\n  <option value=\"2.2-aa\" selected>WCAG 2.2 Level AA</option>\n  <option value=\"2.2-aaa\">WCAG 2.2 Level AAA</option>\n  <option value=\"3.0-bronze\">WCAG 3.0 Bronze</option>\n  <option value=\"3.0-silver\">WCAG 3.0 Silver</option>\n</select>",
    "notes": "Native <select size=\"4\"> provides complete scrollable listbox accessibility with zero JavaScript."
  }
},

  {
  "id": "menubar",
  "name": "Menu and Menubar",
  "category": "Navigation",
  "apgSlug": "menubar",
  "apgUrl": "https://www.w3.org/WAI/ARIA/apg/patterns/menubar/",
  "firstRuleVerdict": "hybrid-enhancement",
  "verdictLabel": "Semantic HTML Preferred for Web Navigation",
  "semanticElement": "<nav> + <ul> + <li> + <a> / Popover API",
  "summary": "A desktop-application-style horizontal menu bar with dropdown submenus. For website navigation, semantic <nav> with standard links is strongly preferred over ARIA menubar.",
  "firstRuleExplanation": "The W3C APG explicitly cautions that the ARIA menubar pattern is intended for web applications mimicking desktop software menus (e.g. Google Docs File/Edit/View), NOT for website site navigation bars. Using role=\"menubar\" on site navigation breaks standard tab navigation and hides links from screen reader landmark lists. For site navigation, the First Rule dictates using native <nav> with semantic lists (<ul>/<li>) and standard links (<a>) or Popover API buttons.",
  "wcagCriteria": [
    {
      "num": "4.1.2",
      "name": "Name, Role, Value",
      "level": "A"
    },
    {
      "num": "2.1.1",
      "name": "Keyboard",
      "level": "A"
    },
    {
      "num": "2.4.4",
      "name": "Link Purpose (In Context)",
      "level": "A"
    },
    {
      "num": "1.3.1",
      "name": "Info and Relationships",
      "level": "A"
    }
  ],
  "wcag3Outcomes": [
    "user-interface-component-information",
    "keyboard-navigation-and-shortcuts",
    "navigation-mechanisms"
  ],
  "keyboardMatrix": [
    {
      "key": "Right / Left Arrow",
      "apgAction": "Moves focus to next / previous menuitem in menubar",
      "semanticAction": "Standard reading cursor navigation"
    },
    {
      "key": "Down Arrow",
      "apgAction": "Opens dropdown menu and moves focus to first item",
      "semanticAction": "Standard page scroll"
    },
    {
      "key": "Up Arrow",
      "apgAction": "Cycles up through open submenu items",
      "semanticAction": "Standard page scroll"
    },
    {
      "key": "Escape",
      "apgAction": "Closes open submenu and restores focus to parent menubar item",
      "semanticAction": "Dismisses open Popover / modal"
    },
    {
      "key": "Tab",
      "apgAction": "Moves focus completely out of the menubar widget",
      "semanticAction": "Moves focus sequentially to next navigation link"
    }
  ],
  "ariaRequirements": [
    "Top-level container has role=\"menubar\" with aria-label.",
    "Menu item buttons have role=\"menuitem\" (or menuitemcheckbox / menuitemradio).",
    "Items with submenus have aria-haspopup=\"true\" and aria-expanded=\"false/true\".",
    "Submenus have role=\"menu\" and aria-labelledby.",
    "Arrow-key navigation in two dimensions (horizontal across menubar, vertical inside menus).",
    "Escape dismisses submenus and restores focus to menubar parent."
  ],
  "ariaKeyboardAndAt": {
    "keyboard": [
      "Single Tab stop for entire menubar",
      "Left / Right arrows navigate horizontal menubar items",
      "Down arrow opens submenus and navigates down",
      "Escape closes submenu and returns focus to top level"
    ],
    "screenReader": "Announces \"Menubar, N items\" and \"Menuitem, has submenu, expanded/collapsed\"."
  },
  "ariaEffort": {
    "rating": "Extreme",
    "linesOfCode": "~100-160 lines of JS + ARIA logic",
    "summary": "Bi-directional arrow navigation, submenu positioning, hover/focus intent timers, and Escape key focus restoration."
  },
  "semanticRequirements": [
    "<nav aria-label=\"Site Navigation\"> sectioning element.",
    "Unordered list (<ul>) and list items (<li>) for page structure.",
    "Native links (<a href=\"...\">) for pages.",
    "Optional <button popovertarget=\"...\"> for accessible disclosure submenus."
  ],
  "semanticKeyboardAndAt": {
    "keyboard": [
      "Tab navigates sequentially through every navigation link",
      "Enter activates link or opens popover dropdown"
    ],
    "screenReader": "Announces \"Navigation landmark, list with N items, link, [Link Text]\"."
  },
  "semanticEffort": {
    "rating": "Minimal (0 JS)",
    "linesOfCode": "~15 lines of HTML + CSS",
    "summary": "Semantic HTML markup; zero JavaScript required with Popover API."
  },
  "semanticLimitations": [
    "Hover-only CSS dropdown menus frequently collapse when users navigate with screen magnifiers or switch to keyboard; pairing with Popover API ensures click/Enter persistence."
  ],
  "cssCustomization": {
    "semanticRecipe": ".semantic-nav-list {\n  display: flex;\n  gap: 16px;\n  list-style: none;\n}\n.semantic-nav-list a {\n  color: var(--text-primary);\n  text-decoration: none;\n  font-weight: 600;\n  padding: 6px 10px;\n  border-radius: var(--radius-sm);\n}\n.semantic-nav-list a:hover {\n  background: var(--surface-card-hover);\n  color: var(--accent-blue);\n}",
    "ariaRecipe": "[role=\"menubar\"] {\n  display: flex;\n  background: var(--surface-elevated);\n  border-radius: var(--radius-sm);\n  padding: 4px;\n}\n[role=\"menuitem\"]:focus {\n  background: var(--accent-blue);\n  color: var(--on-accent);\n}",
    "tips": [
      "Never use role=\"menubar\" for website page navigation. Reserve it strictly for application menu bars (like Google Docs or VS Code)."
    ]
  },
  "apgCode": {
    "html": "<!-- W3C APG ARIA Application Menubar Pattern -->\n<div role=\"menubar\" aria-label=\"Editor Menu\" class=\"apg-menubar\" id=\"apg-menubar-demo\">\n  <div role=\"menuitem\" aria-haspopup=\"true\" aria-expanded=\"false\" tabindex=\"0\" class=\"apg-m-item\" id=\"m-file\">\n    File\n    <div role=\"menu\" aria-label=\"File Options\" class=\"apg-submenu\" hidden>\n      <div role=\"menuitem\" tabindex=\"-1\">New Document</div>\n      <div role=\"menuitem\" tabindex=\"-1\">Export PDF</div>\n    </div>\n  </div>\n  <div role=\"menuitem\" tabindex=\"-1\" class=\"apg-m-item\">Edit</div>\n  <div role=\"menuitem\" tabindex=\"-1\" class=\"apg-m-item\">View</div>\n</div>"
  },
  "semanticCode": {
    "html": "<!-- Semantic Web Navigation (Recommended over ARIA Menubar) -->\n<nav aria-label=\"Site Navigation\" class=\"semantic-site-nav\">\n  <ul class=\"semantic-nav-list\">\n    <li><a href=\"/standards/\">Standards</a></li>\n    <li>\n      <button type=\"button\" popovertarget=\"nav-dropdown\" class=\"nav-popover-btn\">\n        Guidelines ▼\n      </button>\n      <div id=\"nav-dropdown\" popover class=\"nav-popover-menu\">\n        <a href=\"/wcag22/\">WCAG 2.2</a>\n        <a href=\"/wcag3/\">WCAG 3.0</a>\n      </div>\n    </li>\n    <li><a href=\"/about/\">About</a></li>\n  </ul>\n</nav>",
    "notes": "Semantic <nav> maintains web link discoverability and standard browser Tab navigation."
  }
},

  {
  "id": "alertdialog",
  "name": "Alert Dialog (Modal Prompt)",
  "category": "Dialogs & Overlays",
  "apgSlug": "alertdialog",
  "apgUrl": "https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/",
  "firstRuleVerdict": "native-preferred",
  "verdictLabel": "Native Element Preferred",
  "semanticElement": "<dialog> with autofocus on Cancel",
  "summary": "A modal dialog that interrupts the user workflow to communicate an urgent message and require immediate confirmation or cancellation (e.g. confirming permanent deletion).",
  "firstRuleExplanation": "Native HTML <dialog> invoked via .showModal() natively traps keyboard focus, renders in the top-layer, dims background content with ::backdrop, handles Escape key dismissal, and restores focus upon closing. For an alert dialog, placing the autofocus attribute on the least destructive button (e.g. Cancel) ensures screen readers immediately announce the message while preventing accidental confirmation.",
  "wcagCriteria": [
    {
      "num": "4.1.2",
      "name": "Name, Role, Value",
      "level": "A"
    },
    {
      "num": "2.1.1",
      "name": "Keyboard",
      "level": "A"
    },
    {
      "num": "2.1.2",
      "name": "No Keyboard Trap",
      "level": "A"
    },
    {
      "num": "2.4.3",
      "name": "Focus Order",
      "level": "A"
    }
  ],
  "wcag3Outcomes": [
    "user-interface-component-information",
    "keyboard-navigation-and-shortcuts",
    "focus-and-input-modalities"
  ],
  "keyboardMatrix": [
    {
      "key": "Tab / Shift+Tab",
      "apgAction": "Cycles focus strictly between buttons inside the dialog",
      "semanticAction": "Cycles focus natively between buttons inside <dialog>"
    },
    {
      "key": "Escape",
      "apgAction": "Closes dialog without performing action",
      "semanticAction": "Fires native cancel event and closes <dialog>"
    },
    {
      "key": "Space / Enter",
      "apgAction": "Activates focused confirmation or cancel button",
      "semanticAction": "Activates focused button or submits dialog form"
    }
  ],
  "ariaRequirements": [
    "Overlay window has role=\"alertdialog\" and aria-modal=\"true\".",
    "aria-labelledby points to dialog title.",
    "aria-describedby points to the alert message body.",
    "Initial focus placed on the least destructive action button (Cancel).",
    "JavaScript focus trap preventing Tab from escaping into main page.",
    "Background marked inert or hidden via aria-hidden=\"true\"."
  ],
  "ariaKeyboardAndAt": {
    "keyboard": [
      "Focus trapped strictly inside alertdialog buttons",
      "Escape cancels and closes",
      "Tab cycles between Cancel and Confirm"
    ],
    "screenReader": "Screen reader automatically reads alert title and description, announcing \"Alert dialog, [Title], [Message], Cancel button, focused\"."
  },
  "ariaEffort": {
    "rating": "High",
    "linesOfCode": "~45 lines of JS + ARIA logic",
    "summary": "Focus trapping, restoring previous active element, Escape listeners, and background inerting."
  },
  "semanticRequirements": [
    "<dialog class=\"alert-dialog\"> element.",
    "autofocus attribute on Cancel button.",
    "Invoked with dialog.showModal()."
  ],
  "semanticKeyboardAndAt": {
    "keyboard": [
      "Native top-layer focus trapping",
      "Escape closes natively with cancel event",
      "Initial focus set via autofocus"
    ],
    "screenReader": "Native top-layer dialog announcement with immediate speech of content."
  },
  "semanticEffort": {
    "rating": "Minimal (1-2 lines JS)",
    "linesOfCode": "1 line JS (dialog.showModal())",
    "summary": "100% native browser focus trap and top-layer rendering."
  },
  "semanticLimitations": [
    "Requires dialog::backdrop CSS styling for custom tint and blur effects."
  ],
  "cssCustomization": {
    "semanticRecipe": ".semantic-alert-dialog {\n  border: 2px solid var(--accent-rose);\n  border-radius: var(--radius-lg);\n  padding: 24px;\n  background: var(--surface-card);\n  color: var(--text-primary);\n  max-width: 440px;\n}\n.semantic-alert-dialog::backdrop {\n  background: rgba(0, 0, 0, 0.7);\n  backdrop-filter: blur(4px);\n}",
    "ariaRecipe": "[role=\"alertdialog\"] {\n  border: 2px solid #ef4444;\n  background: var(--surface-card);\n  border-radius: var(--radius-lg);\n  padding: 24px;\n}",
    "tips": [
      "Always place autofocus on the CANCEL button for destructive alert dialogs so pressing Enter accidentally cannot trigger data loss."
    ]
  },
  "apgCode": {
    "html": "<!-- W3C APG ARIA Alert Dialog Pattern -->\n<div role=\"alertdialog\" aria-modal=\"true\" aria-labelledby=\"ad-title\" aria-describedby=\"ad-desc\" class=\"apg-alert-dialog\">\n  <h3 id=\"ad-title\">Discard Draft?</h3>\n  <p id=\"ad-desc\">You have unsaved changes. If you leave now, your edits will be permanently lost.</p>\n  <div class=\"ad-actions\">\n    <button type=\"button\" class=\"btn-cancel\" id=\"ad-cancel\">Keep Editing</button>\n    <button type=\"button\" class=\"btn-danger\" id=\"ad-confirm\">Discard</button>\n  </div>\n</div>"
  },
  "semanticCode": {
    "html": "<!-- Native HTML <dialog> as Alert Dialog -->\n<dialog id=\"alert-dialog-el\" class=\"semantic-alert-dialog\">\n  <form method=\"dialog\">\n    <h3>Discard Draft?</h3>\n    <p>You have unsaved changes. If you leave now, your edits will be permanently lost.</p>\n    <div class=\"modal-actions\">\n      <button value=\"cancel\" autofocus class=\"demo-btn\">Keep Editing</button>\n      <button value=\"discard\" class=\"demo-btn btn-danger\">Discard</button>\n    </div>\n  </form>\n</dialog>",
    "notes": "Using autofocus on \"Keep Editing\" prevents accidental destructive submission."
  }
},

  {
  "id": "feed",
  "name": "Feed (Dynamic Content Stream)",
  "category": "Structure & Layout",
  "apgSlug": "feed",
  "apgUrl": "https://www.w3.org/WAI/ARIA/apg/patterns/feed/",
  "firstRuleVerdict": "hybrid-enhancement",
  "verdictLabel": "Semantic HTML with Targeted ARIA",
  "semanticElement": "<section aria-label=\"...\"> + <article> stream",
  "summary": "A scrollable list of articles that automatically loads new content as the user scrolls, supporting PageUp/PageDown article-to-article keyboard navigation.",
  "firstRuleExplanation": "Under the First Rule of ARIA, HTML provides the semantic building blocks for dynamic streams using <section> or <main> with child <article> elements. The ARIA role=\"feed\" pattern is an enhancement layered on top of semantic articles that introduces PageUp/PageDown keyboard shortcuts for jumping between article boundaries and aria-busy=\"true\" while fetching new batches.",
  "wcagCriteria": [
    {
      "num": "4.1.2",
      "name": "Name, Role, Value",
      "level": "A"
    },
    {
      "num": "1.3.1",
      "name": "Info and Relationships",
      "level": "A"
    },
    {
      "num": "2.1.1",
      "name": "Keyboard",
      "level": "A"
    }
  ],
  "wcag3Outcomes": [
    "content-structure-and-relationships",
    "keyboard-navigation-and-shortcuts"
  ],
  "keyboardMatrix": [
    {
      "key": "Page Down",
      "apgAction": "Moves focus to next article in the feed",
      "semanticAction": "Standard viewport page scroll"
    },
    {
      "key": "Page Up",
      "apgAction": "Moves focus to previous article in the feed",
      "semanticAction": "Standard viewport page scroll"
    },
    {
      "key": "Ctrl+End",
      "apgAction": "Moves focus to the first focusable element after the feed",
      "semanticAction": "Scrolls to bottom of page"
    },
    {
      "key": "Tab",
      "apgAction": "Navigates through focusable controls inside current article",
      "semanticAction": "Navigates sequentially through controls in articles"
    }
  ],
  "ariaRequirements": [
    "Container has role=\"feed\" and aria-label or aria-labelledby.",
    "Each post item has role=\"article\" and tabindex=\"0\" (or contains focusable heading).",
    "Articles specify aria-posinset and aria-setsize when total count is known.",
    "While new articles are being fetched asynchronously, container has aria-busy=\"true\".",
    "PageUp / PageDown keyboard event listeners to jump focus between articles."
  ],
  "ariaKeyboardAndAt": {
    "keyboard": [
      "PageUp / PageDown moves focus between article boundaries",
      "Tab explores interactive buttons and links within current article",
      "Ctrl+End jumps past the infinite feed"
    ],
    "screenReader": "Announces \"Feed, Article X of Y, [Headline]\". Dynamically announces when new articles are loaded."
  },
  "ariaEffort": {
    "rating": "High",
    "linesOfCode": "~60-90 lines of JS + ARIA logic",
    "summary": "PageUp/PageDown focus management, scroll triggers, aria-busy states, and setsize calculation."
  },
  "semanticRequirements": [
    "<section aria-label=\"Activity Feed\"> or <main>.",
    "Semantic <article> elements with header, time, and content.",
    "IntersectionObserver for progressive infinite scroll."
  ],
  "semanticKeyboardAndAt": {
    "keyboard": [
      "Standard Tab navigation across article interactive controls",
      "Standard spacebar or PageDown viewport scrolling"
    ],
    "screenReader": "Announces section landmark and article landmarks with heading hierarchy."
  },
  "semanticEffort": {
    "rating": "Low",
    "linesOfCode": "~15 lines of JS (IntersectionObserver)",
    "summary": "Standard semantic HTML articles with standard web APIs."
  },
  "semanticLimitations": [
    "Native HTML does not provide keyboard shortcuts to jump directly from article to article; keyboard users must Tab through all controls in an article to reach the next one unless using heading navigation (H key in screen readers)."
  ],
  "cssCustomization": {
    "semanticRecipe": ".semantic-feed {\n  display: flex;\n  flex-direction: column;\n  gap: 16px;\n  max-width: 600px;\n}\n.semantic-feed article {\n  background: var(--surface-card);\n  border: 1px solid var(--border-subtle);\n  border-radius: var(--radius-md);\n  padding: 16px;\n}",
    "ariaRecipe": "[role=\"feed\"] [role=\"article\"]:focus-visible {\n  outline: 2px solid var(--accent-blue);\n  outline-offset: 2px;\n}",
    "tips": [
      "Always provide a keyboard shortcut (like Ctrl+End or an explicit skip link) to allow keyboard users to jump past infinite feeds to footer content."
    ]
  },
  "apgCode": {
    "html": "<!-- W3C APG ARIA Feed Pattern -->\n<div role=\"feed\" aria-label=\"WCAG Updates Feed\" aria-busy=\"false\" class=\"apg-feed\">\n  <article role=\"article\" tabindex=\"0\" aria-posinset=\"1\" aria-setsize=\"2\" class=\"feed-card\">\n    <h4>WCAG 3 Working Draft Published</h4>\n    <p>New reporting-tier conformance model available for public review.</p>\n  </article>\n  <article role=\"article\" tabindex=\"0\" aria-posinset=\"2\" aria-setsize=\"2\" class=\"feed-card\">\n    <h4>APCA Contrast Lab Added</h4>\n    <p>Interactive tool comparing WCAG 2 contrast ratios with WCAG 3 APCA.</p>\n  </article>\n</div>"
  },
  "semanticCode": {
    "html": "<!-- Semantic HTML Feed with Articles -->\n<section aria-label=\"WCAG Updates Stream\" class=\"semantic-feed\">\n  <article class=\"feed-card\">\n    <header><h3>WCAG 3 Working Draft Published</h3></header>\n    <p>New reporting-tier conformance model available for public review.</p>\n  </article>\n  <article class=\"feed-card\">\n    <header><h3>APCA Contrast Lab Added</h3></header>\n    <p>Interactive tool comparing WCAG 2 contrast ratios with WCAG 3 APCA.</p>\n  </article>\n</section>",
    "notes": "Semantic articles provide instant landmark structure for assistive technologies without complex roving tabindex."
  }
},

  {
  "id": "slider-multithumb",
  "name": "Slider (Multi-Thumb Range)",
  "category": "Inputs & Controls",
  "apgSlug": "slider-multithumb",
  "apgUrl": "https://www.w3.org/WAI/ARIA/apg/patterns/slider-multithumb/",
  "firstRuleVerdict": "hybrid-enhancement",
  "verdictLabel": "Semantic Dual Inputs or Hybrid ARIA",
  "semanticElement": "Dual <input type=\"range\"> or paired <input type=\"number\">",
  "summary": "A slider featuring two or more draggable thumbs on a single rail (e.g. minimum and maximum price filter). HTML currently lacks a native dual-range input element.",
  "firstRuleExplanation": "HTML does not yet provide a native <input type=\"range\" multiple> element. The accessible semantic alternative under the First Rule is pairing two native inputs: either two adjacent <input type=\"range\"> sliders (\"Minimum Budget\" and \"Maximum Budget\") or two paired <input type=\"number\"> controls. For a custom single-rail dual-thumb visual presentation, ARIA role=\"slider\" attributes on both handles are required.",
  "wcagCriteria": [
    {
      "num": "4.1.2",
      "name": "Name, Role, Value",
      "level": "A"
    },
    {
      "num": "2.1.1",
      "name": "Keyboard",
      "level": "A"
    },
    {
      "num": "2.5.8",
      "name": "Target Size (Minimum)",
      "level": "AA"
    }
  ],
  "wcag3Outcomes": [
    "user-interface-component-information",
    "keyboard-navigation-and-shortcuts"
  ],
  "keyboardMatrix": [
    {
      "key": "Right / Up Arrow",
      "apgAction": "Increases value of focused thumb (constrained by upper bound)",
      "semanticAction": "Increases native slider value by step"
    },
    {
      "key": "Left / Down Arrow",
      "apgAction": "Decreases value of focused thumb (constrained by lower bound)",
      "semanticAction": "Decreases native slider value by step"
    },
    {
      "key": "Home / End",
      "apgAction": "Sets thumb to minimum / maximum allowed limit",
      "semanticAction": "Sets native slider to min / max value"
    },
    {
      "key": "Tab",
      "apgAction": "Moves focus between the lower thumb and upper thumb",
      "semanticAction": "Moves focus to next input control"
    }
  ],
  "ariaRequirements": [
    "Each thumb has role=\"slider\", tabindex=\"0\", aria-valuenow, aria-valuemin, aria-valuemax.",
    "Explicit labels via aria-label (e.g. \"Minimum Price\" and \"Maximum Price\").",
    "Collision prevention logic: Min thumb cannot exceed Max thumb value.",
    "Active track highlight indicating selected range between the two thumbs."
  ],
  "ariaKeyboardAndAt": {
    "keyboard": [
      "Tab moves between Min Thumb and Max Thumb",
      "Arrow keys adjust focused thumb position",
      "Home / End moves to permitted extremes"
    ],
    "screenReader": "Announces \"Minimum price slider, $X, min $Y, max $Z\" and \"Maximum price slider, $A\"."
  },
  "ariaEffort": {
    "rating": "High",
    "linesOfCode": "~80-120 lines of JS + ARIA logic",
    "summary": "Dual thumb coordinate math, collision boundary checks, touch/mouse drag handlers, and twin ARIA state synchronization."
  },
  "semanticRequirements": [
    "Two <input type=\"range\"> elements with explicit <label> tags (Min & Max).",
    "Or two <input type=\"number\"> controls with min/max bounds."
  ],
  "semanticKeyboardAndAt": {
    "keyboard": [
      "Native arrow key increments and Home/End on individual range sliders",
      "Tab moves between the two inputs"
    ],
    "screenReader": "Native range slider announcements with complete browser accessibility."
  },
  "semanticEffort": {
    "rating": "Low",
    "linesOfCode": "~10 lines of HTML + 5 lines JS",
    "summary": "Two standard HTML range inputs with light synchronization logic."
  },
  "semanticLimitations": [
    "HTML has no single native control that paints two thumbs on one track; rendering a visual dual-thumb slider requires custom CSS or overlaying two transparent sliders."
  ],
  "cssCustomization": {
    "semanticRecipe": ".dual-range-group {\n  display: flex;\n  flex-direction: column;\n  gap: 8px;\n}\n.dual-range-group input[type=\"range\"] {\n  accent-color: var(--accent-emerald);\n}",
    "ariaRecipe": ".apg-range-rail {\n  position: relative;\n  height: 8px;\n  background: var(--surface-elevated);\n  border-radius: 4px;\n}\n.apg-range-thumb {\n  position: absolute;\n  width: 22px;\n  height: 22px;\n  background: #a855f7;\n  border: 2px solid #fff;\n  border-radius: 50%;\n  top: 50%;\n  transform: translate(-50%, -50%);\n}",
    "tips": [
      "Always provide numeric text readouts next to multi-thumb sliders so users know exact current values without having to calculate thumb pixel offsets."
    ]
  },
  "apgCode": {
    "html": "<!-- W3C APG ARIA Multi-Thumb Range Slider -->\n<div class=\"apg-multi-slider\">\n  <div class=\"slider-readout\">Budget: $<span id=\"min-val\">20</span> - $<span id=\"max-val\">80</span></div>\n  <div class=\"range-rail\" id=\"multi-rail\">\n    <div class=\"range-fill\" id=\"multi-fill\" style=\"left: 20%; width: 60%;\"></div>\n    <div role=\"slider\" tabindex=\"0\" aria-label=\"Minimum Budget\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-valuenow=\"20\" class=\"thumb thumb-min\" id=\"thumb-min\" style=\"left: 20%;\"></div>\n    <div role=\"slider\" tabindex=\"0\" aria-label=\"Maximum Budget\" aria-valuemin=\"0\" aria-valuemax=\"100\" aria-valuenow=\"80\" class=\"thumb thumb-max\" id=\"thumb-max\" style=\"left: 80%;\"></div>\n  </div>\n</div>"
  },
  "semanticCode": {
    "html": "<!-- Semantic HTML Paired Range Inputs -->\n<fieldset class=\"semantic-range-pair\">\n  <legend>Budget Range ($):</legend>\n  <label>Min: <input type=\"range\" id=\"sem-min\" min=\"0\" max=\"100\" value=\"20\"></label>\n  <label>Max: <input type=\"range\" id=\"sem-max\" min=\"0\" max=\"100\" value=\"80\"></label>\n</fieldset>",
    "notes": "Separate labeled range inputs work 100% natively on every mobile and desktop browser without JavaScript."
  }
},

  {
  "id": "treegrid",
  "name": "Treegrid (Hierarchical Data Grid)",
  "category": "Application Widgets",
  "apgSlug": "treegrid",
  "apgUrl": "https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/",
  "firstRuleVerdict": "aria-required",
  "verdictLabel": "ARIA Required for Hierarchical 2D Grid",
  "semanticElement": "<table> + nested <details> (Document only)",
  "summary": "A composite widget combining a tree view and a data grid, presenting hierarchical tabular data with expandable rows and 2D cell keyboard navigation.",
  "firstRuleExplanation": "HTML does not support a native hierarchical grid with row expansion and 2D cell arrow-key navigation. While nested <table> inside <details> can display hierarchical data statically, an application treegrid where users navigate cells across parent and child rows requires role=\"treegrid\", role=\"row\", aria-expanded, aria-level, and role=\"gridcell\".",
  "wcagCriteria": [
    {
      "num": "4.1.2",
      "name": "Name, Role, Value",
      "level": "A"
    },
    {
      "num": "1.3.1",
      "name": "Info and Relationships",
      "level": "A"
    },
    {
      "num": "2.1.1",
      "name": "Keyboard",
      "level": "A"
    }
  ],
  "wcag3Outcomes": [
    "user-interface-component-information",
    "keyboard-navigation-and-shortcuts",
    "content-structure-and-relationships"
  ],
  "keyboardMatrix": [
    {
      "key": "Arrow keys (← ↑ → ↓)",
      "apgAction": "2D navigation between cells across parent and child rows",
      "semanticAction": "Standard text/input navigation"
    },
    {
      "key": "Right Arrow",
      "apgAction": "On collapsed parent row, expands child rows",
      "semanticAction": "Standard cursor navigation"
    },
    {
      "key": "Left Arrow",
      "apgAction": "On expanded parent row, collapses child rows; on child, moves to parent",
      "semanticAction": "Standard cursor navigation"
    },
    {
      "key": "Enter",
      "apgAction": "Enters edit mode for focused cell or triggers action",
      "semanticAction": "Activates control"
    }
  ],
  "ariaRequirements": [
    "Container has role=\"treegrid\" and aria-label.",
    "Rows have role=\"row\", aria-level=\"1/2/3\", and aria-setsize.",
    "Expandable parent rows have aria-expanded=\"true/false\".",
    "Cells have role=\"gridcell\" with roving tabindex.",
    "Two-dimensional directional arrow key handling."
  ],
  "ariaKeyboardAndAt": {
    "keyboard": [
      "Single Tab stop for entire treegrid container",
      "Arrow keys navigate in 2D space across rows and columns",
      "Right / Left arrows expand and collapse hierarchical rows"
    ],
    "screenReader": "Announces \"Treegrid, row X of Y, level Z, expanded/collapsed, column Name: [value]\"."
  },
  "ariaEffort": {
    "rating": "Extreme",
    "linesOfCode": "~180-260 lines of JS + ARIA logic",
    "summary": "Hierarchical node tree management, row collapse/reveal animations, 2D matrix navigation, and aria-level sync."
  },
  "semanticRequirements": [
    "Standard <table> with indented text or nested <details> elements inside cells."
  ],
  "semanticKeyboardAndAt": {
    "keyboard": [
      "Tab navigates sequentially through disclosure triggers and links",
      "Space toggles <details> open/closed"
    ],
    "screenReader": "Announces standard table with nested disclosure widgets."
  },
  "semanticEffort": {
    "rating": "Minimal (0 JS)",
    "linesOfCode": "~25 lines of HTML",
    "summary": "HTML table with nested details; static document structure."
  },
  "semanticLimitations": [
    "Native tables have no semantic concept of row hierarchy or child levels, and cannot support 2D arrow-key grid navigation."
  ],
  "cssCustomization": {
    "semanticRecipe": ".treegrid-sem-table {\n  width: 100%;\n  border-collapse: collapse;\n}\n.treegrid-sem-table td {\n  padding: 8px 12px;\n  border-bottom: 1px solid var(--border-subtle);\n}",
    "ariaRecipe": "[role=\"treegrid\"] [role=\"gridcell\"]:focus-visible {\n  outline: 2px solid var(--accent-blue);\n  background: rgba(182, 196, 255, 0.15);\n}",
    "tips": [
      "Only implement role=\"treegrid\" for complex enterprise data management (like file explorers with metadata columns or accounting workbooks)."
    ]
  },
  "apgCode": {
    "html": "<!-- W3C APG ARIA Treegrid Pattern -->\n<div role=\"treegrid\" aria-label=\"Directory Treegrid\" class=\"apg-treegrid\">\n  <div role=\"row\" aria-rowindex=\"1\" class=\"tg-row tg-header\">\n    <span role=\"columnheader\">Name</span>\n    <span role=\"columnheader\">Type</span>\n    <span role=\"columnheader\">Size</span>\n  </div>\n  <div role=\"row\" aria-rowindex=\"2\" aria-level=\"1\" aria-expanded=\"true\" class=\"tg-row\">\n    <span role=\"gridcell\" tabindex=\"0\">📂 src/</span>\n    <span role=\"gridcell\" tabindex=\"-1\">Folder</span>\n    <span role=\"gridcell\" tabindex=\"-1\">--</span>\n  </div>\n  <div role=\"row\" aria-rowindex=\"3\" aria-level=\"2\" class=\"tg-row tg-child\">\n    <span role=\"gridcell\" tabindex=\"-1\">📄 index.astro</span>\n    <span role=\"gridcell\" tabindex=\"-1\">Astro</span>\n    <span role=\"gridcell\" tabindex=\"-1\">12 KB</span>\n  </div>\n</div>"
  },
  "semanticCode": {
    "html": "<!-- Semantic HTML Table with Details for Hierarchy -->\n<table class=\"semantic-tree-table\">\n  <thead>\n    <tr><th>Name</th><th>Type</th><th>Size</th></tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td colspan=\"3\">\n        <details open>\n          <summary>📂 src/</summary>\n          <table>\n            <tr><td>📄 index.astro</td><td>Astro</td><td>12 KB</td></tr>\n          </table>\n        </details>\n      </td>\n    </tr>\n  </tbody>\n</table>",
    "notes": "Nested details works for document disclosure, but lacks 2D arrow-key roving focus."
  }
},

  {
  "id": "windowsplitter",
  "name": "Window Splitter (Resizable Split Pane)",
  "category": "Application Widgets",
  "apgSlug": "windowsplitter",
  "apgUrl": "https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/",
  "firstRuleVerdict": "hybrid-enhancement",
  "verdictLabel": "Hybrid CSS / ARIA Splitter",
  "semanticElement": "CSS resize property or <input type=\"range\"> controlling flex",
  "summary": "A movable separator between two panes that enables keyboard and mouse resizing of adjacent layout areas.",
  "firstRuleExplanation": "For simple layout resizing, modern CSS provides resize: horizontal with overflow: auto natively without any ARIA. For rich interactive application split panes, the ARIA separator pattern (role=\"separator\", tabindex=\"0\", aria-valuenow, aria-valuemin, aria-valuemax) communicates pane dimensions to screen readers and enables arrow key resizing. Alternatively, an accessible <input type=\"range\"> labeled \"Pane Divider\" can semantically control flex-basis.",
  "wcagCriteria": [
    {
      "num": "4.1.2",
      "name": "Name, Role, Value",
      "level": "A"
    },
    {
      "num": "2.1.1",
      "name": "Keyboard",
      "level": "A"
    },
    {
      "num": "2.5.7",
      "name": "Dragging Movements",
      "level": "AA"
    }
  ],
  "wcag3Outcomes": [
    "user-interface-component-information",
    "keyboard-navigation-and-shortcuts"
  ],
  "keyboardMatrix": [
    {
      "key": "Left / Up Arrow",
      "apgAction": "Decreases pane size by 5% increments",
      "semanticAction": "Standard range slider decrease or cursor movement"
    },
    {
      "key": "Right / Down Arrow",
      "apgAction": "Increases pane size by 5% increments",
      "semanticAction": "Standard range slider increase or cursor movement"
    },
    {
      "key": "Home / End",
      "apgAction": "Resizes pane to minimum / maximum permitted boundary",
      "semanticAction": "Moves range slider to min / max"
    },
    {
      "key": "Enter",
      "apgAction": "Toggles pane between collapsed and default width",
      "semanticAction": "Submits form or activates control"
    }
  ],
  "ariaRequirements": [
    "Divider element has role=\"separator\" and tabindex=\"0\".",
    "aria-valuenow, aria-valuemin, aria-valuemax defining current and allowed percentage/pixel size.",
    "aria-orientation=\"vertical\" (for horizontal divider) or \"horizontal\" (for vertical divider).",
    "aria-controls referencing the ID of the pane being resized.",
    "Arrow key handlers for keyboard resizing and pointer event drag listeners."
  ],
  "ariaKeyboardAndAt": {
    "keyboard": [
      "Tab moves focus to the window splitter divider",
      "Arrow keys (← / →) resize the adjacent panes",
      "Home / End collapses or expands to bounds",
      "Enter toggles default width"
    ],
    "screenReader": "Announces \"Splitter, N percent, min X, max Y\"."
  },
  "ariaEffort": {
    "rating": "High",
    "linesOfCode": "~70-110 lines of JS + ARIA logic",
    "summary": "Pointer drag listeners, percentage calculations, min/max bounding, aria-valuenow updates, and keyboard handlers."
  },
  "semanticRequirements": [
    "CSS resize: horizontal; overflow: auto; on container pane.",
    "Or semantic <input type=\"range\" aria-label=\"Pane divider\"> controlling flex-basis in CSS."
  ],
  "semanticKeyboardAndAt": {
    "keyboard": [
      "Native range slider arrow keys for keyboard resizing"
    ],
    "screenReader": "Native range slider announcement."
  },
  "semanticEffort": {
    "rating": "Minimal (0 JS for CSS; ~5 lines JS for flex range)",
    "linesOfCode": "3 lines CSS (resize: horizontal)",
    "summary": "Modern CSS resize property on layout containers."
  },
  "semanticLimitations": [
    "CSS resize: horizontal renders a bottom-right corner gripper that is not keyboard operable without pairing with an accessible range input control."
  ],
  "cssCustomization": {
    "semanticRecipe": ".css-resizable-pane {\n  resize: horizontal;\n  overflow: auto;\n  min-width: 120px;\n  max-width: 400px;\n  border: 1px solid var(--border-default);\n  padding: 12px;\n  background: var(--surface-card);\n}",
    "ariaRecipe": "[role=\"separator\"][aria-orientation=\"vertical\"] {\n  width: 8px;\n  cursor: col-resize;\n  background: var(--border-default);\n  transition: background 0.2s;\n}\n[role=\"separator\"]:focus-visible {\n  outline: 2px solid var(--accent-blue);\n  background: var(--accent-blue);\n}",
    "tips": [
      "Always satisfy WCAG 2.2 SC 2.5.7 (Dragging Movements) by providing arrow keys or step buttons alongside mouse drag gestures on splitters."
    ]
  },
  "apgCode": {
    "html": "<!-- W3C APG ARIA Window Splitter Pattern -->\n<div class=\"apg-split-container\">\n  <div class=\"pane pane-left\" id=\"pane-1\" style=\"width: 40%;\">Primary Navigation</div>\n  <div role=\"separator\" tabindex=\"0\" aria-orientation=\"vertical\" aria-valuenow=\"40\" aria-valuemin=\"15\" aria-valuemax=\"85\" aria-controls=\"pane-1\" aria-label=\"Resize Navigation Pane\" class=\"apg-splitter-handle\" id=\"apg-splitter\"></div>\n  <div class=\"pane pane-right\" id=\"pane-2\" style=\"width: 60%;\">Main Workspace</div>\n</div>"
  },
  "semanticCode": {
    "html": "<!-- Modern CSS Resizable Pane with Semantic Range Fallback -->\n<div class=\"css-split-layout\">\n  <div class=\"css-resizable-pane\">\n    <p>Resizable Navigation (Drag bottom-right corner)</p>\n  </div>\n  <div class=\"main-content-pane\">\n    <p>Main Workspace</p>\n  </div>\n</div>",
    "notes": "CSS resize: horizontal enables native browser engine resizing without JavaScript."
  }
}
];
