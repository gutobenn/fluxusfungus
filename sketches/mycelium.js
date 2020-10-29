import alea from 'seedrandom'

export default function sketch(p5) {
  let maxIterations = Math.min(
    Math.floor(window.innerWidth * window.innerHeight * 0.12),
    160000
  )
  let currentIteration = 1
  let paths = new Array(1)
  let DEBUG = false

  var collisionGrid = new Set()

  // Posts
  let blobs = []
  var posts = []
  var postsCount = 0
  let addedPostImagesToCanvas = false
  var myrng = alea(Math.random())
  var pathsCounter = 1
  let postsEveryNth = Math.floor(maxIterations / 400)
  var hasNextPage = false

  var chromiumIssue1092080WorkaroundOverlay = null

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
      p5.nextPage = props.nextPage
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
        let blob = p5.createSpan('')
        blob.addClass('mycelium_blob')
        blob.addClass('invisible')
        blob.attribute('postId', element['id'])
        blob.position(0, 0)
        blob.mouseClicked(() => p5.openImage(blob))
        blobs.push(blob)
      })
      addedPostImagesToCanvas = true
      p5.loop()
    }
  }

  class Path {
    constructor(parent) {
      if (parent === undefined) {
        // First element
        if (window.innerWidth < 1280) {
          // from small to large screens
          this.location = p5.createVector(
            (0.3 + 0.5 * myrng.quick()) * p5.width,
            (0.3 + 0.5 * myrng.quick()) * p5.height
          )
        } else {
          // extra large screens
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
        // child elements
        this.location = parent.location.copy()
        this.velocity = parent.velocity
          .copy()
          .rotate(-0.75 + 1.5 * myrng.quick(), -0.75 + 1.5 * myrng.quick()) // rotate randomly between [-0.75, 0.75] rad
        this.level = parent.level + 1
        this.diameter = parent.diameter * 0.98
        this.iterationCounter = parent.iterationCounter + 1
      }
    }

    update() {
      this.location.add(this.velocity)

      // rotate randomly between [-1, 1] rad
      let bump = p5.createVector(-1 + 2 * myrng.quick(), -1 + 2 * myrng.quick())
      bump.mult(0.012 * Math.log(this.iterationCounter))
      this.velocity.add(bump)
      this.velocity.normalize()

      if (
        myrng.quick() / Math.log(this.iterationCounter) < 0.015 ||
        (this.iterationCounter <= 36 && this.iterationCounter % 7 === 0)
      ) {
        let newPath = new Path(this)
        if (paths.length < 8) {
          newPath.velocity = this.velocity
            .copy()
            .rotate((paths.length + myrng.quick() / 4) * p5.HALF_PI)
        }
        if (
          pathsCounter % postsEveryNth === 0 &&
          postsCount < posts.length &&
          this.location.x > 15 &&
          this.location.y > 15 &&
          this.location.x < p5.width - 15 &&
          this.location.y < p5.height - 15
        ) {
          // Display the blob
          let blob = blobs[postsCount]
          blob.position(this.location.x - 6, this.location.y - 6)
          blob.removeClass('invisible')
          postsCount++
        }
        paths.push(newPath)
        pathsCounter++
      }

      // Decrement diameter
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

    // Setup p5 configs
    p5.frameRate(60)
    p5.pixelDensity(1)
    p5.createCanvas(window.innerWidth, window.innerHeight)
    p5.background(p5.color(235, 235, 235))
    p5.ellipseMode(p5.CENTER)
    p5.noStroke()
    p5.smooth()

    // Create first element
    paths[0] = new Path()
    p5.fill('#000')
    p5.ellipse(
      paths[0].location.x - paths[0].velocity.x * paths[0].diameter,
      paths[0].location.y - paths[0].velocity.y * paths[0].diameter,
      5,
      6
    )
    p5.fill('#666')

    // Prevent race condition
    if (!addedPostImagesToCanvas) {
      p5.noLoop()
      p5.addPostImagesToCanvas()
    }

    // Chrome workaround
    // https://stackoverflow.com/questions/64043191/html5-canvas-is-flickering-in-google-chrome/64075834
    let xyz = p5.createDiv()
    xyz.addClass('chromium-issue-1092080-workaround__overlay')
    chromiumIssue1092080WorkaroundOverlay = document.querySelector(
      '.chromium-issue-1092080-workaround__overlay'
    )
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

      // Skip and remove path if a collision is detected or any coordinate is outside the canvas limits
      if (
        collisionGrid.has(
          Math.round(loc.x + diam * vel.x) +
            '_' +
            Math.round(loc.y + diam * vel.y)
        ) ||
        diam <= 0.45 ||
        loc.x <= 0 ||
        loc.y <= 0 ||
        loc.x >= p5.width ||
        loc.y >= p5.height
      ) {
        paths[i] = null
        chromiumIssue1092080WorkaroundOverlay.style.transform = `scaleX(${Math.random()})` // Comment this to disable the workaround
      } else {
        p5.ellipse(loc.x, loc.y, diam, diam)

        chromiumIssue1092080WorkaroundOverlay.style.transform = `scaleX(${Math.random()})` // Comment this to disable the workaround

        collisionGrid.add(Math.round(loc.x) + '_' + Math.round(loc.y))

        // If diameter > 1px, mark all near pixels for collision detection
        if (diam >= 1) {
          for (
            let i = Math.round(loc.x - diam / p5.PI);
            i <= Math.round(loc.x + diam / p5.PI);
            i++
          ) {
            for (
              let j = Math.round(loc.y - diam / p5.PI);
              j <= Math.round(loc.y + diam / p5.PI);
              j++
            ) {
              collisionGrid.add(i + '_' + j)
            }
          }
        } else {
          collisionGrid.add(
            Math.round(loc.x - (diam * vel.x) / p5.PI) +
              '_' +
              Math.round(loc.y - (diam * vel.y) / p5.PI)
          )
        }

        chromiumIssue1092080WorkaroundOverlay.style.transform = `scaleX(${Math.random()})` // Comment this to disable the workaround
        paths[i].update()
      }
      currentIteration += 1
    }

    if (pathsLength < 8 || pathsLength % 10 === 0) {
      paths = paths.filter(function (el) {
        return el != null
      })
    }

    // Stop when maxIterations limit is reached or there are no more paths available
    if (currentIteration === maxIterations || pathsLength === 0) {
      if (DEBUG) {
        if (currentIteration === maxIterations) {
          console.log('currentIteration === maxIterations')
        }
        if (DEBUG && pathsLength === 0) {
          console.log('pathsLength === 0')
        }
      }

      // Stop and cleanup
      paths = []
      p5.noLoop()

      console.log('noLoop')

      if (DEBUG) {
        console.log('blobs: ')
        console.log(blobs)
      }

      // Start pulse effect
      blobs.forEach(function (element, index) {
        setTimeout(() => {
          element.addClass('pulse')
        }, 200 * index)
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
}
