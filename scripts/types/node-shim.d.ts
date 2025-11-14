/**
 * 为没有安装 @types/node 的脚本提供极简 Node.js 模块声明。
 * 仅覆盖项目中实际使用到的 API，便于通过 TypeScript 编译。
 */
declare module "fs" {
  const fs: {
    promises: {
      readdir(path: string, options?: any): Promise<any>;
      mkdir(path: string, options?: any): Promise<any>;
      copyFile(src: string, dest: string): Promise<void>;
      readFile(path: string, options?: any): Promise<any>;
      writeFile(path: string, data: any, options?: any): Promise<void>;
      access(path: string, mode?: number): Promise<void>;
    };
  };

  export = fs;
}

declare module "path" {
  const path: {
    resolve(...segments: string[]): string;
    join(...segments: string[]): string;
    dirname(p: string): string;
    basename(p: string, ext?: string): string;
    extname(p: string): string;
  };

  export = path;
}

// 极简全局声明，避免未安装 @types/node 时的类型错误
declare const __dirname: string;
declare const __filename: string;
declare var require: any;
declare var module: any;
declare var process: any;

