async (page) => {
  return await page.evaluate(async () => {
    const r = await fetch('/characters/generated/wang-yangming.webp', { cache: 'reload' });
    const blob = await r.blob();
    const image = new Image();
    image.src = URL.createObjectURL(blob);
    try { await image.decode(); return { status: r.status, size: blob.size, type: blob.type, width: image.naturalWidth }; }
    catch (error) { return { status: r.status, size: blob.size, type: blob.type, error: String(error) }; }
  });
}
