const express = require('express');
const multer = require('multer');
const { PDFDocument, degrees } = require('pdf-lib');
const fs = require('fs-extra');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('public'));
app.use(express.json());

// TOOL: Merge PDF
app.post('/merge', upload.array('files'), async (req, res) => {
    try {
        const mergedPdf = await PDFDocument.create();
        for (const file of req.files) {
            const pdfBytes = fs.readFileSync(file.path);
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        const pdfBytes = await mergedPdf.save();
        const outputPath = `uploads/merged-${Date.now()}.pdf`;
        fs.writeFileSync(outputPath, pdfBytes);
        res.download(outputPath, () => fs.removeSync(outputPath));
    } catch (err) {
        res.status(500).send("Error merging PDF");
    }
});

// TOOL: Rotate PDF (90 deg)
app.post('/rotate', upload.single('file'), async (req, res) => {
    try {
        const pdfBytes = fs.readFileSync(req.file.path);
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        pages.forEach(page => page.setRotation(degrees(90)));
        
        const resultBytes = await pdfDoc.save();
        const outputPath = `uploads/rotated-${Date.now()}.pdf`;
        fs.writeFileSync(outputPath, resultBytes);
        res.download(outputPath);
    } catch (err) {
        res.status(500).send("Error rotating PDF");
    }
});

// START SERVER
const PORT = 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));