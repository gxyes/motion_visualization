const path = require('path');
const HWP = require('html-webpack-plugin');
const { CleanWebpackPlugin  } = require('clean-webpack-plugin');
const UglifyJsPlugin  = require('uglifyjs-webpack-plugin')


const uglifyJs = new UglifyJsPlugin({
                        parallel: true,
                        sourceMap:true,
                        uglifyOptions: {
                          warnings: false,
                         
                          output:{
                            comments:false,
                          },
                          compress:{
                             drop_console: true,//console
                             pure_funcs: ['console.log']

                          }
                      }
                     });

const webpackConfig  = {
   mode: 'production',
   entry: {
     app: './src/index.js',
   },
   output: {
    filename: './assets/[name]-[hash:5].js',
    path: path.resolve(__dirname, 'release/three-demo'),
    
    // library: 'THREE', 
    // libraryTarget: 'umd',
    // globalObject: 'this'
    // libraryExport: 'default',
   },
   plugins:[
    new CleanWebpackPlugin(),
    new HWP({
       title:'Three-demo-3d',
       template:'./src/html/index.ejs',
    })
   ],
    optimization: {
        // minimizer: [uglifyJs],
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
        	test: /\.js$/,
          exclude: /node_modules/,
          use: 'babel-loader'
        },
        {test:/\.(ttf|woff|woff2|eot|svg|gltf|glb|fbx|hdr|bin|obj)$/,use:{
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
                                         },                                                      
        ],
    },

    stats:{
        version: true,
    }

};


module.exports = webpackConfig;