# Special Query Parameters

The game supports a few optional URL query parameters that tweak how it behaves. These parameters can be appended to the `index.html` URL when launching the game.

## `DemoMode`

- **Usage:** `?DemoMode=true`
- **Effect:** Reduces the interval between portal appearances from 100 points to 10 points, allowing you to quickly showcase later-game mechanics.
- **Default:** `false`

Use multiple parameters by separating them with `&`, for example:

```
index.html?DemoMode=true
```

Currently this is the only special query parameter recognized by the game. Additional parameters may be added in future updates.
