import React, { useState, useEffect, useRef } from 'react';

/* ─── PIXEL ART ────────────────────────────────────────────────────
   20 wide × 28 tall. '#' = on, '.' = off.
   Portable format: each row is a string; trivially converts to
   uint8_t bitmap arrays for ESP32 (TFT_eSPI drawBitmap or row-scan).
   20 cols pack into 3 bytes/row → 22 cards × 28 rows × 3 = ~1.8KB.
   ──────────────────────────────────────────────────────────────── */

const ART = {
  0: [
    '....................','........######......','.......#......#.....',
    '......#........#....','......#.##..##.#....','......#........#....',
    '......#...##...#....','......#..####..#....','.......#......#.....',
    '........######......','........#....#......','.......#..#...##....',
    '......#..#.....##...','.....#..#..######...','....#.###..#....#...',
    '....#.#.#..######...','....#...#...........','....#####...........',
    '......##............','......##............','......##............',
    '.....####...........','....##..##..........','...##....##.........',
    '...#......#.........','...#......#.........','..##......##........',
    '..##......##........',
  ],
  1: [
    '....................','......##......##....','.....####....####...',
    '....##..########..##','.....####....####...','......##......##....',
    '....................','.............#......','............#.......',
    '...........#........','........######......','.......#......#.....',
    '......#.##..##.#....','......#........#....','......#..####..#....',
    '.......#......#.....','........######......','........#....#......',
    '.......#......##....','......#........#....','......#........#....',
    '......#........#....','......#........#....','......#........#....',
    '......##......##....','.....####....####...','....................',
    '....................',
  ],
  2: [
    '....................','....##..........##..','....##....##....##..',
    '....##...####...##..','....##..##..##..##..','....##..##......##..',
    '....##..##......##..','....##..##..##..##..','....##...####...##..',
    '....##....##....##..','....##..........##..','....##..######..##..',
    '....##.#......#.##..','....##.#.##.##.#.##.','....##.#........#.##',
    '....##.#...##...#.##','....##.#..####..#.##','....##.#........#.##',
    '....##..########.##.','....##..#......#.##.','....##..#.####.#.##.',
    '....##..#.#..#.#.##.','....##..#.####.#.##.','....##..########.##.',
    '....##..#......#.##.','....##..#......#.##.','....##..########.##.',
    '....####........####',
  ],
  3: [
    '....................','......#..#..#.......','......#..#..#.......',
    '......########......','......#......#......','......#.######.#....',
    '......########......','.......########.....','......#........#....',
    '......#..#..#..#....','......#........#....','......#..####..#....',
    '.......#......#.....','........######......','.......#......#.....',
    '......#..####..#....','......#.##..##.#....','......#........#....',
    '......##.####.##....','.....####....####...','....#..##....##..#..',
    '....#.##......##.#..','....#.#........#.#..','....#.#..####..#.#..',
    '....#.#.##..##.#.#..','....#.#..####..#.#..','....#..#......#..#..',
    '....############....',
  ],
  4: [
    '....................','....##........##....','....##........##....',
    '....####....####....','......##....##......','......########......',
    '......#......#......','......#.#..#.#......','......#..##..#......',
    '......#.####.#......','......#......#......','.......######.......',
    '.....##########.....','....#..........#....','....#..######..#....',
    '....#..#....#..#....','....#..#....#..#....','....#..######..#....',
    '....#..........#....','....#....##....#....','....#....##....#....',
    '....#....##....#....','....#....##....#....','....#..........#....',
    '....##........##....','..####........####..','..####........####..',
    '..####........####..',
  ],
  5: [
    '....................','........#..#........','........####........',
    '......#######.......','......#.#.#.#.......','......#######.......',
    '....##############..','....#.#.#.#.#.#.#...','....##############..',
    '........####........','.......#....#.......','......#.##.##.#.....',
    '......#........#....','......#.######.#....','.......#......#.....',
    '........######......','........#....#......','.......#......#.....',
    '......#.#....#.#....','.....#..#....#..#...','....#...#....#...#..',
    '....#...#....#...#..','....#..###..###..#..','....#..#.#..#.#..#..',
    '....#..###..###..#..','....#...........#...','.....#.........#....',
    '......###########...',
  ],
  6: [
    '....................','........######......','.......########.....',
    '......##########....','.......########.....','........######......',
    '....................','....####....####....','...#....#..#....#...',
    '...#.##.#..#.##.#...','...#....#..#....#...','....####....####....',
    '....#..#....#..#....','....####....####....','....................',
    '....##.##....##.##..','...#######..#######.','..#########.########',
    '..#########.########','...#######.##########','....#####...########',
    '.....###.....######.','......#.......####..','..............##....',
    '....................','....................','....................',
    '....................',
  ],
  7: [
    '....................','...##############...','...#.#.#.#.#.#.#....',
    '...##############...','......................','........####........',
    '.......######.......','.......#.##.#.......','.......######.......',
    '........####........','.....############...','....#............#..',
    '....#..########..#..','....#..#......#..#..','....#..#..##..#..#..',
    '....#..#..##..#..#..','....#..#......#..#..','....#..########..#..',
    '....#............#..','....##############..','....................',
    '....####......####..','...######....######.','..########..########',
    '..###..###..###..###','..########..########','...######....######.',
    '....####......####..',
  ],
  8: [
    '....................','......##......##....','.....####....####...',
    '....##..########..##','.....####....####...','......##......##....',
    '....................','.......####.........','......#....#........',
    '......#.##.#........','......#....#........','......##..##........',
    '.......####.........','........#.##........','.......#....####....',
    '......#..#.#....#...','.....#...##.##..#...','....#.##..##.#..#...',
    '...#..##..####..#...','...#..##....#...#...','...#..####..#..#....',
    '....#......#..#.....','....#####.#..#......','........#.####......',
    '........#...........','........###.........','........###.........',
    '........###.........',
  ],
  9: [
    '....................','.........####.......','........######......',
    '.......########.....','......##########....','......##########....',
    '......##########....','......##.####.##....','......#..####..#....',
    '.....##.######.##...','.....#.########.#...','....##.########.##..',
    '....#..########..#..','...##..########..##.','...#...########...#.',
    '...#....######....#.','...#.....####.....#.','....#.............#.',
    '....##...........##.','....####..######....','.......#.#......#...',
    '.......#.#.####.#...','.......#.#.####.#...','.......#.#.####.#...',
    '.......#.#......#...','.......#.########...','.......#............',
    '.......#............',
  ],
  10: [
    '....................','........####........','......########......',
    '.....##########.....','....############....','...#######.######...',
    '...######...#####...','..######..#..#####..','..#####..###..####..',
    '..####..##.##..###..','..####..##.##..###..','..####.###.###.###..',
    '..##############....','..##############....','..####.###.###.###..',
    '..####..##.##..###..','..####..##.##..###..','..#####..###..####..',
    '..######..#..#####..','...######...#####...','...#######.######...',
    '....############....','.....##########.....','......########......',
    '........####........','....................','....................',
    '....................',
  ],
  11: [
    '....................','.........##.........','.........##.........',
    '.......######.......','......#......#......','.....#.##..##.#.....',
    '.....#........#.....','.....#..####..#.....','......#......#......',
    '.......######.......','........####........','..##############....',
    '..#.#.#.#.#.#.#.....','..##############....','..#...#......#...#..',
    '..#...#......#...#..','..#...#......#...#..','.###..#......#..###.',
    '#####.#......#.#####','.###..#......#..###.','......#......#......',
    '......#......#......','......#......#......','......#......#......',
    '......#......#......','......#......#......','.....##......##.....',
    '....####....####....',
  ],
  12: [
    '....................','..################..','..#.#.#.#.#.#.#.#...',
    '..################..','.........#..........','.........#..........',
    '.........#..........','.........#..........','.........#..........',
    '.........#..........','.........######.....','........#..........#',
    '.......##..........#','......####..........','.....######.........',
    '....########........','.....######.........','......####..........',
    '.......##...........','.......##...........','......####..........',
    '......#..#..........','.....#....#.........','....#......#........',
    '...#........#.......','...#........#.......','..##........##......',
    '..##........##......',
  ],
  13: [
    '....................','............####....','...........######...',
    '..........########..','..........##....##..','..........##....##..',
    '..........########..','...........######...','..........#.####.#..',
    '.........#..####..#.','.........#..####..#.','..........#.####.#..',
    '...........######...','............####....','.############.......',
    '############........','............#.......','............#.......',
    '...........##.......','..........###.......','.........####.......',
    '........####........','.......####.........','......####..........',
    '.....####...........','....####............','....##..............',
    '....................',
  ],
  14: [
    '....................','........######......','.......########.....',
    '.......##....##.....','.......##....##.....','.......########.....',
    '........######......','....##..########..##','...####.########.####',
    '..##..#.########.#..##','..#...############...#','..#...############...#',
    '..##..#.########.#..##','...####.########.####','....##..########..##',
    '........########....','........#......#....','........#......#....',
    '........#..##..#....','........#..##..#....','........#..##..#....',
    '.......##########...','.......##########...','......#...#..#...#..',
    '......#...####...#..','......#..........#..','......############..',
    '....................',
  ],
  15: [
    '....................','....##..........##..','...####........####.',
    '..######......######','...####........####.','....##..........##..',
    '........######......','.......########.....','......####..####....',
    '......##.#..#.##....','......####..####....','......####..####....',
    '.......########.....','........######......','.......########.....',
    '......##########....','.....############...','....##############..',
    '....##############..','.....############...','.....#...#..#...#...',
    '.....#...#..#...#...','....###.###.###.###.','....#.#.#.#.#.#.#.#.',
    '....###.###.###.###.','....................','....................',
    '....................',
  ],
  16: [
    '....................','....######..........','....######..........',
    '.....####.##........','.........#..........','........#...........',
    '.......#####........','.......#...#........','......########......',
    '.....##########.....','.....##########.....','.....#.######.#.....',
    '.....##########.....','.....##########.....','.....##..##..##.....',
    '.....##..##..##.....','.....##########.....','.....##..##..##.....',
    '.....##..##..##.....','.....##########.....','.....##..##..##.....',
    '.....##..##..##.....','.....##########.....','.....##..##..##.....',
    '.....##..##..##.....','.....##########.....','....############....',
    '....############....',
  ],
  17: [
    '....................','.........#..........','........###.........',
    '.........#..........','...#.....#.....#....','...##....#....##....',
    '....##...#...##.....','.....##..#..##......','......#######.......',
    '...#############....','......#######.......','.....##..#..##......',
    '....##...#...##.....','...##....#....##....','...#.....#.....#....',
    '....................','........####........','.......#....#.......',
    '......#.####.#......','.....#..####..#.....','.....#..####..#.....',
    '......#.####.#......','.......######.......','....................',
    '.~~~~~~~~~~~~~~~~~~.','....................','....................',
    '....................',
  ],
  18: [
    '....................','..####......####....','..####......####....',
    '..####......####....','..####......####....','.......######.......',
    '.....##########.....','....####....####....','...####......####...',
    '...###........####..','..###..........####.','..###..##.......####',
    '..###.####......####','..###..##.......####','..###...........####',
    '..###...####....####','..###....##....####.','...###........####..',
    '...####......####...','....####....####....','.....##########.....',
    '.......######.......','....................','....####......####..',
    '...######....######.','..########..########','..########..########',
    '..########..########',
  ],
  19: [
    '....................','..#....#..#....#....','...#...#..#...#.....',
    '....#..#..#..#......','.....#########......','....###########.....',
    '...#############....','...####.....####....','..####.##.##.####...',
    '..####.##.##.####...','..###.........###...','#####.........#####.',
    '..###.........###...','..###..#...#..###...','..####..###..####...',
    '..####.......####...','...####.....####....','...#############....',
    '....###########.....','.....#########......','....#..#..#..#......',
    '...#...#..#...#.....','..#....#..#....#....','....................',
    '....................','....................','....................',
    '....................',
  ],
  20: [
    '....................','......######........','.....########.......',
    '.....##....##.......','.....########.......','......######........',
    '..#########.........','..##########........','..###########.......',
    '..############......','...###########......','....####............',
    '....####............','....................','....................',
    '...####.####.####...','..######.####.######','..######.####.######',
    '..######.####.######','.######..####..#####','######....##....####',
    '#####.....##.....###','####..............##','###................#',
    '##..................','#...................','....................',
    '....................',
  ],
  21: [
    '....................','......########......','....############....',
    '...####......####...','..###..........###..','..##...#####....##..',
    '.###..#######...###.','.##..##.....##...##.','.##..##..#..##...##.',
    '.##..##..#..##...##.','.##..##.....##...##.','.##...#.....#....##.',
    '.##...#######....##.','.##...#..#..#....##.','.##..##..#..##...##.',
    '.##..#...#...#...##.','.##..#..###..#...##.','.##..#..#.#..#...##.',
    '.##..#.##.##.#...##.','..##..........#..##.','..###.........#.###.',
    '...####.#...#.####..','....############....','......########......',
    '....................','....................','....................',
    '....................',
  ],
};

// ─── ARCANA METADATA ─────────────────────────────────────────────

const MAJOR_ARCANA = [
  { num: 0,  roman: '0',     name: 'The Fool',           up: 'a leap into the unknown. beginnings before the map exists. spontaneity as a form of faith.', rev: 'the leap delayed. recklessness dressed as courage, or hesitation dressed as wisdom.' },
  { num: 1,  roman: 'I',     name: 'The Magician',       up: 'resources aligned with intention. you already hold the tools. now the question is use.', rev: 'scattered energy. tools in hand, direction missing.' },
  { num: 2,  roman: 'II',    name: 'High Priestess',     up: 'intuition speaking under the surface. what you already know but have not said aloud.', rev: 'static on the inner line. the signal is there, the receiver is not tuned.' },
  { num: 3,  roman: 'III',   name: 'The Empress',        up: 'abundance, creative body-knowing. growth that does not require force.', rev: 'fertility blocked. smothering, or the fear of your own output.' },
  { num: 4,  roman: 'IV',    name: 'The Emperor',        up: 'structure as shelter. the foundation that lets the wild thing grow.', rev: 'structure as cage. rigidity where flexibility was needed.' },
  { num: 5,  roman: 'V',     name: 'The Hierophant',     up: 'tradition, lineage, the teacher. inheritance that still works.', rev: 'breaking from the script. the institution does not hold your answer.' },
  { num: 6,  roman: 'VI',    name: 'The Lovers',         up: 'a choice made with the whole self. alignment between what you want and what you value.', rev: 'misalignment. the choice made with only part of yourself.' },
  { num: 7,  roman: 'VII',   name: 'The Chariot',        up: 'forward through opposition. holding two reins, moving anyway.', rev: 'motion without direction. forcing what should be steered.' },
  { num: 8,  roman: 'VIII',  name: 'Strength',           up: 'soft power. the lion calmed by presence, not force.', rev: 'white-knuckling. strength confused with strain.' },
  { num: 9,  roman: 'IX',    name: 'The Hermit',         up: 'the solitary search. the lamp you carry is enough light.', rev: 'isolation past its use. the lamp has become the room.' },
  { num: 10, roman: 'X',     name: 'Wheel of Fortune',   up: 'the cycle turns. timing shifts in your favor. a room you were locked out of opens.', rev: 'the turn caught against you. not forever — just now.' },
  { num: 11, roman: 'XI',    name: 'Justice',            up: 'truth weighed carefully. consequences meeting their cause.', rev: 'the scale off by a thumb. something unaccounted for.' },
  { num: 12, roman: 'XII',   name: 'The Hanged Man',     up: 'willing pause. the view changes when you stop insisting on your feet.', rev: 'stalled. the pause became the point, and you forgot why you stopped.' },
  { num: 13, roman: 'XIII',  name: 'Death',              up: 'ending that clears the room. the part of you that has to go for the next part to arrive.', rev: 'holding on past the end. the ghost kept on payroll.' },
  { num: 14, roman: 'XIV',   name: 'Temperance',         up: 'patient synthesis. the slow blend. the third thing made from two.', rev: 'too much, too fast. the mix broken.' },
  { num: 15, roman: 'XV',    name: 'The Devil',          up: 'what you consented to without noticing. the chain is there because you are holding it.', rev: 'the chain released. seeing the shape of the cage is the first step out.' },
  { num: 16, roman: 'XVI',   name: 'The Tower',          up: 'the false structure falls. what breaks could not have held.', rev: 'the collapse you are bracing against, or the one you narrowly avoided.' },
  { num: 17, roman: 'XVII',  name: 'The Star',           up: 'hope after the storm. quiet healing. the sky clear enough to navigate.', rev: 'faith flickering. the stars behind cloud cover.' },
  { num: 18, roman: 'XVIII', name: 'The Moon',           up: 'the dream-logic phase. things half-seen. trust the shape before the name.', rev: 'the fog lifting. what was distorted becomes specific.' },
  { num: 19, roman: 'XIX',   name: 'The Sun',            up: 'clarity, warmth, the uncomplicated yes. vitality without qualification.', rev: 'brightness that is performing. joy strained through should.' },
  { num: 20, roman: 'XX',    name: 'Judgement',          up: 'a call you can answer now. the past reconciled into a new name.', rev: 'the call unanswered. self-judgement heavier than clarity.' },
  { num: 21, roman: 'XXI',   name: 'The World',          up: 'completion. the loop closed. arrival at a place you did not yet know you were walking to.', rev: 'almost-there. the last step still waiting.' },
];

// ─── STYLE TOKENS ─────────────────────────────────────────────────

const C = {
  bg: '#0a0704',
  amber: '#ffb000',
  amberBright: '#ffcc3d',
  amberDim: '#7a5208',
  amberDark: '#2e2008',
  amberGlow: 'rgba(255,176,0,0.5)',
  red: '#ff4a3d',
  redSoft: '#ff8077',
  redDim: '#5a1510',
  redGlow: 'rgba(255,74,61,0.5)',
};

const HEAD = { fontFamily: '"Press Start 2P", monospace', letterSpacing: '0.08em' };
const BODY = { fontFamily: '"VT323", "Courier New", monospace' };

// Target hardware: ideaspark ESP32 dev board, ST7789 1.9" LCD, 170×320.
// Screen aspect ratio = 170/320 = 0.53125 (slightly narrower than 7:12 tarot).
const SCREEN_W = 170;
const SCREEN_H = 320;

// ─── MAIN ─────────────────────────────────────────────────────────

export default function TechnoTarot() {
  const [state, setState] = useState('sleep');
  const [card, setCard] = useState(null);
  const [reversed, setReversed] = useState(false);
  const [flipDir, setFlipDir] = useState(0);
  const [drawKey, setDrawKey] = useState(0);

  useEffect(() => {
    if (document.getElementById('tt-fonts')) return;
    const link = document.createElement('link');
    link.id = 'tt-fonts';
    link.href = 'https://fonts.googleapis.com/css2?family=Press+Start+2P&family=VT323&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
  }, []);

  const sleepTimer = useRef(null);
  const bumpSleep = () => {
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    sleepTimer.current = setTimeout(() => setState('sleep'), 45000);
  };
  useEffect(() => {
    if (state !== 'sleep') bumpSleep();
    return () => sleepTimer.current && clearTimeout(sleepTimer.current);
  }, [state]);

  const touch = useRef(null);
  const onPointerDown = (e) => {
    touch.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  };
  const onPointerUp = (e) => {
    if (!touch.current) return;
    const dx = e.clientX - touch.current.x;
    const dy = e.clientY - touch.current.y;
    const dt = Date.now() - touch.current.t;
    const adx = Math.abs(dx), ady = Math.abs(dy);
    touch.current = null;
    bumpSleep();

    const TAP = 10, SWIPE = 28;
    if (adx < TAP && ady < TAP && dt < 400) {
      if (state === 'sleep') setState('prompt');
      return;
    }
    if (ady > SWIPE && ady > adx && dy < 0) {
      drawCard();
      return;
    }
    if (adx > SWIPE && adx > ady) {
      if (state === 'card') {
        setFlipDir(dx > 0 ? 1 : -1);
        setState('meaning');
      } else if (state === 'meaning') {
        setFlipDir(dx > 0 ? -1 : 1);
        setState('card');
      }
    }
  };

  function drawCard() {
    const next = MAJOR_ARCANA[Math.floor(Math.random() * MAJOR_ARCANA.length)];
    setCard(next);
    setReversed(Math.random() < 0.4);
    setFlipDir(0);
    setDrawKey(k => k + 1);
    setState('card');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#000',
        backgroundImage:
          'radial-gradient(circle at 30% 20%, #1a0f05 0%, #000 60%), radial-gradient(circle at 70% 80%, #0f0804 0%, #000 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      }}
    >
      <Device
        state={state}
        card={card}
        reversed={reversed}
        flipDir={flipDir}
        drawKey={drawKey}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      />
    </div>
  );
}

// ─── DEVICE: ideaspark 1.9" board form factor ────────────────────
// Screen is 170:320 (≈0.531). Outer case adds a slim bezel.

function Device({ state, card, reversed, flipDir, drawKey, onPointerDown, onPointerUp }) {
  return (
    <div
      style={{
        // Device outer: screen + small bezels → end up near 170:320 overall
        height: 'min(92vh, 720px)',
        aspectRatio: `${SCREEN_W} / ${SCREEN_H + 40}`, // +40 for top/bottom bezel strips
        padding: 10,
        background: 'linear-gradient(180deg, #181412 0%, #0c0906 100%)',
        borderRadius: 16,
        boxShadow:
          '0 2px 0 #2a1f14 inset, 0 -2px 0 #000 inset, 0 30px 60px rgba(0,0,0,0.7), 0 0 0 2px #2a1f14',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
      }}
    >
      {/* Top bezel — mimics the dev board's branding strip */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1px 4px 0',
          ...HEAD,
          fontSize: 6,
          color: C.amberDim,
          letterSpacing: '0.12em',
        }}
      >
        <span>IDEASPARK 1.9"</span>
        <PowerLed on={state !== 'sleep'} />
      </div>

      {/* Screen — EXACTLY 170:320 */}
      <div
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: `${SCREEN_W} / ${SCREEN_H}`,
          background: state === 'sleep' ? '#050302' : C.bg,
          border: `2px solid ${C.amberDark}`,
          borderRadius: 3,
          overflow: 'hidden',
          touchAction: 'none',
          userSelect: 'none',
          cursor: state === 'sleep' ? 'pointer' : 'default',
          transition: 'background 0.4s',
        }}
      >
        {state === 'sleep' && <SleepScreen />}
        {state === 'prompt' && <PromptScreen />}
        {state === 'card' && (
          <CardScreen key={`c-${drawKey}`} card={card} reversed={reversed} flipDir={flipDir} />
        )}
        {state === 'meaning' && (
          <MeaningScreen key={`m-${drawKey}`} card={card} reversed={reversed} flipDir={flipDir} />
        )}

        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.22) 0px, rgba(0,0,0,0.22) 1px, transparent 1px, transparent 3px)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.7) 100%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute', inset: 0,
            boxShadow: `inset 0 0 50px ${state === 'sleep' ? 'rgba(0,0,0,0.9)' : C.amberDark}`,
            pointerEvents: 'none',
          }}
        />
      </div>

      {/* Bottom bezel: the PCB / USB-C side */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 4px 1px',
        }}
      >
        <span style={{ ...HEAD, fontSize: 5, color: C.amberDim, letterSpacing: '0.2em' }}>
          ESP32-WROOM
        </span>
        <span style={{ ...HEAD, fontSize: 5, color: C.amberDim, letterSpacing: '0.2em' }}>
          USB-C
        </span>
      </div>
    </div>
  );
}

function PowerLed({ on }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: 5, height: 5, borderRadius: '50%',
        background: on ? C.amber : '#2a1f14',
        boxShadow: on ? `0 0 6px ${C.amberGlow}` : 'none',
        transition: 'all 0.3s',
      }}
    />
  );
}

// ─── SCREENS ──────────────────────────────────────────────────────

function SleepScreen() {
  return (
    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div
        style={{
          ...HEAD, fontSize: 9,
          color: '#3a2a10', letterSpacing: '0.5em',
          animation: 'ttBreathe 3s ease-in-out infinite',
        }}
      >
        · · ·
      </div>
      <style>{`
        @keyframes ttBreathe {
          0%, 100% { opacity: 0.25 }
          50%      { opacity: 0.85 }
        }
      `}</style>
    </div>
  );
}

function PromptScreen() {
  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'space-between',
        padding: '8% 6%',
        animation: 'ttWake 0.5s ease-out',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            ...HEAD,
            fontSize: 'clamp(8px, 2.4vw, 11px)',
            color: C.amber,
            textShadow: `0 0 10px ${C.amberGlow}`,
            lineHeight: 1.6,
          }}
        >
          TECHNO<br />— TAROT —
        </div>
        <div
          style={{
            ...BODY,
            fontSize: 'clamp(12px, 2.8vw, 18px)',
            color: C.amberDim,
            marginTop: 8,
          }}
        >
          &gt; ready
        </div>
      </div>
      <ArrowUp />
      <div
        style={{
          ...HEAD,
          fontSize: 'clamp(6px, 1.8vw, 9px)',
          color: C.amber,
          letterSpacing: '0.22em',
          textAlign: 'center',
          animation: 'ttBlink 1.1s steps(2, start) infinite',
          lineHeight: 1.6,
        }}
      >
        SWIPE UP<br />TO DRAW
      </div>
      <style>{`
        @keyframes ttWake  { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ttBlink { 50%  { opacity: 0.25 } }
      `}</style>
    </div>
  );
}

function ArrowUp() {
  const grid = ['..#..', '.###.', '#####', '..#..', '..#..', '..#..'];
  return (
    <div
      style={{
        display: 'flex', flexDirection: 'column', gap: 1,
        animation: 'ttFloat 1.4s ease-in-out infinite',
      }}
    >
      {grid.map((row, i) => (
        <div key={i} style={{ display: 'flex', gap: 1 }}>
          {row.split('').map((ch, j) => (
            <div
              key={j}
              style={{
                width: 6, height: 6,
                background: ch === '#' ? C.amber : 'transparent',
                boxShadow: ch === '#' ? `0 0 4px ${C.amberGlow}` : 'none',
              }}
            />
          ))}
        </div>
      ))}
      <style>{`
        @keyframes ttFloat {
          0%, 100% { transform: translateY(0) }
          50%      { transform: translateY(-5px) }
        }
      `}</style>
    </div>
  );
}

function CardScreen({ card, reversed, flipDir }) {
  const color = reversed ? C.red : C.amber;
  const glow = reversed ? C.redGlow : C.amberGlow;
  const enterX = flipDir === 0 ? 0 : flipDir === 1 ? -60 : 60;

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column',
        padding: '5% 5%',
        transform: reversed ? 'rotate(180deg)' : 'none',
        animation: 'ttSlideIn 0.35s ease-out',
        ['--enterX']: `${enterX}px`,
      }}
    >
      <div
        style={{
          position: 'absolute', inset: '3%',
          border: `1px solid ${color}`,
          boxShadow: `0 0 8px ${glow}, inset 0 0 8px ${glow}`,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          ...HEAD,
          fontSize: 'clamp(9px, 2.8vw, 13px)',
          color, textShadow: `0 0 8px ${glow}`,
          textAlign: 'center',
          paddingTop: 6,
          zIndex: 1,
        }}
      >
        {card.roman}
      </div>

      <div
        style={{
          flex: 1,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1,
        }}
      >
        <PixelArt bitmap={ART[card.num]} color={color} />
      </div>

      <div style={{ textAlign: 'center', paddingBottom: 6, zIndex: 1 }}>
        <div
          style={{
            ...HEAD,
            fontSize: 'clamp(7px, 2.2vw, 11px)',
            color, textShadow: `0 0 8px ${glow}`,
            lineHeight: 1.5,
            textTransform: 'uppercase',
          }}
        >
          {card.name}
        </div>
        <div
          style={{
            ...BODY,
            fontSize: 'clamp(11px, 2.6vw, 16px)',
            color: reversed ? C.redSoft : C.amberBright,
            marginTop: 4,
          }}
        >
          {reversed ? '— reversed —' : '— upright —'}
        </div>
      </div>

      <style>{`
        @keyframes ttSlideIn {
          from { opacity: 0; transform: translateX(var(--enterX)) ${reversed ? 'rotate(180deg)' : ''} }
          to   { opacity: 1; transform: translateX(0) ${reversed ? 'rotate(180deg)' : ''} }
        }
      `}</style>
    </div>
  );
}

function MeaningScreen({ card, reversed, flipDir }) {
  const color = reversed ? C.red : C.amber;
  const glow = reversed ? C.redGlow : C.amberGlow;
  const text = reversed ? card.rev : card.up;
  const enterX = flipDir === 0 ? 0 : flipDir === 1 ? -60 : 60;

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        padding: '6% 7%',
        display: 'flex', flexDirection: 'column',
        animation: 'ttSlideIn 0.35s ease-out',
        ['--enterX']: `${enterX}px`,
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <div
          style={{
            ...HEAD,
            fontSize: 'clamp(8px, 2.4vw, 11px)',
            color, textShadow: `0 0 10px ${glow}`,
            lineHeight: 1.4,
          }}
        >
          {card.roman}. {card.name.toUpperCase()}
        </div>
        <div
          style={{
            ...HEAD,
            fontSize: 'clamp(5px, 1.6vw, 7px)',
            color,
            letterSpacing: '0.2em',
            marginTop: 4,
          }}
        >
          {reversed ? '[ REVERSED ]' : '[ UPRIGHT ]'}
        </div>
      </div>

      <div
        style={{
          height: 2,
          margin: '10px 0',
          background: `repeating-linear-gradient(90deg, ${color} 0 5px, transparent 5px 10px)`,
        }}
      />

      <div
        style={{
          ...BODY,
          fontSize: 'clamp(12px, 2.9vw, 17px)',
          color: reversed ? C.redSoft : C.amberBright,
          lineHeight: 1.35,
          letterSpacing: '0.02em',
          flex: 1,
          overflowY: 'auto',
        }}
      >
        {text}
      </div>

      <div
        style={{
          ...HEAD,
          fontSize: 'clamp(5px, 1.4vw, 7px)',
          color: C.amberDim,
          letterSpacing: '0.18em',
          textAlign: 'center',
          lineHeight: 1.8,
          marginTop: 8,
        }}
      >
        &lt;─ SWIPE BACK ─&gt;<br />SWIPE UP · NEW CARD
      </div>
    </div>
  );
}

// ─── PIXEL ART RENDERER ──────────────────────────────────────────

function PixelArt({ bitmap, color }) {
  if (!bitmap) return null;
  const W = bitmap[0].length;
  const H = bitmap.length;
  // scale pixel size based on the narrow screen geometry
  const px = `min(calc(48vh / ${H}), calc(18vw / ${W}))`;
  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {bitmap.map((row, y) => (
        <div key={y} style={{ display: 'flex' }}>
          {row.split('').map((ch, x) => (
            <div
              key={x}
              style={{
                width: px, height: px,
                background: ch === '#' ? color : 'transparent',
                boxShadow: ch === '#' ? `0 0 2px ${color}` : 'none',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
