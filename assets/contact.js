(() => {
  'use strict';
  const form = document.querySelector('#production-contact-form');
  if (!form) return;
  const renderedAt = Date.now();
  const review = form.querySelector('#form-review');
  const send = form.querySelector('.send-form');
  const edit = form.querySelector('.edit-form');
  const status = form.querySelector('.form-status');
  let sending = false;
  let confirmed = '';
  const values = () => {
    const data = new FormData(form);
    return Object.fromEntries(['name', 'email', 'company', 'subject', 'message', 'website'].map(key => [key, String(data.get(key) || '')]));
  };
  const query = new URLSearchParams(location.search);
  const hint = query.get('subject') || query.get('talent');
  if (hint) {
    const value = hint.slice(0, 200);
    form.elements.subject.add(new Option(value, value));
    form.elements.subject.value = value;
  }
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (sending || !form.reportValidity()) return;
    const data = values();
    confirmed = JSON.stringify(data);
    const labels = {name:'お名前', email:'メールアドレス', company:'会社名', subject:'ご相談の種類', message:'お問い合わせ内容'};
    const list = review.querySelector('dl');
    list.replaceChildren();
    Object.entries(labels).forEach(([key, label]) => {
      const dt = document.createElement('dt'), dd = document.createElement('dd');
      dt.textContent = label; dd.textContent = data[key] || '未入力'; list.append(dt, dd);
    });
    status.textContent = ''; review.hidden = false; review.focus();
  });
  edit.addEventListener('click', () => { if (!sending) {review.hidden = true; confirmed = ''; form.elements.name.focus();} });
  form.addEventListener('input', () => { if (!sending) {review.hidden = true; confirmed = '';} });
  send.addEventListener('click', async () => {
    if (sending || !form.reportValidity()) return;
    const data = values();
    if (JSON.stringify(data) !== confirmed) {review.hidden = true; return;}
    // Preserve the existing server's minimum-fill-time check without silently losing a fast submission.
    if (Date.now() - renderedAt < 4000) {status.textContent = '内容をご確認いただき、数秒後に送信してください。'; return;}
    sending = true; send.disabled = edit.disabled = true;
    status.textContent = '送信しています…';
    const controls = [...form.elements];
    const disabled = controls.map(el => el.disabled);
    controls.forEach(el => {el.disabled = true;});
    try {
      const response = await fetch(form.dataset.endpoint, {
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({...data, privacy:true, ts:renderedAt, site:form.dataset.site})
      });
      const result = await response.json();
      if (!response.ok || result.success !== true) throw new Error(result.message || '送信できませんでした。時間をおいて再度お試しください。');
      form.replaceChildren();
      const message = document.createElement('div'); message.className = 'form-review'; message.tabIndex = -1; message.setAttribute('role','status');
      const title = document.createElement('h2'); title.textContent = 'お問い合わせを受け付けました。';
      const text = document.createElement('p'); text.textContent = 'ありがとうございます。担当者より順次ご連絡いたします。';
      message.append(title,text); form.append(message); message.focus();
    } catch (error) {
      status.textContent = error instanceof TypeError ? '通信エラーが発生しました。接続をご確認のうえ、再度お試しください。' : error.message;
      controls.forEach((el,i) => {el.disabled = disabled[i];});
      send.disabled = edit.disabled = false;
      sending = false;
    }
  });
})();
