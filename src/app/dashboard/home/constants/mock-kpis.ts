/* KPI cards ported verbatim from the index-v2.html UX Lab mockup
   (DATA.kpis.manager / .jefe / .ejecutivo). The backend doesn't expose all of
   these metrics yet — until it does, these render with illustrative values so
   the dashboard matches the approved design exactly. */

export type KpiViz = "fill" | "trend" | "gauge" | "share" | "tally";
export type KpiTone = "good" | "warn" | "bad";

export interface MockKpiDef {
  name: string;
  viz: KpiViz;
  q: string;
  value: string;
  unit: string;
  badge: { tx: string; tone: KpiTone };
  status: KpiTone;
  tag: string;
  meta?: string;
  metaVal?: number;
  metaLabel?: string;
  pct?: number;
  num?: number;
  target?: number;
  targetLabel?: string;
  shareLabel?: string;
  trend?: number[];
  done?: number;
  total?: number;
  _isMock?: boolean;
}

export const MOCK_KPIS_MANAGER: MockKpiDef[] = [
  {
    name: "DSO",
    viz: "trend",
    q: "¿Cuántos días tardamos en convertir ventas en caja?",
    value: "64",
    unit: "días",
    badge: { tx: "↑ +6 días", tone: "bad" },
    meta: "Meta: 45 días",
    metaVal: 45,
    metaLabel: "Meta 45",
    status: "bad",
    trend: [52, 55, 54, 58, 57, 60, 64],
    tag: "Eficiencia",
  },
  {
    name: "% Overdue Crítico",
    viz: "share",
    q: "¿Qué parte de la cartera está en riesgo real?",
    value: "18,4",
    unit: "%",
    badge: { tx: "↑ +2,1 pp", tone: "bad" },
    num: 18.4,
    target: 10,
    targetLabel: "Umbral 10%",
    shareLabel: "de la cartera en riesgo",
    status: "bad",
    tag: "Impecabilidad",
  },
  {
    name: "Generación de Caja",
    viz: "fill",
    q: "¿Cuánta caja real estamos recuperando vs la esperada?",
    value: "67,6",
    unit: "%",
    badge: { tx: "↘ −32,4%", tone: "bad" },
    meta: "Meta: 100%",
    pct: 67.6,
    status: "bad",
    tag: "Calidad producida",
  },
  {
    name: "Índice de Credibilidad",
    viz: "trend",
    q: "¿Podemos confiar en lo que promete el deudor?",
    value: "71",
    unit: "%",
    badge: { tx: "↗ +16,9%", tone: "good" },
    meta: "Meta: 60%",
    metaVal: 60,
    metaLabel: "Meta 60",
    status: "good",
    trend: [55, 58, 61, 60, 66, 69, 71],
    tag: "Calidad producida",
  },
  {
    name: "Calidad de Negociación",
    viz: "gauge",
    q: "¿Qué tan buenos son los acuerdos que cerramos?",
    value: "58",
    unit: "%",
    badge: { tx: "→ +0,8 pp", tone: "warn" },
    num: 58,
    target: 70,
    meta: "Meta: 70%",
    status: "warn",
    tag: "Eficiencia",
  },
];

export const MOCK_KPIS_JEFE: MockKpiDef[] = [
  {
    name: "Generación de Caja",
    viz: "fill",
    q: "¿Cuánta caja real estamos recuperando vs la esperada?",
    value: "67,6",
    unit: "%",
    badge: { tx: "↘ −32,4%", tone: "bad" },
    meta: "Meta: 100%",
    pct: 67.6,
    status: "bad",
    tag: "Calidad producida",
  },
  {
    name: "% Avance de Tareas",
    viz: "fill",
    q: "¿El equipo está ejecutando lo planificado?",
    value: "62",
    unit: "%",
    badge: { tx: "↗ +5 pp", tone: "warn" },
    meta: "Meta: 80%",
    pct: 77,
    status: "warn",
    tag: "Eficiencia",
  },
  {
    name: "Contactabilidad Efectiva",
    viz: "trend",
    q: "¿Estamos logrando hablar con quien decide?",
    value: "44",
    unit: "%",
    badge: { tx: "↘ −3 pp", tone: "bad" },
    meta: "Meta: 55%",
    metaVal: 55,
    metaLabel: "Meta 55",
    status: "warn",
    trend: [50, 49, 47, 48, 46, 45, 44],
    tag: "Eficiencia",
  },
  {
    name: "% Compromisos Cumplidos",
    viz: "trend",
    q: "¿Los pagos prometidos se concretan?",
    value: "31",
    unit: "%",
    badge: { tx: "↘ −9 pp", tone: "bad" },
    meta: "Meta: 65%",
    metaVal: 65,
    metaLabel: "Meta 65",
    status: "bad",
    trend: [52, 48, 45, 40, 38, 34, 31],
    tag: "Impecabilidad",
  },
  {
    name: "Overdue Crítico",
    viz: "share",
    q: "¿Qué parte de la cartera está en riesgo real?",
    value: "18,4",
    unit: "%",
    badge: { tx: "↑ +2,1 pp", tone: "bad" },
    num: 18.4,
    target: 10,
    targetLabel: "Umbral 10%",
    shareLabel: "de la cartera en riesgo",
    status: "bad",
    tag: "Impecabilidad",
  },
  {
    name: "DSO",
    viz: "trend",
    q: "¿Cuántos días tardamos en convertir ventas en caja?",
    value: "64",
    unit: "días",
    badge: { tx: "↑ +6 días", tone: "bad" },
    meta: "Meta: 45 días",
    metaVal: 45,
    metaLabel: "Meta 45",
    status: "bad",
    trend: [52, 55, 54, 58, 57, 60, 64],
    tag: "Eficiencia",
  },
];

export const MOCK_KPIS_EJECUTIVO: MockKpiDef[] = [
  {
    name: "Generación de Caja",
    viz: "fill",
    q: "¿Cuánto llevo recuperado de mi meta?",
    value: "69",
    unit: "%",
    badge: { tx: "↘ −31%", tone: "bad" },
    meta: "Meta: 100% · mi cartera",
    pct: 69,
    status: "bad",
    tag: "Calidad producida",
  },
  {
    name: "% Facturas en Fase 1",
    viz: "share",
    q: "¿Estoy conteniendo la mora temprana?",
    value: "42",
    unit: "%",
    badge: { tx: "Monitorear", tone: "warn" },
    num: 42,
    target: 60,
    targetLabel: "Meta 60%",
    shareLabel: "contenido en fase temprana",
    status: "warn",
    tag: "Eficiencia",
  },
  {
    name: "% Cumplimiento de Tareas",
    viz: "fill",
    q: "¿Estoy al día con mi plan de trabajo?",
    value: "78",
    unit: "%",
    badge: { tx: "↗ +6 pp", tone: "warn" },
    meta: "Meta: 90%",
    pct: 87,
    status: "warn",
    tag: "Eficiencia",
  },
  {
    name: "Llamadas Efectivas",
    viz: "tally",
    q: "¿Estoy generando conversaciones que cobran?",
    value: "12",
    unit: "de 25 hoy",
    badge: { tx: "48% de la meta", tone: "warn" },
    meta: "Meta: 25 llamadas / día",
    done: 12,
    total: 25,
    status: "warn",
    tag: "Eficiencia",
  },
  {
    name: "Efectividad de Negociación",
    viz: "gauge",
    q: "¿Mis acuerdos terminan en pago?",
    value: "54",
    unit: "%",
    badge: { tx: "↗ +2 pp", tone: "warn" },
    num: 54,
    target: 70,
    meta: "Meta: 70%",
    status: "warn",
    tag: "Impecabilidad",
  },
];
