// Task T-06 — acceptance check 45 (CRD 0002).
// The user names the job in their own words. Step 6 has to say what the PM does
// with a name that does not fit the shape.
import { pm, step, flat, check, done } from "../lib/qa.mjs";

const s6 = flat(step(pm(), 6));

check("the slug is the PM's to derive, not the user's to invent",
  /the slug is yours to derive/.test(s6) && /never ask the user to invent a slug/.test(s6), s6);
check("the user's words are never used as they stand",
  /Never use their words as the slug as they stand/.test(s6), s6);
check("the conversion is spelled out",
  /Convert it yourself: lower-case it, replace every run of characters the pattern does not allow with a single `-`, trim `-` off both ends/.test(s6), s6);
check("an empty result has a fallback", /use `job-<YYYY-MM-DD>` with today's date/.test(s6), s6);
check("a name already taken gets a suffix", /add `-2`, then `-3`, until the name is free/.test(s6), s6);
check("the chosen slug is told to the user before anything is created with it",
  /tell the user in one line which slug you will use, before you create anything with it/.test(s6), s6);

done();
