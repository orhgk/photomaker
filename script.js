document.getElementById('file-input').addEventListener('change', handleFileSelect);
document.getElementById('generate-pdf').addEventListener('click', generatePDF);

let selectedFiles = [];

function handleFileSelect(event) {
    const files = event.target.files;
    selectedFiles = selectedFiles.concat(Array.from(files));
    updateImagePreview();
}

function updateImagePreview() {
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';

    selectedFiles.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageItem = document.createElement('div');
            imageItem.classList.add('image-item');

            const img = document.createElement('img');
            img.src = e.target.result;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Listeden Çıkar';
            removeButton.classList.add('remove-button');
            removeButton.addEventListener('click', () => removeImage(index));

            imageItem.appendChild(img);
            imageItem.appendChild(removeButton);
            preview.appendChild(imageItem);
        };
        reader.readAsDataURL(file);
    });
}

function removeImage(index) {
    selectedFiles.splice(index, 1);
    updateImagePreview();
}

async function generatePDF() {
    const { PDFDocument, rgb } = PDFLib;
    const pdfDoc = await PDFDocument.create();
    const a4Width = 841.89;
    const a4Height = 595.28;
    const margin = 10;
    const maxWidth = (a4Width - 3 * margin) / 2;
    const maxHeight = (a4Height - 3 * margin) / 2;
    const title = document.getElementById('pdf-title').value;
    let isTitleAdded = false;

    for (let i = 0; i < selectedFiles.length; i += 4) {
        const page = pdfDoc.addPage([a4Width, a4Height]);
        
        if (title && !isTitleAdded) {
            page.drawText(title, {
                x: margin,
                y: a4Height - margin - 30,
                size
