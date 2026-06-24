# 🎮 Battle Survival - Offline Game

An exciting offline tablet/mobile game built with vanilla HTML5, CSS3, and JavaScript. No internet connection required!

## Features

- ⚔️ **Survival Combat**: Defeat waves of enemies to increase your score
- 📱 **Multi-Platform**: Works on desktop, tablet, and mobile devices
- 🎮 **Multiple Input Methods**: Keyboard, mouse, and touch controls
- 🏆 **Progressive Difficulty**: Enemies spawn faster and in greater numbers as you progress
- 🎯 **Responsive Design**: Adapts to any screen size
- 💾 **No Installation**: Play directly in your browser
- 🌐 **Offline Play**: Works completely without internet

## How to Play

### Objective
Survive as long as possible by defeating enemies. Each enemy defeated earns you points!

### Controls

**Desktop:**
- **Move**: Arrow Keys or WASD
- **Look**: Move your mouse
- **Attack**: Space Bar or Click

**Mobile/Tablet:**
- **Move**: Swipe in the direction you want to go
- **Attack**: Tap the screen

### Game Mechanics

1. **Health System**: You start with 100 HP. Enemies can damage you when they're close enough.
2. **Combat**: Attack enemies within your attack range to deal damage
3. **Enemy Types**:
   - **Normal Enemies** (Green): 30 HP, 5 damage
   - **Strong Enemies** (Yellow): 50 HP, 8 damage, faster movement
4. **Difficulty Scaling**:
   - Spawn rate increases every 10 seconds
   - Maximum number of simultaneous enemies increases

### Scoring

- **Normal Enemy**: +20 points
- **Strong Enemy**: +50 points

## Game States

- **Menu**: Start the game or adjust settings
- **Playing**: Active gameplay
- **Paused**: Temporarily pause and resume
- **Game Over**: View your final score and restart

## Statistics Tracked

- **Score**: Total points earned
- **Health**: Current and maximum HP
- **Survival Time**: How long you've survived
- **Enemy Count**: Current number of enemies on screen

## Tips & Strategies

1. **Keep Moving**: Don't stay in one place; move around to avoid being surrounded
2. **Attack First**: Eliminate enemies at a distance before they reach you
3. **Manage Health**: Try to stay above 50% health to maintain an advantage
4. **Use the Map**: The game boundaries provide walls to hide behind temporarily
5. **Focus Fire**: Target one strong enemy at a time rather than spreading damage

## Browser Compatibility

- Chrome/Chromium 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Any modern mobile browser

## Technical Details

- **Engine**: Custom JavaScript game engine with HTML5 Canvas
- **Physics**: Simple vector-based physics system
- **Collision**: Distance/radius-based collision detection
- **Performance**: 60 FPS target with optimized rendering

## Future Enhancements

- [ ] Power-ups (health, speed, damage boost)
- [ ] Different weapon types
- [ ] Leaderboard/High scores
- [ ] Multiple maps/levels
- [ ] Skill trees/Progression system
- [ ] Multiplayer support
- [ ] Sound effects and background music
- [ ] Particle effects enhancement

## Files Structure

```
public/game/
├── index.html      # Game HTML structure
├── styles.css      # Game styling
├── game.js         # Main game engine and logic
└── assets/         # (Future) Game assets like images and sounds
```

## Development

To modify or extend the game, edit the files in the `public/game/` directory:

- **game.js**: Core game logic, entity classes, and game engine
- **styles.css**: Visual styling and responsive design
- **index.html**: DOM structure and UI elements

## License

MIT License - Feel free to use and modify!

---

**Enjoy the game and have fun surviving! 🎮⚔️**
