// utils/device.js
/**
 * 检测是否为 iPad 或大屏设备
 */
function detectPad(callback) {
  try {
    const info = wx.getSystemInfoSync()
    const forcePad = wx.getStorageSync('forcePad') === true || wx.getStorageSync('forcePad') === '1'
    if (forcePad) {
      callback(true)
      return
    }

    const model = (info.model || '').toLowerCase()
    const deviceType = (info.deviceType || '').toLowerCase()
    const isIpadModel = model.includes('ipad') || deviceType === 'pad'
    const isWide = info.windowWidth >= 1024

    // 在开发者工具中，按宽度阈值触发 iPad 布局
    callback(isIpadModel || isWide)
  } catch (err) {
    console.error('检测设备类型失败:', err)
    callback(false)
  }
}

module.exports = {
  detectPad
}
