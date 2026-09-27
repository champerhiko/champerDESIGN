// Görsel işlemleri: her biri kaynak canvas'tan yeni bir canvas üretir (pikseller gerçekten değişir)

export type CropRect = { x: number; y: number; w: number; h: number }; // 0-1 arası oranlar

function draw(w: number, h: number, paint: (ctx: CanvasRenderingContext2D) => void): HTMLCanvasElement {
  const out = document.createElement("canvas");
  out.width = w;
  out.height = h;
  const ctx = out.getContext("2d");
  if (ctx) paint(ctx);
  return out;
}

export function imageToCanvas(img: HTMLImageElement): HTMLCanvasElement {
  return draw(img.naturalWidth, img.naturalHeight, (ctx) => ctx.drawImage(img, 0, 0));
}

// 90° saat yönünde: genişlik ve yükseklik yer değiştirir
export function rotate90(src: HTMLCanvasElement): HTMLCanvasElement {
  return draw(src.height, src.width, (ctx) => {
    ctx.translate(src.height, 0);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(src, 0, 0);
  });
}

export function flip(src: HTMLCanvasElement, axis: "h" | "v"): HTMLCanvasElement {
  return draw(src.width, src.height, (ctx) => {
    if (axis === "h") {
      ctx.translate(src.width, 0);
      ctx.scale(-1, 1);
    } else {
      ctx.translate(0, src.height);
      ctx.scale(1, -1);
    }
    ctx.drawImage(src, 0, 0);
  });
}

export function crop(src: HTMLCanvasElement, r: CropRect): HTMLCanvasElement {
  const x = Math.round(r.x * src.width);
  const y = Math.round(r.y * src.height);
  const w = Math.max(1, Math.round(r.w * src.width));
  const h = Math.max(1, Math.round(r.h * src.height));
  return draw(w, h, (ctx) => ctx.drawImage(src, x, y, w, h, 0, 0, w, h));
}
