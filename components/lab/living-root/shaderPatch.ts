import * as THREE from "three";

export type WindUniforms = {
  uTime: { value: number };
  uWind: { value: number };
  uPointer: { value: THREE.Vector3 }; // x, strength, z
  uGrow: { value: number };
};

export const GROW_FULL = 1.25;

export function makeUniforms(): WindUniforms {
  return {
    uTime: { value: 0 },
    uWind: { value: 1 },
    uPointer: { value: new THREE.Vector3(0, 0, 0) },
    uGrow: { value: GROW_FULL },
  };
}

type Kind = "tree" | "leaf" | "plant";

const HEAD = /* glsl */ `
uniform float uTime;
uniform float uWind;
uniform vec3 uPointer;
uniform float uGrow;
vec2 windDir(vec3 p, float t){
  return vec2(sin(t*0.55 + p.x*0.21 + p.z*0.13), cos(t*0.43 + p.z*0.19 - p.x*0.07));
}
`;

/**
 * Injects wind, pointer bend and growth into a standard or depth material.
 * Displacement is applied after instancing so every instance sways coherently
 * in world space, and the shadow (depth) pass matches what is drawn.
 */
export function patch(mat: THREE.Material, u: WindUniforms, kind: Kind) {
  mat.customProgramCacheKey = () => "lr-" + kind;
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = u.uTime;
    shader.uniforms.uWind = u.uWind;
    shader.uniforms.uPointer = u.uPointer;
    shader.uniforms.uGrow = u.uGrow;

    let head = HEAD;
    if (kind === "tree") head += "attribute float aG; attribute vec3 aC;\n";
    if (kind === "leaf") head += "attribute float aLeafG;\n";
    if (kind === "plant") head += "attribute float aSway;\n";
    shader.vertexShader = shader.vertexShader.replace("#include <common>", "#include <common>\n" + head);

    if (kind === "tree") {
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        /* glsl */ `#include <begin_vertex>
        float gk = clamp((uGrow - aG) * 7.0, 0.0, 1.0);
        gk = gk * gk * (3.0 - 2.0 * gk);
        transformed = mix(aC, transformed, gk);`
      );
    }

    let wind = "";
    if (kind === "tree") {
      wind = /* glsl */ `
        float th = max(mvPosition.y, 0.0);
        vec2 tw = windDir(mvPosition.xyz * 0.3, uTime) * uWind * 0.0011 * th * th;
        mvPosition.xz += tw;`;
    } else if (kind === "leaf") {
      wind = /* glsl */ `
        #ifdef USE_INSTANCING
        vec3 lc = instanceMatrix[3].xyz;
        #else
        vec3 lc = vec3(0.0);
        #endif
        float lk = smoothstep(aLeafG, aLeafG + 0.1, uGrow);
        mvPosition.xyz = lc + (mvPosition.xyz - lc) * lk;
        float lh = max(lc.y, 0.0);
        vec2 lw = windDir(lc * 0.3, uTime) * uWind * 0.0011 * lh * lh;
        float fl = sin(uTime * (3.5 + uWind * 3.0) + lc.x * 7.0 + lc.z * 5.0 + lc.y * 3.0);
        float tip = uv.y;
        mvPosition.xz += lw;
        mvPosition.xyz += vec3(fl * 0.05, fl * 0.04, cos(fl * 2.0 + lc.x) * 0.05) * tip * (0.25 + uWind * 0.6);`;
    } else {
      wind = /* glsl */ `
        #ifdef USE_INSTANCING
        vec3 pc = instanceMatrix[3].xyz;
        #else
        vec3 pc = vec3(0.0);
        #endif
        float sw = aSway * aSway;
        vec2 pw = windDir(pc * 1.7, uTime * 1.3) * (0.04 + 0.1 * uWind) * sw;
        pw += windDir(mvPosition.xyz * 3.0, uTime * 2.4) * 0.025 * uWind * sw;
        vec2 pd = mvPosition.xz - uPointer.xz;
        float pf = exp(-dot(pd, pd) * 0.9) * uPointer.y;
        vec2 push = normalize(pd + vec2(1e-4)) * pf * 0.45 * sw;
        mvPosition.xz += pw + push;
        mvPosition.y -= pf * 0.18 * sw;`;
    }

    shader.vertexShader = shader.vertexShader.replace(
      "#include <project_vertex>",
      /* glsl */ `
      vec4 mvPosition = vec4( transformed, 1.0 );
      #ifdef USE_INSTANCING
        mvPosition = instanceMatrix * mvPosition;
      #endif
      ${wind}
      mvPosition = modelViewMatrix * mvPosition;
      gl_Position = projectionMatrix * mvPosition;`
    );
  };
}
