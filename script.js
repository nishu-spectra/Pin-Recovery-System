let currentTarget = "";
let stream = null;

/* ---------------- CAPTCHA ---------------- */
function generateCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let c = "";
  for (let i = 0; i < 6; i++) {
    c += chars[Math.floor(Math.random() * chars.length)];
  }
  document.getElementById("captchaText").innerText = c;
}
generateCaptcha();
document.getElementById("refreshCaptcha").onclick = generateCaptcha;

/* ---------------- VISIBILITY ---------------- */
function toggleVisibility(id) {
  const el = document.getElementById(id);
  el.type = el.type === "password" ? "text" : "password";
}

/* ---------------- CAMERA ---------------- */
function openCamera(target) {
  currentTarget = target;
  document.getElementById("cameraModal").style.display = "flex";

  navigator.mediaDevices.getUserMedia({ video: true }).then((s) => {
    stream = s;
    document.getElementById("video").srcObject = s;
  });
}

function closeCamera() {
  if (stream) stream.getTracks().forEach((t) => t.stop());
  document.getElementById("cameraModal").style.display = "none";
}

/* ---------------- FILE PICKER ---------------- */
function openFile(target) {
  currentTarget = target;
  document.getElementById("fileInput").click();
}

document.getElementById("fileInput").onchange = (e) => {
  if (e.target.files.length) processImage(e.target.files[0]);
};

/* ---------------- CAPTURE ---------------- */
function captureImage() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0);
  canvas.toBlob((blob) => processImage(blob));
  closeCamera();
}

/* ---------------- OCR CORE ---------------- */
function processImage(file) {
  clearErrors();

  Tesseract.recognize(file, "eng", {
    tessedit_char_whitelist: "0123456789",
  }).then(({ data }) => {
    if (!data.symbols || data.symbols.length < 10) {
      showError(currentTarget, "Picture not clear");
      return;
    }

    let result = [];
    let visibleCount = 0;

    // Process symbols IN ORDER
    data.symbols.forEach((s) => {
      if (/\d/.test(s.text)) {
        if (s.confidence >= 80) {
          result.push(s.text);
          visibleCount++;
        } else {
          result.push("*");
        }
      }
    });

    // Keep EXACT 16 positions
    result = result.slice(0, 16);
    while (result.length < 16) result.push("*");

    /* -------- SERIAL NUMBER -------- */
    if (currentTarget === "serialNumber") {
      if (result.includes("*")) {
        showError("serialNumber", "Picture not clear");
        document.getElementById("serialNumber").value = "";
        return;
      }

      document.getElementById("serialNumber").value = result.join("");
      return;
    }

    /* -------- PIN CODE -------- */
    if (currentTarget === "pinCode") {
      // Stage 1: image clarity
      if (result.filter((x) => x !== "*").length < 6) {
        showError("pinCode", "Picture not clear");
        document.getElementById("pinCode").value = "";
        return;
      }

      // Stage 2: visible digits check
      if (visibleCount < 6) {
        showError("pinCode", "At least 6 digits must be visible");
        document.getElementById("pinCode").value = "";
        return;
      }

      // Stage 3: valid PIN
      document.getElementById("pinCode").value = result.join("");
    }
  });
}

/* ---------------- FORM ---------------- */
function validateForm() {
  const serviceType = document.getElementById("serviceType");
  const serviceNumber = document.getElementById("serviceNumber");
  const serialNumber = document.getElementById("serialNumber");
  const pinCode = document.getElementById("pinCode");
  const captchaInput = document.getElementById("captchaInput");
  const captchaText = document.getElementById("captchaText").innerText;

  document.getElementById("captchaHidden").value = captchaText;

  if (
    !serviceType.value ||
    !serviceNumber.value ||
    !serialNumber.value ||
    !pinCode.value ||
    !captchaInput.value
  ) {
    alert("All fields are required!");
    return false;
  }

  if (captchaInput.value !== captchaText) {
    alert("Captcha does not match");
    return false;
  }

  return true;
}

/* ---------------- ERRORS ---------------- */
function showError(field, msg) {
  const id = field === "pinCode" ? "pinError" : "serialError";
  document.getElementById(id).innerText = msg;
}

function clearErrors() {
  document.getElementById("pinError").innerText = "";
  document.getElementById("serialError").innerText = "";
}
