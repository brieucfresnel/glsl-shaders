uniform float uRadius;

varying vec3 vPosition;
varying vec3 vNormal;
varying vec2 vUv;

void main() {

	vec2 uv = vUv;
	uv -= vec2(0.5);
	uv *= 2.0;
	// vec3(step(uRadius, length(uv)))
	// fract(vUv.x * 10.0)
	// step(0.5, mod(vUv.x * 10.0, 3.0))
	// mix(0.0, 0.1, vUv.x)

	vec3 viewDirection = normalize(cameraPosition - vPosition);

	gl_FragColor = vec4(viewDirection, 1);
}
