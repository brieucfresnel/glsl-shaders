uniform float uRadius;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {
	gl_FragColor = vec4(vec3(step(0.99, 1.0 - abs(vUv.x - 0.5))), 1);
}
