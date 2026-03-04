#version 330

in vec2 fragTexCoord;
in vec4 fragColor;

out vec4 finalColor;

// Texture provided automatically by raylib
uniform sampler2D texture0;

// Custom uniform
uniform float uTime;

void main()
{
    vec4 texel = texture(texture0, fragTexCoord);

    // Pulsing color effect
    float pulse = 0.5 + 0.5 * sin(uTime * 2.0);

    vec3 tinted = texel.rgb * vec3(1.0, pulse, pulse);

    finalColor = vec4(tinted, texel.a) * fragColor;
}