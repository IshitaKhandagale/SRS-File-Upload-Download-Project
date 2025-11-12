document.getElementById('goToManager').addEventListener('click', () => {
  document.getElementById('homepage').style.display = 'none';
  document.getElementById('fileManager').style.display = 'block';
  loadFiles();
});

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  
  try {
    const response = await fetch('/upload', { method: 'POST', body: formData });
    const result = await response.json();
    if (response.ok) {
      showAlert('File uploaded successfully!', 'success');
      loadFiles();
      e.target.reset();
    } else {
      showAlert(result.error || 'Upload failed', 'error');
    }
  } catch (err) {
    showAlert('Upload failed', 'error');
  }
});

async function loadFiles() {
  try {
    const response = await fetch('/files');
    const files = await response.json();
    const tbody = document.querySelector('#filesTable tbody');
    tbody.innerHTML = '';
    
    files.forEach(file => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${file.filename}</td>
        <td>${new Date(file.upload_date).toLocaleString()}</td>
        <td>${file.size}</td>
        <td>${file.type}</td>
        <td>
          <button onclick="downloadFile(${file.id})">Download</button>
          <button onclick="deleteFile(${file.id})">Delete</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    showAlert('Failed to load files', 'error');
  }
}

async function downloadFile(id) {
  try {
    const response = await fetch(`/download/${id}`);
    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = response.headers.get('Content-Disposition').split('filename=')[1] || 'file';
      a.click();
      window.URL.revokeObjectURL(url);
      showAlert('File downloaded successfully!', 'success');
    } else {
      const result = await response.json();
      showAlert(result.error || 'Download failed', 'error');
    }
  } catch (err) {
    showAlert('Download failed', 'error');
  }
}

async function deleteFile(id) {
  if (!confirm('Are you sure you want to delete this file?')) return;
  
  try {
    const response = await fetch(`/delete/${id}`, { method: 'DELETE' });
    const result = await response.json();
    if (response.ok) {
      showAlert('File deleted successfully!', 'success');
      loadFiles();
    } else {
      showAlert(result.error || 'Delete failed', 'error');
    }
  } catch (err) {
    showAlert('Delete failed', 'error');
  }
}

function showAlert(message, type) {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert ${type}`;
  alertDiv.textContent = message;
  document.body.appendChild(alertDiv);
  setTimeout(() => alertDiv.remove(), 3000);
}