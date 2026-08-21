// T-63 (checklist C-06) — DoD: T-70..T-78 shared item 4, and T-82 item 7.
//
// What it proves: all ten role prompts under `roles/` are really written in
// English. It walks the folder with readdirSync, so an eleventh role is scanned
// the day it is added; a hand-written list of ten names would miss it in silence.
//
// WHY THIS FILE EXISTS. Nine of the ten prompts carry a DoD cell saying "no
// Chinese in an English file", and that cell's stated verification was "the
// character range from docs/qa/T-52/case-16-no-chinese-characters.mjs". But
// case-16 reads `principles.md` and NOT ONE LINE of `roles/*.md`, so a Chinese
// character pasted into a role prompt left that cell green. That is not a weak
// check, it is a check that can never fire — case-16's own comment warns that
// "the same trap is waiting for anyone who writes a Chinese pin against
// roles/*.md". Five engineers reported the hole independently, and each scanned
// its own single file by hand as stand-in evidence. This case is that evidence
// made permanent, aimed at the whole folder.
//
// THE RANGE IS BORROWED, NOT REINVENTED. Check 3 reads case-16's own
// `const CJK = ...` literal out of its source and proves, code point by code
// point across the whole BMP, that the range used here is the same set. The two
// cases must judge the same thing and differ only in which files they read, so
// if one range moves and the other does not, this goes red. The notation
// differs on purpose: every character here is a \u escape, so this file stays
// ASCII and can never match itself by accident.
//
// PINNING STYLE: LINE-BASED (a character does not wrap), the same as case-16.
//
// ONE DOCUMENTED EXCEPTION, AND THE RANGE IS NOT NARROWED FOR IT. The range
// covers CJK ideographs AND the full-width punctuation this project's Chinese
// documents use. `roles/pm.md` holds one full-width colon, U+FF1A, and it is
// correct: it quotes the literal format of the Verdicts line,
// `- **Verdicts**<U+FF1A>`, and all 79 Verdicts lines in `docs/design/tasks.md`
// really do use the full-width colon (zero use the ASCII one), which is also
// why tools/verify-tasks.mjs accepts it. So check 6 keeps the FULL range on
// `pm.md` and allows U+FF1A only inside that one quoted format string: a
// full-width character anywhere else in `pm.md`, or a second one, is red.
// Check 5 then runs T-82 item 7's own narrower range (CJK ideographs only, its
// `grep -cP '[\x{4e00}-\x{9fff}]'`) on `pm.md` separately, so a real Chinese
// character there is caught by a check that knows nothing about the exception.
//
// One-way: these files are English and stay English.

import { readdirSync } from "node:fs";
import { join } from "node:path";
import { REPO, check, done, flat, repoFile } from "../lib/qa.mjs";

const MIRROR = "docs/qa/T-52/case-16-no-chinese-characters.mjs";

// CJK symbols and punctuation, ext A, unified ideographs, compatibility
// ideographs, and the full-width forms. Same set as case-16 (check 3).
const WIDE = /[\u3000-\u303F\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF01-\uFF60]/;
// T-82 item 7's own range: CJK ideographs, nothing else.
const HAN = /[\u4E00-\u9FFF]/;

const PM = "pm.md";
const COLON = "\uFF1A";
const VERDICTS_QUOTE = `- **Verdicts**${COLON}`;

const show = (character) => `U+${character.codePointAt(0).toString(16).toUpperCase().padStart(4, "0")}`;

/** Every line of `text` holding a character in `range`, one reportable string each. */
const offenders = (label, text, range) =>
  text.split("\n").flatMap((line, index) => {
    const match = range.exec(line);
    return match
      ? [`${label} line ${index + 1} (first: ${show(match[0])}): ${JSON.stringify(line.trim().slice(0, 80))}`]
      : [];
  });

const files = readdirSync(join(REPO, "roles"))
  .filter((name) => name.endsWith(".md"))
  .sort()
  .map((name) => ({ name, text: repoFile(`roles/${name}`) }));

// ---------------------------------------------------------------- premises
//
// Both of these exist so a prompt that went missing or empty cannot be read as
// a pass: a scan of nine files, or of ten empty ones, finds no Chinese either.
// The floor is `>= 10`, not `=== 10`, because this case is about every role
// prompt and must keep working when an eleventh arrives; C-01 is the case that
// pins the count at exactly ten.

check(
  `roles/ holds at least 10 .md prompts, including ${PM}`,
  files.length >= 10 && files.some((file) => file.name === PM),
  `${files.length} file(s): ${files.map((file) => file.name).join(", ") || "none"}`,
);

const unread = files.filter((file) => file.text.length < 500 || !file.text.startsWith("# Crew role: "));
check(
  "every prompt was actually read",
  unread.length === 0,
  `${unread.length} file(s): ${unread.map((file) => `roles/${file.name} (${file.text.length} bytes, starts ${JSON.stringify(file.text.slice(0, 20))})`).join("; ")}`,
);

// ------------------------------------------------ the range is the same one

const mirror = /^const CJK = \/(\[[^\n]*\])\/;$/m.exec(repoFile(MIRROR));
const sameSet = mirror
  ? (() => {
      const theirs = new RegExp(mirror[1]);
      for (let code = 0; code <= 0xffff; code += 1) {
        const character = String.fromCharCode(code);
        if (theirs.test(character) !== WIDE.test(character)) return show(character);
      }
      return true;
    })()
  : "no range found";
check(
  `the character range is the same set as ${MIRROR}'s`,
  sameSet === true,
  mirror
    ? `the two ranges disagree; first code point: ${sameSet}`
    : `${MIRROR} has no \`const CJK = /.../;\` line, so the range this case borrows cannot be compared`,
);

// ----------------------------------- T-70..T-78 item 4: the nine other prompts

const nine = files.filter((file) => file.name !== PM);
const wideHits = nine.flatMap((file) => offenders(`roles/${file.name}`, file.text, WIDE));
check(
  `the ${nine.length} prompts other than ${PM} hold no Chinese character and no full-width punctuation`,
  wideHits.length === 0,
  `${wideHits.length} line(s):\n      ${wideHits.slice(0, 10).join("\n      ")}`,
);

// -------------------------------------------------------------- T-82 item 7

const pm = files.find((file) => file.name === PM);
const hanHits = pm ? offenders(`roles/${PM}`, pm.text, HAN) : [`roles/${PM} is missing`];
check(
  `roles/${PM} holds no CJK ideograph`,
  hanHits.length === 0,
  `${hanHits.length} line(s):\n      ${hanHits.slice(0, 10).join("\n      ")}`,
);

// ------------- the full range on pm.md, with the one documented exception only
//
// Character by character, so the report names the real line. A hit counts as
// the documented exception only when it IS the full-width colon AND the text
// around it flattens to the quoted Verdicts format — flattened, so the pin
// survives that quotation being re-wrapped, and character-identity checked, so
// a different full-width character parked beside the quotation is still red.

const strayInPm = (() => {
  if (!pm) return [`roles/${PM} is missing`];
  const found = [];
  for (let index = 0; index < pm.text.length; index += 1) {
    const character = pm.text[index];
    if (!WIDE.test(character)) continue;
    const window = flat(pm.text.slice(Math.max(0, index - 40), index + 40));
    if (character === COLON && window.includes(VERDICTS_QUOTE)) continue;
    const line = pm.text.slice(0, index).split("\n").length;
    found.push(`roles/${PM} line ${line} (${show(character)}): ${JSON.stringify(window.trim().slice(0, 80))}`);
  }
  return found;
})();
check(
  `roles/${PM}'s only character in that range is the ${show(COLON)} of the quoted \`- **Verdicts**<${show(COLON)}>\` format`,
  strayInPm.length === 0,
  `${strayInPm.length} hit(s) outside that quotation:\n      ${strayInPm.slice(0, 10).join("\n      ")}`,
);

done();
