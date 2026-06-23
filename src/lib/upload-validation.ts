const EXTENSION_MIME: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
};

const IMAGE_MIME_TYPES = new Set(Object.values(EXTENSION_MIME));

const IMAGE_EXTENSIONS = new Set(Object.keys(EXTENSION_MIME));

export interface UploadValidationOptions {
  maxBytes?: number;
  allowedMimeTypes?: Set<string>;
  allowedExtensions?: Set<string>;
}

export interface UploadValidationResult {
  ok: boolean;
  error?: string;
}

function extensionOf(filename: string): string {
  const dot = filename.lastIndexOf('.');
  return dot >= 0 ? filename.slice(dot).toLowerCase() : '';
}

function resolveMime(file: File, ext: string): string {
  if (file.type) return file.type;
  return EXTENSION_MIME[ext] ?? '';
}

export function validateImageUpload(
  file: File,
  options: UploadValidationOptions = {}
): UploadValidationResult {
  const maxBytes = options.maxBytes ?? 800 * 1024;
  const allowedMimeTypes = options.allowedMimeTypes ?? IMAGE_MIME_TYPES;
  const allowedExtensions = options.allowedExtensions ?? IMAGE_EXTENSIONS;

  if (file.size > maxBytes) {
    return {
      ok: false,
      error: `File is too large. Maximum size is ${Math.round(maxBytes / 1024)}KB.`,
    };
  }

  const ext = extensionOf(file.name);
  if (!ext || !allowedExtensions.has(ext)) {
    return { ok: false, error: 'Invalid file extension. Allowed: JPG, PNG, GIF, WebP.' };
  }

  const mime = resolveMime(file, ext);
  if (!mime || !allowedMimeTypes.has(mime)) {
    return { ok: false, error: 'Invalid file type. Only images are allowed.' };
  }

  return { ok: true };
}
