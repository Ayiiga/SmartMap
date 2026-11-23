shader_type canvas_item;
// Feather the edges of the supplied photographic rocket crop into the orbit
// and lunar layers. This is not a generated 3D mesh or a rectangular decal.
void fragment() {
    vec4 pixel = texture(TEXTURE, UV);
    float body_width = mix(0.09, 0.40, smoothstep(0.02, 0.92, UV.y));
    float edge = 1.0 - smoothstep(body_width - 0.10, body_width, abs(UV.x - 0.50));
    float end_feather = smoothstep(0.0, 0.08, UV.y) * (1.0 - smoothstep(0.93, 1.0, UV.y));
    COLOR = vec4(pixel.rgb, pixel.a * edge * end_feather);
}
