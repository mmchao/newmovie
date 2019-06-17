// pages/comments/comment.js
const db = wx.cloud.database()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieId: 0,
    movieName: '',
    content: '',
    score: 0,
    images: [],
    newImages: [],
    fileIds: [],
    comment_id: 0,
    like_id: 0,
    updated: false
  },

  checkComment: function() {
    wx.cloud.callFunction({
      name: 'login'
    }).then(res => {
      db.collection('comment').where({
        _openid: res.result.openid
      }).where({
        movieId: this.data.movieId
      }).get().then(res => {
        console.log(res)
        if (res.data.length == 1) {
          this.setData({
            content: res.data[0].content,
            score: res.data[0].score,
            images: res.data[0].fileIds,
            fileIds: res.data[0].fileIds,
            comment_id: res.data[0]._id
          })
        }
      })
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
        }
      })
    })
  },

  onContentChange: function(event) {
    this.setData({
      content: event.detail.value,
      updated: true
    })
  },
  onScoreChange: function(event) {
    this.setData({
      score: event.detail,
      updated: true
    })
  },
  uploadImg: function() {
    wx.chooseImage({
      count: 9,
      sizeType: ['orginal', 'compressed'],
      sourceType: ['album', 'camera'],
      success: res => {
        const temFilePaths = res.tempFilePaths
        console.log(temFilePaths)
        this.setData({
          newImages: this.data.newImages.concat(temFilePaths),
          updated: true
        })
      },
    })
  },
  unchooseImg: function(event) {
    console.log(event)
    var selectedImg = this.data.newImages
    selectedImg.splice(event.target.dataset.index, 1) // 删除点击的图片
    this.setData({
      newImages: selectedImg
    })
  },
  submit: function() {
    wx.showLoading({
      title: '正在提交',
    })
    console.log(this.data.content, this.data.score)
    let promiseArr = []
    this.data.newImages.forEach(item => {
      promiseArr.push(new Promise((reslove, reject) => {
        let suffix = /\.\w+$/.exec(item)[0] // 文件扩展名
        wx.cloud.uploadFile({
          cloudPath: new Date().getTime() + suffix,
          filePath: item,
          success: res => {
            console.log(res.fileID)
            this.setData({
              fileIds: this.data.fileIds.concat(res.fileID)
            })
            reslove()
          },
          fail: console.error
        })
      }))
    })
    if (this.data.comment_id) {
      Promise.all(promiseArr).then(res => {
        db.collection('comment').doc(this.data.comment_id).update({
          data: {
            content: this.data.content,
            score: this.data.score,
            fileIds: this.data.fileIds
          }
        }).then(res => {
          wx.hideLoading()
          wx.showToast({
            title: '评价成功',
          })
          wx.navigateBack({
            delta: 1
          })
        }).catch(err => {
          wx.hideLoading()
          wx.showToast({
            title: '评价失败',
            icon: 'none'
          })
        })
      })
    } else {
      Promise.all(promiseArr).then(res => {
        db.collection('comment').add({
          data: {
            content: this.data.content,
            score: this.data.score,
            movieId: this.data.movieId,
            fileIds: this.data.fileIds
          }
        }).then(res => {
          wx.hideLoading()
          if (this.data.like_id) {
            db.collection('likes').doc(this.data.like_id).remove().then(console.log).catch(console.error)
          }
          wx.showToast({
            title: '评价成功',
          })
          wx.navigateBack({
            delta: 1
          })
        }).catch(err => {
          wx.hideLoading()
          wx.showToast({
            title: '评价失败',
            icon: 'none'
          })
        })
      })
    }
  },

  close: function() {
    wx.navigateBack({
      delta: 1
    })
  },
  delComment: function() {
    wx.cloud.deleteFile({
      fileList: this.data.images
    }).then(console.log).catch(console.error)
    db.collection('comment').doc(this.data.comment_id).remove().then(res => {
      console.log(res)
      this.setData({
        comment_id: 0 // 清空
      })
      wx.showToast({
        title: '删除成功',
      })
      wx.navigateBack({
        delta: 1
      })
    }).catch(err => {
      console.error
      wx.showToast({
        title: '删除失败',
      })
    })
  },
  del: function() {
    wx.showModal({
      title: '删除',
      content: '确认删除此次评分？',
      success: res => {
        if (res.confirm) {
          this.delComment() // ES6写法可避免this指向出错
        }
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      movieId: options.movieId,
      movieName: options.movieName
    })
    this.checkComment()
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