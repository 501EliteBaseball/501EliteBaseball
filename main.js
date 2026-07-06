function toggleMenu(){
  const menu=document.getElementById('mobileMenu');
  const btn=document.querySelector('.menu-toggle');
  if(!menu) return;
  const isOpen=menu.classList.toggle('open');
  if(btn) btn.setAttribute('aria-expanded', String(isOpen));
}
document.addEventListener('click', function(e){
  const menu=document.getElementById('mobileMenu');
  const btn=document.querySelector('.menu-toggle');
  if(!menu || !btn) return;
  if(menu.classList.contains('open') && !menu.contains(e.target) && !btn.contains(e.target)){
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded','false');
  }
});
