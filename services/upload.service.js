// services/upload.service.js
const path = require('path');
const fs = require('fs').promises;

class UploadService {
  getUploadPath(type, filename) {
    const basePath = path.join(__dirname, '../uploads');
    const dir = type === 'material' ? 'materials' : 'exam-answers';
    return path.join(basePath, dir, filename);
  }

  async saveFile(file, type) {
    // File is already saved by Multer; this service can handle post-processing
    return {
      fileId: file.filename,
      path: this.getUploadPath(type, file.filename)
    };
  }

  async getFileUrl(fileId) {
    // In production, return CDN or signed URL
    return `/api/upload/${fileId}`;
  }

  async deleteFile(fileId) {
    const filePath = path.join(__dirname, '../uploads', fileId);
    try {
      await fs.access(filePath);
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      if (error.code === 'ENOENT') return false;
      throw error;
    }
  }
}

module.exports = new UploadService();