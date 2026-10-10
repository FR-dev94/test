# PadelUp – besser im Padel

Eine stark gamifizierte Padel-App im Duolingo-Stil: Lektionen lernen, im nächsten Match anwenden, im Tagebuch auswerten.
Alles steckt in einer Datei (`index.html`): kein Konto, keine Werbung, installierbar und offline nutzbar.

**Adresse (sobald GitHub Pages aktiv ist):** https://fr-dev94.github.io/test/padel/

## Der Kreislauf

1. **Lektion** – kurze Theorie-Karten + Quiz (Multiple Choice, Stimmt/Stimmt nicht, Reihenfolge)
2. **Mission** – nach jeder Lektion eine konkrete Aufgabe für dein nächstes Spiel (max. 3 gleichzeitig)
3. **Tagebuch** – Match/Training eintragen, Missionen bewerten (versucht / teilweise / gemeistert), Schläge 1–5 einschätzen
4. **Personalisierung** – aus Fokus-Skills, Selbsteinschätzung und „Wo hast du Punkte verloren?“ empfiehlt die App die nächste Lektion und schaltet passende Lektionen frei

## Roadmap: vom Einsteiger zum Wettkampfspieler

5 Stufen, 14 Einheiten, 53 Lektionen, 212 Quizfragen, 53 Match-Missionen, 32 Tagesdrills, 25 Skill-Checks:

| Stufe | Niveau | Einheiten |
|---|---|---|
| 1 · Einsteiger | 0 – 1,5 | Grundlagen (inkl. Regeln & Beinarbeit) · Die Wände · Am Netz |
| 2 · Hobby | 1,5 – 2,5 | Lob & Defensive · Überkopf (Zurücklaufen, Bandeja) · Teamplay (Rollen, Vorrücken) |
| 3 · Fortgeschritten | 2,5 – 3,5 | Aufschlag & Return 2.0 · Wand-Profi (Bajada, Gitter) · Überkopf 2.0 (Víbora, Gancho, Smash-Abwehr) |
| 4 · Ambitioniert | 3,5 – 4,5 | Taktik 2.0 (Muster, Gegner lesen, Tempo, Winkel) · Netz-Meister (Block, Dejada, Duelle, Konter) · Mentale Stärke |
| 5 · Wettkampf | 4,5+ | Matchstrategie (Punto de oro, Plan B, Turniertag) · Athletik & Material |

Jede Stufe hat 5 **Skill-Checks** – praktische Tests auf dem Court (z. B. „7 von 10 Lobs hinter die Aufschlaglinie“).
Eine Stufe ist gemeistert, wenn alle Meisterprüfungen bestanden sind und höchstens ein Skill-Check fehlt.

## Gamification

- Lernpfad mit 3 Sternen pro Lektion (abgeschlossen · fehlerfrei · Mission gemeistert), Truhen und Meisterprüfungen
- XP, Level mit Titeln (Novato → Leyenda), Tagesziel, Streak mit Streak-Schutz
- 11 Skills (inkl. Athletik) mit eigenem Level-Balken (bis Level 10)
- Tägliche Quests + Bonustruhe, Wochenliga (Club → Major) mit Auf- und Abstieg
- Bälle als Währung, Shop (Streak-Schutz, Doppel-XP, Outfits für Maskottchen Bolita), 26 Erfolge
- Tagebuch mit drei Bereichen: **Einträge**, **Statistik** (Siege/Niederlagen/Remis, Siegquote, Form, Serien, Sätze, Games, Tie-Breaks, Bilanz pro Partner und Gegner, Monatsverlauf, Gefühl vs. Ergebnis) und **Material** (Wechsel-Erinnerungen für Overgrip, Bälle, Schuhe, Schläger + Schläger-Empfehlung aus 114 konkreten Schlägern von Padel-Point, Preise vom 05.10.2026: Top-Match mit Prozent-Passung, Stärken/Schwächen je Schläger, Rangliste mit Suche, Feinabstimmung, „mein Schläger“-Vergleich)
- Selbsteinschätzung 0–10 nach jedem Spiel („Wie gut waren deine Lobs?“) mit Schnitt, Trend und Verlauf pro Bereich
- Kalorien-Schätzung pro Session (MET × Gewicht × Dauer, mit Intensität), kcal pro Woche und gesamt
- Tagebuch-Statistiken: Siegquote, Stunden, Spielzeit pro Woche, Radar-Spielerprofil, Wochenziel

Der Fortschritt liegt im Browser (`localStorage`). Unter **Profil → Fortschritt sichern** gibt es einen Code zum Übertragen.
