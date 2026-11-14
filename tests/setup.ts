import "@testing-library/jest-dom";

// Mock ResizeObserver for responsive charts
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock HTMLCanvasElement getContext for 2D and WebGL testing in jsdom
const originalGetContext = HTMLCanvasElement.prototype.getContext;
HTMLCanvasElement.prototype.getContext = function (contextType: string, ...args: any[]) {
  if (contextType === "2d") {
    return {
      canvas: this,
      fillStyle: "#000000",
      strokeStyle: "#000000",
      lineWidth: 1,
      fillRect: () => {},
      clearRect: () => {},
      getImageData: (_x: number, _y: number, w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
      }),
      putImageData: () => {},
      createImageData: (w: number, h: number) => ({
        data: new Uint8ClampedArray(w * h * 4),
        width: w,
        height: h,
      }),
      setTransform: () => {},
      drawImage: () => {},
      save: () => {},
      fillText: () => {},
      restore: () => {},
      beginPath: () => {},
      moveTo: () => {},
      lineTo: () => {},
      closePath: () => {},
      stroke: () => {},
      fill: () => {},
      arc: () => {},
      scale: () => {},
      translate: () => {},
      rotate: () => {},
      measureText: (text: string) => ({ width: text.length * 6 }),
      transform: () => {},
      rect: () => {},
      strokeRect: () => {},
      clip: () => {},
    } as any;
  }

  if (contextType === "webgl" || contextType === "webgl2" || contextType === "experimental-webgl") {
    return {
      canvas: this,
      getExtension: () => null,
      getParameter: () => "WebGL 1.0",
      createShader: () => ({}),
      shaderSource: () => {},
      compileShader: () => {},
      getShaderParameter: () => true,
      getShaderInfoLog: () => "",
      createProgram: () => ({}),
      attachShader: () => {},
      linkProgram: () => {},
      getProgramParameter: () => true,
      getProgramInfoLog: () => "",
      useProgram: () => {},
      createBuffer: () => ({}),
      bindBuffer: () => {},
      bufferData: () => {},
      enableVertexAttribArray: () => {},
      vertexAttribPointer: () => {},
      drawArrays: () => {},
      viewport: () => {},
      clearColor: () => {},
      clear: () => {},
      enable: () => {},
      disable: () => {},
      blendFunc: () => {},
      depthFunc: () => {},
      cullFace: () => {},
      frontFace: () => {},
      colorMask: () => {},
      depthMask: () => {},
      getAttribLocation: () => 0,
      getUniformLocation: () => ({}),
      uniform1f: () => {},
      uniform2f: () => {},
      uniform3f: () => {},
      uniform4f: () => {},
      uniformMatrix4fv: () => {},
    } as any;
  }

  return originalGetContext.call(this, contextType as any, ...args);
};

// Polyfill requestAnimationFrame / cancelAnimationFrame
if (typeof window !== "undefined") {
  window.requestAnimationFrame = (callback: FrameRequestCallback) => {
    return setTimeout(() => callback(Date.now()), 16) as unknown as number;
  };
  window.cancelAnimationFrame = (id: number) => {
    clearTimeout(id);
  };
}
