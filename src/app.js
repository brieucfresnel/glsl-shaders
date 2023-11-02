import * as THREE from 'three'
import { addPass, useCamera, useGui, useRenderSize, useScene, useTick } from './render/init.js'
// import postprocessing passes
import { SavePass } from 'three/examples/jsm/postprocessing/SavePass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { BlendShader } from 'three/examples/jsm/shaders/BlendShader.js'
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

// import { TTFLoader } from 'three/examples/jsm/loaders/TTFLoader.js'
// import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js'

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

  const showHelpers = false

  // settings
  const MOTION_BLUR_AMOUNT = 0.5

  // lighting
  const dirLight = new THREE.DirectionalLight('#526cff', 0.5)
  dirLight.position.set(2, 2, 2)

  const dirLight2 = new THREE.DirectionalLight('#D73737', 0.6)
  dirLight2.position.set(-2, -2, -2)

  const ambientLight = new THREE.AmbientLight('#4255FF', 0.6)
  scene.add(dirLight, dirLight2, ambientLight)

  if (showHelpers) {
    const dirLight1helper = new THREE.DirectionalLightHelper(dirLight)
    scene.add(dirLight1helper)

    const dirLight2helper = new THREE.DirectionalLightHelper(dirLight2)
    scene.add(dirLight2helper)

    const gridHelper = new THREE.GridHelper(5, 5)
    scene.add(gridHelper)
  }

  // meshes
  const geometry = new THREE.IcosahedronGeometry(1, 300)
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
  })

  const ico = new THREE.Mesh(geometry, material)
  scene.add(ico)

  const noisyGradientTexture = new THREE.TextureLoader().load(bgGradientNoise)
  scene.background = noisyGradientTexture

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

  addPass(new UnrealBloomPass(new THREE.Vector2(width, height), 0.7, 0.4, 0.4))

  useTick(({ timestamp, timeDiff }) => {
    const time = timestamp / 10000
    material.userData.shader.uniforms.uTime.value = time
  })
}

export default startApp
