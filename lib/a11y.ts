// Accessibility utilities

// Focus management
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleTabKey(e: KeyboardEvent) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  }

  element.addEventListener('keydown', handleTabKey);
  
  // Return cleanup function
  return () => {
    element.removeEventListener('keydown', handleTabKey);
  };
}

// ARIA live region for announcements
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

// Keyboard navigation helpers
export function handleArrowKeys(
  event: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  orientation: 'horizontal' | 'vertical' = 'horizontal'
) {
  const isHorizontal = orientation === 'horizontal';
  const isVertical = orientation === 'vertical';
  
  let newIndex = currentIndex;
  
  if (isHorizontal) {
    if (event.key === 'ArrowLeft') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    } else if (event.key === 'ArrowRight') {
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    }
  } else if (isVertical) {
    if (event.key === 'ArrowUp') {
      newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
    } else if (event.key === 'ArrowDown') {
      newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
    }
  }
  
  if (newIndex !== currentIndex) {
    event.preventDefault();
    items[newIndex]?.focus();
    return newIndex;
  }
  
  return currentIndex;
}

// Carousel accessibility
export function setupCarouselAccessibility(
  container: HTMLElement,
  items: HTMLElement[],
  currentIndex: number,
  onIndexChange: (index: number) => void
) {
  container.setAttribute('role', 'region');
  container.setAttribute('aria-label', 'Carousel');
  
  items.forEach((item, index) => {
    item.setAttribute('role', 'group');
    item.setAttribute('aria-roledescription', 'slide');
    item.setAttribute('aria-label', `${index + 1} of ${items.length}`);
    
    if (index === currentIndex) {
      item.setAttribute('aria-hidden', 'false');
    } else {
      item.setAttribute('aria-hidden', 'true');
    }
  });
  
  // Update ARIA attributes when index changes
  const updateAriaAttributes = (newIndex: number) => {
    items.forEach((item, index) => {
      if (index === newIndex) {
        item.setAttribute('aria-hidden', 'false');
        item.setAttribute('aria-current', 'true');
      } else {
        item.setAttribute('aria-hidden', 'true');
        item.removeAttribute('aria-current');
      }
    });
  };
  
  return updateAriaAttributes;
}

// Modal accessibility
export function setupModalAccessibility(modal: HTMLElement, onClose: () => void) {
  // Set ARIA attributes
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  
  // Focus management
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  ) as NodeListOf<HTMLElement>;
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  
  // Focus first element
  firstElement?.focus();
  
  // Trap focus
  const cleanup = trapFocus(modal);
  
  // Handle Escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  modal.addEventListener('keydown', handleEscape);
  
  // Return cleanup function
  return () => {
    cleanup();
    modal.removeEventListener('keydown', handleEscape);
  };
}

// Skip link functionality
export function createSkipLink(targetId: string, text: string = 'Skip to main content') {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md z-50';
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView();
    }
  });
  
  return skipLink;
}

// Color contrast utilities
export function getContrastRatio(color1: string, color2: string): number {
  // Simplified contrast ratio calculation
  // In a real implementation, you'd want to use a proper color contrast library
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const luminance1 = getLuminance(rgb1);
  const luminance2 = getLuminance(rgb2);
  
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

function getLuminance(rgb: { r: number; g: number; b: number }): number {
  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Screen reader only class
export const srOnly = 'sr-only';
export const focusNotSrOnly = 'focus:not-sr-only focus:absolute focus:top-4 focus:left-4';

// High contrast mode detection
export function isHighContrastMode(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-contrast: high)').matches ||
         window.matchMedia('(prefers-contrast: more)').matches;
}

// Reduced motion detection
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Focus visible detection
export function supportsFocusVisible(): boolean {
  if (typeof window === 'undefined') return false;
  
  return CSS.supports('selector(:focus-visible)');
}

