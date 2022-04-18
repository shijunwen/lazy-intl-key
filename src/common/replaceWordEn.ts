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
import * as path from "path";

interface TextArrayProps {
  text: string;
  position: any;
}

// 国际化英文
export default vscode.commands.registerCommand("i18nEN", async () => {
  const editor = vscode.window.activeTextEditor;
  if (editor && editor.document.getText(editor.selection)) {
    const allRanges = editor.selections;
    const textArray: Array<TextArrayProps> = [];
    allRanges.forEach((position) => {
      const text = editor.document.getText(position);
      textArray.push({ text: `intlGetKey(${text})`, position });
    });
    editor.edit((editBuilder) => {
      textArray.forEach(({ text, position }) => {
        editBuilder.replace(position, text);
      });
    });
    return;
  }

  if (!vscode.window.activeTextEditor) {
    return;
  }
  const currentlyOpenTabfilePath =
    vscode.window.activeTextEditor.document.fileName;
  const fileInfo = fs.readFileSync(currentlyOpenTabfilePath, "utf8");
  const stringArr1: any = fileInfo.match(/\(\'[\u4e00-\u9fa5]+\'\)/g) || [];
  const stringArr2: any = fileInfo.match(/=\'[\u4e00-\u9fa5]+\'/g) || [];

  fs.readFile(currentlyOpenTabfilePath, "utf8", (err, data) => {
    [...new Set(stringArr1)].forEach((key: any) => {
      const currentKey = key.slice(1, key.length - 1);
      data = data.replace(new RegExp(key, "g"), `(intlGetKey(${currentKey}))`);
    
    });

    [...new Set(stringArr2)].forEach((key: any) => {
      data = data.replace(
        new RegExp(key, "g"),
        `={intlGetKey(${key.slice(1)})}`
      );
    });

    if (data.search("import { intlGetKey } from ") === -1) {
      data = `import { intlGetKey } from 'utils/international'\n${data}`;
    }
    fs.writeFile(currentlyOpenTabfilePath, data, (err) => {
      if (err) {
        return;
      }
    });
  });
});
