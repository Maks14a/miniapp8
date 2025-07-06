/*  Telegram Mini App bootstrap  */
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

/*  Stories (статический контент)  */
const storiesContent = [
  { title: "Подключаем эквайринг",
    description: "Быстрое подключение платежных систем …" },
  { title: "Расширенная статистика",
    description: "Детальная аналитика по всем аспектам …" },
  { title: "Индивидуальный код",
    description: "Разработка уникальных решений …" },
  { title: "Лучший дизайн",
    description: "Современный UI/UX дизайн для максимальной конверсии." },
  { title: "Мы просто крутые",
    description: "Профессиональный подход, креативные решения …" }
];

/*  Preview helpers  */
let gifPreviewTimeout;
let currentStoryIndex = null;

/*  Полноэкранный просмотр истории  */
function showFullscreenStory(index) {
  const story = storiesContent[index - 1];
  const gif   = document.querySelector(`.story[data-index="${index}"] .story-gif`);
  document.getElementById("fullscreenGifImage").src = gif.src;
  document.getElementById("modalTitle").textContent = story.title;
  document.getElementById("modalText").textContent  = story.description;
  document.getElementById("fullscreenGif").style.display = "flex";
  document.getElementById("storyModal").style.display    = "flex";
  currentStoryIndex = index;
}
function closeFullscreenStory() {
  document.getElementById("fullscreenGif").style.display = "none";
  document.getElementById("storyModal").style.display    = "none";
  currentStoryIndex = null;
}

function startGifPreview(i){gifPreviewTimeout=setTimeout(()=>showFullscreenStory(i),300);}
function endGifPreview(){clearTimeout(gifPreviewTimeout);}

function showStory(index){
  const s=document.querySelector(`.story[data-index="${index}"]`);
  s.style.transform="scale(0.95)";
  setTimeout(()=>{s.style.transform="scale(1)";showFullscreenStory(index);},150);
}

/*  Заявка / поддержка  */
function showOrderForm(){
  setActiveTab("orderBtn");
  document.getElementById("loader").style.display="flex";
  setTimeout(()=>{document.getElementById("loader").style.display="none";
    alert("Заполните форму заявки, с вами свяжутся в ближайшее время!");
  },800);
}
const openSupport = ()=>{ setActiveTab("supportBtn");
  window.open("https://t.me/kodd_support","_blank");
};

/* ─────────   ПРИМЕРЫ РАБОТ   ───────── */

/*  Загружаем из бекенда /examples  */
async function loadExamples() {
  const list = document.getElementById("portfolioList");
  list.innerHTML = "";

  try {
    const r = await fetch("http://127.0.0.1:8000/examples");
    const arr = await r.json();

    arr.forEach(ex => {
      const mediaTag = ex.gif_path.endsWith(".mp4")
        ? `<video class="portfolio-gif" src="http://127.0.0.1:8000/static/${ex.gif_path}" autoplay loop muted playsinline></video>`
        : `<img class="portfolio-gif" src="http://127.0.0.1:8000/static/${ex.gif_path}" alt="gif-preview">`;

      list.insertAdjacentHTML("beforeend", `
        <div class="portfolio-item">
          <div class="bot-info">
            <img class="avatar"
                 src="https://t.me/i/userpic/320/${ex.bot_name.replace('@', '')}.jpg"
                 onerror="this.src='Gifs/default-avatar.png'"
                 alt="bot-avatar">
            <a class="bot-name"
               href="https://t.me/${ex.bot_name.replace('@', '')}"
               target="_blank">${ex.bot_name}</a>
          </div>
          <div class="portfolio-description">${ex.description}</div>
          ${mediaTag}
        </div>
      `);
    });

    if (!arr.length) list.textContent = "Пока пусто.";
  } catch (e) {
    console.error("Не смог получить /examples →", e);
    list.textContent = "Ошибка загрузки примеров.";
  }
}


/*  Показать секцию портфолио  */
function showPortfolio(){
  setActiveTab("portfolioBtn");
  document.querySelector(".stories-wrapper").style.display="none";
  document.getElementById("portfolioSection").style.display="block";
  document.getElementById("loader").style.display="flex";
  loadExamples().finally(()=>{
    document.getElementById("loader").style.display="none";
  });
}

/*  Tab-highlight  */
function setActiveTab(id) {
  document.querySelectorAll(".btn").forEach(b => b.classList.remove("active"));
  const a = document.getElementById(id); if (a) a.classList.add("active");

  const isPortfolio = id === "portfolioBtn";

  document.querySelector(".button-container").style.display = isPortfolio ? "none" : "flex";
  document.getElementById("portfolioSection").style.display = isPortfolio ? "block" : "none";
  document.querySelector(".stories-wrapper").style.display = isPortfolio ? "none" : "flex";
}




function setBottomActive(id){
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

/*  Swipe (fullscreen)  */
function setupSwipeNavigation(){
  const box=document.getElementById("fullscreenGif");
  let sx=0, ex=0;
  box.addEventListener("touchstart",e=>{sx=e.changedTouches[0].screenX;},{passive:true});
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

/*  Предзагрузка иконок  */
function preloadImages(){
  ["money","stats","code","design","cool"].forEach(x=>{
    new Image().src=`Gifs/${x}.gif`;
  });
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
    setActiveTab("mainMenu");
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
  document.querySelector(".modal-close").addEventListener("click",closeFullscreenStory);
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
  setTimeout(()=>{document.getElementById("loader").style.display="none";},800);
});
