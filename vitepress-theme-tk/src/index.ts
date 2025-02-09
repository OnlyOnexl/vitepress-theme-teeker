import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import Layout from "./layout/index.vue";
import { configProvider } from "./configProvider";
import "./styles/index.scss";

import "element-plus/theme-chalk/base.css";
import "element-plus/theme-chalk/dark/css-vars.css";
import "element-plus/theme-chalk/el-icon.css";
import "element-plus/theme-chalk/el-image-viewer.css";
import "element-plus/theme-chalk/el-pagination.css";
import "element-plus/theme-chalk/el-input.css";
import "element-plus/theme-chalk/el-breadcrumb.css";
import "element-plus/theme-chalk/el-breadcrumb-item.css";

export type { KtThemeConfig } from "./config/types";

export default {
  extends: DefaultTheme,
  Layout: configProvider(Layout),
  enhanceApp({ app, router, siteData }) {},
} as Theme;
