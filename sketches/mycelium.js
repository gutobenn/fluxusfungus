import alea from 'seedrandom'
import {
  isWindows,
  isChrome,
  isChromium,
  browserVersion
} from 'react-device-detect'

export default function sketch(p5) {
  let DEBUG = false

  let maxIterations = Math.min(
    Math.floor(window.innerWidth * window.innerHeight * 0.12),
    160000
  )
  let currentIteration = 1
  let iterationsSincePathCleanUp = 0
  let paths = new Array(1)

  var collisionGrid = new Set()

  // Posts
  var posts = []
  var postsCount = 0
  let addedPostImagesToCanvas = false
  let blobs = []

  let canvas = undefined

  let seed = Math.random()
  var myrng = alea(seed)
  console.debug(`Seed: ${seed}`)

  var pathsCounter = 1
  let postsEveryNth = Math.floor(maxIterations / 400)
  var hasNextPage = false

  const applyChromeAntialisingWorkaround =
    isWindows && (isChrome || isChromium) && parseInt(browserVersion) >= 83

  const stringEndMessage = {
    pt: 'o micélio parou por aqui',
    en: 'the mycelium stopped here.'
  }
  const stringNextButton = {
    pt: 'mais fluxus »',
    en: 'more fluxus »'
  }
  const stringRestartButton = {
    pt: 'rever fluxus »',
    en: 'review fluxus »'
  }

  var currentLanguage = 'pt'

  p5.myCustomRedrawAccordingToNewPropsHandler = (props) => {
    if (DEBUG) {
      console.debug('received props: ')
      console.debug(props)
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
    if (props.goToFirstPage) {
      p5.goToFirstPage = props.goToFirstPage
    }
    if (props.hasNextPage === true) {
      hasNextPage = true
    }
    if (props.lang) {
      currentLanguage = props.lang
    }
  }

  p5.addPostImagesToCanvas = () => {
    if (!addedPostImagesToCanvas && posts.length !== 0) {
      if (DEBUG) {
        console.debug('Add post images to canvas')
        console.debug(posts)
      }
      posts.forEach(function (element) {
        let blob = p5.createSpan('')
        blob.addClass('mycelium_blob')
        blob.addClass('invisible')
        blob.addClass('unvisited')
        blob.attribute('postId', element['id'])
        blob.position(0, 0)
        blob.mouseClicked(() => p5.openImage(blob))
        blobs.push(blob)
      })
      addedPostImagesToCanvas = true
      // Start loop after 600ms
      setTimeout(() => p5.drawFirstPath(), 600)
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
    if (DEBUG) console.debug('p5.setup()')

    // Setup p5 configs
    p5.frameRate(50)
    p5.pixelDensity(1)
    canvas = p5.createCanvas(window.innerWidth, window.innerHeight)
    canvas.style('z-index', '-10')
    canvas.style('position', 'fixed')
    p5.background(p5.color(48, 38, 37))
    p5.ellipseMode(p5.CENTER)
    p5.noStroke()
    p5.smooth()

    p5.noLoop()

    if (!addedPostImagesToCanvas) {
      // Prevent race condition
      p5.addPostImagesToCanvas()
    } else {
      // Start loop after 600ms
      setTimeout(() => p5.drawFirstPath(), 600)
    }
  }

  p5.drawFirstPath = () => {
    // Create first element
    paths[0] = new Path()
    p5.fill('#fff')
    p5.ellipse(
      paths[0].location.x - paths[0].velocity.x * paths[0].diameter,
      paths[0].location.y - paths[0].velocity.y * paths[0].diameter,
      5,
      6
    )
    p5.fill('#eee')
    p5.loop()
  }

  p5.draw = () => {
    if (DEBUG)
      console.debug(
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

      // Workaround to fix canvas flickering (enabling and disabling antialiasing).
      // Very hard to reproduce. Seems related to https://bugs.chromium.org/p/chromium/issues/detail?id=1092080
      if (applyChromeAntialisingWorkaround) {
        // eslint-disable-next-line no-unused-vars
        let pixelColor = p5.get(loc.x + diam * vel.x, loc.y + diam * vel.y)
      }

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
      } else {
        p5.ellipse(loc.x, loc.y, diam, diam)

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

        paths[i].update()
      }
      currentIteration += 1
    }

    iterationsSincePathCleanUp += 1

    if (iterationsSincePathCleanUp > 20) {
      paths = paths.filter(function (el) {
        return el != null
      })
      iterationsSincePathCleanUp = 0
    }

    // Stop when maxIterations limit is reached or there are no more paths available
    if (currentIteration === maxIterations || pathsLength === 0) {
      if (DEBUG) {
        if (currentIteration === maxIterations) {
          console.debug('currentIteration === maxIterations')
        }
        if (DEBUG && pathsLength === 0) {
          console.debug('pathsLength === 0')
        }
      }

      // Stop and cleanup
      paths = []
      p5.noLoop()

      console.log('noLoop')

      if (DEBUG) {
        console.debug('blobs: ')
        console.debug(blobs)
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

  p5.openImage = (blob) => {
    p5.showPost(blob.attribute('postId'))
    blob.removeClass('pulse')
    blob.removeClass('unvisited')

    if (p5.selectAll('.unvisited').length === 0) {
      if (hasNextPage) {
        let nextButton = p5.createButton(stringNextButton[currentLanguage])
        nextButton.addClass('mycelium_next_button')
        nextButton.mousePressed(() => {
          setTimeout(() => {
            p5.nextPage()
          }, 1000)
          nextButton.addClass('hide-to-right')
          blobs.forEach(function (element) {
            element.style('opacity', '0')
          })
          canvas.style('opacity', '0')
        })
      } else {
        let endMessage = p5.createDiv(stringEndMessage[currentLanguage])
        endMessage.addClass('mycelium_end_message')
        let firstPageButton = p5.createButton(
          stringRestartButton[currentLanguage]
        )
        firstPageButton.addClass('mycelium_first_page_button')
        firstPageButton.mousePressed(() => {
          setTimeout(() => {
            p5.goToFirstPage()
          }, 1000)
          firstPageButton.addClass('hide-to-right')
          endMessage.addClass('hide-to-right')
          blobs.forEach(function (element) {
            element.style('opacity', '0')
          })
          canvas.style('opacity', '0')
        })
      }
    }
  }
}
