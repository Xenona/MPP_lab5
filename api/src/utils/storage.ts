import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsPath = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsPath),
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = path.extname(file.originalname) || '';
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

export const upload = multer({ storage });
export const uploadsPathExport = uploadsPath;
