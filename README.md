# Clear Glass

Thème [Spicetify](https://spicetify.app) pour Spotify, inspiré du verre clair d'Apple.

- Panneaux translucides avec un liseré lumineux et de grands arrondis
- Fond dynamique : la pochette du morceau en cours, floutée, avec un fondu à chaque titre
- Lecteur en capsule flottante, avec les pochettes qui défilent dessous
- Vues plein écran et développée intégrées au thème
- Boutons Windows (réduire, agrandir, fermer) fondus dans la barre du haut
- Pensé pour rester fluide : le flou en temps réel est limité aux petites zones

## Installation

Spicetify doit déjà être installé.

**Windows (PowerShell)**

```powershell
git clone https://github.com/Rzoxs/spicetify-clear-glass "$env:APPDATA\spicetify\Themes\ClearGlass"
spicetify config current_theme ClearGlass color_scheme Clear inject_theme_js 1
spicetify apply
```

**macOS / Linux**

```bash
git clone https://github.com/Rzoxs/spicetify-clear-glass ~/.config/spicetify/Themes/ClearGlass
spicetify config current_theme ClearGlass color_scheme Clear inject_theme_js 1
spicetify apply
```

## Mise à jour

```bash
git pull
spicetify apply
```

## Désinstallation

```bash
spicetify config current_theme marketplace color_scheme " "
spicetify apply
```

## Personnalisation

Les réglages principaux sont dans `:root`, en haut de `user.css` :

- `--cg-tint` : baisser sa dernière valeur rend les panneaux plus transparents
- `--cg-radius` : taille des arrondis

La saturation et la luminosité du fond sont dans la fonction `paint` de `theme.js`.

## Compatibilité

Testé uniquement sur Windows 11 avec Spotify 1.3.6 et Spicetify 2.46. La police est prévue pour Windows, et le thème dépend de la structure de l'interface de Spotify : une autre version peut afficher certains éléments différemment.
