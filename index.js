const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
const scoreEL = document.querySelector('#scoreEL')
const startGameBtn = document.querySelector('#start-game-btn')
const modalEL = document.querySelector('#modalEL')
const modalScore = document.querySelector('#modalScore')
console.log(scoreEL)

canvas.width  = innerWidth 
canvas.height  = innerHeight 

class Player  {
  constructor(x, y, radius, color) {
    this.x = x
    this.y = y 
    this.radius = radius
    this.color = color

  }

  draw() {
    c.beginPath() 
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
    c.fillStyle = this.color
    c.fill()
  }
}

class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    c.beginPath() 
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x 
    this.y = this.y + this.velocity.y 
  }
}

class Enemy {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
  }

  draw() {
    c.beginPath() 
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
    c.fillStyle = this.color
    c.fill()
  }

  update() {
    this.draw()
    this.x = this.x + this.velocity.x 
    this.y = this.y + this.velocity.y 
  }
}

const friction = 0.99
class Particle {
  constructor(x, y, radius, color, velocity) {
    this.x = x
    this.y = y
    this.radius = radius
    this.color = color
    this.velocity = velocity
    this.alpha = 1
  }

  draw() {
    c.save() 

    //
    c.globalAlpha = this.alpha
    c.beginPath() 
    c.arc(this.x, this.y, this.radius, 0, Math.PI*2, false)
    c.fillStyle = this.color
    c.fill()
    //

    c.restore()
  }

  update() {
    this.draw()
    this.velocity.x *= friction
    this.x = this.x + this.velocity.x 
    this.velocity.y *= friction
    this.y = this.y + this.velocity.y 
    this.alpha -= 0.01
  }
}



const x = canvas.width / 2
const y = canvas.height / 2

let player = new Player(x, y, 15, 'white')
let projectiles = []
let enemies = []
let particles = []

function init() {
  player = new Player(x, y, 15, 'white')
  projectiles = []
  enemies = []
  particles = []
  score = 0
  scoreEL.innerHTML = score
}

let animationID
let score = 0

function animate() {
  animationID = requestAnimationFrame(animate)
  c.fillStyle = 'rgba(0, 0, 0, 0.1)'
  c.fillRect(0, 0, canvas.width, canvas.height)
  player.draw()
  //animate the particles
  particles.forEach((particle, i) => {
    if(particle.alpha <= 0) {
      particles.splice(i, 1)
    }
    else {
      particle.update() 
    }
  })

  //animate the projectiles
  projectiles.forEach((projectile, i) => {
    projectile.update()
    if(projectile.x - projectile.radius < 0 || projectile.x + projectile.radius > canvas.width || projectile.y + projectile.radius > canvas.height || projectile.y - projectile.radius < 0) {
      setTimeout(() => {
        projectiles.splice(i, 1)
      }, 0)
    }
  } )

  enemies.forEach((enemy, i) => {
    enemy.update()

    const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)

    //game over
    if(dist - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationID)
      modalScore.innerHTML = score
      modalEL.style.display = 'flex'

    }

    
    projectiles.forEach((projectile, i2) => {
      const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
      //projectiles touch enemy
      if(dist - enemy.radius - projectile.radius < 1) {

        //animating explosion effect on-hit
        for(let i = 0; i < enemy.radius; i++) {
          particles.push(
            new Particle(projectile.x, projectile.y, Math.random() * 3, enemy.color, {
            x : (Math.random() - 0.5) * (Math.random() * 4),
            y : (Math.random() - 0.5) * (Math.random() * 4)
            })
          )
        }
        if(enemy.radius - 10 > 10) {
          score += 100
          scoreEL.innerHTML = score
          gsap.to(enemy, { 
            radius: enemy.radius - 10
          })
          setTimeout(() => {
          projectiles.splice(i2, 1)
          }, 0)
        }
        else {
          score += 250
          scoreEL.innerHTML = score
          setTimeout(() => {
            enemies.splice(i, 1)
          projectiles.splice(i2, 1)
          }, 0)
        }
      }
    })
  })
}

function spawnEnemies() {
  setInterval(() => {
    const radius = Math.random() * 30 + 10
    let x 
    let y
    if(Math.random() < .5) {
      x = Math.random() < .5 ? 0 - radius : canvas.width + radius
      y = Math.random() * canvas.height
    }
    else {
      y = Math.random() < .5 ? 0 - radius : canvas.height + radius
      x = Math.random() * canvas.width
    }
    
    
    const color = `hsl(${Math.random() * 360}, 50%, 50%)`
    const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
    const velocity = {
      x: Math.cos(angle),
      y: Math.sin(angle)
    }
    enemies.push(new Enemy(
      x,
      y,
      radius,
      color,
      velocity
    ))
  }, 1000)
}


addEventListener('click', (event) => {
  const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
  const velocity = {
    x: Math.cos(angle) * 6,
    y: Math.sin(angle) * 6
  }
  projectiles.push(new Projectile(
    canvas.width / 2, 
    canvas.height / 2, 
    5, 
    'white', 
    velocity
  ))
})

console.log(startGameBtn)
startGameBtn.addEventListener('click', () => {
  init()
  modalEL.style.display = 'none'
  animate()
  spawnEnemies()
})

