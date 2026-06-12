// ============================================================================
// BATTLE SURVIVAL - Offline Tablet Game
// ============================================================================

class Vector2 {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }

    subtract(v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    }

    multiply(scalar) {
        return new Vector2(this.x * scalar, this.y * scalar);
    }

    magnitude() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    }

    normalize() {
        const mag = this.magnitude();
        if (mag === 0) return new Vector2(0, 0);
        return new Vector2(this.x / mag, this.y / mag);
    }

    distance(v) {
        return this.subtract(v).magnitude();
    }
}

// ============================================================================
// Game Entity Classes
// ============================================================================

class Player {
    constructor(x, y, width = 30, height = 30) {
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(0, 0);
        this.width = width;
        this.height = height;
        this.speed = 4;
        this.health = 100;
        this.maxHealth = 100;
        this.attackDamage = 10;
        this.attackCooldown = 0;
        this.attackRange = 50;
        this.color = '#ff6b6b';
        this.direction = 0; // angle in radians
    }

    update(canvasWidth, canvasHeight) {
        // Update position
        this.pos = this.pos.add(this.vel);

        // Boundaries
        this.pos.x = Math.max(this.width / 2, Math.min(canvasWidth - this.width / 2, this.pos.x));
        this.pos.y = Math.max(this.height / 2, Math.min(canvasHeight - this.height / 2, this.pos.y));

        // Friction
        this.vel = this.vel.multiply(0.9);

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    }

    move(direction) {
        const moveVel = direction.normalize().multiply(this.speed);
        this.vel = this.vel.add(moveVel);
        if (direction.magnitude() > 0) {
            this.direction = Math.atan2(direction.y, direction.x);
        }
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
    }

    canAttack() {
        return this.attackCooldown <= 0;
    }

    attack() {
        if (this.canAttack()) {
            this.attackCooldown = 30;
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.direction);

        // Player body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Player direction indicator
        ctx.fillStyle = '#fff';
        ctx.fillRect(5, -3, 15, 6);

        ctx.restore();

        // Health bar above player
        const barWidth = 40;
        const barHeight = 5;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.pos.x - barWidth / 2, this.pos.y - this.height, barWidth, barHeight);

        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = `hsl(${healthPercent * 120}, 100%, 50%)`;
        ctx.fillRect(this.pos.x - barWidth / 2, this.pos.y - this.height, barWidth * healthPercent, barHeight);
    }

    getAttackArea() {
        return {
            x: this.pos.x + Math.cos(this.direction) * this.attackRange,
            y: this.pos.y + Math.sin(this.direction) * this.attackRange,
            radius: this.attackRange
        };
    }
}

class Enemy {
    constructor(x, y, width = 25, height = 25) {
        this.pos = new Vector2(x, y);
        this.vel = new Vector2(0, 0);
        this.width = width;
        this.height = height;
        this.speed = 2;
        this.health = 30;
        this.maxHealth = 30;
        this.damage = 5;
        this.attackCooldown = 0;
        this.color = '#6bcf7f';
        this.chaseRange = 150;
        this.direction = 0;
        this.type = Math.random() > 0.7 ? 'strong' : 'normal';

        if (this.type === 'strong') {
            this.health = 50;
            this.maxHealth = 50;
            this.damage = 8;
            this.color = '#ffd93d';
            this.speed = 2.5;
        }
    }

    update(canvasWidth, canvasHeight, player) {
        // Chase player if in range
        const distToPlayer = this.pos.distance(player.pos);
        if (distToPlayer < this.chaseRange) {
            const direction = player.pos.subtract(this.pos).normalize();
            const moveVel = direction.multiply(this.speed);
            this.vel = this.vel.add(moveVel);
            this.direction = Math.atan2(direction.y, direction.x);
        }

        // Update position
        this.pos = this.pos.add(this.vel);
        this.vel = this.vel.multiply(0.9);

        // Boundaries
        this.pos.x = Math.max(this.width / 2, Math.min(canvasWidth - this.width / 2, this.pos.x));
        this.pos.y = Math.max(this.height / 2, Math.min(canvasHeight - this.height / 2, this.pos.y));

        // Update attack cooldown
        if (this.attackCooldown > 0) {
            this.attackCooldown--;
        }
    }

    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
    }

    canAttack() {
        return this.attackCooldown <= 0;
    }

    attack() {
        if (this.canAttack()) {
            this.attackCooldown = 60;
            return true;
        }
        return false;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.pos.x, this.pos.y);
        ctx.rotate(this.direction);

        // Enemy body
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
        ctx.fill();

        // Enemy eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-5, -3, 3, 0, Math.PI * 2);
        ctx.arc(5, -3, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Health bar
        const barWidth = 35;
        const barHeight = 4;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(this.pos.x - barWidth / 2, this.pos.y - this.height, barWidth, barHeight);

        const healthPercent = this.health / this.maxHealth;
        ctx.fillStyle = healthPercent > 0.5 ? '#ff6b6b' : '#ff0000';
        ctx.fillRect(this.pos.x - barWidth / 2, this.pos.y - this.height, barWidth * healthPercent, barHeight);
    }
}

// ============================================================================
// Game Engine
// ============================================================================

class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();

        // Game states
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.time = 0;
        this.frameCount = 0;

        // Game objects
        this.player = null;
        this.enemies = [];
        this.particles = [];

        // Input handling
        this.keys = {};
        this.mousePos = new Vector2();
        this.touchStart = null;
        this.setupInputListeners();

        // Difficulty scaling
        this.spawnRate = 0.02;
        this.maxEnemies = 10;
    }

    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
        window.addEventListener('resize', () => {
            this.canvas.width = this.canvas.offsetWidth;
            this.canvas.height = this.canvas.offsetHeight;
        });
    }

    setupInputListeners() {
        // Keyboard
        document.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });

        // Mouse
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mousePos = new Vector2(
                e.clientX - rect.left,
                e.clientY - rect.top
            );
        });

        this.canvas.addEventListener('click', () => {
            if (this.gameState === 'playing') {
                this.player.attack();
            }
        });

        // Touch
        this.canvas.addEventListener('touchstart', (e) => {
            if (e.touches.length > 0) {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                this.touchStart = {
                    x: touch.clientX - rect.left,
                    y: touch.clientY - rect.top,
                    time: Date.now()
                };
            }
        });

        this.canvas.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0 && this.touchStart && this.gameState === 'playing') {
                const touch = e.touches[0];
                const rect = this.canvas.getBoundingClientRect();
                const currentX = touch.clientX - rect.left;
                const currentY = touch.clientY - rect.top;

                const deltaX = currentX - this.touchStart.x;
                const deltaY = currentY - this.touchStart.y;

                if (Math.sqrt(deltaX * deltaX + deltaY * deltaY) > 20) {
                    const direction = new Vector2(deltaX, deltaY).normalize();
                    this.player.move(direction);
                }
            }
        });

        this.canvas.addEventListener('touchend', (e) => {
            this.touchStart = null;
        });

        // Tap to attack
        this.canvas.addEventListener('touchend', (e) => {
            if (this.gameState === 'playing' && Date.now() - (this.touchStart?.time || 0) < 200) {
                this.player.attack();
            }
        });
    }

    handleInput() {
        if (this.gameState !== 'playing') return;

        // Movement input
        const moveInput = new Vector2(0, 0);

        // Keyboard input
        if (this.keys['w'] || this.keys['arrowup']) moveInput.y -= 1;
        if (this.keys['s'] || this.keys['arrowdown']) moveInput.y += 1;
        if (this.keys['a'] || this.keys['arrowleft']) moveInput.x -= 1;
        if (this.keys['d'] || this.keys['arrowright']) moveInput.x += 1;

        if (moveInput.magnitude() > 0) {
            this.player.move(moveInput);
        }

        // Attack input
        if (this.keys[' ']) {
            if (this.player.attack()) {
                this.keys[' '] = false; // Consume key
            }
        }

        // Move towards mouse for desktop
        if (this.mousePos.distance(this.player.pos) > 30) {
            const mouseDir = this.mousePos.subtract(this.player.pos).normalize();
            this.player.direction = Math.atan2(mouseDir.y, mouseDir.x);
        }
    }

    spawnEnemies() {
        if (this.enemies.length < this.maxEnemies && Math.random() < this.spawnRate) {
            const side = Math.floor(Math.random() * 4);
            let x, y;

            const margin = 50;
            switch (side) {
                case 0: // top
                    x = Math.random() * this.canvas.width;
                    y = -margin;
                    break;
                case 1: // bottom
                    x = Math.random() * this.canvas.width;
                    y = this.canvas.height + margin;
                    break;
                case 2: // left
                    x = -margin;
                    y = Math.random() * this.canvas.height;
                    break;
                case 3: // right
                    x = this.canvas.width + margin;
                    y = Math.random() * this.canvas.height;
                    break;
            }

            this.enemies.push(new Enemy(x, y));
        }

        // Increase difficulty
        if (this.frameCount % 600 === 0) {
            this.spawnRate = Math.min(0.08, this.spawnRate + 0.01);
            this.maxEnemies = Math.min(25, this.maxEnemies + 2);
        }
    }

    update() {
        if (this.gameState !== 'playing') return;

        this.frameCount++;
        this.time = Math.floor(this.frameCount / 60);

        this.handleInput();
        this.player.update(this.canvas.width, this.canvas.height);

        // Update enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(this.canvas.width, this.canvas.height, this.player);

            // Check distance for attack
            const distToPlayer = enemy.pos.distance(this.player.pos);
            if (distToPlayer < 40 && enemy.attack()) {
                this.player.takeDamage(enemy.damage);
            }

            // Remove dead enemies
            if (enemy.health <= 0) {
                this.enemies.splice(i, 1);
                this.score += (enemy.type === 'strong' ? 50 : 20);
                this.createExplosion(enemy.pos);
            }
        }

        // Check if player was hit (player attack with enemies)
        // This is handled by attack detection

        // Spawn new enemies
        this.spawnEnemies();

        // Game over check
        if (this.player.health <= 0) {
            this.gameState = 'gameOver';
            this.showGameOver();
        }

        // Update UI
        this.updateUI();
    }

    attack() {
        if (!this.player.attack()) return;

        // Check collision with enemies
        const attackArea = this.player.getAttackArea();
        for (let enemy of this.enemies) {
            const dist = Math.sqrt(
                Math.pow(enemy.pos.x - this.player.pos.x, 2) +
                Math.pow(enemy.pos.y - this.player.pos.y, 2)
            );
            if (dist < 80) {
                enemy.takeDamage(this.player.attackDamage);
                this.createHitEffect(enemy.pos);
            }
        }
    }

    createExplosion(pos) {
        for (let i = 0; i < 10; i++) {
            const angle = (Math.PI * 2 * i) / 10;
            const velocity = new Vector2(
                Math.cos(angle) * 3,
                Math.sin(angle) * 3
            );
            this.particles.push({
                pos: new Vector2(pos.x, pos.y),
                vel: velocity,
                life: 30,
                maxLife: 30,
                color: '#ffaa00'
            });
        }
    }

    createHitEffect(pos) {
        for (let i = 0; i < 5; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = new Vector2(
                Math.cos(angle) * 2,
                Math.sin(angle) * 2
            );
            this.particles.push({
                pos: new Vector2(pos.x, pos.y),
                vel: velocity,
                life: 20,
                maxLife: 20,
                color: '#ff6b6b'
            });
        }
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(45, 80, 22, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (this.gameState === 'playing') {
            // Draw grid
            this.drawGrid();

            // Draw enemies
            for (let enemy of this.enemies) {
                enemy.draw(this.ctx);
            }

            // Draw particles
            for (let i = this.particles.length - 1; i >= 0; i--) {
                const p = this.particles[i];
                p.life--;

                const alpha = p.life / p.maxLife;
                this.ctx.fillStyle = p.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
                this.ctx.beginPath();
                this.ctx.arc(p.pos.x, p.pos.y, 3, 0, Math.PI * 2);
                this.ctx.fill();

                p.pos = p.pos.add(p.vel);

                if (p.life <= 0) {
                    this.particles.splice(i, 1);
                }
            }

            // Draw player
            this.player.draw(this.ctx);

            // Draw attack range when attacking
            if (this.player.attackCooldown > 0) {
                const attackArea = this.player.getAttackArea();
                this.ctx.strokeStyle = 'rgba(255, 107, 107, 0.3)';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(this.player.pos.x, this.player.pos.y, this.player.attackRange, 0, Math.PI * 2);
                this.ctx.stroke();
            }
        }
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
        this.ctx.lineWidth = 1;

        const gridSize = 50;
        for (let x = 0; x < this.canvas.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let y = 0; y < this.canvas.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    updateUI() {
        document.getElementById('healthValue').textContent = `${Math.ceil(this.player.health)}/${this.player.maxHealth}`;
        document.getElementById('healthFill').style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
        document.getElementById('scoreValue').textContent = this.score;
        document.getElementById('timeValue').textContent = this.time + 's';
        document.getElementById('enemyValue').textContent = this.enemies.length;
    }

    showGameOver() {
        const gameOverScreen = document.getElementById('gameOverScreen');
        const gameOverStats = document.getElementById('gameOverStats');
        gameOverStats.innerHTML = `
            <p><strong>Score:</strong> ${this.score}</p>
            <p><strong>Survival Time:</strong> ${this.time}s</p>
            <p><strong>Enemies Defeated:</strong> ${Math.floor(this.score / 20)}</p>
        `;
        gameOverScreen.classList.remove('hidden');
    }

    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.time = 0;
        this.frameCount = 0;
        this.enemies = [];
        this.particles = [];
        this.spawnRate = 0.02;
        this.maxEnemies = 10;

        this.player = new Player(
            this.canvas.width / 2,
            this.canvas.height / 2
        );

        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
    }

    pauseGame() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pauseScreen').classList.remove('hidden');
            document.getElementById('pauseBtn').textContent = 'Resume';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
            document.getElementById('pauseScreen').classList.add('hidden');
            document.getElementById('pauseBtn').textContent = 'Pause';
        }
    }

    resetGame() {
        this.gameState = 'menu';
        this.player = null;
        this.enemies = [];
        this.particles = [];
        document.getElementById('gameOverScreen').classList.add('hidden');
        document.getElementById('pauseScreen').classList.add('hidden');
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
        document.getElementById('pauseBtn').textContent = 'Pause';
        this.updateUI();
    }

    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    start() {
        this.gameLoop();
    }
}

// ============================================================================
// Application Initialization
// ============================================================================

let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new GameEngine('gameCanvas');

    // Button event listeners
    document.getElementById('startBtn').addEventListener('click', () => {
        game.startGame();
    });

    document.getElementById('pauseBtn').addEventListener('click', () => {
        game.pauseGame();
    });

    document.getElementById('resetBtn').addEventListener('click', () => {
        game.resetGame();
    });

    document.getElementById('restartBtn').addEventListener('click', () => {
        game.startGame();
    });

    document.getElementById('resumeBtn').addEventListener('click', () => {
        game.pauseGame();
    });

    document.getElementById('quitBtn').addEventListener('click', () => {
        game.resetGame();
    });

    // Start the game loop
    game.start();
});
