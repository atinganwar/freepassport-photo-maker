let uploadedFile = null;
let processedImage = null;
let selectedColor = "#ffffff";

const fileInput = document.getElementById("upload");
const generateBtn = document.getElementById("generateBtn");
const downloadBtn = document.getElementById("downloadBtn");
const canvas = document.getElementById("resultCanvas");
const ctx = canvas.getContext("2d");

/* -----------------------------
   IMAGE RESIZE FUNCTION
------------------------------*/

async function resizeImage(file) {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    img.onload = () => {

      const MAX_SIZE = 1024;

      let width = img.width;
      let height = img.height;

      if (width > height && width > MAX_SIZE) {
        height *= MAX_SIZE / width;
        width = MAX_SIZE;
      } else if (height > MAX_SIZE) {
        width *= MAX_SIZE / height;
        height = MAX_SIZE;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        resolve(blob);
      }, "image/jpeg", 0.9);

    };

    img.src = URL.createObjectURL(file);
  });
}

/* -----------------------------
   FILE UPLOAD
------------------------------*/

fileInput.addEventListener("change", function () {

  const file = this.files[0];

  if (!file) return;

  if (file.size > 6 * 1024 * 1024) {
    alert("Please upload an image smaller than 6MB.");
    fileInput.value = "";
    return;
  }

  uploadedFile = file;

});

/* -----------------------------
   BACKGROUND COLOR SELECT
------------------------------*/

document.querySelectorAll(".bg-option").forEach(btn => {

  btn.addEventListener("click", function () {

    document.querySelectorAll(".bg-option").forEach(b => b.classList.remove("active"));

    this.classList.add("active");

    selectedColor = this.dataset.color;

  });

});

/* -----------------------------
   GENERATE PASSPORT PHOTO
------------------------------*/

generateBtn.addEventListener("click", async () => {

  if (!uploadedFile) {
    alert("Please upload an image first.");
    return;
  }

  try {

    generateBtn.innerText = "Processing...";
    generateBtn.disabled = true;

    const resizedImage = await resizeImage(uploadedFile);

    const blob = await removeBackground(resizedImage);

    const img = new Image();

    img.onload = () => {

      canvas.width = 600;
      canvas.height = 600;

      ctx.fillStyle = selectedColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const scale = Math.min(
        canvas.width / img.width,
        canvas.height / img.height
      );

      const width = img.width * scale;
      const height = img.height * scale;

      const x = (canvas.width - width) / 2;
      const y = (canvas.height - height) / 2;

      ctx.drawImage(img, x, y, width, height);

      processedImage = canvas.toDataURL("image/png");

      generateBtn.innerText = "Generate Passport Photo";
      generateBtn.disabled = false;

      downloadBtn.style.display = "inline-block";

    };

    img.src = URL.createObjectURL(blob);

  } catch (error) {

    console.error(error);

    alert("Error while processing image. Please try a smaller image.");

    generateBtn.innerText = "Generate Passport Photo";
    generateBtn.disabled = false;

  }

});

/* -----------------------------
   DOWNLOAD IMAGE
------------------------------*/

downloadBtn.addEventListener("click", () => {

  if (!processedImage) return;

  const link = document.createElement("a");

  link.href = processedImage;

  link.download = "passport-photo.png";

  link.click();

});
