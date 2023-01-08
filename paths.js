import { dirname } from 'path';
import { fileURLToPath } from 'url';

export const __dirname = dirname(fileURLToPath(import.meta.url));
export const VIEWS = dirname(fileURLToPath(import.meta.url)) + "/views";
export const CSS = dirname(fileURLToPath(import.meta.url)) + "/views/css";
export const IMAGES = dirname(fileURLToPath(import.meta.url)) + "/views/images";