# Planning chantier

Application web de planning de chantier avec une vue type Gantt, inspiree des
plannings travaux visuels : liste des lots et interventions a gauche, calendrier
multi-semaines a droite, barres colorees par statut, filtres et fiche de detail.

## Fonctionnalites

- Tableau des interventions par phase : preparation, gros oeuvre, clos couvert,
  second oeuvre et reception.
- Grille calendaire dense avec en-tetes de semaines et de jours.
- Barres de planning positionnees automatiquement selon les dates de debut et de
  fin.
- Couleurs par statut : planifie, en cours, termine, a risque, critique et en
  attente.
- Recherche globale par tache, lot, entreprise, responsable ou notes.
- Filtres par phase, statut et niveau de zoom.
- Indicateurs de synthese : nombre de taches, avancement moyen, taches critiques
  et taches a risque.
- Ajout de nouvelles interventions depuis un formulaire.
- Sauvegarde locale dans le navigateur via `localStorage`.
- Reinitialisation rapide avec les donnees de demonstration.

## Structure

```text
.
├── index.html              # Page principale
├── package.json            # Scripts de lancement et de test
├── src/
│   ├── app.js              # Rendu UI, interactions et persistance locale
│   ├── planningData.js     # Donnees chantier de demonstration
│   ├── schedule.js         # Fonctions metier de dates, filtres et KPI
│   └── styles.css          # Interface visuelle type planning chantier
└── test/
    └── schedule.test.js    # Tests unitaires des fonctions metier
```

## Lancer le projet

Aucune dependance externe n'est requise.

```bash
npm start
```

Puis ouvrir :

```text
http://localhost:4173
```

Il est aussi possible d'ouvrir `index.html` directement dans un navigateur
moderne.

## Tester

```bash
npm test
```

Les tests utilisent le runner natif de Node.js.

## Prochaines evolutions possibles

- Edition et suppression des taches existantes.
- Import/export CSV ou Excel.
- Gestion des dependances entre taches et chemin critique.
- Vue ressources par entreprise ou equipe.
- Authentification et stockage serveur pour un usage multi-utilisateur.
