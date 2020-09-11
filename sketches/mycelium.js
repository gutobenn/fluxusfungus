export default function sketch(p5) {
  let max_iterations = Math.floor(p5.windowWidth * p5.windowHeight * 0.12)
  let current_iteration = 1
  let BG_ALPHA = 250 // For collision detection
  let paths_to_iterate = [0]
  let paths = new Array(1)
  let DEBUG = false

  // Posts
  let imgs = []
  var posts = []
  let addedPostImagesToCanvas = false;

  p5.loadPost = postId => {}
  p5.myCustomRedrawAccordingToNewPropsHandler = props => {
    if (DEBUG) {
      console.log("received props: ")
      console.log(props)
    }

    if (props.posts) {
      posts = props.posts
      p5.addPostImagesToCanvas()
    }
    if (props.loadPost) {
      p5.loadPost = props.loadPost
    }
  }

  p5.addPostImagesToCanvas = () => {
    if (!addedPostImagesToCanvas && posts.length !== 0) {
      if (DEBUG) {
        console.log("Add post images to canvas")
        console.log(posts)
      }
      posts.forEach(function (element, index, array) {
        let imgUrl = element.images[0]?.formats?.thumbnail?.url || 'https://via.placeholder.com/100x100'
        let img = p5.createImg(imgUrl, element["title"])
        img.style('opacity', '0')
        img.attribute('postId', element["id"])
        img.position(0, 0)
        img.size(100, 100)
        img.mouseClicked(() => p5.openImage(img))
        img.mouseOver(() => p5.imgOver(img))
        img.mouseOut(() => p5.imgOut(img))
        img.style('background', '#fff')
        img.style('border-radius', '3px')
        img.style('border', '1px solid #666')
        img.style('padding', '5px')
        img.style('cursor', 'pointer')
        imgs.push(img)
      })
      addedPostImagesToCanvas = true
      p5.loop()
    }
  }

  class PathFinder {
    constructor(parent) {
      if (parent === undefined) {
        this.location = p5.createVector((0.3 + 0.5 * Math.random()) * p5.width, (0.3 + 0.5 * Math.random()) * p5.height)
        this.velocity = p5.createVector((p5.width / 2) - this.location.x, (p5.height / 2) - this.location.y).normalize()
        this.diameter = 4
        this.level = 1
        this.iteration_counter = 1
      } else {
        this.location = parent.location.copy()
        this.velocity = parent.velocity.copy().rotate((-1.1 + 2.2 * Math.random()), (-1.1 + 2.2 * Math.random())) // varia angulo em até 1.1rad
        this.level = parent.level + 1
        this.diameter = parent.diameter * 0.98
        this.iteration_counter = parent.iteration_counter + 1
      }
    }

    update() {
      this.location.add(this.velocity)
      let bump = p5.createVector((-1 + 2 * Math.random()), (-1 + 2 * Math.random()))
      bump.mult(0.02 * p5.log(this.iteration_counter))
      this.velocity.add(bump)
      this.velocity.normalize()
      if (Math.random() / p5.log(this.iteration_counter) < 0.012 || (this.iteration_counter <= 36 && this.iteration_counter % 7 === 0)) { // || this.iteration_counter === 8 || this.iteration_counter === 12) {
        paths_to_iterate.push(paths.length)
        let new_path = new PathFinder(this)
        if (paths.length < 8) {
          new_path.velocity = this.velocity.copy().rotate((paths.length + Math.random() / 2) * p5.HALF_PI)
        }
        paths = p5.append(paths, new_path)
      }

      if (this.diameter > 2) {
        this.diameter = this.diameter * 0.98
      } else {
        this.diameter = this.diameter * 0.9986
      }
      this.iteration_counter = this.iteration_counter + 1
    }
  }

  p5.setup = () => {
    if (DEBUG) console.log("p5.setup()")

    p5.createCanvas(p5.windowWidth, p5.windowHeight)
    p5.background(p5.color(235, 235, 235, BG_ALPHA))
    p5.ellipseMode(p5.CENTER)
    p5.noStroke()
    p5.smooth()
    paths[0] = new PathFinder()

    p5.fill("#000")
    p5.ellipse(paths[0].location.x - paths[0].velocity.x * paths[0].diameter, paths[0].location.y - paths[0].velocity.y * paths[0].diameter, 5, 6) // deixar cifa meio separada
    p5.fill("#666")

    // Prevent race condition
    if (!addedPostImagesToCanvas){
      p5.noLoop()
      p5.addPostImagesToCanvas()
    }
  }

  p5.draw = () => {
    if (DEBUG) console.log('paths_to_iterate.lenght: ' + paths_to_iterate.length + ' current_iteration: ' + current_iteration + ' max_iterations: ' + max_iterations + ' paths.length: ' + paths.length)

    let to_delete = []
    for (let i = 0; i < paths_to_iterate.length && current_iteration < max_iterations; i++) {
      if (i > 10 && Math.random() < 0.3)
        continue

      let pi = paths_to_iterate[i]
      let loc = paths[pi].location
      let diam = paths[pi].diameter
      let vel = paths[pi].velocity
      let r = diam / 2

      if (p5.get(loc.x + diam * vel.x, loc.y + diam * vel.y)[3] !== BG_ALPHA
        || (diam <= 0.45)
        || loc.x <= 0
        || loc.x >= p5.width
        || loc.y >= p5.height
      ) {
        to_delete.push(i)
      } else {
        p5.ellipse(loc.x, loc.y, diam, diam)
        paths[pi].update()
      }
      current_iteration += 1
    }

    to_delete.forEach(function(element, index, array) {
      delete paths_to_iterate[element]
      delete paths[paths_to_iterate[element]]
    })

    paths_to_iterate = paths_to_iterate.filter(function(el) {
      return el != null
    })

    if (current_iteration === max_iterations) {
      if (DEBUG) console.log('current_iteration === max_iterations')

      if (DEBUG) {
        console.log('imgs: ')
        console.log(imgs)
      }
      imgs.forEach(function(element, index, array) {
        if (DEBUG) console.log('setting timeout for index ' + index)

        setTimeout(() => {
          if (DEBUG) console.log('img timeout!')

          let randomElement = paths[paths_to_iterate[Math.floor(Math.random() * paths_to_iterate.length)]]
          element.position(randomElement.location.x - 50, randomElement.location.y - 50)
          element.style('transition', 'opacity 1s')
          element.style('opacity', '100')
          // TODO Avoid placing images in the limits of the screen or above another image
        }, 500*index)
      })

      // TODO Do not use setTimeout for this. Use a callback or anything else after the images have been placed.
      if (DEBUG) console.log('set noLoop timeout')

      setTimeout(() => {
        if (DEBUG) console.log('noLoop timeout reached')
        paths = []
        paths_to_iterate = []
        p5.noLoop()
      }, 6000)

      current_iteration++
    } else if (paths_to_iterate.length === 0) {
      if (DEBUG) console.log('paths_to_iterate.length === 0')

      current_iteration = max_iterations
    }
  }

  p5.openImage = (img) => {
    p5.loadPost(img.attribute("postId"))
    //alert("Open image lightbox for #" + img.id)
  }

  p5.imgOver = (img) => {
    img.style('box-shadow', '0px 0px 7px -3px #333')
  }

  p5.imgOut = (img) => {
    img.style('box-shadow', 'none')
  }

  /*
  windowResized = () => {
    resizeCanvas(p5.windowWidth, p5.windowHeight)
  }
  */

}
