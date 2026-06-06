/* =============================================
   EUREKA 夏期講習 LP — script.js
   ============================================= */

/* ── 1. 動的コンテンツ注入 ──────────────────── */

/**
 * 強みセクション（#features）をHTML内に挿入する
 * ※ HTML側に <section id="features"> がないため、jsで生成して junior の前に挿入
 */
function injectFeaturesSection() {
  const features = [
    {
      icon: "🎯",
      title: "一人ひとりに合わせた個別指導",
      desc: "苦手な部分だけを集中的に。授業ペースはあなたに合わせて調整します。",
    },
    {
      icon: "📈",
      title: "「なぜ」から教える授業",
      desc: "公式の丸暗記ではなく、原理から理解するから定着率が違います。",
    },
    {
      icon: "🕖",
      title: "部活・学校行事と両立できる",
      desc: "夜19時〜のフレキシブルな時間帯。夏休みでも無理なく通えます。",
    },
  ];

  const html = `
<section id="features" class="section fadein">
  <div class="section-inner">
    <h2 class="section-title">おかげさまで10周年。ユリイカが選ばれる3つの理由</h2>
    <div class="features-grid">
      ${features
        .map(
          (f) => `
      <div class="feature-card">
        <div class="feature-icon">${f.icon}</div>
        <h3>${f.title}</h3>
        <p>${f.desc}</p>
      </div>`,
        )
        .join("")}
    </div>
  </div>
</section>`;

  const junior = document.getElementById("junior");
  if (junior) {
    junior.insertAdjacentHTML("beforebegin", html);
  }
}

/**
 * お問い合わせセクションに LINE ボタンと問い合わせフォームを注入
 */
function injectContactSection() {
  const contactInner = document.querySelector("#contact .section-inner");
  if (!contactInner) return;

  contactInner.innerHTML = `
    <h2 class="section-title">お問い合わせ・無料体験のご予約</h2>
    <p class="text">
      体験授業・ご相談のみのお問い合わせも大歓迎です。<br>
      LINEまたはお問い合わせフォームから、お気軽にどうぞ。
    </p>
    <div class="contact-buttons">
      <a href="https://lin.ee/XXXXXXX" target="_blank" rel="noopener" class="btn-line">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
        </svg>
        LINE から
      </a>
      <a href="mailto:nishiyori.juku@gmail.com?subject=【夏期講習】お問い合わせ" class="btn btn-primary">
        フォームから
      </a>
    </div>`;
}

/**
 * フローティングCTA（スマホ下部固定ボタン）を注入
 */
function injectFloatingCTA() {
  const cta = document.createElement("div");
  cta.className = "floating-cta";
  cta.innerHTML = `<a href="#contact" class="btn btn-primary">📩 無料体験・お問い合わせはこちら</a>`;
  document.body.appendChild(cta);
}

/* ── 2. カウントダウンタイマー ─────────────── */

/**
 * 夏期講習の申込締切（例：7月18日）までのカウントダウン
 * 日付は実際の締切日に変更してください
 */
function initCountdown() {
  const DEADLINE = new Date("2026-07-18T00:00:00+09:00");

  const wrap = document.createElement("div");
  wrap.className = "countdown-wrap";
  wrap.innerHTML = `
    <div class="countdown-label">📅 お申し込み締め切りまで</div>
    <div class="countdown-digits">
      <div class="cd-block"><span class="cd-num" id="cd-d">--</span><span class="cd-unit">日</span></div>
      <span class="cd-sep">:</span>
      <div class="cd-block"><span class="cd-num" id="cd-h">--</span><span class="cd-unit">時間</span></div>
      <span class="cd-sep">:</span>
      <div class="cd-block"><span class="cd-num" id="cd-m">--</span><span class="cd-unit">分</span></div>
      <span class="cd-sep">:</span>
      <div class="cd-block"><span class="cd-num" id="cd-s">--</span><span class="cd-unit">秒</span></div>
    </div>`;

  const fvInner = document.querySelector(".fv-inner");
  if (fvInner) fvInner.appendChild(wrap);

  function tick() {
    const now = new Date();
    const diff = DEADLINE - now;
    if (diff <= 0) {
      wrap.querySelector(".countdown-label").textContent = "受付終了しました";
      wrap.querySelector(".countdown-digits").remove();
      return;
    }
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    document.getElementById("cd-d").textContent = String(d).padStart(2, "0");
    document.getElementById("cd-h").textContent = String(h).padStart(2, "0");
    document.getElementById("cd-m").textContent = String(m).padStart(2, "0");
    document.getElementById("cd-s").textContent = String(s).padStart(2, "0");
  }

  tick();
  setInterval(tick, 1000);
}

/* ── 3. スクロール fadein ─────────────────── */

function initFadein() {
  const targets = document.querySelectorAll(".fadein");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    targets.forEach((el) => io.observe(el));
  } else {
    // フォールバック：全て表示
    targets.forEach((el) => el.classList.add("visible"));
  }
}

/* ── 4. スムーズスクロール（href="#..." のリンク） ── */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const offset = 16; // 上余白
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
}

/* ── 5. フローティングCTA の表示制御 ── */

function initFloatingCTAVisibility() {
  const cta = document.querySelector(".floating-cta");
  if (!cta) return;

  const fv = document.getElementById("fv");

  function update() {
    if (!fv) return;
    const bottom = fv.getBoundingClientRect().bottom;
    // ファーストビューを過ぎたら表示
    if (bottom < 0) {
      cta.style.transform = "translateY(0)";
      cta.style.opacity = "1";
    } else {
      cta.style.transform = "translateY(100%)";
      cta.style.opacity = "0";
    }
  }

  // 初期状態：非表示
  cta.style.transition = "transform .3s, opacity .3s";
  cta.style.transform = "translateY(100%)";
  cta.style.opacity = "0";

  window.addEventListener("scroll", update, { passive: true });
  update();
}

/* ── 起動 ── */
document.addEventListener("DOMContentLoaded", () => {
  injectFeaturesSection();
  injectContactSection();
  injectFloatingCTA();
  initCountdown();
  initFadein();
  initSmoothScroll();
  initFloatingCTAVisibility();
});
