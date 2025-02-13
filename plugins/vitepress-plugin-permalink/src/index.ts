import type { Plugin, ViteDevServer } from "vite";
import createPermalinks, { standardLink } from "./helper";
import type { PermalinkOption } from "./types";
import chalk from "chalk";
import { join } from "node:path";

export * from "./types";

export const log = (message: string, type = "yellow") => {
  console.log((chalk as any)[type](message));
};

export default function VitePluginVitePressPermalink(option: PermalinkOption = {}): Plugin & { name: string } {
  let vitepressConfig: any = {};

  return {
    name: "vite-plugin-vitepress-sidebar-permalink",
    config(config: any) {
      const {
        site: { themeConfig, cleanUrls, locales },
        srcDir,
      } = config.vitepress;

      option.base = option.base ? join(process.cwd(), option.base) : srcDir;

      const permalinks = createPermalinks(option, cleanUrls);

      // Key 为 path，Value 为 permalink
      const pathToPermalink: Record<string, string> = {};
      // Key 为 permalink，Value 为 path
      const permalinkToPath: Record<string, string> = {};
      // 多语言 key 数组
      const localesKeys = Object.keys(locales || {});

      for (const [key, value] of Object.entries(permalinks)) {
        let newValue = value;
        // 如果设置了多语言，则 permalink 添加语言前缀
        const localesKey = localesKeys.find(k => key.startsWith(k));
        if (localesKey) newValue = `/${localesKey}${value.startsWith("/") ? value : `/${value}`}`;

        pathToPermalink[key] = newValue;

        if (permalinkToPath[newValue]) {
          log(`Permalink「${newValue}」已存在，其对应的「${permalinkToPath[newValue]}」将会被 ${key} 覆盖`);
        }

        permalinkToPath[newValue] = key;
      }

      themeConfig.permalinks = { map: pathToPermalink, inv: permalinkToPath };

      // TODO 归档、目录进入后，导航栏对应的 label 没有高亮，需要转为高亮的 link
      // themeConfig.nav = themeConfig.nav?.map((n: any) => {
      //   const link = standardLink(n.link);
      //   const permalink = permalinkToPath[link];
      //   if (permalink) n.link = permalink;
      //   return n;
      // });

      vitepressConfig = config.vitepress;
    },
    configureServer(server: ViteDevServer) {
      const {
        base,
        themeConfig: { permalinks },
      } = vitepressConfig.site;
      // 重写 URL，这是在服务器环境中执行，此时还未到浏览器环境，因此在浏览器地址栏变化之前执行，即浏览器地址栏无延迟变化
      server.middlewares.use((req, _res, next) => {
        if (req.url) {
          const reqUrl = decodeURI(req.url)
            .replace(/[?#].*$/, "")
            .replace(/\.md$/, "")
            .slice(base.length);

          // 如果访问链接 reqUrl 为 permalink，则找到对应的文档路由
          const pageUrl = permalinks.inv[reqUrl.startsWith("/") ? reqUrl : `/${reqUrl}`];

          // 如果找到文档路由，则跳转，防止页面 404
          if (pageUrl) {
            req.url = req.url.replace(encodeURI(reqUrl), encodeURI(pageUrl));
          }
        }

        next();
      });
    },
  };
}
