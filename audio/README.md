# NASJ audio assets

`manifest.json` is the single source of truth: it maps a content key to a file.

| Group    | Source                                                               | Status |
|----------|----------------------------------------------------------------------|--------|
| effects  | `effects/*.wav`, original synthesised sounds (`assets/tools/build_audio.py`) | included |
| music    | `music/ambient.wav`, original synthesised loop                       | included |
| speech   | recorded voice files, **not included**                               | to record |

Until a recording exists for a key, the app says the word with the **device's speech synthesis**
(a fallback, not a prerecorded voice). Text and pictures are always shown, so audio is never required.

## Adding recorded voices

1. Record the lines below (voice talent, mp3 or ogg, mono, ~64 kbps is plenty).
2. Save them next to this file using the key as the path, e.g. `ar/words/qamar.mp3`.
3. Register each in `manifest.json` under `speech`:

```json
"speech": {
  "ar/words/qamar": "ar/words/qamar.mp3",
  "fr/words/pomme": "fr/words/pomme.mp3"
}
```

Keys currently used by the learning content:

- `fr/words/` pomme, lune, chat, poisson, maison, arbre, soleil, livre, banane, voiture
- `ar/words/` tuffaha, qamar, qitta, samaka, bayt, shajara, shams, kitab, mawza, sayyara
- `ar/letters/0` … `ar/letters/13` (أ ب ت ث ج ح د ر س ش ق ك م ن), in that order
- `fr/letters/` a, b, c, d, e, f, l, m, p, s, v
- `fr/story/star-1` … `star-4`, `fr/story/kite-1` … `kite-4` (story narration; falls back to the scene text)
