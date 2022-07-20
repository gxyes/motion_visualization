import * as THREE from './lib.js';
import BG from './model/environment/bg.jpeg'

function showGLTFAnimation(model) {
  if (model.animations.length > 0) {
    modelScene.AnimationMixer = new THREE.AnimationMixer(model.scene);
    modelScene.AnimationMixer.clipAction(model.animations[0]).play();
  }
}

//our models
const models = [
  {
    // name: 'model1', path: require('./model/try.fbx').default, position: [0, 0, 300], type: 'fbx',
    name: 'model0', path: require('./model/obamatry.glb').default, position: [0, 0, 30], type: 'glb',
  },
  {
    name: 'model1', path: require('./model/Capoeira.glb').default, position: [0, 0, 300], type: 'glb'
  },
  {
    name: 'model2', path: require('./model/acton.glb').default, position: [0, 0, 50], type: 'glb',
  },
  {
    name: 'model3', path: require('./model/human.obj').default, position: [0, 0, 10], type: 'obj'
  }
];


// load model
const modelScene = {
  State: {
    showGrid: false,
    showLightOrigin: false,
    wireframe: false,
  },
  Scene: null,
  Renderer: null,
  Camera: null,
  Model: null,
  Lights: null,
  AnimationMixer: null,
  Tclock: new THREE.Clock(),
  TestGui: null,
  TestStats: null,
  Controls: null,
  GridHelper: new THREE.GridHelper(300, 50, 0x00FF12, 0xFFFFFF),

  init: {
    // Add a scene
    Scene: function () {
      this.Scene = new THREE.Scene()
      this.Scene.background = new THREE.Color(0x282923);

      this.Scene.background = new THREE.TextureLoader().load(BG)

      // THREE.Cache.enabled = true;

    },
    //Add a renderer
    Renderer: function () {
      this.Renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, premultipliedAlpha: true, precision: 'highp' })
      this.Renderer.setPixelRatio(window.devicePixelRatio);
      this.Renderer.setSize(window.innerWidth, window.innerHeight);
      this.Renderer.setClearColor(0xeeeeee);
      this.Renderer.shadowMap.enabled = true;
      this.Renderer.physicallyCorrectLights = true;
      this.Renderer.outputEncoding = THREE.sRGBEncoding;


      ThreeApp.appendChild(this.Renderer.domElement);
    },
    //Add a camera
    Camera: function () {
      this.Camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000)
      this.Camera.position.set(0, 0, 50);
      this.Camera.lookAt(this.Scene.position)
    },

    // frame rate
    Stats() {
      this.TestStats = new THREE.Stats();
      document.body.appendChild(this.TestStats.dom);
    }

  },

  // load model (GLTF/FBX)
  modelLoader: function (MODEL) {
    const loadTip = this.addLoadTip();
    this.Controls.autoRotate = false;
    // remove other scenes (from other tabs)
    const anisPanel = document.querySelector('#anisPanel')
    if (anisPanel) {
      ThreeApp.removeChild(anisPanel)
    }

    let Loader = '', MTYPE = MODEL.type || 'glb';
    var mixer = null;

    if ('glb,gltf'.indexOf(MTYPE) != -1) {
      Loader = new THREE.GLTFLoader()
    }
    else if ('fbx'.indexOf(MTYPE) != -1) {
      Loader = new THREE.FBXLoader()
    } else if ('obj'.indexOf(MTYPE) != -1) {
      Loader = new THREE.OBJLoader()
    }
    else {
      loadTip.textContent = 'please use glb, gltf, or fbx model';
      return;
    }

    console.log(MODEL)

    Loader.load(MODEL.path, (geometry) => {
      loadTip.textContent = 'finish!';
      console.log("finish")
      //remove other models
      this.Model && this.Scene.remove(this.Model);

      //camera position
      this.Camera.position.set(...MODEL.position);
      // this.Camera.rotation.set(...MODEL.rotation);

      //current model
      console.log(geometry)

      if (MTYPE == 'fbx' || MTYPE == 'obj') {
        this.Model = geometry;
      } else if (MTYPE == 'glb') {
        this.Model = geometry.scene;
        console.log(this.Model)
        this.Scene.add(geometry.scene)
        showGLTFAnimation(geometry)
        // return
      }

      //initialize current model
      MODEL.init && MODEL.init(this.Model, geometry)

      //model auto center
      THREE.ModelAutoCenter(this.Model)

      //auto rotation after loading
      setTimeout(() => {
        loadTip.style.display = 'none';
        this.Controls.autoRotate = typeof MODEL.autoRotate === 'boolean' ? MODEL.autoRotate : true;
      }, 1000);

      //load the model into the scene
      this.Scene.add(this.Model);

      if (this.Model.animations.length > 0) {
        // fbx
        this.AnimationMixer = new THREE.AnimationMixer(this.Model);
        this.AnimationMixer.clipAction(this.Model.animations[0]).play();
      }

      (xhr) => {
        //progress
        loadTip.textContent = (parseInt(xhr.loaded / xhr.total * 100)) + '%loading';
      },

        (err) => {
          loadTip.textContent = 'failed loading！'
          console.log('failed loading')
        }
    });
  },
  //load light source
  addLight: function () {
    this.Lights = [
      { name: 'AmbientLight', obj: new THREE.AmbientLight(0xFFFFFF, 1) },
      { name: 'DirectionalLight_top', obj: new THREE.DirectionalLight(0xFFFFFF, 3), position: [0, 15, 0] },
      { name: 'DirectionalLight_bottom', obj: new THREE.DirectionalLight(0x1B1B1B, 3), position: [0, -200, 0] },
      { name: 'DirectionalLight_right1', obj: new THREE.DirectionalLight(0xFFFFFF, 1.5), position: [0, -5, 20] },
      { name: 'DirectionalLight_right2', obj: new THREE.DirectionalLight(0xFFFFFF, 1.5), position: [0, -5, -20] },
    ];


    this.Lights.map(item => {
      item.obj.name = item.name;
      item.position && item.obj.position.set(...item.position);
      item.Helper = new THREE.PointLightHelper(item.obj);
      this.Scene.add(item.obj);
    })


  },

  //add events
  addControls: function () {
    this.Controls = new THREE.OrbitControls(this.Camera, this.Renderer.domElement);
    //enable damping or not
    this.Controls.enableDamping = true;
    //can zoom or not
    this.Controls.enableZoom = true;
    //min distance between the camera and the origin
    this.Controls.minDistance = 0;
    //max distance between the camera and the origin
    this.Controls.maxDistance = 3000;//800
    //right click drag or not
    this.Controls.enablePan = false;
    //factor
    this.Controls.dampingFactor = 0.5;
    //auto rotate or not
    this.Controls.autoRotate = false;
    this.Controls.autoRotateSpeed = 0;
  },

  //switch between models
  switchModel() {
    const _scope = this;

    var switchModelStyle = document.createElement('style');
    switchModelStyle.type = "text/css";
    switchModelStyle.innerText += '.modelList{position:fixed;width:100%; display:flex;justify-content:space-around; bottom:0;left:0;color:#ffffff;background:rgba(14,14,44,0.9);cursor:pointer;}\
                .modelList li{width:50%;line-height:30px;padding:5px;text-align:center;font-size:14px;}.modelList li:last-child{border:0;}.modelList li:hover,.modelList li.on{background:#778899;}'


    var userInputFieldStyle = document.createElement('style');
    userInputFieldStyle.type = "text/css";
    userInputFieldStyle.innerText += '.userInputField{position:fixed;width:85%;bottom:30px;margin-left:20px;font-size:20px;height:40px;border:none;background:rgba(0,0,0,0.1);outline-color:black;text-indent:20px}'

    var userInputSubmitStyle = document.createElement('style');
    userInputSubmitStyle.type = "text/css";
    userInputSubmitStyle.innerText += '.userSubmit{position:fixed;width: 10%;bottom:30px;right:20px;font-size:20px;border:none;height:40px;background:rgba(0,0,0,0.1)}'


    const modelUL = document.createElement('ul');
    modelUL.className = 'modelList'

    models.map((item, index) => {

      modelUL.innerHTML += '<li class="' + (index == 0 ? 'on' : '') + '">' + item.name + '</li>';

    })

    const userInputField = document.createElement('input')
    userInputField.setAttribute("type", "text")
    userInputField.setAttribute("value", "A person is dancing.")
    userInputField.className = 'userInputField'

    const userSubmit = document.createElement('input')
    userSubmit.setAttribute("type", "submit")
    userSubmit.setAttribute("value", "Generate!")
    userSubmit.className = 'userSubmit'

    document.head.insertBefore(userInputFieldStyle, document.head.lastChild);
    document.head.insertBefore(userInputSubmitStyle, document.head.lastChild);

    // ThreeApp.insertBefore(modelUL,ThreeApp.firstChild);

    ThreeApp.insertBefore(userInputField, ThreeApp.firstChild);
    ThreeApp.insertBefore(userSubmit, ThreeApp.firstChild);
    // ThreeApp.insertBefore(userForm, ThreeApp.firstChild);


    userSubmit.onclick = function () {
      // console.log(document.getElementsByClassName('userInputField')[0].value);
      var inputText = document.getElementsByClassName('userInputField')[0].value;
      if (inputText == 'model0') {
        _scope.modelLoader(models[0]);
      } else if (inputText == "model1") {
        _scope.modelLoader(models[1]);
      } else if (inputText == "model2") {
        _scope.modelLoader(models[2]);
      } else if (inputText == "model3") {
        _scope.modelLoader(models[3]);
      }
    }
  },
  // load tip...
  addLoadTip: function () {

    document.querySelector('.loadTip') && ThreeApp.removeChild(document.querySelector('.loadTip'));
    let loadTip = document.createElement('div');
    loadTip.className = 'loadTip'
    loadTip.style.cssText += 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:5px;background-color:rgba(0,0,0,0.5);padding:5px 10px;color:#fff;font-family:Arial';
    ThreeApp.appendChild(loadTip);
    return loadTip;
  },

  // panel
  addPanel: function () {

    const _scope = this;

    //frame
    this.init.Stats.call(this)


    //three modes
    const Panels = [
      {
        name: 'Grids',
        todo: function () {

          if (_scope.State.showGrid) {
            _scope.Scene.remove(_scope.GridHelper);
            _scope.State.showGrid = false;

          } else {
            _scope.Scene.add(_scope.GridHelper);
            _scope.State.showGrid = true;
          }

        }
      },
      {
        name: 'Light Sources',
        todo: function () {

          if (_scope.State.showLightOrigin) {
            _scope.Lights.map(item => { _scope.Scene.remove(item.Helper) })
            _scope.State.showLightOrigin = false
          } else {
            _scope.Lights.map(item => { _scope.Scene.add(item.Helper) })

            _scope.State.showLightOrigin = true
          }

        }
      },
      {
        name: 'Skeleton',
        todo: function () {
          if (_scope.State.wireframe) {
            _scope.Model.traverse(child => {
              if (child.isMesh) {
                child.material.wireframe = false
              }
            })
            _scope.State.wireframe = false
          } else {
            _scope.Model.traverse(child => {
              if (child.isMesh) {
                child.material.wireframe = true
              }
            })
            _scope.State.wireframe = true
          }

        }
      },

    ]


    //panel DomTree
    var helpPanelStyle = document.createElement('style');
    helpPanelStyle.type = "text/css";
    helpPanelStyle.innerText += '#helpPanel{position:fixed;width:80px;top:50px;left:0;color:#ffffff;background:#778899;cursor:pointer;}\
                 #helpPanel li{border-bottom:1px solid #fff;line-height:30px;text-align:center;font-size:12px;font-family:Arial}#helpPanel li:last-child{border:0;}#helpPanel li.on{color:black;}';
    var helpPanel = document.createElement('ul');
    helpPanel.id = 'helpPanel';


    Panels.forEach(item => {
      let LI = document.createElement('li');

      LI.innerText = item.name;
      LI.onclick = function () {

        this.className = this.className == 'on' ? '' : 'on'
        item.todo(this)
      }
      helpPanel.appendChild(LI);
    })



    document.head.insertBefore(helpPanelStyle, document.head.lastChild);
    ThreeApp.insertBefore(helpPanel, ThreeApp.firstChild)

  },
  animation: function () {

    // update controller
    this.Renderer.render(this.Scene, this.Camera);
    this.TestStats.update();
    this.Controls.update();
    this.AnimationMixer && this.AnimationMixer.update(this.Tclock.getDelta());
    requestAnimationFrame(() => this.animation());
  },
  onWindowResize: function () {
    this.Camera.aspect = window.innerWidth / window.innerHeight;
    this.Camera.updateProjectionMatrix();
    this.Renderer.setSize(window.innerWidth, window.innerHeight);
    this.Renderer.render(this.Scene, this.Camera);
  },
  run: function () {
    this.init.Renderer.call(this)
    this.init.Scene.call(this)
    this.init.Camera.call(this)

    this.addControls();
    //env lights
    this.addLight()
    this.modelLoader(models[0]);

    //add panel
    this.addPanel();
    this.animation();
    this.switchModel()


    window.onresize = () => this.onWindowResize();

  }



}


modelScene.run();