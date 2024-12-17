const { envList } = require("../../envList");
const { QuickStartPoints, QuickStartSteps } = require("./constants");
const defaultImg_path = "../../images/20241212153339.jpg"
Page({
  data: {
    knowledgePoints: QuickStartPoints,
    steps: QuickStartSteps,
    img_path:defaultImg_path,
    img_base64:'',
    message:'',
    photoDisabled:false,
    cookbookDisabled:false
  },
  onLoad(){
    
  },
  copyCode(e) {
    const code = e.target?.dataset?.code || '';
    wx.setClipboardData({
      data: code,
      success: () => {
        wx.showToast({
          title: '已复制',
        })
      },
      fail: (err) => {
        console.error('复制失败-----', err);
      }
    })
  },

  discoverCloud() {
    wx.switchTab({
      url: '/pages/examples/index',
    })
  },

  gotoGoodsListPage() {
    wx.navigateTo({
      url: '/pages/goods-list/index',
    })
  },
  // 转换为Base64
  convertToBase64: function (filePath) {
    const fs = wx.getFileSystemManager();

    fs.readFile({
        filePath: filePath,
        encoding: 'base64', // 转换为 Base64
        success: (res) => {
            const imgBase64 = `data:image/jpeg;base64,${res.data}`;
            this.uploadToServer(imgBase64);
        },
        fail: (error) => {
            console.error(error);
        }
    });
},
// 获取图片的网络URL地址
  takePhoto(){
    let me = this;
    wx.chooseMedia({
      count: 1, // 默认9
      mediaType:['image'],
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (result) {
        let imgURL = result.tempFiles[0].tempFilePath;
        let imgName = `${new Date().getTime()}${imgURL.substring(imgURL.lastIndexOf("."))}`
        wx.showLoading({
          title: '上传中',
        })
        wx.cloud.uploadFile({
          cloudPath: imgName, // 上传至云端的路径
          filePath: imgURL, // 小程序临时文件路径
          success: res => {
            // 返回文件 ID
            let fileId = res.fileID
            console.log(fileId)
            wx.cloud.getTempFileURL({
              fileList: [fileId],
              success: res => {
                wx.hideLoading();
                let imgurl = res.fileList[0].tempFileURL;
                me.setData({
                  'img_path':imgurl,
                  'message':''
                })
              },
              fail: console.error
            })
          },
          fail: console.error
        })
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  takeCookbook(){
    this.requestAI()
  },
  requestAI(){	
    // 初始化 API Key 和请求参数
  const apiKey = "xxxxxxx"; // 替换为您的真实 API 密钥
  const apiUrl = "https://open.bigmodel.cn/api/paas/v4/chat/completions"; // API 请求地址

  const requestData = {
      model: "glm-4v-flash", // 指定模型名称
      messages: [
          {
              role: "user",
              content: [
                {
                  "type": "text",
                  "text": "描述图片里面的食材种类，并且推荐做成什么样子的菜，给出做菜的步奏。"
                },
                {
                  "type": "image_url",
                  "image_url": {
                      "url" : this.data.img_path
                  }
                }
              ]
          }
      ]
  };
    let me = this;
    wx.showLoading({
      title: '获取中',
    })
    wx.request({
      url: 'apiUrl', //仅为示例，并非真实的接口地址
      method:'POST',
      data: requestData
     ,
      header: {
        'content-type': 'application/json', // 默认值
        'Authorization': `Bearer ${apiKey}`
      },
      success (res) {
        wx.hideLoading()
        console.log(res.data)
        me.setData({
          message: res.data.choices[0].message.content.replace(/\\n/g, '\n'),
        })
      }
    })


    const ctx  = wx.createCameraContext()
    ctx.takePhoto({
      quality:"high", //高质量的图片
      success: res => {
        //res.tempImagePath照片文件在手机内的的临时路径
        let tempImagePath = res.tempImagePath
        this.setData({
          src: tempImagePath
        })
      }
    })
  },
});
