# Endless Corridor
Draw spells, learn your own skills, survive the paper horde. Plain ES modules, no build step.

Run locally (modules need a server): `python3 -m http.server` then open http://localhost:8000
Deploy: push this folder to a repo, then Settings → Pages → deploy from branch (root).

js/: config (tuning, spell defs) · state · waves · recog (patterns, gestures) · spells (effects, levels) · combat (casting, enemy turn) · render · input · ui (menus, HUD) · audio · util
Add a spell: define it in config.js SPELLS, detect it in recog.js `shape`, give it an effect in spells.js `fire`.
