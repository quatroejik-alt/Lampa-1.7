(function() {
    'use strict';

    console.log('UA Kino Plugin v1.7 — виправлено Script error');

    const PLUGIN_NAME = 'UA Кіно';
    const PLUGIN_VERSION = '1.7';

    function startPlugin() {
        try {
            if (window.ua_kino_plugin) return;
            window.ua_kino_plugin = true;

            // Перевіряємо, чи є основні об'єкти LAMPA
            if (typeof Lampa === 'undefined') {
                console.log('❌ Lampa не знайдено');
                return;
            }

            Lampa.Component.add('ua_kino_main', uaKinoMain);

            Lampa.Listener.follow('app', function(e) {
                if (e.type === 'ready') {
                    addToMenu();
                    console.log('✅ Плагін v1.7 успішно запущено');
                }
            });

            addWatchOnlineButton();

        } catch (e) {
            console.log('❌ Помилка в плагіні:', e);
        }
    }

    function addToMenu() {
        try {
            Lampa.Catalog.add({
                title: PLUGIN_NAME,
                icon: '📺',
                onMore: function() {
                    Lampa.Activity.push({
                        component: 'ua_kino_main',
                        title: PLUGIN_NAME
                    });
                }
            });
        } catch (e) {}
    }

    function uaKinoMain(object) {
        let container = $('<div class="layer"></div>');
        
        let searchInput = $(`
            <input type="text" placeholder="Пошук фільмів, серіалів, аніме..." 
                   style="width:100%; padding:16px; margin:15px 0; border-radius:12px; font-size:17px;">
        `);

        let results = $('<div class="ua-results"></div>');

        searchInput.on('keydown', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                searchContent(this.value.trim());
            }
        });

        container.append(searchInput).append(results);
        object.activity.render(container);
    }

    function searchContent(query) {
        $('.ua-results').html('<div style="padding:60px;text-align:center;color:#fff;">🔍 Пошук...</div>');

        setTimeout(() => {
            let html = `
                <div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(160px, 1fr)); gap:20px; padding:15px;">
                    <div class="card ua-card" data-title="Інтерстеллар (UA)" 
                         data-poster="https://image.tmdb.org/t/p/w300/8GuvF8X1Z8Z2z2z2z2z2.jpg"
                         data-url="https://test-streams.mux.dev/x264_720p_1500kbs_30fps.mp4">
                        <img src="https://image.tmdb.org/t/p/w300/8GuvF8X1Z8Z2z2z2z2z2.jpg" style="width:100%;border-radius:10px;">
                        <div style="margin-top:10px;color:#fff;">Інтерстеллар</div>
                        <div style="color:#0f0;">Українська озвучка</div>
                    </div>
                </div>`;

            $('.ua-results').html(html);

            $('.ua-card').on('click', function() {
                Lampa.Activity.push({
                    component: 'full',
                    card: {
                        title: $(this).data('title'),
                        poster: $(this).data('poster'),
                        overview: 'Українська озвучка • Онлайн',
                        url: $(this).data('url')
                    }
                });
            });
        }, 500);
    }

    function addWatchOnlineButton() {
        setInterval(() => {
            try {
                const activity = Lampa.Activity.active();
                if (!activity || activity.name !== 'full') return;

                const card = activity.card;
                if (!card || !card.url) return;

                $('.full__button--watch-online').remove();

                const button = $(`
                    <div class="full__button full__button--watch-online" 
                         style="background:#e50914;color:#fff;font-size:18px;font-weight:bold;text-align:center;padding:18px 0;margin:12px 0;border-radius:8px;">
                        ▶ Дивитись онлайн
                    </div>
                `);

                button.on('click', function() {
                    Lampa.Player.play({
                        title: card.title || 'Фільм',
                        url: card.url
                    });
                });

                $('.full__buttons, .full-card__buttons, .activity__body').prepend(button);
            } catch (e) {}
        }, 1500);
    }

    // Автозапуск
    if (window.appready) startPlugin();
    else {
        Lampa.Listener.follow('app', function(e) {
            if (e.type === 'ready') startPlugin();
        });
    }

})();
