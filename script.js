async function uploadFile() {
    const fileInput = document.getElementById("fileInput");
    const file = fileInput.files[0];

    const formData = new FormData();
    formData.append("file", file);

    await fetch("/upload", {
        method: "POST",
        body: formData
    });

    alert("File uploaded!");
    loadFiles();
}

async function loadFiles() {
    const res = await fetch("/files");
    const files = await res.json();

    const list = document.getElementById("fileList");
    list.innerHTML = "";

    files.forEach(name => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="/download/${name}">${name}</a>`;
        list.appendChild(li);
    });
}

loadFiles();
