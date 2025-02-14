/*
 * @Author: shijunwen
 * @Email: shijunwen@njsdata.com
 * @LastEditors: shijunwen
 * @Date: 2022-04-15 15:32:49
 * @LastEditTime: 2022-04-18 15:55:32
 * @FilePath: \lazy-intl-key\src\common\replaceWordEn.ts
 * @Description: 请描述文件作用
 */
import * as vscode from "vscode";
import * as fs from "fs";
import { ObjectItem, getTranslationData } from "./utils";

// 国际化英文
export default vscode.commands.registerCommand("i18nEN", async () => {
  const editor = vscode.window.activeTextEditor;
  if (
    (editor && editor.document.getText(editor.selection)) ||
    !vscode.window.activeTextEditor
  ) {
    return;
  }
  // 获取用户的配置信息
  const config = vscode.workspace.getConfiguration();
  const i18nPrefix = config.get("in18n.prefix") || "i18n";
  // 获取当前文件的 URI
  const fileUri = vscode.window.activeTextEditor.document.uri;
  // 提取文件所在的目录路径
  const fileDir = vscode.Uri.joinPath(fileUri, "..").fsPath;

  const currentlyOpenTabfilePath =
    vscode.window.activeTextEditor.document.fileName;
  const fileInfo = fs.readFileSync(currentlyOpenTabfilePath, "utf8");
  const chineseWords: any =
    fileInfo.match(
      /(?<!\/\/.*?|\/\*(?:(?!\*\/)[\s\S])*?)([\u4e00-\u9fa5]+)/g
    ) || [];
  const translationDataSource = await getTranslationData(
    chineseWords.join("\n")
  );

  if (!translationDataSource?.length) {
    return;
  }

  // 使用 reduce 进行去重
  const uniqueArray: ObjectItem[] = translationDataSource.reduce(
    (accumulator: ObjectItem[], currentValue: ObjectItem) => {
      // 将已经存在相同 src 的对象过滤掉
      if (!accumulator.some((item) => item.src === currentValue.src)) {
        accumulator.push(currentValue);
      }
      return accumulator;
    },
    []
  );

  const zhJSON: any = {};
  const enJSON: any = {};
  uniqueArray?.forEach(({ src, dst }, index) => {
    const formattedText = dst
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, " ")
      .toLowerCase();
    const words = formattedText.split(" ");
    const keyWords = words.slice(0, 3);

    let key = keyWords.join("_");
    if (zhJSON[`${i18nPrefix}_${key}`]) {
      key = key + "_" + index;
    }

    zhJSON[`${i18nPrefix}_${key}`] = src;
    enJSON[`${i18nPrefix}_${key}`] = dst;
  });
  vscode.env.clipboard.writeText(JSON.stringify({ zhJSON, enJSON }));
});
