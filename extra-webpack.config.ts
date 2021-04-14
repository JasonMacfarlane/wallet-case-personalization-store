import * as webpack from 'webpack';
// import node from 'file.node';

export default {
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader',
      },
    ],
  },
} as webpack.Configuration;