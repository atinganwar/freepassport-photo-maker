const upload = document.getElementById("upload");
const processBtn = document.getElementById("processBtn");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let removedBgImage;

processBtn.onclick = async () => {

const file = upload.files[0];

if(!file){
alert("Please upload an image first");
return;
}

const blob = await removeBackground(file, {
  publicPath: "https://cdn.jsdelivr.net/npm/@imgly/background-removal/dist/",
});
const img = new Image();
img.src = URL.createObjectURL(blob);

img.onload = () => {

removedBgImage = img;

applyBackground();

};

};


function applyBackground(){

const bgColor = document.getElementById("bgColor").value;

canvas.width = removedBgImage.width;
canvas.height = removedBgImage.height;

if(bgColor !== "transparent"){

ctx.fillStyle = bgColor;
ctx.fillRect(0,0,canvas.width,canvas.height);

}else{

ctx.clearRect(0,0,canvas.width,canvas.height);

}

ctx.drawImage(removedBgImage,0,0);

}


document.getElementById("bgColor").addEventListener("change", () => {

if(removedBgImage){
applyBackground();
}

});


function downloadImage(format){

let link = document.createElement("a");

if(format==="png"){
link.download="passport-photo.png";
link.href=canvas.toDataURL("image/png");
}

if(format==="jpeg"){
link.download="passport-photo.jpeg";
link.href=canvas.toDataURL("image/jpeg");
}

link.click();

}