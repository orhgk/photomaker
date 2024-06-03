document.addEventListener('DOMContentLoaded', function() {
    const { jsPDF } = window.jspdf;
    const fileInput = document.getElementById('file-input');
    const fileInput2 = document.getElementById('file-input-2');
    const uploadSectionBefore = document.getElementById('upload-section-before');
    const uploadSectionAfter = document.getElementById('upload-section-after');
    const fileList = document.getElementById('file-list');
    const dropArea = document.getElementById('drop-area');
    const dropArea2 = document.getElementById('drop-area-2');
    const browseButtons = document.querySelectorAll('.browse');
    const generatePdfButton = document.getElementById('generate-pdf');
    const downloadLink = document.getElementById('download-link');

    let filesArray = [];

    browseButtons.forEach(button => {
        button.addEventListener('click', function() {
            fileInput.click();
        });
    });

    fileInput.addEventListener('change', handleFiles);
    fileInput2.addEventListener('change', handleFiles);

    function handleFiles(event) {
        const files = event.target.files;
        handleFileList(files);
    }

    function handleFileList(files) {
        for (let i = 0; i < files.length; i++) {
            filesArray.push(files[i]);
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';

            const thumbnail = document.createElement('img');
            thumbnail.className = 'thumbnail';
            thumbnail.src = URL.createObjectURL(files[i]);

            const fileName = document.createElement('span');
            fileName.className = 'file-name';
            fileName.textContent = files[i].name;

            const removeButton = document.createElement('button');
            removeButton.className = 'remove-button';
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', function() {
                fileList.removeChild(fileItem);
                filesArray = filesArray.filter(file => file !== files[i]);
                if (fileList.children.length === 0) {
                    uploadSectionBefore.style.display = 'block';
                    uploadSectionAfter.style.display = 'none';
                    downloadLink.style.display = 'none';
                }
            });

            fileItem.appendChild(thumbnail);
            fileItem.appendChild(fileName);
            fileItem.appendChild(removeButton);
            fileList.appendChild(fileItem);
        }

        uploadSectionBefore.style.display = 'none';
        uploadSectionAfter.style.display = 'block';
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight(e) {
        dropArea.classList.add('dragover');
        dropArea2.classList.add('dragover');
    }

    function unhighlight(e) {
        dropArea.classList.remove('dragover');
        dropArea2.classList.remove('dragover');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFileList(files);
    }

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
        dropArea2.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
        dropArea2.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
        dropArea2.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
    dropArea2.addEventListener('drop', handleDrop, false);

    generatePdfButton.addEventListener('click', function() {
        const pdf = new jsPDF({
            orientation: 'landscape',
            unit: 'px',
            format: 'a4'
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const maxImageHeight = (pageHeight - 3 * margin) / 2;
        const maxImageWidth = (pageWidth - 3 * margin) / 2;
        let x = margin, y = margin;

        let imagesLoaded = 0;

        filesArray.forEach((file, index) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = function() {
                const ratio = Math.min(maxImageWidth / img.width, maxImageHeight / img.height);
                const imgWidth = img.width * ratio;
                const imgHeight = img.height * ratio;

                if (index % 4 === 0 && index !== 0) {
                    pdf.addPage();
                    x = margin;
                    y = margin;
                }

                pdf.addImage(img, 'JPEG', x, y, imgWidth, imgHeight);

                x += maxImageWidth + margin;
                if (x >= pageWidth - margin) {
                    x = margin;
                    y += maxImageHeight + margin;
                }

                imagesLoaded++;
                if (imagesLoaded === filesArray.length) {
                    const pdfOutput = pdf.output('blob');
                    const pdfUrl = URL.createObjectURL(pdfOutput);
                    downloadLink.href = pdfUrl;
                    downloadLink.style.display = 'block';
                }
            }
        });
    });
});
