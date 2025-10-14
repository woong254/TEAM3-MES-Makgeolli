const express = require("express");
const { upload } = require("../utils/upload");
const path = require("path");

const router = express.Router();

// multer 공용 라우터
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: "파일이 없습니다." });
  }

  // 저장 실제 경로 (예: /uploads/image/17125453_xxx.png)
  const absPath = req.file.path;

  // 클라이언트에서 접근할 URL
  const rel = absPath.split(path.sep).join("/");
  const idx = rel.lastIndexOf("/uploads/");
  const url = idx >= 0 ? rel.slice(idx) : `uploads/${req.file.filename}`;

  return res.json({
    ok: true,
    fileName: req.file.filename,
    mimetype: req.file.mimetype,
    size: req.file.size,
    url: encodeURI(url),
  });
});

module.exports = router;
