<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Photo to PDF</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <h1>Photo to PDF Converter</h1>
        <input type="file" id="file-input" multiple accept="image/*">
        <button id="generate-pdf">Generate PDF</button>
        <div id="image-preview"></div>
    </div>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.16.0/pdf-lib.min.js"></script>
    <script>
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
            const a4Width = 595.28;
            const a4Height = 841.89;

            for (const file of selectedFiles) {
                const imgBytes = await file.arrayBuffer();
                const img = await pdfDoc.embedJpg(imgBytes);
                const page = pdfDoc.addPage([a4Width, a4Height]);
                page.drawImage(img, {
                    x: 0,
                    y: 0,
                    width: a4Width,
                    height: a4Height
                });
            }

            const pdfBytes = await pdfDoc.save();
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'photos.pdf';
            link.click();
        }
    </script>
</body>
</html>
