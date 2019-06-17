// pages/profile/profile.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myLikes: [],
    myComments: []
  },
  getLists: function() {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      db.collection('likes').where({
        _openid: res.result.openid
      }).get().then(res => {
        console.log(res)
        wx.cloud.callFunction({
          name: 'myList',
          data: {
            myList: res.data
          }
        }).then(res => {
          console.log(res)
          this.setData({
            myLikes: res.result.reverse() // 数据库是按时间顺序 这里转换成时间倒序
          })
        })
      })
      db.collection('comment').where({
        _openid: res.result.openid
      }).get().then(res => {
        console.log(res)
        wx.cloud.callFunction({
          name: 'myList',
          data: {
            myList: res.data
          }
        }).then(res => {
          console.log(res)
          this.setData({
            myComments: res.result.reverse()
          })
        })
      })
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  gotoDetail: function(event) {
    console.log(event)
    wx.navigateTo({
      url: `../detail/detail?movieId=${event.currentTarget.dataset.movieid}`,
    })
  },

  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    this.getLists()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})