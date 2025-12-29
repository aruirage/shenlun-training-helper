Page({
  data: {
    showComment: false,
    commentData: {}
  },

  onGenerateComment() {
    // TODO: 调用云函数 / DeepSeek，拿到点评结果后：
    const mock = {/* 按组件 props 结构填充 */ }
    this.setData({
      showComment: true,
      commentData: mock
    })
  },

  handleAddToLibrary(e) {
    const { materials } = e.detail
    // 在这里真正写入素材库
  },

  handleAddToMemory(e) {
    const { material } = e.detail
    // 在这里真正写入背诵本
  },

  handleOpenSource(e) {
    const { material } = e.detail
    // 打开原文链接
  }
})
