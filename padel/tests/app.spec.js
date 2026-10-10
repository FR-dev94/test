// Automatische Tests für PadelUp. Start: `npm test` im Repository-Hauptordner.
import { test, expect } from '@playwright/test';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';

const APP = new URL('../index.html', import.meta.url).href;
const KEY = 'padelup-v1';

// Jeder Test: Schriften blockieren (offline-fähig) und JS-Fehler sammeln – ein Fehler lässt den Test scheitern.
let appErrors = [];
test.beforeEach(async ({ page }) => {
  appErrors = [];
  page.on('pageerror', e => appErrors.push(e.message));
  await page.route(/fonts\.(googleapis|gstatic)\.com/, r => r.abort());
});
test.afterEach(async () => {
  expect(appErrors, 'JavaScript-Fehler in der App').toEqual([]);
});

/** App mit vorbereitetem Spielstand öffnen. `prep` läuft im Browser, nachdem die App geladen ist. */
async function open(page, prep) {
  await page.goto(APP);
  // Hilfsfunktionen für Testdaten im Browser bereitstellen
  await page.evaluate(`window.base=${base.toString()};window.seedMatches=${seedMatches.toString()};`);
  if (prep) {
    await page.evaluate(prep);
    await page.evaluate(() => { save(); });
    await page.reload();
  }
  await page.waitForTimeout(1500); // Pop-ups beim Öffnen erscheinen nach ~1,2 s
}
/** Alle offenen Pop-ups schließen (Material, Backup, Streak …). */
async function closePopups(page) {
  for (let i = 0; i < 6; i++) {
    const b = await page.$('.sheet [data-act=gearPopLater], .sheet [data-act=nextModal], .sheet [data-act=closeModal]');
    if (!b) break;
    await b.click();
    await page.waitForTimeout(150);
  }
}
/** Erfahrener Spieler ohne Pop-ups beim Start. */
const base = () => { S.onb = true; S.name = 'Test'; S.lastBackup = today(); };
/** Schieberegler setzen. */
const slide = (page, id, v) => page.evaluate(([id, v]) => { const r = document.getElementById(id); r.value = v; r.dispatchEvent(new Event('input', { bubbles: true })); }, [id, v]);
/** 20 Beispiel-Matches über 4 Monate (deterministisch). */
function seedMatches() {
  const d = n => addDays(today(), -n);
  let seed = 11; const r = () => (seed = seed * 16807 % 2147483647) / 2147483647;
  const O = ['Ben & Jan', 'Sara & Mo', 'Tim & Lu', 'Ben & Tim'], P = ['Lena', 'Lena', 'Marco'], J = [];
  for (let i = 0; i < 20; i++) {
    const lob = Math.round(3 + r() * 6), w = lob >= 6 ? r() > .25 : r() > .7;
    J.push({ id: 'm' + i, ts: i, type: 'Match', date: d(120 - i * 6), dur: 90, res: w ? 'w' : 'l', score: w ? '6:4 6:3' : '4:6 3:6', partner: P[i % 3], opp: O[i % 4],
      rt: { lob, volley: Math.round(4 + r() * 4), smash: Math.round(3 + r() * 4), bandeja: Math.round(3 + r() * 4) }, lost: w ? null : (r() > .4 ? 'lob' : 'smash'), rs: 10 });
  }
  S.journal = J.reverse();
}

test('Inhalte sind vollständig und gültig', async ({ page }) => {
  await open(page);
  const r = await page.evaluate(() => {
    const bad = [];
    LESSONS.forEach(l => {
      if (!(l.cards.length >= 2 && l.cards.length <= 3)) bad.push(l.id + ': Karten');
      if (l.q.length !== 4) bad.push(l.id + ': Fragen');
      if (!SK[l.sk]) bad.push(l.id + ': Skill');
      if (!l.m || !l.m.t || !l.m.d) bad.push(l.id + ': Mission');
      l.q.forEach(q => {
        if (q.k === 'mc' && q.a.length < 3) bad.push(l.id + ': MC');
        if (q.k === 'tf' && typeof q.a !== 'boolean') bad.push(l.id + ': TF');
        if (q.k === 'order' && !(q.a.length >= 4 && q.a.length <= 5)) bad.push(l.id + ': Reihenfolge');
      });
    });
    Object.keys(ANIMOF).forEach(id => { if (!LBYID[id]) bad.push('Animation ohne Lektion: ' + id); if (!ANIM[ANIMOF[id]]) bad.push('Animation fehlt: ' + ANIMOF[id]); });
    PLANS.forEach(p => { if (p.blocks.reduce((a, b) => a + b[0], 0) !== 60) bad.push('Plan ≠ 60 Min: ' + p.id); });
    return { bad, lessons: LESSONS.length, unused: Object.keys(LP).filter(id => !LBYID[id]), rackets: RACKETS.length, plans: PLANS.length, anims: Object.keys(ANIM).length, drills: DRILLS.length, ms: MSALL.length };
  });
  expect(r.bad).toEqual([]);
  expect(r.unused).toEqual([]);
  expect(r).toMatchObject({ lessons: 53, rackets: 114, plans: 15, anims: 15, drills: 32, ms: 25 });
});

test('Onboarding → Lektion → Mission → Match eintragen', async ({ page }) => {
  await open(page);
  await page.click('[data-act=obNext]');
  await page.fill('#obname', 'Freddie');
  await page.click('[data-act=obNext]');
  await page.click('[data-act=ob][data-k=lvl][data-v="1"]'); await page.click('[data-act=obNext]');
  await page.click('[data-act=ob][data-k=side][data-v=links]'); await page.click('[data-act=obNext]');
  await page.click('[data-act=obFocus][data-k=lob]'); await page.click('[data-act=obNext]');
  await page.click('[data-act=obNext]');
  await page.waitForTimeout(400); await closePopups(page);
  // Lektion "Griff" mit allen Fragen richtig
  await page.click('.node[data-id=griff]'); await page.click('[data-act=startLesson]');
  while (await page.$('[data-act=nextCard]')) await page.click('[data-act=nextCard]');
  for (let i = 0; i < 10; i++) {
    const k = await page.evaluate(() => { if (!LS || LS.phase !== 'quiz') return null; const q = LS.queue[LS.qi]; if (q.k === 'mc') LS.sel = q.a[0]; else if (q.k === 'tf') LS.sel = String(q.a); else LS.seq = [...q.a]; drawLesson(); return q.k; });
    if (!k) break;
    await page.click('[data-act=check]'); await page.click('[data-act=nextQ]');
  }
  await expect(page.locator('.results h1')).toHaveText('Fehlerfrei!');
  await page.click('[data-act=acceptMission]');
  await page.waitForTimeout(300); await closePopups(page);
  // Match eintragen, Mission gemeistert
  await page.click('.plan [data-act=journalNew]');
  await page.click('[data-act=jf][data-k=res][data-v=w]');
  await page.fill('#jscore', '6:4 7:5');
  await page.click('[data-act=jmr][data-v="3"]');
  await page.click('[data-act=saveJournal]');
  const st = await page.evaluate(() => ({ m: S.missions.griff.st, n: S.journal.length, kcal: S.journal[0].kcal, stars: stars('griff'), xp: S.xp }));
  expect(st).toMatchObject({ m: 'done', n: 1, kcal: 752, stars: 3 });
  expect(st.xp).toBeGreaterThan(40);
});

test('Alter Spielstand (v1) wird übernommen', async ({ page }) => {
  await page.addInitScript(([k]) => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1');
    localStorage.setItem(k, JSON.stringify({ v: 1, onb: true, unlockFrom: 4, lessons: { griff: { n: 1 }, lob: { n: 1 } }, tests: { 0: '2026-10-01' }, chests: { c0: '2026-10-01' }, xp: 120,
      journal: [{ id: 'a', type: 'Match', date: '2026-10-01', dur: 90, res: 'w', rt: { lob: 4, volley: 3 } }] })); } }, [KEY]);
  await open(page);
  const r = await page.evaluate(() => ({ v: S.v, unlockId: S.unlockId, tests: S.tests, chests: S.chests, rt: S.journal[0].rt }));
  expect(r).toEqual({ v: 3, unlockId: 'rueckwand', tests: { basics: '2026-10-01' }, chests: { cbasics: '2026-10-01' }, rt: { lob: 8, volley: 6 } });
});

test('Bewertung: alles gilt als gespielt, einzeln abwählbar', async ({ page }) => {
  await open(page, () => { S.onb = true; S.lastBackup = today(); S.journal = [{ id: 'a', ts: 1, type: 'Match', date: addDays(today(), -3), dur: 90, rt: { lob: 7 }, rs: 10 }]; S.tab = 'journal'; });
  await closePopups(page);
  await page.click('[data-act=journalNew]');
  await expect(page.locator('#rcount')).toHaveText('11 von 11 bewertet');
  expect(await page.evaluate(() => JF.rt.lob)).toBe(7); // letzte Bewertung vorbelegt
  await page.click('#np_volley');
  await expect(page.locator('#rcount')).toHaveText('10 von 11 bewertet');
  await page.click('[data-act=rset][data-k=volley]');
  await expect(page.locator('#rcount')).toHaveText('11 von 11 bewertet');
  await page.click('#np_volley');
  await slide(page, 'r_lob', 9);
  await page.click('[data-act=saveJournal]');
  const rt = await page.evaluate(() => S.journal[0].rt);
  expect(rt.volley).toBeUndefined();
  expect(rt.lob).toBe(9);
});

test('Statistik: Bilanz, Sätze, Erkenntnisse, Spielstärke', async ({ page }) => {
  await open(page, () => { base(); seedMatches(); S.tab = 'journal'; S.jtab = 'stats'; });
  const r = await page.evaluate(() => {
    const rec = recordOf(S.journal.filter(j => j.res)), I2 = insights(S.journal), E = eloReplay();
    return { w: rec.w, l: rec.l, ins: I2.list.length, lobInsight: I2.list[0].h.includes('Lobs'), L: E.L, n: E.n };
  });
  expect(r).toMatchObject({ w: 12, l: 8, n: 20, lobInsight: true });
  expect(r.ins).toBeGreaterThanOrEqual(3);
  expect(r.L).toBeGreaterThan(0.8);
  await expect(page.locator('.lvlbig')).toBeVisible();
  await expect(page.locator('.dev').first()).toBeVisible();
  await expect(page.locator('.devchips')).toBeVisible();
});

test('Overgrip-Erinnerung nach 5 Sessions', async ({ page }) => {
  await open(page, () => { base(); S.tab = 'journal'; S.gear = { grip: { since: Date.now() - 5e8, every: 5 } }; S.gearAsked = today();
    for (let i = 0; i < 4; i++) S.journal.push({ id: 'a' + i, ts: Date.now() - 1e8 + i, type: 'Match', date: today(), dur: 90, rs: 10 }); });
  expect(await page.$('[data-act=gearPopDone]')).toBeNull(); // heute schon gefragt
  await page.click('[data-act=journalNew]');
  await page.click('[data-act=saveJournal]');
  for (let i = 0; i < 3 && !(await page.$('[data-act=gearPopDone]')); i++) { await page.click('.sheet [data-act=nextModal]'); await page.waitForTimeout(200); }
  await expect(page.locator('.sheet h2')).toHaveText('Zeit für einen neuen Overgrip!');
  await page.click('[data-act=gearPopDone]');
  expect(await page.evaluate(() => gearDue().length)).toBe(0);
});

test('Schläger-Empfehlung entspricht dem Schlägerfinder', async ({ page }) => {
  await open(page, () => { base(); S.side = 'links'; S.unlockId = 'lob'; S.weekGoal = 2; });
  const top = await page.evaluate(() => rkRanked().list.slice(0, 3).map(x => x.r.brand + ' ' + x.r.name + ' ' + x.score));
  expect(top).toEqual(['HEAD Coello Team 2026 83', 'Wilson Defy V1 80', 'Babolat Tech Viper Soft 2026 80']);
  const armfriendly = await page.evaluate(() => { rfState().pain = 9; return rkRanked().list[0].r.name; });
  expect(armfriendly).toBe('Bomba Soft');
});

test('Backup speichern und wiederherstellen', async ({ page }, info) => {
  await open(page, () => { base(); seedMatches(); S.lastBackup = null; S.backupAsked = today(); S.tab = 'profile'; });
  const [dl] = await Promise.all([page.waitForEvent('download'), page.click('[data-act=backupNow]')]);
  const file = info.outputPath('backup.json');
  await dl.saveAs(file);
  const bk = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(bk.app).toBe('PadelUp');
  expect(bk.state.journal).toHaveLength(20);
  expect(await page.evaluate(() => S.lastBackup)).toBe(await page.evaluate(() => today()));
  await page.evaluate(() => { S.journal = []; save(); });
  const [fc] = await Promise.all([page.waitForEvent('filechooser'), page.click('[data-act=restore]')]);
  await fc.setFiles(file);
  await page.click('[data-act=restoreDo]');
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => S.journal.length)).toBe(20);
});

test('Schnell-Eintrag, Bearbeiten und Ziel erreichen', async ({ page }) => {
  await open(page, () => { base(); S.tab = 'journal'; S.jtab = 'entries';
    S.journal = [{ id: 'a', ts: 1, type: 'Match', date: addDays(today(), -2), dur: 120, partner: 'Lena', rt: { bandeja: 5 }, rs: 10 }];
    S.goals = [{ id: 'g', type: 'sk', sk: 'bandeja', target: 6, start: 5, by: addDays(today(), 30), created: today() }]; });
  await page.click('[data-act=quick]');
  expect(await page.inputValue('#qpart')).toBe('Lena');
  await page.click('[data-act=ql][data-k=res][data-v=w]');
  await page.fill('#qopp', 'Ben & Jan');
  await page.click('[data-act=qlSave]');
  const q = await page.evaluate(() => S.journal.find(j => j.opp === 'Ben & Jan'));
  expect(q).toMatchObject({ type: 'Match', dur: 120, partner: 'Lena', res: 'w', rt: {} });
  await page.click('.sheet [data-act=journalEdit]');
  await expect(page.locator('.l-top h2')).toHaveText('Session bearbeiten');
  await slide(page, 'r_bandeja', 10);
  await page.fill('#jol', '3,5');
  await page.click('[data-act=saveJournal]');
  await expect(page.locator('.sheet h2')).toHaveText('Ziel erreicht!');
  const r = await page.evaluate(() => { const j = S.journal.find(j => j.opp === 'Ben & Jan'); return { b: j.rt.bandeja, ol: j.ol, done: !!S.goals[0].done, n: S.journal.length }; });
  expect(r).toEqual({ b: 10, ol: 3.5, done: true, n: 2 });
});

test('Trainingsplan mit Timer trägt ein Training ein', async ({ page }) => {
  await open(page, () => { base(); S.tab = 'missions'; });
  await page.locator('[data-act=plan]').first().click();
  await page.click('[data-act=planRun]');
  await expect(page.locator('.timer')).toBeVisible();
  const n = await page.evaluate(() => PR.p.blocks.length);
  for (let i = 0; i < n; i++) await page.click('[data-act=planNext]');
  const r = await page.evaluate(() => ({ type: JF.type, dur: JF.dur, notes: JF.notes, done: Object.values(S.plansDone).reduce((a, b) => a + b, 0) }));
  expect(r).toMatchObject({ type: 'Training', dur: 60, done: 1 });
  expect(r.notes).toContain('Trainingsplan');
});

test('Match-Briefing zeigt Bilanz und füllt den Eintrag vor', async ({ page }) => {
  await open(page, () => { base(); seedMatches(); S.tab = 'missions'; });
  await page.click('[data-act=brief]');
  await page.fill('#bopp', 'Ben & Jan');
  await page.fill('#bpart', 'Lena');
  await page.click('[data-act=briefGo]');
  await expect(page.locator('.sheet')).toContainText('Gegen Ben & Jan');
  await expect(page.locator('.sheet .plan li')).not.toHaveCount(0);
  await page.click('[data-act=briefLog]');
  expect(await page.evaluate(() => JF.partner + ' / ' + JF.opp)).toBe('Lena / Ben & Jan');
});

test('Ballflug-Animationen laufen (Lexikon und Quiz)', async ({ page }) => {
  await open(page, base);
  await page.click('[data-act=lexicon]');
  await page.click('[data-act=lexAnim][data-k=chiquita]');
  await page.waitForTimeout(2500);
  expect(await page.textContent('.astep')).toMatch(/[12]\/3/);
  await page.click('.sheet [data-act=closeModal]');
  await page.evaluate(() => startLesson('chiquita'));
  while (await page.$('[data-act=nextCard]')) await page.click('[data-act=nextCard]');
  await page.click('[data-act=peek]');
  await expect(page.locator('.sheet .anim')).toBeVisible();
  await expect(page.locator('.sheet')).toContainText('Die Chiquita');
});

for (const scheme of ['light', 'dark']) {
  test(`Alle Bereiche öffnen ohne Fehler (${scheme})`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: scheme });
    await open(page, () => { base(); seedMatches(); S.myRacket = RACKETS[5].id; });
    for (const tab of ['learn', 'missions', 'journal', 'league', 'profile']) {
      await page.click(`[data-act=tab][data-id=${tab}]`);
      await expect(page.locator('#main')).not.toBeEmpty();
    }
    for (const jt of ['entries', 'stats', 'gear']) {
      await page.click('[data-act=tab][data-id=journal]');
      await page.click(`[data-act=jtab][data-v=${jt}]`);
      await expect(page.locator('#main')).not.toBeEmpty();
    }
  });
}

test('Coach: Wochenfokus aus den letzten Matches und Wochenplan', async ({ page }) => {
  await open(page, () => { base(); seedMatches(); S.weekGoal = 3; S.unlockId = 'lob';
    S.journal.slice(0, 3).forEach(j => { j.res = 'l'; j.lost = 'lob'; }); }); // 3 der letzten 6 Matches über Lob verloren
  await expect(page.locator('.coach h2')).toHaveText('Fokus: Lob');
  await expect(page.locator('.coach')).toContainText('In 4 deiner letzten 6 Matches');
  // 3 Sessions + Lektion + Drill + Test = 6 Aufgaben
  await expect(page.locator('.citem')).toHaveCount(6);
  const trainings = await page.locator('.cbody b', { hasText: 'Training:' }).allTextContents();
  expect(new Set(trainings).size).toBe(trainings.length); // keine doppelten Pläne
  await page.locator('.citem .ck[data-act=coachTick]').first().click();
  await expect(page.locator('.coach .goal span')).toHaveText('1/6');
  // Fokus bleibt die Woche über stabil, auch wenn neue Daten kommen
  expect(await page.evaluate(() => { S.journal.forEach(j => j.lost = 'smash'); return coachWeek().F.k; })).toBe('lob');
});

test('Techniktest: Ergebnis speichern, Bestwert, Verlauf', async ({ page }) => {
  await open(page, () => { base(); S.tab = 'missions'; S.tt = { lobtief: [{ d: addDays(today(), -14), v: 4 }] }; });
  await page.click('[data-act=ttOpen][data-id=lobtief]');
  await expect(page.locator('#ttv')).toHaveText('4');
  for (let i = 0; i < 3; i++) await page.click('[data-act=ttStep][data-v="1"]');
  await page.click('[data-act=ttSave]');
  expect(await page.evaluate(() => S.tt.lobtief.map(x => x.v))).toEqual([4, 7]);
  await expect(page.locator('[data-act=ttOpen][data-id=lobtief]')).toContainText('Zuletzt 7/10');
});

test('Trainerstunde: Nachbereitung und Wiederholung nach 3 Tagen', async ({ page }) => {
  await open(page, () => { base(); S.tab = 'journal'; });
  await page.click('[data-act=journalNew]');
  await page.click('[data-act=jf][data-k=type][data-v=Trainerstunde]');
  await page.fill('#jc_learn', 'Schläger früher hoch');
  await page.fill('#jc_avoid', 'Zu spät drehen');
  await page.fill('#jc_practice', 'Jede Bandeja in die Ecke');
  await page.click('[data-act=saveJournal]');
  const e = await page.evaluate(() => S.journal[0]);
  expect(e.coach.practice).toBe('Jede Bandeja in die Ecke');
  expect(e.rev).toEqual({ step: 0, next: await page.evaluate(() => addDays(today(), 3)) });
  // 3 Tage später: Pop-up beim Öffnen
  await page.evaluate(() => { S.journal[0].rev.next = today(); S.revAsked = null; save(); });
  await page.reload(); await page.waitForTimeout(1500);
  await expect(page.locator('.sheet h2')).toHaveText('Weißt du\'s noch?');
  await expect(page.locator('.sheet')).toContainText('Jede Bandeja in die Ecke');
  await page.click('[data-act=revOk]');
  expect(await page.evaluate(() => S.journal[0].rev)).toEqual({ step: 1, next: await page.evaluate(() => addDays(today(), 4)) });
});

test('Fokus-Modus blendet Liga und Shop aus', async ({ page }) => {
  await open(page, () => { base(); S.tab = 'profile'; });
  await expect(page.locator('[data-act=tab][data-id=league]')).toHaveCount(1);
  await page.click('[data-act=set][data-k=focusMode][data-v="1"]');
  await expect(page.locator('[data-act=tab][data-id=league]')).toHaveCount(0);
  await expect(page.locator('.top [data-act=shop]')).toHaveCount(0);
  await expect(page.locator('#main')).not.toContainText('Shop öffnen');
});
