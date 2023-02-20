import type { CoordinateInterface } from "../interface";

export interface drawCircle_Argument {
  radius: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  center: CoordinateInterface;
  ctx: CanvasRenderingContext2D;
}

export function drawCircle(arg: drawCircle_Argument) {
  const { ctx, radius, center } = arg;

  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.arc(center.x, center.y, radius, 0, Math.PI * 2);

  if (arg.fillColor) {
    const { strokeWidth = 1 } = arg;
    ctx.lineWidth = strokeWidth;
    ctx.fillStyle = arg.fillColor;
    ctx.fill();
  }

  if (arg.strokeColor) {
    ctx.strokeStyle = arg.strokeColor;
    ctx.stroke();
  }
}

export interface drawText_Argument {
  font?: string;
  text: string;
  color: string;
  align?: CanvasTextAlign;
  baseline?: CanvasTextBaseline;
  ctx: CanvasRenderingContext2D;
  coordinate: CoordinateInterface;
}
export function drawText(arg: drawText_Argument) {
  const {
    ctx,
    font,
    text,
    color,
    coordinate,
    align = "start",
    baseline = "top",
  } = arg;

  if (font) ctx.font = font;
  if (color) ctx.fillStyle = color;

  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.fillText(text, coordinate.x, coordinate.y);
}
