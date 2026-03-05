export function exportSVG(svgElement: SVGSVGElement, filename: string = "mechner-diagram") {
  const clone = svgElement.cloneNode(true) as SVGSVGElement;

  // Ensure white background is explicit in the export
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.style.backgroundColor = "white";

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(clone);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });

  downloadBlob(blob, `${filename}.svg`);
}

export function exportPNG(
  svgElement: SVGSVGElement,
  filename: string = "mechner-diagram",
  scale: number = 2
): Promise<void> {
  return new Promise((resolve, reject) => {
    const clone = svgElement.cloneNode(true) as SVGSVGElement;
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

    const viewBox = svgElement.viewBox.baseVal;
    const width = viewBox.width || svgElement.clientWidth;
    const height = viewBox.height || svgElement.clientHeight;

    // Set explicit dimensions for the canvas
    clone.setAttribute("width", String(width));
    clone.setAttribute("height", String(height));

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width * scale;
      canvas.height = height * scale;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Could not get canvas context"));
        return;
      }

      // White background
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);

      URL.revokeObjectURL(url);

      canvas.toBlob((blob) => {
        if (blob) {
          downloadBlob(blob, `${filename}.png`);
          resolve();
        } else {
          reject(new Error("Could not create PNG blob"));
        }
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load SVG as image"));
    };

    img.src = url;
  });
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
