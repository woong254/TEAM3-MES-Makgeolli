const multer = require("multer");
const fs = require("fs");
const path = require("path");

// [[ multer ]]

// 루트 업로드 폴더
const UPLOAD_ROOT = path.join(__dirname, "..", "uploads");
// 하위 폴더
const DIR_IMAGE = path.join(UPLOAD_ROOT, "image");
const DIR_FILE = path.join(UPLOAD_ROOT, "file");

// 폴더 없을시 생성
[UPLOAD_ROOT, DIR_IMAGE, DIR_FILE].forEach((p) =>
  fs.mkdirSync(p, { recursive: true })
);

// 파일명 안전하게 만들기
function safeBaseName(name) {
  const ext = path.extname(name);
  const base = path.basename(name, ext);
  // 유니코드 정규화 + 제어문자 제거
  let cleaned = base
    .normalize("NFC")
    .replace(/[\u0000-\u001F\u007F]/g, "") // 제어문자 제거
    .replace(/[<>:"/\\|?*]/g, "_") // 윈도우 금지문자 치환
    .replace(/\s+/g, " ") // 공백 정리(원하면 "_"로)
    .trim();

  if (!cleaned) cleaned = "file"; // 비어있을 때 대비
  return cleaned + ext.toLowerCase();
}

// multer 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // .diskStorage : 파일 어디에 저장할지 결정하는 저장엔지 만듬
    // mimetype 기준으로 분기
    // imgage/png, image/jpg, image/jpeg -> image폴더
    // 그외 -> file 폴더
    const isImage = (file.mimetype || "").startsWith("image/");
    cb(null, isImage ? DIR_IMAGE : DIR_FILE);
  },
  // filename : 저장할 파일명 결정
  filename: (req, file, cb) => {
    // 한글 깨짐 방지 : latin1 -> utf-8 복원
    let original = file.originalname;
    try {
      original = Buffer.from(file.originalname, "latin1").toString("utf-8");
    } catch (err) {
      console.error(`한글깨짐방지 에러: ${err}`);
    }
    const safe = safeBaseName(original);
    const ts = Date.now();
    cb(null, `${ts}_${safe}`);
  },
});

// multer 인스턴스 생성
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 20 * 1024 * 1024, //20MB
  },
});

module.exports = {
  upload,
  UPLOAD_ROOT,
  DIR_FILE,
  DIR_IMAGE,
};
