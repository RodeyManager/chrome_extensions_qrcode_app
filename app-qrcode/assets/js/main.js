;(function init(){
    'use strict';

    $(function(){
        const $content = $('#content'),
              $qrcode  = $('#qrcode'),
              $remark  = $('#remark'),
              $save    = $('#save'),
              $clean   = $('#clean'),
              $caches  = $('#caches'),
              $masker  = $('.masker');
        let putPattern = false,
              isMod    = -1,
              cacheList,
              $img,
              qrcode   = new QRCode($qrcode[0], {
                  width: 150,
                  height: 150
              });

        // 缓存的
        function renderCache(){
            cacheList = JSON.parse(localStorage.getItem('_qrcodes_') || '[]');
            if(cacheList && cacheList.length && cacheList.length > 0){
                let html = '', i = 0, l = cacheList.length;
                for(; i < l; ++i){
                    html += comHTML(cacheList[i], i);
                }
                $caches.html(html);
            }
        }
        function renderTempCache(){
            let tempCache = JSON.parse(localStorage.getItem('_qrcode_temp_'));
            if(tempCache){
                $remark.val(tempCache.remark || '');
                $content.val(tempCache.text || '');
                !!tempCache.text && updateCode(tempCache.text);

            }
        }
        function saveTempData(){
            let tempCache = { remark: $remark.val().trim(), text: $content.val().trim() };
            localStorage.setItem('_qrcode_temp_', JSON.stringify(tempCache));
        }
        renderCache();
        renderTempCache();

        $content.on('compositionstart', function(){
            putPattern = true;
        }).on('compositionend', function(){
            putPattern = false;
        }).on('input', function(evt){
            if(putPattern) return;
            !evt.target.value
                ? $qrcode.addClass('init')
                : updateCode($(this).val());
            // 保存输入缓存
            saveTempData();
        });
        $remark.on('input', function(){
            saveTempData();
        });

        // 点击二维码放大
        $qrcode.find('img').click(function(){
            if($(this).hasClass('zoom')){
                $masker.hide();
                $(this).removeClass('zoom');
            }else{
                $masker.show();
                $(this).addClass('zoom zoom-out');
            }
        });
        $masker.click(function(){
            $masker.hide();
            $qrcode.find('img').removeClass('zoom');
        });

        // 更换二维码内容
        function updateCode(value){
            $qrcode.hasClass('init') && $qrcode.removeClass('init');
            qrcode.makeCode(value || $content.val());
            $qrcode.removeAttr('title');
            !$img && ($img = $qrcode.find('img'));
            if(($img.attr('src') || '').length > 0){
                $img.addClass('zoom-in');
            }
        }

        function getNewCache(){
            return {
                remark: $remark.val().trim(),
                text: $content.val().trim()
            };
        }

        // 储存
        $save.click(function(){
            if(cacheList.find(find)) return;
            let newCache = getNewCache();
            if(!newCache.text) return;
            if(isMod > -1){
                // 更新
                cacheList[isMod] = newCache;
                let $current     = $caches.find('i[data-index="' + isMod + '"]').parent();
                $current.attr({ 'data-remark': newCache.remark, 'title': newCache.text });
                $current.find('span').text(newCache.remark + ' ' + newCache.text);
            }else{
                // 添加
                cacheList.push(newCache);
                let html = $(comHTML(newCache, cacheList.length - 1));
                $caches.prepend(html);
            }
            localStorage.setItem('_qrcodes_', JSON.stringify(cacheList));
            resetMod(-1);
        });
        // 清空
        $clean.click(function(){
            $remark.val('');
            $content.val('');
            $qrcode.addClass('init');
            resetMod(-1);
            localStorage.removeItem('_qrcode_temp_');
        });
        $caches.delegate('li', 'click', function(evt){
            resetMod(parseInt($(this).attr('data-index')));
            $remark.val($(this).attr('data-remark'));
            $content.val($(this).attr('title'));
            updateCode();
            evt.stopPropagation();
        });
        $caches.delegate('i.edit', 'click', function(evt){
            let index     = parseInt($(this).attr('data-index'), 10),
                cacheItem = cacheList[index];
            $remark.val(cacheItem.remark);
            $content.val(cacheItem.text);
            localStorage.setItem('_qrcodes_', JSON.stringify(cacheList));
            resetMod(index);
            evt.stopPropagation();
        });
        $caches.delegate('i.remove', 'click', function(evt){
            let index = parseInt($(this).attr('data-index'), 10);
            cacheList.splice(index, 1);
            localStorage.setItem('_qrcodes_', JSON.stringify(cacheList));
            $(this).parent().remove();
            resetMod(-1);
            renderCache();
            evt.stopPropagation();
        });

        function comHTML(item, index){
            return `<li data-index="${index}" data-remark="${item.remark}" title="${item.text}"><span>${item.remark} ${item.text}</span><i data-index="${index}" class="edit">E</i><i data-index="${index}" class="remove">X</i></li>`;
        }

        function find(item){
            let newCache = getNewCache();
            return item.remark === newCache.remark && item.text === newCache.text;
        }

        function resetMod(index){
            isMod = index;
            $save.text(isMod > -1 ? '更新' : '存储');
        }

    });

}).call(this);