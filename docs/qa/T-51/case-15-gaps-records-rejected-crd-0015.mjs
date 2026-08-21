// T-51, CRD 0015 "where the knowledge goes": the two things that CRD asked for
// were rejected by the user, so both are recorded in `docs/qa/gaps.md` instead of
// being fixed.
//
// What it proves: a rejected change request does not become a forgotten one. Two
// separate gaps:
//   1. `role.deny?.includes("bash")` prints green for a role that moved to an
//      allow list — that role silently has no shell, and the check written for
//      exactly that failure passes. `tools/verify-mount.mjs` belongs to T-51, so
//      after handover NO task may fix it: the hole is permanent until a new job.
//   2. ADR 0010 asks for one more step in CLAUDE.md's "Adding or changing a
//      role" — update the three explicit lists in verify-mount.mjs — and today
//      no DoD row carries it.
// Neither is a check of behaviour, so neither can be a case; being written down
// is the whole remedy, and this case is what keeps them written down.
//
// QA does NOT pin the buggy behaviour itself: a case that asserted the green
// would turn a known hole into a requirement.

import { check, done, repoFile } from "../lib/qa.mjs";

const gaps = repoFile("docs/qa/gaps.md");
const entries = gaps.split(/\n(?=## )/);
const find = (needle) => entries.find((block) => block.includes(needle)) ?? "";

// --- gap 1: the allow-list hole
const hole = find('role.deny?.includes("bash")');
check("docs/qa/gaps.md records the allow-list shell hole", hole !== "", "the hole CRD 0015 named is not in the gap list");
check("that entry says the check prints green", hole.includes("打绿"), hole);
check("that entry names the file nobody may fix any more", hole.includes("tools/verify-mount.mjs"), hole);
check("that entry says the change request was rejected", hole.includes("否决") || hole.includes("rejected"), hole);
check("that entry points at CRD 0015", hole.includes("0015"), hole);
check("that entry says what to do instead", hole.includes("该怎么办"), hole);

// --- gap 2: the CLAUDE.md step with no carrier
const step = find("Adding or changing a role");
check("docs/qa/gaps.md records the missing CLAUDE.md step", step !== "", "ADR 0010's step is not in the gap list");
check("that entry names ADR 0010 as where the requirement comes from", step.includes("ADR 0010"), step);
check("that entry says three explicit lists have to be updated together", step.includes("三份"), step);
check("that entry names the three lists' file", step.includes("tools/verify-mount.mjs"), step);
// How much of the step IS carried today, named task row and all: the entry has
// to be exact about that, or the next reader either redoes T-60's row or trusts
// a carrier that only covers one of the three lists.
check("that entry says which task row carries part of it", step.includes("T-60"), step);
check("that entry says how much is still uncarried", step.includes("承载"), step);

// --- and the CRD itself is still in the repository as the road not taken
const crd = repoFile("docs/decisions/crd/0015-allow-list-shell-hole.md");
check("CRD 0015 is still in the repository", crd.length > 0);
check("CRD 0015 still records the rejection and who made it", crd.includes("rejected") && crd.includes("no leave it for now"), crd.slice(0, 200));

done();
