# Planning chantier

Application web de planning de chantier avec une interface claire type Gantt /
MS Project : tableau hierarchique a gauche, calendrier multi-semaines a droite,
barres colorees par statut et libelles lisibles a cote des barres.

## Fonctionnalites

- Tableau type Project avec colonnes Sujet, Type, Statut, Priorite et Assigne.
- Taches groupees sous des phases chantier : preparation, gros oeuvre, clos
  couvert, second oeuvre et reception.
- Grille calendaire claire avec en-tetes de semaines et de jours.
- Barres de planning positionnees automatiquement selon les dates de debut et de
  fin.
- Couleurs par statut : planifie, en cours, termine, a risque, critique et en
  attente.
- Ligne de repere rouge sur la date courante ou le debut du planning.
- Recherche globale par tache, lot, entreprise, responsable ou notes.
- Filtres par phase, statut et niveau de zoom.
- Ligne de synthese compacte : nombre de taches, avancement moyen, taches
  critiques et taches a risque.
- Ajout de nouvelles interventions depuis un formulaire.
- Selection d'une tache avec detail resume en bas de l'ecran.
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
