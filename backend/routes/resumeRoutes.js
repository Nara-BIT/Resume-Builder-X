/*import express from 'express'
import multer from 'multer';
import { protect } from '../middleware/authMiddleware.js'
import { createResume ,getUserResumeById, getUserResumes, updateResume, deleteResume } from '../controllers/resumeController.js'
import { uploadResumeImages } from '../controllers/uploadImages.js'
const resumeRoutes = express.Router()

const storage = multer.diskStorage({
    // Define the destination where files will be stored
    destination: (req, file, cb) => {
        // 'uploads/' must be a valid directory path relative to where your server starts.
        // Based on your server.js, 'uploads' in the root directory is correct.
        cb(null, 'uploads/'); 
    },
    // Define the filename format
    filename: (req, file, cb) => {
        // Use a unique name to prevent collisions
        cb(null, `${req.params.id}-${Date.now()}-${file.originalname}`);
    }
});

resumeRoutes.post('/',protect, createResume)
resumeRoutes.get('/',protect, getUserResumes)
resumeRoutes.get('/:id',protect, getUserResumeById)

resumeRoutes.put('/:id', protect, updateResume)
resumeRoutes.put('/:id/upload-images', protect, uploadResumeImages)

resumeRoutes.delete('/:id', protect, deleteResume)

export default resumeRoutes*/

// ./routes/resumeRoutes.js

import express from 'express'
import upload from '../middleware/uploadMiddleware.js' // 👈 Import your configured Multer instance
import { protect } from '../middleware/authMiddleware.js'
import { 
    createResume,
    getUserResumeById, 
    getUserResumes, 
    updateResume, 
    deleteResume 
} from '../controllers/resumeController.js'
import { uploadResumeImages } from '../controllers/uploadImages.js'

const resumeRoutes = express.Router()

// --- Standard CRUD Routes ---
resumeRoutes.post('/', protect, createResume)
resumeRoutes.get('/', protect, getUserResumes)
resumeRoutes.get('/:id', protect, getUserResumeById)
resumeRoutes.put('/:id', protect, updateResume)
resumeRoutes.delete('/:id', protect, deleteResume)

// ----------------------------------------------------------------------
// --- File Upload Route (The Fix for the Crash) ---
// ----------------------------------------------------------------------

// The Multer middleware (upload.fields) is inserted here, 
// BEFORE the final controller (uploadResumeImages).
// This correctly processes the FormData and populates req.files.

resumeRoutes.put(
    '/:id/upload-images', 
    protect, 
    // Multer middleware: Expecting 'thumbnail' (from frontend) 
    // and optionally 'profileImage'
    upload.fields([
        { name: "thumbnail" }, 
        { name: "profileImage" }
    ]), 
    // The controller runs AFTER Multer has processed the files
    uploadResumeImages
)

export default resumeRoutes