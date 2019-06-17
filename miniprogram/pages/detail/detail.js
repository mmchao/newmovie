// pages/comment/comment.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail:{},
    movieId: 0,
    like_id: 0,
    comment_id:0
  },

  checkMovie(){
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      db.collection('likes').where({
        _openid: res.result.openid
      }).where({
        movieId: this.data.movieId
      }).get().then(res => {
        console.log(res)
        if (res.data.length == 1) {
          this.setData({
            like_id: res.data[0]._id
          })
        } else {
          this.setData({
            like_id: 0
          })
        }
      })
      db.collection('comment').where({
        _openid: res.result.openid
      }).where({
        movieId: this.data.movieId
      }).get().then(res => {
        console.log(res)
        if (res.data.length == 1) {
          this.setData({
            comment_id: res.data[0]._id
          })
        } else {
          this.setData({
            comment_id: 0
          })
        }
      })
    })
  },
  toFixed: function(){
    this.setData({
      'detail.rating.average': this.data.detail.rating.average.toFixed(1)
    })
  },
  toSee: function(){
    if(!this.data.like_id){
      db.collection('likes').add({
        data: {
          movieId: this.data.movieId,
        }
      }).then(res => {
        wx.showToast({
          title: '已添加到想看的电影',
          icon: 'none'
        })
        this.setData({
          like_id: res._id  // 保存数据数据库中唯一的id以便删除
        })
      }).catch(err => {
        wx.showToast({
          title: '操作失败',
          icon: 'none'
        })
      })
    } else {
      db.collection('likes').doc(this.data.like_id).remove().then(res =>{
        console.log(res)
        this.setData({
          like_id: 0  // 清空
        }) 
      }).catch(console.error)
    }
  },

  gotoComment: function (event) {
    console.log(event)
    wx.navigateTo({
      url: `../comment/comment?movieName=${event.target.dataset.moviename}&movieId=${event.target.dataset.movieid}`,
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      movieId: options.movieId
    })
    this.checkMovie()
    wx.showLoading({
      title: '加载中',
    })
    wx.cloud.callFunction({
      name: 'getDetail',
      data: {
        movieId: options.movieId
      }
    }).then(res => {
      console.log(res)
      this.setData({
        detail: JSON.parse(res.result)
      })
      this.toFixed()
      wx.hideLoading()
    }).catch(err => {
      console.error(err)
      wx.hideLoading()
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.checkMovie()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})