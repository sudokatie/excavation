# Excavation

A browser-based Boulder Dash style puzzle game. Dig for gems, avoid falling rocks, and don't get crushed.

## Play

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## How to Play

You're a miner in a cave full of dirt, gems, and boulders.

- **Dig** through dirt to create paths
- **Collect gems** to unlock the exit
- **Watch out** for falling boulders - they'll crush you!
- **Push boulders** horizontally to clear paths or trigger chain reactions
- **Listen** to retro sound effects (synthesized via Web Audio API)
- **Background music** with underground, digging-themed chiptune
- **Compete** on the local high score leaderboard
- **8 levels** of increasing difficulty

## Controls

### Keyboard
| Key | Action |
|-----|--------|
| Arrow Keys / WASD | Move and dig |
| Ctrl + Direction | Dig without moving |
| P | Pause |
| R | Restart level |
| ESC | Return to menu |

### Mobile / Touch
| Gesture | Action |
|---------|--------|
| Swipe | Move and dig |

## Physics

- Boulders and gems fall when unsupported
- Objects roll off rounded surfaces (other boulders, gems, walls)
- Chain reactions can cascade through the level
- Getting crushed by a falling object = game over

## Levels

1. **Tutorial: Digging** - Learn to dig and collect gems
2. **Tutorial: Boulders** - Introduction to falling rocks
3. **Cave 1: Timing** - Multiple boulders require careful timing
4. **Cave 2: Rolling** - Master the rolling mechanics
5. **Cave 3: Cascade** - Chain reactions and complex puzzles

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- HTML5 Canvas
- Tailwind CSS

## Development

```bash
npm test        # Run tests
npm run lint    # Check for issues
npm run build   # Production build
```

## Credits

Inspired by Boulder Dash (1984) by Peter Liepa and Chris Gray.

## License

MIT
