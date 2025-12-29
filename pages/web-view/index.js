// pages/web-view/index.js
Page({
  data: {
    url: ''
  },
  onLoad(options) {
    if (options.url) {
      this.setData({
        url: decodeURIComponent(options.url)
      });
    }
  }
})
