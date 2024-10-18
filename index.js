const dropZone = document.getElementById('drop-zone'); 
let photos = []
dropZone.addEventListener('dragover', (e) => { 
    e.preventDefault(); 
    dropZone.classList.add('hover'); 
}); 

dropZone.addEventListener('dragleave', () => { 
    dropZone.classList.remove('hover'); 
}); 

dropZone.addEventListener('drop', (e) => { 
    e.preventDefault(); 
    dropZone.classList.remove('hover'); 

    const files = e.dataTransfer.files; 
    handleFiles(files); 
}); 

const fileInput = document.getElementById('file-input'); 

fileInput.addEventListener('change', () => { 
    const files = fileInput.files; 
    handleFiles(files); 
}); 

const previewZone = document.getElementById('preview-zone'); 
const c = document.getElementById("image-canvas");
const colorPicker = document.getElementById('colorPicker');
const colorPickerLabel = document.getElementById('colorPickerLabel');
const ctx = c.getContext("2d");

ctx.canvas.width = 1080
ctx.canvas.height = 1080
const reader = new FileReader();
colorPicker.value = "#FFFFFF";
ctx.fillStyle = colorPicker.value;


function readMultipleImages(files) {
    const promises = [];
  
    for (const file of files) {
        const reader = new FileReader();
        const img = new Image();
        reader.onload = (event) => {
            img.src = event.target.result;
            img.filename = file.name.replace(/\.[^/.]+$/, "");
        };
        reader.readAsDataURL(file);
        const promise = new Promise((resolve) => {
            img.onload = () => resolve(img);
        });
    
        promises.push(promise);
    }
  
    return Promise.all(promises);
}
/* Renders image on canvas, then adds image to preview zone */
function addImage(img) {
    // background color
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.fillRect(0, 0, c.width, c.height);

    // image. normalize w and h to 0 to 1.0
    const larger = Math.max(img.width, img.height);
    let w = img.width / larger;
    let h = img.height / larger;
    if (h > w) {
        const x = (1 - w)*0.5*c.width;
        ctx.drawImage(img, x, 0, w * c.width, c.height);
    } else if (w > h) {
        const y = (1 - h)*0.5*c.height;
        ctx.drawImage(img, 0, y, c.width, h * c.height);
    } else {
        ctx.drawImage(img, 0, 0, c.width, c.height);
    }
    const exportImage = c.toDataURL("image/png");

    const imgElement = document.createElement('img');
    imgElement.src = exportImage;
    imgElement.className = "image-preview"; 
    imgElement.filename = img.filename;
    previewZone.appendChild(imgElement);
}
function handleFiles(files) { 
    readMultipleImages(files).then(images => {
        for (const img of images) {
            addImage(img);
            photos.push(img);
            console.log(img.filename);
        }
        console.log(`added ${images.length} photos`);
    }).catch(error => {
        console.error('Error reading images:', error);
    });
} 
function clearFiles() {
    photos = [];
    previewZone.innerHTML = '';
}

colorPicker.onchange = function() {
    const selectedColor = colorPicker.value;
    ctx.fillStyle = selectedColor;
    colorPickerLabel.innerHTML = selectedColor;

    previewZone.innerHTML = '';
    for (const img of photos) {
        addImage(img);
    }
};

const clearBtn = document.getElementById("clearButton");
const downloadBtn = document.getElementById("downloadButton");

clearBtn.addEventListener('click', clearFiles);

downloadBtn.addEventListener('click', function() {
    const images = document.querySelectorAll("#preview-zone img");
    if (images.length == 0) {
        return;
    }
    images.forEach((img, index) => {
        const imageURL = img.src; 
        const link = document.createElement('a');
        link.href = imageURL; 
        link.download = `${img.filename}-framed.png`;
        
        // Programmatically trigger the download
        link.click();
    });
});