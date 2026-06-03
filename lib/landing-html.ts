export const landingHtml = `
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&family=Hanken+Grotesk:wght@400;500;600;700&display=swap');

    #sah{
      --paper:#f7f0e3; --paper2:#efe2cf; --ink:#322b25; --ink2:#7f7062;
      --terra:#c25c3e; --terra2:#a4472d; --pine:#2f6b5b; --pine-soft:#e4efe9;
      --honey:#d99a45; --card:#fffdf8; --line:#e9dcc5;
      font-family:'Hanken Grotesk',system-ui,sans-serif; color:var(--ink);
      background:var(--paper); line-height:1.6; -webkit-font-smoothing:antialiased;
      position:relative; overflow-x:hidden; text-align:center;
    }
    #sah *{margin:0;padding:0;box-sizing:border-box}
    #sah .wrap{max-width:1040px;margin:0 auto;padding:0 26px}
    #sah .narrow{max-width:680px;margin:0 auto}

    #sah .atmos{position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:0}
    #sah .glow{position:absolute;border-radius:50%;filter:blur(95px)}
    #sah .glow.a{width:640px;height:640px;background:#f7d6a6;opacity:.55;top:-250px;left:50%;transform:translateX(-50%)}
    #sah .glow.b{width:500px;height:500px;background:#eebfa9;opacity:.38;top:880px;right:-170px}

    #sah .nav{position:sticky;top:0;z-index:20;background:rgba(246,240,228,.82);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}
    #sah .navin{max-width:1040px;margin:0 auto;padding:12px 26px;display:flex;align-items:center;justify-content:space-between;gap:12px}
    #sah .brand{display:flex;align-items:center;gap:9px;font-family:'Cormorant Garamond',serif;font-weight:600;font-size:23px;letter-spacing:.3px}
    #sah .brand .seal{width:22px;height:22px;border-radius:50%;background:var(--terra);position:relative;box-shadow:0 0 0 4px rgba(194,92,62,.16)}
    #sah .brand .seal:after{content:"";position:absolute;inset:6px;border-radius:50%;background:var(--paper)}
    #sah .navcta{background:var(--terra);color:#fff;border:none;border-radius:11px;padding:11px 18px;font-family:inherit;font-weight:700;font-size:14.5px;cursor:pointer;white-space:nowrap;transition:.18s}
    #sah .navcta:hover{background:var(--terra2);transform:translateY(-1px)}
    #sah .navlinks{display:flex;align-items:center;gap:16px}
    #sah .navdemo{color:var(--ink2);font-weight:600;font-size:14.5px;text-decoration:none;transition:.16s;white-space:nowrap}
    #sah .navdemo:hover{color:var(--terra2)}
    #sah .demobtn{display:inline-flex;align-items:center;gap:8px;padding:13px 24px;border:1.5px solid var(--terra);color:var(--terra2);background:transparent;border-radius:13px;font-family:inherit;font-weight:700;font-size:15px;text-decoration:none;transition:.18s}
    #sah .demobtn:hover{background:var(--terra);color:#fff;transform:translateY(-2px)}
    #sah .demowrap{margin-top:18px}
    #sah .navtag{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:16px;color:var(--ink2)}

    #sah .hero{position:relative;z-index:2;padding:46px 0 16px}
    #sah .freebadge{display:inline-block;font-family:inherit;font-weight:700;font-size:13px;letter-spacing:.02em;color:var(--terra2);background:#fbe5d6;border:1px solid #f1cdb4;padding:7px 15px;border-radius:99px;margin-bottom:20px}
    #sah .eyebrow{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:20px;color:var(--terra2);margin-bottom:18px}
    #sah h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(42px,7vw,76px);line-height:1.02;letter-spacing:-.5px;max-width:15ch;margin:0 auto}
    #sah h1 em{font-style:italic;color:var(--terra2)}
    #sah .sub{font-size:clamp(17px,2vw,20px);color:var(--ink2);max-width:48ch;margin:24px auto 0}

    #sah .form{margin:34px auto 0;display:flex;gap:10px;flex-wrap:wrap;max-width:460px;justify-content:center}
    #sah .form input{flex:1 1 220px;min-width:0;padding:16px 18px;font-family:inherit;font-size:16px;text-align:left;
      border:1.5px solid var(--line);border-radius:14px;background:#fffdf9;color:var(--ink);outline:none;transition:.2s}
    #sah .form input:focus{border-color:var(--terra);box-shadow:0 0 0 4px rgba(194,92,62,.14)}
    #sah .form button{padding:16px 28px;font-family:inherit;font-weight:700;font-size:16px;cursor:pointer;
      background:var(--terra);color:#fff;border:none;border-radius:14px;transition:.18s;white-space:nowrap}
    #sah .form button:hover{background:var(--terra2);transform:translateY(-2px)}
    #sah .formnote{margin-top:13px;font-size:14px;color:var(--ink2)}
    #sah .ok{margin:28px auto 0;max-width:460px;background:#fffdf9;border:1.5px solid var(--line);border-left:4px solid var(--pine);
      border-radius:14px;padding:18px 20px;display:none;text-align:left}
    #sah .ok.show{display:block;animation:rise .5s ease both}
    #sah .ok h3{font-family:'Cormorant Garamond',serif;font-size:23px;font-weight:600;color:var(--pine);margin-bottom:3px}
    #sah .ok p{font-size:14.5px;color:var(--ink2)}

    /* product */
    #sah .show{position:relative;z-index:2;padding:44px 0 18px;display:flex;gap:36px;justify-content:center;align-items:flex-start;flex-wrap:wrap}
    #sah .cap{position:relative;z-index:2;font-family:'Cormorant Garamond',serif;font-style:italic;font-size:21px;color:var(--ink2);margin-top:8px}
    #sah .device{width:274px;background:#1e1a16;border-radius:44px;padding:9px;
      box-shadow:0 44px 90px -44px rgba(70,45,25,.5), inset 0 0 0 1.5px rgba(255,255,255,.06)}
    #sah .device.t1{transform:rotate(-2.5deg)}
    #sah .device.t2{transform:rotate(2.5deg)}
    #sah .screen{background:var(--paper);border-radius:36px;overflow:hidden;text-align:left;position:relative}
    #sah .notch{position:absolute;top:9px;left:50%;transform:translateX(-50%);width:78px;height:20px;background:#1e1a16;border-radius:0 0 14px 14px;z-index:5}

    /* status bar */
    #sah .sbar{display:flex;justify-content:space-between;align-items:center;padding:11px 18px 3px;font-size:11px;font-weight:700;color:var(--ink)}
    #sah .sbar .sic{display:flex;align-items:center;gap:5px;color:var(--ink)}

    /* app */
    #sah .app{font-size:12.5px}
    #sah .app .top{padding:9px 14px 12px;border-bottom:1px solid rgba(0,0,0,.05);display:flex;align-items:center;gap:9px;background:#fffdf8}
    #sah .ava{width:36px;height:36px;border-radius:50%;background:var(--pine-soft);color:var(--pine);display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}
    #sah .app .top .nm{font-weight:700;font-size:13.5px;line-height:1.25}
    #sah .app .top .loc{font-size:10.5px;color:#9b8d7e;white-space:nowrap}
    #sah .pill{margin-left:auto;font-size:10.5px;font-weight:700;padding:5px 9px;border-radius:99px;display:inline-flex;align-items:center;gap:4px;white-space:nowrap;flex-shrink:0}
    #sah .pill.safe{background:var(--pine-soft);color:var(--pine)}
    #sah .app .body{padding:13px 14px}
    #sah .lbl{font-size:9.5px;letter-spacing:.07em;text-transform:uppercase;color:#a99a89;font-weight:700;margin:3px 0 8px}
    #sah .attn{background:#fbedd2;border-radius:12px;padding:11px 12px;display:flex;gap:9px;align-items:center;margin-bottom:14px}
    #sah .attn .t{font-size:12px;font-weight:700;color:#9a6a1f;line-height:1.25}
    #sah .attn .s{font-size:10.5px;color:#b08544}
    #sah .row{display:flex;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid rgba(0,0,0,.045)}
    #sah .row:last-child{border-bottom:none}
    #sah .tile{width:34px;height:34px;border-radius:10px;background:#f1e8d8;color:#9a8a72;display:flex;align-items:center;justify-content:center;flex-shrink:0}
    #sah .row .t{font-size:12px;font-weight:700;line-height:1.25}
    #sah .row .s{font-size:10.5px;color:#9b8d7e}
    #sah .usd{font-size:.82em;font-weight:400;color:#b6a895}
    #sah .proof{width:34px;height:34px;border-radius:10px;background:var(--pine-soft);color:var(--pine);display:flex;align-items:center;justify-content:center;flex-shrink:0;margin-left:auto}
    #sah .chk{color:var(--pine);flex-shrink:0;margin-left:auto}
    #sah .bnav{display:flex;border-top:1px solid rgba(0,0,0,.06);background:#fffdf8;padding:7px 4px 9px}
    #sah .bn{flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;color:#b6a895;font-size:9px;font-weight:600}
    #sah .bn.on{color:var(--terra)}

    /* parent */
    #sah .papp{background:#fbf0df}
    #sah .papp .ph{padding:10px 18px 4px}
    #sah .papp .hi{font-family:'Cormorant Garamond',serif;font-size:14px;color:var(--terra2);font-style:italic}
    #sah .papp .pnm{font-family:'Cormorant Garamond',serif;font-size:30px;font-weight:600;line-height:1.1}
    #sah .pcard{margin:13px;background:#fff;border-radius:22px;padding:17px;border:1px solid #f1e3d0;box-shadow:0 12px 26px -20px rgba(120,80,40,.4)}
    #sah .pcard .who{display:flex;align-items:center;gap:11px;margin-bottom:12px}
    #sah .pcard .pa{width:42px;height:42px;border-radius:50%;background:#f6dcd3;color:var(--terra);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:16px}
    #sah .pcard .l1{font-size:16px;font-weight:700;display:flex;align-items:center;gap:6px}
    #sah .pcard .l2{font-size:13px;color:#9b8d7e}
    #sah .pcard .msg{font-size:15px;color:#5b5046;line-height:1.45;margin-bottom:14px}
    #sah .pbtn{width:100%;background:var(--pine);color:#fff;border-radius:15px;padding:14px;font-size:16px;font-weight:700;display:flex;align-items:center;justify-content:center;gap:8px;border:none}
    #sah .pbtn.dark{background:#2b231c}

    #sah .sec{position:relative;z-index:2;padding:88px 0}
    #sah .kick{font-family:'Cormorant Garamond',serif;font-style:italic;font-size:19px;color:var(--terra2);margin-bottom:13px}
    #sah h2{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:clamp(32px,4.6vw,48px);line-height:1.08;letter-spacing:-.4px;max-width:18ch;margin:0 auto}
    #sah .lead{font-size:18px;color:var(--ink2);max-width:50ch;margin:16px auto 0}

    #sah .cards{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;margin-top:46px;text-align:left}
    #sah .card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:26px 22px;transition:.22s}
    #sah .card:hover{transform:translateY(-5px);box-shadow:0 26px 48px -30px rgba(90,60,30,.4)}
    #sah .card .ic{width:46px;height:46px;border-radius:13px;background:var(--paper2);color:var(--terra2);display:flex;align-items:center;justify-content:center;margin-bottom:15px}
    #sah .card h4{font-family:'Cormorant Garamond',serif;font-size:23px;font-weight:600;margin-bottom:6px}
    #sah .card p{font-size:14.5px;color:var(--ink2)}

    #sah .magic{position:relative;z-index:2;background:var(--paper2);padding:80px 0}
    #sah .wa{max-width:360px;margin:34px auto 0;background:var(--card);border:1px solid var(--line);border-radius:20px;padding:22px;text-align:left}
    #sah .bubble{background:#dcf7c5;border-radius:14px 14px 14px 4px;padding:11px 14px;font-size:14.5px;display:inline-block;color:#33291f}
    #sah .arrow{display:flex;align-items:center;gap:7px;color:#a4988a;font-size:13px;margin:13px 2px;font-style:italic;font-family:'Cormorant Garamond',serif}
    #sah .entry{display:flex;align-items:center;gap:10px;background:var(--paper);border-radius:12px;padding:10px 12px}

    #sah .faq{max-width:680px;margin:42px auto 0;text-align:left}
    #sah details{border-bottom:1px solid var(--line)}
    #sah summary{list-style:none;cursor:pointer;padding:20px 2px;display:flex;align-items:center;justify-content:space-between;gap:14px;
      font-family:'Cormorant Garamond',serif;font-size:21px;font-weight:600;color:var(--ink)}
    #sah summary::-webkit-details-marker{display:none}
    #sah .plus{flex-shrink:0;width:24px;height:24px;border-radius:50%;border:1.5px solid var(--terra);color:var(--terra);
      display:flex;align-items:center;justify-content:center;font-size:18px;line-height:1;transition:transform .25s,background .2s}
    #sah details[open] .plus{transform:rotate(45deg);background:var(--terra);color:#fff}
    #sah details .ans{padding:0 2px 20px;font-size:15.5px;color:var(--ink2);max-width:60ch}

    #sah .final{position:relative;z-index:2;padding:92px 0 56px}
    #sah .foot{position:relative;z-index:2;border-top:1px solid var(--line);padding:26px;font-size:13.5px;color:var(--ink2)}

    @keyframes rise{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    #sah .rv{opacity:0;transform:translateY(20px);transition:opacity .7s ease,transform .7s ease}
    #sah .rv.in{opacity:1;transform:none}
    #sah .hero .rv{animation:rise .8s ease forwards;opacity:1;transform:none}
    #sah .d1{animation-delay:.05s}#sah .d2{animation-delay:.18s}#sah .d3{animation-delay:.32s}

    @media(max-width:760px){ #sah .cards{grid-template-columns:1fr} }
  </style>

  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <symbol id="i-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></symbol>
    <symbol id="i-checkc" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.5 2.5 4.5-5"/></symbol>
    <symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3 5 6v5c0 4.5 3 7.5 7 9 4-1.5 7-4.5 7-9V6z"/></symbol>
    <symbol id="i-msg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a3 3 0 0 1-3 3H8l-4 3V6a3 3 0 0 1 3-3h11a3 3 0 0 1 3 3z"/></symbol>
    <symbol id="i-receipt" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18l2-1 2 1 2-1 2 1 2-1 2 1V3l-2 1-2-1-2 1-2-1-2 1z"/><path d="M9 8h6M9 12h6"/></symbol>
    <symbol id="i-file" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></symbol>
    <symbol id="i-pill" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="6" rx="3" transform="rotate(45 12 12)"/></symbol>
    <symbol id="i-heart" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21s-7-4.5-9.5-9C.8 8.5 2 5 5.5 5 7.6 5 9 6.5 12 9c3-2.5 4.4-4 6.5-4C22 5 23.2 8.5 21.5 12 19 16.5 12 21 12 21z"/></symbol>
    <symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L20 13l1 4v2a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-1z"/></symbol>
    <symbol id="i-steth" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v6a4 4 0 0 0 8 0V3"/><path d="M9 13v3a5 5 0 0 0 10 0v-2"/><circle cx="19" cy="11" r="2"/></symbol>
    <symbol id="i-users" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3 3 0 0 1 0 5M16.5 20a6 6 0 0 0-3-5"/></symbol>
    <symbol id="i-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11 12 4l8 7"/><path d="M6 10v9h12v-9"/></symbol>
    <symbol id="i-list" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2"/><circle cx="4.5" cy="12" r="1.2"/><circle cx="4.5" cy="18" r="1.2"/></symbol>
    <symbol id="i-folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></symbol>
    <symbol id="i-signal" viewBox="0 0 20 14"><rect x="0" y="9" width="3" height="5" rx="1"/><rect x="5" y="6" width="3" height="8" rx="1"/><rect x="10" y="3" width="3" height="11" rx="1"/><rect x="15" y="0" width="3" height="14" rx="1"/></symbol>
    <symbol id="i-wifi" viewBox="0 0 18 14" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><path d="M1.5 5a11 11 0 0 1 15 0"/><path d="M4.5 8.3a7 7 0 0 1 9 0"/><circle cx="9" cy="11.6" r="1.1" fill="currentColor" stroke="none"/></symbol>
    <symbol id="i-batt" viewBox="0 0 26 14"><rect x="1" y="2.5" width="20" height="9" rx="2.5" fill="none" stroke="currentColor" stroke-width="1.3"/><rect x="3" y="4.5" width="14" height="5" rx="1" fill="currentColor"/><rect x="22.5" y="5" width="2" height="4" rx="1" fill="currentColor"/></symbol>
  </svg>

  <div class="atmos"><div class="glow a"></div><div class="glow b"></div></div>

  <nav class="nav"><div class="navin">
    <div class="brand"><span class="seal"></span> Paalan</div>
    <div class="navlinks">
      <a class="navdemo" href="/app" target="_blank" rel="noopener">Explore demo</a>
      <button class="navcta" id="navcta" type="button">Get early access</button>
    </div>
  </div></nav>

  <header class="wrap hero">
    <p class="freebadge rv d1">✦ Free for the first 10 families</p>
    <p class="eyebrow rv d1">For everyone whose parents are still back home</p>
    <h1 class="rv d2">They raised you. Now you're <em>an ocean away.</em></h1>
    <p class="sub rv d3">Know they're okay, even from an ocean away. The bills, the doctor, the day, you see it handled, and you breathe. They don't even need an app. They just text, like always.</p>
    <form class="form rv d3" id="f1" novalidate>
      <input type="email" name="email" placeholder="your email" aria-label="email" required>
      <button type="submit">Get early access</button>
    </form>
    <p class="formnote rv d3">Free for our first 10 families. No spam, just one note when we open up.</p>
    <div class="demowrap rv d3"><a class="demobtn" href="/app" target="_blank" rel="noopener">Explore the live demo →</a></div>
    <div class="ok" id="ok1"><h3>You're on the list.</h3><p>We'll reach out personally when early access opens. Thank you for trusting us with something this close to home.</p></div>
  </header>

  <!-- PRODUCT -->
  <div class="wrap show">
    <div class="device t1 rv d2">
      <div class="screen"><div class="notch"></div>
        <div class="sbar"><span>9:41</span><span class="sic"><svg width="17" height="12"><use href="#i-signal"/></svg><svg width="16" height="12"><use href="#i-wifi"/></svg><svg width="23" height="12"><use href="#i-batt"/></svg></span></div>
        <div class="app">
          <div class="top"><div class="ava">M</div><div><div class="nm">Mummy</div><div class="loc">New Delhi · 12h ahead</div></div><span class="pill safe"><svg width="12" height="12"><use href="#i-shield"/></svg> All safe</span></div>
          <div class="body">
            <div class="lbl">Needs you</div>
            <div class="attn"><svg width="17" height="17" style="color:#c2922f;flex-shrink:0"><use href="#i-shield"/></svg><div><div class="t">Insurance lapses in 4 days</div><div class="s">₹18,400 <span class="usd">(~$220)</span> · Star Health</div></div></div>
            <div class="lbl">Recently handled · with proof</div>
            <div class="row"><div class="tile"><svg width="16" height="16"><use href="#i-receipt"/></svg></div><div><div class="t">Electricity bill paid</div><div class="s">₹1,240 <span class="usd">(~$15)</span> · 2h ago</div></div><div class="proof"><svg width="15" height="15"><use href="#i-receipt"/></svg></div></div>
            <div class="row"><div class="tile"><svg width="16" height="16"><use href="#i-steth"/></svg></div><div><div class="t">Cardiologist visit</div><div class="s">BP stable · report</div></div><div class="proof"><svg width="15" height="15"><use href="#i-file"/></svg></div></div>
            <div class="row"><div class="tile"><svg width="16" height="16"><use href="#i-pill"/></svg></div><div><div class="t">Monthly medicines</div><div class="s">₹3,260 <span class="usd">(~$40)</span> · delivered</div></div><svg class="chk" width="17" height="17"><use href="#i-checkc"/></svg></div>
          </div>
          <div class="bnav">
            <div class="bn on"><svg width="18" height="18"><use href="#i-home"/></svg><span>Home</span></div>
            <div class="bn"><svg width="18" height="18"><use href="#i-list"/></svg><span>Tasks</span></div>
            <div class="bn"><svg width="18" height="18"><use href="#i-folder"/></svg><span>Docs</span></div>
            <div class="bn"><svg width="18" height="18"><use href="#i-users"/></svg><span>Family</span></div>
          </div>
        </div>
      </div>
    </div>

    <div class="device t2 rv d3">
      <div class="screen"><div class="notch"></div>
        <div class="sbar"><span>9:41</span><span class="sic"><svg width="17" height="12"><use href="#i-signal"/></svg><svg width="16" height="12"><use href="#i-wifi"/></svg><svg width="23" height="12"><use href="#i-batt"/></svg></span></div>
        <div class="app papp">
          <div class="ph"><div class="hi">Good morning,</div><div class="pnm">Mummy</div></div>
          <div class="pcard">
            <div class="who"><div class="pa">P</div><div><div class="l1">Priya <svg width="14" height="14" style="color:var(--terra)"><use href="#i-heart"/></svg></div><div class="l2">is thinking of you</div></div></div>
            <div class="msg">"Miss you Mumma. Call me when you wake up!"</div>
            <button class="pbtn"><svg width="18" height="18"><use href="#i-phone"/></svg> Call Priya</button>
          </div>
          <div class="pcard" style="margin-top:0">
            <div class="who" style="margin-bottom:13px"><div class="pa"><svg width="19" height="19"><use href="#i-pill"/></svg></div><div class="l1" style="font-size:15.5px">Take morning medicines</div></div>
            <button class="pbtn dark"><svg width="17" height="17"><use href="#i-check"/></svg> I took them</button>
          </div>
        </div>
      </div>
    </div>
  </div>
  <p class="cap rv">One clear view for you. Something gentle for them.</p>
  <div class="demowrap rv" style="text-align:center"><a class="demobtn" href="/app" target="_blank" rel="noopener">Explore the live demo →</a></div>

  <!-- VALUE -->
  <section class="sec"><div class="wrap">
    <p class="kick rv">The difference</p>
    <h2 class="rv">Not promises it's handled. Proof that it is.</h2>
    <div class="cards">
      <div class="card rv d1"><div class="ic"><svg width="22" height="22"><use href="#i-receipt"/></svg></div><h4>See the proof</h4><p>Every task closes with a receipt, photo, or confirmation. So the worry actually goes quiet.</p></div>
      <div class="card rv d2"><div class="ic"><svg width="22" height="22"><use href="#i-msg"/></svg></div><h4>They just text</h4><p>Your parents and their helper keep using WhatsApp. Their messages quietly become records you can see.</p></div>
      <div class="card rv d3"><div class="ic"><svg width="22" height="22"><use href="#i-shield"/></svg></div><h4>Nothing slips</h4><p>An insurance lapse, an odd transaction, a missed refill. Surfaced before it becomes a crisis.</p></div>
    </div>
  </div></section>

  <!-- MAGIC -->
  <section class="magic"><div class="wrap">
    <p class="kick rv">The simple part</p>
    <h2 class="rv">They text. It just works.</h2>
    <div class="wa rv">
      <span class="bubble">Paid Ramesh ₹2,500 <span class="usd">(~$30)</span> today 🙏</span>
      <div class="arrow">becomes a verified entry ↓</div>
      <div class="entry"><div class="tile" style="background:#fbedd2;color:#9a6a1f"><svg width="16" height="16"><use href="#i-users"/></svg></div><div><div class="t" style="font-size:12px;font-weight:700">House helper paid · ₹2,500 <span class="usd">(~$30)</span></div><div class="s" style="font-size:10.5px;color:#9b8d7e">via WhatsApp · verified</div></div><svg class="chk" width="16" height="16"><use href="#i-checkc"/></svg></div>
    </div>
  </div></section>

  <!-- FAQ -->
  <section class="sec"><div class="wrap">
    <p class="kick rv">Honest answers</p>
    <h2 class="rv">The things you're rightly wondering.</h2>
    <div class="faq rv">
      <details><summary>Do my parents have to learn a new app?<span class="plus">+</span></summary><p class="ans">No, that's the whole point. They keep using WhatsApp exactly as they do now. The app is for you.</p></details>
      <details><summary>Do you ever touch our money?<span class="plus">+</span></summary><p class="ans">Never. We don't hold or move funds. Payments stay on your family's own bank and billers. We simply show you it was done, with proof.</p></details>
      <details><summary>Is our private information safe?<span class="plus">+</span></summary><p class="ans">Yes. Everything is encrypted and access controlled, and you decide who sees what. Medical documents are stored and organized only, never interpreted or shared without your consent.</p></details>
      <details><summary>Which countries does this work for?<span class="plus">+</span></summary><p class="ans">We're starting with families whose parents are in India, and building Paalan to serve every immigrant community after that.</p></details>
      <details><summary>What will it cost?<span class="plus">+</span></summary><p class="ans">Our first 10 families get Paalan completely free. After that, pricing will sit well below full eldercare memberships. Join the list to claim a free spot.</p></details>
    </div>
  </div></section>

  <!-- FINAL -->
  <section class="final"><div class="wrap">
    <p class="kick rv">Early access</p>
    <h2 class="rv">Be the first to stop worrying.</h2>
    <form class="form rv" id="f2" novalidate>
      <input type="email" name="email" placeholder="your email" aria-label="email" required>
      <button type="submit">Join the list</button>
    </form>
    <p class="formnote rv">The first 10 families get Paalan free. Limited early spots.</p>
    <div class="ok" id="ok2" style="margin-left:auto;margin-right:auto"><h3>You're on the list.</h3><p>We'll be in touch personally when we open up.</p></div>
  </section>

  <footer class="foot">Paalan — care, across the distance</footer>
`;
