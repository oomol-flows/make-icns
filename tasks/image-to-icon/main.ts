import type { Context } from "@oomol/types/oocana";
import png2icons from "png2icons";
import fs from "fs";
import path from "path";

enum ICON {
  ICNS = "icns",
  ICO = "ico"
}

enum INTERPOLATION {
  NEAREST_NEIGHBOR = 0,
  BILINEAR = 1,
  BICUBIC = 2,
  BEZIER = 3,
  HERMITE = 4,
  BICUBIC2 = 5,
}

type Inputs = {
  image: string;
  save_dir: string | null;
  icon_type: ICON;
  interpolation: INTERPOLATION;
}
type Outputs = {
  icns_address: string;
}

export default async function (
  params: Inputs,
  context: Context<Inputs, Outputs>
): Promise<Outputs> {
  const { image, save_dir, icon_type, interpolation } = params;
  const input_image = fs.readFileSync(image);
  const fileName = path.basename(image, path.extname(image));
  const save_address = save_dir ? `${save_dir}/${fileName}.${icon_type}` : `${context.sessionDir}/${fileName}.${icon_type}`;
  png2icons.setLogger(console.log);
  let output = null;
  if (icon_type === ICON.ICNS) {
    output = png2icons.createICNS(input_image, interpolation, 0);
  } else {
    output = png2icons.createICO(input_image, interpolation, 20, true);
  }
  if (output) {
    fs.writeFileSync(save_address, output);
  }
  return { icns_address: save_address };
};

