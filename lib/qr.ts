import { QRCodeMaskPattern } from "qrcode";
import { z } from "zod";

export const QRForm = z.object({
  input: z.string().min(1, "Input is required"),
  qVersion: z.coerce.number().int().min(1).max(40).optional(),
  errorCorrection: z.enum(['L', 'M', 'Q', 'H']).optional(),
  mask: z.coerce.number().int().min(0).max(7).transform(num => num as QRCodeMaskPattern | undefined).optional(),
  outputType: z.enum(['png', 'svg', 'utf8']),
  lightTransparent: z.string().optional().transform(x => x === 'on'),
  darkTransparent: z.string().optional().transform(x => x === 'on'),
  scale: z.coerce.number().int().min(1),
  margin: z.coerce.number().int().min(0).max(10),
  lightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  darkColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  logo: z.any()
    .refine((file) => file instanceof Blob, { message: 'Logo is not a file' })
    .refine((file) => ["image/jpeg", "image/png"].includes(file.type), { message: "Only JPG and PNG formats are allowed" })
    .optional()
}).transform(data => ({
  ...data,
  errorCorrection: data.logo ? 'H' : data.errorCorrection // force error correction high
}))

interface Dimensions {
  width: number;
  height: number;
}

interface Position {
  x: number;
  y: number;
}

type Rect = Dimensions & Position

interface PlacementResult {
  imageArea: Rect
  clearedArea: Rect
}

export function centerImageWithClearArea(
  containerSize: number,
  imageSize: Dimensions,
  targetScale: number = 0.4
): PlacementResult {
  // Calculate the target dimension with parity check
  let targetDimension = Math.round(containerSize * targetScale);
  if (containerSize % 2 !== targetDimension % 2) {
    targetDimension += 1;
  }

  // Determine scaled dimensions based on aspect ratio
  const imageAspectRatio = imageSize.width / imageSize.height;
  const scaledWidth = imageAspectRatio > 1 ? targetDimension : targetDimension * imageAspectRatio;
  const scaledHeight = imageAspectRatio > 1 ? targetDimension / imageAspectRatio : targetDimension;

  // Center position in the container
  const position = {
    x: (containerSize - scaledWidth) / 2,
    y: (containerSize - scaledHeight) / 2
  };

  // Define the fully covered cleared area
  const clearedArea = {
    top: Math.ceil(position.y + scaledHeight - 1),
    bottom: Math.floor(position.y),
    left: Math.floor(position.x),
    right: Math.ceil(position.x + scaledWidth - 1)
  };

  // Return the placement details
  return {
    imageArea: {
      x: position.x,
      y: position.y,
      width: scaledWidth,
      height: scaledHeight
    },
    clearedArea: {
      x: clearedArea.left,
      y: clearedArea.bottom,
      width: clearedArea.right - clearedArea.left + 1,
      height: clearedArea.top - clearedArea.bottom + 1
    }
  };
}
