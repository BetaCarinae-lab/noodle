#version 330

// Input vertex attributes (from raylib)
in vec3 vertexPosition;
in vec2 vertexTexCoord;
in vec4 vertexColor;

// Output to fragment shader
out vec2 fragTexCoord;
out vec4 fragColor;

// Uniforms provided by raylib
uniform mat4 mvp;

// Custom uniform
uniform float uTime;

void main()
{
    vec3 pos = vertexPosition;

    // Simple wave effect on Y axis
    pos.y += sin(pos.x * 4.0 + uTime * 2.0) * 0.05;

    fragTexCoord = vertexTexCoord;
    fragColor = vertexColor;

    gl_Position = mvp * vec4(pos, 1.0);
}