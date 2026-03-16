// Initialize AOS Animations
AOS.init({ duration: 1000, once: true });

const dropZone = document.getElementById('drop-zone');
const modal = document.getElementById('upload-modal');
const loading = document.getElementById('loading-overlay');
let selectedFiles = [];

// Drag & Drop Animation
['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.add('border-red-500', 'bg-red-50/50');
        gsap.to(dropZone, { scale: 1.02, duration: 0.3 });
    }, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
        dropZone.classList.remove('border-red-500', 'bg-red-50/50');
        gsap.to(dropZone, { scale: 1, duration: 0.3 });
    }, false);
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    selectedFiles = Array.from(e.dataTransfer.files);
    processFiles();
});

// UI Tool Selection
function openTool(toolName) {
    document.getElementById('modal-title').innerText = toolName;
    modal.classList.remove('hidden');
    gsap.fromTo("#upload-modal div", { y: 50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "back.out(1.7)" });
}

function closeModal() {
    modal.classList.add('hidden');
    loading.classList.add('hidden');
    dropZone.classList.remove('hidden');
}

// Processing Logic
async function processFiles() {
    if (selectedFiles.length === 0) return;

    // Show Loading
    dropZone.classList.add('hidden');
    loading.classList.remove('hidden');

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('files', file));

    // Simple Route Handling logic based on modal title
    const tool = document.getElementById('modal-title').innerText.toLowerCase();
    
    try {
        const response = await fetch(`/${tool}`, {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "processed-document.pdf";
            document.body.appendChild(a);
            a.click();
            
            // Success animation
            setTimeout(() => {
                alert('Success! Your file is downloaded.');
                closeModal();
            }, 1000);
        }
    } catch (error) {
        console.error("Processing failed", error);
        alert("Server error processing your file.");
        closeModal();
    }
}