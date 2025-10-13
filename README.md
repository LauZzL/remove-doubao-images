![remove-doubao-images](https://socialify.git.ci/LauZzL/remove-doubao-images/image?forks=1&language=1&name=1&owner=1&stargazers=1&theme=Dark)

## 全新UI版本

我们已经发布了最新的UI版本，支持批量下载、选中下载、增量下载、无水印预览等。

支持以浏览器扩展、油猴脚本形式运行，本仓库除特殊情况外不再进行更新。

请访问：[https://github.com/LauZzL/doubao-downloader](https://github.com/LauZzL/doubao-downloader)

![KOLd7Hv.gif](https://iili.io/KOLd7Hv.gif)

## 前言

> 本文教程和脚本仅支持网页版豆包，其他客户端豆包可以通过一些抓包工具替换响应实现。

> 由于脚本在实现中未使用GM_方法，所以不是必须依赖油猴插件的。

在使用豆包AI生图时想要将生成的图片保存下来，会发现保存的图片会带有豆包AI的水印。给大家带来一个通过HOOK掉JSON.parse实现豆包AI生图图片无水印下载的教程。

## 开源仓库

> 项目地址：[https://github.com/LauZzL/remove-doubao-images](https://github.com/LauZzL/remove-doubao-images)

使用安装油猴脚本或支持油猴脚本的浏览器进入仓库后点击`remove-doubao-images.user.js`后点击`raw`即可安装脚本。

## 分析思路

> 有很多教程都是通过利用变清晰功能来获取无水印图片，当点击变清晰时豆包会将原图发送至后端，那么由此可以得知前端肯定是有原图的。

> 这里仅分析了实时获取的图片，历史记录的图片也可以通过下方思路分析，但要注意，存放图片数据的JSONPATH是不同的。


首先我们摁 `F12` 打开浏览器的开发者控制台，然后让豆包生成一张图片。

生成后我们使用元素选择器找到任意一张图片的img元素，然后复制图片地址中的图片路径名 `6d078495f9194bf4898b29e3c00040bepreview.jpeg`

![1](https://iili.io/KNjRw74.png)

然后我们在浏览器开发者控制台中搜索这个路径名，可以看到图片数据是通过stream流返回的。

![2](https://iili.io/KNjROp2.png)

我们复制该行JSON数据到浏览器控制台查看一下，数据都包含在 `event_data` 中，我们使用JSON.parse解析一下 `event_data` 方便查看JSON结构。

```javascript
// jsondata为复制的JSON数据
JSON.parse((jsondata).event_data)
```

![3](https://iili.io/KNjRXrG.png)

![4](https://iili.io/KNjRW1s.png)

可以看到图片数据是在content中的creations中，我们继续使用JSON.parse查看content结构。

```javascript
// jsondata为复制的JSON数据
JSON.parse(JSON.parse((jsondata).event_data).message.content)
```

![5](https://iili.io/KNjRVBn.png)

观察creations结构可以发现，原图数据是在 `creations[i].image.image_ori_raw.url` 中，到这里就分析完成。

![6](https://iili.io/KNjRUBe.png)


## 实现脚本

从分析得知原图数据是包含在一个JSON数据中的 `creations` 中的，那么前端要想解析JSON数据肯定需要通过JSON.parse来解析，那么我们就可以HOOK掉JSON.parse，将预览图等替换为原图地址，这样就能实现无水印下载和预览。 

HOOK JSON.parse 方法

```javascript
const _parse = JSON.parse;
JSON.parse = function(data) {
  return _parse(data);
}
```

我们开头提到过 `creations` 的路径在实时对话和历史记录的JSON中PATH是不一样的，所以我们可以编写一个函数来提取JSON中的 `creations` 。

在获取历史对话记录时，会包含多个对话ID，如果有多个生成图片记录时会有多个 `creations` ，所以需要获取到所有的 `creations`。

```javascript
function findAllKeysInJson(obj, key) {
	const results = [];
	function search(current) {
		if (current && typeof current === 'object') = {
			if (!Array.isArray(current) && Object.prototype.hasOwnProperty.call(current, key)) {
				results.push(current[key]);
			}
			const items = Array.isArray(current) ? current: Object.values(current);
			for (const item of items) {
				search(item);
			}
		}
	}
	search(obj);
	return results;
}
```

接下来我们只需要在重写的JSON.parse中修改 `creations` 中图片URL即可。

```javascript
JSON.parse = function(data) {
	let jsonData = _parse(data);
	if (!data.match('creations')) return jsonData;
	let creations = findAllKeysInJson(jsonData, 'creations');
	if (creations.length > 0) {
		creations.forEach((creaetion) = >{
			creaetion.map((item) = >{
				const rawUrl = item.image.image_ori_raw.url;
				item.image.image_ori.url = rawUrl;
				//预览时也去水印
				//item.image.image_preview.url = rawUrl;
				//item.image.image_thumb.url = rawUrl;
				return item;
			});
		})
	}
	return jsonData;
}
```

## 测试

因为代码没有涉及到GM_方法的使用，所以可以直接在浏览器控制台中使用，我们将完整代码粘贴到控制台中，然后让豆包重新生成一组图片。

点击图片后点击下载原图可以看到图片是没有任何水印的，这样就完成了豆包无水印下载。

![7](https://iili.io/KNjRvh7.png)

