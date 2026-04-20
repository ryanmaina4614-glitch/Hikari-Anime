const BASE_URL = "https://api.jikan.moe/v4";
const state = { page:1, query:"", genre:"", loading:false };

function applyTheme(){
 document.body.dataset.theme = localStorage.getItem("theme")||"dark";
}

function toggleTheme(){
 const t = localStorage.getItem("theme")==="dark"?"light":"dark";
 localStorage.setItem("theme",t);
 applyTheme();
}

function getFavorites(){
 return JSON.parse(localStorage.getItem("favorites"))||[];
}

function toggleFavorite(anime){
 let fav=getFavorites();
 if(fav.find(f=>f.id===anime.mal_id)){
  fav=fav.filter(f=>f.id!==anime.mal_id);
 }else{
  fav.push({id:anime.mal_id,title:anime.title,image:anime.images.jpg.image_url});
 }
 localStorage.setItem("favorites",JSON.stringify(fav));
}

async function safeFetch(url){
 try{
  const r=await fetch(url);
  return await r.json();
 }catch{
  return {data:[]};
 }
}

async function fetchAnime(append=false){
 if(state.loading) return;
 state.loading=true;
 let url=`${BASE_URL}/anime?page=${state.page}`;
 if(state.query) url+=`&q=${state.query}`;
 if(state.genre) url+=`&genres=${state.genre}`;

 const data=await safeFetch(url);
 renderAnime(data.data,append);
 state.loading=false;
}

function renderAnime(list,append){
 const grid=document.getElementById("grid");
 if(!append) grid.innerHTML="";
 list.forEach(anime=>{
  const card=document.createElement("div");
  card.className="card";
  card.innerHTML=`
    <img src="${anime.images.jpg.image_url}">
    <h3>${anime.title}</h3>
    <button>❤️</button>
  `;
  card.querySelector("button").onclick=()=>toggleFavorite(anime);
  card.onclick=()=>openModal(anime.mal_id);
  grid.appendChild(card);
 });
}

async function openModal(id){
 const data=await safeFetch(`${BASE_URL}/anime/${id}`);
 const modal=document.getElementById("modal");
 modal.innerHTML=`<div class="card"><h2>${data.data.title}</h2><p>${data.data.synopsis}</p></div>`;
 modal.classList.add("show");
}

function init(){
 applyTheme();
 document.getElementById("themeBtn")?.addEventListener("click",toggleTheme);
 if(document.getElementById("grid")) fetchAnime();
}

init();
