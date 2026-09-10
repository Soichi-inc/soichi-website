(() => {
 const tabs=[...document.querySelectorAll('[data-news-tab]')];
 function select(tab){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});}
 tabs.forEach((tab,i)=>{tab.addEventListener('click',()=>select(tab));tab.addEventListener('keydown',e=>{let j;if(e.key==='ArrowRight')j=(i+1)%tabs.length;else if(e.key==='ArrowLeft')j=(i+tabs.length-1)%tabs.length;else if(e.key==='Home')j=0;else if(e.key==='End')j=tabs.length-1;else return;e.preventDefault();select(tabs[j]);tabs[j].focus();});});
 if(new URLSearchParams(location.search).get('service')==='ai-advisory'){const select=document.querySelector('select[name=subject]');if(select){const option=new Option('AI Advisory・無料相談','AI Advisory・無料相談');select.add(option);select.value=option.value;}}
})();
