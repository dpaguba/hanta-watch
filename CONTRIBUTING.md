# Contributing to Hanta-Watch

Issues and pull requests are welcome.

## Getting set up

You need Python 3.10+ and Node 18+.

```bash
cd etl && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
(cd ../web && npm install)
```

Run the ETL once so the site has data, then start the dev server:

```bash
(cd etl && python -m etl.run --offline)
(cd web && npm run dev)
```

## Project layout

```
etl/
  etl/run.py          Orchestration: seed first, then each source in turn
  etl/seed.py         Hand-compiled figures with their citations
  etl/schema.py       Pydantic models, validated against the output before it is written
  etl/sources/        One module per upstream source, isolated from the rest
  tests/
web/
  src/pages/          One file per route
  src/components/     Map, charts, panels, skeletons
  src/lib/            Formatting, colour ramp, ISO codes, motion hooks
  public/data/        Published JSON, written by the ETL
```

## Conventions

- **Comments are documentation.** Docstrings and JSDoc explain what something
  is for. Running commentary inside a function body does not: if a line needs
  explaining, the explanation belongs in the docstring.
- **A source is never trusted to overwrite a number.** Sources add records and
  citations. Case counts change when the publishing agency changes them.
- **Confirmed and probable stay in separate columns.** They are never summed.
- **Labels have to match what is counted.** A figure labelled "last 12 months"
  must be a rolling twelve-month window, not a lifetime total.

## Adding a source

1. Create `etl/etl/sources/<name>.py` with a `fetch() -> dict[str, Any]`.
2. Register it in `SOURCES` in `run.py`.
3. Return `{}` when there is nothing. A source that cannot be read should let
   the transport error propagate, so the run is recorded as `error` rather than
   `empty`.
4. Add the licence and attribution terms to `docs/data-license.md`.

## Before opening a pull request

```bash
(cd etl && ruff check . && pytest -q)
(cd web && npm run lint && npm run typecheck && npm test -- --run && npm run build)
```

Each line runs in a subshell, so all of them start from the repository root. CI
runs the same checks.
