import express from 'express';
import multer from 'multer';
import { uploadFile, searchFile,exportFile } from '../controller/fileController.js';
import path from 'path'; // Ensure this is imported

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Directory for file storage
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
  }
});
const upload = multer({ storage: storage });

router.post('/upload', upload.single('file'), uploadFile);
router.post('/search', searchFile);
router.get('/export', exportFile);
export default router;
