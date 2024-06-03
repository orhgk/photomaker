document.getElementById('file-input').addEventListener('change', handleFileSelect);
document.getElementById('generate-pdf').addEventListener('click', generatePDF);

let selectedFiles = [];

function handleFileSelect(event) {
    const files = event.target.files;
    selectedFiles = Array.from(files);
    const preview = document.getElementById('image-preview');
    preview.innerHTML = '';

    selectedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            preview.appendChild(img);
        };
        reader.readAsDataURL(file);
    });
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

    // First page with title
    if (title) {
        const titlePage = pdfDoc.addPage([a4Width, a4Height]);
        titlePage.drawText(title, {
            x: margin,
            y: a4Height - margin - 20,
            size: 30,
            color: rgb(0, 0, 0)
        });
    }

    for (let i = 0; i < selectedFiles.length; i += 4) {
        const page = pdfDoc.addPage([a4Width, a4Height]);
        for (let j = 0; j < 4; j++) {
            if (i + j < selectedFiles.length) {
                const file = selectedFiles[i + j];
                const imgBytes = await file.arrayBuffer();
                const img = await pdfDoc.embedJpg(imgBytes);
                const { width, height } = img.scale(1);
                const aspectRatio = width / height;

                let drawWidth, drawHeight;

                if (aspectRatio > 1) {  // Landscape
                    drawWidth = Math.min(maxWidth, width);
                    drawHeight = drawWidth / aspectRatio;
                } else {  // Portrait
                    drawHeight = Math.min(maxHeight, height);
                    drawWidth = drawHeight * aspectRatio;
                }

                const x = margin + (j % 2) * (maxWidth + margin) + (maxWidth - drawWidth) / 2;
                const y = a4Height - margin - (Math.floor(j / 2) + 1) * (maxHeight + margin) + (maxHeight - drawHeight) / 2;
                page.drawImage(img, {
                    x: x,
                    y: y,
                    width: drawWidth,
                    height: drawHeight
                });
            }
        }
    }

    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'photos.pdf';
    link.click();
}
