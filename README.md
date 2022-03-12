# Word Games

A very early version of a set of games.

Some are planned to be people proficient in a language, others will be for language learners.

Some will use a single language. Others will have a source and a target language for learners.


## Launch development server

For now any static web server will do. Clone this repository and launch the static web server in the docs directory.

There are some sample data files in the `docs/data` folder and they are mapped in the `docs/games.json` file.

## Some of the Data Sources:

* [English](https://github.com/szabgab/word-games-english)
* [Hungarian]()
* [Hebrew]()
* [Ladino]()

For additional data sources see the `production.json` file.

## Adding a new language:

* Create a repository (for now we use repository names `word-games-LANGUAGE`) but any name could work. It does not have to be on GitHub but we need to be able to clone it without authentiaction.
* In the repository there should be a LICENSE file to make sure we can reuse the data in the project.
* The data is in a JSON file.
* Once such repository and the data file is created the information can be added to the `production.json` file.

* Trying the new language locally

TBD

## Keyboards

The keyboard layout definitions are currently in the source code, but because the layout did not work properly on small
screens temporarily we create keyboards in ABC order. Later we'll want to be abel to show keyboard layouts
that people already know. We'll want to allow people to swicth keyboard layouts.


## Release process

The production site at https://word-games.szabgab.com/ is using GitHub pages.
It is served from a private repository as it only contains the generated and the CI job that
generates it using the `release.py` in this repository. It collects all the data files described in
the `production.json` file.

## Contributors

* [Kate](https://codeberg.org/kate/) - French, German
* [Gabor Szabo](https://szabgab.com/) - code, English, Hebrew, Hungarian, Ladino
