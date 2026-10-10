# PadelUp – besser im Padel

Eine stark gamifizierte Padel-App im Duolingo-Stil: Lektionen lernen, im nächsten Match anwenden, im Tagebuch auswerten.
Alles steckt in einer Datei (`index.html`): kein Konto, keine Werbung, installierbar und offline nutzbar.

**Adresse (sobald GitHub Pages aktiv ist):** https://fr-dev94.github.io/test/padel/

## Der Kreislauf

1. **Lektion** – kurze Theorie-Karten + Quiz (Multiple Choice, Stimmt/Stimmt nicht, Reihenfolge)
2. **Mission** – nach jeder Lektion eine konkrete Aufgabe für dein nächstes Spiel (max. 3 gleichzeitig)
3. **Tagebuch** – Match/Training eintragen, Missionen bewerten (versucht / teilweise / gemeistert), Schläge 1–5 einschätzen
4. **Personalisierung** – aus Fokus-Skills, Selbsteinschätzung und „Wo hast du Punkte verloren?“ empfiehlt die App die nächste Lektion und schaltet passende Lektionen frei

## Inhalt

6 Einheiten, 24 Lektionen, 96 Quizfragen, 24 Match-Missionen, 18 Tagesdrills (ohne Court machbar):
Grundlagen · Die Wände · Am Netz · Lob & Defensive · Überkopf (Bandeja, Víbora, Smash) · Taktik & Kopf

## Gamification

- Lernpfad mit 3 Sternen pro Lektion (abgeschlossen · fehlerfrei · Mission gemeistert), Truhen und Meisterprüfungen
- XP, Level mit Titeln (Novato → Leyenda), Tagesziel, Streak mit Streak-Schutz
- 10 Skills mit eigenem Level-Balken (bis Level 10)
- Tägliche Quests + Bonustruhe, Wochenliga (Club → Major) mit Auf- und Abstieg
- Bälle als Währung, Shop (Streak-Schutz, Doppel-XP, Outfits für Maskottchen Bolita), 18 Erfolge
- Tagebuch-Statistiken: Siegquote, Stunden, Spielzeit pro Woche, Radar-Spielerprofil, Wochenziel

Der Fortschritt liegt im Browser (`localStorage`). Unter **Profil → Fortschritt sichern** gibt es einen Code zum Übertragen.
