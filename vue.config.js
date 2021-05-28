module.exports = {
  chainWebpack: config => {
    config
      .plugin('html')
      .tap(args => {
        args[0].title = "Human Body Partonomy";
        return args;
      })
  }
}
