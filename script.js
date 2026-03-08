const upload = document.getElementById("upload");
const processBtn = document.getElementById("processBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const bgColorSelect = document.getElementById("bgColor");
const previewCard = document.getElementById("previewCard");
const uploadZone = document.getElementById("uploadZone");
const uploadContent = document.getElementById("uploadContent");
const uploadPreviewWrapper = document.getElementById("uploadPreviewWrapper");
const uploadPreview = document.getElementById("uploadPreview");
const removePhotoBtn = document.getElementById("removePhotoBtn");
const loadingOverlay = document.getElementById("loadingOverlay");
const colorOptions = document.querySelectorAll(".color-option");

let removedBgImage;

// --- Color option click handling ---
colorOptions.forEach(option => {
  option.addEventListener("click", () => {
    colorOptions.forEach(o => o.classList.remove("selected"));
    option.classList.add("selected");
    bgColorSelect.value = option.dataset.color;
    bgColorSelect.dispatchEvent(new Event("change"));
  });
});

// --- Drag and drop ---
uploadZone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadZone.classList.add("drag-over");
});

uploadZone.addEventListener("dragleave", () => {
  uploadZone.classList.remove("drag-over");
});

uploadZone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadZone.classList.remove("drag-over");
  if (e.dataTransfer.files.length) {
    upload.files = e.dataTransfer.files;
    showUploadPreview(e.dataTransfer.files[0]);
  }
});

// --- File input change ---
upload.addEventListener("change", () => {
  if (upload.files[0]) {
    showUploadPreview(upload.files[0]);
  }
});

// --- Show upload preview ---
function showUploadPreview(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    uploadPreview.src = e.target.result;
    uploadContent.style.display = "none";
    uploadPreviewWrapper.style.display = "inline-block";
    uploadZone.classList.add("has-file");
  };
  reader.readAsDataURL(file);
}

// --- Remove photo ---
removePhotoBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  e.preventDefault();
  upload.value = "";
  uploadContent.style.display = "block";
  uploadPreviewWrapper.style.display = "none";
  uploadZone.classList.remove("has-file");
  removedBgImage = null;
  previewCard.style.display = "none";
});

// --- Process button ---
processBtn.onclick = async () => {
  const file = upload.files[0];

  if (!file) {
    alert("Please upload an image first.");
    return;
  }

  loadingOverlay.classList.add("active");

  try {
    const blob = await removeBackground(file);
    const img = new Image();
    img.src = URL.createObjectURL(blob);

    img.onload = () => {
      removedBgImage = img;
      applyBackground();
      previewCard.style.display = "block";
      previewCard.scrollIntoView({ behavior: "smooth", block: "center" });
      loadingOverlay.classList.remove("active");
    };

    img.onerror = () => {
      loadingOverlay.classList.remove("active");
      alert("Error loading the processed image. Please try again.");
    };
  } catch (err) {
    loadingOverlay.classList.remove("active");
    alert("Error processing image. Please try again.");
    console.error(err);
  }
};

// --- Apply background ---
function applyBackground() {
  const bgColor = bgColorSelect.value;

  canvas.width = removedBgImage.width;
  canvas.height = removedBgImage.height;

  if (bgColor !== "transparent") {
    ctx.fillStyle = bgColor === "blue" ? "#1E88E5"
                  : bgColor === "lightgray" ? "#b0bec5"
                  : bgColor === "red" ? "#E53935"
                  : bgColor === "green" ? "#43A047"
                  : bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(removedBgImage, 0, 0);
}

// --- Background colour change ---
bgColorSelect.addEventListener("change", () => {
  if (removedBgImage) {
    applyBackground();
  }
});

// --- Download image ---
function downloadImage(format) {
  const link = document.createElement("a");

  if (format === "png") {
    link.download = "passport-photo.png";
    link.href = canvas.toDataURL("image/png");
  }

  if (format === "jpeg") {
    link.download = "passport-photo.jpeg";
    link.href = canvas.toDataURL("image/jpeg");
  }

  link.click();
}
