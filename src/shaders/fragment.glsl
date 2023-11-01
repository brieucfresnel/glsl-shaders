uniform float uRadius;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;
// vec3(step(uRadius, length(vUv - 0.5))), 1

float drawCircle(vec2 position, vec2 center) {
	return distance(position, center);
}

const vec2 center = vec2(0.5);

void main() {
	gl_FragColor = vec4(vec3(drawCircle(vUv, center)), 1);
}
