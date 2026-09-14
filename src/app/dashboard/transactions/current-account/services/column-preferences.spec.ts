import { beforeEach, describe, expect, it } from "vitest";
import {
  ALL_DEBTORS_COLUMNS_STORAGE_KEY,
  clearStoredAllDebtorsColumns,
  mergeColumnPreferences,
  readStoredAllDebtorsColumns,
} from "./column-preferences";

/**
 * QUI-17 §5 / §8.5 — que nadie pierda su configuración cuando la grilla pasa
 * de 7 a 19 columnas.
 */
describe("mergeColumnPreferences (QUI-17 §5)", () => {
  const defaults = [
    { name: "debtor", is_visible: true },
    { name: "days_overdue", is_visible: true },
    { name: "debtor_dni", is_visible: false },
    { name: "phase", is_visible: true },
  ];

  it("usa los defaults cuando no hay nada guardado", () => {
    expect(mergeColumnPreferences(defaults, null)).toEqual(defaults);
    expect(mergeColumnPreferences(defaults, undefined)).toEqual(defaults);
    expect(mergeColumnPreferences(defaults, [])).toEqual(defaults);
  });

  it("respeta lo que el usuario había elegido en las columnas conocidas", () => {
    const merged = mergeColumnPreferences(defaults, [
      { name: "debtor", is_visible: false },
      { name: "debtor_dni", is_visible: true },
    ]);

    expect(merged).toEqual([
      { name: "debtor", is_visible: false },
      { name: "days_overdue", is_visible: true },
      { name: "debtor_dni", is_visible: true },
      { name: "phase", is_visible: true },
    ]);
  });

  it("las columnas nuevas entran con su valor por defecto, no invisibles", () => {
    // Lo guardado es la lista vieja de 7: no menciona days_overdue ni phase.
    const merged = mergeColumnPreferences(defaults, [
      { name: "debtor", is_visible: true },
    ]);

    expect(merged.find((c) => c.name === "days_overdue")?.is_visible).toBe(
      true
    );
    expect(merged.find((c) => c.name === "phase")?.is_visible).toBe(true);
    expect(merged.find((c) => c.name === "debtor_dni")?.is_visible).toBe(false);
  });

  it("descarta columnas guardadas que ya no existen, como la vieja 'document'", () => {
    const merged = mergeColumnPreferences(defaults, [
      { name: "document", is_visible: true },
      { name: "debtor", is_visible: false },
    ]);

    expect(merged.map((c) => c.name)).toEqual([
      "debtor",
      "days_overdue",
      "debtor_dni",
      "phase",
    ]);
  });

  it("mantiene el orden de los defaults, que es el orden del pedido", () => {
    const merged = mergeColumnPreferences(defaults, [
      { name: "phase", is_visible: false },
      { name: "debtor", is_visible: false },
    ]);

    expect(merged.map((c) => c.name)).toEqual(defaults.map((c) => c.name));
  });

  it("ignora entradas corruptas en vez de romper la grilla", () => {
    const merged = mergeColumnPreferences(defaults, [
      { name: "debtor", is_visible: "sí" },
      { name: 42, is_visible: true },
      null,
    ] as never);

    expect(merged).toEqual(defaults);
  });

  it("no muta la lista de defaults", () => {
    const copia = JSON.parse(JSON.stringify(defaults));
    mergeColumnPreferences(defaults, [{ name: "debtor", is_visible: false }]);
    expect(defaults).toEqual(copia);
  });
});

describe("rescate desde localStorage (QUI-17 §8.5)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("devuelve null cuando no hay nada guardado en el navegador", () => {
    expect(readStoredAllDebtorsColumns()).toBeNull();
  });

  it("lee la configuración vieja del navegador", () => {
    window.localStorage.setItem(
      ALL_DEBTORS_COLUMNS_STORAGE_KEY,
      JSON.stringify([{ name: "debtor", is_visible: false }])
    );

    expect(readStoredAllDebtorsColumns()).toEqual([
      { name: "debtor", is_visible: false },
    ]);
  });

  it("devuelve null si lo guardado está corrupto, sin lanzar", () => {
    window.localStorage.setItem(ALL_DEBTORS_COLUMNS_STORAGE_KEY, "{no-json");
    expect(readStoredAllDebtorsColumns()).toBeNull();
  });

  it("devuelve null si lo guardado no es una lista", () => {
    window.localStorage.setItem(
      ALL_DEBTORS_COLUMNS_STORAGE_KEY,
      JSON.stringify({ debtor: true })
    );
    expect(readStoredAllDebtorsColumns()).toBeNull();
  });

  it("borra la clave: el rescate es de una sola pasada", () => {
    window.localStorage.setItem(
      ALL_DEBTORS_COLUMNS_STORAGE_KEY,
      JSON.stringify([{ name: "debtor", is_visible: false }])
    );

    clearStoredAllDebtorsColumns();

    expect(
      window.localStorage.getItem(ALL_DEBTORS_COLUMNS_STORAGE_KEY)
    ).toBeNull();
    expect(readStoredAllDebtorsColumns()).toBeNull();
  });
});
