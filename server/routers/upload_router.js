const express = require("express");
const { upload, UPLOAD_ROOT } = require("../utils/upload");
const path = require("path");

const router = express.Router();

// multer 공용 라우터
router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: "파일이 없습니다." });
  }

  // 저장 실제 경로 (예: /uploads/image/17125453_xxx.png)
  const absPath = req.file.path;

  // 업로드 루트 기준 상대경로 (예: image/17123_XXX.png)
  let storedPath = path.relative(UPLOAD_ROOT, absPath);
  storedPath = storedPath.split(path.sep).join("/");

  // 클라이언트에서 접근할 URL
  const downloadUrl = `/uploads/${storedPath}`;

  return res.json({
    ok: true,
    fileName: req.file.filename, // 저장된 실제 파일명 (timestamp_원본명)
    storedPath, // ★ DB에 저장할 상대경로
    url: encodeURI(downloadUrl), // 프론트에서 즉시 미리보기/다운로드 가능
    mimetype: req.file.mimetype,
    size: req.file.size,
  });
});

module.exports = router;
