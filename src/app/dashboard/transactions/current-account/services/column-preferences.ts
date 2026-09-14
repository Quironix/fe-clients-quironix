import { TableColumnPreference } from "@/context/ProfileContext";

/**
 * QUI-17 §5 / §8.5 — de donde salen las columnas que ve el usuario.
 *
 * Funciones puras (salvo el rescate de localStorage, que es explicito) para que
 * la regla se pueda testear sin montar la pantalla.
 */

/** Clave vieja: la preferencia de la vista consolidada vivia en el navegador. */
export const ALL_DEBTORS_COLUMNS_STORAGE_KEY =
  "current_account_all_debtors_columns";

/**
 * Mezcla lo que el usuario tenia guardado contra la lista de defaults.
 *
 * DEFAULT_ALL_DEBTORS_COLUMNS paso de 7 a 19 entradas, pero lo guardado de
 * antes es una lista de 7. Si se usara tal cual, las columnas nuevas quedarian
 * invisibles y ni siquiera apareceran en el selector.
 *
 * Por eso: manda el orden de los defaults (es el orden del pedido), las
 * columnas conocidas conservan la preferencia del usuario, las que no esten en
 * lo guardado entran con su valor por defecto, y las guardadas que ya no
 * existen — como la vieja "document", partida en document_type + number — se
 * descartan.
 */
export function mergeColumnPreferences(
  defaults: TableColumnPreference[],
  saved: TableColumnPreference[] | null | undefined
): TableColumnPreference[] {
  if (!Array.isArray(saved) || saved.length === 0) return defaults;

  const savedByName = new Map<string, boolean>();
  for (const column of saved) {
    if (
      column &&
      typeof column.name === "string" &&
      typeof column.is_visible === "boolean"
    ) {
      savedByName.set(column.name, column.is_visible);
    }
  }

  if (savedByName.size === 0) return defaults;

  return defaults.map((column) => ({
    name: column.name,
    is_visible: savedByName.has(column.name)
      ? (savedByName.get(column.name) as boolean)
      : column.is_visible,
  }));
}

/**
 * Lee la preferencia vieja del navegador, si quedo alguna.
 *
 * Existe solo para que nadie pierda lo que ya habia configurado en la vista
 * consolidada cuando esto vivia en localStorage. Es de una sola pasada: el
 * llamador la sube al perfil y despues llama a clearStoredAllDebtorsColumns.
 */
export function readStoredAllDebtorsColumns(): TableColumnPreference[] | null {
  try {
    const stored = window.localStorage.getItem(ALL_DEBTORS_COLUMNS_STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? (parsed as TableColumnPreference[]) : null;
  } catch {
    // almacenamiento no disponible o JSON corrupto: se ignora
    return null;
  }
}

export function clearStoredAllDebtorsColumns(): void {
  try {
    window.localStorage.removeItem(ALL_DEBTORS_COLUMNS_STORAGE_KEY);
  } catch {
    // almacenamiento no disponible: se ignora
  }
}
