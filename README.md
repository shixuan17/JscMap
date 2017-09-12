# my-webpack

> webpack构建多页面应用

## Build Setup

``` bash
# install dependencies
tar -xzvf node_modules.tar.gz
 
# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build
```

## 项目结构目录及说明

```
│  .babelrc
│  .eslintrc.js 	## eslint代码校验规则文件
│  .gitignore	## git不提交设置
│  package.json		## 包管理器
│  README.md 	## 项目简介
│  webpack.config.js 	## webpack打包设置
│  
├─dist	## 打包后生成的文件（npm run build之前可以清空当前目录）
│  │  index.html	
│  │  index2.html
│  │  
│  ├─images		## 打包生成的静态资源文件name.hash.ext
│  │      bg.a9c2da6b.png
│  │      logo1.0ce401e8.jpg
│  │      logo1.613be1a6.jpg
│  │      
│  └─js		## 根据打包生成的js文件存放位置
│         page1.js
│         page2.js
│          
├─node_modules    ## npm包存放地           
└─src 	## 项目源码存放
    │  config.js 	## 项目通用配置文件，可以区分开发环境，线上环境进行不同的配置，并自动切换
    │  
    ├─assets 	## 公共静态文件资源存放位置
    │  │  bg.png
    │  │  logo.png
    │  │  logo1.jpg
    │  │  
    │  └─bg
    │          logo1.jpg
    │          
    ├─components 	## vue单文件组件存放位置
    │  ├─count1  	## 每个组件一个文件夹，只与当前组件有关的资源同样存放在所属的文件夹中
    │  │      Counter.vue
    │  │      
    │  └─count2
    │          Counter2.vue
    │
    ├─api		## 项目请求中间层，local Storage操作等也存放在此处
    │      
    ├─css 		## 公共css样式存放位置
    │      global.css
    │      
    ├─lib 		## 共同js库存放位置（不使用npm包引入的库）
    │      jquery.js
    │
    ├─html  ## 网页存放地址
    │      
    ├─pages 	## 页面入口js存放位置
    │      app.js
    │      app2.js
    │      
    └─store 	## vuex相关状态文件存放位置，如只使用单个文件放在当前目录，如果使用多个文件则可再创建一个文件夹
            store.js
            store2.js
```
