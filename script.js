
const scriptURL="https://script.google.com/macros/s/AKfycbzIYdl5_JLmo9krpk3vvkbLT7YJKvXi1hzPkUsHHB25BcBV7vlamivI1pLhst8_-zSHww/exec";

let kasPerMinggu=0;
let mingguBerjalan=0;

const rupiah=n=>'Rp '+Number(n||0).toLocaleString('id-ID');

let chart;

let namaLogin=localStorage.getItem("namaLogin");

// =======================
// LOADING
// =======================

function showLoading(){
document.getElementById("loadingOverlay").style.display="flex";
}

function hideLoading(){
document.getElementById("loadingOverlay").style.display="none";
}

// =======================
// LOGIN & LOGOUT
// =======================

function loginUser(){
const nama=document.getElementById("namaSelect").value;

if(!nama){
alert("Pilih nama terlebih dahulu");
return;
}

localStorage.setItem("namaLogin",nama);
location.reload();
}

function logout(){
showLogoutPopup();
}

// =======================
// POPUP
// =======================

function showKasPopup(){
document.getElementById("kasPopup").style.display="flex";
}

function closeKasPopup(){
document.getElementById("kasPopup").style.display="none";
}

function showWelcomePopup(){
document.getElementById("welcomePopup").style.display="flex";
}

function closeWelcomePopup(){
document.getElementById("welcomePopup").style.display="none";
}

// 🔥 FIX: HARUS DI LUAR loadData
function showLogoutPopup(){
document.getElementById("logoutPopup").style.display="flex";
}

function closeLogoutPopup(){
document.getElementById("logoutPopup").style.display="none";
}

// =======================
// LOAD DATA
// =======================

async function loadData(){

showLoading();

try{

const res = await fetch(scriptURL);

if(!res.ok){
throw new Error("Network error");
}

const data = await res.json();

console.log("DATA:", data);

// =======================
// CEK FORCE LOGOUT
// =======================

if(data.statusUser && namaLogin){

const status = data.statusUser[namaLogin];

if(status === "logout"){
alert("Anda telah logout oleh admin!");
localStorage.removeItem("namaLogin");
window.location.href = "index.html";
return;
}

}

// =======================
// LOAD SELECT NAMA
// =======================

const select=document.getElementById("namaSelect");

if(data.namaAnggota){

select.innerHTML='<option value="">Pilih Nama</option>';

data.namaAnggota.forEach(n=>{
select.innerHTML+=`<option value="${n}">${n}</option>`;
});

}

// =======================
// JIKA BELUM LOGIN
// =======================

if(!namaLogin){
hideLoading();
return;
}

document.getElementById("loginPage").style.display="none";

// =======================
// DATA USER
// =======================

kasPerMinggu=data.iuranMingguan || 0;
mingguBerjalan=data.mingguBerjalan || 0;

document.getElementById("namaUser").innerText=namaLogin;
document.getElementById("namaUserCard").innerText=namaLogin;

let totalDebit=0;
let totalKredit=0;
let totalBayar=0;

const tabelUser=document.getElementById("tabelUser");
tabelUser.innerHTML="";

data.dataKas.forEach(r=>{

const debit=Number(r.Debit||0);
const kredit=Number(r.Kredit||0);

totalDebit+=debit;
totalKredit+=kredit;

if(r.Nama && r.Nama.toLowerCase()==namaLogin.toLowerCase()){

totalBayar+=debit;

tabelUser.innerHTML+=`
<tr>
<td>${r.Tanggal}</td>
<td>${r.Keterangan}</td>
<td>${rupiah(debit)}</td>
<td>${rupiah(kredit)}</td>
</tr>
`;

}

});

// =======================
// HITUNG
// =======================

const totalWajib=kasPerMinggu*mingguBerjalan;

let utang=totalWajib-totalBayar;
if(utang<0) utang=0;

document.getElementById("saldoUser").innerText=rupiah(utang);

if(utang===0 && totalWajib>0){
document.querySelector(".atm-card").classList.add("lunas");
}

const progress=(totalBayar/totalWajib)*100;

document.getElementById("progressBar").style.width=progress+"%";

document.getElementById("progressText").innerText=
"Kas minggu ke-"+mingguBerjalan+" • Anda sudah membayar "+progress.toFixed(0)+"%";

// =======================
// CHART
// =======================

const ctx=document.getElementById("kasChart").getContext("2d");

if(chart) chart.destroy();

chart=new Chart(ctx,{
type:"doughnut",
data:{
labels:["Pemasukan","Pengeluaran"],
datasets:[{
data:[totalDebit,totalKredit]
}]
},
options:{plugins:{legend:{position:"bottom"}}}
});

// =======================
// RANKING
// =======================

const ranking={};

data.dataKas.forEach(r=>{
if(!ranking[r.Nama]) ranking[r.Nama]=0;
ranking[r.Nama]+=Number(r.Debit||0);
});

const rankingArr=Object.entries(ranking).sort((a,b)=>b[1]-a[1]);

const rankingTable=document.getElementById("rankingTable");

rankingTable.innerHTML="";

rankingArr.slice(0,5).forEach((r,i)=>{

rankingTable.innerHTML+=`
<tr>
<td>${i+1}</td>
<td>${r[0]}</td>
<td>${rupiah(r[1])}</td>
</tr>
`;

});

}
catch(e){
console.error(e);
alert("Gagal memuat data!");
}

hideLoading();

// popup welcome
if(namaLogin){
setTimeout(showWelcomePopup,700);
}

}

loadData();
