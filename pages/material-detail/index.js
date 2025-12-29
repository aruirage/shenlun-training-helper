// pages/material-detail/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    material: null,
    typeMap: {
      '金句': 'gold',
      '案例': 'case',
      '政策': 'policy',
      '对策': 'strategy',
      '片段': 'segment'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const material = wx.getStorageSync('current_material_detail');
    if (material) {
      this.setData({ material });
      wx.setNavigationBarTitle({
        title: material.topic || '素材详情'
      });
    }
  },

  /**
   * 返回上一页
   */
  goBack() {
    wx.navigateBack();
  },

  /**
   * 切换收藏状态
   */
  toggleCollect() {
    const { material } = this.data;
    material.isCollected = !material.isCollected;
    this.setData({ material });
    
    // 这里可以添加云函数调用来同步数据库
    wx.showToast({
      title: material.isCollected ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  },

  /**
   * 跳转到背诵页
   */
  goToTrain() {
    // 模拟跳转到背诵页，可以传递素材ID
    wx.navigateTo({
      url: `/pages/memory/index?id=${this.data.material.id}`
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})