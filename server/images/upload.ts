// client function

async function uploadFileToCloud(url: string, file: File) {
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  })
  if (!res.ok) throw new Error(res.statusText)
}

export { uploadFileToCloud }
