export default defineAppConfig({
  pages: [
    "pages/login/index",
    "pages/index/index",
    "pages/album/index",
    "pages/album/preview",
    "pages/growth/index",
    "pages/growth/add",
    "pages/say/index",
    "pages/transfer/index",
  ],
  window: {
    backgroundTextStyle: "light",
    navigationBarBackgroundColor: "#fff",
    navigationBarTitleText: "玩小好",
    navigationBarTextStyle: "black",
  },
  tabBar: {
    color: "#8a8a8a",
    selectedColor: "#7a8ff0",
    borderStyle: "black",
    backgroundColor: "#ffffff",
    list: [
      {
        pagePath: "pages/index/index",
        iconPath: "static/home.png",
        selectedIconPath: "static/home-selected.png",
        text: "首页",
      },
      {
        pagePath: "pages/album/index",
        iconPath: "static/camera.png",
        selectedIconPath: "static/camera-selected.png",
        text: "云相册",
      },
      // {
      //   pagePath: "pages/growth/index",
      //   iconPath: "static/report.png",
      //   selectedIconPath: "static/report-selected.png",
      //   text: "生长记录",
      // },
      {
        pagePath: "pages/say/index",
        iconPath: "static/love.png",
        selectedIconPath: "static/love-selected.png",
        text: "对小好说",
      },
    ],
  },
});
