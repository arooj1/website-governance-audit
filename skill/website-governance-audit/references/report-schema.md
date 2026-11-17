# Report data: report.json

The report is written as data first, then rendered by `scripts/render-report.mjs` into one self-contained HTML page: table-first, colour-coded by severity, readable on a phone and printable. Writing data instead of free prose keeps every report in the same shape.

```bash
node scripts/render-report.mjs report.json --out report.html
```

A full worked example is in the repo: `examples/aroojqureshi.com.report.json`.

## Fields

| Field | Type | Notes |
| --- | --- | --- |
| `site` | string | Display name, e.g. `example.com`. Gets the one highlighter mark. |
| `url` | string | Address scanned. |
| `date` | string | `YYYY-MM-DD` of the scan. |
| `scanner` | string | e.g. `Scanner v1.1.0`. |
| `owner` | object | `origin` (place of establishment), `audience` (visitor regions), `confirmed` (true if the owner confirmed both; false shows "(inferred)"). |
| `summary` | string | Two or three sentences: the answer first. Inline markdown allowed. |
| `top_fixes` | string[] | The three finding IDs that matter most, in order. |
| `scope` | object[] | One per framework: `framework`, `status`, `why`. |
| `first_visit` | object[] | One per check: `check`, `result`, `flag`. |
| `findings` | object[] | See below. |
| `passes` | object[] | `item` (what's right), `clause`. |
| `owner_to_confirm` | object[] | `question`, optional `answer` (present = answered). |
| `coming_changes` | string[] | Proposed laws and dates to watch. |
| `method` | string | What was scanned, when, and what the scan cannot see. |

### Each finding

| Field | Notes |
| --- | --- |
| `id` | `F1`, `F2`… in severity order. |
| `severity` | `high` · `medium` · `low` (rules in SKILL.md). |
| `title` | Short, plain: what is wrong. |
| `saw` | Evidence, with page or path; quote verbatim where text is the evidence. |
| `clause` | `{ "text": "Law, section", "url": "official text" }`. |
| `why` | Why this law applies to this site, one sentence. |
| `risk` | Optional, one sentence. |
| `fix` | Specific: wording or code. |
| `fix_short` | Optional one-liner for the "Fix these first" table. |
| `effort` | e.g. `20 minutes`, `2 hours`, `2 days`. |
| `status` | `open` · `fixed` · `confirmed` (closed by the owner's answer) · `accepted` (risk accepted). |
| `status_note` | Optional, e.g. what the re-scan showed. |

## Allowed values and their colours

Colour never carries meaning alone: every chip also shows its word (WCAG 1.4.1).

| Value | Shown as | Colour |
| --- | --- | --- |
| `severity: high` | HIGH | Red |
| `severity: medium` | MEDIUM | Amber |
| `severity: low` | LOW | Blue |
| pass | PASS | Green |
| `scope.status: applies` | APPLIES | Indigo, filled |
| `scope.status: likely` | LIKELY APPLIES | Indigo, dashed outline |
| `scope.status: not_triggered` | NOT TRIGGERED | Grey |
| `scope.status: best_practice` | BEST PRACTICE ONLY | Grey outline |
| `first_visit.flag: ok / warn / bad / info` | OK / CHECK / ISSUE / INFO | Green / amber / red / grey |
| `status: open` | OPEN | Outlined |
| `status: fixed / confirmed` | FIXED / CLOSED | Green, filled |

Text fields accept inline markdown: `` `code` ``, `**bold**` and `[text](https://link)`. Nothing else is rendered as HTML, so site text quoted as evidence is always shown safely.
