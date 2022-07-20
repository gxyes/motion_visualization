const path = require('path');
const HWP = require('html-webpack-plugin');

const webpackConfig  = {
   // mode: 'production',
   entry: {
     app: './src/index.js',
   },
   output: {
    filename: './assets/[name].js',
    path: path.resolve(__dirname, './release/three-demo')
   },
   devServer:{
     host:'0.0.0.0',
   	 disableHostCheck: true,
     // compress: true,
     port: 3000,
   },
   devtool: 'inline-source-map',
   plugins:[
    new HWP({
    	 title:'Threejs demo',
    	 template:'./src/html/index.ejs',
    })
   ],
    node: {
        fs: 'empty'
    },
   optimization: {
        splitChunks:{
            cacheGroups:{
                  vendors: { 
                     chunks: 'all',
                     test: /node_modules/,
                     priority: 10,
                     name: 'chunk-vendors',
                  },
                  // other: { 
                  //   chunks: 'all',
                  //   minChunks: 2,
                  //   name: 'other',
                  //   priority: 80,
                  //  },
            }
        }
    },
   module: {
        rules: [
        {
          test: /\.(js)$/,
          exclude: /(node_modules|bower_components)/,
          use: 'babel-loader'
        },
        {test:/\.(ttf|woff|woff2|eot|svg|gltf|glb|fbx|hdr|bin|frag|vert|wasm|obj)$/,use:{
                                                                      loader: 'file-loader',
                                                                      options: {
                                                                        name: './assets/[name].[ext]',
                                                                      }
                                                                      }
                                                        },
          {test:/\.(png|gif|jpg|jpeg)$/,use:{
                                                                      loader: 'file-loader',
                                                                      options: {
                                                                        name: './assets/textures/[name].[ext]',
                                                                      }
                                                                      }
                                                        }                                                           
        ],
    },

};


module.exports = webpackConfig;