/*import fs from 'fs'
import path from 'path'

import Resume from '../models/resumeModel.js'

import upload from '../middleware/uploadMiddleware.js'
import { error } from 'console'

export const uploadResumeImages = async (req, res)=>{
    try{
        upload.fields([{name:"thumbnail"}, {name:"profileImage"}])
        (req, res, async (err) => {
            if(err){
                return res.status(400).json({ message: "File upload failed", error: err.message })
            }
            const resumeId = req.params.id;
            const resume = await Resume.findOne({ _id: resumeId , userId: req.user._id })

            if(!resume){
                return res.status(404).json({message: "Resume not found or unauthorized"})
            }
            //use process cwd to locate uploads folder
            const uploadFOlder = path.join(process.cwd(), 'uploads')
            const baseUrl = `${req.protocol}://${req.get('host')}`;
            const newThumbnail = req.files.thumbnail?.[0];
            const newProfileImage = req.files.profileImage?.[0];

            if(newThumbnail){
                if(resume.thumbnailLink){
                    const oldThumbnail = path.join(uploadsFOlder, path.basename(resume.thumbnailLink));
                    if(fs.existsSync(oldThumbnail)){
                        fs.unlinkSync(oldThumbnail);
                    }

                }
                resume.thumbnailLink = `${baseUrl}/uploads/${newThumbnail.filename}`;

            }
            //Same for profilepreview image

            if(newProfileImage){
                if(resume.profileInfo?.profilePreviewUrl){
                    const oldProfile = path.join(uploadsFOlder, path.basename(resume.profileInfo.profilePreviewUrl));
                    if(fs.existsSync(oldProfile)){
                        fs.unlinkSync(oldProfile);
                    }
                }
                resume.profileInfo.profilePreviewUrl = `${baseUrl}/uploads/${newProfileImage.filename}`;
            }
            
            await resume.save();
            res.status(200).json({ message: "Images uploaded successfully", 
                thumbnailLink: resume.thumbnailLink,
                profilePreviewUrl: resume.profileInfo.profilePreviewUrl
            });
            
        })
    }
    catch(err){
        console.error('Error uploading images:', err);
        res.status(500).json({ message: "Failed to upload images", error: err.message });
    }
}*/

// ./controllers/uploadImages.js

import fs from 'fs'
import path from 'path'
import Resume from '../models/resumeModel.js'

// ⚠️ We no longer import 'upload' (Multer instance) here, 
// as it is now correctly used as middleware in the route.

// Helper function to remove old file (better error handling for production)
const removeOldFile = (filePath) => {
    if (fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath);
            console.log(`Successfully removed old file: ${filePath}`);
        } catch (error) {
            console.error(`Failed to remove old file ${filePath}:`, error);
        }
    }
};

export const uploadResumeImages = async (req, res) => {
    
    // Multer has run as middleware in the route chain and populated req.files
    const newThumbnail = req.files?.thumbnail?.[0];
    const newProfileImage = req.files?.profileImage?.[0];
    
    // We need to keep track of any newly uploaded files in case of a later error (like 404)
    const uploadedFiles = [];
    if (newThumbnail) uploadedFiles.push(newThumbnail.path);
    if (newProfileImage) uploadedFiles.push(newProfileImage.path);

    try {
        const resumeId = req.params.id;
        // Ensure req.user._id is available via the 'protect' middleware
        const resume = await Resume.findOne({ _id: resumeId, userId: req.user._id });

        if (!resume) {
            // Cleanup: If resume is not found, delete the files Multer saved
            uploadedFiles.forEach(path => removeOldFile(path));
            return res.status(404).json({ message: "Resume not found or unauthorized" });
        }

        const uploadsFOlder = path.join(process.cwd(), 'uploads');
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        
        // --- Process Thumbnail ---
        if (newThumbnail) {
            // Delete old thumbnail if it exists
            if (resume.thumbnailLink) {
                const oldThumbnailPath = path.join(uploadsFOlder, path.basename(resume.thumbnailLink));
                removeOldFile(oldThumbnailPath);
            }
            // Update link with the new file's name provided by Multer
            resume.thumbnailLink = `${baseUrl}/uploads/${newThumbnail.filename}`;
        }

        // --- Process Profile Image ---
        if (newProfileImage) {
            // Delete old profile image if it exists
            if (resume.profileInfo?.profilePreviewUrl) {
                const oldProfilePath = path.join(uploadsFOlder, path.basename(resume.profileInfo.profilePreviewUrl));
                removeOldFile(oldProfilePath);
            }
            // Update link with the new file's name provided by Multer
            resume.profileInfo.profilePreviewUrl = `${baseUrl}/uploads/${newProfileImage.filename}`;
        }
        
        await resume.save();

        res.status(200).json({ 
            message: "Images uploaded successfully", 
            thumbnailLink: resume.thumbnailLink,
            profilePreviewUrl: resume.profileInfo.profilePreviewUrl
        });
    }
    catch (err) {
        console.error('Error uploading images:', err);
        
        // Cleanup: If the DB update fails, delete the files Multer saved
        uploadedFiles.forEach(path => removeOldFile(path));

        res.status(500).json({ message: "Failed to upload images", error: err.message });
    }
}