varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {

	vec2 uv = vUv;
	uv -= vec2(0.5);
	uv *= 2.0;

	const float RADIUS = 0.8;
	gl_FragColor = vec4(vec3(step(RADIUS, length(uv))), 1);
}
