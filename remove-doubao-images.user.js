// ==UserScript==
// @name         豆包AI生图去水印
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  通过hook掉JSON.parse实现豆包AI生图下载原图去水印!
// @author       LauZzL
// @match        https://www.doubao.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=doubao.com
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function findAllKeysInJson(obj, key) {
        const results = [];
        function search(current) {
            if (current && typeof current === 'object') {
                if (!Array.isArray(current) && Object.prototype.hasOwnProperty.call(current, key)) {
                    results.push(current[key]);
                }
                const items = Array.isArray(current) ? current : Object.values(current);
                for (const item of items) {
                    search(item);
                }
            }
        }
        search(obj);
        return results;
    }

    let _parse = JSON.parse;
    JSON.parse = function(data) {
        let jsonData = _parse(data);
        if (!data.match('creations')) return jsonData;
        console.log(jsonData);
        let creations = findAllKeysInJson(jsonData, 'creations');
        if (creations.length > 0) {
            creations.forEach((creaetion) => {
                creaetion.map((item)=>{
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
})();