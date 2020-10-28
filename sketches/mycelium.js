import alea from 'seedrandom'

export default function sketch(p5) {
  let maxIterations = Math.min(
    Math.floor(p5.windowWidth * p5.windowHeight * 0.12),
    130000
  )
  let currentIteration = 1
  let BG_ALPHA = 250 // For collision detection
  let paths = new Array(1)
  let DEBUG = false

  // Posts
  let imgs = []
  var posts = []
  var postsPositions = []
  let addedPostImagesToCanvas = false
  var myrng = alea(Math.random())
  var pathsCounter = 1
  let postsEveryNth = Math.floor(maxIterations / 400)
  var hasNextPage = false

  p5.myCustomRedrawAccordingToNewPropsHandler = (props) => {
    if (DEBUG) {
      console.log('received props: ')
      console.log(props)
    }

    if (props.posts) {
      posts = props.posts
      p5.addPostImagesToCanvas()
    }
    if (props.showPost) {
      p5.showPost = props.showPost
    }
    if (props.nextPage) {
      p5.increasepage = props.nextPage
    }
    if (props.hasNextPage === true) {
      hasNextPage = true
    }
  }

  p5.addPostImagesToCanvas = () => {
    if (!addedPostImagesToCanvas && posts.length !== 0) {
      if (DEBUG) {
        console.log('Add post images to canvas')
        console.log(posts)
      }
      posts.forEach(function (element) {
        let img = p5.createSpan('')
        img.addClass('mycelium_blob')
        img.addClass('invisible')
        img.attribute('postId', element['id'])
        img.position(0, 0)
        img.mouseClicked(() => p5.openImage(img))
        imgs.push(img)
      })
      addedPostImagesToCanvas = true
      p5.loop()
    }
  }

  class Path {
    constructor(parent) {
      if (parent === undefined) {
        if (p5.windowWidth < 1280) {
          this.location = p5.createVector(
            (0.3 + 0.5 * myrng.quick()) * p5.width,
            (0.3 + 0.5 * myrng.quick()) * p5.height
          )
        } else {
          this.location = p5.createVector(
            (0.6 + 0.2 * myrng.quick()) * p5.width,
            (0.3 + 0.5 * myrng.quick()) * p5.height
          )
        }
        this.velocity = p5
          .createVector(
            p5.width / 2 - this.location.x,
            p5.height / 2 - this.location.y
          )
          .normalize()
        this.diameter = 4
        this.level = 1
        this.iterationCounter = 1
      } else {
        this.location = parent.location.copy()
        this.velocity = parent.velocity
          .copy()
          .rotate(-1.1 + 2.2 * myrng.quick(), -1.1 + 2.2 * myrng.quick()) // rotate randomly between [-1.1, 1.1] rad
        this.level = parent.level + 1
        this.diameter = parent.diameter * 0.98
        this.iterationCounter = parent.iterationCounter + 1
      }
    }

    update() {
      this.location.add(this.velocity)
      let bump = p5.createVector(-1 + 2 * myrng.quick(), -1 + 2 * myrng.quick())
      bump.mult(0.02 * Math.log(this.iterationCounter))
      this.velocity.add(bump)
      this.velocity.normalize()
      if (
        myrng.quick() / Math.log(this.iterationCounter) < 0.012 ||
        (this.iterationCounter <= 36 && this.iterationCounter % 7 === 0)
      ) {
        let newPath = new Path(this)
        if (paths.length < 8) {
          newPath.velocity = this.velocity
            .copy()
            .rotate((paths.length + myrng.quick() / 2) * p5.HALF_PI)
        }
        if (
          pathsCounter % postsEveryNth === 0 &&
          postsPositions.length < posts.length &&
          this.location.x > 15 &&
          this.location.y > 15 &&
          this.location.x < p5.width - 15 &&
          this.location.y < p5.height - 15
        ) {
          postsPositions.push({ x: this.location.x, y: this.location.y })
        }
        paths.push(newPath)
        pathsCounter++
      }

      if (this.diameter > 2) {
        this.diameter = this.diameter * 0.98
      } else {
        this.diameter = this.diameter * 0.9986
      }
      this.iterationCounter = this.iterationCounter + 1
    }
  }

  p5.setup = () => {
    if (DEBUG) console.log('p5.setup()')

    p5.frameRate(60)
    p5.pixelDensity(1)
    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    p5.background(p5.color(235, 235, 235, BG_ALPHA))
    p5.ellipseMode(p5.CENTER)
    p5.noStroke()
    p5.smooth()
    paths[0] = new Path()

    p5.fill('#000')
    p5.ellipse(
      paths[0].location.x - paths[0].velocity.x * paths[0].diameter,
      paths[0].location.y - paths[0].velocity.y * paths[0].diameter,
      5,
      6
    ) // deixar cifa meio separada
    p5.fill('#666')

    // Prevent race condition
    if (!addedPostImagesToCanvas) {
      p5.noLoop()
      p5.addPostImagesToCanvas()
    }
  }

  p5.draw = () => {
    if (DEBUG)
      console.log(
        'currentIteration: ' +
          currentIteration +
          ' maxIterations: ' +
          maxIterations +
          ' paths.length: ' +
          paths.length
      )

    let pathsLength = paths.length
    for (
      let i = pathsLength - 1;
      i >= 0 && currentIteration < maxIterations;
      i--
    ) {
      if ((i > 10 && myrng.quick() < 0.3) || paths[i] == null) continue

      let loc = paths[i].location
      let diam = paths[i].diameter
      let vel = paths[i].velocity

      if (
        p5.get(loc.x + diam * vel.x, loc.y + diam * vel.y)[3] !== BG_ALPHA || // collision
        diam <= 0.45 ||
        loc.x <= 0 ||
        loc.y <= 0 ||
        loc.x >= p5.width ||
        loc.y >= p5.height
      ) {
        paths[i] = null
      } else {
        p5.ellipse(loc.x, loc.y, diam, diam)
        paths[i].update()
      }
      currentIteration += 1
    }

    if (pathsLength < 15 || pathsLength % 10 == 0) {
      paths = paths.filter(function (el) {
        return el != null
      })
    }

    if (currentIteration === maxIterations || pathsLength === 0) {
      if (DEBUG) {
        if (currentIteration === maxIterations) {
          console.log('currentIteration === maxIterations')
        }
        if (DEBUG && pathsLength === 0) {
          console.log('pathsLength === 0')
        }
      }

      paths = []
      p5.noLoop()

      console.log('noLoop')

      if (DEBUG) {
        console.log('imgs: ')
        console.log(imgs)
      }
      imgs.forEach(function (element, index) {
        if (DEBUG) console.log('setting timeout for index ' + index)

        element.position(
          postsPositions[index]['x'] - 6,
          postsPositions[index]['y'] - 6
        )
        element.removeClass('invisible')
        element.addClass('pulse')
      })

      currentIteration++
    }
  }

  p5.openImage = (img) => {
    p5.showPost(img.attribute('postId'))
    img.removeClass('pulse')

    if (p5.selectAll('.pulse').length === 0) {
      if (hasNextPage) {
        let nextButton = p5.createButton('ver mais »')
        nextButton.addClass('mycelium_next_button')
        nextButton.mousePressed(() => p5.nextPage())
      } else {
        let endMessage = p5.createButton('você já viu todos os conteúdos')
        endMessage.addClass('mycelium_end_message')
      }
    }
  }

  /*
  windowResized = () => {
    resizeCanvas(p5.windowWidth, p5.windowHeight)
  }
  */
}
