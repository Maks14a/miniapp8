/*  Telegram Mini App bootstrap  */
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

/*  ---  НАСТРОЙКА  ----------------------------------------- *
 *  Мини-App живёт на Vercel:  https://miniapp8.vercel.app
 *  Отдаём API с того же домена через Serverless-route
 *  (создай на Vercel файл  /api/examples.js  → JSON из БД)
 *  Тогда CORS-проблем нет, и ссылка https://miniapp8.vercel.app/api/examples
 *  будет доступна всем пользователям.
 *  --------------------------------------------------------- */
const API_URL = "https://miniapp8.vercel.app/api/examples";   // ← ничего больше менять не надо

/*  Stories (статический контент)  */
const storiesContent = [
  { title: "Подключаем эквайринг",  description: "Быстрое подключение платежных систем …" },
  { title: "Расширенная статистика", description: "Детальная аналитика по всем аспектам …" },
  { title: "Индивидуальный код",     description: "Разработка уникальных решений …" },
  { title: "Лучший дизайн",          description: "Современный UI/UX дизайн для максимальной конверсии." },
  { title: "Мы просто крутые",       description: "Профессиональный подход, креативные решения …" }
];

/* ---------- helper-функции для fullscreen stories ---------- */
let gifPreviewTimeout, currentStoryIndex = null;

function showFullscreenStory(i){
  const s = storiesContent[i-1];
  const g = document.querySelector(`.story[data-index="${i}"] .story-gif`);
  document.getElementById("fullscreenGifImage").src = g.src;
  document.getElementById("modalTitle").textContent = s.title;
  document.getElementById("modalText").textContent  = s.description;
  document.getElementById("fullscreenGif").style.display = "flex";
  document.getElementById("storyModal").style.display    = "flex";
  currentStoryIndex = i;
}
const closeFullscreenStory = () =>{
  document.getElementById("fullscreenGif").style.display = "none";
  document.getElementById("storyModal").style.display    = "none";
  currentStoryIndex = null;
};
const startGifPreview = i => gifPreviewTimeout = setTimeout(()=>showFullscreenStory(i),300);
const endGifPreview   = () => clearTimeout(gifPreviewTimeout);
const showStory       = i =>{
  const el=document.querySelector(`.story[data-index="${i}"]`);
  el.style.transform="scale(0.95)";
  setTimeout(()=>{el.style.transform="scale(1)"; showFullscreenStory(i);},150);
};

/* ---------- кнопки “Оставить заявку / Поддержка” ---------- */
function showOrderForm(){
  setActiveTab("orderBtn");
  document.getElementById("loader").style.display="flex";
  setTimeout(()=>{document.getElementById("loader").style.display="none";
    alert("Заполните форму заявки — мы свяжемся с вами!");
  },800);
}
const openSupport = ()=>{ setActiveTab("supportBtn"); window.open("https://t.me/kodd_support","_blank"); };

/* ─────────   ПРИМЕРЫ РАБОТ   ───────── */
async function loadExamples(){
  const list = document.getElementById("portfolioList");
  list.innerHTML = "";
  try{
    const resp = await fetch(API_URL);
    const data = await resp.json();                       // [{bot_link, description}]
    data.forEach(ex=>{
      list.insertAdjacentHTML("beforeend",
        `<div class="portfolio-item">
           <img src="${ex.bot_link}" alt="preview">
           <div class="portfolio-name">${ex.description}</div>
         </div>`);
    });
    if(!data.length) list.textContent = "Пока пусто.";
  }catch(err){
    console.error("Ошибка /examples →", err);
    list.textContent = "Не удалось загрузить примеры.";
  }
}
function showPortfolio(){
  setActiveTab("portfolioBtn");
  document.querySelector(".stories-wrapper").style.display="none";
  document.getElementById("portfolioSection").style.display="block";
  document.getElementById("loader").style.display="flex";
  loadExamples().finally(()=>document.getElementById("loader").style.display="none");
}

/* ---------- визуальные вкладки ---------- */
function setActiveTab(id){
  document.querySelectorAll(".btn").forEach(b=>b.classList.remove("active"));
  const btn=document.getElementById(id); if(btn) btn.classList.add("active");
  if(id!=="portfolioBtn") document.getElementById("portfolioSection").style.display="none";
}
function setBottomActive(id){
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/* ---------- swipe навигация ---------- */
function setupSwipeNavigation(){
  const box=document.getElementById("fullscreenGif");
  let sx=0, ex=0;
  box.addEventListener("touchstart",e=>sx=e.changedTouches[0].screenX,{passive:true});
  box.addEventListener("touchend",e=>{
    if(!currentStoryIndex) return;
    ex=e.changedTouches[0].screenX;
    const d=sx-ex;
    if(Math.abs(d)>50){
      if(d>0 && currentStoryIndex<storiesContent.length) showFullscreenStory(currentStoryIndex+1);
      if(d<0 && currentStoryIndex>1) showFullscreenStory(currentStoryIndex-1);
    }
  },{passive:true});
}

/* ---------- предзагрузка иконок ---------- */
function preloadImages(){
  ["money","stats","code","design","cool"].forEach(x=>new Image().src=`Gifs/${x}.gif`);
}

/* ─────────  ЗАПУСК  ───────── */
document.addEventListener("DOMContentLoaded",()=>{
  /* истории */
  document.querySelectorAll(".story").forEach(st=>{
    const i=st.dataset.index;
    st.addEventListener("click",()=>showStory(i));
    st.addEventListener("mousedown",()=>startGifPreview(i));
    ["mouseup","mouseleave","touchend"].forEach(ev=>st.addEventListener(ev,endGifPreview));
    st.addEventListener("touchstart",()=>startGifPreview(i),{passive:true});
  });

  /* нижние вкладки */
  document.getElementById("navMain").addEventListener("click",()=>{
    setBottomActive("navMain");
    document.querySelector(".stories-wrapper").style.display="flex";
    document.getElementById("portfolioSection").style.display="none";
  });
  document.getElementById("navPortfolio").addEventListener("click",()=>{
    setBottomActive("navPortfolio");
    showPortfolio();
  });

  /* кнопки */
  document.getElementById("orderBtn").addEventListener("click",showOrderForm);
  document.getElementById("supportBtn").addEventListener("click",openSupport);
  document.getElementById("portfolioBtn").addEventListener("click",showPortfolio);

  document.querySelectorAll(".btn").forEach(b=>{
    b.addEventListener("mouseenter",()=>b.style.transform="translateY(-2px)");
    b.addEventListener("mouseleave",()=>b.style.transform="translateY(0)");
  });

  /* модалки */
  document.querySelector(".modal-close")      .addEventListener("click",closeFullscreenStory);
  document.querySelector(".close-fullscreen").addEventListener("click",closeFullscreenStory);
  document.getElementById("fullscreenGif").addEventListener("click",e=>{
    if(e.target===document.getElementById("fullscreenGif")) closeFullscreenStory();
  });
  document.getElementById("storyModal").addEventListener("click",e=>{
    if(e.target===document.getElementById("storyModal")) closeFullscreenStory();
  });

  setupSwipeNavigation();
  preloadImages();

  /* стартовый лоадер */
  document.getElementById("loader").style.display="flex";
  setTimeout(()=>document.getElementById("loader").style.display="none",800);
});
