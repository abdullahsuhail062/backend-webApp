import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded');

  res.json({
    success: true,
    message: 'File uploaded successfully',
    url: req.file.path,
    publicId: req.file.filename
  });
});