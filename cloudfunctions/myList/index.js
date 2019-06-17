// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

var rp = require('request-promise');
// 云函数入口函数
exports.main = async(event, context) => {
  let promiseArr = []
  event.myList.forEach(item => {
    promiseArr.push(new Promise((reslove, reject) => {
      rp(`http://api.douban.com/v2/movie/subject/${item.movieId}?apikey=0df993c66c0c636e29ecbb5344252a4a`)
        .then(function(res) {
          console.log(res)
          reslove(res) // reslove(res) 返回res
        })
        .catch(function(err) {
          console.error(err)
        });
    }))
  })
  return Promise.all(promiseArr).then(res => {
    let movieList = []
    console.log(res)
    res.forEach(item => {
      movieList.push(JSON.parse(item))
    })
    return movieList
  }).catch(err => {
    console.error(err)
  });
}