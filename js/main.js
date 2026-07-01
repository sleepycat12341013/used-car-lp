/* main.js : 8ページ共通スクリプト（実写写真の在庫・自動入れ替え・フィルター・ページャ・フォーム） */

/* ===== TOP：最新入庫車（6台・専用写真） ===== */
const TOP_CARS = [
  { img:"topcar1.jpg", name:"スズキ　ハスラー",       type:"SUV",      year:2020, km:"3.0万km", price:135, isNew:true  },
  { img:"topcar2.jpg", name:"ダイハツ　ムーヴキャンバス",type:"軽自動車", year:2021, km:"2.4万km", price:118, isNew:true  },
  { img:"topcar3.jpg", name:"ダイハツ　ムーヴ",         type:"軽自動車", year:2019, km:"4.2万km", price:92,  isNew:false },
  { img:"topcar4.jpg", name:"スズキ　ワゴンR",        type:"軽自動車", year:2020, km:"3.5万km", price:98,  isNew:false },
  { img:"topcar5.jpg", name:"日産　デイズ",         type:"軽自動車", year:2021, km:"2.1万km", price:108, isNew:true  },
  { img:"topcar6.jpg", name:"スズキ　アルト",         type:"軽自動車", year:2018, km:"5.0万km", price:72,  isNew:false },
];

/* ===== 在庫一覧：14台・専用写真 ===== */
const LIST_CARS = [
  { img:"inv01.jpg", name:"ホンダ　N-BOX",   type:"軽自動車",   year:2021, km:"2.1万km", price:128, isNew:true  },
  { img:"inv02.jpg", name:"トヨタ　アクア",  type:"コンパクト", year:2019, km:"4.1万km", price:112, isNew:false },
  { img:"inv03.jpg", name:"日産　デイズ",  type:"軽自動車",   year:2020, km:"3.2万km", price:105, isNew:false },
  { img:"inv04.jpg", name:"日産　デイズ",  type:"軽自動車",   year:2021, km:"2.4万km", price:110, isNew:true  },
  { img:"inv05.jpg", name:"ホンダ　フリード",type:"ミニバン",   year:2020, km:"3.8万km", price:158, isNew:false },
  { img:"inv06.jpg", name:"スズキ　ソリオ",  type:"コンパクト", year:2019, km:"4.6万km", price:105, isNew:false },
  { img:"inv07.jpg", name:"スズキ　スペーシア",type:"軽自動車", year:2021, km:"1.9万km", price:118, isNew:true  },
  { img:"inv08.jpg", name:"ダイハツ　タント",  type:"軽自動車",   year:2019, km:"4.8万km", price:89,  isNew:false },
  { img:"inv09.jpg", name:"ダイハツ　ムーヴ",  type:"軽自動車",   year:2020, km:"3.2万km", price:92,  isNew:false },
  { img:"inv10.jpg", name:"スズキ　ワゴンR", type:"軽自動車",   year:2020, km:"3.5万km", price:98,  isNew:false },
  { img:"inv11.jpg", name:"トヨタ　アクア",  type:"コンパクト", year:2020, km:"3.0万km", price:119, isNew:false },
  { img:"inv12.jpg", name:"日産　デイズ",  type:"軽自動車",   year:2021, km:"2.0万km", price:112, isNew:true  },
  { img:"inv13.jpg", name:"トヨタ　シエンタ",type:"ミニバン",   year:2021, km:"2.6万km", price:168, isNew:true  },
  { img:"inv14.jpg", name:"スズキ　ワゴンR", type:"軽自動車",   year:2019, km:"5.5万km", price:78,  isNew:false },
];

function cardHTML(c){
  return `<article class="car-card">
    <div class="car-photo"><img src="img/${c.img}" alt="${c.name}" loading="lazy">
      ${c.isNew?'<span class="car-badge">NEW入庫</span>':''}
      <span class="car-type-tag">${c.type}</span></div>
    <div class="car-body">
      <div class="car-name">${c.name}</div>
      <div class="car-spec">${c.year}年・${c.km}</div>
      <div class="car-price">${c.price}<small>万円</small></div>
      <span class="btn btn-amber btn-sm btn-block">詳細を見る</span>
    </div></article>`;
}

/* ===== TOP：最新入庫車（6台を表示） ===== */
(function featured(){
  const grid = document.getElementById("carGrid");
  if (!grid) return;
  grid.innerHTML = TOP_CARS.map(cardHTML).join("");
})();

/* ===== 在庫一覧：フィルター＋ページャ＋自動入れ替え ===== */
(function listing(){
  const grid = document.getElementById("carGridFull");
  if (!grid) return;
  const PER = 12, MS = 6000;
  let type = "all", page = 0, timer = null, paused = false;
  const typeSel = document.getElementById("typeFilter");
  const priceSel = document.getElementById("priceFilter");
  const pager = document.getElementById("pager");
  const pauseBtn = document.getElementById("pauseBtnList");

  function filtered(){
    return LIST_CARS.filter(c=>{
      if (type!=="all" && c.type!==type) return false;
      if (priceSel){
        const p = priceSel.value;
        if (p==="-100" && !(c.price<100)) return false;
        if (p==="100-150" && !(c.price>=100 && c.price<150)) return false;
        if (p==="150-" && !(c.price>=150)) return false;
      }
      return true;
    });
  }
  function pages(list){ return Math.max(1, Math.ceil(list.length/PER)); }
  function render(){
    const list = filtered();
    const total = pages(list);
    if (page>=total) page=0;
    const view = list.slice(page*PER,(page+1)*PER);
    grid.innerHTML = view.map(cardHTML).join("") || '<p style="grid-column:1/-1;text-align:center;color:#6b7686">該当する在庫がありません</p>';
    if (pager){
      pager.innerHTML="";
      for(let i=0;i<total;i++){
        const b=document.createElement("button");
        b.textContent=i+1; if(i===page)b.classList.add("is-active");
        b.addEventListener("click",()=>{ page=i; render(); start();
          const anchor=document.querySelector(".filter-bar")||grid;
          window.scrollTo({top:anchor.getBoundingClientRect().top+window.pageYOffset-80,behavior:"smooth"}); });
        pager.appendChild(b);
      }
    }
  }
  function rotate(){
    const total = pages(filtered());
    if (total<=1) return;
    grid.classList.add("fading");
    setTimeout(()=>{ page=(page+1)%total; render(); grid.classList.remove("fading"); },400);
  }
  function start(){ clearInterval(timer); if(!paused) timer=setInterval(rotate,MS); }
  if (typeSel) typeSel.addEventListener("change",()=>{ type=typeSel.value; page=0; render(); start(); });
  if (priceSel) priceSel.addEventListener("change",()=>{ page=0; render(); start(); });
  if (pauseBtn) pauseBtn.addEventListener("click",()=>{ paused=!paused; pauseBtn.textContent=paused?"再開":"一時停止"; start(); });
  grid.addEventListener("mouseenter",()=>clearInterval(timer));
  grid.addEventListener("mouseleave",start);
  render(); start();
})();

/* ===== フォーム送信（デモ） ===== */
function submitForm(e, kind){
  e.preventDefault();
  alert(kind + "を受け付けました。\n（デモ表示です。実際の送信機能は後付けが必要です）");
  e.target.reset();
  return false;
}
