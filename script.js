/* Telegram Mini-App bootstrap */
const tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

/* Демо-stories (статический контент) */
const storiesContent = [
  { title: "Подключаем эквайринг",   description: "Быстрое подключение платёжных систем…" },
  { title: "Расширенная статистика", description: "Детальная аналитика по всем аспектам…" },
  { title: "Индивидуальный код",     description: "Разработка уникальных решений…" },
  { title: "Лучший дизайн",          description: "Современный UI/UX для максимальной конверсии" },
  { title: "Мы просто крутые",       description: "Профессиональный подход, креативные решения" }
];

/* ───────────── HELPERS ───────────── */
let gifPreviewTimeout, currentStoryIndex = null;

/* Полноэкранный просмотр story */
function showFullscreenStory(idx){
  const story = storiesContent[idx-1];
  const gif   = document.querySelector(`.story[data-index="${idx}"] .story-gif`);
  document.getElementById("fullscreenGifImage").src = gif.src;
  document.getElementById("modalTitle").textContent = story.title;
  document.getElementById("modalText" ).textContent = story.description;
  document.getElementById("fullscreenGif").style.display = "flex";
  document.getElementById("storyModal"  ).style.display = "flex";
  currentStoryIndex = idx;
}
function closeFullscreenStory(){
  document.getElementById("fullscreenGif").style.display = "none";
  document.getElementById("storyModal"  ).style.display = "none";
  currentStoryIndex = null;
}

/* Кнопки главного меню */
function showOrderForm(){
  document.getElementById("loader").style.display = "flex";
  setTimeout(()=>{ document.getElementById("loader").style.display = "none";
    alert("Форма заявки появится здесь 😉");
  },800);
}
const openSupport = ()=> window.open("https://t.me/kodd_support","_blank");

/* ───── Загрузка примеров ───── */
async function loadExamples(){
  const list = document.getElementById("portfolioList");
  list.innerHTML = "";
  try{
    const r = await fetch("http://127.0.0.1:8000/examples");
    const arr = await r.json();
    arr.forEach(ex=>{
      const media = ex.gif_path.endsWith(".mp4")
        ? `<video class="portfolio-gif" src="http://127.0.0.1:8000/static/${ex.gif_path}" autoplay loop muted playsinline></video>`
        : `<img   class="portfolio-gif" src="http://127.0.0.1:8000/static/${ex.gif_path}" alt="gif">`;
      list.insertAdjacentHTML("beforeend",`
        <div class="portfolio-item">
          <div class="bot-info">
            <img class="avatar" src="https://t.me/i/userpic/320/${ex.bot_name.replace('@','')}.jpg"
                 onerror="this.src='Gifs/default-avatar.png'" alt="avatar">
            <a class="bot-name" href="https://t.me/${ex.bot_name.replace('@','')}" target="_blank">${ex.bot_name}</a>
          </div>
          <div class="portfolio-description">${ex.description}</div>
          ${media}
        </div>`);
    });
    if(!arr.length) list.textContent = "Пока пусто.";
  }catch(e){
    console.error(e); list.textContent="Ошибка загрузки 🥲";
  }
}

/* ───── Личный кабинет ─────  */
async function openLk(){
  const tg_id = tg.initDataUnsafe?.user?.id?.toString();
  const tg_us = tg.initDataUnsafe?.user?.username || "без ника";

  if (!tg_id) {
    alert("Ошибка: не удалось определить ваш Telegram ID.");
    return;
  }

  document.getElementById("loader").style.display = "flex";
  const lkList   = document.getElementById("lkList");
  const portList = document.getElementById("portfolioList");
  lkList.innerHTML = ""; lkList.style.display = "flex";
  portList.style.display = "none";

  try {
    const r = await fetch(`http://127.0.0.1:8000/orders/${tg_id}`);
    const orders = await r.json();

    if (!orders.length) {
      lkList.textContent = "У вас пока нет заказов.";
    } else {
      const uname = tg_us.replace("@", "") || "unknown_user";
      const displayName = "@" + uname;

      orders.forEach(o => {
        lkList.insertAdjacentHTML("beforeend", `
          <div class="portfolio-item">
            <div class="bot-info">
              <img class="avatar" src="https://t.me/i/userpic/320/${uname}.jpg"
                   onerror="this.src='Gifs/default-avatar.png'" alt="avatar">
              <a class="bot-name" href="https://t.me/${uname}" target="_blank">${displayName}</a>
            </div>
            <div class="portfolio-description">
              <b>#${o.public_id}</b> | ${o.fio}<br>
              <b>Задача:</b> ${o.short_task}<br>
              <b>Статус:</b> ${o.status}<br>
              <b>Дедлайн:</b> ${o.deadline || "—"}
            </div>
          </div>
        `);
      });
    }

    document.querySelector(".stories-wrapper").style.display = "none";
    document.getElementById("portfolioSection").style.display = "block";
    document.getElementById("portfolioTitle").textContent = "Ваши заказы";
  } catch (e) {
    console.error(e);
    alert("Ошибка при получении заказов.");
  } finally {
    document.getElementById("loader").style.display = "none";
  }
}


/* ───── Служебные UI-функции ───── */
function setBottomActive(id){
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.id===id));
}
function toggleMainButtons(show){
  document.querySelector(".button-container").style.display = show?"flex":"none";
}

/* ───── Инициализация ───── */
document.addEventListener("DOMContentLoaded",()=>{
  // stories Behaviour
  document.querySelectorAll(".story").forEach(st=>{
    const i=st.dataset.index;
    st.addEventListener("click"     ,()=>showStory(i));
    st.addEventListener("mousedown" ,()=>gifPreviewTimeout=setTimeout(()=>showFullscreenStory(i),300));
    ["mouseup","mouseleave","touchend"].forEach(ev=>st.addEventListener(ev,()=>clearTimeout(gifPreviewTimeout)));
  });

  // нижнее меню
  document.getElementById("navMain").addEventListener("click",()=>{
    setBottomActive("navMain");
    toggleMainButtons(true);
    document.querySelector(".stories-wrapper").style.display="flex";
    document.getElementById("portfolioSection").style.display="none";
  });

  document.getElementById("navPortfolio").addEventListener("click",()=>{
    setBottomActive("navPortfolio");
    toggleMainButtons(false);
    document.querySelector(".stories-wrapper").style.display="none";
    document.getElementById("portfolioTitle").textContent="Примеры работ";
    document.getElementById("lkList").style.display="none";
    document.getElementById("portfolioList").style.display="flex";
    loadExamples();
    document.getElementById("portfolioSection").style.display="block";
  });

  document.getElementById("navDummy").addEventListener("click",()=>{
    setBottomActive("navDummy");
    toggleMainButtons(false);
    openLk();
  });

  // верхние кнопки
  document.getElementById("orderBtn").addEventListener("click",showOrderForm);
  document.getElementById("supportBtn").addEventListener("click",openSupport);

  /* preload icons */
  ["money","stats","code","design","cool"].forEach(x=>new Image().src=`Gifs/${x}.gif`);
});

/* простой свайп для сторис-fullscreen */
(function(){
  const box=document.getElementById("fullscreenGif");
  let sx=0,ex=0;
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
})();
