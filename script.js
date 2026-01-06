// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    initParticleAnimation();
});

// 增强的3D粒子动画效果
function initParticleAnimation() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouse = { x: 0, y: 0 };
    let time = 0;

    // 设置画布尺寸
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 鼠标移动事件
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // 3D粒子类
    class Particle3D {
        constructor() {
            this.reset();
        }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.z = Math.random() * 1000 + 500; // 深度
            this.vx = (Math.random() - 0.5) * 2;
            this.vy = (Math.random() - 0.5) * 2;
            this.vz = (Math.random() - 0.5) * 5;
            this.radius = Math.random() * 3 + 1;
            this.opacity = Math.random() * 0.8 + 0.2;
            this.hue = Math.random() * 60 + 160; // 青色到蓝色范围
            this.pulseSpeed = Math.random() * 0.1 + 0.05;
            this.pulseOffset = Math.random() * Math.PI * 2;
        }

        update() {
            // 3D移动
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;

            // 边界检测和循环
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            if (this.z < 0 || this.z > 1500) this.vz *= -1;

            // 鼠标交互 - 3D吸引效果
            const dx = mouse.x - this.x;
            const dy = mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                const force = (150 - distance) / 150;
                this.vx += (dx / distance) * force * 0.5;
                this.vy += (dy / distance) * force * 0.5;
            }

            // 限制速度
            const speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
            if (speed > 5) {
                this.vx = (this.vx / speed) * 5;
                this.vy = (this.vy / speed) * 5;
            }

            // 脉动效果
            time += this.pulseSpeed;
            this.currentOpacity = this.opacity * (0.5 + 0.5 * Math.sin(time + this.pulseOffset));
        }

        draw() {
            // 3D透视投影
            const perspective = 500;
            const scale = perspective / (perspective + this.z);
            const screenX = canvas.width / 2 + (this.x - canvas.width / 2) * scale;
            const screenY = canvas.height / 2 + (this.y - canvas.height / 2) * scale;
            const screenRadius = this.radius * scale;

            if (screenRadius < 0.1) return;

            // 绘制粒子
            ctx.beginPath();
            ctx.arc(screenX, screenY, screenRadius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 100%, 60%, ${this.currentOpacity})`;
            ctx.fill();

            // 发光效果
            const glowIntensity = 15 * scale;
            ctx.shadowBlur = glowIntensity;
            ctx.shadowColor = `hsla(${this.hue}, 100%, 60%, 0.8)`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }

        getScreenPosition() {
            const perspective = 500;
            const scale = perspective / (perspective + this.z);
            return {
                x: canvas.width / 2 + (this.x - canvas.width / 2) * scale,
                y: canvas.height / 2 + (this.y - canvas.height / 2) * scale,
                scale: scale
            };
        }
    }

    // 创建粒子
    function createParticles() {
        particles = [];
        const particleCount = 150;
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle3D());
        }
    }

    // 绘制3D连接线
    function draw3DConnections() {
        for (let i = 0; i < particles.length; i++) {
            const pos1 = particles[i].getScreenPosition();

            for (let j = i + 1; j < particles.length; j++) {
                const pos2 = particles[j].getScreenPosition();

                const dx = pos1.x - pos2.x;
                const dy = pos1.y - pos2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // 基于深度和距离的连线
                const zDifference = Math.abs(particles[i].z - particles[j].z);

                if (distance < 150 && zDifference < 300) {
                    const opacity = (1 - distance / 150) * 0.3 * (pos1.scale * pos2.scale);
                    const avgHue = (particles[i].hue + particles[j].hue) / 2;

                    ctx.beginPath();
                    ctx.moveTo(pos1.x, pos1.y);
                    ctx.lineTo(pos2.x, pos2.y);
                    ctx.strokeStyle = `hsla(${avgHue}, 100%, 60%, ${opacity})`;
                    ctx.lineWidth = 1 * Math.min(pos1.scale, pos2.scale);
                    ctx.stroke();
                }
            }
        }
    }

    // 绘制动态背景网格
    function drawGrid() {
        const gridSize = 50;
        const offset = (Date.now() / 50) % gridSize;

        ctx.strokeStyle = 'rgba(0, 255, 255, 0.03)';
        ctx.lineWidth = 1;

        // 垂直线
        for (let x = offset; x < canvas.width; x += gridSize) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }

        // 水平线
        for (let y = offset; y < canvas.height; y += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
    }

    // 动画循环
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 绘制背景网格
        drawGrid();

        // 更新和绘制粒子
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // 绘制3D连接线
        draw3DConnections();

        // 添加整体光晕效果
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, Math.max(canvas.width, canvas.height) * 0.6
        );
        gradient.addColorStop(0, 'rgba(0, 255, 255, 0.05)');
        gradient.addColorStop(0.5, 'rgba(255, 0, 255, 0.02)');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        requestAnimationFrame(animate);
    }

    createParticles();
    animate();

    // 窗口大小改变时重新调整粒子位置
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            createParticles();
        }, 250);
    });
}

// 添加3D元素交互效果
document.addEventListener('DOMContentLoaded', function() {
    const cubes = document.querySelectorAll('.cube');
    const pyramids = document.querySelectorAll('.pyramid');
    const gameIcons = document.querySelectorAll('.game-icon');

    // 为3D元素添加鼠标悬停加速效果
    cubes.forEach(cube => {
        cube.addEventListener('mouseenter', () => {
            cube.style.animationDuration = '5s';
        });

        cube.addEventListener('mouseleave', () => {
            cube.style.animationDuration = '';
        });
    });

    pyramids.forEach(pyramid => {
        pyramid.addEventListener('mouseenter', () => {
            pyramid.style.animationDuration = '5s';
        });

        pyramid.addEventListener('mouseleave', () => {
            pyramid.style.animationDuration = '';
        });
    });

    // 游戏图标点击效果
    gameIcons.forEach(icon => {
        icon.style.pointerEvents = 'auto';
        icon.style.cursor = 'pointer';

        icon.addEventListener('click', () => {
            icon.style.transform = 'scale(1.5) rotate(360deg)';
            setTimeout(() => {
                icon.style.transform = '';
            }, 500);
        });
    });
});

// 性能优化：在页面不可见时暂停动画
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // 页面不可见，可以暂停复杂动画
        const cubes = document.querySelectorAll('.cube');
        cubes.forEach(cube => {
            cube.style.animationPlayState = 'paused';
        });
    } else {
        // 页面可见，恢复动画
        const cubes = document.querySelectorAll('.cube');
        cubes.forEach(cube => {
            cube.style.animationPlayState = 'running';
        });
    }
});

// 错误处理
window.addEventListener('error', (e) => {
    console.error('JavaScript错误:', e.error);
});
