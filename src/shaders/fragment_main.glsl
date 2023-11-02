normal = perturbNormalArb(- vViewPosition, normal, vec2(dFdx(vDisplacement), dFdy(vDisplacement)), faceDirection);
gl_FragColor = vec4(vec3(0.1, 0.3, 0.8), 1);
