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
  if (!fs.existsSync("public")) await mkdir("public"); //Optional if you already have downloads directory
  const destination = path.resolve("./public", folder);
  const fileStream = fs.createWriteStream(destination, { flags: "wx" });
  await finished(Readable.fromWeb(res.body as any).pipe(fileStream));
};
