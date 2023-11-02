import * as THREE from 'three'
import { addPass, useCamera, useGui, useRenderSize, useScene, useTick } from './render/init.js'
// import postprocessing passes
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js'
import ppNeueMachina from './fonts/pp_neue_machina.json'

import vertexPars from './shaders/vertex_pars.glsl'
import vertexMain from './shaders/vertex_main.glsl'

import fragmentPars from './shaders/fragment_pars.glsl'
import fragmentMain from './shaders/fragment_main.glsl'

import bgGradientNoise from './images/bg-gradient-noise.png'

const startApp = () => {
  const scene = useScene()
  const camera = useCamera()
  const gui = useGui()
  const { width, height } = useRenderSize()

  const showHelpers = true

  // settings
  const MOTION_BLUR_AMOUNT = 0.5

  // lighting
  const dirLight = new THREE.DirectionalLight('#FFFFF', 0.6)
  dirLight.position.set(0, 5, 2)

  // const dirLight2 = new THREE.DirectionalLight('#FFFFFF', 0.6)
  // dirLight2.position.set(-2, -2, -2)

  const ambientLight = new THREE.AmbientLight('#4255FF', 0.4)
  scene.add(dirLight, ambientLight)

  if (showHelpers) {
    const dirLight1helper = new THREE.DirectionalLightHelper(dirLight)
    scene.add(dirLight1helper)

    // const dirLight2helper = new THREE.DirectionalLightHelper(dirLight2)
    // scene.add(dirLight2helper)

    const gridHelper = new THREE.GridHelper(5, 5)
    scene.add(gridHelper)
  }

  // meshes
  const geometry = new THREE.IcosahedronGeometry(3, 300)
  const material = new THREE.MeshStandardMaterial({
    onBeforeCompile: (shader) => {
      material.userData.shader = shader
      // uniforms
      shader.uniforms.uTime = { value: 0 }

      const parsVertexString = /* glsl */ `#include <displacementmap_pars_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        parsVertexString,
        parsVertexString + '\n' + vertexPars
      )

      const mainVertexString = /* glsl */ `#include <displacementmap_vertex>`
      shader.vertexShader = shader.vertexShader.replace(
        mainVertexString,
        mainVertexString + '\n' + vertexMain
      )

      const parsFragmentString = /* glsl */ `#include <bumpmap_pars_fragment>`
      shader.fragmentShader = shader.fragmentShader.replace(
        parsFragmentString,
        parsFragmentString + '\n' + fragmentPars
      )

      const mainFragmentString = /* glsl */ `#include <normal_fragment_maps>`
      shader.fragmentShader = shader.fragmentShader.replace(
        mainFragmentString,
        mainFragmentString + '\n' + fragmentMain
      )
    },
    emissive: 0xff2214,
    emissiveIntensity: 0.1,
    roughness: 0.5,
  })

  const ico = new THREE.Mesh(geometry, material)
  scene.add(ico)

  const noisyGradientTexture = new THREE.TextureLoader().load(bgGradientNoise)
  scene.background = noisyGradientTexture

  // Fonts and text
  const fontLoader = new FontLoader()

  fontLoader.load('/fonts/droid_sans_mono_regular.typeface.json', (font) => {
    const mainTitleGeometry = new TextGeometry('brieuc.tech', {
      height: 0.1,
      size: 0.3,
      font: font,
    })
    const mainTitleMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      roughness: 3.0,
      // emissive: 0xffffff,
      // emissiveIntensity: 0.1,
    })
    const mainTitleMesh = new THREE.Mesh(mainTitleGeometry, mainTitleMaterial)
    mainTitleMesh.translateX(-1.3)
    mainTitleMesh.translateZ(7)

    scene.add(mainTitleMesh)
  })

  // scene.add(mainTitleGeometry);

  // GUI
  const cameraFolder = gui.addFolder('Camera')
  cameraFolder.add(camera.position, 'z', 0, 10)
  cameraFolder.open()

  // postprocessing
  const renderTargetParameters = {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    stencilBuffer: false,
  }

  // save pass
  const savePass = new SavePass(new THREE.WebGLRenderTarget(width, height, renderTargetParameters))

  // blend pass
  const blendPass = new ShaderPass(BlendShader, 'tDiffuse1')
  blendPass.uniforms['tDiffuse2'].value = savePass.renderTarget.texture
  blendPass.uniforms['mixRatio'].value = MOTION_BLUR_AMOUNT

  // output pass
  const outputPass = new ShaderPass(CopyShader)
  outputPass.renderToScreen = true

  // adding passes to composer
  addPass(blendPass)
  addPass(savePass)
  addPass(outputPass)

  // addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.4, 0.4))

  useTick(({ timestamp, timeDiff }) => {
    const time = timestamp / 10000
    material.userData.shader.uniforms.uTime.value = time
  })
}

export default startApp
