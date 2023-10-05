import fs from "fs";
import path from "path";
import { mkdir } from "fs/promises";
import { Readable } from "stream";
import { finished } from "stream/promises";

export function delay(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

export const downloadFile = async (url: string, folder = ".") => {
  const res = await fetch(url);
  // if (!fs.existsSync("data")) await mkdir("data"); //Optional if you already have downloads directory
  // const destination = path.resolve("./data", folder);
  const fileStream = fs.createWriteStream(folder, { flags: "wx" });
  await finished(Readable.fromWeb(res.body as any).pipe(fileStream));
};
