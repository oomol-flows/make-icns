import type { Context } from "@oomol/types/oocana";
import png2icons from "png2icons";
import fs from "fs/promises";
import path from "path";

// Use const assertion to define immutable configuration
const ICON_TYPES = {
  ICNS: "icns",
  ICO: "ico"
} as const;

type IconType = typeof ICON_TYPES[keyof typeof ICON_TYPES];

// Merge enum definitions
const INTERPOLATION_MODES = {
  NEAREST_NEIGHBOR: 0,
  BILINEAR: 1,
  BICUBIC: 2,
  BEZIER: 3,
  HERMITE: 4,
  BICUBIC2: 5,
} as const;

type InterpolationMode = typeof INTERPOLATION_MODES[keyof typeof INTERPOLATION_MODES];

//#region generated meta
type Inputs = {
  image: string;
  save_dir: string | null;
  icon_type: "icns" | "ico";
  interpolation: number;
};
type Outputs = {
  icns_address: string;
};
//#endregion

// Custom error type
class IconGenerationError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = "IconGenerationError";
  }
}

// Logging utility - using console
const logger = {
  info: (message: string) => console.log(`[IconGenerator] ${message}`),
  error: (message: string, error?: Error) => console.error(`[IconGenerator] ${message}`, error),
  debug: (message: string) => console.debug(`[IconGenerator] ${message}`),
};

// Validate input parameters
const validateInputs = (inputs: Inputs): void => {
  const { image, icon_type, interpolation } = inputs;
  
  if (!image?.trim()) {
    throw new IconGenerationError("Input image path cannot be empty");
  }
  
  if (!Object.values(ICON_TYPES).includes(icon_type)) {
    throw new IconGenerationError(`Unsupported icon type: ${icon_type}`);
  }
  
  if (interpolation < 0 || interpolation > 5) {
    throw new IconGenerationError(`Unsupported interpolation mode: ${interpolation}`);
  }
};

// Safe path construction
const buildOutputPath = (
  inputPath: string,
  saveDir: string | null,
  fallbackDir: string,
  extension: string
): string => {
  const fileName = path.basename(inputPath, path.extname(inputPath));
  const outputDir = saveDir ? path.resolve(saveDir) : fallbackDir;
  
  return path.join(outputDir, `${fileName}.${extension}`);
};

// Core icon generation logic
const generateIcon = async (
  inputBuffer: Buffer,
  iconType: IconType,
  interpolation: number
): Promise<Buffer> => {
  let output: Buffer | null = null;
  
  switch (iconType) {
    case ICON_TYPES.ICNS:
      output = png2icons.createICNS(inputBuffer, interpolation, 0);
      break;
    case ICON_TYPES.ICO:
      output = png2icons.createICO(inputBuffer, interpolation, 20, true);
      break;
    default:
      throw new IconGenerationError(`Unsupported icon type: ${iconType}`);
  }
  
  if (!output || output.length === 0) {
    throw new IconGenerationError("Icon generation failed: output is empty");
  }
  
  return output;
};

// Ensure directory exists
const ensureDirectoryExists = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

export default async function (
  params: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {
  try {
    logger.debug("Starting icon generation task");
    validateInputs(params);
    
    const { image, save_dir, icon_type, interpolation } = params;
    
    // Read input file
    logger.debug(`Reading input image: ${image}`);
    let inputBuffer: Buffer;
    try {
      inputBuffer = await fs.readFile(image);
    } catch (error) {
      throw new IconGenerationError(`Cannot read image file: ${image}`, error as Error);
    }
    
    // Build output path
    const outputPath = buildOutputPath(
      image,
      save_dir,
      context.sessionDir,
      icon_type
    );
    
    // Ensure output directory exists
    await ensureDirectoryExists(path.dirname(outputPath));
    
    // Generate icon
    logger.debug(`Generating ${icon_type.toUpperCase()} icon, interpolation mode: ${interpolation}`);
    const iconBuffer = await generateIcon(inputBuffer, icon_type, interpolation);
    
    // Write output file
    logger.debug(`Writing output file: ${outputPath}`);
    try {
      await fs.writeFile(outputPath, iconBuffer);
    } catch (error) {
      throw new IconGenerationError(`Cannot write output file: ${outputPath}`, error as Error);
    }
    
    logger.info(`Icon generation successful: ${outputPath}`);
    
    return { icns_address: outputPath };
    
  } catch (error) {
    const err = error instanceof IconGenerationError 
      ? error 
      : new IconGenerationError("An unknown error occurred during icon generation", error as Error);
    
    logger.error(err.message, err.cause);
    throw err;
  }
};
