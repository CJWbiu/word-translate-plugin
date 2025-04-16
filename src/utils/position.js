export const getPosition = (width, height, top, left) => {
  // 获取视口的宽度和高度
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const gap = 20;

  // 如果超出右边界，调整 left 值
  if (left + width > viewportWidth) {
    left = viewportWidth - width - gap;
  }

  // 如果超出下边界，调整 top 值
  if (top + height > viewportHeight) {
    top = viewportHeight - height - gap;
  }

  // 确保 top 和 left 不小于 0（避免超出左边界或上边界）
  top = Math.max(top, 0);
  left = Math.max(left, 0);
  return { top, left };
}