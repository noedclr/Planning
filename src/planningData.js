export const phases = [
  {
    id: "preparation",
    name: "Preparation",
    accent: "#ef4444"
  },
  {
    id: "gros-oeuvre",
    name: "Gros oeuvre",
    accent: "#38bdf8"
  },
  {
    id: "clos-couvert",
    name: "Clos couvert",
    accent: "#f59e0b"
  },
  {
    id: "second-oeuvre",
    name: "Second oeuvre",
    accent: "#22c55e"
  },
  {
    id: "reception",
    name: "Reception",
    accent: "#8b5cf6"
  }
];

export const statuses = {
  planned: {
    label: "Planifie",
    color: "#94a3b8"
  },
  progress: {
    label: "En cours",
    color: "#059669"
  },
  done: {
    label: "Termine",
    color: "#1d4ed8"
  },
  risk: {
    label: "A risque",
    color: "#f59e0b"
  },
  critical: {
    label: "Critique",
    color: "#ef4444"
  },
  hold: {
    label: "En attente",
    color: "#8b5cf6"
  }
};

export const defaultTasks = [
  {
    id: "task-001",
    phaseId: "preparation",
    lot: "LOT 00",
    name: "Installation de chantier",
    company: "ELM TP",
    start: "2026-06-22",
    end: "2026-06-25",
    status: "critical",
    progress: 20,
    owner: "Conducteur travaux",
    notes: "Base vie, clotures, panneau de chantier et acces livraison."
  },
  {
    id: "task-002",
    phaseId: "preparation",
    lot: "LOT 00",
    name: "Implantation et piquetage",
    company: "Geometre",
    start: "2026-06-24",
    end: "2026-06-26",
    status: "critical",
    progress: 0,
    owner: "MOE",
    notes: "A valider avant demarrage terrassement."
  },
  {
    id: "task-003",
    phaseId: "preparation",
    lot: "LOT 01",
    name: "Terrassement plateforme",
    company: "ELM TP",
    start: "2026-06-29",
    end: "2026-07-03",
    status: "critical",
    progress: 0,
    owner: "Chef chantier",
    notes: "Sous reserve validation DICT."
  },
  {
    id: "task-004",
    phaseId: "gros-oeuvre",
    lot: "LOT 02",
    name: "Fondations superficielles",
    company: "Batim GC",
    start: "2026-07-06",
    end: "2026-07-10",
    status: "progress",
    progress: 35,
    owner: "Equipe GO",
    notes: "Ferraillage et coulage par zones."
  },
  {
    id: "task-005",
    phaseId: "gros-oeuvre",
    lot: "LOT 02",
    name: "Longrines et reseaux sous dallage",
    company: "Batim GC",
    start: "2026-07-09",
    end: "2026-07-15",
    status: "risk",
    progress: 10,
    owner: "Equipe GO",
    notes: "Coordination requise avec plombier et electricien."
  },
  {
    id: "task-006",
    phaseId: "gros-oeuvre",
    lot: "LOT 02",
    name: "Dallage rez-de-chaussee",
    company: "Batim GC",
    start: "2026-07-16",
    end: "2026-07-20",
    status: "progress",
    progress: 15,
    owner: "Equipe GO",
    notes: "Controle planimetrie avant reception support."
  },
  {
    id: "task-007",
    phaseId: "gros-oeuvre",
    lot: "LOT 02",
    name: "Elevation murs RDC",
    company: "Batim GC",
    start: "2026-07-21",
    end: "2026-07-30",
    status: "progress",
    progress: 0,
    owner: "Equipe GO",
    notes: "Deux zones de coulage pour limiter les coactivites."
  },
  {
    id: "task-008",
    phaseId: "gros-oeuvre",
    lot: "LOT 02",
    name: "Plancher haut RDC",
    company: "Batim GC",
    start: "2026-07-31",
    end: "2026-08-07",
    status: "planned",
    progress: 0,
    owner: "Equipe GO",
    notes: "Reservation des etaies a confirmer."
  },
  {
    id: "task-009",
    phaseId: "clos-couvert",
    lot: "LOT 03",
    name: "Charpente metallique",
    company: "Metal Nord",
    start: "2026-08-10",
    end: "2026-08-14",
    status: "risk",
    progress: 0,
    owner: "Lot charpente",
    notes: "Approvisionnement a securiser."
  },
  {
    id: "task-010",
    phaseId: "clos-couvert",
    lot: "LOT 04",
    name: "Couverture bac acier",
    company: "Toit & Co",
    start: "2026-08-17",
    end: "2026-08-21",
    status: "progress",
    progress: 0,
    owner: "Lot couverture",
    notes: "Intervention conditionnee a la levee charpente."
  },
  {
    id: "task-011",
    phaseId: "clos-couvert",
    lot: "LOT 05",
    name: "Menuiseries exterieures",
    company: "AluBat",
    start: "2026-08-24",
    end: "2026-08-28",
    status: "planned",
    progress: 0,
    owner: "Lot menuiserie",
    notes: "Pose sur supports receptionnes."
  },
  {
    id: "task-012",
    phaseId: "second-oeuvre",
    lot: "LOT 06",
    name: "Cloisons et doublages",
    company: "Interieur Pro",
    start: "2026-08-31",
    end: "2026-09-11",
    status: "planned",
    progress: 0,
    owner: "Lot platrerie",
    notes: "Demarrage apres mise hors d'eau hors d'air."
  },
  {
    id: "task-013",
    phaseId: "second-oeuvre",
    lot: "LOT 07",
    name: "Electricite CFO/CFA",
    company: "Elec Service",
    start: "2026-09-07",
    end: "2026-09-18",
    status: "progress",
    progress: 0,
    owner: "Lot electricite",
    notes: "Chemins de cable et tirage en parallele des cloisons."
  },
  {
    id: "task-014",
    phaseId: "second-oeuvre",
    lot: "LOT 08",
    name: "Plomberie CVC",
    company: "Thermiq",
    start: "2026-09-09",
    end: "2026-09-22",
    status: "progress",
    progress: 0,
    owner: "Lot CVC",
    notes: "Synthese technique hebdomadaire."
  },
  {
    id: "task-015",
    phaseId: "second-oeuvre",
    lot: "LOT 09",
    name: "Chapes et revetements sols",
    company: "Sol Expert",
    start: "2026-09-23",
    end: "2026-10-02",
    status: "planned",
    progress: 0,
    owner: "Lot sols",
    notes: "Respecter temps de sechage avant pose finitions."
  },
  {
    id: "task-016",
    phaseId: "second-oeuvre",
    lot: "LOT 10",
    name: "Peinture et finitions",
    company: "DecoBat",
    start: "2026-10-05",
    end: "2026-10-16",
    status: "hold",
    progress: 0,
    owner: "Lot peinture",
    notes: "Planning ajustable selon avancement second oeuvre."
  },
  {
    id: "task-017",
    phaseId: "reception",
    lot: "OPR",
    name: "Operations prealables a la reception",
    company: "MOE",
    start: "2026-10-19",
    end: "2026-10-23",
    status: "hold",
    progress: 0,
    owner: "MOE",
    notes: "Liste de reserves et essais techniques."
  },
  {
    id: "task-018",
    phaseId: "reception",
    lot: "OPR",
    name: "Levee des reserves",
    company: "Toutes entreprises",
    start: "2026-10-26",
    end: "2026-10-30",
    status: "critical",
    progress: 0,
    owner: "Conducteur travaux",
    notes: "Prioriser reserves bloquantes avant livraison."
  }
];
