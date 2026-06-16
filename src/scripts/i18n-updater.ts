/**
 * Script para actualizar dinámicamente el contenido traducido
 * cuando el usuario cambia de idioma sin recargar la página
 */
import i18n from '../i18n/config';

// Mapa de elementos con sus claves de traducción
const translationMap = new Map<Element, string>();

/**
 * Registra un elemento para traducción automática
 */
export function registerTranslation(element: Element, key: string) {
  translationMap.set(element, key);
  updateElement(element, key);
}

/**
 * Actualiza el contenido de un elemento con la traducción actual
 */
function updateElement(element: Element, key: string) {
  const translation = i18n.t(key);
  if (element.getAttribute('data-html') === 'true') {
    element.innerHTML = translation;
  } else {
    element.textContent = translation;
  }
}

/**
 * Actualiza un placeholder de input
 */
function updatePlaceholder(element: Element, key: string) {
  const translation = i18n.t(key);
  if (element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement) {
    element.placeholder = translation;
  }
}

/**
 * Actualiza todos los elementos registrados
 */
function updateAllElements() {
  translationMap.forEach((key, element) => {
    updateElement(element, key);
  });
}

/**
 * Actualiza todos los placeholders
 */
function updateAllPlaceholders() {
  document.querySelectorAll('[data-i18n-placeholder]').forEach((element) => {
    const key = element.getAttribute('data-i18n-placeholder');
    if (key) {
      updatePlaceholder(element, key);
    }
  });
}

/**
 * Inicializa el sistema de traducción dinámica
 */
export function initDynamicTranslations() {
  // Escuchar cambios de idioma
  const handleLanguageChange = () => {
    updateAllElements();
    updateAllPlaceholders();
  };

  window.addEventListener('languageChanged', handleLanguageChange);
  i18n.on('languageChanged', handleLanguageChange);

  // Buscar y registrar elementos con data-i18n
  document.querySelectorAll('[data-i18n]').forEach((element) => {
    const key = element.getAttribute('data-i18n');
    if (key) {
      registerTranslation(element, key);
    }
  });

  // Actualizar placeholders iniciales
  updateAllPlaceholders();
}

// Auto-inicializar cuando el DOM esté listo
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDynamicTranslations);
  } else {
    initDynamicTranslations();
  }
}
