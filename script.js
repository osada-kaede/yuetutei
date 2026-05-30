document.addEventListener("DOMContentLoaded", () => {
    // GSAPにScrollTriggerプラグインを登録
    gsap.registerPlugin(ScrollTrigger);

    /* ==========================================================================
       1. Lenis スムーズスクロール（重みのある慣性挙動）
       ========================================================================== */
    const lenis = new Lenis({
        duration: 1.5,           // スクロールの余韻（長いほど重みが出る）
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // スムースな慣性イージング
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothWaveform: true,
    });

    // LenisとGSAPのScrollTriggerを同期させる
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);


    /* ==========================================================================
       2. グローバルナビゲーション（沈降度インジケーター）の連動
       ========================================================================== */
    const indicatorProgress = document.querySelector('.indicator-progress');
    
    // ページ全体のスクロール進行度に応じてインジケーターの縦線を上から下へ伸ばす
    gsap.to(indicatorProgress, {
        height: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: "body",
            start: "top top",
            end: "bottom bottom",
            scrub: true
        }
    });

    // 各メモリ（ボタン）をクリックしたときに、Lenisの機能でヌルりと滑らかに高速スクロール
    const markers = document.querySelectorAll('.marker');
    markers.forEach(marker => {
        marker.addEventListener('click', () => {
            const targetId = marker.getAttribute('data-target');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                lenis.scrollTo(targetSection, {
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        });
    });


    /* ==========================================================================
       3. Experienceセクション：背景色カラーコード変容演出（戻り時のリセット完全版）
       ========================================================================== */
    const expTriggers = document.querySelectorAll('.experience-trigger');
    const defaultColor = "#0b0b0c"; // 初期設定の深淵・墨色

    expTriggers.forEach((trigger) => {
        const targetColor = trigger.getAttribute('data-color');

        ScrollTrigger.create({
            trigger: trigger,
            start: "top 50%",  // 各相の解説テキスト領域がブラウザの真ん中（50%）を通過する瞬間
            end: "bottom 50%",
            // 下へスクロールして進入した瞬間に、対象のカラーへパワー2アウトで滑らか変化
            onEnter: () => {
                gsap.to("body", {
                    backgroundColor: targetColor,
                    duration: 0.8,
                    ease: "power2.out"
                });
            },
            // 上へスクロールして戻ってきた時も、その相の色を再適用
            onEnterBack: () => {
                gsap.to("body", {
                    backgroundColor: targetColor,
                    duration: 0.8,
                    ease: "power2.out"
                });
            }
        });
    });

    // 【追加・超重要】Heroセクション、Conceptセクションに戻ったら確実に「完全な闇」へリセットするトリガー
    const resetSections = ["#hero", "#concept"];
    resetSections.forEach((id) => {
        ScrollTrigger.create({
            trigger: id,
            start: "top top",
            end: "bottom top",
            // 上にスクロールして戻ってきたとき、またはクリックでジャンプして戻ってきたとき
            onEnterBack: () => {
                gsap.to("body", {
                    backgroundColor: defaultColor,
                    duration: 0.8,
                    ease: "power2.out"
                });
            },
            // 一番上（起点）にいる状態のときも確実に墨色をキープ
            onToggle: (self) => {
                if (self.isActive) {
                    gsap.to("body", {
                        backgroundColor: defaultColor,
                        duration: 0.8,
                        ease: "power2.out"
                    });
                }
            }
        });
    });

    // Experienceセクション領域を完全に下へ抜け出したら、自動で元の完全な闇（墨色）へ戻す安全装置
    ScrollTrigger.create({
        trigger: "#experience",
        start: "top bottom",
        end: "bottom top",
        onLeave: () => {
            gsap.to("body", { backgroundColor: defaultColor, duration: 0.8, ease: "power2.out" });
        },
        onLeaveBack: () => {
            // 上に戻る時はresetSections側でも制御するため、ここでも墨色を担保
            gsap.to("body", { backgroundColor: defaultColor, duration: 0.8, ease: "power2.out" });
        }
    });

    /* ==========================================================================
       4. Philosophyセクション：スマートフォン版全画面没入フェード演出（重ね崩れ対策済）
       ========================================================================== */
    const philosophySection = document.querySelector('.section-philosophy');
    const philosophyWrapper = document.querySelector('.philosophy-text-wrapper');
    const lines = document.querySelectorAll('.philosophy-line, .philosophy-line-author');

    // 画面幅がスマホサイズ（768px以下）の場合のみ、1行ずつのフェード切り替え演出を発火
    // if (window.innerWidth <= 768) {
    //     // スマホ用演出スタイル（絶対配置・画面中央への重ね合わせ）を有効化
    //     philosophyWrapper.classList.add('philosophy-sp-active');

    //     // セクションを画面に固定（pin）し、スクロール量と完全に同期させるタイムラインを作成
    //     const tl = gsap.timeline({
    //         scrollTrigger: {
    //             trigger: philosophySection,
    //             start: "top top",
    //             end: "+=1800", // 【修正】2200から1800へ少し短縮。スクロールの引っ張りを最適化し、見切れバグを防止
    //             pin: true,     
    //             scrub: true,   
    //             anticipatePin: 1
    //         }
    //     });

    //     // 1行ずつ静かにフェードインして、次のメッセージが重なる前にフェードアウトさせる
    //     lines.forEach((line, index) => {
    //         // フェードインして出現
    //         tl.to(line, {
    //             opacity: 1,
    //             visibility: "visible",
    //             duration: 1,
    //             ease: "power1.inOut"
    //         })
    //         // 読ませるための表示維持（ホールド時間）
    //         .to(line, {
    //             opacity: 1,
    //             duration: 1.5
    //         });
            
    //         // 最後の行（店主 大岩）以外は、次の行を出す前に完全に見えなくする（文字被り排除）
    //         if (index < lines.length - 1) {
    //             tl.to(line, {
    //                 opacity: 0,
    //                 visibility: "hidden",
    //                 duration: 1,
    //                 ease: "power1.inOut"
    //             });
    //         }
    //     });
    // }

    // 画面サイズが途中で変わった際のScrollTrigger位置バグを防ぐリフレッシュ処理
    window.addEventListener('resize', () => {
        ScrollTrigger.refresh();
    });
});