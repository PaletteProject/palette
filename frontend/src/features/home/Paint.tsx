import { useEffect, useRef } from "react";
import {
  Renderer,
  Program,
  Mesh,
  Triangle,
  Transform,
  Vec3,
  Camera,
} from "ogl";

function parseHexColor(hex: string) {
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16) / 255;
  const g = parseInt(c.substring(2, 4), 16) / 255;
  const b = parseInt(c.substring(4, 6), 16) / 255;
  return [r, g, b];
}

const vertex = `#version 300 es
precision highp float;
layout(location = 0) in vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const fragment = `#version 300 es
precision highp float;
uniform vec3 iResolution;
uniform float iTime;
uniform vec3 iMouse;
uniform vec3 iColor;
uniform vec3 iCursorColor;
uniform float iAnimationSize;
uniform float iSpeed;
uniform int iBallCount;
uniform float iClumpFactor;
uniform float iCursorBallSize;
out vec4 outColor;
const float PI = 3.14159265359;
float getMetaBallValue(vec2 c, float r, vec2 p) {
    float m = r / distance(p, c);
    return m * m;
}
float hash11(float p) {
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}
vec3 hash31(float p) {
    vec3 r = fract(vec3(p) * vec3(.1031,.1030,.0973));
    r += dot(r, r.yzx+33.33);
    return fract((r.xxy+r.yzz)*r.zyx);
}
vec3 hash33(vec3 p3) {
    p3 = fract(p3*vec3(.1031,.1030,.0973));
    p3 += dot(p3, p3.yxz+33.33);
    return fract((p3.xxy+p3.yxx)*p3.zyx);
}
void main() {
    vec2 fc = gl_FragCoord.xy;
    int count = iBallCount;
    vec3 metaBalls[50];
    for(int i=0;i<50;i++){
        if(i>=count) break;
        float idx = float(i+1);
        vec3 rnd = hash31(idx);
        float st = mix(0.0,PI*2.0,rnd.x);
        float dt = iTime*iSpeed*mix(0.1*PI,0.4*PI,rnd.y);
        float th = st+dt;
        rnd = hash33(rnd);
        vec2 c = vec2(cos(th),sin(th+dt*floor(rnd.x*2.0)))*mix(5.0,10.0,rnd.y)*iClumpFactor;
        float r = mix(0.5,2.0,rnd.z);
        metaBalls[i] = vec3(c,r);
    }
    float w2p = iResolution.y / iAnimationSize;
    float p2w = 1.0 / w2p;
    vec2 coord = (fc - iResolution.xy*0.5)*p2w;
    vec2 mouseW = (iMouse.xy - iResolution.xy*0.5)*p2w;
    float m1 = 0.0;
    for(int i=0;i<50;i++){
        if(i>=count) break;
        m1 += getMetaBallValue(metaBalls[i].xy, metaBalls[i].z, coord);
    }
    float m2 = getMetaBallValue(mouseW, iCursorBallSize, coord);
    float total = m1 + m2;
    float f = smoothstep(-1.0,1.0,(total-1.3)/min(1.0,fwidth(total)));
    vec3 cFinal = vec3(0.0);
    if(total>0.0) {
        float alpha1 = m1/total;
        float alpha2 = m2/total;
        cFinal = iColor*alpha1 + iCursorColor*alpha2;
    }
    outColor = vec4(cFinal*f,1.0);
}
`;

interface ProgramUniforms {
  iTime: { value: number };
  iResolution: { value: Vec3 };
  iMouse: { value: Vec3 };
  iColor: { value: Vec3 };
  iCursorColor: { value: Vec3 };
  iAnimationSize: { value: number };
  iSpeed: { value: number };
  iBallCount: { value: number };
  iClumpFactor: { value: number };
  iCursorBallSize: { value: number };
}

const MetaBalls = ({
  color = "#ffffff",
  speed = 0.3,
  enableMouseInteraction = true,
  hoverSmoothness = 0.05,
  animationSize = 100,
  ballCount = 15,
  clumpFactor = 1,
  cursorBallSize = 3,
  cursorBallColor = "#ffffff",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current as HTMLDivElement;
    if (!container) return;
    const renderer = new Renderer({
      dpr: window.devicePixelRatio,
      alpha: true,
      premultipliedAlpha: false,
    });
    const gl = renderer.gl;
    gl.clearColor(0.0, 0.0, 0.0, 0.0);
    container.appendChild(gl.canvas);
    container.style.backgroundColor = "transparent";
    const camera = new Camera(gl, {
      left: -1,
      right: 1,
      top: 1,
      bottom: -1,
      near: 0.1,
      far: 10,
    });
    camera.position.z = 1;
    const geometry = new Triangle(gl);
    const [r1, g1, b1] = parseHexColor(color);
    const [r2, g2, b2] = parseHexColor(cursorBallColor);
    const program = new Program(gl, {
      vertex,
      fragment,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vec3(0, 0, 0) },
        iMouse: { value: new Vec3(0, 0, 0) },
        iColor: { value: new Vec3(r1, g1, b1) },
        iCursorColor: { value: new Vec3(r2, g2, b2) },
        iAnimationSize: { value: animationSize },
        iSpeed: { value: speed },
        iBallCount: { value: ballCount },
        iClumpFactor: { value: clumpFactor },
        iCursorBallSize: { value: cursorBallSize },
      } as ProgramUniforms,
    });
    const mesh = new Mesh(gl, { geometry, program });
    const scene = new Transform();
    mesh.setParent(scene);
    const mouseBallPos = { x: 0, y: 0 };
    let pointerInside = false;
    let pointerX = 0;
    let pointerY = 0;
    function resize() {
      if (!container) return;
      const dpr = window.devicePixelRatio || 1;
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + "px";
      gl.canvas.style.height = height + "px";
      const typedUniforms = program.uniforms as {
        iTime: { value: number };
        iResolution: { value: Vec3 };
        iMouse: { value: Vec3 };
      };
      typedUniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, 0);
    }
    window.addEventListener("resize", resize);
    resize();
    function onPointerMove(e: MouseEvent) {
      if (!enableMouseInteraction) return;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      pointerX = (px / rect.width) * gl.canvas.width;
      pointerY = (1 - py / rect.height) * gl.canvas.height;
    }
    function onPointerEnter() {
      if (!enableMouseInteraction) return;
      pointerInside = true;
    }
    function onPointerLeave() {
      if (!enableMouseInteraction) return;
      pointerInside = false;
    }
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerenter", onPointerEnter);
    container.addEventListener("pointerleave", onPointerLeave);
    const startTime = performance.now();
    let animationFrameId: number;
    function update(t: number) {
      animationFrameId = requestAnimationFrame(update);
      const elapsed = (t - startTime) * 0.001;
      const typedUniforms = program.uniforms as {
        iTime: { value: number };
        iResolution: { value: Vec3 };
        iMouse: { value: Vec3 };
      };
      typedUniforms.iTime.value = elapsed;
      let targetX, targetY;
      if (pointerInside) {
        targetX = pointerX;
        targetY = pointerY;
      } else {
        const cx = gl.canvas.width * 0.5;
        const cy = gl.canvas.height * 0.5;
        const rx = gl.canvas.width * 0.15;
        const ry = gl.canvas.height * 0.15;
        targetX = cx + Math.cos(elapsed * speed) * rx;
        targetY = cy + Math.sin(elapsed * speed) * ry;
      }
      mouseBallPos.x += (targetX - mouseBallPos.x) * hoverSmoothness;
      mouseBallPos.y += (targetY - mouseBallPos.y) * hoverSmoothness;
      typedUniforms.iMouse.value.set(mouseBallPos.x, mouseBallPos.y, 0);
      renderer.render({ scene, camera });
    }
    animationFrameId = requestAnimationFrame(update);
    console.log(gl.getContextAttributes());
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerenter", onPointerEnter);
      container.removeEventListener("pointerleave", onPointerLeave);
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [
    color,
    cursorBallColor,
    speed,
    enableMouseInteraction,
    hoverSmoothness,
    animationSize,
    ballCount,
    clumpFactor,
    cursorBallSize,
  ]);

  return (
    <div
      ref={containerRef}
      className="mix-blend-difference w-full h-2/3 mb-10"
      style={{ backgroundColor: color }}
    />
  );
};

export default MetaBalls;
