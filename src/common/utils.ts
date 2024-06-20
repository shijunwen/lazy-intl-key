import * as vscode from "vscode";

import { md5 } from "js-md5";
import fetch from "node-fetch";

interface TranslationData {
  from: string;
  to: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  trans_result: { src: string; dst: string }[];
}
// 假设存在包含对象的数组 srcArray
export interface ObjectItem {
  src: string;
  dst: string;
}

export const getTranslationData = async (word: string) => {
  // 获取用户的配置信息
  const config = vscode.workspace.getConfiguration();
  
  const apiUrl =
    config.get("in18n.apiUrl") ||
    "http://api.fanyi.baidu.com/api/trans/vip/translate";

  const appid = config.get("in18n.appid") || "20240620002081114"; //填写注册API获取的appid
  const key = config.get("in18n.appKey") || "XvLGCmt70TpD1KrWDuvX"; //填写注册API获取的key

  const salt = Math.floor(
    Math.random() * (9999999999 - 1000000000 + 1) + 1000000000
  );

  const _sign = appid + word + salt + key;
  const sign = md5(_sign); //通过MD5算法生成sign
  try {
    const response = await fetch(
      `${apiUrl}?from=zh&to=en&q=${encodeURIComponent(
        word
      )}&appid=${appid}&salt=${salt}&sign=${sign}`
    );

    if (!response.ok) {
      throw new Error("请求失败");
    }
    const responseData = (await response.json()) as TranslationData;
    return responseData.trans_result;
  } catch (error) {
    console.error("发生错误:", error);
  }
};
