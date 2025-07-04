/**
 * craco.config.js - Настройки сборки для расширения Grensa.AI
 * 
 * Этот файл настраивает, как именно собирать наше расширение из отдельных
 * файлов в готовый продукт. CRACO - это инструмент, который помогает
 * настроить webpack (программу для сборки) без изменения стандартных настроек.
 * 
 * Что здесь происходит:
 * 1. Настраивает webpack для работы с расширениями браузера
 * 2. Указывает, какие файлы нужно копировать в папку сборки
 * 3. Настраивает обработку CSS и других стилей
 * 4. Устанавливает правильные пути к файлам
 * 5. Настраивает минификацию кода (сжатие для экономии места)
 * 
 * Это как инструкция для фабрики - говорит машинам, как именно
 * собрать готовый продукт из отдельных деталей.
 * 
 * Без этого файла расширение не соберется правильно или не будет
 * работать в браузере.
 */

const path = require("path");
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.entry = {
        main: path.resolve(__dirname, "src/index.js"),
        content: path.resolve(__dirname, "src/content.js"),
        background: path.resolve(__dirname, "src/background.js"),
      };

      webpackConfig.output.filename = "static/js/[name].js";
      webpackConfig.output.chunkFilename = "static/js/[name].js";

      // Disable chunk splitting completely for content script
      webpackConfig.optimization.splitChunks = {
        cacheGroups: {
          default: {
            chunks: (chunk) => chunk.name !== "content",
          },
          vendors: {
            chunks: (chunk) => chunk.name !== "content",
          },
        },
      };

      webpackConfig.optimization.runtimeChunk = false;

      // Оставляем только main.js в index.html (options_page)
      webpackConfig.plugins = webpackConfig.plugins.map(plugin => {
        if (plugin.constructor.name === 'HtmlWebpackPlugin') {
          plugin.options.chunks = ['main'];
        }
        return plugin;
      });

      // Фиксируем имя CSS-файла для content.js
      const MiniCssExtractPlugin = webpackConfig.plugins.find(
        p => p.constructor && p.constructor.name === 'MiniCssExtractPlugin'
      );
      if (MiniCssExtractPlugin) {
        const origFn = MiniCssExtractPlugin.options.filename;
        MiniCssExtractPlugin.options.filename = (pathData) => {
          if (pathData.chunk && pathData.chunk.name === 'content') {
            return 'static/css/content.css';
          }
          if (typeof origFn === 'function') return origFn(pathData);
          return origFn || 'static/css/[name].[contenthash:8].css';
        };
      }

      return webpackConfig;
    },
  },
};
